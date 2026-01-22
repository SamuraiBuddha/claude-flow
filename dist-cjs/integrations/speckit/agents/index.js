"use strict";
/**
 * SpecKit Agents Index
 *
 * Central exports for all SpecKit specialized agents and registration function.
 * These agents provide comprehensive support for specification management,
 * validation, and workflow orchestration.
 *
 * @module speckit/agents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecKitAgentRegistry = exports.SPECKIT_AGENT_CAPABILITIES = exports.SPECKIT_AGENT_DESCRIPTIONS = exports.createNFRSpecialistAgent = exports.NFRSpecialistAgent = exports.createContractValidatorAgent = exports.ContractValidatorAgent = exports.createClarificationExpertAgent = exports.ClarificationExpertAgent = exports.createResearchCoordinatorAgent = exports.ResearchCoordinatorAgent = exports.createTaskOrchestratorAgent = exports.TaskOrchestratorAgent = exports.createArtifactValidatorAgent = exports.ArtifactValidatorAgent = exports.createSpecificationOptimizerAgent = exports.SpecificationOptimizerAgent = exports.createConstitutionalEnforcerAgent = exports.ConstitutionalEnforcerAgent = void 0;
exports.registerSpecKitAgents = registerSpecKitAgents;
exports.getSpecKitAgentTypes = getSpecKitAgentTypes;
exports.getSpecKitAgentDescription = getSpecKitAgentDescription;
exports.getSpecKitAgentCapabilities = getSpecKitAgentCapabilities;
exports.isSpecKitAgentType = isSpecKitAgentType;
// Agent Classes
var constitutional_enforcer_js_1 = require("./constitutional-enforcer.js");
Object.defineProperty(exports, "ConstitutionalEnforcerAgent", { enumerable: true, get: function () { return constitutional_enforcer_js_1.ConstitutionalEnforcerAgent; } });
Object.defineProperty(exports, "createConstitutionalEnforcerAgent", { enumerable: true, get: function () { return constitutional_enforcer_js_1.createConstitutionalEnforcerAgent; } });
var specification_optimizer_js_1 = require("./specification-optimizer.js");
Object.defineProperty(exports, "SpecificationOptimizerAgent", { enumerable: true, get: function () { return specification_optimizer_js_1.SpecificationOptimizerAgent; } });
Object.defineProperty(exports, "createSpecificationOptimizerAgent", { enumerable: true, get: function () { return specification_optimizer_js_1.createSpecificationOptimizerAgent; } });
var artifact_validator_js_1 = require("./artifact-validator.js");
Object.defineProperty(exports, "ArtifactValidatorAgent", { enumerable: true, get: function () { return artifact_validator_js_1.ArtifactValidatorAgent; } });
Object.defineProperty(exports, "createArtifactValidatorAgent", { enumerable: true, get: function () { return artifact_validator_js_1.createArtifactValidatorAgent; } });
var task_orchestrator_agent_js_1 = require("./task-orchestrator-agent.js");
Object.defineProperty(exports, "TaskOrchestratorAgent", { enumerable: true, get: function () { return task_orchestrator_agent_js_1.TaskOrchestratorAgent; } });
Object.defineProperty(exports, "createTaskOrchestratorAgent", { enumerable: true, get: function () { return task_orchestrator_agent_js_1.createTaskOrchestratorAgent; } });
var research_coordinator_js_1 = require("./research-coordinator.js");
Object.defineProperty(exports, "ResearchCoordinatorAgent", { enumerable: true, get: function () { return research_coordinator_js_1.ResearchCoordinatorAgent; } });
Object.defineProperty(exports, "createResearchCoordinatorAgent", { enumerable: true, get: function () { return research_coordinator_js_1.createResearchCoordinatorAgent; } });
var clarification_expert_js_1 = require("./clarification-expert.js");
Object.defineProperty(exports, "ClarificationExpertAgent", { enumerable: true, get: function () { return clarification_expert_js_1.ClarificationExpertAgent; } });
Object.defineProperty(exports, "createClarificationExpertAgent", { enumerable: true, get: function () { return clarification_expert_js_1.createClarificationExpertAgent; } });
var contract_validator_js_1 = require("./contract-validator.js");
Object.defineProperty(exports, "ContractValidatorAgent", { enumerable: true, get: function () { return contract_validator_js_1.ContractValidatorAgent; } });
Object.defineProperty(exports, "createContractValidatorAgent", { enumerable: true, get: function () { return contract_validator_js_1.createContractValidatorAgent; } });
var nfr_specialist_js_1 = require("./nfr-specialist.js");
Object.defineProperty(exports, "NFRSpecialistAgent", { enumerable: true, get: function () { return nfr_specialist_js_1.NFRSpecialistAgent; } });
Object.defineProperty(exports, "createNFRSpecialistAgent", { enumerable: true, get: function () { return nfr_specialist_js_1.createNFRSpecialistAgent; } });
const constitutional_enforcer_js_2 = require("./constitutional-enforcer.js");
const specification_optimizer_js_2 = require("./specification-optimizer.js");
const artifact_validator_js_2 = require("./artifact-validator.js");
const task_orchestrator_agent_js_2 = require("./task-orchestrator-agent.js");
const research_coordinator_js_2 = require("./research-coordinator.js");
const clarification_expert_js_2 = require("./clarification-expert.js");
const contract_validator_js_2 = require("./contract-validator.js");
const nfr_specialist_js_2 = require("./nfr-specialist.js");
/**
 * SpecKit agent descriptions
 */
exports.SPECKIT_AGENT_DESCRIPTIONS = {
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
exports.SPECKIT_AGENT_CAPABILITIES = {
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
 * Registry for SpecKit agents
 */
class SpecKitAgentRegistry {
    agents = new Map();
    config;
    agentCounter = 0;
    constructor(config) {
        this.config = config;
    }
    /**
     * Create a SpecKit agent by type
     */
    createAgent(type, config, environment, customId) {
        const id = customId || this.generateAgentId(type);
        const mergedConfig = { ...this.config.defaultConfig, ...config };
        const mergedEnv = { ...this.config.defaultEnvironment, ...environment };
        let agent;
        switch (type) {
            case 'constitutional-enforcer':
                agent = (0, constitutional_enforcer_js_2.createConstitutionalEnforcerAgent)(id, mergedConfig, mergedEnv, this.config.logger, this.config.eventBus, this.config.memory);
                break;
            case 'specification-optimizer':
                agent = (0, specification_optimizer_js_2.createSpecificationOptimizerAgent)(id, mergedConfig, mergedEnv, this.config.logger, this.config.eventBus, this.config.memory);
                break;
            case 'artifact-validator':
                agent = (0, artifact_validator_js_2.createArtifactValidatorAgent)(id, mergedConfig, mergedEnv, this.config.logger, this.config.eventBus, this.config.memory);
                break;
            case 'task-orchestrator':
                agent = (0, task_orchestrator_agent_js_2.createTaskOrchestratorAgent)(id, mergedConfig, mergedEnv, this.config.logger, this.config.eventBus, this.config.memory);
                break;
            case 'research-coordinator':
                agent = (0, research_coordinator_js_2.createResearchCoordinatorAgent)(id, mergedConfig, mergedEnv, this.config.logger, this.config.eventBus, this.config.memory);
                break;
            case 'clarification-expert':
                agent = (0, clarification_expert_js_2.createClarificationExpertAgent)(id, mergedConfig, mergedEnv, this.config.logger, this.config.eventBus, this.config.memory);
                break;
            case 'contract-validator':
                agent = (0, contract_validator_js_2.createContractValidatorAgent)(id, mergedConfig, mergedEnv, this.config.logger, this.config.eventBus, this.config.memory);
                break;
            case 'nfr-specialist':
                agent = (0, nfr_specialist_js_2.createNFRSpecialistAgent)(id, mergedConfig, mergedEnv, this.config.logger, this.config.eventBus, this.config.memory);
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
    getAgent(id) {
        return this.agents.get(id);
    }
    /**
     * Get all agents of a specific type
     */
    getAgentsByType(type) {
        return Array.from(this.agents.values()).filter(agent => {
            const info = agent.getAgentInfo();
            return info.name?.includes(type);
        });
    }
    /**
     * Get all registered agents
     */
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    /**
     * Remove an agent from the registry
     */
    async removeAgent(id) {
        const agent = this.agents.get(id);
        if (!agent)
            return false;
        await agent.shutdown();
        this.agents.delete(id);
        this.config.logger.info('SpecKit agent removed', { id });
        return true;
    }
    /**
     * Initialize all agents
     */
    async initializeAll() {
        const initPromises = Array.from(this.agents.values()).map(agent => agent.initialize().catch(error => {
            const info = agent.getAgentInfo();
            this.config.logger.error('Agent initialization failed', {
                agentId: info.id.id,
                error: error instanceof Error ? error.message : String(error),
            });
        }));
        await Promise.all(initPromises);
        this.config.logger.info('All SpecKit agents initialized', {
            count: this.agents.size,
        });
    }
    /**
     * Shutdown all agents
     */
    async shutdownAll() {
        const shutdownPromises = Array.from(this.agents.values()).map(agent => agent.shutdown().catch(error => {
            const info = agent.getAgentInfo();
            this.config.logger.error('Agent shutdown failed', {
                agentId: info.id.id,
                error: error instanceof Error ? error.message : String(error),
            });
        }));
        await Promise.all(shutdownPromises);
        this.agents.clear();
        this.config.logger.info('All SpecKit agents shutdown');
    }
    /**
     * Get registry statistics
     */
    getStatistics() {
        const stats = {
            total: this.agents.size,
            byType: {},
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
    generateAgentId(type) {
        this.agentCounter++;
        const timestamp = Date.now().toString(36);
        const counter = this.agentCounter.toString(36).padStart(2, '0');
        return `speckit-${type}-${timestamp}-${counter}`;
    }
}
exports.SpecKitAgentRegistry = SpecKitAgentRegistry;
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
function registerSpecKitAgents(config, createDefaults = false) {
    const registry = new SpecKitAgentRegistry(config);
    config.logger.info('SpecKit agent registry created');
    if (createDefaults) {
        const agentTypes = [
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
function getSpecKitAgentTypes() {
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
function getSpecKitAgentDescription(type) {
    return exports.SPECKIT_AGENT_DESCRIPTIONS[type] || 'Unknown agent type';
}
/**
 * Get capabilities for a SpecKit agent type
 */
function getSpecKitAgentCapabilities(type) {
    return exports.SPECKIT_AGENT_CAPABILITIES[type] || [];
}
/**
 * Check if a string is a valid SpecKit agent type
 */
function isSpecKitAgentType(type) {
    return getSpecKitAgentTypes().includes(type);
}
// Default export
exports.default = {
    registerSpecKitAgents,
    getSpecKitAgentTypes,
    getSpecKitAgentDescription,
    getSpecKitAgentCapabilities,
    isSpecKitAgentType,
    SPECKIT_AGENT_DESCRIPTIONS: exports.SPECKIT_AGENT_DESCRIPTIONS,
    SPECKIT_AGENT_CAPABILITIES: exports.SPECKIT_AGENT_CAPABILITIES,
    SpecKitAgentRegistry,
};
//# sourceMappingURL=index.js.map