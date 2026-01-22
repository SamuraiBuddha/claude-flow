/**
 * Base Agent Class - Foundation for all specialized agents
 */
import { EventEmitter } from 'node:events';
import type { AgentId, AgentType, AgentStatus, AgentCapabilities, AgentConfig, AgentEnvironment, AgentMetrics, AgentError, TaskDefinition, TaskId } from '../../swarm/types.js';
import type { ILogger } from '../../core/logger.js';
import type { IEventBus } from '../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../memory/distributed-memory.js';
export interface AgentState {
    id: AgentId;
    name: string;
    type: AgentType;
    status: AgentStatus;
    capabilities: AgentCapabilities;
    config: AgentConfig;
    environment: AgentEnvironment;
    metrics: AgentMetrics;
    workload: number;
    health: number;
    lastHeartbeat: Date;
    currentTasks: TaskId[];
    taskHistory: TaskId[];
    errorHistory: AgentError[];
    collaborators: AgentId[];
    childAgents: AgentId[];
    endpoints: string[];
}
export declare abstract class BaseAgent extends EventEmitter {
    protected id: string;
    protected type: AgentType;
    protected status: AgentStatus;
    protected capabilities: AgentCapabilities;
    protected config: AgentConfig;
    protected environment: AgentEnvironment;
    protected metrics: AgentMetrics;
    protected workload: number;
    protected health: number;
    protected lastHeartbeat: Date;
    protected currentTasks: TaskId[];
    protected taskHistory: TaskId[];
    protected errorHistory: AgentError[];
    protected collaborators: AgentId[];
    protected childAgents: AgentId[];
    protected endpoints: string[];
    protected logger: ILogger;
    protected eventBus: IEventBus;
    protected memory: DistributedMemorySystem;
    private heartbeatInterval?;
    private metricsInterval?;
    private isShuttingDown;
    constructor(id: string, type: AgentType, config: AgentConfig, environment: AgentEnvironment, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem);
    protected abstract getDefaultCapabilities(): AgentCapabilities;
    protected abstract getDefaultConfig(): Partial<AgentConfig>;
    abstract executeTask(task: TaskDefinition): Promise<any>;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    assignTask(task: TaskDefinition): Promise<void>;
    getAgentInfo(): AgentState;
    getAgentStatus(): any;
    getCurrentTasks(): TaskId[];
    getTaskHistory(): TaskId[];
    getErrorHistory(): AgentError[];
    getLastTaskCompletedTime(): Date;
    updateHealth(health: number): void;
    addCollaborator(agentId: AgentId): void;
    removeCollaborator(agentId: string): void;
    protected getDefaultEnvironment(): Partial<AgentEnvironment>;
    protected createDefaultMetrics(): AgentMetrics;
    protected setupEventHandlers(): void;
    protected startHeartbeat(): void;
    protected startMetricsCollection(): void;
    protected sendHeartbeat(): void;
    protected collectMetrics(): Promise<void>;
    protected updateTaskMetrics(taskId: TaskId, executionTime: number, success: boolean): void;
    protected addError(error: AgentError): void;
    protected getRecentTasksAverageTime(): number;
    protected waitForTasksCompletion(): Promise<void>;
    protected saveState(): Promise<void>;
}
//# sourceMappingURL=base-agent.d.ts.map