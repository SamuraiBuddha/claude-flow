import { EventEmitter } from 'node:events';
export interface SwarmAgent {
    id: string;
    name: string;
    type: 'researcher' | 'coder' | 'analyst' | 'coordinator' | 'reviewer';
    status: 'idle' | 'busy' | 'failed' | 'completed';
    capabilities: string[];
    currentTask?: SwarmTask;
    processId?: number;
    terminalId?: string;
    metrics: {
        tasksCompleted: number;
        tasksFailed: number;
        totalDuration: number;
        lastActivity: Date;
    };
}
export interface SwarmTask {
    id: string;
    type: string;
    description: string;
    priority: number;
    dependencies: string[];
    assignedTo?: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: any;
    error?: string;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    retryCount: number;
    maxRetries: number;
    timeout?: number;
}
export interface SwarmObjective {
    id: string;
    description: string;
    strategy: 'auto' | 'research' | 'development' | 'analysis';
    tasks: SwarmTask[];
    status: 'planning' | 'executing' | 'completed' | 'failed';
    createdAt: Date;
    completedAt?: Date;
}
export interface SwarmConfig {
    maxAgents: number;
    maxConcurrentTasks: number;
    taskTimeout: number;
    enableMonitoring: boolean;
    enableWorkStealing: boolean;
    enableCircuitBreaker: boolean;
    memoryNamespace: string;
    coordinationStrategy: 'centralized' | 'distributed' | 'hybrid';
    backgroundTaskInterval: number;
    healthCheckInterval: number;
    maxRetries: number;
    backoffMultiplier: number;
}
export declare class SwarmCoordinator extends EventEmitter {
    private logger;
    private config;
    private agents;
    private objectives;
    private tasks;
    private monitor?;
    private scheduler?;
    private memoryManager;
    private backgroundWorkers;
    private isRunning;
    private workStealer?;
    private circuitBreaker?;
    constructor(config?: Partial<SwarmConfig>);
    private setupEventHandlers;
    start(): Promise<void>;
    stop(): Promise<void>;
    private startBackgroundWorkers;
    private stopBackgroundWorkers;
    createObjective(description: string, strategy?: SwarmObjective['strategy']): Promise<string>;
    private decomposeObjective;
    private createTask;
    registerAgent(name: string, type: SwarmAgent['type'], capabilities?: string[]): Promise<string>;
    assignTask(taskId: string, agentId: string): Promise<void>;
    private executeTask;
    private simulateTaskExecution;
    private handleTaskCompleted;
    private handleTaskFailed;
    private checkObjectiveCompletion;
    private processBackgroundTasks;
    private areDependenciesMet;
    private selectBestAgent;
    private performHealthChecks;
    private performWorkStealing;
    private syncMemoryState;
    private handleMonitorAlert;
    private handleAgentMessage;
    executeObjective(objectiveId: string): Promise<void>;
    getObjectiveStatus(objectiveId: string): SwarmObjective | undefined;
    getAgentStatus(agentId: string): SwarmAgent | undefined;
    getSwarmStatus(): {
        objectives: number;
        tasks: {
            total: number;
            pending: number;
            running: number;
            completed: number;
            failed: number;
        };
        agents: {
            total: number;
            idle: number;
            busy: number;
            failed: number;
        };
        uptime: number;
    };
}
//# sourceMappingURL=swarm-coordinator.d.ts.map