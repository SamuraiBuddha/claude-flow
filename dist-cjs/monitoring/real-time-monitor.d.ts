/**
 * Real-time monitoring system for swarm operations
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../core/logger.js';
import type { IEventBus } from '../core/event-bus.js';
import type { SystemMetrics, Alert, AlertLevel, SwarmMetrics } from '../swarm/types.js';
import type { DistributedMemorySystem } from '../memory/distributed-memory.js';
export interface MonitorConfig {
    updateInterval: number;
    retentionPeriod: number;
    alertingEnabled: boolean;
    alertThresholds: AlertThresholds;
    metricsEnabled: boolean;
    tracingEnabled: boolean;
    dashboardEnabled: boolean;
    exportEnabled: boolean;
    exportFormat: 'json' | 'csv' | 'prometheus';
    debugMode: boolean;
}
export interface AlertThresholds {
    cpu: {
        warning: number;
        critical: number;
    };
    memory: {
        warning: number;
        critical: number;
    };
    disk: {
        warning: number;
        critical: number;
    };
    errorRate: {
        warning: number;
        critical: number;
    };
    responseTime: {
        warning: number;
        critical: number;
    };
    queueDepth: {
        warning: number;
        critical: number;
    };
    agentHealth: {
        warning: number;
        critical: number;
    };
    swarmUtilization: {
        warning: number;
        critical: number;
    };
}
export interface MetricPoint {
    timestamp: Date;
    value: number;
    tags: Record<string, string>;
    metadata?: Record<string, any>;
}
export interface TimeSeries {
    name: string;
    points: MetricPoint[];
    aggregations: {
        min: number;
        max: number;
        avg: number;
        sum: number;
        count: number;
    };
    lastUpdated: Date;
}
export interface MonitoringDashboard {
    title: string;
    panels: DashboardPanel[];
    refreshInterval: number;
    timeRange: {
        start: Date;
        end: Date;
    };
    filters: Record<string, any>;
}
export interface DashboardPanel {
    id: string;
    title: string;
    type: 'line' | 'bar' | 'gauge' | 'table' | 'heatmap' | 'stat';
    metrics: string[];
    config: {
        width: number;
        height: number;
        position: {
            x: number;
            y: number;
        };
        visualization: Record<string, any>;
    };
}
export interface AlertRule {
    id: string;
    name: string;
    enabled: boolean;
    metric: string;
    condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
    duration: number;
    severity: AlertLevel;
    tags: Record<string, string>;
    actions: AlertAction[];
    suppressions: AlertSuppression[];
}
export interface AlertAction {
    type: 'email' | 'webhook' | 'slack' | 'log' | 'auto-scale' | 'restart';
    config: Record<string, any>;
    enabled: boolean;
}
export interface AlertSuppression {
    condition: string;
    duration: number;
    reason: string;
}
export interface HealthCheck {
    name: string;
    type: 'http' | 'tcp' | 'custom';
    target: string;
    interval: number;
    timeout: number;
    retries: number;
    expectedResponse?: any;
    customCheck?: () => Promise<boolean>;
}
/**
 * Comprehensive real-time monitoring and alerting system
 */
export declare class RealTimeMonitor extends EventEmitter {
    private logger;
    private eventBus;
    private memory;
    private config;
    private timeSeries;
    private activeAlerts;
    private alertHistory;
    private monitoringInterval?;
    private healthCheckInterval?;
    private alertRules;
    private healthChecks;
    private systemMetrics;
    private agentMetrics;
    private swarmMetrics;
    private dashboards;
    private lastMetricsUpdate;
    private metricsBuffer;
    private alertProcessor?;
    constructor(config: Partial<MonitorConfig>, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem);
    private setupEventHandlers;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    private startMetricsCollection;
    private collectSystemMetrics;
    private updateSwarmLevelMetrics;
    recordMetric(name: string, value: number, tags?: Record<string, string>): void;
    private processMetricsBuffer;
    private processMetricPoint;
    private startAlertProcessing;
    private processAlerts;
    private checkAlertsForMetric;
    private evaluateAlertRule;
    private createAlert;
    private executeAlertActions;
    private resolveAlert;
    private startHealthChecks;
    private performHealthChecks;
    private executeHealthCheck;
    createDashboard(title: string, panels: DashboardPanel[]): string;
    getDashboardData(dashboardId: string): any;
    private getPanelData;
    private getCpuUsage;
    private getMemoryUsage;
    private getDiskUsage;
    private getNetworkUsage;
    private updateAgentMetrics;
    private updateSystemMetrics;
    private updateSwarmMetrics;
    private handleError;
    private isCriticalMetric;
    private evaluateCondition;
    private isAlertResolved;
    private getAlertTypeFromMetric;
    private calculateAgentUtilization;
    private calculateSwarmThroughput;
    private calculateAverageLatency;
    private calculateSwarmEfficiency;
    private calculateSwarmReliability;
    private calculateAverageQuality;
    private calculateAggregations;
    private cleanupOldMetrics;
    private cleanupResolvedAlerts;
    private flushMetrics;
    private exportMetrics;
    private initializeDefaultAlertRules;
    private initializeDefaultDashboards;
    private initializeHealthChecks;
    private performHttpHealthCheck;
    private performTcpHealthCheck;
    private sendEmailAlert;
    private sendWebhookAlert;
    private triggerAutoScale;
    private triggerRestart;
    private initializeSystemMetrics;
    private initializeSwarmMetrics;
    getSystemMetrics(): SystemMetrics;
    getSwarmMetrics(): SwarmMetrics;
    getActiveAlerts(): Alert[];
    getAlertHistory(limit?: number): Alert[];
    getTimeSeries(metricName: string): TimeSeries | undefined;
    getAllTimeSeries(): TimeSeries[];
    acknowledgeAlert(alertId: string, acknowledgedBy: string): void;
    createAlertRule(rule: Omit<AlertRule, 'id'>): string;
    updateAlertRule(ruleId: string, updates: Partial<AlertRule>): void;
    deleteAlertRule(ruleId: string): void;
    getAlertRules(): AlertRule[];
    getMonitoringStatistics(): {
        metricsCount: number;
        activeAlerts: number;
        alertRules: number;
        healthChecks: number;
        dashboards: number;
        uptime: number;
    };
}
//# sourceMappingURL=real-time-monitor.d.ts.map