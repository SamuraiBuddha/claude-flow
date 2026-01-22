export type ExtendedTaskType = 'data-analysis' | 'performance-analysis' | 'statistical-analysis' | 'visualization' | 'predictive-modeling' | 'anomaly-detection' | 'trend-analysis' | 'business-intelligence' | 'quality-analysis' | 'system-design' | 'architecture-review' | 'api-design' | 'cloud-architecture' | 'microservices-design' | 'security-architecture' | 'scalability-design' | 'database-architecture' | 'code-generation' | 'code-review' | 'refactoring' | 'debugging' | 'api-development' | 'database-design' | 'performance-optimization' | 'task-orchestration' | 'progress-tracking' | 'resource-allocation' | 'workflow-management' | 'team-coordination' | 'status-reporting' | 'fact-check' | 'literature-review' | 'market-analysis' | 'unit-testing' | 'integration-testing' | 'e2e-testing' | 'performance-testing' | 'security-testing' | 'api-testing' | 'test-automation' | 'test-analysis';
/**
 * Optimized AUTO Strategy Implementation
 * Uses machine learning-inspired heuristics and intelligent task decomposition
 */
import { BaseStrategy } from './base.js';
import type { DecompositionResult, AgentAllocation } from './base.js';
import type { SwarmObjective, TaskDefinition, AgentState } from '../types.js';
export declare class AutoStrategy extends BaseStrategy {
    private mlHeuristics;
    private decompositionCache;
    private patternCache;
    private performanceHistory;
    constructor(config: any);
    /**
     * Enhanced objective decomposition with async processing and intelligent batching
     */
    decomposeObjective(objective: SwarmObjective): Promise<DecompositionResult>;
    /**
     * ML-inspired agent selection with performance history consideration
     */
    selectAgentForTask(task: TaskDefinition, availableAgents: AgentState[]): Promise<string | null>;
    /**
     * Predictive task scheduling with dynamic agent allocation
     */
    optimizeTaskSchedule(tasks: TaskDefinition[], agents: AgentState[]): Promise<AgentAllocation[]>;
    private initializeMLHeuristics;
    private detectPatternsAsync;
    private analyzeTaskTypesAsync;
    private estimateComplexityAsync;
    private generateDynamicPatterns;
    private generateTasksWithBatching;
    private generateDevelopmentTasks;
    private createParallelImplementationTasks;
    private generateAnalysisTasks;
    private generateAutoTasks;
    private createTaskDefinition;
    private getRequiredTools;
    private canParallelizeImplementation;
    private identifyComponents;
    private determineOptimalTaskStructure;
    private createOptimalImplementationTasks;
    private analyzeDependencies;
    private createTaskBatches;
    private calculateBatchResources;
    private calculateOptimizedDuration;
    private selectOptimalStrategy;
    private calculateAgentScore;
    private calculateCapabilityMatch;
    private agentHasCapability;
    private getAgentPerformanceScore;
    private applyMLHeuristics;
    private updateAgentPerformanceHistory;
    private createPredictiveSchedule;
    private allocateAgentsOptimally;
}
//# sourceMappingURL=auto.d.ts.map