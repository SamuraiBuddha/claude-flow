/**
 * Agent Registry with Memory Integration
 * Provides persistent storage and coordination for agent management
 */
import type { DistributedMemorySystem } from '../memory/distributed-memory.js';
import type { AgentState, AgentType, AgentStatus } from '../swarm/types.js';
import { EventEmitter } from 'node:events';
export interface AgentRegistryEntry {
    agent: AgentState;
    createdAt: Date;
    lastUpdated: Date;
    tags: string[];
    metadata: Record<string, any>;
}
export interface AgentQuery {
    type?: AgentType;
    status?: AgentStatus;
    tags?: string[];
    healthThreshold?: number;
    namePattern?: string;
    createdAfter?: Date;
    lastActiveAfter?: Date;
}
export interface AgentStatistics {
    totalAgents: number;
    byType: Record<AgentType, number>;
    byStatus: Record<AgentStatus, number>;
    averageHealth: number;
    activeAgents: number;
    totalUptime: number;
    tasksCompleted: number;
    successRate: number;
}
/**
 * Centralized agent registry with persistent storage
 */
export declare class AgentRegistry extends EventEmitter {
    private memory;
    private namespace;
    private cache;
    private cacheExpiry;
    private lastCacheUpdate;
    constructor(memory: DistributedMemorySystem, namespace?: string);
    initialize(): Promise<void>;
    /**
     * Register a new agent in the registry
     */
    registerAgent(agent: AgentState, tags?: string[]): Promise<void>;
    /**
     * Update agent information in registry
     */
    updateAgent(agentId: string, updates: Partial<AgentState>): Promise<void>;
    /**
     * Remove agent from registry
     */
    unregisterAgent(agentId: string, preserveHistory?: boolean): Promise<void>;
    /**
     * Get agent by ID
     */
    getAgent(agentId: string): Promise<AgentState | null>;
    /**
     * Get agent entry with metadata
     */
    getAgentEntry(agentId: string): Promise<AgentRegistryEntry | null>;
    /**
     * Query agents by criteria
     */
    queryAgents(query?: AgentQuery): Promise<AgentState[]>;
    /**
     * Get all registered agents
     */
    getAllAgents(): Promise<AgentState[]>;
    /**
     * Get agents by type
     */
    getAgentsByType(type: AgentType): Promise<AgentState[]>;
    /**
     * Get agents by status
     */
    getAgentsByStatus(status: AgentStatus): Promise<AgentState[]>;
    /**
     * Get healthy agents
     */
    getHealthyAgents(threshold?: number): Promise<AgentState[]>;
    /**
     * Get registry statistics
     */
    getStatistics(): Promise<AgentStatistics>;
    /**
     * Search agents by capabilities
     */
    searchByCapabilities(requiredCapabilities: string[]): Promise<AgentState[]>;
    /**
     * Find best agent for task
     */
    findBestAgent(taskType: string, requiredCapabilities?: string[], preferredAgent?: string): Promise<AgentState | null>;
    /**
     * Store agent coordination data
     */
    storeCoordinationData(agentId: string, data: any): Promise<void>;
    /**
     * Retrieve agent coordination data
     */
    getCoordinationData(agentId: string): Promise<any>;
    private loadFromMemory;
    private refreshCacheIfNeeded;
    private isCacheValid;
    private getAgentKey;
    private getArchiveKey;
    private calculateAgentScore;
}
//# sourceMappingURL=agent-registry.d.ts.map