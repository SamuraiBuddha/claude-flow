/**
 * Distributed Memory System with Cross-Agent Sharing
 */
import { EventEmitter } from 'node:events';
import { MemoryEntry, MemoryPartition, AccessLevel, ConsistencyLevel, MemoryType, AgentId } from './types.js';
export interface MemoryQuery {
    namespace?: string;
    partition?: string;
    key?: string;
    tags?: string[];
    type?: MemoryType;
    owner?: AgentId;
    accessLevel?: AccessLevel;
    createdAfter?: Date;
    createdBefore?: Date;
    expiresAfter?: Date;
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'updatedAt' | 'key' | 'relevance';
    sortOrder?: 'asc' | 'desc';
}
export interface MemorySearchOptions {
    query: string;
    searchFields?: string[];
    fuzzyMatch?: boolean;
    maxResults?: number;
    threshold?: number;
    includeContent?: boolean;
}
export interface MemoryStatistics {
    totalEntries: number;
    totalSize: number;
    partitionCount: number;
    entriesByType: Record<MemoryType, number>;
    entriesByAccess: Record<AccessLevel, number>;
    averageSize: number;
    oldestEntry: Date;
    newestEntry: Date;
    expiringEntries: number;
}
export interface MemoryBackup {
    timestamp: Date;
    version: string;
    checksum: string;
    metadata: Record<string, any>;
    entries: MemoryEntry[];
    partitions: MemoryPartition[];
}
export interface MemoryConfig {
    namespace: string;
    persistencePath: string;
    maxMemorySize: number;
    maxEntrySize: number;
    defaultTtl: number;
    enableCompression: boolean;
    enableEncryption: boolean;
    encryptionKey?: string;
    consistencyLevel: ConsistencyLevel;
    syncInterval: number;
    backupInterval: number;
    maxBackups: number;
    enableDistribution: boolean;
    distributionNodes: string[];
    replicationFactor: number;
    enableCaching: boolean;
    cacheSize: number;
    cacheTtl: number;
}
export declare class SwarmMemoryManager extends EventEmitter {
    private logger;
    private config;
    private memory;
    private partitions;
    private entries;
    private index;
    private cache;
    private replication;
    private persistence;
    private encryption;
    private isInitialized;
    private syncTimer?;
    private backupTimer?;
    private cleanupTimer?;
    constructor(config?: Partial<MemoryConfig & {
        logging?: any;
    }>);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    store(key: string, value: any, options?: Partial<{
        partition: string;
        type: MemoryType;
        tags: string[];
        owner: AgentId;
        accessLevel: AccessLevel;
        ttl: number;
        metadata: Record<string, any>;
    }>): Promise<string>;
    retrieve(key: string, options?: Partial<{
        partition: string;
        requester: AgentId;
        includeMetadata: boolean;
    }>): Promise<any>;
    update(key: string, value: any, options?: Partial<{
        partition: string;
        updater: AgentId;
        metadata: Record<string, any>;
        incrementVersion: boolean;
    }>): Promise<boolean>;
    delete(key: string, options?: Partial<{
        partition: string;
        deleter: AgentId;
        force: boolean;
    }>): Promise<boolean>;
    query(query: MemoryQuery): Promise<MemoryEntry[]>;
    search(options: MemorySearchOptions): Promise<MemoryEntry[]>;
    shareMemory(key: string, targetAgent: AgentId, options?: Partial<{
        partition: string;
        sharer: AgentId;
        accessLevel: AccessLevel;
        expiresAt: Date;
    }>): Promise<string>;
    broadcastMemory(key: string, targetAgents: AgentId[], options?: Partial<{
        partition: string;
        broadcaster: AgentId;
        accessLevel: AccessLevel;
    }>): Promise<string[]>;
    synchronizeWith(targetNode: string, options?: Partial<{
        partition: string;
        direction: 'pull' | 'push' | 'bidirectional';
        filter: MemoryQuery;
    }>): Promise<void>;
    createPartition(name: string, options?: Partial<{
        type: MemoryType;
        maxSize: number;
        ttl: number;
        readOnly: boolean;
        shared: boolean;
        indexed: boolean;
        compressed: boolean;
    }>, skipInitCheck?: boolean): Promise<string>;
    deletePartition(name: string, force?: boolean): Promise<boolean>;
    getPartition(name: string): MemoryPartition | undefined;
    getPartitions(): MemoryPartition[];
    createBackup(): Promise<string>;
    restoreFromBackup(backupId: string): Promise<void>;
    getStatistics(): MemoryStatistics;
    exportMemory(options?: Partial<{
        format: 'json' | 'csv';
        includeExpired: boolean;
        filter: MemoryQuery;
    }>): Promise<string>;
    private ensureInitialized;
    private findEntry;
    private deleteEntry;
    private isExpired;
    private validateAccess;
    private getOrCreatePartition;
    private serializeValue;
    private deserializeValue;
    private calculateEntrySize;
    private enforceMemoryLimits;
    private cleanupExpiredEntries;
    private evictOldEntries;
    private calculateChecksum;
    private entriesToCSV;
    private loadMemoryState;
    private saveMemoryState;
    private createDefaultPartitions;
    private mergeWithDefaults;
    private startBackgroundProcesses;
    private stopBackgroundProcesses;
    private performSync;
    private setupEventHandlers;
}
export default SwarmMemoryManager;
//# sourceMappingURL=memory.d.ts.map