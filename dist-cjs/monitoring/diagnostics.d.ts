/**
 * Diagnostic Tools for Claude Flow v2.0.0
 */
import { EventBus } from '../core/event-bus.js';
import { Logger } from '../core/logger.js';
import { HealthCheckManager } from './health-check.js';
import type { SystemHealth, SystemMetrics } from '../integration/types.js';
export interface DiagnosticReport {
    timestamp: number;
    systemHealth: SystemHealth;
    metrics: SystemMetrics | null;
    components: ComponentDiagnostic[];
    performance: PerformanceDiagnostic;
    recommendations: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface ComponentDiagnostic {
    name: string;
    status: 'healthy' | 'warning' | 'unhealthy';
    version?: string;
    uptime: number;
    lastError?: string;
    metrics?: Record<string, any>;
    issues: DiagnosticIssue[];
}
export interface DiagnosticIssue {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    recommendation?: string;
    data?: any;
}
export interface PerformanceDiagnostic {
    averageResponseTime: number;
    throughput: number;
    errorRate: number;
    memoryLeaks: boolean;
    bottlenecks: string[];
    optimization: string[];
}
export interface DiagnosticConfig {
    enableDetailedAnalysis?: boolean;
    includePerformanceMetrics?: boolean;
    generateRecommendations?: boolean;
    exportFormat?: 'json' | 'html' | 'text';
    outputPath?: string;
}
export declare class DiagnosticManager {
    private eventBus;
    private logger;
    private systemIntegration;
    private healthCheckManager;
    private performanceHistory;
    private errorHistory;
    constructor(eventBus: EventBus, logger: Logger, healthCheckManager?: HealthCheckManager);
    /**
     * Generate comprehensive diagnostic report
     */
    generateDiagnosticReport(config?: DiagnosticConfig): Promise<DiagnosticReport>;
    /**
     * Analyze individual components
     */
    private analyzeComponents;
    /**
     * Analyze individual component
     */
    private analyzeComponent;
    /**
     * Analyze system performance
     */
    private analyzePerformance;
    /**
     * Generate recommendations based on analysis
     */
    private generateRecommendations;
    /**
     * Calculate overall severity
     */
    private calculateSeverity;
    /**
     * Export diagnostic report
     */
    private exportReport;
    /**
     * Generate HTML report
     */
    private generateHtmlReport;
    /**
     * Generate text report
     */
    private generateTextReport;
    private analyzeComponentPerformance;
    private checkMemoryLeaks;
    private getLastError;
    private getComponentUptime;
    private calculateThroughput;
    private calculateErrorRate;
    private detectMemoryLeaks;
    private setupEventHandlers;
    /**
     * Run quick diagnostic check
     */
    quickDiagnostic(): Promise<{
        status: string;
        issues: number;
        recommendations: string[];
    }>;
}
//# sourceMappingURL=diagnostics.d.ts.map