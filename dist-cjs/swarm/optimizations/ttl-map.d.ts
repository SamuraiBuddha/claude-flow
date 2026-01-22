/**
 * TTL Map Implementation
 * Map with time-to-live for automatic entry expiration
 */
export interface TTLMapOptions {
    defaultTTL?: number;
    cleanupInterval?: number;
    maxSize?: number;
    onExpire?: <K, V>(key: K, value: V) => void;
}
export declare class TTLMap<K, V> {
    private items;
    private cleanupTimer?;
    private defaultTTL;
    private cleanupInterval;
    private maxSize?;
    private onExpire?;
    private stats;
    constructor(options?: TTLMapOptions);
    set(key: K, value: V, ttl?: number): void;
    get(key: K): V | undefined;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    /**
     * Update TTL for an existing key
     */
    touch(key: K, ttl?: number): boolean;
    /**
     * Get remaining TTL for a key
     */
    getTTL(key: K): number;
    /**
     * Get all keys (excluding expired ones)
     */
    keys(): K[];
    /**
     * Get all values (excluding expired ones)
     */
    values(): V[];
    /**
     * Get all entries (excluding expired ones)
     */
    entries(): Array<[K, V]>;
    /**
     * Get size (excluding expired items)
     */
    get size(): number;
    private startCleanup;
    private cleanup;
    private evictLRU;
    /**
     * Stop the cleanup timer
     */
    destroy(): void;
    /**
     * Get statistics about the map
     */
    getStats(): {
        size: number;
        hitRate: number;
        hits: number;
        misses: number;
        evictions: number;
        expirations: number;
    };
    /**
     * Get detailed information about all items
     */
    inspect(): Map<K, {
        value: V;
        ttl: number;
        age: number;
        accessCount: number;
        lastAccessed: number;
    }>;
}
//# sourceMappingURL=ttl-map.d.ts.map