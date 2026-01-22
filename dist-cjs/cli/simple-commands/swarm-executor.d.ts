export function executeSwarm(objective: any, flags?: {}): Promise<{
    success: boolean;
    summary: {
        id: any;
        status: string;
        agents: number;
        tasks: {
            total: number;
            completed: number;
            in_progress: number;
        };
        runtime: number;
    };
    error?: undefined;
} | {
    success: boolean;
    error: any;
    summary?: undefined;
}>;
export class SwarmCoordinator {
    constructor(config: any);
    config: any;
    id: any;
    agents: any[];
    tasks: any[];
    status: string;
    startTime: number;
    initialize(): Promise<this>;
    addAgent(type: any, name: any): Promise<{
        id: string;
        type: any;
        name: any;
        status: string;
        tasks: never[];
    }>;
    executeTask(task: any): Promise<{
        id: string;
        description: any;
        status: string;
        startTime: number;
    }>;
    createAPIProject(): Promise<void>;
    runTests(): Promise<void>;
    genericTaskExecution(task: any): Promise<void>;
    getStatus(): Promise<{
        id: any;
        status: string;
        agents: number;
        tasks: {
            total: number;
            completed: number;
            in_progress: number;
        };
        runtime: number;
    }>;
    complete(): Promise<{
        id: any;
        status: string;
        agents: number;
        tasks: {
            total: number;
            completed: number;
            in_progress: number;
        };
        runtime: number;
    }>;
}
//# sourceMappingURL=swarm-executor.d.ts.map