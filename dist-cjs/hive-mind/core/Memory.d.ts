/**
 * Memory Class
 *
 * Manages collective memory for the Hive Mind swarm,
 * providing persistent storage, retrieval, and learning capabilities.
 */
import { EventEmitter } from 'events';
import { MemoryEntry, MemoryStats, MemorySearchOptions, MemoryPattern } from '../types.js';
export declare class Memory extends EventEmitter {
    private swarmId;
    private db;
    private mcpWrapper;
    private cache;
    private namespaces;
    private accessPatterns;
    private performanceMetrics;
    private objectPools;
    private isActive;
    private optimizationTimers;
    private compressionThreshold;
    private batchSize;
    constructor(swarmId: string, options?: {
        cacheSize?: number;
        cacheMemoryMB?: number;
        enablePooling?: boolean;
        compressionThreshold?: number;
        batchSize?: number;
    });
    /**
     * Initialize optimized memory system
     */
    initialize(): Promise<void>;
    /**
     * Initialize object pools for better memory management
     */
    private initializeObjectPools;
    /**
     * Optimize database settings for better performance
     */
    private optimizeDatabaseSettings;
    /**
     * Optimized store method with compression and batching
     */
    store(key: string, value: any, namespace?: string, ttl?: number): Promise<void>;
    /**
     * Batch store operation for high-throughput scenarios
     */
    storeBatch(entries: Array<{
        key: string;
        value: any;
        namespace?: string;
        ttl?: number;
    }>): Promise<void>;
    /**
     * High-performance retrieve method with intelligent caching
     */
    retrieve(key: string, namespace?: string): Promise<any>;
    /**
     * Batch retrieve for multiple keys with optimized database queries
     */
    retrieveBatch(keys: string[], namespace?: string): Promise<Map<string, any>>;
    /**
     * High-performance search with relevance scoring and caching
     */
    search(options: MemorySearchOptions): Promise<MemoryEntry[]>;
    /**
     * Generate cache key for search options
     */
    private generateSearchKey;
    /**
     * Search within cache for immediate results
     */
    private searchInCache;
    /**
     * Delete a memory entry
     */
    delete(key: string, namespace?: string): Promise<void>;
    /**
     * List all entries in a namespace
     */
    list(namespace?: string, limit?: number): Promise<MemoryEntry[]>;
    /**
     * Get memory statistics
     */
    getStats(): Promise<MemoryStats>;
    /**
     * Learn patterns from memory access
     */
    learnPatterns(): Promise<MemoryPattern[]>;
    /**
     * Predict next memory access
     */
    predictNextAccess(currentKey: string): Promise<string[]>;
    /**
     * Compress memory entries
     */
    compress(namespace?: string): Promise<void>;
    /**
     * Backup memory to external storage
     */
    backup(path: string): Promise<void>;
    /**
     * Restore memory from backup
     */
    restore(backupId: string): Promise<void>;
    /**
     * Initialize default namespaces
     */
    private initializeNamespaces;
    /**
     * Load memory from database
     */
    private loadMemoryFromDatabase;
    /**
     * Start optimized memory managers
     */
    private startOptimizedManagers;
    /**
     * Optimize cache performance
     */
    private optimizeCache;
    /**
     * Perform comprehensive memory cleanup
     */
    private performMemoryCleanup;
    /**
     * Analyze access patterns for optimization insights
     */
    private analyzeAccessPatterns;
    /**
     * Start pattern analyzer
     */
    private startPatternAnalyzer;
    /**
     * Start memory optimizer
     */
    private startMemoryOptimizer;
    /**
     * Enhanced helper methods with performance optimizations
     */
    private getCacheKey;
    /**
     * Compress data for storage efficiency
     */
    private compressData;
    /**
     * Decompress data
     */
    private decompressData;
    /**
     * Record performance metrics
     */
    private recordPerformance;
    /**
     * Update access patterns with intelligent tracking
     */
    private updateAccessPattern;
    /**
     * Update performance metrics dashboard
     */
    private updatePerformanceMetrics;
    /**
     * Optimize object pools
     */
    private optimizeObjectPools;
    /**
     * Clean up old access patterns
     */
    private cleanupAccessPatterns;
    private parseValue;
    private updateAccessStats;
    private updateNamespaceStats;
    private matchesSearch;
    private sortByRelevance;
    private calculateCacheHitRate;
    private calculateAvgAccessTime;
    private getHotKeys;
    private identifyCoAccessPatterns;
    private shouldCompress;
    private compressEntry;
    private evictExpiredEntries;
    private manageCacheSize;
    private compressOldEntries;
    private optimizeNamespaces;
    /**
     * Enhanced shutdown with comprehensive cleanup
     */
    shutdown(): Promise<void>;
    /**
     * Get comprehensive analytics
     */
    getAdvancedAnalytics(): {
        basic: Promise<MemoryStats>;
        cache: {
            size: number;
            memoryUsage: number;
            hitRate: number;
            evictions: number;
            utilizationPercent: number;
        };
        performance: {
            [k: string]: {
                avg: number;
                count: number;
                max: number;
                min: number;
            };
        };
        pools: {
            [k: string]: {
                poolSize: number;
                allocated: number;
                reused: number;
                reuseRate: number;
            };
        };
        accessPatterns: {
            total: number;
            hotKeys: {
                key: string;
                count: number;
            }[];
        };
    };
    /**
     * Memory health check with detailed analysis
     */
    healthCheck(): Promise<{
        status: "healthy" | "warning" | "critical";
        score: number;
        issues: string[];
        recommendations: string[];
    }>;
}
//# sourceMappingURL=Memory.d.ts.map