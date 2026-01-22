/**
 * Distributed memory system with sharing capabilities
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../core/logger.js';
import type { IEventBus } from '../core/event-bus.js';
import type { MemoryPartition, MemoryEntry, MemoryType, AccessLevel, ConsistencyLevel, AgentId } from '../swarm/types.js';
export interface DistributedMemoryConfig {
    namespace: string;
    distributed: boolean;
    consistency: ConsistencyLevel;
    replicationFactor: number;
    syncInterval: number;
    maxMemorySize: number;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
    backupEnabled: boolean;
    persistenceEnabled: boolean;
    shardingEnabled: boolean;
    cacheSize: number;
    cacheTtl: number;
    backend?: string;
    timeout?: number;
    retryAttempts?: number;
}
export interface MemoryNode {
    id: string;
    address: string;
    port: number;
    status: 'online' | 'offline' | 'syncing' | 'failed';
    lastSeen: Date;
    partitions: string[];
    load: number;
    capacity: number;
}
export interface SyncOperation {
    id: string;
    type: 'create' | 'update' | 'delete' | 'batch';
    partition: string;
    entry?: MemoryEntry;
    entries?: MemoryEntry[];
    timestamp: Date;
    version: number;
    origin: string;
    targets: string[];
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
}
export interface MemoryQuery {
    namespace?: string;
    partition?: string;
    type?: MemoryType;
    tags?: string[];
    owner?: AgentId;
    accessLevel?: AccessLevel;
    createdAfter?: Date;
    updatedAfter?: Date;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface MemoryStatistics {
    totalEntries: number;
    totalSize: number;
    partitionCount: number;
    nodeCount: number;
    replicationHealth: number;
    syncOperations: {
        pending: number;
        completed: number;
        failed: number;
    };
    performance: {
        readLatency: number;
        writeLatency: number;
        syncLatency: number;
        throughput: number;
    };
    utilization: {
        memoryUsage: number;
        diskUsage: number;
        networkUsage: number;
    };
}
/**
 * Distributed memory system for sharing data across swarm agents
 */
export declare class DistributedMemorySystem extends EventEmitter {
    private logger;
    private eventBus;
    private config;
    private partitions;
    private entries;
    private cache;
    private nodes;
    private localNodeId;
    private syncQueue;
    private replicationMap;
    private syncInterval?;
    private vectorClock;
    private conflictResolver?;
    private statistics;
    private operationMetrics;
    constructor(config: Partial<DistributedMemoryConfig>, logger: ILogger, eventBus: IEventBus);
    private setupEventHandlers;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    createPartition(name: string, type: MemoryType, options?: {
        maxSize?: number;
        ttl?: number;
        readOnly?: boolean;
        shared?: boolean;
        indexed?: boolean;
        compressed?: boolean;
    }): Promise<string>;
    deletePartition(partitionId: string): Promise<void>;
    store(key: string, value: any, options?: {
        type?: string;
        tags?: string[];
        owner?: AgentId;
        accessLevel?: AccessLevel;
        partition?: string;
        ttl?: number;
        replicate?: boolean;
    }): Promise<string>;
    retrieve(key: string, options?: {
        partition?: string;
        consistency?: ConsistencyLevel;
        maxAge?: number;
    }): Promise<MemoryEntry | null>;
    update(key: string, value: any, options?: {
        partition?: string;
        merge?: boolean;
        version?: number;
    }): Promise<boolean>;
    deleteEntry(entryId: string): Promise<boolean>;
    query(query: MemoryQuery): Promise<MemoryEntry[]>;
    /**
     * Query entries by type
     */
    queryByType(type: string, namespace?: string): Promise<MemoryEntry[]>;
    private startSynchronization;
    private performSync;
    private processSyncQueue;
    private processValue;
    private mergeValues;
    private compressValue;
    private checkAccess;
    private selectPartition;
    private getPartitionSize;
    private getEntryPartition;
    private updateCache;
    private getCachedEntry;
    private isCacheValid;
    private removeFromCache;
    private evictCache;
    private evictOldEntries;
    private matchesQuery;
    private getNestedProperty;
    private incrementVectorClock;
    private recordMetric;
    private initializeStatistics;
    private updateStatistics;
    private replicateEntry;
    private syncPartitionCreation;
    private syncPartitionDeletion;
    private syncEntryUpdate;
    private syncEntryDeletion;
    private retrieveFromRemote;
    private ensureConsistency;
    private sendHeartbeat;
    private detectAndResolveConflicts;
    private executeSyncOperation;
    private completePendingSyncOperations;
    private loadPersistedData;
    private persistData;
    private handleSyncRequest;
    private handleNodeJoined;
    private handleNodeLeft;
    private handleConflict;
    getStatistics(): MemoryStatistics;
    getPartitions(): MemoryPartition[];
    getNodes(): MemoryNode[];
    backup(): Promise<string>;
    restore(backupData: string): Promise<void>;
    clear(): Promise<void>;
}
//# sourceMappingURL=distributed-memory.d.ts.map