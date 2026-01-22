/**
 * FeedbackLoop - Orchestrator for the spec-kit feedback system
 *
 * Coordinates metrics collection, spec analysis, regeneration triggers,
 * and version diffing in an event-driven architecture
 */
import { EventEmitter } from 'events';
import { MetricsCollector, MetricsCollectorConfig, MetricEntry, MetricType, TrendAnalysis } from './metrics-collector.js';
import { SpecAnalyzer, SpecAnalyzerConfig, AnalysisResult, Recommendation, PrioritizedChange, SpecExpectation } from './spec-analyzer.js';
import { RegenerationTrigger, RegenerationTriggerConfig, RegenerationJob, Customization } from './regeneration-trigger.js';
import { VersionDiff, VersionDiffConfig, DiffResult, SpecVersion, ImpactAssessment } from './version-diff.js';
export * from './metrics-collector.js';
export * from './spec-analyzer.js';
export * from './regeneration-trigger.js';
export * from './version-diff.js';
export interface FeedbackLoopConfig {
    metrics?: Partial<MetricsCollectorConfig>;
    analyzer?: Partial<SpecAnalyzerConfig>;
    regeneration?: Partial<RegenerationTriggerConfig>;
    diff?: Partial<VersionDiffConfig>;
    autoRegeneration: {
        enabled: boolean;
        errorRateThreshold: number;
        performanceDegradationThreshold: number;
        coverageDropThreshold: number;
        minTimeBetweenRegenerations: number;
    };
    notifications: {
        enabled: boolean;
        channels: ('console' | 'event' | 'webhook')[];
        webhookUrl?: string;
        severityFilter: ('critical' | 'high' | 'medium' | 'low')[];
    };
}
export interface FeedbackLoopStatus {
    isRunning: boolean;
    startedAt?: Date;
    metricsCollected: number;
    analysesPerformed: number;
    regenerationsTriggered: number;
    lastAnalysis?: AnalysisResult;
    lastRegeneration?: RegenerationJob;
    lastError?: Error;
    health: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
}
export interface FeedbackLoopEvents {
    'started': {
        timestamp: Date;
    };
    'stopped': {
        timestamp: Date;
        reason?: string;
    };
    'metric:collected': MetricEntry;
    'analysis:completed': AnalysisResult;
    'regeneration:triggered': RegenerationJob;
    'regeneration:completed': RegenerationJob;
    'threshold:exceeded': {
        type: string;
        threshold: number;
        current: number;
    };
    'auto_regeneration:triggered': {
        reason: string;
        specPath: string;
    };
    'notification:sent': {
        channel: string;
        message: string;
    };
    'health:changed': {
        from: string;
        to: string;
    };
    'error': Error;
}
/**
 * FeedbackLoop - Main orchestrator class
 */
export declare class FeedbackLoop extends EventEmitter {
    private config;
    private metricsCollector;
    private specAnalyzer;
    private regenerationTrigger;
    private versionDiff;
    private isRunning;
    private startedAt?;
    private metricsCount;
    private analysisCount;
    private regenerationCount;
    private lastAnalysis?;
    private lastRegeneration?;
    private lastError?;
    private healthStatus;
    private lastAutoRegenTime;
    private analysisTimer?;
    constructor(config?: Partial<FeedbackLoopConfig>);
    /**
     * Setup event handlers between components
     */
    private setupEventHandlers;
    /**
     * Start the feedback loop
     */
    start(): Promise<void>;
    /**
     * Stop the feedback loop
     */
    stop(reason?: string): Promise<void>;
    /**
     * Get current status
     */
    getStatus(): FeedbackLoopStatus;
    /**
     * Force an immediate analysis
     */
    forceAnalysis(specId?: string): Promise<AnalysisResult>;
    /**
     * Force a regeneration
     */
    forceRegeneration(specPath: string, options?: {
        cascade?: boolean;
        preserveCustomizations?: boolean;
    }): Promise<RegenerationJob>;
    /**
     * Compare spec versions
     */
    compareVersions(baseVersion: SpecVersion, compareVersion: SpecVersion): Promise<DiffResult>;
    /**
     * Record a metric
     */
    recordMetric(type: MetricType, name: string, value: number | string | boolean, options?: {
        unit?: string;
        tags?: string[];
        metadata?: Record<string, unknown>;
        specId?: string;
        storyId?: string;
    }): Promise<MetricEntry>;
    /**
     * Add a spec expectation
     */
    addExpectation(expectation: SpecExpectation): void;
    /**
     * Record a customization to preserve during regeneration
     */
    recordCustomization(customization: Omit<Customization, 'id' | 'timestamp'>): Promise<Customization>;
    /**
     * Get recommendations from latest analysis
     */
    getRecommendations(): Promise<Recommendation[]>;
    /**
     * Get prioritized changes
     */
    getPrioritizedChanges(): Promise<PrioritizedChange[]>;
    /**
     * Get trend analysis for a metric
     */
    analyzeTrend(type: MetricType, name: string, options?: {
        period?: 'hour' | 'day' | 'week' | 'month';
        lookbackPeriods?: number;
    }): Promise<TrendAnalysis>;
    /**
     * Get impact assessment for spec changes
     */
    getImpactAssessment(diffResult: DiffResult): Promise<ImpactAssessment>;
    /**
     * Store a spec version for tracking
     */
    storeSpecVersion(specId: string, version: SpecVersion): void;
    /**
     * Get version history for a spec
     */
    getVersionHistory(specId: string): SpecVersion[];
    get metrics(): MetricsCollector;
    get analyzer(): SpecAnalyzer;
    get regenerator(): RegenerationTrigger;
    get differ(): VersionDiff;
    /**
     * Check if auto-regeneration should be triggered based on threshold
     */
    private checkAutoRegeneration;
    /**
     * Check if trend warrants auto-regeneration
     */
    private checkTrendBasedRegeneration;
    /**
     * Check if analysis result warrants auto-regeneration
     */
    private checkAnalysisBasedRegeneration;
    /**
     * Trigger auto-regeneration
     */
    private triggerAutoRegeneration;
    /**
     * Handle errors from components
     */
    private handleError;
    /**
     * Perform health check
     */
    private performHealthCheck;
    /**
     * Send notification
     */
    private notify;
    /**
     * Send webhook notification
     */
    private sendWebhook;
}
export declare function createFeedbackLoop(config?: Partial<FeedbackLoopConfig>): FeedbackLoop;
export default FeedbackLoop;
//# sourceMappingURL=index.d.ts.map