"use strict";
/**
 * Agent Assignment - Intelligent task-to-agent matching and load balancing
 *
 * Responsibilities:
 * - Match tasks to agent capabilities
 * - Load balancing across available agents
 * - Priority-based assignment (P1 > P2 > P3)
 * - Dynamic workload management and rebalancing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentAssignment = void 0;
const node_events_1 = require("node:events");
// ===== AGENT ASSIGNMENT CLASS =====
class AgentAssignment extends node_events_1.EventEmitter {
    agents = new Map();
    taskAssignments = new Map(); // taskId -> agentId
    agentTaskQueues = new Map(); // agentId -> taskIds
    taskAffinities = new Map(); // agentId -> (capability -> score)
    config;
    constructor(config = {}) {
        super();
        this.config = {
            loadBalancingStrategy: config.loadBalancingStrategy ?? 'hybrid',
            maxWorkloadThreshold: config.maxWorkloadThreshold ?? 0.85,
            priorityBoost: config.priorityBoost ?? { P1: 30, P2: 15, P3: 5 },
            capabilityWeight: config.capabilityWeight ?? 40,
            workloadWeight: config.workloadWeight ?? 30,
            reliabilityWeight: config.reliabilityWeight ?? 20,
            affinityWeight: config.affinityWeight ?? 10,
        };
    }
    // ===== AGENT MANAGEMENT =====
    /**
     * Register an agent with the assignment system
     */
    registerAgent(agent) {
        this.agents.set(agent.id, agent);
        this.agentTaskQueues.set(agent.id, []);
        this.taskAffinities.set(agent.id, new Map());
        this.emit('agent:registered', { agent });
    }
    /**
     * Unregister an agent
     */
    unregisterAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return [];
        // Get tasks that need reassignment
        const orphanedTasks = this.agentTaskQueues.get(agentId) ?? [];
        // Clean up
        this.agents.delete(agentId);
        this.agentTaskQueues.delete(agentId);
        this.taskAffinities.delete(agentId);
        // Remove task assignments
        for (const taskId of orphanedTasks) {
            this.taskAssignments.delete(taskId);
        }
        this.emit('agent:unregistered', { agentId, orphanedTasks });
        return orphanedTasks;
    }
    /**
     * Update agent status and metrics
     */
    updateAgent(agentId, updates) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        Object.assign(agent, updates);
        // Recalculate workload
        agent.workload = this.calculateWorkload(agent);
        // Update status based on workload
        if (agent.workload >= 1) {
            agent.status = 'overloaded';
        }
        else if (agent.workload > 0) {
            agent.status = 'busy';
        }
        else {
            agent.status = 'idle';
        }
        this.emit('agent:updated', { agent });
    }
    /**
     * Get agent information
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
        return Array.from(this.agents.values()).filter(a => a.type === type);
    }
    /**
     * Get available agents (not overloaded)
     */
    getAvailableAgents() {
        return Array.from(this.agents.values()).filter(a => a.status !== 'overloaded' && a.status !== 'offline' && a.status !== 'error');
    }
    // ===== TASK ASSIGNMENT =====
    /**
     * Assign a task to the best available agent
     */
    assignTask(task, constraints = {}) {
        const candidates = this.findCandidateAgents(task, constraints);
        if (candidates.length === 0) {
            this.emit('assignment:failed', {
                taskId: task.id,
                reason: 'No suitable agents available',
            });
            return null;
        }
        // Score each candidate
        const scoredCandidates = candidates.map(agent => ({
            agent,
            score: this.calculateAssignmentScore(agent, task, constraints),
        }));
        // Sort by score (highest first)
        scoredCandidates.sort((a, b) => b.score.total - a.score.total);
        const winner = scoredCandidates[0];
        const agent = winner.agent;
        // Calculate estimated times
        const queue = this.agentTaskQueues.get(agent.id) ?? [];
        const queueTime = queue.length * agent.averageTaskDuration;
        const estimatedStart = new Date(Date.now() + queueTime * 60 * 1000);
        const estimatedCompletion = new Date(estimatedStart.getTime() + task.estimatedDuration * 60 * 1000);
        // Perform assignment
        this.taskAssignments.set(task.id, agent.id);
        queue.push(task.id);
        this.agentTaskQueues.set(agent.id, queue);
        // Update agent
        agent.currentTasks.push(task.id);
        agent.lastAssignedAt = new Date();
        this.updateAgent(agent.id, {});
        // Build affinity
        this.buildAffinity(agent.id, task);
        const result = {
            taskId: task.id,
            agentId: agent.id,
            score: winner.score.total,
            reason: this.formatScoreReason(winner.score),
            estimatedStart,
            estimatedCompletion,
        };
        this.emit('task:assigned', { result, task, agent });
        return result;
    }
    /**
     * Find candidate agents for a task
     */
    findCandidateAgents(task, constraints) {
        let candidates = this.getAvailableAgents();
        // Filter by max workload
        const maxWorkload = constraints.maxWorkload ?? this.config.maxWorkloadThreshold;
        candidates = candidates.filter(a => a.workload < maxWorkload);
        // Filter by excluded agents
        if (constraints.excludedAgents && constraints.excludedAgents.length > 0) {
            const excluded = new Set(constraints.excludedAgents);
            candidates = candidates.filter(a => !excluded.has(a.id));
        }
        // Prefer agents of specific types if specified
        if (constraints.preferredAgentTypes && constraints.preferredAgentTypes.length > 0) {
            const preferred = candidates.filter(a => constraints.preferredAgentTypes.includes(a.type));
            if (preferred.length > 0) {
                candidates = preferred;
            }
        }
        // Filter by required capabilities
        if (constraints.requiresCapabilities && constraints.requiresCapabilities.length > 0) {
            candidates = candidates.filter(a => this.agentHasCapabilities(a, constraints.requiresCapabilities));
        }
        // If task specifies an agent type, prefer that type
        if (task.agentType) {
            const typedAgents = candidates.filter(a => a.type === task.agentType);
            if (typedAgents.length > 0) {
                candidates = typedAgents;
            }
        }
        return candidates;
    }
    /**
     * Check if an agent has required capabilities
     */
    agentHasCapabilities(agent, required) {
        const agentCapabilities = new Set([
            ...agent.capabilities.languages,
            ...agent.capabilities.frameworks,
            ...agent.capabilities.domains,
            ...agent.capabilities.tools,
            ...agent.specializations,
        ]);
        // Add boolean capabilities
        if (agent.capabilities.codeGeneration)
            agentCapabilities.add('codeGeneration');
        if (agent.capabilities.codeReview)
            agentCapabilities.add('codeReview');
        if (agent.capabilities.testing)
            agentCapabilities.add('testing');
        if (agent.capabilities.documentation)
            agentCapabilities.add('documentation');
        if (agent.capabilities.research)
            agentCapabilities.add('research');
        if (agent.capabilities.analysis)
            agentCapabilities.add('analysis');
        for (const cap of required) {
            if (!agentCapabilities.has(cap))
                return false;
        }
        return true;
    }
    /**
     * Calculate assignment score for an agent-task pair
     */
    calculateAssignmentScore(agent, task, constraints) {
        const breakdown = [];
        // Capability score
        const capabilityScore = this.calculateCapabilityScore(agent, task);
        const weightedCapability = capabilityScore * (this.config.capabilityWeight / 100);
        breakdown.push(`Capability: ${capabilityScore.toFixed(1)}`);
        // Workload score (lower workload = higher score)
        const workloadScore = (1 - agent.workload) * 100;
        const weightedWorkload = workloadScore * (this.config.workloadWeight / 100);
        breakdown.push(`Workload: ${workloadScore.toFixed(1)} (current: ${(agent.workload * 100).toFixed(0)}%)`);
        // Reliability score
        const reliabilityScore = agent.reliability * 100;
        const weightedReliability = reliabilityScore * (this.config.reliabilityWeight / 100);
        breakdown.push(`Reliability: ${reliabilityScore.toFixed(1)}`);
        // Affinity score (based on past task performance)
        const affinityScore = this.calculateAffinityScore(agent.id, task);
        const weightedAffinity = affinityScore * (this.config.affinityWeight / 100);
        breakdown.push(`Affinity: ${affinityScore.toFixed(1)}`);
        // Priority boost
        const priorityBoost = this.config.priorityBoost[task.priority];
        breakdown.push(`Priority boost: ${priorityBoost} (${task.priority})`);
        // Deadline urgency bonus
        let urgencyBonus = 0;
        if (constraints.deadline) {
            const timeUntilDeadline = constraints.deadline.getTime() - Date.now();
            const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
            if (hoursUntilDeadline < 24) {
                urgencyBonus = 20;
                breakdown.push(`Urgency bonus: ${urgencyBonus} (deadline < 24h)`);
            }
            else if (hoursUntilDeadline < 72) {
                urgencyBonus = 10;
                breakdown.push(`Urgency bonus: ${urgencyBonus} (deadline < 72h)`);
            }
        }
        const total = weightedCapability +
            weightedWorkload +
            weightedReliability +
            weightedAffinity +
            priorityBoost +
            urgencyBonus;
        return {
            total,
            capability: capabilityScore,
            workload: workloadScore,
            reliability: reliabilityScore,
            affinity: affinityScore,
            priority: priorityBoost,
            breakdown,
        };
    }
    /**
     * Calculate capability match score
     */
    calculateCapabilityScore(agent, task) {
        let score = 0;
        let maxScore = 0;
        // Agent type match
        maxScore += 30;
        if (task.agentType && agent.type === task.agentType) {
            score += 30;
        }
        else if (!task.agentType) {
            score += 15; // Neutral if no specific type required
        }
        // Task name keyword matching
        const taskKeywords = this.extractKeywords(task.name);
        const agentKeywords = this.getAgentKeywords(agent);
        maxScore += 40;
        const keywordMatches = taskKeywords.filter(k => agentKeywords.has(k)).length;
        score += (keywordMatches / Math.max(1, taskKeywords.length)) * 40;
        // Tag matching
        maxScore += 30;
        const tagMatches = task.tags.filter(t => agentKeywords.has(t.toLowerCase()) ||
            agent.specializations.includes(t.toLowerCase())).length;
        score += (tagMatches / Math.max(1, task.tags.length)) * 30;
        return (score / maxScore) * 100;
    }
    /**
     * Extract keywords from task name
     */
    extractKeywords(name) {
        return name
            .toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 3)
            .map(w => w.replace(/[^a-z0-9]/g, ''));
    }
    /**
     * Get keywords associated with an agent
     */
    getAgentKeywords(agent) {
        const keywords = new Set();
        // Add type-based keywords
        const typeKeywords = {
            coder: ['code', 'develop', 'implement', 'build', 'create', 'api', 'database', 'backend', 'frontend'],
            researcher: ['research', 'investigate', 'analyze', 'gather', 'study', 'explore'],
            analyst: ['analyze', 'data', 'metrics', 'report', 'statistics', 'insights'],
            architect: ['design', 'architecture', 'system', 'infrastructure', 'plan'],
            tester: ['test', 'validate', 'verify', 'qa', 'quality', 'bug'],
            reviewer: ['review', 'audit', 'inspect', 'evaluate', 'assess'],
            coordinator: ['coordinate', 'manage', 'plan', 'schedule', 'organize'],
            specialist: [],
            optimizer: ['optimize', 'performance', 'speed', 'efficiency'],
            documenter: ['document', 'docs', 'readme', 'documentation'],
            monitor: ['monitor', 'watch', 'alert', 'health', 'status'],
        };
        for (const keyword of typeKeywords[agent.type] ?? []) {
            keywords.add(keyword);
        }
        // Add capability-based keywords
        for (const lang of agent.capabilities.languages) {
            keywords.add(lang.toLowerCase());
        }
        for (const framework of agent.capabilities.frameworks) {
            keywords.add(framework.toLowerCase());
        }
        for (const domain of agent.capabilities.domains) {
            keywords.add(domain.toLowerCase());
        }
        for (const tool of agent.capabilities.tools) {
            keywords.add(tool.toLowerCase());
        }
        for (const spec of agent.specializations) {
            keywords.add(spec.toLowerCase());
        }
        return keywords;
    }
    /**
     * Calculate affinity score based on past performance
     */
    calculateAffinityScore(agentId, task) {
        const affinities = this.taskAffinities.get(agentId);
        if (!affinities)
            return 50; // Neutral score
        let score = 50;
        const taskKeywords = this.extractKeywords(task.name);
        for (const keyword of taskKeywords) {
            const affinity = affinities.get(keyword);
            if (affinity !== undefined) {
                score += affinity * 5; // Each positive affinity adds points
            }
        }
        return Math.min(100, Math.max(0, score));
    }
    /**
     * Build affinity between agent and task keywords
     */
    buildAffinity(agentId, task) {
        const affinities = this.taskAffinities.get(agentId) ?? new Map();
        const keywords = this.extractKeywords(task.name);
        for (const keyword of keywords) {
            const current = affinities.get(keyword) ?? 0;
            affinities.set(keyword, current + 1);
        }
        this.taskAffinities.set(agentId, affinities);
    }
    /**
     * Format score breakdown as human-readable reason
     */
    formatScoreReason(score) {
        return `Score: ${score.total.toFixed(1)} (${score.breakdown.join(', ')})`;
    }
    // ===== WORKLOAD MANAGEMENT =====
    /**
     * Get agent workload
     */
    getAgentWorkload(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return null;
        const queue = this.agentTaskQueues.get(agentId) ?? [];
        return {
            agentId: agent.id,
            agentType: agent.type,
            currentTasks: agent.currentTasks.length,
            maxTasks: agent.maxConcurrentTasks,
            workload: agent.workload,
            queuedTasks: queue.length - agent.currentTasks.length,
        };
    }
    /**
     * Get workload for all agents
     */
    getAllWorkloads() {
        return Array.from(this.agents.values()).map(agent => ({
            agentId: agent.id,
            agentType: agent.type,
            currentTasks: agent.currentTasks.length,
            maxTasks: agent.maxConcurrentTasks,
            workload: agent.workload,
            queuedTasks: (this.agentTaskQueues.get(agent.id)?.length ?? 0) - agent.currentTasks.length,
        }));
    }
    /**
     * Calculate workload for an agent
     */
    calculateWorkload(agent) {
        return agent.currentTasks.length / agent.maxConcurrentTasks;
    }
    /**
     * Rebalance tasks across agents
     */
    rebalance() {
        const moved = [];
        const recommendations = [];
        const agents = Array.from(this.agents.values());
        // Find overloaded and underloaded agents
        const overloaded = agents.filter(a => a.workload > this.config.maxWorkloadThreshold);
        const underloaded = agents.filter(a => a.workload < 0.3 && a.status !== 'offline' && a.status !== 'error');
        if (overloaded.length === 0) {
            recommendations.push('No agents are overloaded. Workload is balanced.');
            return { moved, recommendations };
        }
        if (underloaded.length === 0) {
            recommendations.push('All agents are busy. Consider adding more agents.');
            return { moved, recommendations };
        }
        // Move tasks from overloaded to underloaded
        for (const overloadedAgent of overloaded) {
            const queue = this.agentTaskQueues.get(overloadedAgent.id) ?? [];
            // Get tasks that haven't started yet (queued, not running)
            const movableTasks = queue.filter(taskId => !overloadedAgent.currentTasks.includes(taskId));
            for (const taskId of movableTasks) {
                if (overloadedAgent.workload <= this.config.maxWorkloadThreshold)
                    break;
                // Find best underloaded agent for this task
                const bestTarget = underloaded
                    .filter(a => a.workload < 0.5)
                    .sort((a, b) => a.workload - b.workload)[0];
                if (!bestTarget)
                    continue;
                // Move the task
                const fromQueue = this.agentTaskQueues.get(overloadedAgent.id) ?? [];
                const toQueue = this.agentTaskQueues.get(bestTarget.id) ?? [];
                const taskIndex = fromQueue.indexOf(taskId);
                if (taskIndex !== -1) {
                    fromQueue.splice(taskIndex, 1);
                    toQueue.push(taskId);
                    this.taskAssignments.set(taskId, bestTarget.id);
                    this.agentTaskQueues.set(overloadedAgent.id, fromQueue);
                    this.agentTaskQueues.set(bestTarget.id, toQueue);
                    moved.push({
                        taskId,
                        fromAgent: overloadedAgent.id,
                        toAgent: bestTarget.id,
                        reason: `Rebalanced from overloaded agent (${(overloadedAgent.workload * 100).toFixed(0)}% -> ${(bestTarget.workload * 100).toFixed(0)}%)`,
                    });
                    // Update workloads
                    overloadedAgent.workload = this.calculateWorkload(overloadedAgent);
                    bestTarget.workload = toQueue.length / bestTarget.maxConcurrentTasks;
                    this.emit('task:rebalanced', {
                        taskId,
                        fromAgent: overloadedAgent.id,
                        toAgent: bestTarget.id,
                    });
                }
            }
        }
        if (moved.length === 0) {
            recommendations.push('Could not rebalance: all queued tasks are already running or no suitable targets.');
        }
        else {
            recommendations.push(`Rebalanced ${moved.length} task(s) to improve workload distribution.`);
        }
        // Additional recommendations
        const avgWorkload = agents.reduce((sum, a) => sum + a.workload, 0) / agents.length;
        if (avgWorkload > 0.7) {
            recommendations.push(`Average workload is high (${(avgWorkload * 100).toFixed(0)}%). Consider spawning additional agents.`);
        }
        const idleAgents = agents.filter(a => a.status === 'idle');
        if (idleAgents.length > agents.length * 0.3) {
            recommendations.push(`${idleAgents.length} agents are idle. Consider reducing agent pool or assigning more tasks.`);
        }
        return { moved, recommendations };
    }
    // ===== TASK COMPLETION =====
    /**
     * Mark a task as completed by an agent
     */
    completeTask(taskId, success = true) {
        const agentId = this.taskAssignments.get(taskId);
        if (!agentId)
            return;
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        // Remove from current tasks
        const taskIndex = agent.currentTasks.indexOf(taskId);
        if (taskIndex !== -1) {
            agent.currentTasks.splice(taskIndex, 1);
        }
        // Remove from queue
        const queue = this.agentTaskQueues.get(agentId) ?? [];
        const queueIndex = queue.indexOf(taskId);
        if (queueIndex !== -1) {
            queue.splice(queueIndex, 1);
        }
        // Update metrics
        if (success) {
            agent.completedTaskCount++;
            // Update reliability (exponential moving average)
            agent.reliability = agent.reliability * 0.9 + 0.1;
        }
        else {
            agent.failedTaskCount++;
            agent.reliability = agent.reliability * 0.9;
        }
        // Clean up
        this.taskAssignments.delete(taskId);
        // Update agent
        this.updateAgent(agentId, {});
        this.emit('task:completed', { taskId, agentId, success });
    }
    // ===== UTILITIES =====
    /**
     * Get assignment for a task
     */
    getTaskAssignment(taskId) {
        return this.taskAssignments.get(taskId);
    }
    /**
     * Get all assignments
     */
    getAllAssignments() {
        return new Map(this.taskAssignments);
    }
    /**
     * Clear all data
     */
    reset() {
        this.agents.clear();
        this.taskAssignments.clear();
        this.agentTaskQueues.clear();
        this.taskAffinities.clear();
        this.emit('assignment:reset', {});
    }
}
exports.AgentAssignment = AgentAssignment;
exports.default = AgentAssignment;
//# sourceMappingURL=agent-assignment.js.map