/**
 * Artifact Validator Agent
 *
 * Performs cross-artifact consistency checking (/speckit.analyze).
 * Validates user story coverage and test completeness across all
 * specification artifacts.
 *
 * @module ArtifactValidatorAgent
 */
import { BaseAgent } from '../../../cli/agents/base-agent.js';
import type { AgentCapabilities, AgentConfig, AgentEnvironment, TaskDefinition } from '../../../swarm/types.js';
import type { ILogger } from '../../../core/logger.js';
import type { IEventBus } from '../../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../../memory/distributed-memory.js';
/**
 * Specification artifact types
 */
export type ArtifactType = 'requirements' | 'user-stories' | 'data-model' | 'api-contracts' | 'test-plan' | 'implementation' | 'documentation';
/**
 * Specification artifact definition
 */
export interface SpecArtifact {
    id: string;
    type: ArtifactType;
    name: string;
    version: string;
    content: any;
    references: string[];
    createdAt: Date;
    updatedAt: Date;
    hash?: string;
}
/**
 * Validation result for an artifact
 */
export interface ArtifactValidationResult {
    artifactId: string;
    artifactType: ArtifactType;
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    coverage: CoverageReport;
    consistency: ConsistencyReport;
    timestamp: Date;
}
/**
 * Validation error details
 */
export interface ValidationError {
    code: string;
    message: string;
    severity: 'error' | 'critical';
    location: string;
    context: Record<string, any>;
    suggestedFix?: string;
}
/**
 * Validation warning details
 */
export interface ValidationWarning {
    code: string;
    message: string;
    location: string;
    recommendation: string;
}
/**
 * Coverage report for requirements/user stories
 */
export interface CoverageReport {
    totalItems: number;
    coveredItems: number;
    uncoveredItems: string[];
    coveragePercentage: number;
    byCategory: Record<string, {
        total: number;
        covered: number;
    }>;
}
/**
 * Consistency check results
 */
export interface ConsistencyReport {
    consistent: boolean;
    inconsistencies: ConsistencyIssue[];
    crossReferences: CrossReference[];
}
/**
 * A specific consistency issue
 */
export interface ConsistencyIssue {
    type: 'missing-reference' | 'conflicting-definition' | 'orphaned-artifact' | 'circular-dependency';
    description: string;
    artifacts: string[];
    severity: 'low' | 'medium' | 'high';
}
/**
 * Cross-reference between artifacts
 */
export interface CrossReference {
    sourceArtifact: string;
    targetArtifact: string;
    referenceType: string;
    valid: boolean;
    notes?: string;
}
/**
 * Gap in specification coverage
 */
export interface SpecificationGap {
    id: string;
    type: 'missing-requirement' | 'missing-test' | 'missing-implementation' | 'incomplete-spec';
    description: string;
    affectedArtifacts: string[];
    priority: 'high' | 'medium' | 'low';
    suggestedAction: string;
}
/**
 * Artifact Validator Agent - Cross-artifact consistency and coverage checking
 */
export declare class ArtifactValidatorAgent extends BaseAgent {
    private artifactCache;
    private validationHistory;
    constructor(id: string, config: AgentConfig, environment: AgentEnvironment, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem);
    /**
     * Get default capabilities for artifact validation
     */
    protected getDefaultCapabilities(): AgentCapabilities;
    /**
     * Get default configuration for the agent
     */
    protected getDefaultConfig(): Partial<AgentConfig>;
    /**
     * Execute an artifact validation task
     */
    executeTask(task: TaskDefinition): Promise<any>;
    /**
     * Validate a specification artifact
     */
    private validateSpec;
    /**
     * Check coverage of requirements and user stories
     */
    private checkCoverage;
    /**
     * Identify gaps in specification
     */
    private identifyGaps;
    /**
     * Analyze consistency across artifacts
     */
    private analyzeConsistency;
    /**
     * Trace requirements through implementation
     */
    private traceRequirements;
    /**
     * Perform general validation
     */
    private performGeneralValidation;
    /**
     * Validate artifact structure
     */
    private validateStructure;
    /**
     * Validate artifact references
     */
    private validateReferences;
    /**
     * Validate artifact by its type
     */
    private validateByType;
    /**
     * Calculate coverage for an artifact
     */
    private calculateCoverage;
    /**
     * Check consistency for a single artifact
     */
    private checkArtifactConsistency;
    /**
     * Analyze requirements coverage
     */
    private analyzeRequirementsCoverage;
    /**
     * Analyze user story coverage
     */
    private analyzeUserStoryCoverage;
    /**
     * Analyze test coverage
     */
    private analyzeTestCoverage;
    /**
     * Find requirement gaps
     */
    private findRequirementGaps;
    /**
     * Find test gaps
     */
    private findTestGaps;
    /**
     * Find implementation gaps
     */
    private findImplementationGaps;
    /**
     * Find incomplete specifications
     */
    private findIncompleteSpecs;
    /**
     * Detect circular dependencies
     */
    private detectCircularDependencies;
    /**
     * Find conflicting definitions
     */
    private findConflictingDefinitions;
    /**
     * Find related items for requirement tracing
     */
    private findRelatedItems;
    /**
     * Calculate overall health score
     */
    private calculateOverallHealth;
    /**
     * Generate validation recommendations
     */
    private generateValidationRecommendations;
    /**
     * Get agent status with validation-specific information
     */
    getAgentStatus(): any;
}
/**
 * Factory function to create an Artifact Validator Agent
 */
export declare const createArtifactValidatorAgent: (id: string, config: Partial<AgentConfig>, environment: Partial<AgentEnvironment>, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem) => ArtifactValidatorAgent;
//# sourceMappingURL=artifact-validator.d.ts.map