/**
 * Base Strategy Interface for Swarm Task Execution
 * Provides the foundation for different task execution strategies
 */
import type { TaskDefinition, SwarmObjective, AgentState, SwarmConfig } from '../types.js';
export interface StrategyMetrics {
    tasksCompleted: number;
    averageExecutionTime: number;
    successRate: number;
    resourceUtilization: number;
    parallelismEfficiency: number;
    cacheHitRate: number;
    predictionAccuracy: number;
    queriesExecuted?: number;
    averageResponseTime?: number;
    cacheHits?: number;
    cacheMisses?: number;
    credibilityScores?: Record<string, number>;
}
export interface TaskPattern {
    pattern: RegExp;
    type: string;
    complexity: number;
    estimatedDuration: number;
    requiredAgents: number;
    priority: number;
}
export interface DecompositionResult {
    tasks: TaskDefinition[];
    dependencies: Map<string, string[]>;
    estimatedDuration: number;
    recommendedStrategy: string;
    complexity: number;
    batchGroups: TaskBatch[];
    timestamp: Date;
    ttl: number;
    accessCount: number;
    lastAccessed: Date;
    data: any;
    resourceRequirements?: {
        memory?: number;
        cpu?: number;
        network?: string;
        storage?: string;
    };
}
export interface TaskBatch {
    id: string;
    tasks: TaskDefinition[];
    canRunInParallel: boolean;
    estimatedDuration: number;
    requiredResources: Record<string, number>;
}
export interface AgentAllocation {
    agentId: string;
    tasks: string[];
    estimatedWorkload: number;
    capabilities: string[];
}
export declare abstract class BaseStrategy {
    protected metrics: StrategyMetrics;
    protected taskPatterns: TaskPattern[];
    protected cache: Map<string, DecompositionResult>;
    protected config: SwarmConfig;
    constructor(config: SwarmConfig);
    abstract decomposeObjective(objective: SwarmObjective): Promise<DecompositionResult>;
    abstract selectAgentForTask(task: TaskDefinition, availableAgents: AgentState[]): Promise<string | null>;
    abstract optimizeTaskSchedule(tasks: TaskDefinition[], agents: AgentState[]): Promise<AgentAllocation[]>;
    protected initializeMetrics(): StrategyMetrics;
    protected initializeTaskPatterns(): TaskPattern[];
    protected detectTaskType(description: string): string;
    protected estimateComplexity(description: string): number;
    protected getCacheKey(objective: SwarmObjective): string;
    protected updateMetrics(result: DecompositionResult, executionTime: number): void;
    getMetrics(): StrategyMetrics;
    clearCache(): void;
}
//# sourceMappingURL=base.d.ts.map