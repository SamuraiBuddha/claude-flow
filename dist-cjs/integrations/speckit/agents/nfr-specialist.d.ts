/**
 * NFR Specialist Agent
 *
 * Specializes in Non-Functional Requirements (performance, security, scalability).
 * Extracts NFRs from specifications, validates that plans address them, and
 * creates appropriate tests.
 *
 * @module NFRSpecialistAgent
 */
import { BaseAgent } from '../../../cli/agents/base-agent.js';
import type { AgentCapabilities, AgentConfig, AgentEnvironment, TaskDefinition } from '../../../swarm/types.js';
import type { ILogger } from '../../../core/logger.js';
import type { IEventBus } from '../../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../../memory/distributed-memory.js';
/**
 * Categories of non-functional requirements
 */
export type NFRCategory = 'performance' | 'security' | 'scalability' | 'reliability' | 'availability' | 'maintainability' | 'usability' | 'compliance' | 'interoperability' | 'portability';
/**
 * Non-functional requirement definition
 */
export interface NFR {
    id: string;
    category: NFRCategory;
    name: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    metrics: NFRMetric[];
    acceptanceCriteria: string[];
    source: string;
    status: 'extracted' | 'validated' | 'addressed' | 'tested' | 'verified';
    relatedRequirements: string[];
    testIds: string[];
    extractedAt: Date;
}
/**
 * Metric for measuring NFR compliance
 */
export interface NFRMetric {
    name: string;
    description: string;
    unit: string;
    targetValue: number;
    warningThreshold?: number;
    criticalThreshold?: number;
    measurementMethod: string;
}
/**
 * NFR validation result
 */
export interface NFRValidationResult {
    nfrId: string;
    addressed: boolean;
    coverage: number;
    gaps: NFRGap[];
    recommendations: string[];
    planReferences: string[];
}
/**
 * Gap in NFR coverage
 */
export interface NFRGap {
    nfrId: string;
    description: string;
    severity: 'critical' | 'major' | 'minor';
    impact: string;
    suggestedAction: string;
}
/**
 * NFR test definition
 */
export interface NFRTest {
    id: string;
    nfrId: string;
    name: string;
    description: string;
    type: NFRTestType;
    setup: string;
    steps: NFRTestStep[];
    expectedResults: ExpectedResult[];
    metrics: NFRMetric[];
    tools: string[];
    duration: number;
}
/**
 * Types of NFR tests
 */
export type NFRTestType = 'load-test' | 'stress-test' | 'endurance-test' | 'spike-test' | 'security-scan' | 'penetration-test' | 'failover-test' | 'recovery-test' | 'scalability-test' | 'compliance-audit';
/**
 * Test step
 */
export interface NFRTestStep {
    order: number;
    action: string;
    parameters: Record<string, any>;
    expectedOutcome: string;
    timeout?: number;
}
/**
 * Expected test result
 */
export interface ExpectedResult {
    metric: string;
    condition: 'lessThan' | 'greaterThan' | 'equals' | 'between' | 'exists';
    value: number | string | [number, number];
    tolerance?: number;
}
/**
 * NFR analysis report
 */
export interface NFRAnalysisReport {
    specId: string;
    totalNFRs: number;
    byCategory: Record<NFRCategory, number>;
    byPriority: Record<string, number>;
    coverage: {
        addressed: number;
        tested: number;
        verified: number;
        percentage: number;
    };
    gaps: NFRGap[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    generatedAt: Date;
}
/**
 * NFR Specialist Agent - Non-Functional Requirements expert
 */
export declare class NFRSpecialistAgent extends BaseAgent {
    private nfrs;
    private tests;
    private validationResults;
    constructor(id: string, config: AgentConfig, environment: AgentEnvironment, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem);
    /**
     * Get default capabilities for NFR specialization
     */
    protected getDefaultCapabilities(): AgentCapabilities;
    /**
     * Get default configuration for the agent
     */
    protected getDefaultConfig(): Partial<AgentConfig>;
    /**
     * Execute an NFR task
     */
    executeTask(task: TaskDefinition): Promise<any>;
    /**
     * Extract NFRs from specification
     */
    private extractNFRs;
    /**
     * Validate that a plan addresses NFRs
     */
    private validatePlan;
    /**
     * Create NFR tests
     */
    private createTests;
    /**
     * Analyze NFR metrics
     */
    private analyzeMetrics;
    /**
     * Assess NFR risks
     */
    private assessRisks;
    /**
     * Perform general NFR analysis
     */
    private performGeneralAnalysis;
    /**
     * Parse NFR section from specification
     */
    private parseNFRSection;
    /**
     * Create NFR from input
     */
    private createNFR;
    /**
     * Normalize category string to NFRCategory
     */
    private normalizeCategory;
    /**
     * Extract NFRs from content using patterns
     */
    private extractNFRsFromContent;
    /**
     * Extract performance NFRs
     */
    private extractPerformanceNFRs;
    /**
     * Extract security NFRs
     */
    private extractSecurityNFRs;
    /**
     * Extract scalability NFRs
     */
    private extractScalabilityNFRs;
    /**
     * Deduplicate NFRs
     */
    private deduplicateNFRs;
    /**
     * Group NFRs by category
     */
    private groupByCategory;
    /**
     * Group NFRs by priority
     */
    private groupByPriority;
    /**
     * Validate NFR against plan
     */
    private validateNFRAgainstPlan;
    /**
     * Generate tests for NFR
     */
    private generateTestsForNFR;
    /**
     * Generate a single test
     */
    private generateTest;
    /**
     * Generate test code
     */
    private generateTestCode;
    /**
     * Group tests by type
     */
    private groupTestsByType;
    /**
     * Evaluate metric against target
     */
    private evaluateMetric;
    /**
     * Generate metric recommendations
     */
    private generateMetricRecommendations;
    /**
     * Generate overall recommendations
     */
    private generateOverallRecommendations;
    /**
     * Assess NFR risk
     */
    private assessNFRRisk;
    /**
     * Generate plan recommendations
     */
    private generatePlanRecommendations;
    /**
     * Generate mitigation plan
     */
    private generateMitigationPlan;
    /**
     * Generate analysis recommendations
     */
    private generateAnalysisRecommendations;
    /**
     * Initialize NFR patterns
     */
    private initializeNFRPatterns;
    /**
     * Get agent status with NFR-specific information
     */
    getAgentStatus(): any;
}
/**
 * Factory function to create an NFR Specialist Agent
 */
export declare const createNFRSpecialistAgent: (id: string, config: Partial<AgentConfig>, environment: Partial<AgentEnvironment>, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem) => NFRSpecialistAgent;
//# sourceMappingURL=nfr-specialist.d.ts.map