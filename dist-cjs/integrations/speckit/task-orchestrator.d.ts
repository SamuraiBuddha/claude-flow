/**
 * Task Orchestrator - Parse tasks.md and orchestrate multi-agent task execution
 *
 * Responsibilities:
 * - Parse spec-kit tasks.md format into structured task data
 * - Build dependency DAG from parsed tasks
 * - Identify parallelizable task sets
 * - Coordinate agent assignment and track progress
 * - Critical path analysis and bottleneck detection
 */
import { EventEmitter } from 'node:events';
import { DependencyGraph, type TaskPriority, type CriticalPathResult, type ParallelBatch } from './dependency-graph.js';
import type { AgentType } from '../../swarm/types.js';
export interface ParsedTask {
    id: string;
    name: string;
    description: string;
    priority: TaskPriority;
    estimatedDuration: number;
    dependencies: string[];
    parallelizable: boolean;
    agentType: AgentType | null;
    tags: string[];
    status: TaskStatus;
    section: string;
    metadata: Record<string, unknown>;
}
export type TaskStatus = 'pending' | 'ready' | 'assigned' | 'in_progress' | 'completed' | 'failed' | 'blocked' | 'cancelled';
export interface TaskSection {
    name: string;
    tasks: ParsedTask[];
    subsections: TaskSection[];
}
export interface OrchestratorConfig {
    maxParallelTasks: number;
    defaultEstimatedDuration: number;
    priorityWeights: Record<TaskPriority, number>;
    enableCriticalPathOptimization: boolean;
    autoAssignAgents: boolean;
}
export interface OrchestratorState {
    pendingTasks: Set<string>;
    readyTasks: Set<string>;
    runningTasks: Set<string>;
    completedTasks: Set<string>;
    failedTasks: Set<string>;
    blockedTasks: Set<string>;
}
export interface TaskAssignment {
    taskId: string;
    agentId: string;
    agentType: AgentType;
    assignedAt: Date;
    estimatedCompletion: Date;
}
export declare class TaskOrchestrator extends EventEmitter {
    private graph;
    private tasks;
    private assignments;
    private state;
    private config;
    private sections;
    constructor(config?: Partial<OrchestratorConfig>);
    /**
     * Parse a tasks.md file content and build the dependency graph
     */
    parseTasksMarkdown(content: string): ParsedTask[];
    /**
     * Parse a single task line into a ParsedTask object
     */
    private parseTaskLine;
    /**
     * Generate a unique task ID from the task name
     */
    private generateTaskId;
    /**
     * Build the dependency graph from parsed tasks
     */
    buildDependencyGraph(tasks?: ParsedTask[]): DependencyGraph;
    /**
     * Find a task by ID or partial name match
     */
    private findTaskByIdOrName;
    /**
     * Update the set of ready tasks based on current state
     */
    private updateReadyTasks;
    /**
     * Get sets of tasks that can be executed in parallel
     */
    getParallelSets(): ParallelBatch[];
    /**
     * Get tasks that are ready for immediate execution
     */
    getReadyTasks(): ParsedTask[];
    /**
     * Get tasks that can run in parallel right now
     * Considers both task dependencies and parallel markers
     */
    getParallelizableReadyTasks(): ParsedTask[];
    /**
     * Assign tasks to agents
     * Returns a map of task assignments
     */
    assignToAgents(availableAgents: Array<{
        id: string;
        type: AgentType;
        workload: number;
    }>): TaskAssignment[];
    /**
     * Calculate how suitable an agent type is for a task
     */
    private calculateAgentSuitability;
    /**
     * Track progress of task execution
     */
    trackProgress(): {
        total: number;
        completed: number;
        failed: number;
        running: number;
        ready: number;
        blocked: number;
        percentComplete: number;
        estimatedTimeRemaining: number;
    };
    /**
     * Mark a task as started
     */
    startTask(taskId: string): void;
    /**
     * Mark a task as completed
     */
    completeTask(taskId: string, result?: unknown): void;
    /**
     * Mark a task as failed
     */
    failTask(taskId: string, error: Error | string): void;
    /**
     * Get the critical path through the task graph
     */
    getCriticalPath(): CriticalPathResult;
    /**
     * Get bottleneck tasks
     */
    getBottlenecks(): Array<{
        taskId: string;
        blockedCount: number;
        impact: number;
    }>;
    /**
     * Optimize task scheduling based on critical path
     * Returns reordered tasks with recommendations
     */
    optimizeSchedule(): {
        criticalPath: string[];
        recommendations: string[];
        parallelOpportunities: string[][];
    };
    /**
     * Get all tasks
     */
    getAllTasks(): ParsedTask[];
    /**
     * Get a specific task by ID
     */
    getTask(taskId: string): ParsedTask | undefined;
    /**
     * Get the underlying dependency graph
     */
    getGraph(): DependencyGraph;
    /**
     * Export to Mermaid diagram
     */
    toMermaid(): string;
    /**
     * Get tasks grouped by section
     */
    getTasksBySection(): Map<string, ParsedTask[]>;
    /**
     * Get tasks by status
     */
    getTasksByStatus(status: TaskStatus): ParsedTask[];
    /**
     * Get tasks by priority
     */
    getTasksByPriority(priority: TaskPriority): ParsedTask[];
    /**
     * Get tasks assigned to a specific agent type
     */
    getTasksByAgentType(agentType: AgentType): ParsedTask[];
    /**
     * Clear all data and reset state
     */
    reset(): void;
}
export default TaskOrchestrator;
//# sourceMappingURL=task-orchestrator.d.ts.map