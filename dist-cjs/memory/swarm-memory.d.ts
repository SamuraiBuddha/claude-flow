import { EventEmitter } from 'node:events';
export interface SwarmMemoryEntry {
    id: string;
    agentId: string;
    type: 'knowledge' | 'result' | 'state' | 'communication' | 'error';
    content: any;
    timestamp: Date;
    metadata: {
        taskId?: string;
        objectiveId?: string;
        tags?: string[];
        priority?: number;
        shareLevel?: 'private' | 'team' | 'public';
        originalId?: string;
        sharedFrom?: string;
        sharedTo?: string;
        sharedAt?: Date;
    };
}
export interface SwarmMemoryQuery {
    agentId?: string;
    type?: SwarmMemoryEntry['type'];
    taskId?: string;
    objectiveId?: string;
    tags?: string[];
    since?: Date;
    before?: Date;
    limit?: number;
    shareLevel?: SwarmMemoryEntry['metadata']['shareLevel'];
}
export interface SwarmKnowledgeBase {
    id: string;
    name: string;
    description: string;
    entries: SwarmMemoryEntry[];
    metadata: {
        domain: string;
        expertise: string[];
        contributors: string[];
        lastUpdated: Date;
    };
}
export interface SwarmMemoryConfig {
    namespace: string;
    enableDistribution: boolean;
    enableReplication: boolean;
    syncInterval: number;
    maxEntries: number;
    compressionThreshold: number;
    enableKnowledgeBase: boolean;
    enableCrossAgentSharing: boolean;
    persistencePath: string;
}
export declare class SwarmMemoryManager extends EventEmitter {
    private logger;
    private config;
    private baseMemory;
    private entries;
    private knowledgeBases;
    private agentMemories;
    private syncTimer?;
    private isInitialized;
    constructor(config?: Partial<SwarmMemoryConfig>);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    remember(agentId: string, type: SwarmMemoryEntry['type'], content: any, metadata?: Partial<SwarmMemoryEntry['metadata']>): Promise<string>;
    recall(query: SwarmMemoryQuery): Promise<SwarmMemoryEntry[]>;
    shareMemory(entryId: string, targetAgentId: string): Promise<void>;
    broadcastMemory(entryId: string, agentIds?: string[]): Promise<void>;
    createKnowledgeBase(name: string, description: string, domain: string, expertise: string[]): Promise<string>;
    updateKnowledgeBase(entry: SwarmMemoryEntry): Promise<void>;
    searchKnowledge(query: string, domain?: string, expertise?: string[]): Promise<SwarmMemoryEntry[]>;
    getAgentMemorySnapshot(agentId: string): Promise<{
        totalEntries: number;
        recentEntries: SwarmMemoryEntry[];
        knowledgeContributions: number;
        sharedEntries: number;
    }>;
    private loadMemoryState;
    private saveMemoryState;
    private syncMemoryState;
    private enforceMemoryLimits;
    getMemoryStats(): {
        totalEntries: number;
        entriesByType: Record<string, number>;
        entriesByAgent: Record<string, number>;
        knowledgeBases: number;
        memoryUsage: number;
    };
    exportMemory(agentId?: string): Promise<any>;
    clearMemory(agentId?: string): Promise<void>;
    store(key: string, value: any): Promise<void>;
    search(pattern: string, limit?: number): Promise<any[]>;
}
//# sourceMappingURL=swarm-memory.d.ts.map