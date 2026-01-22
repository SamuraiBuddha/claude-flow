/**
 * Hive Mind Agent Templates
 * Specialized agents for the Hive Mind swarm system
 */
import { BaseAgent } from './base-agent.js';
import type { AgentCapabilities, AgentConfig, TaskDefinition } from '../../swarm/types.js';
export interface HiveAgentConfig {
    type: 'queen' | 'worker' | 'scout' | 'guardian' | 'architect';
    specialization?: string;
    consensusWeight?: number;
    knowledgeDomains?: string[];
}
/**
 * Queen Agent - Orchestrator and decision maker
 */
export declare class QueenAgent extends BaseAgent {
    constructor(id: string, config: AgentConfig, environment: any, logger: any, eventBus: any, memory: any);
    protected getDefaultCapabilities(): AgentCapabilities;
    protected getDefaultConfig(): Partial<AgentConfig>;
    executeTask(task: TaskDefinition): Promise<any>;
    getSystemPrompt(): string;
    analyzeObjective(objective: string): Promise<any>;
}
/**
 * Worker Agent - Implementation and execution
 */
export declare class WorkerAgent extends BaseAgent {
    private specialization;
    constructor(id: string, config: AgentConfig, environment: any, logger: any, eventBus: any, memory: any, specialization?: string);
    protected getDefaultCapabilities(): AgentCapabilities;
    protected getDefaultConfig(): Partial<AgentConfig>;
    executeTask(task: TaskDefinition): Promise<any>;
    getSystemPrompt(): string;
    estimateEffort(task: any): Promise<number>;
}
/**
 * Scout Agent - Research and exploration
 */
export declare class ScoutAgent extends BaseAgent {
    constructor(id: string, config: AgentConfig, environment: any, logger: any, eventBus: any, memory: any);
    protected getDefaultCapabilities(): AgentCapabilities;
    protected getDefaultConfig(): Partial<AgentConfig>;
    executeTask(task: TaskDefinition): Promise<any>;
    getSystemPrompt(): string;
    scout(topic: string): Promise<any>;
}
/**
 * Guardian Agent - Quality and validation
 */
export declare class GuardianAgent extends BaseAgent {
    constructor(id: string, config: AgentConfig, environment: any, logger: any, eventBus: any, memory: any);
    protected getDefaultCapabilities(): AgentCapabilities;
    protected getDefaultConfig(): Partial<AgentConfig>;
    executeTask(task: TaskDefinition): Promise<any>;
    getSystemPrompt(): string;
    validateWork(work: any): Promise<any>;
}
/**
 * Architect Agent - System design and planning
 */
export declare class ArchitectAgent extends BaseAgent {
    constructor(id: string, config: AgentConfig, environment: any, logger: any, eventBus: any, memory: any);
    protected getDefaultCapabilities(): AgentCapabilities;
    protected getDefaultConfig(): Partial<AgentConfig>;
    executeTask(task: TaskDefinition): Promise<any>;
    getSystemPrompt(): string;
    designSystem(requirements: any): Promise<any>;
}
/**
 * Factory for creating Hive agents
 */
export declare class HiveAgentFactory {
    static createAgent(config: HiveAgentConfig & {
        name: string;
    }, agentConfig: AgentConfig, environment: any, logger: any, eventBus: any, memory: any): BaseAgent;
    /**
     * Create a balanced swarm for an objective
     */
    static createBalancedSwarm(objective: string, maxAgents: number | undefined, agentConfig: AgentConfig, environment: any, logger: any, eventBus: any, memory: any): BaseAgent[];
    /**
     * Get agent capabilities matrix
     */
    static getCapabilitiesMatrix(): Map<string, string[]>;
}
//# sourceMappingURL=hive-agents.d.ts.map