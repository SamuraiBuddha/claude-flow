"use strict";
/**
 * Agent System Index - Central exports and agent factory
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentLifecycle = exports.AgentFactory = exports.AgentRegistry = exports.AgentManager = exports.AgentCapabilitySystem = exports.createCoordinatorAgent = exports.CoordinatorAgent = exports.createTesterAgent = exports.TesterAgent = exports.createArchitectAgent = exports.ArchitectAgent = exports.createAnalystAgent = exports.AnalystAgent = exports.createCoderAgent = exports.CoderAgent = exports.createResearcherAgent = exports.ResearcherAgent = exports.BaseAgent = void 0;
exports.createAgentFactory = createAgentFactory;
// Agent Classes
var base_agent_js_1 = require("./base-agent.js");
Object.defineProperty(exports, "BaseAgent", { enumerable: true, get: function () { return base_agent_js_1.BaseAgent; } });
var researcher_js_1 = require("./researcher.js");
Object.defineProperty(exports, "ResearcherAgent", { enumerable: true, get: function () { return researcher_js_1.ResearcherAgent; } });
Object.defineProperty(exports, "createResearcherAgent", { enumerable: true, get: function () { return researcher_js_1.createResearcherAgent; } });
var coder_js_1 = require("./coder.js");
Object.defineProperty(exports, "CoderAgent", { enumerable: true, get: function () { return coder_js_1.CoderAgent; } });
Object.defineProperty(exports, "createCoderAgent", { enumerable: true, get: function () { return coder_js_1.createCoderAgent; } });
var analyst_js_1 = require("./analyst.js");
Object.defineProperty(exports, "AnalystAgent", { enumerable: true, get: function () { return analyst_js_1.AnalystAgent; } });
Object.defineProperty(exports, "createAnalystAgent", { enumerable: true, get: function () { return analyst_js_1.createAnalystAgent; } });
var architect_js_1 = require("./architect.js");
Object.defineProperty(exports, "ArchitectAgent", { enumerable: true, get: function () { return architect_js_1.ArchitectAgent; } });
Object.defineProperty(exports, "createArchitectAgent", { enumerable: true, get: function () { return architect_js_1.createArchitectAgent; } });
var tester_js_1 = require("./tester.js");
Object.defineProperty(exports, "TesterAgent", { enumerable: true, get: function () { return tester_js_1.TesterAgent; } });
Object.defineProperty(exports, "createTesterAgent", { enumerable: true, get: function () { return tester_js_1.createTesterAgent; } });
var coordinator_js_1 = require("./coordinator.js");
Object.defineProperty(exports, "CoordinatorAgent", { enumerable: true, get: function () { return coordinator_js_1.CoordinatorAgent; } });
Object.defineProperty(exports, "createCoordinatorAgent", { enumerable: true, get: function () { return coordinator_js_1.createCoordinatorAgent; } });
// Systems
var capabilities_js_1 = require("./capabilities.js");
Object.defineProperty(exports, "AgentCapabilitySystem", { enumerable: true, get: function () { return capabilities_js_1.AgentCapabilitySystem; } });
var agent_manager_js_1 = require("../../agents/agent-manager.js");
Object.defineProperty(exports, "AgentManager", { enumerable: true, get: function () { return agent_manager_js_1.AgentManager; } });
var agent_registry_js_1 = require("../../agents/agent-registry.js");
Object.defineProperty(exports, "AgentRegistry", { enumerable: true, get: function () { return agent_registry_js_1.AgentRegistry; } });
const researcher_js_2 = require("./researcher.js");
const coder_js_2 = require("./coder.js");
const analyst_js_2 = require("./analyst.js");
const architect_js_2 = require("./architect.js");
const tester_js_2 = require("./tester.js");
const coordinator_js_2 = require("./coordinator.js");
/**
 * Agent Factory - Creates specialized agents based on type
 */
class AgentFactory {
    logger;
    eventBus;
    memory;
    agentCounter = 0;
    constructor(config) {
        this.logger = config.logger;
        this.eventBus = config.eventBus;
        this.memory = config.memory;
    }
    /**
     * Create an agent of the specified type
     */
    createAgent(type, config = {}, environment = {}, customId) {
        const id = customId || this.generateAgentId(type);
        this.logger.info('Creating agent', {
            id,
            type,
            factory: 'AgentFactory',
        });
        switch (type) {
            case 'researcher':
                return (0, researcher_js_2.createResearcherAgent)(id, config, environment, this.logger, this.eventBus, this.memory);
            case 'coder':
                return (0, coder_js_2.createCoderAgent)(id, config, environment, this.logger, this.eventBus, this.memory);
            case 'analyst':
                return (0, analyst_js_2.createAnalystAgent)(id, config, environment, this.logger, this.eventBus, this.memory);
            case 'architect':
                return (0, architect_js_2.createArchitectAgent)(id, config, environment, this.logger, this.eventBus, this.memory);
            case 'tester':
                return (0, tester_js_2.createTesterAgent)(id, config, environment, this.logger, this.eventBus, this.memory);
            case 'coordinator':
                return (0, coordinator_js_2.createCoordinatorAgent)(id, config, environment, this.logger, this.eventBus, this.memory);
            default:
                throw new Error(`Unknown agent type: ${type}`);
        }
    }
    /**
     * Create multiple agents of different types
     */
    createAgents(specs) {
        const agents = [];
        for (const spec of specs) {
            const count = spec.count || 1;
            for (let i = 0; i < count; i++) {
                const agent = this.createAgent(spec.type, spec.config, spec.environment);
                agents.push(agent);
            }
        }
        this.logger.info('Created multiple agents', {
            totalAgents: agents.length,
            specs: specs.map((s) => ({ type: s.type, count: s.count || 1 })),
        });
        return agents;
    }
    /**
     * Create a balanced swarm of agents
     */
    createBalancedSwarm(size = 5, strategy = 'balanced') {
        const compositions = {
            research: {
                researcher: 0.4,
                analyst: 0.3,
                coordinator: 0.2,
                architect: 0.1,
            },
            development: {
                coder: 0.4,
                tester: 0.25,
                architect: 0.2,
                coordinator: 0.15,
            },
            analysis: {
                analyst: 0.4,
                researcher: 0.3,
                coordinator: 0.2,
                architect: 0.1,
            },
            balanced: {
                coder: 0.25,
                researcher: 0.2,
                analyst: 0.2,
                tester: 0.15,
                architect: 0.1,
                coordinator: 0.1,
            },
        };
        const composition = compositions[strategy];
        const specs = [];
        for (const [type, ratio] of Object.entries(composition)) {
            const count = Math.max(1, Math.round(size * ratio));
            specs.push({ type: type, count });
        }
        // Adjust if we have too many agents
        const totalCount = specs.reduce((sum, spec) => sum + spec.count, 0);
        if (totalCount > size) {
            // Remove from largest groups first
            specs.sort((a, b) => b.count - a.count);
            let excess = totalCount - size;
            for (const spec of specs) {
                if (excess <= 0)
                    break;
                const reduction = Math.min(excess, spec.count - 1);
                spec.count -= reduction;
                excess -= reduction;
            }
        }
        return this.createAgents(specs.map((spec) => ({ type: spec.type, count: spec.count })));
    }
    /**
     * Get supported agent types
     */
    getSupportedTypes() {
        return ['researcher', 'coder', 'analyst', 'architect', 'tester', 'coordinator'];
    }
    /**
     * Get agent type descriptions
     */
    getAgentTypeDescriptions() {
        return {
            researcher: 'Specialized in information gathering, web research, and data collection',
            coder: 'Expert in software development, code generation, and implementation',
            analyst: 'Focused on data analysis, performance optimization, and insights',
            architect: 'Designs system architecture, technical specifications, and solutions',
            tester: 'Specializes in testing, quality assurance, and validation',
            coordinator: 'Manages task orchestration, planning, and team coordination',
            reviewer: 'Reviews and validates work quality and standards',
            optimizer: 'Optimizes performance and efficiency across systems',
            documenter: 'Creates and maintains comprehensive documentation',
            monitor: 'Monitors system health and performance metrics',
            specialist: 'Provides domain-specific expertise and specialized knowledge',
        };
    }
    /**
     * Generate unique agent ID
     */
    generateAgentId(type) {
        this.agentCounter++;
        const timestamp = Date.now().toString(36);
        const counter = this.agentCounter.toString(36).padStart(2, '0');
        return `${type}-${timestamp}-${counter}`;
    }
}
exports.AgentFactory = AgentFactory;
/**
 * Create default agent factory instance
 */
function createAgentFactory(logger, eventBus, memory) {
    return new AgentFactory({ logger, eventBus, memory });
}
/**
 * Agent lifecycle management utilities
 */
class AgentLifecycle {
    agents = new Map();
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Register an agent for lifecycle management
     */
    register(agent) {
        const info = agent.getAgentInfo();
        this.agents.set(info.id.id, agent);
        this.logger.info('Agent registered for lifecycle management', {
            agentId: info.id.id,
            type: info.type,
        });
    }
    /**
     * Initialize all registered agents
     */
    async initializeAll() {
        const initPromises = Array.from(this.agents.values()).map((agent) => agent.initialize().catch((error) => {
            const info = agent.getAgentInfo();
            this.logger.error('Agent initialization failed', {
                agentId: info.id.id,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }));
        await Promise.all(initPromises);
        this.logger.info('All agents initialized', {
            count: this.agents.size,
        });
    }
    /**
     * Shutdown all registered agents
     */
    async shutdownAll() {
        const shutdownPromises = Array.from(this.agents.values()).map((agent) => agent.shutdown().catch((error) => {
            const info = agent.getAgentInfo();
            this.logger.error('Agent shutdown failed', {
                agentId: info.id.id,
                error: error instanceof Error ? error.message : String(error),
            });
        }));
        await Promise.all(shutdownPromises);
        this.agents.clear();
        this.logger.info('All agents shutdown');
    }
    /**
     * Get agent by ID
     */
    getAgent(agentId) {
        return this.agents.get(agentId);
    }
    /**
     * Get all registered agents
     */
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    /**
     * Get agents by type
     */
    getAgentsByType(type) {
        return Array.from(this.agents.values()).filter((agent) => {
            const info = agent.getAgentInfo();
            return info.type === type;
        });
    }
    /**
     * Get agent statistics
     */
    getStatistics() {
        const stats = {
            total: this.agents.size,
            byType: {},
            byStatus: {},
            healthy: 0,
            active: 0,
        };
        for (const agent of this.agents.values()) {
            const info = agent.getAgentInfo();
            // Count by type
            stats.byType[info.type] = (stats.byType[info.type] || 0) + 1;
            // Count by status
            stats.byStatus[info.status] = (stats.byStatus[info.status] || 0) + 1;
            // Count healthy agents (health > 0.7)
            if (info.health > 0.7) {
                stats.healthy++;
            }
            // Count active agents
            if (info.status === 'idle' || info.status === 'busy') {
                stats.active++;
            }
        }
        return stats;
    }
}
exports.AgentLifecycle = AgentLifecycle;
//# sourceMappingURL=index.js.map