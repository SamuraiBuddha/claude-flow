import type { TaskCommandContext } from './types.js';
export declare function createTaskCreateCommand(context: TaskCommandContext): {
    name: string;
    description: string;
    execute: (args: any) => Promise<import("./engine.js").WorkflowTask>;
};
export declare function createTaskListCommand(context: TaskCommandContext): {
    name: string;
    description: string;
    execute: (filter?: any, sort?: any, limit?: number, offset?: number) => Promise<{
        tasks: import("./engine.js").WorkflowTask[];
        total: number;
        hasMore: boolean;
    }>;
};
export declare function createTaskStatusCommand(context: TaskCommandContext): {
    name: string;
    description: string;
    execute: (taskId: string) => Promise<{
        task: import("./engine.js").WorkflowTask;
        execution?: import("./engine.js").TaskExecution;
        dependencies: {
            task: import("./engine.js").WorkflowTask;
            satisfied: boolean;
        }[];
        dependents: import("./engine.js").WorkflowTask[];
        resourceStatus: {
            required: import("./engine.js").ResourceRequirement;
            available: boolean;
            allocated: boolean;
        }[];
    }>;
};
export declare function createTaskCancelCommand(context: TaskCommandContext): {
    name: string;
    description: string;
    execute: (taskId: string, reason?: string, rollback?: boolean) => Promise<{
        success: boolean;
        taskId: string;
        reason: string;
    }>;
};
export declare function createTaskWorkflowCommand(context: TaskCommandContext): {
    name: string;
    description: string;
    execute: (action: "create" | "execute" | "list" | "get", ...args: any[]) => Promise<import("./engine.js").Workflow | {
        success: boolean;
        workflowId: any;
        workflows?: undefined;
    } | {
        workflows: never[];
        success?: undefined;
        workflowId?: undefined;
    } | {
        workflowId: any;
        success?: undefined;
        workflows?: undefined;
    }>;
};
//# sourceMappingURL=commands.d.ts.map