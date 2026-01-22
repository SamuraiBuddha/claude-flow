/**
 * Optimized Task Executor
 * Implements async execution with connection pooling and caching
 */
import { EventEmitter } from 'node:events';
import type { TaskDefinition, TaskResult, AgentId } from '../types.js';
export interface ExecutorConfig {
    connectionPool?: {
        min?: number;
        max?: number;
    };
    concurrency?: number;
    caching?: {
        enabled?: boolean;
        ttl?: number;
        maxSize?: number;
    };
    fileOperations?: {
        outputDir?: string;
        concurrency?: number;
    };
    monitoring?: {
        metricsInterval?: number;
        slowTaskThreshold?: number;
    };
}
export interface ExecutionMetrics {
    totalExecuted: number;
    totalSucceeded: number;
    totalFailed: number;
    avgExecutionTime: number;
    cacheHitRate: number;
    queueLength: number;
    activeExecutions: number;
}
export declare class OptimizedExecutor extends EventEmitter {
    private config;
    private logger;
    private connectionPool;
    private fileManager;
    private executionQueue;
    private resultCache;
    private executionHistory;
    private metrics;
    private activeExecutions;
    constructor(config?: ExecutorConfig);
    executeTask(task: TaskDefinition, agentId: AgentId): Promise<TaskResult>;
    executeBatch(tasks: TaskDefinition[], agentId: AgentId): Promise<TaskResult[]>;
    private buildMessages;
    private getTaskCacheKey;
    private isRecoverableError;
    private isRetryableError;
    getMetrics(): ExecutionMetrics;
    private emitMetrics;
    waitForPendingExecutions(): Promise<void>;
    shutdown(): Promise<void>;
    /**
     * Get execution history for analysis
     */
    getExecutionHistory(): {
        items: {
            taskId: string;
            duration: number;
            status: "success" | "failed";
            timestamp: Date;
        }[];
        capacity: number;
        size: number;
        totalItemsWritten: number;
        overwrittenCount: number;
        memoryUsage: number;
    };
    /**
     * Get connection pool statistics
     */
    getConnectionPoolStats(): {
        total: number;
        inUse: number;
        idle: number;
        waitingQueue: number;
        totalUseCount: number;
    };
    /**
     * Get file manager metrics
     */
    getFileManagerMetrics(): {
        operations: {
            [k: string]: number;
        };
        totalBytes: number;
        errors: number;
        writeQueueSize: number;
        readQueueSize: number;
        writeQueuePending: number;
        readQueuePending: number;
    };
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        hitRate: number;
        hits: number;
        misses: number;
        evictions: number;
        expirations: number;
    };
}
//# sourceMappingURL=optimized-executor.d.ts.map