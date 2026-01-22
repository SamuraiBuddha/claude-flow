/**
 * Task Management System - Main Export
 * Comprehensive task management with orchestration features
 * Integrates with TodoWrite/TodoRead for coordination and Memory for persistence
 */
export { TaskEngine, type WorkflowTask, type TaskDependency, type ResourceRequirement, type TaskSchedule, type TaskExecution, type TaskMetrics, type TaskLog, type Workflow, type TaskFilter, type TaskSort, type TaskCheckpoint, } from './engine.js';
export { createTaskCreateCommand, createTaskListCommand, createTaskStatusCommand, createTaskCancelCommand, createTaskWorkflowCommand, } from './commands.js';
export { type TaskCommandContext, type TodoItem, type MemoryEntry, type CoordinationContext, type TaskMetadata, } from './types.js';
export { TaskCoordinator } from './coordination.js';
/**
 * Initialize the complete task management system
 */
export declare function initializeTaskManagement(config?: {
    maxConcurrentTasks?: number;
    memoryManager?: any;
    logger?: any;
}): Promise<{
    taskEngine: any;
    taskCoordinator: any;
    commands: {
        create: any;
        list: any;
        status: any;
        cancel: any;
        workflow: any;
    };
}>;
/**
 * Helper function to create TodoWrite-style task breakdown
 */
export declare function createTaskTodos(objective: string, options?: {
    strategy?: 'research' | 'development' | 'analysis' | 'testing' | 'optimization' | 'maintenance';
    maxTasks?: number;
    batchOptimized?: boolean;
    parallelExecution?: boolean;
    memoryCoordination?: boolean;
}, coordinator?: any): Promise<any[]>;
/**
 * Helper function to launch parallel agents (Task tool pattern)
 */
export declare function launchParallelAgents(tasks: Array<{
    agentType: string;
    objective: string;
    mode?: string;
    configuration?: Record<string, unknown>;
    memoryKey?: string;
    batchOptimized?: boolean;
}>, coordinator?: any): Promise<string[]>;
/**
 * Helper function to store coordination data in Memory
 */
export declare function storeCoordinationData(key: string, value: any, options?: {
    namespace?: string;
    tags?: string[];
    expiresAt?: Date;
}, coordinator?: any): Promise<void>;
/**
 * Helper function to retrieve coordination data from Memory
 */
export declare function retrieveCoordinationData(key: string, namespace?: string, coordinator?: any): Promise<any | null>;
/**
 * Examples and usage patterns for Claude Code integration
 */
export declare const USAGE_EXAMPLES: {
    todoWrite: string;
    taskTool: string;
    memoryCoordination: string;
    batchOperations: string;
    swarmCoordination: string;
};
/**
 * Command line usage examples
 */
export declare const CLI_EXAMPLES: {
    taskCreate: string;
    taskList: string;
    taskStatus: string;
    taskCancel: string;
    taskWorkflow: string;
};
declare const _default: {
    initializeTaskManagement: typeof initializeTaskManagement;
    createTaskTodos: typeof createTaskTodos;
    launchParallelAgents: typeof launchParallelAgents;
    storeCoordinationData: typeof storeCoordinationData;
    retrieveCoordinationData: typeof retrieveCoordinationData;
    USAGE_EXAMPLES: {
        todoWrite: string;
        taskTool: string;
        memoryCoordination: string;
        batchOperations: string;
        swarmCoordination: string;
    };
    CLI_EXAMPLES: {
        taskCreate: string;
        taskList: string;
        taskStatus: string;
        taskCancel: string;
        taskWorkflow: string;
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map