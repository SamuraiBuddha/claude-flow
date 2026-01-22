import { EventEmitter } from 'events';
import { Logger } from '../core/logger.js';
import { ConfigManager } from '../core/config.js';
export interface AnalyticsMetric {
    id: string;
    name: string;
    description: string;
    type: 'counter' | 'gauge' | 'histogram' | 'summary';
    category: 'performance' | 'usage' | 'business' | 'technical' | 'security' | 'cost';
    unit: string;
    value: number;
    tags: Record<string, string>;
    timestamp: Date;
    source: string;
    metadata: Record<string, any>;
}
export interface AnalyticsDashboard {
    id: string;
    name: string;
    description: string;
    type: 'operational' | 'executive' | 'technical' | 'business' | 'security' | 'custom';
    widgets: DashboardWidget[];
    layout: DashboardLayout;
    permissions: {
        viewers: string[];
        editors: string[];
        public: boolean;
    };
    schedule: {
        autoRefresh: boolean;
        refreshInterval: number;
        exportSchedule?: {
            frequency: 'daily' | 'weekly' | 'monthly';
            format: 'pdf' | 'png' | 'csv' | 'json';
            recipients: string[];
        };
    };
    filters: DashboardFilter[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}
export interface DashboardWidget {
    id: string;
    title: string;
    type: 'chart' | 'table' | 'metric' | 'gauge' | 'map' | 'text' | 'alert';
    size: 'small' | 'medium' | 'large' | 'full-width';
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    dataSource: {
        query: string;
        metrics: string[];
        aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'p95' | 'p99';
        timeRange: string;
        groupBy: string[];
    };
    visualization: {
        chartType?: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'area' | 'gauge';
        options: Record<string, any>;
        thresholds?: {
            warning: number;
            critical: number;
        };
    };
    alerts: {
        enabled: boolean;
        conditions: AlertCondition[];
    };
}
export interface DashboardLayout {
    columns: number;
    rows: number;
    grid: boolean;
    responsive: boolean;
}
export interface DashboardFilter {
    id: string;
    name: string;
    type: 'dropdown' | 'multiselect' | 'daterange' | 'text' | 'number';
    field: string;
    values?: string[];
    defaultValue?: any;
    required: boolean;
}
export interface AlertCondition {
    metric: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    threshold: number;
    duration: number;
    severity: 'info' | 'warning' | 'critical';
}
export interface AnalyticsInsight {
    id: string;
    title: string;
    description: string;
    type: 'anomaly' | 'trend' | 'correlation' | 'prediction' | 'recommendation';
    category: 'performance' | 'usage' | 'business' | 'technical' | 'security' | 'cost';
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    priority: 'low' | 'medium' | 'high' | 'critical';
    data: {
        metrics: string[];
        timeRange: {
            start: Date;
            end: Date;
        };
        values: Record<string, number>;
        baseline?: Record<string, number>;
        deviation?: number;
    };
    recommendations: {
        action: string;
        effort: 'low' | 'medium' | 'high';
        impact: string;
        implementation: string[];
    }[];
    status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'dismissed';
    assignedTo?: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
}
export interface PerformanceMetrics {
    system: {
        cpu: {
            usage: number;
            cores: number;
            loadAverage: number[];
        };
        memory: {
            used: number;
            free: number;
            total: number;
            usage: number;
        };
        disk: {
            used: number;
            free: number;
            total: number;
            usage: number;
            iops: number;
        };
        network: {
            bytesIn: number;
            bytesOut: number;
            packetsIn: number;
            packetsOut: number;
            errors: number;
        };
    };
    application: {
        responseTime: {
            avg: number;
            p50: number;
            p95: number;
            p99: number;
        };
        throughput: {
            requestsPerSecond: number;
            transactionsPerSecond: number;
        };
        errors: {
            rate: number;
            count: number;
            types: Record<string, number>;
        };
        availability: {
            uptime: number;
            sla: number;
            incidents: number;
        };
    };
    database: {
        connections: {
            active: number;
            idle: number;
            max: number;
        };
        queries: {
            avgExecutionTime: number;
            slowQueries: number;
            deadlocks: number;
        };
        storage: {
            size: number;
            growth: number;
            fragmentation: number;
        };
    };
    infrastructure: {
        containers: {
            running: number;
            stopped: number;
            restarts: number;
        };
        services: {
            healthy: number;
            unhealthy: number;
            degraded: number;
        };
    };
}
export interface UsageMetrics {
    users: {
        total: number;
        active: number;
        new: number;
        returning: number;
        churn: number;
    };
    sessions: {
        total: number;
        duration: {
            avg: number;
            median: number;
        };
        bounceRate: number;
        pagesPerSession: number;
    };
    features: {
        adoption: Record<string, {
            users: number;
            usage: number;
            retention: number;
        }>;
        mostUsed: string[];
        leastUsed: string[];
    };
    api: {
        calls: number;
        uniqueConsumers: number;
        avgResponseTime: number;
        errorRate: number;
        rateLimits: {
            hit: number;
            consumed: number;
        };
    };
    content: {
        created: number;
        modified: number;
        deleted: number;
        views: number;
    };
}
export interface BusinessMetrics {
    revenue: {
        total: number;
        recurring: number;
        growth: number;
        arpu: number;
        ltv: number;
    };
    customers: {
        total: number;
        new: number;
        retained: number;
        churned: number;
        satisfaction: number;
    };
    conversion: {
        leads: number;
        qualified: number;
        opportunities: number;
        closed: number;
        rate: number;
    };
    support: {
        tickets: number;
        resolved: number;
        avgResolutionTime: number;
        satisfaction: number;
    };
}
export interface PredictiveModel {
    id: string;
    name: string;
    description: string;
    type: 'regression' | 'classification' | 'time-series' | 'anomaly-detection';
    algorithm: string;
    features: string[];
    target: string;
    accuracy: number;
    confidence: number;
    trainedAt: Date;
    lastPrediction?: Date;
    trainingData: {
        samples: number;
        features: number;
        timeRange: {
            start: Date;
            end: Date;
        };
    };
    performance: {
        precision: number;
        recall: number;
        f1Score: number;
        mse?: number;
        mae?: number;
    };
    predictions: PredictionResult[];
    status: 'training' | 'ready' | 'needs-retraining' | 'error';
}
export interface PredictionResult {
    id: string;
    modelId: string;
    input: Record<string, any>;
    prediction: any;
    confidence: number;
    timestamp: Date;
    actual?: any;
    accuracy?: number;
}
export interface AnalyticsReport {
    id: string;
    name: string;
    description: string;
    type: 'performance' | 'usage' | 'business' | 'security' | 'compliance' | 'custom';
    format: 'pdf' | 'html' | 'csv' | 'json' | 'xlsx';
    schedule: {
        frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
        time?: string;
        timezone?: string;
        recipients: string[];
    };
    sections: ReportSection[];
    filters: Record<string, any>;
    lastGenerated?: Date;
    nextGeneration?: Date;
    generatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ReportSection {
    id: string;
    title: string;
    type: 'summary' | 'chart' | 'table' | 'text' | 'metrics';
    content: {
        query?: string;
        visualization?: any;
        text?: string;
        metrics?: string[];
    };
    order: number;
}
export interface AnalyticsConfiguration {
    collection: {
        enabled: boolean;
        samplingRate: number;
        batchSize: number;
        flushInterval: number;
    };
    storage: {
        retention: {
            raw: string;
            aggregated: string;
            summary: string;
        };
        compression: boolean;
        encryption: boolean;
    };
    processing: {
        realTime: boolean;
        batchProcessing: boolean;
        aggregationIntervals: string[];
    };
    alerts: {
        enabled: boolean;
        channels: string[];
        escalation: {
            levels: number;
            intervals: number[];
        };
    };
    privacy: {
        anonymization: boolean;
        gdprCompliant: boolean;
        dataMinimization: boolean;
    };
    integrations: {
        grafana?: {
            url: string;
            apiKey: string;
        };
        prometheus?: {
            url: string;
        };
        elasticsearch?: {
            url: string;
            index: string;
        };
        splunk?: {
            url: string;
            token: string;
        };
    };
}
export declare class AnalyticsManager extends EventEmitter {
    private metrics;
    private dashboards;
    private insights;
    private models;
    private reports;
    private analyticsPath;
    private logger;
    private config;
    private configuration;
    constructor(analyticsPath?: string, logger?: Logger, config?: ConfigManager);
    initialize(): Promise<void>;
    recordMetric(metric: Omit<AnalyticsMetric, 'id' | 'timestamp'>): Promise<void>;
    queryMetrics(query: {
        metrics: string[];
        timeRange: {
            start: Date;
            end: Date;
        };
        aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'p95' | 'p99';
        groupBy?: string[];
        filters?: Record<string, any>;
    }): Promise<Record<string, any[]>>;
    createDashboard(dashboardData: {
        name: string;
        description: string;
        type: AnalyticsDashboard['type'];
        widgets: Omit<DashboardWidget, 'id'>[];
        permissions?: Partial<AnalyticsDashboard['permissions']>;
    }): Promise<AnalyticsDashboard>;
    generateInsights(scope?: {
        metrics?: string[];
        timeRange?: {
            start: Date;
            end: Date;
        };
        categories?: string[];
    }): Promise<AnalyticsInsight[]>;
    trainPredictiveModel(modelConfig: {
        name: string;
        description: string;
        type: PredictiveModel['type'];
        algorithm: string;
        features: string[];
        target: string;
        trainingPeriod: {
            start: Date;
            end: Date;
        };
    }): Promise<PredictiveModel>;
    makePrediction(modelId: string, input: Record<string, any>): Promise<PredictionResult>;
    getPerformanceMetrics(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<PerformanceMetrics>;
    getUsageMetrics(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<UsageMetrics>;
    getBusinessMetrics(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<BusinessMetrics>;
    private getDefaultConfiguration;
    private loadConfigurations;
    private initializeDefaultDashboards;
    private startMetricsCollection;
    private collectSystemMetrics;
    private collectApplicationMetrics;
    private persistMetric;
    private checkForAnomalies;
    private detectAnomalies;
    private analyzeTrends;
    private analyzePerformance;
    private analyzeUsage;
    private analyzeCostOptimization;
    private collectTrainingData;
    private executeModelTraining;
    private executePrediction;
    private groupMetrics;
    private aggregateMetrics;
    private getLatestValue;
    private saveDashboard;
    private saveInsight;
    private saveModel;
}
//# sourceMappingURL=analytics-manager.d.ts.map