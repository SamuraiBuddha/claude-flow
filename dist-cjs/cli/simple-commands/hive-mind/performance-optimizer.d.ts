/**
 * PerformanceOptimizer main class
 */
export class PerformanceOptimizer extends EventEmitter<[never]> {
    constructor(config?: {});
    config: {
        enableAsyncQueue: boolean;
        enableBatchProcessing: boolean;
        enableAutoTuning: boolean;
        asyncQueueConcurrency: any;
        batchMaxSize: any;
        metricsInterval: any;
    };
    asyncQueue: AsyncOperationQueue;
    batchProcessor: BatchProcessor;
    metrics: {
        optimizations: {
            asyncOperations: number;
            batchOperations: number;
            cacheHits: number;
            performanceGains: never[];
        };
        system: {
            cpuUsage: number;
            memoryUsage: number;
            throughput: number;
        };
    };
    cache: Map<any, any>;
    performanceBaseline: any;
    _initialize(): void;
    /**
     * Optimize async operation execution
     */
    optimizeAsyncOperation(operation: any, options?: {}): Promise<any>;
    /**
     * Optimize batch operations
     */
    optimizeBatchOperation(batchKey: any, item: any, processor: any, options?: {}): Promise<any>;
    /**
     * Optimized caching with automatic expiration
     */
    optimizeWithCache(key: any, operation: any, ttl?: number): Promise<any>;
    /**
     * Optimize memory operations with connection pooling awareness
     */
    optimizeMemoryOperation(operation: any, connectionPool: any): Promise<any>;
    /**
     * Optimize agent spawning with intelligent batching
     */
    optimizeAgentSpawning(agentTypes: any, spawnFunction: any): Promise<any[]>;
    /**
     * Group agents by complexity for optimal spawning
     */
    _groupAgentsByComplexity(agentTypes: any): any[];
    /**
     * Auto-tune performance parameters based on metrics
     */
    _autoTune(): void;
    /**
     * Clean old cache entries
     */
    _cleanCache(): void;
    /**
     * Collect system performance metrics
     */
    _collectSystemMetrics(): void;
    /**
     * Get comprehensive performance statistics
     */
    getPerformanceStats(): {
        optimizer: {
            optimizations: {
                asyncOperations: number;
                batchOperations: number;
                cacheHits: number;
                performanceGains: never[];
            };
            system: {
                cpuUsage: number;
                memoryUsage: number;
                throughput: number;
            };
        };
        asyncQueue: {
            successRate: string | number;
            queueSize: number;
            running: number;
            utilization: string;
            processed: number;
            failures: number;
            avgProcessingTime: number;
            totalProcessingTime: number;
        };
        batchProcessor: {
            pendingBatches: number;
            pendingItems: any;
            batchesProcessed: number;
            itemsProcessed: number;
            avgBatchSize: number;
            avgProcessingTime: number;
        };
        cache: {
            size: number;
            hitRate: string | number;
        };
    };
    /**
     * Generate performance report with recommendations
     */
    generatePerformanceReport(): {
        timestamp: string;
        performance: {
            optimizer: {
                optimizations: {
                    asyncOperations: number;
                    batchOperations: number;
                    cacheHits: number;
                    performanceGains: never[];
                };
                system: {
                    cpuUsage: number;
                    memoryUsage: number;
                    throughput: number;
                };
            };
            asyncQueue: {
                successRate: string | number;
                queueSize: number;
                running: number;
                utilization: string;
                processed: number;
                failures: number;
                avgProcessingTime: number;
                totalProcessingTime: number;
            };
            batchProcessor: {
                pendingBatches: number;
                pendingItems: any;
                batchesProcessed: number;
                itemsProcessed: number;
                avgBatchSize: number;
                avgProcessingTime: number;
            };
            cache: {
                size: number;
                hitRate: string | number;
            };
        };
        recommendations: ({
            type: string;
            priority: string;
            message: string;
            currentValue: number;
            suggestedValue: number;
            currentHitRate?: undefined;
            avgBatchSize?: undefined;
        } | {
            type: string;
            priority: string;
            message: string;
            currentHitRate: string | number;
            currentValue?: undefined;
            suggestedValue?: undefined;
            avgBatchSize?: undefined;
        } | {
            type: string;
            priority: string;
            message: string;
            avgBatchSize: number;
            currentValue?: undefined;
            suggestedValue?: undefined;
            currentHitRate?: undefined;
        })[];
        summary: {
            overallHealth: string;
            keyMetrics: {
                throughput: number;
                efficiency: string | number;
                utilization: string;
            };
        };
    };
    /**
     * Calculate overall system health score
     */
    _calculateOverallHealth(stats: any): "excellent" | "good" | "fair" | "poor";
    /**
     * Close optimizer and cleanup resources
     */
    close(): Promise<void>;
}
export default PerformanceOptimizer;
import EventEmitter from 'events';
/**
 * AsyncOperationQueue for managing concurrent operations
 */
declare class AsyncOperationQueue {
    constructor(maxConcurrency?: number, timeout?: number);
    maxConcurrency: number;
    timeout: number;
    running: number;
    queue: any[];
    results: Map<any, any>;
    metrics: {
        processed: number;
        failures: number;
        avgProcessingTime: number;
        totalProcessingTime: number;
    };
    add(operation: any, priority?: number): Promise<any>;
    _processQueue(): Promise<void>;
    _updateMetrics(processingTime: any, success: any): void;
    getMetrics(): {
        successRate: string | number;
        queueSize: number;
        running: number;
        utilization: string;
        processed: number;
        failures: number;
        avgProcessingTime: number;
        totalProcessingTime: number;
    };
}
/**
 * BatchProcessor for optimizing bulk operations
 */
declare class BatchProcessor extends EventEmitter<[never]> {
    constructor(config?: {});
    config: {
        maxBatchSize: any;
        flushInterval: any;
        maxWaitTime: any;
    };
    batches: Map<any, any>;
    timers: Map<any, any>;
    metrics: {
        batchesProcessed: number;
        itemsProcessed: number;
        avgBatchSize: number;
        avgProcessingTime: number;
    };
    addToBatch(batchKey: any, item: any, processor: any): Promise<any>;
    _processBatch(batchKey: any): Promise<any>;
    _startPeriodicFlush(): void;
    getMetrics(): {
        pendingBatches: number;
        pendingItems: any;
        batchesProcessed: number;
        itemsProcessed: number;
        avgBatchSize: number;
        avgProcessingTime: number;
    };
    close(): Promise<any[]>;
}
//# sourceMappingURL=performance-optimizer.d.ts.map