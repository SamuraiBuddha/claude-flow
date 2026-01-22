/**
 * Memory Monitor and Optimization System
 *
 * Provides real-time monitoring, analysis, and optimization
 * recommendations for the Hive Mind memory subsystem.
 */
import { EventEmitter } from 'events';
import { Memory } from './Memory.js';
import { DatabaseManager } from './DatabaseManager.js';
interface MemoryAlert {
    level: 'info' | 'warning' | 'critical';
    type: string;
    message: string;
    value: number;
    threshold: number;
    timestamp: Date;
    recommendations: string[];
}
interface OptimizationSuggestion {
    type: 'cache' | 'database' | 'pool' | 'compression' | 'cleanup';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    estimatedImpact: string;
    implementation: string;
    effort: 'minimal' | 'moderate' | 'significant';
}
interface MemoryHealthReport {
    overall: {
        score: number;
        status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
        summary: string;
    };
    metrics: {
        cacheHitRate: number;
        avgQueryTime: number;
        memoryUtilization: number;
        compressionRatio: number;
        poolEfficiency: number;
    };
    alerts: MemoryAlert[];
    suggestions: OptimizationSuggestion[];
    trends: {
        performance: 'improving' | 'stable' | 'degrading';
        memoryUsage: 'increasing' | 'stable' | 'decreasing';
        cacheEfficiency: 'improving' | 'stable' | 'degrading';
    };
}
export declare class MemoryMonitor extends EventEmitter {
    private memory;
    private db;
    private isActive;
    private monitoringTimers;
    private historicalData;
    private alertThresholds;
    private alerts;
    private maxHistorySize;
    constructor(memory: Memory, db: DatabaseManager);
    /**
     * Start memory monitoring
     */
    start(): Promise<void>;
    /**
     * Stop memory monitoring
     */
    stop(): void;
    /**
     * Collect real-time metrics
     */
    private collectMetrics;
    /**
     * Establish performance baseline
     */
    private establishBaseline;
    /**
     * Store historical performance data
     */
    private storeHistoricalData;
    /**
     * Check metrics against alert thresholds
     */
    private checkAlerts;
    /**
     * Analyze overall system health
     */
    private analyzeHealth;
    /**
     * Generate optimization suggestions
     */
    private generateOptimizationSuggestions;
    /**
     * Calculate pool efficiency
     */
    private calculatePoolEfficiency;
    /**
     * Get average value from historical data
     */
    private getAverageFromHistory;
    /**
     * Calculate overall health score
     */
    private calculateOverallScore;
    /**
     * Get active alerts (within last hour)
     */
    private getActiveAlerts;
    /**
     * Generate health-based suggestions
     */
    private generateHealthSuggestions;
    /**
     * Calculate performance trends
     */
    private calculateTrends;
    /**
     * Analyze trends over time
     */
    private analyzeTrends;
    /**
     * Generate health summary
     */
    private generateHealthSummary;
    /**
     * Clean up old alerts
     */
    private cleanupOldAlerts;
    /**
     * Get current monitoring status
     */
    getStatus(): {
        isActive: boolean;
        alertCount: number;
        criticalAlerts: number;
        warningAlerts: number;
        historicalDataPoints: {
            metric: string;
            samples: number;
        }[];
    };
    /**
     * Get detailed memory report
     */
    generateDetailedReport(): Promise<MemoryHealthReport>;
    /**
     * Export monitoring data for analysis
     */
    exportData(): {
        historicalData: {
            [k: string]: number[];
        };
        alerts: MemoryAlert[];
        thresholds: {
            cacheHitRate: {
                warning: number;
                critical: number;
            };
            avgQueryTime: {
                warning: number;
                critical: number;
            };
            memoryUtilization: {
                warning: number;
                critical: number;
            };
            poolReuseRate: {
                warning: number;
                critical: number;
            };
        };
        status: {
            isActive: boolean;
            alertCount: number;
            criticalAlerts: number;
            warningAlerts: number;
            historicalDataPoints: {
                metric: string;
                samples: number;
            }[];
        };
    };
}
export {};
//# sourceMappingURL=MemoryMonitor.d.ts.map