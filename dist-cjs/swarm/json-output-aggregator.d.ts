/**
 * JSON Output Aggregator for Non-Interactive Swarm Execution
 * Collects and formats swarm results into a comprehensive JSON structure
 */
import { EventEmitter } from 'events';
import type { AgentState, TaskDefinition, SwarmMetrics, TaskResult } from './types.js';
export interface SwarmOutputAggregate {
    swarmId: string;
    objective: string;
    startTime: string;
    endTime: string;
    duration: number;
    status: 'completed' | 'failed' | 'timeout' | 'cancelled';
    summary: {
        totalAgents: number;
        totalTasks: number;
        completedTasks: number;
        failedTasks: number;
        successRate: number;
    };
    agents: AgentOutputData[];
    tasks: TaskOutputData[];
    results: {
        artifacts: Record<string, any>;
        outputs: string[];
        errors: string[];
        insights: string[];
    };
    metrics: SwarmMetrics;
    metadata: {
        strategy: string;
        mode: string;
        configuration: Record<string, any>;
        version: string;
    };
}
export interface AgentOutputData {
    agentId: string;
    name: string;
    type: string;
    status: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    tasksCompleted: number;
    outputs: string[];
    errors: string[];
    metrics: {
        tokensUsed?: number;
        memoryAccess: number;
        operationsPerformed: number;
    };
}
export interface TaskOutputData {
    taskId: string;
    name: string;
    type: string;
    status: string;
    assignedAgent?: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    priority: string;
    output?: string;
    result?: TaskResult;
    artifacts?: Record<string, any>;
    error?: string;
}
export declare class SwarmJsonOutputAggregator extends EventEmitter {
    private logger;
    private swarmId;
    private objective;
    private startTime;
    private endTime?;
    private configuration;
    private agents;
    private tasks;
    private outputs;
    private errors;
    private insights;
    private artifacts;
    private metrics;
    constructor(swarmId: string, objective: string, configuration?: Record<string, any>);
    addAgent(agent: AgentState): void;
    updateAgent(agentId: string, updates: Partial<AgentOutputData>): void;
    addAgentOutput(agentId: string, output: string): void;
    addAgentError(agentId: string, error: string): void;
    addTask(task: TaskDefinition): void;
    updateTask(taskId: string, updates: Partial<TaskOutputData>): void;
    completeTask(taskId: string, result: TaskResult): void;
    addInsight(insight: string): void;
    addArtifact(key: string, artifact: any): void;
    updateMetrics(updates: Partial<SwarmMetrics>): void;
    finalize(status?: 'completed' | 'failed' | 'timeout' | 'cancelled'): SwarmOutputAggregate;
    saveToFile(filePath: string, status?: 'completed' | 'failed' | 'timeout' | 'cancelled'): Promise<void>;
    getJsonOutput(status?: 'completed' | 'failed' | 'timeout' | 'cancelled'): string;
    private circularReplacer;
    private initializeMetrics;
}
//# sourceMappingURL=json-output-aggregator.d.ts.map