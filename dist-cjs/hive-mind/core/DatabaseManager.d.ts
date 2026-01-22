/**
 * DatabaseManager Class
 *
 * Manages all database operations for the Hive Mind system
 * using SQLite as the persistence layer.
 */
import { EventEmitter } from 'events';
export declare class DatabaseManager extends EventEmitter {
    private static instance;
    private db;
    private statements;
    private dbPath;
    private isInMemory;
    private memoryStore;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): Promise<DatabaseManager>;
    /**
     * Initialize database
     */
    initialize(): Promise<void>;
    /**
     * Initialize in-memory fallback
     */
    private initializeInMemoryFallback;
    /**
     * Load database schema
     */
    private loadSchema;
    /**
     * Prepare common SQL statements
     */
    private prepareStatements;
    /**
     * Raw SQL helper for complex updates
     */
    raw(sql: string): any;
    createSwarm(data: any): Promise<void>;
    getSwarm(id: string): Promise<any>;
    getActiveSwarmId(): Promise<string | null>;
    setActiveSwarm(id: string): Promise<void>;
    getAllSwarms(): Promise<any[]>;
    createAgent(data: any): Promise<void>;
    getAgent(id: string): Promise<any>;
    getAgents(swarmId: string): Promise<any[]>;
    updateAgent(id: string, updates: any): Promise<void>;
    updateAgentStatus(id: string, status: string): Promise<void>;
    getAgentPerformance(agentId: string): Promise<any>;
    createTask(data: any): Promise<void>;
    getTask(id: string): Promise<any>;
    getTasks(swarmId: string): Promise<any[]>;
    updateTask(id: string, updates: any): Promise<void>;
    updateTaskStatus(id: string, status: string): Promise<void>;
    getPendingTasks(swarmId: string): Promise<any[]>;
    getActiveTasks(swarmId: string): Promise<any[]>;
    reassignTask(taskId: string, newAgentId: string): Promise<void>;
    storeMemory(data: any): Promise<void>;
    getMemory(key: string, namespace: string): Promise<any>;
    updateMemoryAccess(key: string, namespace: string): Promise<void>;
    searchMemory(options: any): Promise<any[]>;
    deleteMemory(key: string, namespace: string): Promise<void>;
    listMemory(namespace: string, limit: number): Promise<any[]>;
    getMemoryStats(): Promise<any>;
    getNamespaceStats(namespace: string): Promise<any>;
    getAllMemoryEntries(): Promise<any[]>;
    getRecentMemoryEntries(limit: number): Promise<any[]>;
    getOldMemoryEntries(daysOld: number): Promise<any[]>;
    updateMemoryEntry(entry: any): Promise<void>;
    clearMemory(swarmId: string): Promise<void>;
    deleteOldEntries(namespace: string, ttl: number): Promise<void>;
    trimNamespace(namespace: string, maxEntries: number): Promise<void>;
    createCommunication(data: any): Promise<void>;
    getPendingMessages(agentId: string): Promise<any[]>;
    markMessageDelivered(messageId: string): Promise<void>;
    markMessageRead(messageId: string): Promise<void>;
    getRecentMessages(swarmId: string, timeWindow: number): Promise<any[]>;
    getConsensusProposal(id: string): Promise<any>;
    updateConsensusStatus(id: string, status: string): Promise<void>;
    getRecentConsensusProposals(swarmId: string, limit?: number): Promise<any[]>;
    createConsensusProposal(proposal: any): Promise<void>;
    submitConsensusVote(proposalId: string, agentId: string, vote: boolean, reason?: string): Promise<void>;
    storePerformanceMetric(data: any): Promise<void>;
    getSwarmStats(swarmId: string): Promise<any>;
    getStrategyPerformance(swarmId: string): Promise<any>;
    getSuccessfulDecisions(swarmId: string): Promise<any[]>;
    deleteMemoryEntry(key: string, namespace: string): Promise<void>;
    /**
     * Get database analytics
     */
    getDatabaseAnalytics(): any;
    /**
     * Record performance metric
     */
    private recordPerformance;
    /**
     * Check database health
     */
    healthCheck(): Promise<{
        healthy: boolean;
        details: Record<string, any>;
    }>;
    /**
     * Close database connection
     */
    close(): void;
}
//# sourceMappingURL=DatabaseManager.d.ts.map