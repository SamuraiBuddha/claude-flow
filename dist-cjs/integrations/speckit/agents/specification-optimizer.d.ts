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
import type { AgentCapabilities, AgentConfig, AgentEnvironment, TaskDefinition } from '../../../swarm/types.js';
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
    window: number;
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
    predictions: Array<{
        timestamp: Date;
        value: number;
        confidence: number;
    }>;
    trend: 'up' | 'down' | 'stable';
}
/**
 * Regeneration trigger event
 */
export interface RegenerationTrigger {
    reason: string;
    specIds: string[];
    priority: 'immediate' | 'normal' | 'low';
    changes: Array<{
        path: string;
        type: 'add' | 'update' | 'remove';
        value: any;
    }>;
    triggeredAt: Date;
}
/**
 * Specification Optimizer Agent - Monitors and optimizes specifications
 */
export declare class SpecificationOptimizerAgent extends BaseAgent {
    private metricsBuffer;
    private thresholds;
    private proposals;
    private regenerationQueue;
    constructor(id: string, config: AgentConfig, environment: AgentEnvironment, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem);
    /**
     * Get default capabilities for specification optimization
     */
    protected getDefaultCapabilities(): AgentCapabilities;
    /**
     * Get default configuration for the agent
     */
    protected getDefaultConfig(): Partial<AgentConfig>;
    /**
     * Execute a specification optimization task
     */
    executeTask(task: TaskDefinition): Promise<any>;
    /**
     * Analyze production metrics for optimization opportunities
     */
    private analyzeMetrics;
    /**
     * Propose updates to specifications based on analysis
     */
    private proposeUpdates;
    /**
     * Trigger specification regeneration
     */
    private triggerRegeneration;
    /**
     * Forecast future metric values
     */
    private forecastMetrics;
    /**
     * Detect drift between specification and actual behavior
     */
    private detectDrift;
    /**
     * Perform general optimization analysis
     */
    private performGeneralOptimization;
    /**
     * Group metrics by name
     */
    private groupMetricsByName;
    /**
     * Analyze a time series of a single metric
     */
    private analyzeMetricSeries;
    /**
     * Check metrics against configured thresholds
     */
    private checkThresholds;
    /**
     * Generate optimization suggestions
     */
    private generateOptimizationSuggestions;
    /**
     * Create a specification update proposal
     */
    private createProposal;
    /**
     * Calculate forecast for a metric
     */
    private calculateForecast;
    /**
     * Evaluate if forecast indicates spec changes needed
     */
    private evaluateForecastImpact;
    /**
     * Calculate actual value from metrics
     */
    private calculateActualValue;
    /**
     * Generate recommendations for a metric
     */
    private generateMetricRecommendations;
    /**
     * Determine which spec section a metric belongs to
     */
    private determineSpecSection;
    /**
     * Calculate proposed value based on analysis
     */
    private calculateProposedValue;
    /**
     * Calculate confidence for a proposal
     */
    private calculateProposalConfidence;
    /**
     * Load default metric thresholds
     */
    private loadDefaultThresholds;
    /**
     * Get agent status with optimization-specific information
     */
    getAgentStatus(): any;
}
/**
 * Factory function to create a Specification Optimizer Agent
 */
export declare const createSpecificationOptimizerAgent: (id: string, config: Partial<AgentConfig>, environment: Partial<AgentEnvironment>, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem) => SpecificationOptimizerAgent;
//# sourceMappingURL=specification-optimizer.d.ts.map