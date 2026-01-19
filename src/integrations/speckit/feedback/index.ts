/**
 * FeedbackLoop - Orchestrator for the spec-kit feedback system
 *
 * Coordinates metrics collection, spec analysis, regeneration triggers,
 * and version diffing in an event-driven architecture
 */

import { EventEmitter } from 'events';

// Import components
import {
  MetricsCollector,
  MetricsCollectorConfig,
  MetricEntry,
  MetricType,
  TrendAnalysis
} from './metrics-collector.js';

import {
  SpecAnalyzer,
  SpecAnalyzerConfig,
  AnalysisResult,
  Recommendation,
  PrioritizedChange,
  SpecExpectation
} from './spec-analyzer.js';

import {
  RegenerationTrigger,
  RegenerationTriggerConfig,
  RegenerationJob,
  Customization,
  SpecFile
} from './regeneration-trigger.js';

import {
  VersionDiff,
  VersionDiffConfig,
  DiffResult,
  SpecVersion,
  ImpactAssessment
} from './version-diff.js';

// Re-export all types
export * from './metrics-collector.js';
export * from './spec-analyzer.js';
export * from './regeneration-trigger.js';
export * from './version-diff.js';

// FeedbackLoop types
export interface FeedbackLoopConfig {
  metrics?: Partial<MetricsCollectorConfig>;
  analyzer?: Partial<SpecAnalyzerConfig>;
  regeneration?: Partial<RegenerationTriggerConfig>;
  diff?: Partial<VersionDiffConfig>;

  // Auto-regeneration thresholds
  autoRegeneration: {
    enabled: boolean;
    errorRateThreshold: number;
    performanceDegradationThreshold: number;
    coverageDropThreshold: number;
    minTimeBetweenRegenerations: number; // ms
  };

  // Notification settings
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
  'started': { timestamp: Date };
  'stopped': { timestamp: Date; reason?: string };
  'metric:collected': MetricEntry;
  'analysis:completed': AnalysisResult;
  'regeneration:triggered': RegenerationJob;
  'regeneration:completed': RegenerationJob;
  'threshold:exceeded': { type: string; threshold: number; current: number };
  'auto_regeneration:triggered': { reason: string; specPath: string };
  'notification:sent': { channel: string; message: string };
  'health:changed': { from: string; to: string };
  'error': Error;
}

/**
 * FeedbackLoop - Main orchestrator class
 */
export class FeedbackLoop extends EventEmitter {
  private config: FeedbackLoopConfig;
  private metricsCollector: MetricsCollector;
  private specAnalyzer: SpecAnalyzer;
  private regenerationTrigger: RegenerationTrigger;
  private versionDiff: VersionDiff;

  private isRunning = false;
  private startedAt?: Date;
  private metricsCount = 0;
  private analysisCount = 0;
  private regenerationCount = 0;
  private lastAnalysis?: AnalysisResult;
  private lastRegeneration?: RegenerationJob;
  private lastError?: Error;
  private healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  private lastAutoRegenTime = 0;
  private analysisTimer?: ReturnType<typeof setInterval>;

  constructor(config: Partial<FeedbackLoopConfig> = {}) {
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
    this.metricsCollector = new MetricsCollector(this.config.metrics);
    this.specAnalyzer = new SpecAnalyzer(this.metricsCollector, this.config.analyzer);
    this.regenerationTrigger = new RegenerationTrigger(this.config.regeneration);
    this.versionDiff = new VersionDiff(this.config.diff);

    // Wire up event handlers
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers between components
   */
  private setupEventHandlers(): void {
    // Metrics events
    this.metricsCollector.on('metric:recorded', (metric: MetricEntry) => {
      this.metricsCount++;
      this.emit('metric:collected', metric);
    });

    this.metricsCollector.on('threshold:exceeded', (data: any) => {
      this.emit('threshold:exceeded', data);
      this.checkAutoRegeneration(data);
    });

    this.metricsCollector.on('trend:detected', (trend: TrendAnalysis) => {
      this.checkTrendBasedRegeneration(trend);
    });

    this.metricsCollector.on('error', (error: Error) => {
      this.handleError(error, 'MetricsCollector');
    });

    // Analyzer events
    this.specAnalyzer.on('analysis:completed', (result: AnalysisResult) => {
      this.analysisCount++;
      this.lastAnalysis = result;
      this.emit('analysis:completed', result);
      this.checkAnalysisBasedRegeneration(result);
    });

    this.specAnalyzer.on('bottleneck:detected', (bottleneck: any) => {
      this.notify('bottleneck', `Bottleneck detected: ${bottleneck.location}`, 'high');
    });

    this.specAnalyzer.on('error_pattern:detected', (pattern: any) => {
      this.notify('error_pattern', `Error pattern: ${pattern.pattern}`, pattern.severity);
    });

    this.specAnalyzer.on('error', (error: Error) => {
      this.handleError(error, 'SpecAnalyzer');
    });

    // Regeneration events
    this.regenerationTrigger.on('spec:changed', (data: any) => {
      this.notify('spec_change', `Spec changed: ${data.file.path}`, 'medium');
    });

    this.regenerationTrigger.on('regeneration:started', (job: RegenerationJob) => {
      this.emit('regeneration:triggered', job);
    });

    this.regenerationTrigger.on('regeneration:completed', (job: RegenerationJob) => {
      this.regenerationCount++;
      this.lastRegeneration = job;
      this.emit('regeneration:completed', job);
    });

    this.regenerationTrigger.on('regeneration:failed', (data: any) => {
      this.notify('regen_failed', `Regeneration failed: ${data.error.message}`, 'high');
    });

    this.regenerationTrigger.on('error', (error: Error) => {
      this.handleError(error, 'RegenerationTrigger');
    });

    // Version diff events
    this.versionDiff.on('breaking:detected', (detail: any) => {
      this.notify('breaking_change', detail.description, 'critical');
    });

    this.versionDiff.on('error', (error: Error) => {
      this.handleError(error, 'VersionDiff');
    });
  }

  /**
   * Start the feedback loop
   */
  async start(): Promise<void> {
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

    } catch (error) {
      this.handleError(error as Error, 'Start');
      throw error;
    }
  }

  /**
   * Stop the feedback loop
   */
  async stop(reason?: string): Promise<void> {
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

    } catch (error) {
      this.handleError(error as Error, 'Stop');
    }
  }

  /**
   * Get current status
   */
  getStatus(): FeedbackLoopStatus {
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
  async forceAnalysis(specId?: string): Promise<AnalysisResult> {
    return this.specAnalyzer.analyze(specId);
  }

  /**
   * Force a regeneration
   */
  async forceRegeneration(
    specPath: string,
    options?: { cascade?: boolean; preserveCustomizations?: boolean }
  ): Promise<RegenerationJob> {
    return this.regenerationTrigger.triggerRegeneration(specPath, options);
  }

  /**
   * Compare spec versions
   */
  async compareVersions(
    baseVersion: SpecVersion,
    compareVersion: SpecVersion
  ): Promise<DiffResult> {
    return this.versionDiff.diff(baseVersion, compareVersion);
  }

  /**
   * Record a metric
   */
  async recordMetric(
    type: MetricType,
    name: string,
    value: number | string | boolean,
    options?: {
      unit?: string;
      tags?: string[];
      metadata?: Record<string, unknown>;
      specId?: string;
      storyId?: string;
    }
  ): Promise<MetricEntry> {
    return this.metricsCollector.recordMetric(type, name, value, options);
  }

  /**
   * Add a spec expectation
   */
  addExpectation(expectation: SpecExpectation): void {
    this.specAnalyzer.addExpectation(expectation);
  }

  /**
   * Record a customization to preserve during regeneration
   */
  async recordCustomization(
    customization: Omit<Customization, 'id' | 'timestamp'>
  ): Promise<Customization> {
    return this.regenerationTrigger.recordCustomization(customization);
  }

  /**
   * Get recommendations from latest analysis
   */
  async getRecommendations(): Promise<Recommendation[]> {
    return this.specAnalyzer.generateRecommendations(this.lastAnalysis || undefined);
  }

  /**
   * Get prioritized changes
   */
  async getPrioritizedChanges(): Promise<PrioritizedChange[]> {
    const recommendations = await this.getRecommendations();
    return this.specAnalyzer.prioritizeChanges(recommendations);
  }

  /**
   * Get trend analysis for a metric
   */
  async analyzeTrend(
    type: MetricType,
    name: string,
    options?: { period?: 'hour' | 'day' | 'week' | 'month'; lookbackPeriods?: number }
  ): Promise<TrendAnalysis> {
    return this.metricsCollector.analyzeTrends(type, name, options);
  }

  /**
   * Get impact assessment for spec changes
   */
  async getImpactAssessment(diffResult: DiffResult): Promise<ImpactAssessment> {
    return this.versionDiff.getImpactAssessment(diffResult);
  }

  /**
   * Store a spec version for tracking
   */
  storeSpecVersion(specId: string, version: SpecVersion): void {
    this.versionDiff.storeVersion(specId, version);
  }

  /**
   * Get version history for a spec
   */
  getVersionHistory(specId: string): SpecVersion[] {
    return this.versionDiff.getVersionHistory(specId);
  }

  // Component accessors

  get metrics(): MetricsCollector {
    return this.metricsCollector;
  }

  get analyzer(): SpecAnalyzer {
    return this.specAnalyzer;
  }

  get regenerator(): RegenerationTrigger {
    return this.regenerationTrigger;
  }

  get differ(): VersionDiff {
    return this.versionDiff;
  }

  // Private methods

  /**
   * Check if auto-regeneration should be triggered based on threshold
   */
  private checkAutoRegeneration(data: { type: string; threshold: number; current: number }): void {
    if (!this.config.autoRegeneration.enabled) return;
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
  private checkTrendBasedRegeneration(trend: TrendAnalysis): void {
    if (!this.config.autoRegeneration.enabled) return;
    if (trend.trend !== 'degrading') return;
    if (Math.abs(trend.changePercent) < this.config.autoRegeneration.performanceDegradationThreshold) {
      return;
    }

    const reason = `${trend.metric} degrading by ${Math.abs(trend.changePercent).toFixed(1)}%`;
    this.triggerAutoRegeneration(reason);
  }

  /**
   * Check if analysis result warrants auto-regeneration
   */
  private checkAnalysisBasedRegeneration(result: AnalysisResult): void {
    if (!this.config.autoRegeneration.enabled) return;
    if (result.status !== 'failing') return;
    if (result.overallScore > 50) return; // Only trigger for severe failures

    const reason = `Analysis score (${result.overallScore}) indicates severe issues`;
    this.triggerAutoRegeneration(reason);
  }

  /**
   * Trigger auto-regeneration
   */
  private async triggerAutoRegeneration(reason: string): Promise<void> {
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
  private handleError(error: Error, source: string): void {
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
  private performHealthCheck(): void {
    const previousHealth = this.healthStatus;

    // Check if components are functioning
    const issues: string[] = [];

    if (this.lastError && Date.now() - (this.lastError as any).timestamp < 300000) {
      issues.push('Recent error');
    }

    if (this.lastAnalysis && this.lastAnalysis.status === 'failing') {
      issues.push('Failing analysis');
    }

    // Determine health
    if (issues.length === 0) {
      this.healthStatus = 'healthy';
    } else if (issues.length <= 2) {
      this.healthStatus = 'degraded';
    } else {
      this.healthStatus = 'unhealthy';
    }

    if (previousHealth !== this.healthStatus) {
      this.emit('health:changed', { from: previousHealth, to: this.healthStatus });
    }
  }

  /**
   * Send notification
   */
  private notify(
    type: string,
    message: string,
    severity: 'critical' | 'high' | 'medium' | 'low'
  ): void {
    if (!this.config.notifications.enabled) return;
    if (!this.config.notifications.severityFilter.includes(severity)) return;

    const timestamp = new Date().toISOString();
    const fullMessage = `[${timestamp}] [${severity.toUpperCase()}] [${type}] ${message}`;

    for (const channel of this.config.notifications.channels) {
      switch (channel) {
        case 'console':
          if (severity === 'critical' || severity === 'high') {
            console.error(fullMessage);
          } else {
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
  private async sendWebhook(message: string, severity: string): Promise<void> {
    if (!this.config.notifications.webhookUrl) return;

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
    } catch (error) {
      // Silently ignore webhook failures
    }
  }
}

// Export default instance factory
export function createFeedbackLoop(config?: Partial<FeedbackLoopConfig>): FeedbackLoop {
  return new FeedbackLoop(config);
}

export default FeedbackLoop;
