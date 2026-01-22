/**
 * Agent System Index - Central exports and agent factory
 */
export { BaseAgent } from './base-agent.js';
export { ResearcherAgent, createResearcherAgent } from './researcher.js';
export { CoderAgent, createCoderAgent } from './coder.js';
export { AnalystAgent, createAnalystAgent } from './analyst.js';
export { ArchitectAgent, createArchitectAgent } from './architect.js';
export { TesterAgent, createTesterAgent } from './tester.js';
export { CoordinatorAgent, createCoordinatorAgent } from './coordinator.js';
export { AgentCapabilitySystem } from './capabilities.js';
export { AgentManager } from '../../agents/agent-manager.js';
export { AgentRegistry } from '../../agents/agent-registry.js';
export type { AgentState } from './base-agent.js';
export type { CapabilityMatch, TaskRequirements, CapabilityRegistry } from './capabilities.js';
import type { AgentType, AgentConfig, AgentEnvironment } from '../../swarm/types.js';
import type { ILogger } from '../../core/logger.js';
import type { IEventBus } from '../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../memory/distributed-memory.js';
import { BaseAgent } from './base-agent.js';
export interface AgentFactoryConfig {
    logger: ILogger;
    eventBus: IEventBus;
    memory: DistributedMemorySystem;
}
/**
 * Agent Factory - Creates specialized agents based on type
 */
export declare class AgentFactory {
    private logger;
    private eventBus;
    private memory;
    private agentCounter;
    constructor(config: AgentFactoryConfig);
    /**
     * Create an agent of the specified type
     */
    createAgent(type: AgentType, config?: Partial<AgentConfig>, environment?: Partial<AgentEnvironment>, customId?: string): BaseAgent;
    /**
     * Create multiple agents of different types
     */
    createAgents(specs: Array<{
        type: AgentType;
        count?: number;
        config?: Partial<AgentConfig>;
        environment?: Partial<AgentEnvironment>;
    }>): BaseAgent[];
    /**
     * Create a balanced swarm of agents
     */
    createBalancedSwarm(size?: number, strategy?: 'research' | 'development' | 'analysis' | 'balanced'): BaseAgent[];
    /**
     * Get supported agent types
     */
    getSupportedTypes(): AgentType[];
    /**
     * Get agent type descriptions
     */
    getAgentTypeDescriptions(): Record<AgentType, string>;
    /**
     * Generate unique agent ID
     */
    private generateAgentId;
}
/**
 * Create default agent factory instance
 */
export declare function createAgentFactory(logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem): AgentFactory;
/**
 * Agent lifecycle management utilities
 */
export declare class AgentLifecycle {
    private agents;
    private logger;
    constructor(logger: ILogger);
    /**
     * Register an agent for lifecycle management
     */
    register(agent: BaseAgent): void;
    /**
     * Initialize all registered agents
     */
    initializeAll(): Promise<void>;
    /**
     * Shutdown all registered agents
     */
    shutdownAll(): Promise<void>;
    /**
     * Get agent by ID
     */
    getAgent(agentId: string): BaseAgent | undefined;
    /**
     * Get all registered agents
     */
    getAllAgents(): BaseAgent[];
    /**
     * Get agents by type
     */
    getAgentsByType(type: AgentType): BaseAgent[];
    /**
     * Get agent statistics
     */
    getStatistics(): {
        total: number;
        byType: Record<AgentType, number>;
        byStatus: Record<string, number>;
        healthy: number;
        active: number;
    };
}
//# sourceMappingURL=index.d.ts.map