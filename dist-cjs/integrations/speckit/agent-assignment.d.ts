/**
 * Agent Assignment - Intelligent task-to-agent matching and load balancing
 *
 * Responsibilities:
 * - Match tasks to agent capabilities
 * - Load balancing across available agents
 * - Priority-based assignment (P1 > P2 > P3)
 * - Dynamic workload management and rebalancing
 */
import { EventEmitter } from 'node:events';
import type { AgentType, AgentCapabilities } from '../../swarm/types.js';
import type { ParsedTask } from './task-orchestrator.js';
import type { TaskPriority } from './dependency-graph.js';
export interface AgentInfo {
    id: string;
    type: AgentType;
    name: string;
    capabilities: AgentCapabilities;
    workload: number;
    maxConcurrentTasks: number;
    currentTasks: string[];
    completedTaskCount: number;
    failedTaskCount: number;
    averageTaskDuration: number;
    reliability: number;
    lastAssignedAt?: Date;
    status: AgentStatus;
    specializations: string[];
}
export type AgentStatus = 'idle' | 'busy' | 'overloaded' | 'offline' | 'error';
export interface AssignmentResult {
    taskId: string;
    agentId: string;
    score: number;
    reason: string;
    estimatedStart: Date;
    estimatedCompletion: Date;
}
export interface AssignmentConstraints {
    maxWorkload?: number;
    preferredAgentTypes?: AgentType[];
    excludedAgents?: string[];
    deadline?: Date;
    requiresCapabilities?: string[];
}
export interface WorkloadSnapshot {
    agentId: string;
    agentType: AgentType;
    currentTasks: number;
    maxTasks: number;
    workload: number;
    queuedTasks: number;
}
export interface RebalanceResult {
    moved: Array<{
        taskId: string;
        fromAgent: string;
        toAgent: string;
        reason: string;
    }>;
    recommendations: string[];
}
export interface AssignmentConfig {
    loadBalancingStrategy: 'round-robin' | 'least-loaded' | 'capability-first' | 'hybrid';
    maxWorkloadThreshold: number;
    priorityBoost: Record<TaskPriority, number>;
    capabilityWeight: number;
    workloadWeight: number;
    reliabilityWeight: number;
    affinityWeight: number;
}
export declare class AgentAssignment extends EventEmitter {
    private agents;
    private taskAssignments;
    private agentTaskQueues;
    private taskAffinities;
    private config;
    constructor(config?: Partial<AssignmentConfig>);
    /**
     * Register an agent with the assignment system
     */
    registerAgent(agent: AgentInfo): void;
    /**
     * Unregister an agent
     */
    unregisterAgent(agentId: string): string[];
    /**
     * Update agent status and metrics
     */
    updateAgent(agentId: string, updates: Partial<AgentInfo>): void;
    /**
     * Get agent information
     */
    getAgent(agentId: string): AgentInfo | undefined;
    /**
     * Get all registered agents
     */
    getAllAgents(): AgentInfo[];
    /**
     * Get agents by type
     */
    getAgentsByType(type: AgentType): AgentInfo[];
    /**
     * Get available agents (not overloaded)
     */
    getAvailableAgents(): AgentInfo[];
    /**
     * Assign a task to the best available agent
     */
    assignTask(task: ParsedTask, constraints?: AssignmentConstraints): AssignmentResult | null;
    /**
     * Find candidate agents for a task
     */
    private findCandidateAgents;
    /**
     * Check if an agent has required capabilities
     */
    private agentHasCapabilities;
    /**
     * Calculate assignment score for an agent-task pair
     */
    private calculateAssignmentScore;
    /**
     * Calculate capability match score
     */
    private calculateCapabilityScore;
    /**
     * Extract keywords from task name
     */
    private extractKeywords;
    /**
     * Get keywords associated with an agent
     */
    private getAgentKeywords;
    /**
     * Calculate affinity score based on past performance
     */
    private calculateAffinityScore;
    /**
     * Build affinity between agent and task keywords
     */
    private buildAffinity;
    /**
     * Format score breakdown as human-readable reason
     */
    private formatScoreReason;
    /**
     * Get agent workload
     */
    getAgentWorkload(agentId: string): WorkloadSnapshot | null;
    /**
     * Get workload for all agents
     */
    getAllWorkloads(): WorkloadSnapshot[];
    /**
     * Calculate workload for an agent
     */
    private calculateWorkload;
    /**
     * Rebalance tasks across agents
     */
    rebalance(): RebalanceResult;
    /**
     * Mark a task as completed by an agent
     */
    completeTask(taskId: string, success?: boolean): void;
    /**
     * Get assignment for a task
     */
    getTaskAssignment(taskId: string): string | undefined;
    /**
     * Get all assignments
     */
    getAllAssignments(): Map<string, string>;
    /**
     * Clear all data
     */
    reset(): void;
}
export default AgentAssignment;
//# sourceMappingURL=agent-assignment.d.ts.map