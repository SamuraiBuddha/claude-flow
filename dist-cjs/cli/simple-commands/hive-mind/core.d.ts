/**
 * HiveMindCore - Main orchestration class
 */
export class HiveMindCore extends EventEmitter<[never]> {
    constructor(config?: {});
    config: {
        objective: string;
        name: string;
        queenType: string;
        maxWorkers: number;
        consensusAlgorithm: string;
        autoScale: boolean;
        encryption: boolean;
        memorySize: number;
        taskTimeout: number;
    };
    state: {
        status: string;
        swarmId: null;
        queen: null;
        workers: Map<any, any>;
        tasks: Map<any, any>;
        memory: Map<any, any>;
        decisions: Map<any, any>;
        metrics: {
            tasksCreated: number;
            tasksCompleted: number;
            decisionsReached: number;
            memoryUsage: number;
        };
    };
    mcpWrapper: MCPToolWrapper;
    performanceOptimizer: PerformanceOptimizer;
    /**
     * Initialize event handlers
     */
    _initializeEventHandlers(): void;
    /**
     * Initialize performance monitoring
     */
    _initializePerformanceMonitoring(): void;
    /**
     * Handle task failure with recovery logic
     */
    _handleTaskFailure(task: any, error: any): void;
    /**
     * Check if error is recoverable
     */
    _isRecoverableError(error: any): boolean;
    /**
     * Initialize the hive mind swarm
     */
    initialize(): Promise<null>;
    /**
     * Determine optimal topology based on objective
     */
    _determineTopology(): "hierarchical" | "mesh" | "ring" | "star";
    /**
     * Spawn the queen coordinator
     */
    spawnQueen(queenData: any): Promise<null>;
    /**
     * Spawn worker agents with batch optimization
     */
    spawnWorkers(workerTypes: any): Promise<any[]>;
    /**
     * Create and distribute task with performance optimization
     */
    createTask(description: any, priority?: number, metadata?: {}): Promise<{
        id: string;
        swarmId: null;
        description: any;
        priority: number;
        status: string;
        createdAt: string;
        assignedTo: null;
        result: null;
        metadata: {
            estimatedDuration: number;
            complexity: string;
        };
    }>;
    /**
     * Estimate task duration based on description analysis
     */
    _estimateTaskDuration(description: any): number;
    /**
     * Analyze task complexity
     */
    _analyzeTaskComplexity(description: any): string;
    /**
     * Find best worker for task (optimized async version)
     */
    _findBestWorkerAsync(task: any): Promise<any>;
    /**
     * Synchronous version for backward compatibility
     */
    _findBestWorker(task: any): any;
    /**
     * Assign task to worker
     */
    _assignTask(workerId: any, taskId: any): Promise<void>;
    /**
     * Execute task with performance optimization
     */
    _executeTask(workerId: any, taskId: any): Promise<void>;
    /**
     * Assign next task to idle worker
     */
    _assignNextTask(workerId: any): void;
    /**
     * Build consensus for decision
     */
    buildConsensus(topic: any, options: any): Promise<{
        id: string;
        swarmId: null;
        topic: any;
        options: any;
        votes: Map<any, any>;
        algorithm: string;
        status: string;
        createdAt: string;
    }>;
    /**
     * Calculate consensus based on algorithm
     */
    _calculateConsensus(decision: any): {
        decision: string;
        confidence: number;
    };
    /**
     * Check if auto-scaling is needed
     */
    _checkAutoScale(): Promise<void>;
    /**
     * Determine worker type for auto-scaling
     */
    _determineWorkerType(): string;
    /**
     * Update performance metrics
     */
    _updatePerformanceMetrics(): Promise<void>;
    /**
     * Handle errors
     */
    _handleError(error: any): void;
    /**
     * Get current status with performance metrics
     */
    getStatus(): {
        swarmId: null;
        status: string;
        queen: null;
        workers: any[];
        tasks: {
            total: number;
            pending: number;
            inProgress: number;
            completed: number;
            failed: number;
        };
        metrics: {
            averageTaskTime: number;
            workerEfficiency: string | number;
            throughput: string | number;
            tasksCreated: number;
            tasksCompleted: number;
            decisionsReached: number;
            memoryUsage: number;
        };
        decisions: number;
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
    };
    /**
     * Calculate average task completion time
     */
    _calculateAverageTaskTime(tasks: any): number;
    /**
     * Calculate worker efficiency
     */
    _calculateWorkerEfficiency(workers: any): string | 0;
    /**
     * Calculate system throughput (tasks per minute)
     */
    _calculateThroughput(tasks: any): string | 0;
    /**
     * Shutdown hive mind with cleanup
     */
    shutdown(): Promise<void>;
    /**
     * Get performance insights and recommendations
     */
    getPerformanceInsights(): {
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
}
import EventEmitter from 'events';
import { MCPToolWrapper } from './mcp-wrapper.js';
import { PerformanceOptimizer } from './performance-optimizer.js';
//# sourceMappingURL=core.d.ts.map