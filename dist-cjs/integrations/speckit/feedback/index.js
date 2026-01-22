"use strict";
/**
 * FeedbackLoop - Orchestrator for the spec-kit feedback system
 *
 * Coordinates metrics collection, spec analysis, regeneration triggers,
 * and version diffing in an event-driven architecture
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackLoop = void 0;
exports.createFeedbackLoop = createFeedbackLoop;
const events_1 = require("events");
// Import components
const metrics_collector_js_1 = require("./metrics-collector.js");
const spec_analyzer_js_1 = require("./spec-analyzer.js");
const regeneration_trigger_js_1 = require("./regeneration-trigger.js");
const version_diff_js_1 = require("./version-diff.js");
// Re-export all types
__exportStar(require("./metrics-collector.js"), exports);
__exportStar(require("./spec-analyzer.js"), exports);
__exportStar(require("./regeneration-trigger.js"), exports);
__exportStar(require("./version-diff.js"), exports);
/**
 * FeedbackLoop - Main orchestrator class
 */
class FeedbackLoop extends events_1.EventEmitter {
    config;
    metricsCollector;
    specAnalyzer;
    regenerationTrigger;
    versionDiff;
    isRunning = false;
    startedAt;
    metricsCount = 0;
    analysisCount = 0;
    regenerationCount = 0;
    lastAnalysis;
    lastRegeneration;
    lastError;
    healthStatus = 'healthy';
    lastAutoRegenTime = 0;
    analysisTimer;
    constructor(config = {}) {
        super();
        this.config = {
            metrics: config.metrics,
            analyzer: config.analyzer,
            regeneration: config.regeneration,
            diff: config.diff,
            autoRegeneration: {
                enabled: config.autoRegeneration?.enabled ?? true,
                errorRateThreshold: config.autoRegeneration?.errorRateThreshold ?? 10,
                performanceDegradationThreshold: config.autoRegeneration?.performanceDegradationThreshold ?? 30,
                coverageDropThreshold: config.autoRegeneration?.coverageDropThreshold ?? 10,
                minTimeBetweenRegenerations: config.autoRegeneration?.minTimeBetweenRegenerations ?? 300000, // 5 min
            },
            notifications: {
                enabled: config.notifications?.enabled ?? true,
                channels: config.notifications?.channels ?? ['console', 'event'],
                webhookUrl: config.notifications?.webhookUrl,
                severityFilter: config.notifications?.severityFilter ?? ['critical', 'high'],
            },
        };
        // Initialize components
        this.metricsCollector = new metrics_collector_js_1.MetricsCollector(this.config.metrics);
        this.specAnalyzer = new spec_analyzer_js_1.SpecAnalyzer(this.metricsCollector, this.config.analyzer);
        this.regenerationTrigger = new regeneration_trigger_js_1.RegenerationTrigger(this.config.regeneration);
        this.versionDiff = new version_diff_js_1.VersionDiff(this.config.diff);
        // Wire up event handlers
        this.setupEventHandlers();
    }
    /**
     * Setup event handlers between components
     */
    setupEventHandlers() {
        // Metrics events
        this.metricsCollector.on('metric:recorded', (metric) => {
            this.metricsCount++;
            this.emit('metric:collected', metric);
        });
        this.metricsCollector.on('threshold:exceeded', (data) => {
            this.emit('threshold:exceeded', data);
            this.checkAutoRegeneration(data);
        });
        this.metricsCollector.on('trend:detected', (trend) => {
            this.checkTrendBasedRegeneration(trend);
        });
        this.metricsCollector.on('error', (error) => {
            this.handleError(error, 'MetricsCollector');
        });
        // Analyzer events
        this.specAnalyzer.on('analysis:completed', (result) => {
            this.analysisCount++;
            this.lastAnalysis = result;
            this.emit('analysis:completed', result);
            this.checkAnalysisBasedRegeneration(result);
        });
        this.specAnalyzer.on('bottleneck:detected', (bottleneck) => {
            this.notify('bottleneck', `Bottleneck detected: ${bottleneck.location}`, 'high');
        });
        this.specAnalyzer.on('error_pattern:detected', (pattern) => {
            this.notify('error_pattern', `Error pattern: ${pattern.pattern}`, pattern.severity);
        });
        this.specAnalyzer.on('error', (error) => {
            this.handleError(error, 'SpecAnalyzer');
        });
        // Regeneration events
        this.regenerationTrigger.on('spec:changed', (data) => {
            this.notify('spec_change', `Spec changed: ${data.file.path}`, 'medium');
        });
        this.regenerationTrigger.on('regeneration:started', (job) => {
            this.emit('regeneration:triggered', job);
        });
        this.regenerationTrigger.on('regeneration:completed', (job) => {
            this.regenerationCount++;
            this.lastRegeneration = job;
            this.emit('regeneration:completed', job);
        });
        this.regenerationTrigger.on('regeneration:failed', (data) => {
            this.notify('regen_failed', `Regeneration failed: ${data.error.message}`, 'high');
        });
        this.regenerationTrigger.on('error', (error) => {
            this.handleError(error, 'RegenerationTrigger');
        });
        // Version diff events
        this.versionDiff.on('breaking:detected', (detail) => {
            this.notify('breaking_change', detail.description, 'critical');
        });
        this.versionDiff.on('error', (error) => {
            this.handleError(error, 'VersionDiff');
        });
    }
    /**
     * Start the feedback loop
     */
    async start() {
        if (this.isRunning) {
            return;
        }
        try {
            // Initialize all components
            await this.metricsCollector.initialize();
            await this.regenerationTrigger.initialize();
            // Start watching for spec changes
            await this.regenerationTrigger.watchSpec();
            // Start continuous analysis
            this.specAnalyzer.start();
            // Start periodic health checks
            this.analysisTimer = setInterval(() => {
                this.performHealthCheck();
            }, 60000); // Every minute
            this.isRunning = true;
            this.startedAt = new Date();
            this.healthStatus = 'healthy';
            this.emit('started', { timestamp: this.startedAt });
            this.notify('system', 'Feedback loop started', 'low');
        }
        catch (error) {
            this.handleError(error, 'Start');
            throw error;
        }
    }
    /**
     * Stop the feedback loop
     */
    async stop(reason) {
        if (!this.isRunning) {
            return;
        }
        try {
            // Stop all components
            this.specAnalyzer.stop();
            this.regenerationTrigger.stopWatching();
            await this.metricsCollector.stop();
            if (this.analysisTimer) {
                clearInterval(this.analysisTimer);
            }
            this.isRunning = false;
            this.emit('stopped', { timestamp: new Date(), reason });
            this.notify('system', `Feedback loop stopped: ${reason || 'manual'}`, 'low');
        }
        catch (error) {
            this.handleError(error, 'Stop');
        }
    }
    /**
     * Get current status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            startedAt: this.startedAt,
            metricsCollected: this.metricsCount,
            analysesPerformed: this.analysisCount,
            regenerationsTriggered: this.regenerationCount,
            lastAnalysis: this.lastAnalysis,
            lastRegeneration: this.lastRegeneration,
            lastError: this.lastError,
            health: this.healthStatus,
            uptime: this.startedAt ? Date.now() - this.startedAt.getTime() : 0,
        };
    }
    /**
     * Force an immediate analysis
     */
    async forceAnalysis(specId) {
        return this.specAnalyzer.analyze(specId);
    }
    /**
     * Force a regeneration
     */
    async forceRegeneration(specPath, options) {
        return this.regenerationTrigger.triggerRegeneration(specPath, options);
    }
    /**
     * Compare spec versions
     */
    async compareVersions(baseVersion, compareVersion) {
        return this.versionDiff.diff(baseVersion, compareVersion);
    }
    /**
     * Record a metric
     */
    async recordMetric(type, name, value, options) {
        return this.metricsCollector.recordMetric(type, name, value, options);
    }
    /**
     * Add a spec expectation
     */
    addExpectation(expectation) {
        this.specAnalyzer.addExpectation(expectation);
    }
    /**
     * Record a customization to preserve during regeneration
     */
    async recordCustomization(customization) {
        return this.regenerationTrigger.recordCustomization(customization);
    }
    /**
     * Get recommendations from latest analysis
     */
    async getRecommendations() {
        return this.specAnalyzer.generateRecommendations(this.lastAnalysis || undefined);
    }
    /**
     * Get prioritized changes
     */
    async getPrioritizedChanges() {
        const recommendations = await this.getRecommendations();
        return this.specAnalyzer.prioritizeChanges(recommendations);
    }
    /**
     * Get trend analysis for a metric
     */
    async analyzeTrend(type, name, options) {
        return this.metricsCollector.analyzeTrends(type, name, options);
    }
    /**
     * Get impact assessment for spec changes
     */
    async getImpactAssessment(diffResult) {
        return this.versionDiff.getImpactAssessment(diffResult);
    }
    /**
     * Store a spec version for tracking
     */
    storeSpecVersion(specId, version) {
        this.versionDiff.storeVersion(specId, version);
    }
    /**
     * Get version history for a spec
     */
    getVersionHistory(specId) {
        return this.versionDiff.getVersionHistory(specId);
    }
    // Component accessors
    get metrics() {
        return this.metricsCollector;
    }
    get analyzer() {
        return this.specAnalyzer;
    }
    get regenerator() {
        return this.regenerationTrigger;
    }
    get differ() {
        return this.versionDiff;
    }
    // Private methods
    /**
     * Check if auto-regeneration should be triggered based on threshold
     */
    checkAutoRegeneration(data) {
        if (!this.config.autoRegeneration.enabled)
            return;
        if (Date.now() - this.lastAutoRegenTime < this.config.autoRegeneration.minTimeBetweenRegenerations) {
            return;
        }
        let shouldTrigger = false;
        let reason = '';
        if (data.type === 'error' && data.current > this.config.autoRegeneration.errorRateThreshold) {
            shouldTrigger = true;
            reason = `Error rate (${data.current.toFixed(1)}%) exceeded threshold (${this.config.autoRegeneration.errorRateThreshold}%)`;
        }
        if (data.type === 'coverage' && data.current < (100 - this.config.autoRegeneration.coverageDropThreshold)) {
            shouldTrigger = true;
            reason = `Coverage dropped below threshold`;
        }
        if (shouldTrigger) {
            this.triggerAutoRegeneration(reason);
        }
    }
    /**
     * Check if trend warrants auto-regeneration
     */
    checkTrendBasedRegeneration(trend) {
        if (!this.config.autoRegeneration.enabled)
            return;
        if (trend.trend !== 'degrading')
            return;
        if (Math.abs(trend.changePercent) < this.config.autoRegeneration.performanceDegradationThreshold) {
            return;
        }
        const reason = `${trend.metric} degrading by ${Math.abs(trend.changePercent).toFixed(1)}%`;
        this.triggerAutoRegeneration(reason);
    }
    /**
     * Check if analysis result warrants auto-regeneration
     */
    checkAnalysisBasedRegeneration(result) {
        if (!this.config.autoRegeneration.enabled)
            return;
        if (result.status !== 'failing')
            return;
        if (result.overallScore > 50)
            return; // Only trigger for severe failures
        const reason = `Analysis score (${result.overallScore}) indicates severe issues`;
        this.triggerAutoRegeneration(reason);
    }
    /**
     * Trigger auto-regeneration
     */
    async triggerAutoRegeneration(reason) {
        if (Date.now() - this.lastAutoRegenTime < this.config.autoRegeneration.minTimeBetweenRegenerations) {
            return;
        }
        this.lastAutoRegenTime = Date.now();
        this.notify('auto_regen', `Auto-regeneration triggered: ${reason}`, 'high');
        this.emit('auto_regeneration:triggered', {
            reason,
            specPath: 'all', // Could be more specific based on analysis
        });
        // Note: Actual regeneration path would need to be determined from metrics/analysis
    }
    /**
     * Handle errors from components
     */
    handleError(error, source) {
        this.lastError = error;
        // Update health status
        const previousHealth = this.healthStatus;
        this.healthStatus = 'degraded';
        if (previousHealth !== this.healthStatus) {
            this.emit('health:changed', { from: previousHealth, to: this.healthStatus });
        }
        this.emit('error', error);
        this.notify('error', `Error in ${source}: ${error.message}`, 'critical');
    }
    /**
     * Perform health check
     */
    performHealthCheck() {
        const previousHealth = this.healthStatus;
        // Check if components are functioning
        const issues = [];
        if (this.lastError && Date.now() - this.lastError.timestamp < 300000) {
            issues.push('Recent error');
        }
        if (this.lastAnalysis && this.lastAnalysis.status === 'failing') {
            issues.push('Failing analysis');
        }
        // Determine health
        if (issues.length === 0) {
            this.healthStatus = 'healthy';
        }
        else if (issues.length <= 2) {
            this.healthStatus = 'degraded';
        }
        else {
            this.healthStatus = 'unhealthy';
        }
        if (previousHealth !== this.healthStatus) {
            this.emit('health:changed', { from: previousHealth, to: this.healthStatus });
        }
    }
    /**
     * Send notification
     */
    notify(type, message, severity) {
        if (!this.config.notifications.enabled)
            return;
        if (!this.config.notifications.severityFilter.includes(severity))
            return;
        const timestamp = new Date().toISOString();
        const fullMessage = `[${timestamp}] [${severity.toUpperCase()}] [${type}] ${message}`;
        for (const channel of this.config.notifications.channels) {
            switch (channel) {
                case 'console':
                    if (severity === 'critical' || severity === 'high') {
                        console.error(fullMessage);
                    }
                    else {
                        console.log(fullMessage);
                    }
                    break;
                case 'event':
                    this.emit('notification:sent', { channel, message: fullMessage });
                    break;
                case 'webhook':
                    this.sendWebhook(fullMessage, severity).catch(() => {
                        // Ignore webhook errors
                    });
                    break;
            }
        }
    }
    /**
     * Send webhook notification
     */
    async sendWebhook(message, severity) {
        if (!this.config.notifications.webhookUrl)
            return;
        try {
            await fetch(this.config.notifications.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    severity,
                    timestamp: new Date().toISOString(),
                    source: 'claude-flow-feedback-loop',
                }),
            });
        }
        catch (error) {
            // Silently ignore webhook failures
        }
    }
}
exports.FeedbackLoop = FeedbackLoop;
// Export default instance factory
function createFeedbackLoop(config) {
    return new FeedbackLoop(config);
}
exports.default = FeedbackLoop;
//# sourceMappingURL=index.js.map