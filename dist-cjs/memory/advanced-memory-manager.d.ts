/**
 * Advanced Memory Management System with comprehensive capabilities
 * Includes indexing, compression, cross-agent sharing, and intelligent cleanup
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../core/logger.js';
export interface MemoryEntry {
    id: string;
    key: string;
    value: any;
    type: string;
    namespace: string;
    tags: string[];
    metadata: Record<string, any>;
    owner: string;
    accessLevel: 'private' | 'shared' | 'public';
    createdAt: Date;
    updatedAt: Date;
    lastAccessedAt: Date;
    expiresAt?: Date;
    version: number;
    size: number;
    compressed: boolean;
    checksum: string;
    references: string[];
    dependencies: string[];
}
export interface MemoryIndex {
    keys: Map<string, string[]>;
    tags: Map<string, string[]>;
    types: Map<string, string[]>;
    namespaces: Map<string, string[]>;
    owners: Map<string, string[]>;
    fullText: Map<string, string[]>;
}
export interface QueryOptions {
    namespace?: string;
    type?: string;
    tags?: string[];
    owner?: string;
    accessLevel?: 'private' | 'shared' | 'public';
    keyPattern?: string;
    valueSearch?: string;
    fullTextSearch?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    updatedAfter?: Date;
    updatedBefore?: Date;
    lastAccessedAfter?: Date;
    lastAccessedBefore?: Date;
    sizeGreaterThan?: number;
    sizeLessThan?: number;
    includeExpired?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'key' | 'createdAt' | 'updatedAt' | 'lastAccessedAt' | 'size' | 'type';
    sortOrder?: 'asc' | 'desc';
    aggregateBy?: 'namespace' | 'type' | 'owner' | 'tags';
    includeMetadata?: boolean;
}
export interface ExportOptions {
    format: 'json' | 'csv' | 'xml' | 'yaml';
    namespace?: string;
    type?: string;
    includeMetadata?: boolean;
    compression?: boolean;
    encryption?: {
        enabled: boolean;
        algorithm?: string;
        key?: string;
    };
    filtering?: QueryOptions;
}
export interface ImportOptions {
    format: 'json' | 'csv' | 'xml' | 'yaml';
    namespace?: string;
    conflictResolution: 'overwrite' | 'skip' | 'merge' | 'rename';
    validation?: boolean;
    transformation?: {
        keyMapping?: Record<string, string>;
        valueTransformation?: (value: any) => any;
        metadataExtraction?: (entry: any) => Record<string, any>;
    };
    dryRun?: boolean;
}
export interface MemoryStatistics {
    overview: {
        totalEntries: number;
        totalSize: number;
        compressedEntries: number;
        compressionRatio: number;
        indexSize: number;
        memoryUsage: number;
        diskUsage: number;
    };
    distribution: {
        byNamespace: Record<string, {
            count: number;
            size: number;
        }>;
        byType: Record<string, {
            count: number;
            size: number;
        }>;
        byOwner: Record<string, {
            count: number;
            size: number;
        }>;
        byAccessLevel: Record<string, {
            count: number;
            size: number;
        }>;
    };
    temporal: {
        entriesCreatedLast24h: number;
        entriesUpdatedLast24h: number;
        entriesAccessedLast24h: number;
        oldestEntry?: Date;
        newestEntry?: Date;
    };
    performance: {
        averageQueryTime: number;
        averageWriteTime: number;
        cacheHitRatio: number;
        indexEfficiency: number;
    };
    health: {
        expiredEntries: number;
        orphanedReferences: number;
        duplicateKeys: number;
        corruptedEntries: number;
        recommendedCleanup: boolean;
    };
    optimization: {
        suggestions: string[];
        potentialSavings: {
            compression: number;
            cleanup: number;
            deduplication: number;
        };
        indexOptimization: string[];
    };
}
export interface CleanupOptions {
    dryRun?: boolean;
    removeExpired?: boolean;
    removeOlderThan?: number;
    removeUnaccessed?: number;
    removeOrphaned?: boolean;
    removeDuplicates?: boolean;
    compressEligible?: boolean;
    archiveOld?: {
        enabled: boolean;
        olderThan: number;
        archivePath: string;
    };
    retentionPolicies?: {
        namespace: string;
        maxAge?: number;
        maxCount?: number;
        sizeLimit?: number;
    }[];
}
export interface RetentionPolicy {
    id: string;
    name: string;
    namespace?: string;
    type?: string;
    tags?: string[];
    maxAge?: number;
    maxCount?: number;
    sizeLimit?: number;
    priority: number;
    enabled: boolean;
}
export declare class AdvancedMemoryManager extends EventEmitter {
    private readonly dataPath;
    private readonly indexPath;
    private readonly backupPath;
    private readonly archivePath;
    private entries;
    private index;
    private cache;
    private retentionPolicies;
    private logger;
    private config;
    private statistics;
    private operationMetrics;
    private cleanupInterval?;
    constructor(config: Partial<typeof AdvancedMemoryManager.prototype.config> | undefined, logger: ILogger);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    store(key: string, value: any, options?: {
        namespace?: string;
        type?: string;
        tags?: string[];
        metadata?: Record<string, any>;
        owner?: string;
        accessLevel?: 'private' | 'shared' | 'public';
        ttl?: number;
        compress?: boolean;
    }): Promise<string>;
    retrieve(key: string, options?: {
        namespace?: string;
        updateLastAccessed?: boolean;
    }): Promise<MemoryEntry | null>;
    update(key: string, value: any, options?: {
        namespace?: string;
        merge?: boolean;
        updateMetadata?: Record<string, any>;
    }): Promise<boolean>;
    deleteEntry(entryId: string): Promise<boolean>;
    query(options?: QueryOptions): Promise<{
        entries: MemoryEntry[];
        total: number;
        aggregations?: Record<string, any>;
    }>;
    export(filePath: string, options: ExportOptions): Promise<{
        entriesExported: number;
        fileSize: number;
        checksum: string;
    }>;
    import(filePath: string, options: ImportOptions): Promise<{
        entriesImported: number;
        entriesSkipped: number;
        entriesUpdated: number;
        conflicts: string[];
    }>;
    getStatistics(): Promise<MemoryStatistics>;
    cleanup(options?: CleanupOptions): Promise<{
        entriesRemoved: number;
        entriesArchived: number;
        entriesCompressed: number;
        spaceSaved: number;
        actions: string[];
    }>;
    private createEmptyIndex;
    private processValue;
    private compressValue;
    private decompressValue;
    private calculateSize;
    private calculateChecksum;
    private inferType;
    private findEntryByKey;
    private updateIndex;
    private addToIndex;
    private removeFromIndex;
    private extractWords;
    private updateCache;
    private evictCache;
    private recordMetric;
    private initializeStatistics;
    private queryWithIndex;
    private matchesQuery;
    private getPropertyValue;
    private generateAggregations;
    private aggregateByProperty;
    private aggregateByTags;
    private prepareJsonExport;
    private prepareCsvExport;
    private prepareXmlExport;
    private prepareYamlExport;
    private escapeXml;
    private parseJsonImport;
    private parseCsvImport;
    private parseXmlImport;
    private parseYamlImport;
    private validateImportData;
    private transformImportData;
    private importSingleEntry;
    private calculateStatistics;
    private calculateDistribution;
    private calculateIndexSize;
    private calculatePerformanceMetrics;
    private calculateHealthMetrics;
    private generateOptimizationSuggestions;
    private findDuplicateKeys;
    private applyRetentionPolicies;
    private policyMatches;
    private enforceRetentionPolicy;
    private applyRetentionPolicy;
    private cleanupOrphanedReferences;
    private removeDuplicateEntries;
    private archiveEntries;
    private rebuildIndex;
    private startAutoCleanup;
    private loadPersistedData;
    private persistData;
    private createBackup;
    private cleanOldBackups;
    private compressData;
    private encryptData;
    listNamespaces(): Promise<string[]>;
    listTypes(): Promise<string[]>;
    listTags(): Promise<string[]>;
    getEntryById(id: string): Promise<MemoryEntry | null>;
    exists(key: string, namespace?: string): Promise<boolean>;
    count(options?: Partial<QueryOptions>): Promise<number>;
    clear(namespace?: string): Promise<number>;
    getConfiguration(): typeof this.config;
    updateConfiguration(updates: Partial<typeof this.config>): Promise<void>;
}
//# sourceMappingURL=advanced-memory-manager.d.ts.map