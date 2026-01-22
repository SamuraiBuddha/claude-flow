"use strict";
/**
 * MCP Integration Wrapper for Swarm System
 *
 * This module provides a comprehensive wrapper around MCP tools to enable
 * seamless integration with the swarm orchestration system. It handles
 * tool discovery, execution, error handling, and result aggregation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPIntegrationWrapper = void 0;
const node_events_1 = require("node:events");
const logger_js_1 = require("../core/logger.js");
const helpers_js_1 = require("../utils/helpers.js");
const claude_flow_tools_js_1 = require("../mcp/claude-flow-tools.js");
const ruv_swarm_tools_js_1 = require("../mcp/ruv-swarm-tools.js");
class MCPIntegrationWrapper extends node_events_1.EventEmitter {
    logger;
    config;
    toolRegistry;
    executionCache = new Map();
    activeExecutions = new Map();
    metrics;
    constructor(config = {}) {
        super();
        this.logger = new logger_js_1.Logger('MCPIntegrationWrapper');
        this.config = this.createDefaultConfig(config);
        this.toolRegistry = this.initializeToolRegistry();
        this.metrics = this.initializeMetrics();
        this.setupEventHandlers();
    }
    /**
     * Initialize the MCP integration wrapper
     */
    async initialize() {
        this.logger.info('Initializing MCP integration wrapper...');
        try {
            // Register Claude Flow tools
            if (this.config.enableClaudeFlowTools) {
                await this.registerClaudeFlowTools();
            }
            // Register ruv-swarm tools
            if (this.config.enableRuvSwarmTools) {
                await this.registerRuvSwarmTools();
            }
            // Start cache cleanup if enabled
            if (this.config.enableCaching) {
                this.startCacheCleanup();
            }
            this.logger.info('MCP integration wrapper initialized successfully', {
                totalTools: this.toolRegistry.tools.size,
                categories: this.toolRegistry.categories.size,
                capabilities: this.toolRegistry.capabilities.size,
            });
            this.emit('initialized', {
                toolCount: this.toolRegistry.tools.size,
                config: this.config,
            });
        }
        catch (error) {
            this.logger.error('Failed to initialize MCP integration wrapper', error);
            throw error;
        }
    }
    /**
     * Shutdown the wrapper gracefully
     */
    async shutdown() {
        this.logger.info('Shutting down MCP integration wrapper...');
        try {
            // Cancel all active executions
            for (const [executionId, controller] of this.activeExecutions) {
                controller.abort();
                this.logger.debug('Cancelled execution', { executionId });
            }
            this.activeExecutions.clear();
            // Clear cache if needed
            this.executionCache.clear();
            this.logger.info('MCP integration wrapper shut down successfully');
            this.emit('shutdown');
        }
        catch (error) {
            this.logger.error('Error during MCP wrapper shutdown', error);
            throw error;
        }
    }
    /**
     * Execute an MCP tool within a swarm context
     */
    async executeTool(toolName, input, context) {
        const executionId = (0, helpers_js_1.generateId)('mcp-execution');
        const startTime = performance.now();
        this.logger.info('Executing MCP tool', {
            toolName,
            executionId,
            agentId: context.agent.id,
            taskId: context.task?.id,
            swarmId: context.swarmId,
        });
        try {
            // Check if tool exists
            const tool = this.toolRegistry.tools.get(toolName);
            if (!tool) {
                throw new Error(`Tool not found: ${toolName}`);
            }
            // Check cache if enabled
            if (this.config.enableCaching) {
                const cached = await this.getCachedResult(toolName, input, context);
                if (cached) {
                    this.logger.debug('Using cached result', { toolName, executionId });
                    return cached;
                }
            }
            // Create abort controller for timeout
            const abortController = new AbortController();
            this.activeExecutions.set(executionId, abortController);
            // Set up timeout
            const timeoutHandle = setTimeout(() => {
                abortController.abort();
            }, context.timeout || this.config.toolTimeout);
            try {
                // Execute tool with retry logic
                const result = await this.executeWithRetry(tool, input, context, executionId, abortController.signal);
                clearTimeout(timeoutHandle);
                const duration = performance.now() - startTime;
                const executionResult = {
                    success: true,
                    result,
                    duration,
                    toolName,
                    agentId: context.agent.id,
                    taskId: context.task?.id,
                    metadata: {
                        timestamp: new Date(),
                        executionId,
                        attempts: 1,
                    },
                };
                // Cache result if enabled
                if (this.config.enableCaching) {
                    await this.cacheResult(toolName, input, context, executionResult);
                }
                // Update metrics
                this.updateMetrics(executionResult);
                this.logger.info('MCP tool executed successfully', {
                    toolName,
                    executionId,
                    duration,
                });
                this.emit('tool:executed', executionResult);
                return executionResult;
            }
            finally {
                clearTimeout(timeoutHandle);
                this.activeExecutions.delete(executionId);
            }
        }
        catch (error) {
            const duration = performance.now() - startTime;
            const executionResult = {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                duration,
                toolName,
                agentId: context.agent.id,
                taskId: context.task?.id,
                metadata: {
                    timestamp: new Date(),
                    executionId,
                    attempts: 1,
                },
            };
            this.updateMetrics(executionResult);
            this.logger.error('MCP tool execution failed', {
                toolName,
                executionId,
                error: executionResult.error,
                duration,
            });
            this.emit('tool:failed', executionResult);
            return executionResult;
        }
    }
    /**
     * Execute multiple tools in parallel
     */
    async executeToolsParallel(toolExecutions) {
        if (!this.config.parallelExecution) {
            // Execute sequentially if parallel execution is disabled
            const results = [];
            for (const execution of toolExecutions) {
                const result = await this.executeTool(execution.toolName, execution.input, execution.context);
                results.push(result);
            }
            return results;
        }
        this.logger.info('Executing tools in parallel', {
            toolCount: toolExecutions.length,
            maxConcurrent: this.config.maxConcurrentTools,
        });
        // Limit concurrent executions
        const semaphore = new Semaphore(this.config.maxConcurrentTools);
        const promises = toolExecutions.map(async (execution) => {
            await semaphore.acquire();
            try {
                return await this.executeTool(execution.toolName, execution.input, execution.context);
            }
            finally {
                semaphore.release();
            }
        });
        const results = await Promise.allSettled(promises);
        return results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            }
            else {
                // Create error result
                return {
                    success: false,
                    error: result.reason instanceof Error ? result.reason.message : String(result.reason),
                    duration: 0,
                    toolName: toolExecutions[index].toolName,
                    agentId: toolExecutions[index].context.agent.id,
                    taskId: toolExecutions[index].context.task?.id,
                    metadata: {
                        timestamp: new Date(),
                        executionId: (0, helpers_js_1.generateId)('failed-execution'),
                        attempts: 1,
                    },
                };
            }
        });
    }
    /**
     * Get available tools with filtering options
     */
    getAvailableTools(options = {}) {
        let tools = Array.from(this.toolRegistry.tools.values());
        // Filter by category
        if (options.category) {
            const categoryTools = this.toolRegistry.categories.get(options.category) || [];
            tools = tools.filter(tool => categoryTools.includes(tool.name));
        }
        // Filter by capability
        if (options.capability) {
            const capabilityTools = this.toolRegistry.capabilities.get(options.capability) || [];
            tools = tools.filter(tool => capabilityTools.includes(tool.name));
        }
        // Filter by agent permissions
        if (options.agent) {
            tools = tools.filter(tool => this.hasPermission(tool, options.agent));
        }
        return tools;
    }
    /**
     * Get tool information
     */
    getToolInfo(toolName) {
        return this.toolRegistry.tools.get(toolName) || null;
    }
    /**
     * Get integration metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            cacheHitRate: this.calculateCacheHitRate(),
            averageExecutionTime: this.calculateAverageExecutionTime(),
            toolUsageDistribution: this.calculateToolUsageDistribution(),
        };
    }
    /**
     * Create MCP execution context for swarm operations
     */
    createExecutionContext(orchestrator, agent, swarmId, task) {
        return {
            sessionId: (0, helpers_js_1.generateId)('mcp-session'),
            orchestrator,
            agent,
            task,
            swarmId,
            executionId: (0, helpers_js_1.generateId)('mcp-execution'),
            timeout: this.config.toolTimeout,
            maxRetries: this.config.maxRetries,
            logger: this.logger,
        };
    }
    // Private methods
    async registerClaudeFlowTools() {
        this.logger.info('Registering Claude Flow tools...');
        const claudeFlowTools = (0, claude_flow_tools_js_1.createClaudeFlowTools)(this.logger);
        for (const tool of claudeFlowTools) {
            this.toolRegistry.tools.set(tool.name, tool);
            // Categorize tool
            const category = this.categorizeClaudeFlowTool(tool.name);
            if (!this.toolRegistry.categories.has(category)) {
                this.toolRegistry.categories.set(category, []);
            }
            this.toolRegistry.categories.get(category).push(tool.name);
            // Add capabilities
            const capabilities = this.extractCapabilities(tool);
            for (const capability of capabilities) {
                if (!this.toolRegistry.capabilities.has(capability)) {
                    this.toolRegistry.capabilities.set(capability, []);
                }
                this.toolRegistry.capabilities.get(capability).push(tool.name);
            }
        }
        this.logger.info(`Registered ${claudeFlowTools.length} Claude Flow tools`);
    }
    async registerRuvSwarmTools() {
        this.logger.info('Registering ruv-swarm tools...');
        const ruvSwarmTools = (0, ruv_swarm_tools_js_1.createRuvSwarmTools)(this.logger);
        for (const tool of ruvSwarmTools) {
            this.toolRegistry.tools.set(tool.name, tool);
            // Categorize tool
            const category = this.categorizeRuvSwarmTool(tool.name);
            if (!this.toolRegistry.categories.has(category)) {
                this.toolRegistry.categories.set(category, []);
            }
            this.toolRegistry.categories.get(category).push(tool.name);
            // Add capabilities
            const capabilities = this.extractCapabilities(tool);
            for (const capability of capabilities) {
                if (!this.toolRegistry.capabilities.has(capability)) {
                    this.toolRegistry.capabilities.set(capability, []);
                }
                this.toolRegistry.capabilities.get(capability).push(tool.name);
            }
        }
        this.logger.info(`Registered ${ruvSwarmTools.length} ruv-swarm tools`);
    }
    async executeWithRetry(tool, input, context, executionId, signal) {
        let lastError = null;
        const maxRetries = context.maxRetries || this.config.maxRetries;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Check if execution was aborted
                if (signal.aborted) {
                    throw new Error('Execution aborted');
                }
                this.logger.debug('Executing tool attempt', {
                    toolName: tool.name,
                    executionId,
                    attempt,
                    maxRetries,
                });
                const result = await tool.handler(input, context);
                if (attempt > 1) {
                    this.logger.info('Tool execution succeeded after retry', {
                        toolName: tool.name,
                        executionId,
                        attempt,
                    });
                }
                return result;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                this.logger.warn('Tool execution attempt failed', {
                    toolName: tool.name,
                    executionId,
                    attempt,
                    maxRetries,
                    error: lastError.message,
                });
                // Don't retry on certain errors
                if (this.isNonRetryableError(lastError)) {
                    break;
                }
                // Wait before retry (exponential backoff)
                if (attempt < maxRetries) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError || new Error('Tool execution failed after all retries');
    }
    isNonRetryableError(error) {
        const nonRetryablePatterns = [
            /not found/i,
            /invalid input/i,
            /permission denied/i,
            /unauthorized/i,
            /forbidden/i,
        ];
        return nonRetryablePatterns.some(pattern => pattern.test(error.message));
    }
    async getCachedResult(toolName, input, context) {
        const cacheKey = this.generateCacheKey(toolName, input, context);
        const cached = this.executionCache.get(cacheKey);
        if (cached) {
            const age = Date.now() - cached.metadata.timestamp.getTime();
            if (age < this.config.cacheTimeout) {
                this.metrics.cacheHits++;
                return cached;
            }
            else {
                // Remove expired entry
                this.executionCache.delete(cacheKey);
            }
        }
        this.metrics.cacheMisses++;
        return null;
    }
    async cacheResult(toolName, input, context, result) {
        const cacheKey = this.generateCacheKey(toolName, input, context);
        this.executionCache.set(cacheKey, result);
    }
    generateCacheKey(toolName, input, context) {
        const inputHash = this.hashObject(input);
        const contextHash = this.hashObject({
            agentId: context.agent.id,
            swarmId: context.swarmId,
            taskId: context.task?.id,
        });
        return `${toolName}:${inputHash}:${contextHash}`;
    }
    hashObject(obj) {
        // Simple hash function for caching
        const str = JSON.stringify(obj, Object.keys(obj).sort());
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }
    hasPermission(tool, agent) {
        // Check if agent has permission to use this tool
        const toolPermissions = this.toolRegistry.permissions.get(tool.name) || [];
        // If no specific permissions defined, allow all
        if (toolPermissions.length === 0) {
            return true;
        }
        // Check agent capabilities against tool permissions
        return agent.capabilities.some(capability => toolPermissions.includes(capability));
    }
    categorizeClaudeFlowTool(toolName) {
        if (toolName.includes('agents/'))
            return 'agent-management';
        if (toolName.includes('tasks/'))
            return 'task-management';
        if (toolName.includes('memory/'))
            return 'memory-management';
        if (toolName.includes('system/'))
            return 'system-monitoring';
        if (toolName.includes('config/'))
            return 'configuration';
        if (toolName.includes('workflow/'))
            return 'workflow-management';
        if (toolName.includes('terminal/'))
            return 'terminal-management';
        return 'general';
    }
    categorizeRuvSwarmTool(toolName) {
        if (toolName.includes('swarm_'))
            return 'swarm-lifecycle';
        if (toolName.includes('agent_'))
            return 'agent-management';
        if (toolName.includes('task_'))
            return 'task-orchestration';
        if (toolName.includes('memory_'))
            return 'memory-persistence';
        if (toolName.includes('neural_'))
            return 'neural-capabilities';
        if (toolName.includes('benchmark_'))
            return 'performance-benchmarking';
        return 'general';
    }
    extractCapabilities(tool) {
        const capabilities = [];
        // Extract capabilities from tool name and description
        const text = `${tool.name} ${tool.description}`.toLowerCase();
        const capabilityPatterns = [
            'agent', 'task', 'memory', 'system', 'config', 'workflow',
            'terminal', 'swarm', 'neural', 'benchmark', 'monitoring',
            'orchestration', 'coordination', 'analysis', 'research',
            'development', 'testing', 'documentation', 'optimization',
        ];
        for (const pattern of capabilityPatterns) {
            if (text.includes(pattern)) {
                capabilities.push(pattern);
            }
        }
        return capabilities.length > 0 ? capabilities : ['general'];
    }
    updateMetrics(result) {
        this.metrics.totalExecutions++;
        if (result.success) {
            this.metrics.successfulExecutions++;
        }
        else {
            this.metrics.failedExecutions++;
        }
        this.metrics.totalExecutionTime += result.duration;
        // Update tool-specific metrics
        if (!this.metrics.toolExecutions.has(result.toolName)) {
            this.metrics.toolExecutions.set(result.toolName, {
                count: 0,
                totalTime: 0,
                successCount: 0,
                failureCount: 0,
            });
        }
        const toolStats = this.metrics.toolExecutions.get(result.toolName);
        toolStats.count++;
        toolStats.totalTime += result.duration;
        if (result.success) {
            toolStats.successCount++;
        }
        else {
            toolStats.failureCount++;
        }
    }
    calculateCacheHitRate() {
        const total = this.metrics.cacheHits + this.metrics.cacheMisses;
        return total > 0 ? this.metrics.cacheHits / total : 0;
    }
    calculateAverageExecutionTime() {
        return this.metrics.totalExecutions > 0
            ? this.metrics.totalExecutionTime / this.metrics.totalExecutions
            : 0;
    }
    calculateToolUsageDistribution() {
        const distribution = {};
        for (const [toolName, stats] of this.metrics.toolExecutions) {
            distribution[toolName] = stats.count;
        }
        return distribution;
    }
    startCacheCleanup() {
        // Clean up expired cache entries every 5 minutes
        setInterval(() => {
            const now = Date.now();
            const expired = [];
            for (const [key, result] of this.executionCache) {
                const age = now - result.metadata.timestamp.getTime();
                if (age > this.config.cacheTimeout) {
                    expired.push(key);
                }
            }
            expired.forEach(key => this.executionCache.delete(key));
            if (expired.length > 0) {
                this.logger.debug('Cleaned up expired cache entries', {
                    count: expired.length
                });
            }
        }, 300000); // 5 minutes
    }
    initializeToolRegistry() {
        return {
            tools: new Map(),
            categories: new Map(),
            capabilities: new Map(),
            permissions: new Map(),
        };
    }
    initializeMetrics() {
        return {
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            totalExecutionTime: 0,
            cacheHits: 0,
            cacheMisses: 0,
            toolExecutions: new Map(),
            cacheHitRate: 0,
            averageExecutionTime: 0,
            toolUsageDistribution: {},
        };
    }
    createDefaultConfig(config) {
        return {
            enableClaudeFlowTools: true,
            enableRuvSwarmTools: true,
            enableCustomTools: true,
            toolTimeout: 30000, // 30 seconds
            maxRetries: 3,
            enableCaching: true,
            cacheTimeout: 300000, // 5 minutes
            enableMetrics: true,
            enableLogging: true,
            enableErrorRecovery: true,
            parallelExecution: true,
            maxConcurrentTools: 5,
            ...config,
        };
    }
    setupEventHandlers() {
        this.on('tool:executed', (result) => {
            if (this.config.enableLogging) {
                this.logger.debug('Tool execution completed', {
                    toolName: result.toolName,
                    success: result.success,
                    duration: result.duration,
                });
            }
        });
        this.on('tool:failed', (result) => {
            if (this.config.enableLogging) {
                this.logger.warn('Tool execution failed', {
                    toolName: result.toolName,
                    error: result.error,
                    duration: result.duration,
                });
            }
        });
    }
}
exports.MCPIntegrationWrapper = MCPIntegrationWrapper;
class Semaphore {
    permits;
    waitQueue = [];
    constructor(permits) {
        this.permits = permits;
    }
    async acquire() {
        if (this.permits > 0) {
            this.permits--;
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            this.waitQueue.push(resolve);
        });
    }
    release() {
        if (this.waitQueue.length > 0) {
            const resolve = this.waitQueue.shift();
            resolve();
        }
        else {
            this.permits++;
        }
    }
}
exports.default = MCPIntegrationWrapper;
//# sourceMappingURL=mcp-integration-wrapper.js.map