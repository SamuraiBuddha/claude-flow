"use strict";
/**
 * Hive Mind Agent Templates
 * Specialized agents for the Hive Mind swarm system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiveAgentFactory = exports.ArchitectAgent = exports.GuardianAgent = exports.ScoutAgent = exports.WorkerAgent = exports.QueenAgent = void 0;
const base_agent_js_1 = require("./base-agent.js");
/**
 * Queen Agent - Orchestrator and decision maker
 */
class QueenAgent extends base_agent_js_1.BaseAgent {
    constructor(id, config, environment, logger, eventBus, memory) {
        super(id, 'coordinator', config, environment, logger, eventBus, memory);
    }
    getDefaultCapabilities() {
        return {
            // Core capabilities
            codeGeneration: false,
            codeReview: true,
            testing: false,
            documentation: true,
            research: true,
            analysis: true,
            // Communication capabilities
            webSearch: true,
            apiIntegration: true,
            fileSystem: true,
            terminalAccess: false,
            // Specialized capabilities
            languages: ['javascript', 'typescript'],
            frameworks: ['node.js'],
            domains: ['orchestration', 'coordination'],
            tools: ['consensus', 'delegation'],
            // Resource limits
            maxConcurrentTasks: 5,
            maxMemoryUsage: 512,
            maxExecutionTime: 300000,
            // Performance characteristics
            reliability: 0.95,
            speed: 0.8,
            quality: 0.9,
        };
    }
    getDefaultConfig() {
        return {
            autonomyLevel: 0.8,
            learningEnabled: true,
            adaptationEnabled: true,
            maxTasksPerHour: 20,
            maxConcurrentTasks: 5,
            timeoutThreshold: 30000,
            reportingInterval: 5000,
            heartbeatInterval: 10000,
            permissions: ['orchestrate', 'delegate', 'consensus'],
        };
    }
    async executeTask(task) {
        // Queen agent execution logic
        return {
            result: 'orchestrated',
            taskId: task.id,
            timestamp: new Date().toISOString(),
        };
    }
    getSystemPrompt() {
        return `You are ${this.id}, a Queen agent in the Hive Mind swarm.

ROLE: Orchestrator and Decision Maker
- Coordinate all swarm activities
- Make final decisions after consensus
- Delegate tasks to appropriate agents
- Monitor overall progress and quality

RESPONSIBILITIES:
1. Task decomposition and planning
2. Agent assignment and coordination
3. Consensus facilitation
4. Quality assurance
5. Strategic decision making

CONSENSUS PROTOCOL:
- Propose major decisions for voting
- Facilitate discussion among agents
- Calculate consensus thresholds
- Make tie-breaking decisions when needed

COMMUNICATION STYLE:
- Clear and authoritative
- Balanced and fair
- Strategic thinking
- Focus on swarm objectives`;
    }
    async analyzeObjective(objective) {
        return {
            complexity: 'high',
            requiredAgents: ['architect', 'worker', 'scout', 'guardian'],
            estimatedTasks: 5,
            strategy: 'hierarchical',
            consensusRequired: true,
        };
    }
}
exports.QueenAgent = QueenAgent;
/**
 * Worker Agent - Implementation and execution
 */
class WorkerAgent extends base_agent_js_1.BaseAgent {
    specialization;
    constructor(id, config, environment, logger, eventBus, memory, specialization = 'general') {
        super(id, 'coder', config, environment, logger, eventBus, memory);
        this.specialization = specialization;
    }
    getDefaultCapabilities() {
        return {
            // Core capabilities
            codeGeneration: true,
            codeReview: false,
            testing: true,
            documentation: false,
            research: false,
            analysis: false,
            // Communication capabilities
            webSearch: false,
            apiIntegration: true,
            fileSystem: true,
            terminalAccess: true,
            // Specialized capabilities
            languages: ['javascript', 'typescript', 'python'],
            frameworks: ['node.js', 'react', 'express'],
            domains: ['backend', 'frontend', 'fullstack'],
            tools: ['git', 'npm', 'docker'],
            // Resource limits
            maxConcurrentTasks: 3,
            maxMemoryUsage: 1024,
            maxExecutionTime: 600000,
            // Performance characteristics
            reliability: 0.9,
            speed: 0.9,
            quality: 0.85,
        };
    }
    getDefaultConfig() {
        return {
            autonomyLevel: 0.7,
            learningEnabled: true,
            adaptationEnabled: true,
            maxTasksPerHour: 15,
            maxConcurrentTasks: 3,
            timeoutThreshold: 60000,
            reportingInterval: 10000,
            heartbeatInterval: 15000,
            permissions: ['code', 'test', 'debug', 'build'],
        };
    }
    async executeTask(task) {
        // Worker agent execution logic
        return {
            result: 'implemented',
            taskId: task.id,
            specialization: this.specialization,
            timestamp: new Date().toISOString(),
        };
    }
    getSystemPrompt() {
        return `You are ${this.id}, a Worker agent in the Hive Mind swarm.

ROLE: Implementation and Execution Specialist
- Execute assigned tasks efficiently
- Implement solutions based on designs
- Collaborate with other workers
- Report progress and issues

SPECIALIZATION: ${this.specialization || 'general'}

RESPONSIBILITIES:
1. Task implementation
2. Code development
3. Testing and validation
4. Bug fixing
5. Performance optimization

WORK PROTOCOL:
- Accept tasks from Queen or consensus
- Provide effort estimates
- Request help when blocked
- Share knowledge with swarm

COMMUNICATION STYLE:
- Technical and precise
- Progress-focused
- Collaborative
- Solution-oriented`;
    }
    async estimateEffort(task) {
        // Estimate based on task type and specialization match
        const baseEffort = task.complexity || 5;
        const specializationBonus = task.type === this.specialization ? 0.8 : 1.0;
        return Math.round(baseEffort * specializationBonus);
    }
}
exports.WorkerAgent = WorkerAgent;
/**
 * Scout Agent - Research and exploration
 */
class ScoutAgent extends base_agent_js_1.BaseAgent {
    constructor(id, config, environment, logger, eventBus, memory) {
        super(id, 'researcher', config, environment, logger, eventBus, memory);
    }
    getDefaultCapabilities() {
        return {
            // Core capabilities
            codeGeneration: false,
            codeReview: false,
            testing: false,
            documentation: true,
            research: true,
            analysis: true,
            // Communication capabilities
            webSearch: true,
            apiIntegration: true,
            fileSystem: false,
            terminalAccess: false,
            // Specialized capabilities
            languages: [],
            frameworks: [],
            domains: ['research', 'analysis', 'discovery'],
            tools: ['web-search', 'data-analysis'],
            // Resource limits
            maxConcurrentTasks: 4,
            maxMemoryUsage: 768,
            maxExecutionTime: 300000,
            // Performance characteristics
            reliability: 0.85,
            speed: 0.95,
            quality: 0.9,
        };
    }
    getDefaultConfig() {
        return {
            autonomyLevel: 0.9,
            learningEnabled: true,
            adaptationEnabled: true,
            maxTasksPerHour: 25,
            maxConcurrentTasks: 4,
            timeoutThreshold: 45000,
            reportingInterval: 8000,
            heartbeatInterval: 12000,
            permissions: ['research', 'analyze', 'web-search'],
        };
    }
    async executeTask(task) {
        // Scout agent execution logic
        return {
            result: 'researched',
            taskId: task.id,
            findings: [],
            timestamp: new Date().toISOString(),
        };
    }
    getSystemPrompt() {
        return `You are ${this.id}, a Scout agent in the Hive Mind swarm.

ROLE: Research and Exploration Specialist
- Explore new territories and solutions
- Research best practices and patterns
- Identify potential risks and opportunities
- Gather intelligence for the swarm

RESPONSIBILITIES:
1. Information gathering
2. Technology research
3. Risk assessment
4. Opportunity identification
5. Knowledge synthesis

SCOUTING PROTOCOL:
- Proactively investigate unknowns
- Report findings to swarm
- Suggest new approaches
- Validate assumptions

COMMUNICATION STYLE:
- Curious and investigative
- Evidence-based
- Forward-thinking
- Risk-aware`;
    }
    async scout(topic) {
        return {
            findings: [`Best practices for ${topic}`, `Common pitfalls in ${topic}`],
            risks: ['Technical debt', 'Scalability concerns'],
            opportunities: ['New framework available', 'Performance optimization possible'],
            recommendations: ['Consider microservices', 'Implement caching'],
        };
    }
}
exports.ScoutAgent = ScoutAgent;
/**
 * Guardian Agent - Quality and validation
 */
class GuardianAgent extends base_agent_js_1.BaseAgent {
    constructor(id, config, environment, logger, eventBus, memory) {
        super(id, 'reviewer', config, environment, logger, eventBus, memory);
    }
    getDefaultCapabilities() {
        return {
            // Core capabilities
            codeGeneration: false,
            codeReview: true,
            testing: true,
            documentation: false,
            research: false,
            analysis: true,
            // Communication capabilities
            webSearch: false,
            apiIntegration: false,
            fileSystem: true,
            terminalAccess: false,
            // Specialized capabilities
            languages: ['javascript', 'typescript'],
            frameworks: ['jest', 'eslint'],
            domains: ['quality-assurance', 'security', 'review'],
            tools: ['linting', 'testing', 'security-scan'],
            // Resource limits
            maxConcurrentTasks: 2,
            maxMemoryUsage: 512,
            maxExecutionTime: 180000,
            // Performance characteristics
            reliability: 0.98,
            speed: 0.7,
            quality: 0.95,
        };
    }
    getDefaultConfig() {
        return {
            autonomyLevel: 0.6,
            learningEnabled: true,
            adaptationEnabled: false,
            maxTasksPerHour: 10,
            maxConcurrentTasks: 2,
            timeoutThreshold: 90000,
            reportingInterval: 15000,
            heartbeatInterval: 20000,
            permissions: ['review', 'test', 'validate'],
        };
    }
    async executeTask(task) {
        // Guardian agent execution logic
        return {
            result: 'reviewed',
            taskId: task.id,
            quality: 'high',
            timestamp: new Date().toISOString(),
        };
    }
    getSystemPrompt() {
        return `You are ${this.id}, a Guardian agent in the Hive Mind swarm.

ROLE: Quality Assurance and Protection
- Ensure code quality and standards
- Identify security vulnerabilities
- Validate implementations
- Protect swarm from errors

RESPONSIBILITIES:
1. Code review
2. Security analysis
3. Quality validation
4. Standard enforcement
5. Risk mitigation

GUARDIAN PROTOCOL:
- Review all implementations
- Flag potential issues
- Suggest improvements
- Enforce best practices

COMMUNICATION STYLE:
- Protective and thorough
- Constructive criticism
- Standards-focused
- Security-minded`;
    }
    async validateWork(work) {
        return {
            qualityScore: 0.85,
            issues: ['Missing error handling', 'Incomplete tests'],
            securityConcerns: ['Input validation needed'],
            recommendations: ['Add unit tests', 'Implement logging'],
            approved: true,
        };
    }
}
exports.GuardianAgent = GuardianAgent;
/**
 * Architect Agent - System design and planning
 */
class ArchitectAgent extends base_agent_js_1.BaseAgent {
    constructor(id, config, environment, logger, eventBus, memory) {
        super(id, 'architect', config, environment, logger, eventBus, memory);
    }
    getDefaultCapabilities() {
        return {
            // Core capabilities
            codeGeneration: false,
            codeReview: true,
            testing: false,
            documentation: true,
            research: true,
            analysis: true,
            // Communication capabilities
            webSearch: true,
            apiIntegration: false,
            fileSystem: true,
            terminalAccess: false,
            // Specialized capabilities
            languages: ['javascript', 'typescript'],
            frameworks: ['architecture-patterns'],
            domains: ['system-design', 'architecture', 'planning'],
            tools: ['design-patterns', 'documentation'],
            // Resource limits
            maxConcurrentTasks: 2,
            maxMemoryUsage: 1024,
            maxExecutionTime: 240000,
            // Performance characteristics
            reliability: 0.92,
            speed: 0.75,
            quality: 0.95,
        };
    }
    getDefaultConfig() {
        return {
            autonomyLevel: 0.85,
            learningEnabled: true,
            adaptationEnabled: true,
            maxTasksPerHour: 8,
            maxConcurrentTasks: 2,
            timeoutThreshold: 120000,
            reportingInterval: 20000,
            heartbeatInterval: 25000,
            permissions: ['design', 'plan', 'architect'],
        };
    }
    async executeTask(task) {
        // Architect agent execution logic
        return {
            result: 'designed',
            taskId: task.id,
            architecture: 'planned',
            timestamp: new Date().toISOString(),
        };
    }
    getSystemPrompt() {
        return `You are ${this.id}, an Architect agent in the Hive Mind swarm.

ROLE: System Design and Architecture
- Design system architecture
- Plan technical solutions
- Define interfaces and contracts
- Ensure scalability and maintainability

RESPONSIBILITIES:
1. System architecture design
2. Technical planning
3. Interface definition
4. Pattern selection
5. Documentation

ARCHITECTURE PROTOCOL:
- Design before implementation
- Consider all requirements
- Plan for scalability
- Document decisions

COMMUNICATION STYLE:
- Strategic and systematic
- Pattern-focused
- Future-oriented
- Technically detailed`;
    }
    async designSystem(requirements) {
        return {
            architecture: 'microservices',
            components: ['API Gateway', 'Auth Service', 'Business Logic', 'Database'],
            patterns: ['Repository', 'Factory', 'Observer'],
            technologies: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
            interfaces: ['REST API', 'WebSocket', 'Message Queue'],
        };
    }
}
exports.ArchitectAgent = ArchitectAgent;
/**
 * Factory for creating Hive agents
 */
class HiveAgentFactory {
    static createAgent(config, agentConfig, environment, logger, eventBus, memory) {
        switch (config.type) {
            case 'queen':
                return new QueenAgent(config.name, agentConfig, environment, logger, eventBus, memory);
            case 'worker':
                return new WorkerAgent(config.name, agentConfig, environment, logger, eventBus, memory, config.specialization);
            case 'scout':
                return new ScoutAgent(config.name, agentConfig, environment, logger, eventBus, memory);
            case 'guardian':
                return new GuardianAgent(config.name, agentConfig, environment, logger, eventBus, memory);
            case 'architect':
                return new ArchitectAgent(config.name, agentConfig, environment, logger, eventBus, memory);
            default:
                throw new Error(`Unknown Hive agent type: ${config.type}`);
        }
    }
    /**
     * Create a balanced swarm for an objective
     */
    static createBalancedSwarm(objective, maxAgents = 8, agentConfig, environment, logger, eventBus, memory) {
        const agents = [];
        // Always include a Queen
        agents.push(new QueenAgent('Queen-Genesis', agentConfig, environment, logger, eventBus, memory));
        // Determine agent composition based on objective
        const needsDesign = objective.toLowerCase().includes('build') || objective.toLowerCase().includes('create');
        const needsResearch = objective.toLowerCase().includes('research') || objective.toLowerCase().includes('analyze');
        if (needsDesign && agents.length < maxAgents) {
            agents.push(new ArchitectAgent('Architect-Prime', agentConfig, environment, logger, eventBus, memory));
        }
        if (needsResearch && agents.length < maxAgents) {
            agents.push(new ScoutAgent('Scout-Alpha', agentConfig, environment, logger, eventBus, memory));
        }
        // Add workers based on remaining slots
        const workerCount = Math.min(3, maxAgents - agents.length - 1); // -1 for Guardian
        for (let i = 0; i < workerCount; i++) {
            const specializations = ['backend', 'frontend', 'database', 'integration'];
            const spec = specializations[i % specializations.length];
            agents.push(new WorkerAgent(`Worker-${i + 1}`, agentConfig, environment, logger, eventBus, memory, spec));
        }
        // Always include a Guardian if space
        if (agents.length < maxAgents) {
            agents.push(new GuardianAgent('Guardian-Omega', agentConfig, environment, logger, eventBus, memory));
        }
        return agents;
    }
    /**
     * Get agent capabilities matrix
     */
    static getCapabilitiesMatrix() {
        return new Map([
            ['queen', ['orchestration', 'consensus', 'decision-making', 'delegation']],
            ['worker', ['implementation', 'coding', 'testing', 'debugging']],
            ['scout', ['research', 'exploration', 'analysis', 'discovery']],
            ['guardian', ['validation', 'security', 'quality', 'review']],
            ['architect', ['design', 'planning', 'architecture', 'patterns']],
        ]);
    }
}
exports.HiveAgentFactory = HiveAgentFactory;
//# sourceMappingURL=hive-agents.js.map