/**
 * Advanced task executor with timeout handling, retry logic, and resource management
 */
import { EventEmitter } from 'node:events';
import { ChildProcess } from 'node:child_process';
import type { TaskDefinition, TaskResult, AgentState, TaskError } from '../swarm/types.js';
import type { ILogger } from '../core/logger.js';
import type { IEventBus } from '../core/event-bus.js';
import { CircuitBreaker } from './circuit-breaker.js';
export interface TaskExecutorConfig {
    maxConcurrentTasks: number;
    defaultTimeout: number;
    retryAttempts: number;
    retryBackoffBase: number;
    retryBackoffMax: number;
    resourceLimits: {
        memory: number;
        cpu: number;
        disk: number;
    };
    enableCircuitBreaker: boolean;
    enableResourceMonitoring: boolean;
    killTimeout: number;
}
export interface ExecutionContext {
    taskId: string;
    agentId: string;
    process?: ChildProcess;
    startTime: Date;
    timeout?: NodeJS.Timeout;
    resources: ResourceUsage;
    circuitBreaker?: CircuitBreaker;
}
export interface ResourceUsage {
    memory: number;
    cpu: number;
    disk: number;
    network: number;
    lastUpdated: Date;
}
export interface TaskExecutionResult {
    success: boolean;
    result?: TaskResult;
    error?: TaskError;
    executionTime: number;
    resourcesUsed: ResourceUsage;
    retryCount: number;
}
/**
 * Advanced task executor with comprehensive timeout and resource management
 */
export declare class AdvancedTaskExecutor extends EventEmitter {
    private logger;
    private eventBus;
    private config;
    private runningTasks;
    private circuitBreakerManager;
    private resourceMonitor?;
    private queuedTasks;
    private isShuttingDown;
    constructor(config: Partial<TaskExecutorConfig>, logger: ILogger, eventBus: IEventBus);
    private setupEventHandlers;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    /**
     * Execute a task with comprehensive error handling and resource management
     */
    executeTask(task: TaskDefinition, agent: AgentState, options?: {
        timeout?: number;
        retryAttempts?: number;
        priority?: number;
    }): Promise<TaskExecutionResult>;
    private executeSingleAttempt;
    private performTaskExecution;
    private buildExecutionCommand;
    private cancelTask;
    private startResourceMonitoring;
    private updateResourceUsage;
    private getProcessResourceUsage;
    private checkResourceLimits;
    private getDefaultResourceUsage;
    private waitForCapacity;
    private processQueuedTasks;
    private delay;
    private gracefulShutdown;
    getRunningTasks(): string[];
    getTaskContext(taskId: string): ExecutionContext | undefined;
    getQueuedTasks(): TaskDefinition[];
    getExecutorStats(): {
        runningTasks: number;
        queuedTasks: number;
        maxConcurrentTasks: number;
        totalCapacity: number;
        resourceLimits: TaskExecutorConfig['resourceLimits'];
        circuitBreakers: Record<string, any>;
    };
    forceKillTask(taskId: string): Promise<void>;
    updateConfig(newConfig: Partial<TaskExecutorConfig>): void;
}
//# sourceMappingURL=advanced-task-executor.d.ts.map