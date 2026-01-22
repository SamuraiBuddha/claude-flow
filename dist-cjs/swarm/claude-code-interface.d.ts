/**
 * Claude Code Coordination Interface
 *
 * This module provides the interface layer for coordinating with Claude Code
 * instances, managing agent spawning through the claude CLI, handling process
 * lifecycle, and enabling seamless communication between the swarm system
 * and individual Claude agents.
 */
import { EventEmitter } from 'node:events';
import { ChildProcess } from 'node:child_process';
import { MemoryManager } from '../memory/manager.js';
import { ClaudeExecutionOptions } from './executor.js';
import { TaskDefinition } from './types.js';
export interface ClaudeCodeConfig {
    claudeExecutablePath: string;
    defaultModel: string;
    maxTokens: number;
    temperature: number;
    timeout: number;
    maxConcurrentAgents: number;
    enableStreaming: boolean;
    enableLogging: boolean;
    workingDirectory: string;
    environmentVariables: Record<string, string>;
    agentPoolSize: number;
    processRecycling: boolean;
    healthCheckInterval: number;
}
export interface ClaudeAgent {
    id: string;
    processId: number;
    process: ChildProcess;
    type: string;
    capabilities: string[];
    status: 'initializing' | 'idle' | 'busy' | 'error' | 'terminated';
    currentTask?: string;
    spawnedAt: Date;
    lastActivity: Date;
    totalTasks: number;
    totalDuration: number;
    metrics: ClaudeAgentMetrics;
}
export interface ClaudeAgentMetrics {
    tasksCompleted: number;
    tasksFailed: number;
    averageResponseTime: number;
    totalTokensUsed: number;
    memoryUsage: number;
    cpuUsage: number;
    errorRate: number;
    successRate: number;
}
export interface ClaudeTaskExecution {
    id: string;
    taskId: string;
    agentId: string;
    startTime: Date;
    endTime?: Date;
    status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
    input: any;
    output?: any;
    error?: string;
    duration?: number;
    tokensUsed?: number;
    retryCount: number;
    maxRetries: number;
}
export interface ClaudeSpawnOptions {
    type: string;
    name?: string;
    capabilities?: string[];
    systemPrompt?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    workingDirectory?: string;
    environment?: Record<string, string>;
    tools?: string[];
    priority?: number;
}
export interface ProcessPool {
    idle: ClaudeAgent[];
    busy: ClaudeAgent[];
    failed: ClaudeAgent[];
    totalSpawned: number;
    totalTerminated: number;
    recyclingEnabled: boolean;
    maxAge: number;
    maxTasks: number;
}
export declare class ClaudeCodeInterface extends EventEmitter {
    private logger;
    private config;
    private memoryManager;
    private processPool;
    private activeExecutions;
    private agents;
    private taskExecutor;
    private healthCheckInterval?;
    private isInitialized;
    constructor(config: Partial<ClaudeCodeConfig> | undefined, memoryManager: MemoryManager);
    /**
     * Initialize the Claude Code interface
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the interface gracefully
     */
    shutdown(): Promise<void>;
    /**
     * Spawn a new Claude agent with specified configuration
     */
    spawnAgent(options: ClaudeSpawnOptions): Promise<string>;
    /**
     * Execute a task using a Claude agent
     */
    executeTask(taskDefinition: TaskDefinition, agentId?: string, options?: Partial<ClaudeExecutionOptions>): Promise<ClaudeTaskExecution>;
    /**
     * Cancel a running task execution
     */
    cancelExecution(executionId: string, reason: string): Promise<void>;
    /**
     * Terminate a specific agent
     */
    terminateAgent(agentId: string, reason?: string): Promise<void>;
    /**
     * Get agent status and metrics
     */
    getAgentStatus(agentId: string): ClaudeAgent | null;
    /**
     * Get all active agents
     */
    getAllAgents(): ClaudeAgent[];
    /**
     * Get execution status
     */
    getExecutionStatus(executionId: string): ClaudeTaskExecution | null;
    /**
     * Get comprehensive interface metrics
     */
    getInterfaceMetrics(): {
        agents: {
            total: number;
            idle: number;
            busy: number;
            failed: number;
            terminated: number;
        };
        executions: {
            active: number;
            completed: number;
            failed: number;
            cancelled: number;
        };
        performance: {
            averageResponseTime: number;
            totalTokensUsed: number;
            successRate: number;
            throughput: number;
        };
        pool: {
            totalSpawned: number;
            totalTerminated: number;
            recyclingEnabled: boolean;
            poolUtilization: number;
        };
    };
    private verifyClaudeExecutable;
    private prewarmAgentPool;
    private buildClaudeCommand;
    private setupProcessEventHandlers;
    private waitForAgentReady;
    private selectOptimalAgent;
    private calculateAgentScore;
    private executeTaskWithAgent;
    private convertToAgentState;
    private createAgentCapabilities;
    private cancelAgentTask;
    private terminateProcess;
    private terminateAllAgents;
    private moveAgentToBusyPool;
    private returnAgentToIdlePool;
    private moveAgentToFailedPool;
    private removeAgentFromPools;
    private updateAgentMetrics;
    private getTotalActiveAgents;
    private calculateThroughput;
    private calculatePoolUtilization;
    private startHealthChecks;
    private performHealthCheck;
    private recoverStalledAgent;
    private initializeProcessPool;
    private initializeAgentMetrics;
    private createDefaultConfig;
    private setupEventHandlers;
}
export default ClaudeCodeInterface;
//# sourceMappingURL=claude-code-interface.d.ts.map