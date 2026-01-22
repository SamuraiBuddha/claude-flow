/**
 * Optimized CollectiveMemory class with advanced memory management
 */
export class CollectiveMemory extends EventEmitter<[never]> {
    constructor(config?: {});
    /** @type {import('better-sqlite3').Database | null} */
    db: import("better-sqlite3").Database | null;
    config: {
        swarmId: any;
        maxSize: any;
        dbPath: any;
        compressionThreshold: any;
        gcInterval: any;
        cacheSize: any;
        cacheMemoryMB: any;
        enablePooling: boolean;
        enableAsyncOperations: boolean;
    };
    state: {
        totalSize: number;
        entryCount: number;
        compressionRatio: number;
        lastGC: number;
        accessPatterns: Map<any, any>;
        performanceMetrics: {
            queryTimes: never[];
            avgQueryTime: number;
            cacheHitRate: number;
            memoryEfficiency: number;
        };
    };
    gcTimer: NodeJS.Timeout | null;
    cache: OptimizedLRUCache;
    pools: {
        queryResults: MemoryPool;
        memoryEntries: MemoryPool;
    };
    statements: Map<any, any>;
    backgroundWorker: any;
    /**
     * Initialize collective memory with optimizations
     */
    _initialize(): void;
    /**
     * Prepare optimized SQL statements
     */
    _prepareStatements(): void;
    /**
     * Start optimization timers
     */
    _startOptimizationTimers(): void;
    optimizeTimer: NodeJS.Timeout | undefined;
    cacheTimer: NodeJS.Timeout | undefined;
    metricsTimer: NodeJS.Timeout | undefined;
    /**
     * Initialize background worker for heavy operations
     */
    _initializeBackgroundWorker(): void;
    backgroundQueue: any[] | undefined;
    backgroundProcessing: boolean | undefined;
    /**
     * Store data in collective memory
     */
    store(key: any, value: any, type?: string, metadata?: {}): Promise<{
        success: boolean;
        id: string;
        size: number;
    }>;
    /**
     * Retrieve data from collective memory
     */
    retrieve(key: any): Promise<any>;
    /**
     * Search collective memory
     */
    search(pattern: any, options?: {}): Promise<unknown[]>;
    /**
     * Get related memories using association
     */
    getRelated(key: any, limit?: number): Promise<unknown[]>;
    /**
     * Build associations between memories
     */
    associate(key1: any, key2: any, strength?: number): Promise<void>;
    /**
     * Consolidate similar memories
     */
    consolidate(): Promise<{
        categories: number;
        merged: number;
    }>;
    /**
     * Categorize memory for consolidation
     */
    _categorizeMemory(value: any): string;
    /**
     * Merge similar memories
     */
    _mergeMemories(memories: any): {
        value: {};
        confidence: number;
        sourceCount: any;
    };
    /**
     * Garbage collection
     */
    _garbageCollect(): void;
    /**
     * Check memory limits and evict if necessary
     */
    _checkMemoryLimits(): void;
    /**
     * Optimize database performance
     */
    _optimizeDatabase(): void;
    /**
     * Optimize cache performance
     */
    _optimizeCache(): void;
    /**
     * Update performance metrics
     */
    _updatePerformanceMetrics(): void;
    /**
     * Update memory statistics
     */
    _updateStatistics(): void;
    /**
     * Track access patterns
     */
    _trackAccess(key: any, operation: any): void;
    /**
     * Get enhanced memory statistics
     */
    getStatistics(): {
        swarmId: any;
        entryCount: number;
        totalSize: number;
        maxSize: number;
        utilizationPercent: number;
        avgConfidence: any;
        compressionRatio: number;
        cacheSize: number;
        lastGC: string;
        accessPatterns: number;
        optimization: {
            cacheOptimized: boolean;
            poolingEnabled: boolean;
            asyncOperations: boolean;
            compressionRatio: number;
            performanceMetrics: {
                queryTimes: never[];
                avgQueryTime: number;
                cacheHitRate: number;
                memoryEfficiency: number;
            };
        };
    };
    /**
     * Export memory snapshot
     */
    exportSnapshot(filepath: any): Promise<{
        swarmId: any;
        timestamp: string;
        statistics: {
            swarmId: any;
            entryCount: number;
            totalSize: number;
            maxSize: number;
            utilizationPercent: number;
            avgConfidence: any;
            compressionRatio: number;
            cacheSize: number;
            lastGC: string;
            accessPatterns: number;
            optimization: {
                cacheOptimized: boolean;
                poolingEnabled: boolean;
                asyncOperations: boolean;
                compressionRatio: number;
                performanceMetrics: {
                    queryTimes: never[];
                    avgQueryTime: number;
                    cacheHitRate: number;
                    memoryEfficiency: number;
                };
            };
        };
        memories: any[];
    }>;
    /**
     * Import memory snapshot
     */
    importSnapshot(snapshot: any): Promise<{
        imported: number;
    }>;
    /**
     * Enhanced shutdown with cleanup
     */
    close(): void;
    /**
     * Get comprehensive memory analytics
     */
    getAnalytics(): {
        basic: {
            swarmId: any;
            entryCount: number;
            totalSize: number;
            maxSize: number;
            utilizationPercent: number;
            avgConfidence: any;
            compressionRatio: number;
            cacheSize: number;
            lastGC: string;
            accessPatterns: number;
            optimization: {
                cacheOptimized: boolean;
                poolingEnabled: boolean;
                asyncOperations: boolean;
                compressionRatio: number;
                performanceMetrics: {
                    queryTimes: never[];
                    avgQueryTime: number;
                    cacheHitRate: number;
                    memoryEfficiency: number;
                };
            };
        };
        performance: {
            queryTimes: never[];
            avgQueryTime: number;
            cacheHitRate: number;
            memoryEfficiency: number;
        };
        cache: {};
        pools: {
            queryResults: {
                poolSize: number;
                allocated: number;
                reused: number;
                reuseRate: number;
            };
            memoryEntries: {
                poolSize: number;
                allocated: number;
                reused: number;
                reuseRate: number;
            };
        } | null;
        database: {
            fragmentation: unknown;
            pageSize: unknown;
            cacheSize: unknown;
        };
    };
    /**
     * Memory health check
     */
    healthCheck(): Promise<{
        status: string;
        issues: never[];
        recommendations: never[];
    }>;
}
/**
 * Memory optimization utilities
 */
export class MemoryOptimizer {
    static optimizeCollectiveMemory(memory: any): Promise<{
        duration: number;
        analytics: any;
        health: any;
    }>;
    static calculateOptimalCacheSize(memoryStats: any, accessPatterns: any): {
        entries: number;
        memoryMB: number;
        efficiency: number;
    };
    static generateOptimizationReport(analytics: any): {
        timestamp: string;
        summary: {};
        recommendations: never[];
        metrics: any;
    };
}
import EventEmitter from 'events';
/**
 * Optimized LRU Cache with memory pressure handling
 */
declare class OptimizedLRUCache {
    constructor(maxSize?: number, maxMemoryMB?: number);
    maxSize: number;
    maxMemory: number;
    cache: Map<any, any>;
    currentMemory: number;
    hits: number;
    misses: number;
    evictions: number;
    get(key: any): any;
    set(key: any, data: any): void;
    _estimateSize(obj: any): number;
    _evictLRU(): void;
    _evictByMemoryPressure(neededSize: any): void;
    forEach(callback: any): void;
    delete(key: any): boolean;
    getStats(): {
        size: number;
        memoryUsage: number;
        hitRate: number;
        evictions: number;
    };
}
/**
 * Memory Pool for object reuse
 */
declare class MemoryPool {
    constructor(createFn: any, resetFn: any, maxSize?: number);
    createFn: any;
    resetFn: any;
    maxSize: number;
    pool: any[];
    allocated: number;
    reused: number;
    acquire(): any;
    release(obj: any): void;
    getStats(): {
        poolSize: number;
        allocated: number;
        reused: number;
        reuseRate: number;
    };
}
export {};
//# sourceMappingURL=memory.d.ts.map