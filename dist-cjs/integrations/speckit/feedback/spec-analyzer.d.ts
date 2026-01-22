/**
 * SpecAnalyzer - Analyze metrics against specification expectations
 *
 * Detects performance bottlenecks, error patterns, and coverage gaps
 * Outputs structured improvement suggestions
 */
import { EventEmitter } from 'events';
import { MetricsCollector, TrendAnalysis } from './metrics-collector.js';
export interface SpecExpectation {
    id: string;
    specId: string;
    storyId?: string;
    type: 'performance' | 'reliability' | 'coverage' | 'quality' | 'compliance';
    metric: string;
    operator: 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'between';
    value: number;
    maxValue?: number;
    unit?: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    description?: string;
}
export interface AnalysisResult {
    id: string;
    timestamp: Date;
    specId?: string;
    expectations: ExpectationResult[];
    bottlenecks: Bottleneck[];
    errorPatterns: ErrorPattern[];
    coverageGaps: CoverageGap[];
    overallScore: number;
    status: 'passing' | 'warning' | 'failing';
}
export interface ExpectationResult {
    expectation: SpecExpectation;
    actual: number;
    passed: boolean;
    deviation: number;
    trend?: TrendAnalysis;
}
export interface Bottleneck {
    id: string;
    type: 'performance' | 'resource' | 'throughput';
    location: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    metric: string;
    currentValue: number;
    expectedValue: number;
    impact: string;
    suggestedFix?: string;
}
export interface ErrorPattern {
    id: string;
    pattern: string;
    frequency: number;
    firstOccurrence: Date;
    lastOccurrence: Date;
    affectedSpecs: string[];
    affectedStories: string[];
    severity: 'critical' | 'high' | 'medium' | 'low';
    rootCause?: string;
    suggestedFix?: string;
}
export interface CoverageGap {
    id: string;
    specId: string;
    storyId?: string;
    type: 'test' | 'acceptance' | 'integration' | 'edge_case';
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    suggestedTests?: string[];
}
export interface Recommendation {
    id: string;
    type: 'performance' | 'reliability' | 'coverage' | 'quality' | 'architecture';
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    affectedSpecs: string[];
    suggestedActions: string[];
    estimatedImprovement?: number;
}
export interface PrioritizedChange {
    id: string;
    recommendation: Recommendation;
    score: number;
    dependencies: string[];
    blockedBy: string[];
}
export interface SpecAnalyzerConfig {
    defaultExpectations: SpecExpectation[];
    analysisInterval: number;
    bottleneckThreshold: number;
    errorPatternMinOccurrences: number;
    coverageMinimum: number;
    trendLookbackDays: number;
}
export interface SpecAnalyzerEvents {
    'analysis:started': {
        specId?: string;
    };
    'analysis:completed': AnalysisResult;
    'bottleneck:detected': Bottleneck;
    'error_pattern:detected': ErrorPattern;
    'coverage_gap:detected': CoverageGap;
    'recommendation:generated': Recommendation;
    'error': Error;
}
/**
 * SpecAnalyzer class for analyzing metrics against specifications
 */
export declare class SpecAnalyzer extends EventEmitter {
    private config;
    private metricsCollector;
    private expectations;
    private analysisHistory;
    private analysisTimer?;
    private isRunning;
    constructor(metricsCollector: MetricsCollector, config?: Partial<SpecAnalyzerConfig>);
    /**
     * Get default expectations
     */
    private getDefaultExpectations;
    /**
     * Add a spec expectation
     */
    addExpectation(expectation: SpecExpectation): void;
    /**
     * Remove a spec expectation
     */
    removeExpectation(expectationId: string): boolean;
    /**
     * Get all expectations for a spec
     */
    getExpectations(specId?: string): SpecExpectation[];
    /**
     * Start continuous analysis
     */
    start(): void;
    /**
     * Stop continuous analysis
     */
    stop(): void;
    /**
     * Perform analysis
     */
    analyze(specId?: string): Promise<AnalysisResult>;
    /**
     * Evaluate a single expectation
     */
    private evaluateExpectation;
    /**
     * Evaluate operator condition
     */
    private evaluateOperator;
    /**
     * Detect performance bottlenecks
     */
    private detectBottlenecks;
    /**
     * Detect error patterns
     */
    private detectErrorPatterns;
    /**
     * Detect coverage gaps
     */
    private detectCoverageGaps;
    /**
     * Generate recommendations based on analysis
     */
    generateRecommendations(analysis?: AnalysisResult): Promise<Recommendation[]>;
    /**
     * Prioritize changes based on recommendations
     */
    prioritizeChanges(recommendations?: Recommendation[]): Promise<PrioritizedChange[]>;
    /**
     * Get analysis history
     */
    getHistory(limit?: number): AnalysisResult[];
    /**
     * Get latest analysis
     */
    getLatestAnalysis(): AnalysisResult | null;
    private normalizeErrorMessage;
    private determineErrorSeverity;
    private inferRootCause;
    private suggestErrorFix;
    private suggestPerformanceFix;
    private getMetricType;
    private getPriorityWeight;
    private getSeverityWeight;
    private percentile;
    private createExpectationRecommendation;
    private createBottleneckRecommendation;
    private createErrorPatternRecommendation;
    private createCoverageGapRecommendation;
    private calculateChangeScore;
    private identifyDependencies;
    private topologicalSort;
    private generateId;
}
export default SpecAnalyzer;
//# sourceMappingURL=spec-analyzer.d.ts.map