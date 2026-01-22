/**
 * MCP Integration Wrapper for Swarm System
 *
 * This module provides a comprehensive wrapper around MCP tools to enable
 * seamless integration with the swarm orchestration system. It handles
 * tool discovery, execution, error handling, and result aggregation.
 */
import { EventEmitter } from 'node:events';
import type { MCPTool, MCPContext } from '../utils/types.js';
import type { AdvancedSwarmOrchestrator } from './advanced-orchestrator.js';
import { SwarmAgent, SwarmTask } from './types.js';
export interface MCPToolExecutionResult {
    success: boolean;
    result?: any;
    error?: string;
    duration: number;
    toolName: string;
    agentId: string;
    taskId?: string;
    metadata: {
        timestamp: Date;
        executionId: string;
        attempts: number;
        resourcesUsed?: any;
    };
}
export interface MCPToolRegistry {
    tools: Map<string, MCPTool>;
    categories: Map<string, string[]>;
    capabilities: Map<string, string[]>;
    permissions: Map<string, string[]>;
}
export interface MCPExecutionContext extends MCPContext {
    orchestrator: AdvancedSwarmOrchestrator;
    agent: SwarmAgent;
    task?: SwarmTask;
    swarmId: string;
    executionId: string;
    timeout: number;
    maxRetries: number;
}
export interface MCPIntegrationConfig {
    enableClaudeFlowTools: boolean;
    enableRuvSwarmTools: boolean;
    enableCustomTools: boolean;
    toolTimeout: number;
    maxRetries: number;
    enableCaching: boolean;
    cacheTimeout: number;
    enableMetrics: boolean;
    enableLogging: boolean;
    enableErrorRecovery: boolean;
    parallelExecution: boolean;
    maxConcurrentTools: number;
}
export declare class MCPIntegrationWrapper extends EventEmitter {
    private logger;
    private config;
    private toolRegistry;
    private executionCache;
    private activeExecutions;
    private metrics;
    constructor(config?: Partial<MCPIntegrationConfig>);
    /**
     * Initialize the MCP integration wrapper
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the wrapper gracefully
     */
    shutdown(): Promise<void>;
    /**
     * Execute an MCP tool within a swarm context
     */
    executeTool(toolName: string, input: any, context: MCPExecutionContext): Promise<MCPToolExecutionResult>;
    /**
     * Execute multiple tools in parallel
     */
    executeToolsParallel(toolExecutions: Array<{
        toolName: string;
        input: any;
        context: MCPExecutionContext;
    }>): Promise<MCPToolExecutionResult[]>;
    /**
     * Get available tools with filtering options
     */
    getAvailableTools(options?: {
        category?: string;
        capability?: string;
        agent?: SwarmAgent;
    }): MCPTool[];
    /**
     * Get tool information
     */
    getToolInfo(toolName: string): MCPTool | null;
    /**
     * Get integration metrics
     */
    getMetrics(): MCPIntegrationMetrics;
    /**
     * Create MCP execution context for swarm operations
     */
    createExecutionContext(orchestrator: AdvancedSwarmOrchestrator, agent: SwarmAgent, swarmId: string, task?: SwarmTask): MCPExecutionContext;
    private registerClaudeFlowTools;
    private registerRuvSwarmTools;
    private executeWithRetry;
    private isNonRetryableError;
    private getCachedResult;
    private cacheResult;
    private generateCacheKey;
    private hashObject;
    private hasPermission;
    private categorizeClaudeFlowTool;
    private categorizeRuvSwarmTool;
    private extractCapabilities;
    private updateMetrics;
    private calculateCacheHitRate;
    private calculateAverageExecutionTime;
    private calculateToolUsageDistribution;
    private startCacheCleanup;
    private initializeToolRegistry;
    private initializeMetrics;
    private createDefaultConfig;
    private setupEventHandlers;
}
interface MCPIntegrationMetrics {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    totalExecutionTime: number;
    cacheHits: number;
    cacheMisses: number;
    toolExecutions: Map<string, {
        count: number;
        totalTime: number;
        successCount: number;
        failureCount: number;
    }>;
    cacheHitRate: number;
    averageExecutionTime: number;
    toolUsageDistribution: Record<string, number>;
}
export default MCPIntegrationWrapper;
//# sourceMappingURL=mcp-integration-wrapper.d.ts.map