/**
 * MCPToolWrapper class for unified MCP tool access
 */
export class MCPToolWrapper {
    constructor(config?: {});
    config: {
        parallel: boolean;
        timeout: number;
        retryCount: number;
    };
    toolStats: Map<any, any>;
    parallelQueue: any[];
    executing: boolean;
    /** @type {import('better-sqlite3').Database | null} */
    memoryDb: import("better-sqlite3").Database | null;
    memoryStore: Map<any, any>;
    /**
     * Initialize real memory storage using SQLite
     */
    initializeMemoryStorage(): Promise<void>;
    /**
     * Execute MCP tool with automatic retry and error handling
     */
    executeTool(toolName: any, params?: {}): Promise<any>;
    /**
     * Execute multiple tools in parallel with optimized batching
     */
    executeParallel(toolCalls: any): Promise<any[]>;
    /**
     * Calculate optimal concurrency based on tool types
     */
    _calculateOptimalConcurrency(toolCalls: any): number;
    /**
     * Group tools by execution priority
     */
    _groupToolsByPriority(toolCalls: any): never[][];
    /**
     * Execute tool with timeout wrapper
     */
    _executeWithTimeout(call: any, timeout: any): Promise<any>;
    /**
     * Track batch execution performance
     */
    _trackBatchPerformance(toolCount: any, executionTime: any, concurrency: any): void;
    batchStats: {
        totalBatches: number;
        totalTools: number;
        totalTime: number;
        avgConcurrency: number;
        avgToolsPerBatch: number;
        avgTimePerTool: number;
    } | undefined;
    /**
     * Internal tool execution
     */
    _executeToolInternal(toolName: any, params: any): Promise<any>;
    /**
     * Get tool category
     */
    _getToolCategory(toolName: any): string | null;
    /**
     * Get mock response for demonstration
     */
    _getMockResponse(toolName: any, params: any): any;
    /**
     * Track tool usage statistics
     */
    _trackToolUsage(toolName: any, duration: any, success: any): void;
    /**
     * Get comprehensive tool statistics
     */
    getStatistics(): {
        tools: {};
        batch: {
            totalBatches: number;
            totalTools: number;
            totalTime: number;
            avgConcurrency: number;
            avgToolsPerBatch: number;
            avgTimePerTool: number;
        };
        spawn: {
            totalSpawns: number;
            totalAgents: number;
            totalTime: number;
            avgTimePerAgent: number;
            bestTime: number;
            worstTime: number;
        };
        performance: {
            totalCalls: any;
            successRate: string | number;
            avgLatency: string | number;
            throughput: string | number;
        };
    };
    /**
     * Calculate overall success rate
     */
    _calculateOverallSuccessRate(): string | 100;
    /**
     * Calculate average latency
     */
    _calculateAvgLatency(): string | 0;
    /**
     * Calculate throughput (operations per second)
     */
    _calculateThroughput(): string | 0;
    /**
     * Create batch of tool calls for parallel execution
     */
    createBatch(calls: any): any;
    /**
     * Execute swarm initialization sequence with optimization
     */
    initializeSwarm(config: any): Promise<any[]>;
    /**
     * Spawn multiple agents in parallel with optimization
     */
    spawnAgents(types: any, swarmId: any): Promise<any[]>;
    /**
     * Group agent types for optimized spawning
     */
    _groupAgentTypes(types: any): any[];
    /**
     * Track agent spawn performance
     */
    _trackSpawnPerformance(agentCount: any, spawnTime: any): void;
    spawnStats: {
        totalSpawns: number;
        totalAgents: number;
        totalTime: number;
        avgTimePerAgent: number;
        bestTime: number;
        worstTime: number;
    } | undefined;
    /**
     * Store data in collective memory (REAL IMPLEMENTATION)
     */
    storeMemory(swarmId: any, key: any, value: any, type?: string): Promise<{
        success: boolean;
        action: string;
        namespace: any;
        key: any;
        type: string;
        timestamp: number;
        id: number | bigint;
    } | {
        success: boolean;
        action: string;
        namespace: any;
        key: any;
        type: string;
        timestamp: number;
        id?: undefined;
    }>;
    /**
     * Retrieve data from collective memory (REAL IMPLEMENTATION)
     */
    retrieveMemory(swarmId: any, key: any): Promise<any>;
    /**
     * Search collective memory (REAL IMPLEMENTATION)
     */
    searchMemory(swarmId: any, pattern: any): Promise<{
        success: boolean;
        namespace: any;
        pattern: any;
        total: number;
        results: any[];
    }>;
    /**
     * Orchestrate task with monitoring and optimization
     */
    orchestrateTask(task: any, strategy?: string, metadata?: {}): Promise<any[]>;
    /**
     * Analyze performance bottlenecks
     */
    analyzePerformance(swarmId: any): Promise<any[]>;
    /**
     * GitHub integration for code operations
     */
    githubOperations(repo: any, operation: any, params?: {}): Promise<any>;
    /**
     * Neural network operations
     */
    neuralOperation(operation: any, params?: {}): Promise<any>;
    /**
     * Clean up and destroy swarm
     */
    destroySwarm(swarmId: any): Promise<any[]>;
    /**
     * Get real swarm status from memory storage
     */
    getSwarmStatus(params?: {}): Promise<{
        swarms: {
            id: any;
            name: any;
            status: string;
            agents: number;
            tasks: {
                total: number;
                completed: number;
                pending: number;
                failed: number;
            };
            topology: string;
            createdAt: null;
            lastActivity: null;
            memoryUsage: number;
        }[];
        activeAgents: number;
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
        recentActivity: {
            swarmId: any;
            action: any;
            type: any;
            timestamp: any;
        }[];
        summary: {
            totalSwarms: number;
            activeSwarms: number;
            idleSwarms: number;
            inactiveSwarms: number;
        };
        error?: undefined;
    } | {
        swarms: any[];
        activeAgents: number;
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
        summary: {
            totalSwarms: number;
            activeSwarms: number;
            idleSwarms?: undefined;
            inactiveSwarms?: undefined;
        };
        recentActivity?: undefined;
        error?: undefined;
    } | {
        swarms: never[];
        activeAgents: number;
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
        recentActivity: never[];
        summary: {
            totalSwarms: number;
            activeSwarms: number;
            idleSwarms: number;
            inactiveSwarms: number;
        };
        error: any;
    }>;
}
export namespace MCP_TOOLS {
    let swarm: string[];
    let neural: string[];
    let memory: string[];
    let performance: string[];
    let github: string[];
    let workflow: string[];
    let daa: string[];
    let system: string[];
    let sparc: string[];
    let task: string[];
}
//# sourceMappingURL=mcp-wrapper.d.ts.map