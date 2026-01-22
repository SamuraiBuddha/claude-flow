/**
 * Optimized Research Strategy Implementation
 * Provides intelligent research capabilities with parallel processing,
 * semantic clustering, caching, and progressive refinement
 */
import { BaseStrategy } from './base.js';
import type { DecompositionResult } from './base.js';
import { SwarmObjective, TaskDefinition, SwarmConfig } from '../types.js';
export declare class ResearchStrategy extends BaseStrategy {
    private logger;
    private researchCache;
    private connectionPool;
    private rateLimiters;
    private semanticModel;
    private researchQueries;
    private researchResults;
    private researchClusters;
    private researchMetrics;
    constructor(config?: Partial<SwarmConfig>);
    decomposeObjective(objective: SwarmObjective): Promise<DecompositionResult>;
    optimizeTaskExecution(task: TaskDefinition, agent: any): Promise<any>;
    private executeOptimizedWebSearch;
    private executeOptimizedDataExtraction;
    private executeOptimizedClustering;
    private executeGenericResearchTask;
    private extractResearchParameters;
    private extractDomains;
    private extractKeywords;
    private extractTimeframe;
    private extractSourceTypes;
    private generateSearchQueries;
    private executeRateLimitedSearch;
    private simulateWebSearch;
    private rankResultsByCredibility;
    private createParallelExtractionTasks;
    private extractDataFromBatch;
    private deduplicateResults;
    private performSemanticClustering;
    private getPooledConnection;
    private releasePooledConnection;
    private waitForConnection;
    private checkRateLimit;
    private updateRateLimit;
    private waitForRateLimit;
    private exponentialBackoff;
    private generateCacheKey;
    private getFromCache;
    private setCache;
    private cleanupCache;
    private createResearchTask;
    private updateResearchMetrics;
    private createTaskBatches;
    getMetrics(): {
        queriesExecuted: number;
        averageResponseTime: number;
        cacheHits: number;
        cacheMisses: number;
        credibilityScores: Record<string, number>;
        cacheHitRate: number;
        averageCredibilityScore: number;
        connectionPoolUtilization: number;
        cacheSize: number;
        tasksCompleted: number;
        averageExecutionTime: number;
        successRate: number;
        resourceUtilization: number;
        parallelismEfficiency: number;
        predictionAccuracy: number;
    };
    refineResearchScope(objective: SwarmObjective, intermediateResults: any[]): Promise<SwarmObjective>;
    selectAgentForTask(task: TaskDefinition, availableAgents: any[]): Promise<string | null>;
    optimizeTaskSchedule(tasks: TaskDefinition[], agents: any[]): Promise<any[]>;
    private getAgentCapabilitiesList;
}
//# sourceMappingURL=research.d.ts.map