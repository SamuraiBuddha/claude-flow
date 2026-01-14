/**
 * Specification Optimizer Agent
 *
 * Monitors production metrics, proposes spec updates, and triggers regeneration
 * when requirements change. Ensures specifications stay aligned with actual
 * system behavior and evolving requirements.
 *
 * @module SpecificationOptimizerAgent
 */

import { BaseAgent } from '../../../cli/agents/base-agent.js';
import type {
  AgentCapabilities,
  AgentConfig,
  AgentEnvironment,
  TaskDefinition,
} from '../../../swarm/types.js';
import type { ILogger } from '../../../core/logger.js';
import type { IEventBus } from '../../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../../memory/distributed-memory.js';

/**
 * Production metric data point
 */
export interface ProductionMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  source: string;
  tags: Record<string, string>;
}

/**
 * Metric threshold configuration
 */
export interface MetricThreshold {
  metric: string;
  warningThreshold: number;
  criticalThreshold: number;
  direction: 'above' | 'below';
  window: number; // Time window in ms
}

/**
 * Specification update proposal
 */
export interface SpecUpdateProposal {
  id: string;
  specId: string;
  section: string;
  currentValue: any;
  proposedValue: any;
  reason: string;
  impact: 'high' | 'medium' | 'low';
  supportingMetrics: ProductionMetric[];
  confidence: number;
  createdAt: Date;
  status: 'proposed' | 'approved' | 'rejected' | 'applied';
}

/**
 * Analysis result from metric evaluation
 */
export interface MetricAnalysisResult {
  metricName: string;
  trend: 'improving' | 'degrading' | 'stable';
  anomalies: MetricAnomaly[];
  forecast: MetricForecast;
  recommendations: string[];
}

/**
 * Anomaly detected in metrics
 */
export interface MetricAnomaly {
  timestamp: Date;
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  severity: 'warning' | 'critical';
}

/**
 * Metric forecast prediction
 */
export interface MetricForecast {
  metric: string;
  predictions: Array<{ timestamp: Date; value: number; confidence: number }>;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Regeneration trigger event
 */
export interface RegenerationTrigger {
  reason: string;
  specIds: string[];
  priority: 'immediate' | 'normal' | 'low';
  changes: Array<{ path: string; type: 'add' | 'update' | 'remove'; value: any }>;
  triggeredAt: Date;
}

/**
 * Specification Optimizer Agent - Monitors and optimizes specifications
 */
export class SpecificationOptimizerAgent extends BaseAgent {
  private metricsBuffer: ProductionMetric[] = [];
  private thresholds: MetricThreshold[] = [];
  private proposals: Map<string, SpecUpdateProposal> = new Map();
  private regenerationQueue: RegenerationTrigger[] = [];

  constructor(
    id: string,
    config: AgentConfig,
    environment: AgentEnvironment,
    logger: ILogger,
    eventBus: IEventBus,
    memory: DistributedMemorySystem,
  ) {
    super(id, 'optimizer', config, environment, logger, eventBus, memory);
    this.loadDefaultThresholds();
  }

  /**
   * Get default capabilities for specification optimization
   */
  protected getDefaultCapabilities(): AgentCapabilities {
    return {
      codeGeneration: false,
      codeReview: false,
      testing: false,
      documentation: true,
      research: true,
      analysis: true,
      webSearch: false,
      apiIntegration: true,
      fileSystem: true,
      terminalAccess: false,
      languages: [],
      frameworks: [],
      domains: [
        'specification-optimization',
        'metric-analysis',
        'performance-monitoring',
        'requirement-evolution',
        'specification-generation',
        'predictive-analysis',
      ],
      tools: [
        'analyze-metrics',
        'propose-updates',
        'trigger-regeneration',
        'forecast-metrics',
        'detect-drift',
        'optimize-thresholds',
      ],
      maxConcurrentTasks: 3,
      maxMemoryUsage: 512 * 1024 * 1024, // 512MB
      maxExecutionTime: 600000, // 10 minutes
      reliability: 0.92,
      speed: 0.85,
      quality: 0.95,
    };
  }

  /**
   * Get default configuration for the agent
   */
  protected getDefaultConfig(): Partial<AgentConfig> {
    return {
      autonomyLevel: 0.8,
      learningEnabled: true,
      adaptationEnabled: true,
      maxTasksPerHour: 20,
      maxConcurrentTasks: 3,
      timeoutThreshold: 600000,
      reportingInterval: 60000,
      heartbeatInterval: 15000,
      permissions: ['file-read', 'file-write', 'memory-access', 'metrics-read'],
      trustedAgents: [],
      expertise: {
        'metric-analysis': 0.95,
        'specification-optimization': 0.92,
        'trend-detection': 0.9,
        'anomaly-detection': 0.88,
      },
      preferences: {
        autoPropose: true,
        minConfidence: 0.7,
        analyzeWindow: 86400000, // 24 hours
        forecastHorizon: 604800000, // 7 days
      },
    };
  }

  /**
   * Execute a specification optimization task
   */
  override async executeTask(task: TaskDefinition): Promise<any> {
    this.logger.info('Specification Optimizer executing task', {
      agentId: this.id,
      taskType: task.type,
      taskId: task.id,
    });

    try {
      switch (task.type) {
        case 'analyze-metrics':
          return await this.analyzeMetrics(task);
        case 'propose-updates':
          return await this.proposeUpdates(task);
        case 'trigger-regeneration':
          return await this.triggerRegeneration(task);
        case 'forecast-metrics':
          return await this.forecastMetrics(task);
        case 'detect-drift':
          return await this.detectDrift(task);
        default:
          return await this.performGeneralOptimization(task);
      }
    } catch (error) {
      this.logger.error('Specification optimization task failed', {
        agentId: this.id,
        taskId: task.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Analyze production metrics for optimization opportunities
   */
  private async analyzeMetrics(task: TaskDefinition): Promise<any> {
    const metrics = task.input?.metrics || this.metricsBuffer;
    const window = task.parameters?.window || 86400000; // Default 24 hours
    const specId = task.parameters?.specId;

    this.logger.info('Analyzing metrics', {
      metricCount: metrics.length,
      window,
      specId,
    });

    const now = Date.now();
    const windowedMetrics = metrics.filter((m: ProductionMetric) =>
      now - m.timestamp.getTime() < window
    );

    const results: MetricAnalysisResult[] = [];
    const metricsByName = this.groupMetricsByName(windowedMetrics);

    for (const [name, values] of Object.entries(metricsByName)) {
      const analysis = await this.analyzeMetricSeries(name, values as ProductionMetric[]);
      results.push(analysis);
    }

    // Check against thresholds
    const violations = this.checkThresholds(windowedMetrics);

    // Generate optimization suggestions
    const suggestions = this.generateOptimizationSuggestions(results, violations);

    await this.memory.store(`analysis:${task.id.id}:result`, {
      specId,
      analysisResults: results,
      violations,
      suggestions,
      timestamp: new Date(),
    }, {
      type: 'metric-analysis',
      tags: ['analysis', 'metrics', specId || 'global'],
      partition: 'optimization',
    });

    return {
      metricsAnalyzed: windowedMetrics.length,
      results,
      violations,
      suggestions,
      recommendedActions: suggestions.filter(s => s.priority === 'high'),
    };
  }

  /**
   * Propose updates to specifications based on analysis
   */
  private async proposeUpdates(task: TaskDefinition): Promise<any> {
    const specId = task.input?.specId;
    const analysisResults = task.input?.analysisResults || [];
    const currentSpec = task.input?.currentSpec;

    this.logger.info('Proposing specification updates', {
      specId,
      analysisCount: analysisResults.length,
    });

    const proposals: SpecUpdateProposal[] = [];

    for (const analysis of analysisResults) {
      if (analysis.trend === 'degrading' || analysis.anomalies.length > 0) {
        const proposal = this.createProposal(specId, analysis, currentSpec);
        if (proposal && proposal.confidence >= 0.7) {
          proposals.push(proposal);
          this.proposals.set(proposal.id, proposal);
        }
      }
    }

    // Store proposals for tracking
    await this.memory.store(`proposals:${task.id.id}`, {
      specId,
      proposals,
      timestamp: new Date(),
    }, {
      type: 'spec-proposals',
      tags: ['proposals', specId],
      partition: 'optimization',
    });

    return {
      proposalCount: proposals.length,
      proposals,
      highImpact: proposals.filter(p => p.impact === 'high'),
      requiresReview: proposals.some(p => p.impact === 'high'),
    };
  }

  /**
   * Trigger specification regeneration
   */
  private async triggerRegeneration(task: TaskDefinition): Promise<RegenerationTrigger> {
    const specIds = task.input?.specIds || [];
    const reason = task.input?.reason || 'Manual trigger';
    const changes = task.input?.changes || [];
    const priority = task.parameters?.priority || 'normal';

    this.logger.info('Triggering specification regeneration', {
      specIds,
      reason,
      priority,
    });

    const trigger: RegenerationTrigger = {
      reason,
      specIds,
      priority,
      changes,
      triggeredAt: new Date(),
    };

    this.regenerationQueue.push(trigger);

    // Emit regeneration event
    this.eventBus.emit('spec:regeneration-triggered', {
      trigger,
      agentId: this.id,
    });

    await this.memory.store(`regeneration:${Date.now()}`, trigger, {
      type: 'regeneration-trigger',
      tags: ['regeneration', ...specIds],
      partition: 'optimization',
    });

    return trigger;
  }

  /**
   * Forecast future metric values
   */
  private async forecastMetrics(task: TaskDefinition): Promise<any> {
    const metricName = task.input?.metricName;
    const horizon = task.parameters?.horizon || 604800000; // 7 days
    const historicalData = task.input?.historicalData || this.metricsBuffer.filter(
      m => m.name === metricName
    );

    this.logger.info('Forecasting metrics', {
      metricName,
      horizon,
      dataPoints: historicalData.length,
    });

    if (historicalData.length < 10) {
      return {
        success: false,
        message: 'Insufficient historical data for forecasting',
        minRequired: 10,
        available: historicalData.length,
      };
    }

    const forecast = this.calculateForecast(metricName, historicalData, horizon);

    // Analyze if forecast indicates need for spec changes
    const specChangeNeeded = this.evaluateForecastImpact(forecast);

    return {
      metric: metricName,
      forecast,
      specChangeNeeded,
      confidence: forecast.predictions.reduce((sum, p) => sum + p.confidence, 0) /
        forecast.predictions.length,
      recommendations: specChangeNeeded
        ? ['Consider proactive specification updates based on forecast trends']
        : [],
    };
  }

  /**
   * Detect drift between specification and actual behavior
   */
  private async detectDrift(task: TaskDefinition): Promise<any> {
    const specId = task.input?.specId;
    const specification = task.input?.specification;
    const actualMetrics = task.input?.actualMetrics || this.metricsBuffer;

    this.logger.info('Detecting specification drift', {
      specId,
      metricCount: actualMetrics.length,
    });

    const driftAnalysis = {
      specId,
      driftDetected: false,
      driftAreas: [] as Array<{
        area: string;
        specValue: any;
        actualValue: any;
        deviation: number;
      }>,
      severity: 'none' as 'none' | 'low' | 'medium' | 'high',
      recommendations: [] as string[],
    };

    // Compare spec expectations with actual metrics
    if (specification?.performance) {
      for (const [key, expected] of Object.entries(specification.performance)) {
        const actual = this.calculateActualValue(key, actualMetrics);
        if (actual !== null) {
          const deviation = Math.abs((actual - (expected as number)) / (expected as number));
          if (deviation > 0.1) { // 10% deviation threshold
            driftAnalysis.driftDetected = true;
            driftAnalysis.driftAreas.push({
              area: key,
              specValue: expected,
              actualValue: actual,
              deviation,
            });
          }
        }
      }
    }

    // Calculate severity
    if (driftAnalysis.driftAreas.length > 0) {
      const maxDeviation = Math.max(...driftAnalysis.driftAreas.map(d => d.deviation));
      if (maxDeviation > 0.5) {
        driftAnalysis.severity = 'high';
      } else if (maxDeviation > 0.25) {
        driftAnalysis.severity = 'medium';
      } else {
        driftAnalysis.severity = 'low';
      }

      driftAnalysis.recommendations.push(
        `Update specification for: ${driftAnalysis.driftAreas.map(d => d.area).join(', ')}`
      );
    }

    await this.memory.store(`drift:${task.id.id}:analysis`, driftAnalysis, {
      type: 'drift-analysis',
      tags: ['drift', specId],
      partition: 'optimization',
    });

    return driftAnalysis;
  }

  /**
   * Perform general optimization analysis
   */
  private async performGeneralOptimization(task: TaskDefinition): Promise<any> {
    const spec = task.input?.specification;

    // Run comprehensive optimization analysis
    const metricsAnalysis = await this.analyzeMetrics({
      ...task,
      type: 'analyze-metrics',
      input: { metrics: this.metricsBuffer },
    });

    const proposals = await this.proposeUpdates({
      ...task,
      type: 'propose-updates',
      input: {
        specId: spec?.id,
        analysisResults: metricsAnalysis.results,
        currentSpec: spec,
      },
    });

    return {
      analysis: metricsAnalysis,
      proposals: proposals.proposals,
      summary: {
        optimizationOpportunities: proposals.proposalCount,
        criticalIssues: metricsAnalysis.violations.filter(
          (v: any) => v.severity === 'critical'
        ).length,
        recommendations: [
          ...metricsAnalysis.suggestions.map((s: any) => s.description),
          ...proposals.highImpact.map((p: SpecUpdateProposal) => p.reason),
        ],
      },
    };
  }

  /**
   * Group metrics by name
   */
  private groupMetricsByName(
    metrics: ProductionMetric[]
  ): Record<string, ProductionMetric[]> {
    const grouped: Record<string, ProductionMetric[]> = {};
    for (const metric of metrics) {
      if (!grouped[metric.name]) {
        grouped[metric.name] = [];
      }
      grouped[metric.name].push(metric);
    }
    return grouped;
  }

  /**
   * Analyze a time series of a single metric
   */
  private async analyzeMetricSeries(
    name: string,
    values: ProductionMetric[]
  ): Promise<MetricAnalysisResult> {
    const sortedValues = values.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const numericValues = sortedValues.map(v => v.value);
    const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
    const stdDev = Math.sqrt(
      numericValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / numericValues.length
    );

    // Detect trend
    const firstHalf = numericValues.slice(0, Math.floor(numericValues.length / 2));
    const secondHalf = numericValues.slice(Math.floor(numericValues.length / 2));
    const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    let trend: 'improving' | 'degrading' | 'stable' = 'stable';
    const trendThreshold = 0.05;
    if (secondMean > firstMean * (1 + trendThreshold)) {
      trend = name.includes('error') || name.includes('latency') ? 'degrading' : 'improving';
    } else if (secondMean < firstMean * (1 - trendThreshold)) {
      trend = name.includes('error') || name.includes('latency') ? 'improving' : 'degrading';
    }

    // Detect anomalies
    const anomalies: MetricAnomaly[] = [];
    for (const v of sortedValues) {
      const zScore = Math.abs(v.value - mean) / stdDev;
      if (zScore > 2) {
        anomalies.push({
          timestamp: v.timestamp,
          metric: name,
          expectedValue: mean,
          actualValue: v.value,
          deviation: zScore,
          severity: zScore > 3 ? 'critical' : 'warning',
        });
      }
    }

    return {
      metricName: name,
      trend,
      anomalies,
      forecast: this.calculateForecast(name, sortedValues, 86400000),
      recommendations: this.generateMetricRecommendations(name, trend, anomalies),
    };
  }

  /**
   * Check metrics against configured thresholds
   */
  private checkThresholds(metrics: ProductionMetric[]): any[] {
    const violations: any[] = [];

    for (const threshold of this.thresholds) {
      const relevantMetrics = metrics.filter(m => m.name === threshold.metric);
      if (relevantMetrics.length === 0) continue;

      const avgValue = relevantMetrics.reduce((sum, m) => sum + m.value, 0) /
        relevantMetrics.length;

      const isViolation = threshold.direction === 'above'
        ? avgValue > threshold.criticalThreshold
        : avgValue < threshold.criticalThreshold;

      const isWarning = threshold.direction === 'above'
        ? avgValue > threshold.warningThreshold
        : avgValue < threshold.warningThreshold;

      if (isViolation || isWarning) {
        violations.push({
          metric: threshold.metric,
          severity: isViolation ? 'critical' : 'warning',
          threshold: isViolation ? threshold.criticalThreshold : threshold.warningThreshold,
          actualValue: avgValue,
        });
      }
    }

    return violations;
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(
    results: MetricAnalysisResult[],
    violations: any[]
  ): any[] {
    const suggestions: any[] = [];

    for (const result of results) {
      if (result.trend === 'degrading') {
        suggestions.push({
          type: 'trend',
          metric: result.metricName,
          description: `${result.metricName} is showing a degrading trend`,
          priority: result.anomalies.some(a => a.severity === 'critical') ? 'high' : 'medium',
          actions: result.recommendations,
        });
      }
    }

    for (const violation of violations) {
      suggestions.push({
        type: 'threshold',
        metric: violation.metric,
        description: `${violation.metric} exceeds ${violation.severity} threshold`,
        priority: violation.severity === 'critical' ? 'high' : 'medium',
        actions: [`Investigate ${violation.metric} and update specifications if needed`],
      });
    }

    return suggestions;
  }

  /**
   * Create a specification update proposal
   */
  private createProposal(
    specId: string,
    analysis: MetricAnalysisResult,
    currentSpec: any
  ): SpecUpdateProposal | null {
    const proposal: SpecUpdateProposal = {
      id: `proposal-${Date.now()}-${analysis.metricName}`,
      specId,
      section: this.determineSpecSection(analysis.metricName),
      currentValue: currentSpec?.[analysis.metricName],
      proposedValue: this.calculateProposedValue(analysis),
      reason: `Metric ${analysis.metricName} shows ${analysis.trend} trend with ${analysis.anomalies.length} anomalies`,
      impact: analysis.anomalies.some(a => a.severity === 'critical') ? 'high' : 'medium',
      supportingMetrics: [],
      confidence: this.calculateProposalConfidence(analysis),
      createdAt: new Date(),
      status: 'proposed',
    };

    return proposal;
  }

  /**
   * Calculate forecast for a metric
   */
  private calculateForecast(
    metricName: string,
    data: ProductionMetric[],
    horizon: number
  ): MetricForecast {
    const sortedData = data.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const values = sortedData.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    // Simple linear regression for trend
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = mean;
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += (i - xMean) ** 2;
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    // Generate predictions
    const predictions: Array<{ timestamp: Date; value: number; confidence: number }> = [];
    const now = Date.now();
    const step = horizon / 7; // 7 prediction points

    for (let i = 1; i <= 7; i++) {
      const futureIndex = n + i;
      predictions.push({
        timestamp: new Date(now + step * i),
        value: slope * futureIndex + intercept,
        confidence: Math.max(0.5, 0.95 - i * 0.05), // Confidence decreases over time
      });
    }

    return {
      metric: metricName,
      predictions,
      trend: slope > 0.001 ? 'up' : slope < -0.001 ? 'down' : 'stable',
    };
  }

  /**
   * Evaluate if forecast indicates spec changes needed
   */
  private evaluateForecastImpact(forecast: MetricForecast): boolean {
    const lastPrediction = forecast.predictions[forecast.predictions.length - 1];
    const firstPrediction = forecast.predictions[0];

    const change = Math.abs(lastPrediction.value - firstPrediction.value) /
      firstPrediction.value;

    return change > 0.2; // 20% change threshold
  }

  /**
   * Calculate actual value from metrics
   */
  private calculateActualValue(key: string, metrics: ProductionMetric[]): number | null {
    const relevant = metrics.filter(m =>
      m.name.toLowerCase().includes(key.toLowerCase())
    );

    if (relevant.length === 0) return null;

    return relevant.reduce((sum, m) => sum + m.value, 0) / relevant.length;
  }

  /**
   * Generate recommendations for a metric
   */
  private generateMetricRecommendations(
    name: string,
    trend: string,
    anomalies: MetricAnomaly[]
  ): string[] {
    const recommendations: string[] = [];

    if (trend === 'degrading') {
      recommendations.push(`Investigate root cause of ${name} degradation`);
      recommendations.push(`Consider updating spec thresholds for ${name}`);
    }

    if (anomalies.length > 0) {
      recommendations.push(`Review ${anomalies.length} anomalies in ${name}`);
    }

    return recommendations;
  }

  /**
   * Determine which spec section a metric belongs to
   */
  private determineSpecSection(metricName: string): string {
    if (metricName.includes('latency') || metricName.includes('response')) {
      return 'performance.latency';
    }
    if (metricName.includes('error') || metricName.includes('failure')) {
      return 'reliability.errors';
    }
    if (metricName.includes('throughput') || metricName.includes('requests')) {
      return 'performance.throughput';
    }
    return 'metrics.general';
  }

  /**
   * Calculate proposed value based on analysis
   */
  private calculateProposedValue(analysis: MetricAnalysisResult): any {
    // Use forecast trend to propose new values
    const lastPrediction = analysis.forecast.predictions[analysis.forecast.predictions.length - 1];
    return {
      target: lastPrediction.value,
      tolerance: lastPrediction.value * 0.1,
      trend: analysis.trend,
    };
  }

  /**
   * Calculate confidence for a proposal
   */
  private calculateProposalConfidence(analysis: MetricAnalysisResult): number {
    let confidence = 0.8;

    // Reduce confidence for high anomaly count
    confidence -= analysis.anomalies.length * 0.05;

    // Increase confidence for clear trends
    if (analysis.trend !== 'stable') {
      confidence += 0.05;
    }

    // Use forecast confidence
    const avgForecastConfidence = analysis.forecast.predictions.reduce(
      (sum, p) => sum + p.confidence, 0
    ) / analysis.forecast.predictions.length;

    confidence = (confidence + avgForecastConfidence) / 2;

    return Math.max(0.5, Math.min(0.95, confidence));
  }

  /**
   * Load default metric thresholds
   */
  private loadDefaultThresholds(): void {
    this.thresholds = [
      {
        metric: 'response_time_ms',
        warningThreshold: 200,
        criticalThreshold: 500,
        direction: 'above',
        window: 300000,
      },
      {
        metric: 'error_rate',
        warningThreshold: 0.01,
        criticalThreshold: 0.05,
        direction: 'above',
        window: 300000,
      },
      {
        metric: 'availability',
        warningThreshold: 0.999,
        criticalThreshold: 0.99,
        direction: 'below',
        window: 3600000,
      },
    ];
  }

  /**
   * Get agent status with optimization-specific information
   */
  override getAgentStatus(): any {
    return {
      ...super.getAgentStatus(),
      specialization: 'Specification Optimization',
      metricsBuffered: this.metricsBuffer.length,
      activeProposals: this.proposals.size,
      pendingRegenerations: this.regenerationQueue.length,
      capabilities: [
        'analyze-metrics',
        'propose-updates',
        'trigger-regeneration',
      ],
    };
  }
}

/**
 * Factory function to create a Specification Optimizer Agent
 */
export const createSpecificationOptimizerAgent = (
  id: string,
  config: Partial<AgentConfig>,
  environment: Partial<AgentEnvironment>,
  logger: ILogger,
  eventBus: IEventBus,
  memory: DistributedMemorySystem,
): SpecificationOptimizerAgent => {
  const defaultConfig: AgentConfig = {
    autonomyLevel: 0.8,
    learningEnabled: true,
    adaptationEnabled: true,
    maxTasksPerHour: 20,
    maxConcurrentTasks: 3,
    timeoutThreshold: 600000,
    reportingInterval: 60000,
    heartbeatInterval: 15000,
    permissions: ['file-read', 'file-write', 'memory-access', 'metrics-read'],
    trustedAgents: [],
    expertise: {
      'metric-analysis': 0.95,
      'specification-optimization': 0.92,
    },
    preferences: {
      autoPropose: true,
      minConfidence: 0.7,
    },
  };

  const defaultEnv: AgentEnvironment = {
    runtime: 'node',
    version: '20.0.0',
    workingDirectory: './agents/specification-optimizer',
    tempDirectory: './tmp/specification-optimizer',
    logDirectory: './logs/specification-optimizer',
    apiEndpoints: {},
    credentials: {},
    availableTools: ['analyze-metrics', 'propose-updates', 'trigger-regeneration'],
    toolConfigs: {},
  };

  return new SpecificationOptimizerAgent(
    id,
    { ...defaultConfig, ...config } as AgentConfig,
    { ...defaultEnv, ...environment } as AgentEnvironment,
    logger,
    eventBus,
    memory,
  );
};
