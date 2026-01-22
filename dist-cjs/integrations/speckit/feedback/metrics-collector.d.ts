/**
 * MetricsCollector - Production metrics collection for spec-driven development
 *
 * Collects errors, performance data, user feedback, and test results
 * Stores in SQLite with timestamps for trend analysis
 */
import { EventEmitter } from 'events';
export type MetricType = 'error' | 'performance' | 'user_feedback' | 'test_result' | 'coverage' | 'spec_compliance' | 'build_status' | 'deployment';
export interface MetricEntry {
    id: string;
    type: MetricType;
    name: string;
    value: number | string | boolean;
    unit?: string;
    tags: string[];
    metadata: Record<string, unknown>;
    timestamp: Date;
    specId?: string;
    storyId?: string;
    taskId?: string;
}
export interface MetricQuery {
    type?: MetricType;
    types?: MetricType[];
    specId?: string;
    storyId?: string;
    taskId?: string;
    tags?: string[];
    startTime?: Date;
    endTime?: Date;
    limit?: number;
    offset?: number;
}
export interface TrendAnalysis {
    metric: string;
    type: MetricType;
    period: string;
    dataPoints: Array<{
        timestamp: Date;
        value: number;
    }>;
    trend: 'improving' | 'degrading' | 'stable';
    changePercent: number;
    average: number;
    min: number;
    max: number;
    stdDev: number;
}
export interface MetricsCollectorConfig {
    dbPath?: string;
    collectionInterval: number;
    retentionDays: number;
    batchSize: number;
    flushInterval: number;
    enableAutoCollection: boolean;
    thresholds: {
        errorRate: number;
        performanceDegradation: number;
        coverageMinimum: number;
    };
}
export interface MetricsCollectorEvents {
    'metric:recorded': MetricEntry;
    'metrics:flushed': {
        count: number;
    };
    'threshold:exceeded': {
        type: MetricType;
        threshold: number;
        current: number;
    };
    'trend:detected': TrendAnalysis;
    'error': Error;
}
/**
 * MetricsCollector class for production metrics collection
 */
export declare class MetricsCollector extends EventEmitter {
    private config;
    private db;
    private buffer;
    private isInitialized;
    private collectionTimer?;
    private flushTimer?;
    private metricCounts;
    constructor(config?: Partial<MetricsCollectorConfig>);
    /**
     * Initialize the metrics collector
     */
    initialize(): Promise<void>;
    /**
     * Initialize the SQLite database
     */
    private initializeDatabase;
    /**
     * Create in-memory store as fallback
     */
    private createInMemoryStore;
    /**
     * Create database tables
     */
    private createTables;
    /**
     * Record a metric
     */
    recordMetric(type: MetricType, name: string, value: number | string | boolean, options?: {
        unit?: string;
        tags?: string[];
        metadata?: Record<string, unknown>;
        specId?: string;
        storyId?: string;
        taskId?: string;
    }): Promise<MetricEntry>;
    /**
     * Record an error metric
     */
    recordError(name: string, error: Error, options?: {
        specId?: string;
        storyId?: string;
        taskId?: string;
        severity?: 'low' | 'medium' | 'high' | 'critical';
    }): Promise<MetricEntry>;
    /**
     * Record a performance metric
     */
    recordPerformance(name: string, durationMs: number, options?: {
        specId?: string;
        storyId?: string;
        taskId?: string;
        operation?: string;
    }): Promise<MetricEntry>;
    /**
     * Record user feedback
     */
    recordUserFeedback(name: string, rating: number, options?: {
        specId?: string;
        storyId?: string;
        taskId?: string;
        comment?: string;
        category?: string;
    }): Promise<MetricEntry>;
    /**
     * Record test result
     */
    recordTestResult(name: string, passed: boolean, options?: {
        specId?: string;
        storyId?: string;
        taskId?: string;
        durationMs?: number;
        testSuite?: string;
        assertions?: number;
        failures?: string[];
    }): Promise<MetricEntry>;
    /**
     * Get metrics based on query
     */
    getMetrics(query?: MetricQuery): Promise<MetricEntry[]>;
    /**
     * Query in-memory store
     */
    private queryInMemory;
    /**
     * Analyze trends for a specific metric type
     */
    analyzeTrends(type: MetricType, name: string, options?: {
        period?: 'hour' | 'day' | 'week' | 'month';
        lookbackPeriods?: number;
    }): Promise<TrendAnalysis>;
    /**
     * Get summary statistics
     */
    getSummary(options?: {
        specId?: string;
        startTime?: Date;
        endTime?: Date;
    }): Promise<Record<MetricType, {
        count: number;
        latest: MetricEntry | null;
    }>>;
    /**
     * Flush buffer to database
     */
    flush(): Promise<void>;
    /**
     * Check thresholds and emit events
     */
    private checkThresholds;
    /**
     * Start auto-collection timer
     */
    private startAutoCollection;
    /**
     * Start flush timer
     */
    private startFlushTimer;
    /**
     * Collect system metrics
     */
    private collectSystemMetrics;
    /**
     * Convert database row to MetricEntry
     */
    private rowToMetric;
    /**
     * Get period in milliseconds
     */
    private getPeriodMs;
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Clean up old metrics
     */
    cleanup(): Promise<number>;
    /**
     * Stop the metrics collector
     */
    stop(): Promise<void>;
}
export default MetricsCollector;
//# sourceMappingURL=metrics-collector.d.ts.map