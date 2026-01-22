/**
 * Advanced Result Aggregation and Reporting System
 *
 * This module provides comprehensive result aggregation, analysis, and reporting
 * capabilities for swarm operations. It collects outputs from multiple agents,
 * performs quality analysis, generates insights, and creates detailed reports.
 */
import { EventEmitter } from 'node:events';
import { MemoryManager } from '../memory/manager.js';
import { SwarmExecutionContext, TaskResult } from './types.js';
export interface AggregationConfig {
    enableQualityAnalysis: boolean;
    enableInsightGeneration: boolean;
    enableRecommendations: boolean;
    enableVisualization: boolean;
    qualityThreshold: number;
    confidenceThreshold: number;
    maxReportSize: number;
    reportFormats: string[];
    enableRealTimeUpdates: boolean;
    aggregationInterval: number;
}
export interface QualityMetrics {
    accuracy: number;
    completeness: number;
    consistency: number;
    relevance: number;
    timeliness: number;
    reliability: number;
    usability: number;
    overall: number;
}
export interface AggregatedResult {
    id: string;
    swarmId: string;
    timestamp: Date;
    taskResults: Map<string, TaskResult>;
    agentOutputs: Map<string, any[]>;
    intermediateResults: any[];
    consolidatedOutput: any;
    keyFindings: string[];
    insights: Insight[];
    recommendations: Recommendation[];
    qualityMetrics: QualityMetrics;
    confidenceScore: number;
    reliabilityScore: number;
    processingTime: number;
    dataPoints: number;
    sourcesCount: number;
    validationStatus: 'pending' | 'validated' | 'rejected';
}
export interface Insight {
    id: string;
    type: 'pattern' | 'trend' | 'anomaly' | 'correlation' | 'prediction';
    title: string;
    description: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
    evidence: any[];
    metadata: {
        source: string[];
        methodology: string;
        timestamp: Date;
    };
}
export interface Recommendation {
    id: string;
    category: 'improvement' | 'optimization' | 'risk-mitigation' | 'next-steps';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    rationale: string;
    expectedImpact: string;
    estimatedEffort: 'low' | 'medium' | 'high';
    timeline: string;
    dependencies: string[];
    risks: string[];
}
export interface ResultReport {
    id: string;
    swarmId: string;
    executionSummary: ExecutionSummary;
    results: AggregatedResult;
    qualityAnalysis: QualityAnalysis;
    performance: PerformanceAnalysis;
    insights: Insight[];
    recommendations: Recommendation[];
    appendices: ReportAppendix[];
    metadata: {
        generatedAt: Date;
        version: string;
        format: string;
        size: number;
    };
}
export interface ExecutionSummary {
    objective: string;
    strategy: string;
    duration: number;
    tasksTotal: number;
    tasksCompleted: number;
    tasksFailed: number;
    agentsUsed: number;
    resourcesConsumed: Record<string, number>;
    successRate: number;
}
export interface QualityAnalysis {
    overallScore: number;
    dimensionScores: QualityMetrics;
    strengthAreas: string[];
    improvementAreas: string[];
    qualityGates: {
        name: string;
        status: 'passed' | 'failed' | 'warning';
        score: number;
        threshold: number;
    }[];
}
export interface PerformanceAnalysis {
    efficiency: number;
    throughput: number;
    latency: number;
    resourceUtilization: Record<string, number>;
    bottlenecks: string[];
    optimizationOpportunities: string[];
}
export interface ReportAppendix {
    title: string;
    type: 'data' | 'logs' | 'charts' | 'raw-output';
    content: any;
    size: number;
}
export declare class SwarmResultAggregator extends EventEmitter {
    private logger;
    private config;
    private memoryManager;
    private activeAggregations;
    private resultCache;
    private processingQueue;
    constructor(config: Partial<AggregationConfig> | undefined, memoryManager: MemoryManager);
    /**
     * Initialize the result aggregator
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the aggregator gracefully
     */
    shutdown(): Promise<void>;
    /**
     * Start aggregating results for a swarm execution
     */
    startAggregation(context: SwarmExecutionContext): Promise<string>;
    /**
     * Add task result to aggregation
     */
    addTaskResult(aggregationId: string, taskId: string, result: TaskResult): Promise<void>;
    /**
     * Add agent output to aggregation
     */
    addAgentOutput(aggregationId: string, agentId: string, output: any): Promise<void>;
    /**
     * Finalize aggregation and generate comprehensive results
     */
    finalizeAggregation(aggregationId: string): Promise<AggregatedResult>;
    /**
     * Generate comprehensive report from aggregated results
     */
    generateReport(aggregationId: string, format?: 'json' | 'markdown' | 'html' | 'pdf'): Promise<ResultReport>;
    /**
     * Get current aggregation status
     */
    getAggregationStatus(aggregationId: string): {
        status: 'active' | 'completed' | 'not-found';
        progress?: number;
        results?: Partial<AggregatedResult>;
    };
    /**
     * Get aggregator metrics
     */
    getMetrics(): {
        activeAggregations: number;
        completedAggregations: number;
        totalResults: number;
        averageQualityScore: number;
        averageConfidenceScore: number;
        processingThroughput: number;
    };
    private createReport;
    private generateExecutionSummary;
    private generateQualityAnalysis;
    private generatePerformanceAnalysis;
    private generateAppendices;
    private storeAggregatedResult;
    private storeReport;
    private calculateSuccessRate;
    private calculateEfficiency;
    private calculateThroughput;
    private calculateLatency;
    private identifyStrengthAreas;
    private identifyImprovementAreas;
    private identifyBottlenecks;
    private identifyOptimizationOpportunities;
    private calculateAverageQuality;
    private calculateAverageConfidence;
    private calculateContentSize;
    private calculateReportSize;
    private createDefaultConfig;
    private setupEventHandlers;
}
export default SwarmResultAggregator;
//# sourceMappingURL=result-aggregator.d.ts.map