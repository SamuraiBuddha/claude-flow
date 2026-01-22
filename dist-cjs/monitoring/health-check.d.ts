/**
 * Health Check System for Claude Flow v2.0.0
 */
import { EventBus } from '../core/event-bus.js';
import { Logger } from '../core/logger.js';
import type { HealthCheckResult, SystemHealth, SystemMetrics } from '../integration/types.js';
export interface HealthCheckConfig {
    interval?: number;
    timeout?: number;
    retries?: number;
    enableMetrics?: boolean;
    enableAlerts?: boolean;
}
export interface AlertConfig {
    webhook?: string;
    email?: string;
    slack?: string;
    threshold?: number;
}
export declare class HealthCheckManager {
    private eventBus;
    private logger;
    private systemIntegration;
    private config;
    private intervalId;
    private healthHistory;
    private isRunning;
    private lastMetrics;
    constructor(eventBus: EventBus, logger: Logger, config?: HealthCheckConfig);
    /**
     * Start health monitoring
     */
    start(): void;
    /**
     * Stop health monitoring
     */
    stop(): void;
    /**
     * Perform comprehensive health check
     */
    performHealthCheck(): Promise<SystemHealth>;
    /**
     * Check all system components
     */
    private checkAllComponents;
    /**
     * Check individual component health
     */
    private checkComponent;
    /**
     * Collect system metrics
     */
    private collectSystemMetrics;
    /**
     * Store health check history
     */
    private storeHealthHistory;
    /**
     * Check for alerts and send notifications
     */
    private checkForAlerts;
    /**
     * Get component health history
     */
    getHealthHistory(component?: string): HealthCheckResult[];
    /**
     * Get current system metrics
     */
    getCurrentMetrics(): SystemMetrics | null;
    /**
     * Get system health status
     */
    getSystemHealth(): Promise<SystemHealth>;
    /**
     * Get error count from recent history
     */
    private getErrorCount;
    /**
     * Setup event handlers
     */
    private setupEventHandlers;
    /**
     * Check if monitoring is running
     */
    isMonitoring(): boolean;
    /**
     * Get monitoring configuration
     */
    getConfig(): Required<HealthCheckConfig>;
}
//# sourceMappingURL=health-check.d.ts.map