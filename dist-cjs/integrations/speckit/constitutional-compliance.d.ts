/**
 * Constitutional Compliance Enforcer
 *
 * Enforces constitutional principles from spec-kit's constitution.md.
 * Implements the 9 Articles enforcement pattern:
 * I. Library-First
 * II. CLI Interface
 * III. Test-First (NON-NEGOTIABLE)
 * IV. Integration Testing
 * V. Observability
 * VI. Versioning
 * VII. Simplicity
 * VIII. Documentation
 * IX. Security
 *
 * Provides methods for:
 * - Loading and parsing constitution
 * - Validating plans against constitutional rules
 * - Checking gates before implementation
 * - Recording exceptions with justification
 * - Generating compliance reports
 * - Pre-blocking non-compliant implementations
 */
import { ConstitutionDocument, ConstitutionPrinciple, ConstitutionRule, RuleCheckType, ImplementationPlan, SpecificationDocument, TaskList, Artifact, ComplianceResult, ComplianceViolation, ComplianceWarning, ComplianceException, ComplianceReport, EventHandler } from './types.js';
/**
 * Configuration for ConstitutionalEnforcer
 */
export interface EnforcerConfig {
    /** Path to constitution.md file */
    constitutionPath?: string;
    /** Strict mode - fail on any violation */
    strictMode?: boolean;
    /** Allow exceptions with justification */
    allowExceptions?: boolean;
    /** Enable event emission */
    enableEvents?: boolean;
    /** Custom validators for rules */
    validators?: Map<string, RuleValidator>;
}
/**
 * Rule validator function type
 */
export type RuleValidator = (rule: ConstitutionRule, artifact: Artifact, context: ValidationContext) => ValidationResult;
/**
 * Context for rule validation
 */
export interface ValidationContext {
    constitution: ConstitutionDocument;
    principle: ConstitutionPrinciple;
    allArtifacts?: Artifact[];
    metadata?: Record<string, unknown>;
}
/**
 * Result of rule validation
 */
export interface ValidationResult {
    passed: boolean;
    message?: string;
    severity?: 'critical' | 'major' | 'minor';
    suggestion?: string;
}
/**
 * Gate check result
 */
export interface GateCheckResult {
    gateName: string;
    passed: boolean;
    violations: ComplianceViolation[];
    warnings: ComplianceWarning[];
    canProceed: boolean;
    requiredActions?: string[];
}
/**
 * ConstitutionalEnforcer - Enforces constitutional compliance
 */
export declare class ConstitutionalEnforcer {
    private constitution;
    private exceptions;
    private complianceHistory;
    private eventHandlers;
    private validators;
    private config;
    constructor(config?: EnforcerConfig);
    /**
     * Load constitution from file path
     */
    loadConstitution(filePath?: string): Promise<ConstitutionDocument>;
    /**
     * Load constitution from string content
     */
    loadConstitutionFromString(content: string, name?: string): ConstitutionDocument;
    /**
     * Get loaded constitution
     */
    getConstitution(): ConstitutionDocument | null;
    /**
     * Validate an implementation plan against the constitution
     */
    validatePlan(plan: ImplementationPlan): ComplianceResult;
    /**
     * Validate a specification document
     */
    validateSpec(spec: SpecificationDocument): ComplianceResult;
    /**
     * Validate a task list
     */
    validateTaskList(taskList: TaskList): ComplianceResult;
    /**
     * Check a gate before proceeding to next phase
     */
    checkGate(gateName: string, artifact: Artifact, checkType?: RuleCheckType): GateCheckResult;
    /**
     * Check pre-implementation gate
     */
    checkPreImplementationGate(artifact: Artifact): GateCheckResult;
    /**
     * Check post-implementation gate
     */
    checkPostImplementationGate(artifact: Artifact): GateCheckResult;
    /**
     * Record an exception for a violation
     */
    recordException(violationId: string, justification: string, approvedBy: string, scope?: 'permanent' | 'temporary' | 'one-time', expiresAt?: Date): ComplianceException;
    /**
     * Revoke an exception
     */
    revokeException(exceptionId: string): void;
    /**
     * Get all active exceptions
     */
    getActiveExceptions(): ComplianceException[];
    /**
     * Get applicable exceptions for violations
     */
    private getApplicableExceptions;
    /**
     * Generate a comprehensive compliance report
     */
    getComplianceReport(artifacts?: Artifact[]): ComplianceReport;
    /**
     * Validate any artifact type
     */
    private validateArtifact;
    /**
     * Generic artifact validation
     */
    private validateGenericArtifact;
    /**
     * Calculate principle-level compliance breakdown
     */
    private calculatePrincipleBreakdown;
    /**
     * Generate recommendations based on violations and warnings
     */
    private generateRecommendations;
    /**
     * Pre-block check - returns true if implementation should be blocked
     */
    shouldBlockImplementation(artifact: Artifact): {
        blocked: boolean;
        reason?: string;
        violations: ComplianceViolation[];
    };
    /**
     * Ensure constitution is loaded
     */
    private ensureConstitutionLoaded;
    /**
     * Validate artifact against a specific principle
     */
    private validateArtifactAgainstPrinciple;
    /**
     * Validate a single rule
     */
    private validateRule;
    /**
     * Default rule validation
     */
    private defaultValidateRule;
    /**
     * Validate test-related rules
     */
    private validateTestRequirement;
    /**
     * Validate library-first rules
     */
    private validateLibraryRequirement;
    /**
     * Validate CLI-related rules
     */
    private validateCLIRequirement;
    /**
     * Validate documentation rules
     */
    private validateDocumentationRequirement;
    /**
     * Get rules for a specific check type
     */
    private getRulesForCheckType;
    /**
     * Calculate compliance score
     */
    private calculateComplianceScore;
    /**
     * Initialize default validators
     */
    private initializeDefaultValidators;
    /**
     * Register a custom validator
     */
    registerValidator(name: string, validator: RuleValidator): void;
    /**
     * Subscribe to compliance events
     */
    subscribe(handler: EventHandler): () => void;
    /**
     * Emit an event
     */
    private emitEvent;
    /**
     * Get compliance history
     */
    getComplianceHistory(): ComplianceResult[];
    /**
     * Clear compliance history
     */
    clearHistory(): void;
    /**
     * Export state to JSON
     */
    toJSON(): string;
    /**
     * Import state from JSON
     */
    fromJSON(json: string): void;
}
export default ConstitutionalEnforcer;
//# sourceMappingURL=constitutional-compliance.d.ts.map