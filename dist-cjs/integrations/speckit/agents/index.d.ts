/**
 * SpecKit Agents Index
 *
 * Central exports for all SpecKit specialized agents and registration function.
 * These agents provide comprehensive support for specification management,
 * validation, and workflow orchestration.
 *
 * @module speckit/agents
 */
export { ConstitutionalEnforcerAgent, createConstitutionalEnforcerAgent, } from './constitutional-enforcer.js';
export type { ConstitutionRule, ConstitutionCheckResult, ConstitutionViolation, ConstitutionException, GateCheckResult, } from './constitutional-enforcer.js';
export { SpecificationOptimizerAgent, createSpecificationOptimizerAgent, } from './specification-optimizer.js';
export type { ProductionMetric, MetricThreshold, SpecUpdateProposal, MetricAnalysisResult, MetricAnomaly, MetricForecast, RegenerationTrigger, } from './specification-optimizer.js';
export { ArtifactValidatorAgent, createArtifactValidatorAgent, } from './artifact-validator.js';
export type { ArtifactType, SpecArtifact, ArtifactValidationResult, ValidationError, ValidationWarning, CoverageReport, ConsistencyReport, ConsistencyIssue, CrossReference, SpecificationGap, } from './artifact-validator.js';
export { TaskOrchestratorAgent, createTaskOrchestratorAgent, } from './task-orchestrator-agent.js';
export type { TaskNode, TaskNodeStatus, TaskGraph, AgentAvailability, TaskAssignment, OrchestrationProgress, } from './task-orchestrator-agent.js';
export { ResearchCoordinatorAgent, createResearchCoordinatorAgent, } from './research-coordinator.js';
export type { UnknownItem, ResearchTask, ResearchFinding, ResearchResult, ResearchDocument, } from './research-coordinator.js';
export { ClarificationExpertAgent, createClarificationExpertAgent, } from './clarification-expert.js';
export type { QuestionCategory, ClarificationQuestion, ClarificationAnswer, CoverageAnalysis, ClarificationSession, CompletenessResult, CompletenessGap, } from './clarification-expert.js';
export { ContractValidatorAgent, createContractValidatorAgent, } from './contract-validator.js';
export type { APIContract, ContractEndpoint, ContractParameter, ContractRequestBody, ContractResponse, ContractSchema, SecurityScheme, SecurityRequirement, DataModel, DataEntity, DataField, DataRelationship, ContractValidationResult, ContractError, ContractWarning, ContractCoverage, ImplementabilityAssessment, ContractTest, ContractTestCase, } from './contract-validator.js';
export { NFRSpecialistAgent, createNFRSpecialistAgent, } from './nfr-specialist.js';
export type { NFRCategory, NFR, NFRMetric, NFRValidationResult, NFRGap, NFRTest, NFRTestType, NFRTestStep, ExpectedResult, NFRAnalysisReport, } from './nfr-specialist.js';
import type { ILogger } from '../../../core/logger.js';
import type { IEventBus } from '../../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../../memory/distributed-memory.js';
import type { AgentConfig, AgentEnvironment } from '../../../swarm/types.js';
import { BaseAgent } from '../../../cli/agents/base-agent.js';
/**
 * SpecKit agent type identifiers
 */
export type SpecKitAgentType = 'constitutional-enforcer' | 'specification-optimizer' | 'artifact-validator' | 'task-orchestrator' | 'research-coordinator' | 'clarification-expert' | 'contract-validator' | 'nfr-specialist';
/**
 * SpecKit agent descriptions
 */
export declare const SPECKIT_AGENT_DESCRIPTIONS: Record<SpecKitAgentType, string>;
/**
 * SpecKit agent capabilities summary
 */
export declare const SPECKIT_AGENT_CAPABILITIES: Record<SpecKitAgentType, string[]>;
/**
 * Configuration for registering SpecKit agents
 */
export interface SpecKitAgentRegistryConfig {
    logger: ILogger;
    eventBus: IEventBus;
    memory: DistributedMemorySystem;
    defaultConfig?: Partial<AgentConfig>;
    defaultEnvironment?: Partial<AgentEnvironment>;
}
/**
 * Registry for SpecKit agents
 */
export declare class SpecKitAgentRegistry {
    private agents;
    private config;
    private agentCounter;
    constructor(config: SpecKitAgentRegistryConfig);
    /**
     * Create a SpecKit agent by type
     */
    createAgent(type: SpecKitAgentType, config?: Partial<AgentConfig>, environment?: Partial<AgentEnvironment>, customId?: string): BaseAgent;
    /**
     * Get an agent by ID
     */
    getAgent(id: string): BaseAgent | undefined;
    /**
     * Get all agents of a specific type
     */
    getAgentsByType(type: SpecKitAgentType): BaseAgent[];
    /**
     * Get all registered agents
     */
    getAllAgents(): BaseAgent[];
    /**
     * Remove an agent from the registry
     */
    removeAgent(id: string): Promise<boolean>;
    /**
     * Initialize all agents
     */
    initializeAll(): Promise<void>;
    /**
     * Shutdown all agents
     */
    shutdownAll(): Promise<void>;
    /**
     * Get registry statistics
     */
    getStatistics(): {
        total: number;
        byType: Record<string, number>;
        initialized: number;
    };
    /**
     * Generate unique agent ID
     */
    private generateAgentId;
}
/**
 * Register all SpecKit agents with the system
 *
 * This function creates a registry with all SpecKit specialized agents
 * and optionally creates default instances of each type.
 *
 * @param config - Configuration for the agent registry
 * @param createDefaults - Whether to create default instances of each agent type
 * @returns The configured SpecKit agent registry
 *
 * @example
 * ```typescript
 * const registry = registerSpecKitAgents({
 *   logger,
 *   eventBus,
 *   memory,
 * });
 *
 * // Create a specific agent
 * const enforcer = registry.createAgent('constitutional-enforcer');
 * await enforcer.initialize();
 *
 * // Or create all default agents
 * const registryWithDefaults = registerSpecKitAgents(config, true);
 * await registryWithDefaults.initializeAll();
 * ```
 */
export declare function registerSpecKitAgents(config: SpecKitAgentRegistryConfig, createDefaults?: boolean): SpecKitAgentRegistry;
/**
 * Get all available SpecKit agent types
 */
export declare function getSpecKitAgentTypes(): SpecKitAgentType[];
/**
 * Get description for a SpecKit agent type
 */
export declare function getSpecKitAgentDescription(type: SpecKitAgentType): string;
/**
 * Get capabilities for a SpecKit agent type
 */
export declare function getSpecKitAgentCapabilities(type: SpecKitAgentType): string[];
/**
 * Check if a string is a valid SpecKit agent type
 */
export declare function isSpecKitAgentType(type: string): type is SpecKitAgentType;
declare const _default: {
    registerSpecKitAgents: typeof registerSpecKitAgents;
    getSpecKitAgentTypes: typeof getSpecKitAgentTypes;
    getSpecKitAgentDescription: typeof getSpecKitAgentDescription;
    getSpecKitAgentCapabilities: typeof getSpecKitAgentCapabilities;
    isSpecKitAgentType: typeof isSpecKitAgentType;
    SPECKIT_AGENT_DESCRIPTIONS: Record<SpecKitAgentType, string>;
    SPECKIT_AGENT_CAPABILITIES: Record<SpecKitAgentType, string[]>;
    SpecKitAgentRegistry: typeof SpecKitAgentRegistry;
};
export default _default;
//# sourceMappingURL=index.d.ts.map