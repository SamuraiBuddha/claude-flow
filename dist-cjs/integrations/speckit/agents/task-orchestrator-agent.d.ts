/**
 * Task Orchestrator Agent
 *
 * Manages task execution, dependencies, and parallelization. Assigns tasks
 * to available agents and tracks completion status across the specification
 * workflow.
 *
 * @module TaskOrchestratorAgent
 */
import { BaseAgent } from '../../../cli/agents/base-agent.js';
import type { AgentCapabilities, AgentConfig, AgentEnvironment, TaskDefinition } from '../../../swarm/types.js';
import type { ILogger } from '../../../core/logger.js';
import type { IEventBus } from '../../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../../memory/distributed-memory.js';
/**
 * Task node in the dependency graph
 */
export interface TaskNode {
    id: string;
    name: string;
    description: string;
    type: string;
    dependencies: string[];
    dependents: string[];
    status: TaskNodeStatus;
    assignedAgent?: string;
    priority: number;
    estimatedDuration: number;
    actualDuration?: number;
    startedAt?: Date;
    completedAt?: Date;
    result?: any;
    error?: string;
    retryCount: number;
    maxRetries: number;
    metadata: Record<string, any>;
}
/**
 * Task execution status
 */
export type TaskNodeStatus = 'pending' | 'ready' | 'assigned' | 'running' | 'completed' | 'failed' | 'blocked' | 'cancelled';
/**
 * Dependency graph for task orchestration
 */
export interface TaskGraph {
    nodes: Map<string, TaskNode>;
    edges: Map<string, string[]>;
    criticalPath: string[];
    parallelGroups: string[][];
}
/**
 * Agent availability information
 */
export interface AgentAvailability {
    agentId: string;
    agentType: string;
    status: 'available' | 'busy' | 'offline';
    currentLoad: number;
    maxLoad: number;
    capabilities: string[];
    assignedTasks: string[];
    performance: {
        avgCompletionTime: number;
        successRate: number;
    };
}
/**
 * Task assignment decision
 */
export interface TaskAssignment {
    taskId: string;
    agentId: string;
    assignedAt: Date;
    reason: string;
    estimatedCompletion: Date;
    priority: number;
}
/**
 * Orchestration progress report
 */
export interface OrchestrationProgress {
    totalTasks: number;
    completedTasks: number;
    runningTasks: number;
    pendingTasks: number;
    failedTasks: number;
    blockedTasks: number;
    progressPercentage: number;
    estimatedCompletion: Date;
    criticalPathProgress: number;
    activeAgents: number;
}
/**
 * Task Orchestrator Agent - Manages task execution and dependencies
 */
export declare class TaskOrchestratorAgent extends BaseAgent {
    private taskGraph;
    private agentAvailability;
    private assignments;
    private completedTasks;
    constructor(id: string, config: AgentConfig, environment: AgentEnvironment, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem);
    /**
     * Get default capabilities for task orchestration
     */
    protected getDefaultCapabilities(): AgentCapabilities;
    /**
     * Get default configuration for the agent
     */
    protected getDefaultConfig(): Partial<AgentConfig>;
    /**
     * Execute a task orchestration task
     */
    executeTask(task: TaskDefinition): Promise<any>;
    /**
     * Parse tasks from specification or plan
     */
    private parseTasks;
    /**
     * Build dependency graph from tasks
     */
    private buildGraph;
    /**
     * Assign tasks to available agents
     */
    private assignAgents;
    /**
     * Track progress of task execution
     */
    private trackProgress;
    /**
     * Optimize the task schedule
     */
    private optimizeSchedule;
    /**
     * Handle task failure
     */
    private handleFailure;
    /**
     * Perform general orchestration
     */
    private performGeneralOrchestration;
    /**
     * Parse tasks from text/markdown
     */
    private parseTasksFromText;
    /**
     * Parse tasks from array
     */
    private parseTasksFromArray;
    /**
     * Parse tasks from structured object
     */
    private parseTasksFromObject;
    /**
     * Create a task node
     */
    private createTaskNode;
    /**
     * Calculate critical path using topological sort and longest path
     */
    private calculateCriticalPath;
    /**
     * Topological sort of task graph
     */
    private topologicalSort;
    /**
     * Identify groups of tasks that can run in parallel
     */
    private identifyParallelGroups;
    /**
     * Update task statuses based on dependencies
     */
    private updateTaskStatuses;
    /**
     * Find best agent for a task
     */
    private findBestAgent;
    /**
     * Get reason for assignment
     */
    private getAssignmentReason;
    /**
     * Calculate optimal agent assignments
     */
    private calculateOptimalAssignments;
    /**
     * Estimate total duration
     */
    private estimateTotalDuration;
    /**
     * Estimate optimized duration
     */
    private estimateOptimizedDuration;
    /**
     * Generate schedule recommendations
     */
    private generateScheduleRecommendations;
    /**
     * Find tasks impacted by a failure
     */
    private findImpactedTasks;
    /**
     * Setup orchestrator-specific events
     */
    private setupOrchestratorEvents;
    /**
     * Get agent status with orchestration-specific information
     */
    getAgentStatus(): any;
}
/**
 * Factory function to create a Task Orchestrator Agent
 */
export declare const createTaskOrchestratorAgent: (id: string, config: Partial<AgentConfig>, environment: Partial<AgentEnvironment>, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem) => TaskOrchestratorAgent;
//# sourceMappingURL=task-orchestrator-agent.d.ts.map