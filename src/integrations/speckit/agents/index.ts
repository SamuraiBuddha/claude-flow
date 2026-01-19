/**
 * SpecKit Agents Index
 *
 * Central exports for all SpecKit specialized agents and registration function.
 * These agents provide comprehensive support for specification management,
 * validation, and workflow orchestration.
 *
 * @module speckit/agents
 */

// Agent Classes
export {
  ConstitutionalEnforcerAgent,
  createConstitutionalEnforcerAgent,
} from './constitutional-enforcer.js';
export type {
  ConstitutionRule,
  ConstitutionCheckResult,
  ConstitutionViolation,
  ConstitutionException,
  GateCheckResult,
} from './constitutional-enforcer.js';

export {
  SpecificationOptimizerAgent,
  createSpecificationOptimizerAgent,
} from './specification-optimizer.js';
export type {
  ProductionMetric,
  MetricThreshold,
  SpecUpdateProposal,
  MetricAnalysisResult,
  MetricAnomaly,
  MetricForecast,
  RegenerationTrigger,
} from './specification-optimizer.js';

export {
  ArtifactValidatorAgent,
  createArtifactValidatorAgent,
} from './artifact-validator.js';
export type {
  ArtifactType,
  SpecArtifact,
  ArtifactValidationResult,
  ValidationError,
  ValidationWarning,
  CoverageReport,
  ConsistencyReport,
  ConsistencyIssue,
  CrossReference,
  SpecificationGap,
} from './artifact-validator.js';

export {
  TaskOrchestratorAgent,
  createTaskOrchestratorAgent,
} from './task-orchestrator-agent.js';
export type {
  TaskNode,
  TaskNodeStatus,
  TaskGraph,
  AgentAvailability,
  TaskAssignment,
  OrchestrationProgress,
} from './task-orchestrator-agent.js';

export {
  ResearchCoordinatorAgent,
  createResearchCoordinatorAgent,
} from './research-coordinator.js';
export type {
  UnknownItem,
  ResearchTask,
  ResearchFinding,
  ResearchResult,
  ResearchDocument,
} from './research-coordinator.js';

export {
  ClarificationExpertAgent,
  createClarificationExpertAgent,
} from './clarification-expert.js';
export type {
  QuestionCategory,
  ClarificationQuestion,
  ClarificationAnswer,
  CoverageAnalysis,
  ClarificationSession,
  CompletenessResult,
  CompletenessGap,
} from './clarification-expert.js';

export {
  ContractValidatorAgent,
  createContractValidatorAgent,
} from './contract-validator.js';
export type {
  APIContract,
  ContractEndpoint,
  ContractParameter,
  ContractRequestBody,
  ContractResponse,
  ContractSchema,
  SecurityScheme,
  SecurityRequirement,
  DataModel,
  DataEntity,
  DataField,
  DataRelationship,
  ContractValidationResult,
  ContractError,
  ContractWarning,
  ContractCoverage,
  ImplementabilityAssessment,
  ContractTest,
  ContractTestCase,
} from './contract-validator.js';

export {
  NFRSpecialistAgent,
  createNFRSpecialistAgent,
} from './nfr-specialist.js';
export type {
  NFRCategory,
  NFR,
  NFRMetric,
  NFRValidationResult,
  NFRGap,
  NFRTest,
  NFRTestType,
  NFRTestStep,
  ExpectedResult,
  NFRAnalysisReport,
} from './nfr-specialist.js';

// Import types for registration function
import type { ILogger } from '../../../core/logger.js';
import type { IEventBus } from '../../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../../memory/distributed-memory.js';
import type { AgentConfig, AgentEnvironment, AgentType } from '../../../swarm/types.js';
import { BaseAgent } from '../../../cli/agents/base-agent.js';

import { createConstitutionalEnforcerAgent } from './constitutional-enforcer.js';
import { createSpecificationOptimizerAgent } from './specification-optimizer.js';
import { createArtifactValidatorAgent } from './artifact-validator.js';
import { createTaskOrchestratorAgent } from './task-orchestrator-agent.js';
import { createResearchCoordinatorAgent } from './research-coordinator.js';
import { createClarificationExpertAgent } from './clarification-expert.js';
import { createContractValidatorAgent } from './contract-validator.js';
import { createNFRSpecialistAgent } from './nfr-specialist.js';

/**
 * SpecKit agent type identifiers
 */
export type SpecKitAgentType =
  | 'constitutional-enforcer'
  | 'specification-optimizer'
  | 'artifact-validator'
  | 'task-orchestrator'
  | 'research-coordinator'
  | 'clarification-expert'
  | 'contract-validator'
  | 'nfr-specialist';

/**
 * SpecKit agent descriptions
 */
export const SPECKIT_AGENT_DESCRIPTIONS: Record<SpecKitAgentType, string> = {
  'constitutional-enforcer': 'Monitors design decisions for constitution compliance, pre-blocks violations',
  'specification-optimizer': 'Monitors production metrics, proposes spec updates, triggers regeneration',
  'artifact-validator': 'Cross-artifact consistency checking, validates user story coverage',
  'task-orchestrator': 'Manages task execution, dependencies, and parallelization',
  'research-coordinator': 'Extracts NEEDS CLARIFICATION items, spawns research tasks',
  'clarification-expert': 'Structured specification refinement, coverage-based questioning',
  'contract-validator': 'Ensures API contracts are complete and implementable',
  'nfr-specialist': 'Non-functional requirements expert (performance, security, scalability)',
};

/**
 * SpecKit agent capabilities summary
 */
export const SPECKIT_AGENT_CAPABILITIES: Record<SpecKitAgentType, string[]> = {
  'constitutional-enforcer': ['read-constitution', 'validate-plan', 'check-gate', 'record-exception'],
  'specification-optimizer': ['analyze-metrics', 'propose-updates', 'trigger-regeneration'],
  'artifact-validator': ['validate-spec', 'check-coverage', 'identify-gaps'],
  'task-orchestrator': ['parse-tasks', 'build-graph', 'assign-agents', 'track-progress'],
  'research-coordinator': ['extract-unknowns', 'spawn-research', 'consolidate-findings'],
  'clarification-expert': ['generate-questions', 'record-answers', 'validate-completeness'],
  'contract-validator': ['parse-contracts', 'generate-tests', 'validate-models'],
  'nfr-specialist': ['extract-nfrs', 'validate-plan', 'create-tests'],
};

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
export class SpecKitAgentRegistry {
  private agents: Map<string, BaseAgent> = new Map();
  private config: SpecKitAgentRegistryConfig;
  private agentCounter = 0;

  constructor(config: SpecKitAgentRegistryConfig) {
    this.config = config;
  }

  /**
   * Create a SpecKit agent by type
   */
  createAgent(
    type: SpecKitAgentType,
    config?: Partial<AgentConfig>,
    environment?: Partial<AgentEnvironment>,
    customId?: string
  ): BaseAgent {
    const id = customId || this.generateAgentId(type);
    const mergedConfig = { ...this.config.defaultConfig, ...config };
    const mergedEnv = { ...this.config.defaultEnvironment, ...environment };

    let agent: BaseAgent;

    switch (type) {
      case 'constitutional-enforcer':
        agent = createConstitutionalEnforcerAgent(
          id,
          mergedConfig,
          mergedEnv,
          this.config.logger,
          this.config.eventBus,
          this.config.memory
        );
        break;

      case 'specification-optimizer':
        agent = createSpecificationOptimizerAgent(
          id,
          mergedConfig,
          mergedEnv,
          this.config.logger,
          this.config.eventBus,
          this.config.memory
        );
        break;

      case 'artifact-validator':
        agent = createArtifactValidatorAgent(
          id,
          mergedConfig,
          mergedEnv,
          this.config.logger,
          this.config.eventBus,
          this.config.memory
        );
        break;

      case 'task-orchestrator':
        agent = createTaskOrchestratorAgent(
          id,
          mergedConfig,
          mergedEnv,
          this.config.logger,
          this.config.eventBus,
          this.config.memory
        );
        break;

      case 'research-coordinator':
        agent = createResearchCoordinatorAgent(
          id,
          mergedConfig,
          mergedEnv,
          this.config.logger,
          this.config.eventBus,
          this.config.memory
        );
        break;

      case 'clarification-expert':
        agent = createClarificationExpertAgent(
          id,
          mergedConfig,
          mergedEnv,
          this.config.logger,
          this.config.eventBus,
          this.config.memory
        );
        break;

      case 'contract-validator':
        agent = createContractValidatorAgent(
          id,
          mergedConfig,
          mergedEnv,
          this.config.logger,
          this.config.eventBus,
          this.config.memory
        );
        break;

      case 'nfr-specialist':
        agent = createNFRSpecialistAgent(
          id,
          mergedConfig,
          mergedEnv,
          this.config.logger,
          this.config.eventBus,
          this.config.memory
        );
        break;

      default:
        throw new Error(`Unknown SpecKit agent type: ${type}`);
    }

    this.agents.set(id, agent);
    this.config.logger.info('SpecKit agent created', { id, type });

    return agent;
  }

  /**
   * Get an agent by ID
   */
  getAgent(id: string): BaseAgent | undefined {
    return this.agents.get(id);
  }

  /**
   * Get all agents of a specific type
   */
  getAgentsByType(type: SpecKitAgentType): BaseAgent[] {
    return Array.from(this.agents.values()).filter(agent => {
      const info = agent.getAgentInfo();
      return info.name?.includes(type);
    });
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Remove an agent from the registry
   */
  async removeAgent(id: string): Promise<boolean> {
    const agent = this.agents.get(id);
    if (!agent) return false;

    await agent.shutdown();
    this.agents.delete(id);
    this.config.logger.info('SpecKit agent removed', { id });

    return true;
  }

  /**
   * Initialize all agents
   */
  async initializeAll(): Promise<void> {
    const initPromises = Array.from(this.agents.values()).map(agent =>
      agent.initialize().catch(error => {
        const info = agent.getAgentInfo();
        this.config.logger.error('Agent initialization failed', {
          agentId: info.id.id,
          error: error instanceof Error ? error.message : String(error),
        });
      })
    );

    await Promise.all(initPromises);
    this.config.logger.info('All SpecKit agents initialized', {
      count: this.agents.size,
    });
  }

  /**
   * Shutdown all agents
   */
  async shutdownAll(): Promise<void> {
    const shutdownPromises = Array.from(this.agents.values()).map(agent =>
      agent.shutdown().catch(error => {
        const info = agent.getAgentInfo();
        this.config.logger.error('Agent shutdown failed', {
          agentId: info.id.id,
          error: error instanceof Error ? error.message : String(error),
        });
      })
    );

    await Promise.all(shutdownPromises);
    this.agents.clear();
    this.config.logger.info('All SpecKit agents shutdown');
  }

  /**
   * Get registry statistics
   */
  getStatistics(): {
    total: number;
    byType: Record<string, number>;
    initialized: number;
  } {
    const stats = {
      total: this.agents.size,
      byType: {} as Record<string, number>,
      initialized: 0,
    };

    for (const agent of this.agents.values()) {
      const info = agent.getAgentInfo();
      const type = info.type;
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      if (info.status === 'idle' || info.status === 'busy') {
        stats.initialized++;
      }
    }

    return stats;
  }

  /**
   * Generate unique agent ID
   */
  private generateAgentId(type: SpecKitAgentType): string {
    this.agentCounter++;
    const timestamp = Date.now().toString(36);
    const counter = this.agentCounter.toString(36).padStart(2, '0');
    return `speckit-${type}-${timestamp}-${counter}`;
  }
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
export function registerSpecKitAgents(
  config: SpecKitAgentRegistryConfig,
  createDefaults: boolean = false
): SpecKitAgentRegistry {
  const registry = new SpecKitAgentRegistry(config);

  config.logger.info('SpecKit agent registry created');

  if (createDefaults) {
    const agentTypes: SpecKitAgentType[] = [
      'constitutional-enforcer',
      'specification-optimizer',
      'artifact-validator',
      'task-orchestrator',
      'research-coordinator',
      'clarification-expert',
      'contract-validator',
      'nfr-specialist',
    ];

    for (const type of agentTypes) {
      registry.createAgent(type);
    }

    config.logger.info('Default SpecKit agents created', {
      count: agentTypes.length,
      types: agentTypes,
    });
  }

  return registry;
}

/**
 * Get all available SpecKit agent types
 */
export function getSpecKitAgentTypes(): SpecKitAgentType[] {
  return [
    'constitutional-enforcer',
    'specification-optimizer',
    'artifact-validator',
    'task-orchestrator',
    'research-coordinator',
    'clarification-expert',
    'contract-validator',
    'nfr-specialist',
  ];
}

/**
 * Get description for a SpecKit agent type
 */
export function getSpecKitAgentDescription(type: SpecKitAgentType): string {
  return SPECKIT_AGENT_DESCRIPTIONS[type] || 'Unknown agent type';
}

/**
 * Get capabilities for a SpecKit agent type
 */
export function getSpecKitAgentCapabilities(type: SpecKitAgentType): string[] {
  return SPECKIT_AGENT_CAPABILITIES[type] || [];
}

/**
 * Check if a string is a valid SpecKit agent type
 */
export function isSpecKitAgentType(type: string): type is SpecKitAgentType {
  return getSpecKitAgentTypes().includes(type as SpecKitAgentType);
}

// Default export
export default {
  registerSpecKitAgents,
  getSpecKitAgentTypes,
  getSpecKitAgentDescription,
  getSpecKitAgentCapabilities,
  isSpecKitAgentType,
  SPECKIT_AGENT_DESCRIPTIONS,
  SPECKIT_AGENT_CAPABILITIES,
  SpecKitAgentRegistry,
};
