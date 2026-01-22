/**
 * Task Engine Core - Comprehensive task management with orchestration features
 * Integrates with TodoWrite/TodoRead for coordination and Memory for persistence
 */
import { EventEmitter } from 'events';
import type { Task, TaskStatus } from '../utils/types.js';
import type { TaskMetadata } from './types.js';
export interface TaskDependency {
    taskId: string;
    type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
    lag?: number;
}
export interface ResourceRequirement {
    resourceId: string;
    type: 'cpu' | 'memory' | 'disk' | 'network' | 'custom';
    amount: number;
    unit: string;
    exclusive?: boolean;
    priority?: number;
}
export interface TaskSchedule {
    startTime?: Date;
    endTime?: Date;
    deadline?: Date;
    recurring?: {
        interval: 'daily' | 'weekly' | 'monthly';
        count?: number;
        until?: Date;
    };
    timezone?: string;
}
export interface WorkflowTask extends Omit<Task, 'dependencies' | 'metadata'> {
    dependencies: TaskDependency[];
    resourceRequirements: ResourceRequirement[];
    schedule?: TaskSchedule;
    retryPolicy?: {
        maxAttempts: number;
        backoffMs: number;
        backoffMultiplier: number;
    };
    timeout?: number;
    tags: string[];
    estimatedDurationMs?: number;
    actualDurationMs?: number;
    progressPercentage: number;
    checkpoints: TaskCheckpoint[];
    rollbackStrategy?: 'previous-checkpoint' | 'initial-state' | 'custom';
    customRollbackHandler?: string;
    metadata: TaskMetadata;
}
export interface TaskCheckpoint {
    id: string;
    timestamp: Date;
    description: string;
    state: Record<string, unknown>;
    artifacts: string[];
}
export interface TaskExecution {
    id: string;
    taskId: string;
    agentId: string;
    startedAt: Date;
    completedAt?: Date;
    status: TaskStatus;
    progress: number;
    metrics: TaskMetrics;
    logs: TaskLog[];
}
export interface TaskMetrics {
    cpuUsage: number;
    memoryUsage: number;
    diskIO: number;
    networkIO: number;
    customMetrics: Record<string, number>;
}
export interface TaskLog {
    timestamp: Date;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    metadata?: Record<string, unknown>;
}
export interface Workflow {
    id: string;
    name: string;
    description: string;
    version: string;
    tasks: WorkflowTask[];
    variables: Record<string, unknown>;
    parallelism: {
        maxConcurrent: number;
        strategy: 'breadth-first' | 'depth-first' | 'priority-based';
    };
    errorHandling: {
        strategy: 'fail-fast' | 'continue-on-error' | 'retry-failed';
        maxRetries: number;
    };
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}
export interface TaskFilter {
    status?: TaskStatus[];
    assignedAgent?: string[];
    priority?: {
        min?: number;
        max?: number;
    };
    tags?: string[];
    createdAfter?: Date;
    createdBefore?: Date;
    dueBefore?: Date;
    search?: string;
}
export interface TaskSort {
    field: 'createdAt' | 'priority' | 'deadline' | 'status' | 'estimatedDuration';
    direction: 'asc' | 'desc';
}
export declare class TaskEngine extends EventEmitter {
    private maxConcurrent;
    private memoryManager?;
    private tasks;
    private executions;
    private workflows;
    private resources;
    private dependencyGraph;
    private readyQueue;
    private runningTasks;
    private cancelledTasks;
    private taskState;
    constructor(maxConcurrent?: number, memoryManager?: any | undefined);
    private setupEventHandlers;
    /**
     * Create a new task with comprehensive options
     */
    createTask(taskData: Partial<WorkflowTask>): Promise<WorkflowTask>;
    /**
     * List tasks with filtering and sorting
     */
    listTasks(filter?: TaskFilter, sort?: TaskSort, limit?: number, offset?: number): Promise<{
        tasks: WorkflowTask[];
        total: number;
        hasMore: boolean;
    }>;
    /**
     * Get detailed task status with progress and metrics
     */
    getTaskStatus(taskId: string): Promise<{
        task: WorkflowTask;
        execution?: TaskExecution;
        dependencies: {
            task: WorkflowTask;
            satisfied: boolean;
        }[];
        dependents: WorkflowTask[];
        resourceStatus: {
            required: ResourceRequirement;
            available: boolean;
            allocated: boolean;
        }[];
    } | null>;
    /**
     * Cancel task with rollback and cleanup
     */
    cancelTask(taskId: string, reason?: string, rollback?: boolean): Promise<void>;
    /**
     * Execute workflow with parallel processing
     */
    executeWorkflow(workflow: Workflow): Promise<void>;
    /**
     * Create workflow from tasks
     */
    createWorkflow(workflowData: Partial<Workflow>): Promise<Workflow>;
    /**
     * Get dependency visualization
     */
    getDependencyGraph(): {
        nodes: any[];
        edges: any[];
    };
    private updateDependencyGraph;
    private scheduleTask;
    private areTaskDependenciesSatisfied;
    private isDependencySatisfied;
    private processReadyQueue;
    private executeTask;
    private simulateTaskExecution;
    private createCheckpoint;
    private rollbackTask;
    private acquireTaskResources;
    private releaseTaskResources;
    private matchesSearch;
    private processWorkflow;
    private handleTaskCreated;
    private handleTaskCompleted;
    private handleTaskFailed;
    private handleTaskCancelled;
}
//# sourceMappingURL=engine.d.ts.map