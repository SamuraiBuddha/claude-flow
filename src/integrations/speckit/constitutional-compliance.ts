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

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  ConstitutionDocument,
  ConstitutionPrinciple,
  ConstitutionRule,
  RuleCheckType,
  EnforcementLevel,
  ImplementationPlan,
  SpecificationDocument,
  TaskList,
  Artifact,
  ComplianceResult,
  ComplianceViolation,
  ComplianceWarning,
  ComplianceException,
  ComplianceReport,
  PrincipleComplianceBreakdown,
  EventHandler,
  SpecKitEvent,
} from './types.js';
import { ConstitutionParser, parseConstitution } from './parsers/constitution-parser.js';

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
export type RuleValidator = (
  rule: ConstitutionRule,
  artifact: Artifact,
  context: ValidationContext
) => ValidationResult;

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
export class ConstitutionalEnforcer {
  private constitution: ConstitutionDocument | null = null;
  private exceptions: ComplianceException[] = [];
  private complianceHistory: ComplianceResult[] = [];
  private eventHandlers: EventHandler[] = [];
  private validators: Map<string, RuleValidator> = new Map();
  private config: Required<EnforcerConfig>;

  constructor(config: EnforcerConfig = {}) {
    this.config = {
      constitutionPath: config.constitutionPath || '',
      strictMode: config.strictMode ?? false,
      allowExceptions: config.allowExceptions ?? true,
      enableEvents: config.enableEvents ?? true,
      validators: config.validators || new Map(),
    };

    // Initialize default validators
    this.initializeDefaultValidators();
  }

  // ==========================================================================
  // Constitution Loading
  // ==========================================================================

  /**
   * Load constitution from file path
   */
  public async loadConstitution(filePath?: string): Promise<ConstitutionDocument> {
    const targetPath = filePath || this.config.constitutionPath;

    if (!targetPath) {
      throw new Error('No constitution path provided');
    }

    try {
      const content = await fs.promises.readFile(targetPath, 'utf-8');
      const result = parseConstitution(content, targetPath);

      if (!result.success || !result.data) {
        throw new Error(
          `Failed to parse constitution: ${result.errors.map((e) => e.message).join(', ')}`
        );
      }

      this.constitution = result.data;
      return this.constitution;
    } catch (error) {
      throw new Error(
        `Failed to load constitution from ${targetPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Load constitution from string content
   */
  public loadConstitutionFromString(
    content: string,
    name: string = 'constitution.md'
  ): ConstitutionDocument {
    const result = parseConstitution(content, name);

    if (!result.success || !result.data) {
      throw new Error(
        `Failed to parse constitution: ${result.errors.map((e) => e.message).join(', ')}`
      );
    }

    this.constitution = result.data;
    return this.constitution;
  }

  /**
   * Get loaded constitution
   */
  public getConstitution(): ConstitutionDocument | null {
    return this.constitution;
  }

  // ==========================================================================
  // Plan Validation
  // ==========================================================================

  /**
   * Validate an implementation plan against the constitution
   */
  public validatePlan(plan: ImplementationPlan): ComplianceResult {
    this.ensureConstitutionLoaded();

    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];
    let score = 100;

    // Check each principle
    for (const principle of this.constitution!.principles) {
      const principleResult = this.validateArtifactAgainstPrinciple(
        plan,
        principle,
        'plan'
      );

      violations.push(...principleResult.violations);
      warnings.push(...principleResult.warnings);
    }

    // Calculate score
    score = this.calculateComplianceScore(violations, warnings);

    const result: ComplianceResult = {
      timestamp: new Date(),
      artifact: plan,
      passed: violations.filter((v) => v.severity === 'critical').length === 0,
      violations,
      warnings,
      score,
    };

    // Store in history
    this.complianceHistory.push(result);

    // Emit event
    this.emitEvent({
      type: 'compliance:checked',
      payload: {
        artifactId: plan.id,
        passed: result.passed,
        score: result.score,
      },
    });

    return result;
  }

  /**
   * Validate a specification document
   */
  public validateSpec(spec: SpecificationDocument): ComplianceResult {
    this.ensureConstitutionLoaded();

    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];

    // Specs have fewer constitutional requirements
    // Check for required sections
    if (spec.userStories.length === 0) {
      warnings.push({
        id: crypto.randomUUID(),
        principleId: 'VII',
        description: 'Specification has no user stories defined',
        suggestion: 'Add user stories with acceptance criteria',
      });
    }

    // Check for success criteria
    if (spec.successCriteria.length === 0) {
      warnings.push({
        id: crypto.randomUUID(),
        principleId: 'V',
        description: 'No measurable success criteria defined',
        suggestion: 'Add success criteria with measurable metrics',
      });
    }

    const score = this.calculateComplianceScore(violations, warnings);

    const result: ComplianceResult = {
      timestamp: new Date(),
      artifact: spec,
      passed: violations.filter((v) => v.severity === 'critical').length === 0,
      violations,
      warnings,
      score,
    };

    this.complianceHistory.push(result);
    return result;
  }

  /**
   * Validate a task list
   */
  public validateTaskList(taskList: TaskList): ComplianceResult {
    this.ensureConstitutionLoaded();

    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];

    // Check Test-First principle (III)
    const testFirstPrinciple = this.constitution!.principles.find(
      (p) => p.name.toLowerCase().includes('test')
    );

    if (testFirstPrinciple) {
      // Verify test tasks come before implementation tasks
      const testTasks = taskList.tasks.filter(
        (t) => t.type === 'test' || t.type === 'testing'
      );
      const codeTasks = taskList.tasks.filter(
        (t) => t.type === 'coding' || t.type === 'service' || t.type === 'endpoint'
      );

      if (testTasks.length === 0 && codeTasks.length > 0) {
        violations.push({
          id: crypto.randomUUID(),
          principleId: testFirstPrinciple.id,
          principleName: testFirstPrinciple.name,
          ruleId: 'test-first',
          description: 'No test tasks found. Test-First is NON-NEGOTIABLE.',
          severity: 'critical',
          suggestion: 'Add test tasks before implementation tasks',
        });
      } else {
        // Check ordering - tests should come before code
        const firstTestIdx = taskList.tasks.findIndex(
          (t) => t.type === 'test' || t.type === 'testing'
        );
        const firstCodeIdx = taskList.tasks.findIndex(
          (t) => t.type === 'coding' || t.type === 'service' || t.type === 'endpoint'
        );

        if (firstCodeIdx >= 0 && (firstTestIdx < 0 || firstCodeIdx < firstTestIdx)) {
          warnings.push({
            id: crypto.randomUUID(),
            principleId: testFirstPrinciple.id,
            description: 'Implementation tasks appear before test tasks',
            suggestion: 'Reorder tasks: write tests first, then implement (red-green-refactor)',
          });
        }
      }
    }

    // Check Library-First principle (I)
    const libraryFirstPrinciple = this.constitution!.principles.find(
      (p) => p.name.toLowerCase().includes('library')
    );

    if (libraryFirstPrinciple) {
      // Verify library/module tasks exist
      const hasLibraryTasks = taskList.tasks.some(
        (t) =>
          t.description.toLowerCase().includes('library') ||
          t.description.toLowerCase().includes('module') ||
          t.filePath?.includes('/lib/')
      );

      if (!hasLibraryTasks && taskList.tasks.length > 5) {
        warnings.push({
          id: crypto.randomUUID(),
          principleId: libraryFirstPrinciple.id,
          description: 'No explicit library/module creation tasks found',
          suggestion: 'Consider structuring features as standalone libraries first',
        });
      }
    }

    const score = this.calculateComplianceScore(violations, warnings);

    const result: ComplianceResult = {
      timestamp: new Date(),
      artifact: taskList,
      passed: violations.filter((v) => v.severity === 'critical').length === 0,
      violations,
      warnings,
      score,
    };

    this.complianceHistory.push(result);
    return result;
  }

  // ==========================================================================
  // Gate Checking
  // ==========================================================================

  /**
   * Check a gate before proceeding to next phase
   */
  public checkGate(
    gateName: string,
    artifact: Artifact,
    checkType?: RuleCheckType
  ): GateCheckResult {
    this.ensureConstitutionLoaded();

    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];
    const requiredActions: string[] = [];

    // Get rules for this check type
    const rules = this.getRulesForCheckType(checkType || 'gate');

    for (const { principle, rule } of rules) {
      const result = this.validateRule(rule, artifact, principle);

      if (!result.passed) {
        if (principle.enforcementLevel === 'mandatory') {
          violations.push({
            id: crypto.randomUUID(),
            principleId: principle.id,
            principleName: principle.name,
            ruleId: rule.id,
            description: result.message || rule.errorMessage,
            severity: 'critical',
            suggestion: result.suggestion,
          });
          requiredActions.push(result.suggestion || `Fix: ${rule.description}`);
        } else {
          warnings.push({
            id: crypto.randomUUID(),
            principleId: principle.id,
            description: result.message || rule.errorMessage,
            suggestion: result.suggestion,
          });
        }
      }
    }

    // Check for existing exceptions
    const applicableExceptions = this.getApplicableExceptions(violations);
    const unresolvedViolations = violations.filter(
      (v) => !applicableExceptions.find((e) => e.violationId === v.id)
    );

    const passed = unresolvedViolations.length === 0;
    const canProceed = passed || !this.config.strictMode;

    if (!passed) {
      this.emitEvent({
        type: 'gate:failed',
        payload: {
          gateName,
          reason: unresolvedViolations.map((v) => v.description).join('; '),
        },
      });
    } else {
      this.emitEvent({
        type: 'gate:passed',
        payload: {
          gateName,
          phase: 'implementation' as any,
        },
      });
    }

    return {
      gateName,
      passed,
      violations,
      warnings,
      canProceed,
      requiredActions: requiredActions.length > 0 ? requiredActions : undefined,
    };
  }

  /**
   * Check pre-implementation gate
   */
  public checkPreImplementationGate(artifact: Artifact): GateCheckResult {
    return this.checkGate('pre-implementation', artifact, 'pre-implementation');
  }

  /**
   * Check post-implementation gate
   */
  public checkPostImplementationGate(artifact: Artifact): GateCheckResult {
    return this.checkGate('post-implementation', artifact, 'post-implementation');
  }

  // ==========================================================================
  // Exception Management
  // ==========================================================================

  /**
   * Record an exception for a violation
   */
  public recordException(
    violationId: string,
    justification: string,
    approvedBy: string,
    scope: 'permanent' | 'temporary' | 'one-time' = 'one-time',
    expiresAt?: Date
  ): ComplianceException {
    if (!this.config.allowExceptions) {
      throw new Error('Exceptions are not allowed in current configuration');
    }

    if (!justification || justification.trim().length < 10) {
      throw new Error('Justification must be at least 10 characters');
    }

    const exception: ComplianceException = {
      id: crypto.randomUUID(),
      violationId,
      justification: justification.trim(),
      approvedBy,
      approvedAt: new Date(),
      expiresAt,
      scope,
    };

    this.exceptions.push(exception);

    this.emitEvent({
      type: 'exception:granted',
      payload: {
        exceptionId: exception.id,
        violationId,
      },
    });

    return exception;
  }

  /**
   * Revoke an exception
   */
  public revokeException(exceptionId: string): void {
    const index = this.exceptions.findIndex((e) => e.id === exceptionId);
    if (index > -1) {
      this.exceptions.splice(index, 1);
    }
  }

  /**
   * Get all active exceptions
   */
  public getActiveExceptions(): ComplianceException[] {
    const now = new Date();
    return this.exceptions.filter(
      (e) => !e.expiresAt || e.expiresAt > now
    );
  }

  /**
   * Get applicable exceptions for violations
   */
  private getApplicableExceptions(violations: ComplianceViolation[]): ComplianceException[] {
    const now = new Date();
    return this.exceptions.filter(
      (e) =>
        violations.some((v) => v.id === e.violationId) &&
        (!e.expiresAt || e.expiresAt > now)
    );
  }

  // ==========================================================================
  // Compliance Reports
  // ==========================================================================

  /**
   * Generate a comprehensive compliance report
   */
  public getComplianceReport(artifacts?: Artifact[]): ComplianceReport {
    this.ensureConstitutionLoaded();

    const targetArtifacts = artifacts || this.complianceHistory.map((h) => h.artifact);

    // Re-validate all artifacts
    const results: ComplianceResult[] = [];
    for (const artifact of targetArtifacts) {
      const result = this.validateArtifact(artifact);
      results.push(result);
    }

    // Aggregate violations
    const allViolations = results.flatMap((r) => r.violations);
    const allWarnings = results.flatMap((r) => r.warnings);

    // Calculate principle breakdown
    const principleBreakdown = this.calculatePrincipleBreakdown(results);

    // Calculate overall score
    const overallScore =
      results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
        : 100;

    // Generate recommendations
    const recommendations = this.generateRecommendations(allViolations, allWarnings);

    return {
      generatedAt: new Date(),
      projectName: this.constitution!.projectName,
      constitutionVersion: this.constitution!.version,
      overallScore,
      totalArtifacts: targetArtifacts.length,
      compliantArtifacts: results.filter((r) => r.passed).length,
      principleBreakdown,
      violations: allViolations,
      exceptions: this.getActiveExceptions(),
      recommendations,
    };
  }

  /**
   * Validate any artifact type
   */
  private validateArtifact(artifact: Artifact): ComplianceResult {
    switch (artifact.type) {
      case 'plan':
        return this.validatePlan(artifact as ImplementationPlan);
      case 'specification':
        return this.validateSpec(artifact as SpecificationDocument);
      case 'task-list':
        return this.validateTaskList(artifact as TaskList);
      default:
        // Generic validation
        return this.validateGenericArtifact(artifact);
    }
  }

  /**
   * Generic artifact validation
   */
  private validateGenericArtifact(artifact: Artifact): ComplianceResult {
    this.ensureConstitutionLoaded();

    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];

    for (const principle of this.constitution!.principles) {
      const principleResult = this.validateArtifactAgainstPrinciple(
        artifact,
        principle,
        artifact.type
      );
      violations.push(...principleResult.violations);
      warnings.push(...principleResult.warnings);
    }

    const score = this.calculateComplianceScore(violations, warnings);

    return {
      timestamp: new Date(),
      artifact,
      passed: violations.filter((v) => v.severity === 'critical').length === 0,
      violations,
      warnings,
      score,
    };
  }

  /**
   * Calculate principle-level compliance breakdown
   */
  private calculatePrincipleBreakdown(results: ComplianceResult[]): PrincipleComplianceBreakdown[] {
    const breakdown: PrincipleComplianceBreakdown[] = [];

    for (const principle of this.constitution!.principles) {
      const principleViolations = results.flatMap((r) =>
        r.violations.filter((v) => v.principleId === principle.id)
      );

      const principleExceptions = this.exceptions.filter((e) =>
        principleViolations.some((v) => v.id === e.violationId)
      );

      const passRate =
        results.length > 0
          ? Math.round(
              ((results.length - principleViolations.length) / results.length) * 100
            )
          : 100;

      breakdown.push({
        principleId: principle.id,
        principleName: principle.name,
        passed: principleViolations.length === 0,
        passRate,
        violationCount: principleViolations.length,
        exceptionCount: principleExceptions.length,
      });
    }

    return breakdown;
  }

  /**
   * Generate recommendations based on violations and warnings
   */
  private generateRecommendations(
    violations: ComplianceViolation[],
    warnings: ComplianceWarning[]
  ): string[] {
    const recommendations: string[] = [];
    const seenPrinciples = new Set<string>();

    // Prioritize critical violations
    for (const violation of violations.filter((v) => v.severity === 'critical')) {
      if (!seenPrinciples.has(violation.principleId)) {
        recommendations.push(
          `CRITICAL: Address ${violation.principleName} violations - ${violation.suggestion || violation.description}`
        );
        seenPrinciples.add(violation.principleId);
      }
    }

    // Add major violations
    for (const violation of violations.filter((v) => v.severity === 'major')) {
      if (!seenPrinciples.has(violation.principleId)) {
        recommendations.push(
          `Review ${violation.principleName}: ${violation.suggestion || violation.description}`
        );
        seenPrinciples.add(violation.principleId);
      }
    }

    // Add top warnings
    const warningPrinciples = new Set<string>();
    for (const warning of warnings.slice(0, 5)) {
      if (!warningPrinciples.has(warning.principleId)) {
        recommendations.push(
          `Consider: ${warning.suggestion || warning.description}`
        );
        warningPrinciples.add(warning.principleId);
      }
    }

    return recommendations;
  }

  // ==========================================================================
  // Pre-blocking Non-compliant Implementations
  // ==========================================================================

  /**
   * Pre-block check - returns true if implementation should be blocked
   */
  public shouldBlockImplementation(artifact: Artifact): {
    blocked: boolean;
    reason?: string;
    violations: ComplianceViolation[];
  } {
    const gateResult = this.checkPreImplementationGate(artifact);

    const criticalViolations = gateResult.violations.filter(
      (v) => v.severity === 'critical'
    );

    // Check for exceptions
    const unresolvedCritical = criticalViolations.filter(
      (v) => !this.exceptions.find((e) => e.violationId === v.id)
    );

    if (unresolvedCritical.length > 0) {
      return {
        blocked: true,
        reason: `Critical violations found: ${unresolvedCritical.map((v) => v.principleName).join(', ')}`,
        violations: unresolvedCritical,
      };
    }

    return {
      blocked: false,
      violations: [],
    };
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * Ensure constitution is loaded
   */
  private ensureConstitutionLoaded(): void {
    if (!this.constitution) {
      throw new Error('Constitution not loaded. Call loadConstitution() first.');
    }
  }

  /**
   * Validate artifact against a specific principle
   */
  private validateArtifactAgainstPrinciple(
    artifact: Artifact,
    principle: ConstitutionPrinciple,
    artifactType: string
  ): { violations: ComplianceViolation[]; warnings: ComplianceWarning[] } {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];

    for (const rule of principle.rules) {
      const result = this.validateRule(rule, artifact, principle);

      if (!result.passed) {
        if (principle.enforcementLevel === 'mandatory') {
          violations.push({
            id: crypto.randomUUID(),
            principleId: principle.id,
            principleName: principle.name,
            ruleId: rule.id,
            description: result.message || rule.errorMessage,
            severity: result.severity || 'major',
            location: artifact.path,
            suggestion: result.suggestion,
          });
        } else {
          warnings.push({
            id: crypto.randomUUID(),
            principleId: principle.id,
            description: result.message || rule.errorMessage,
            suggestion: result.suggestion,
          });
        }
      }
    }

    return { violations, warnings };
  }

  /**
   * Validate a single rule
   */
  private validateRule(
    rule: ConstitutionRule,
    artifact: Artifact,
    principle: ConstitutionPrinciple
  ): ValidationResult {
    // Check for custom validator
    if (rule.validator && this.validators.has(rule.validator)) {
      const validator = this.validators.get(rule.validator)!;
      return validator(rule, artifact, {
        constitution: this.constitution!,
        principle,
      });
    }

    // Use default validation based on rule description
    return this.defaultValidateRule(rule, artifact, principle);
  }

  /**
   * Default rule validation
   */
  private defaultValidateRule(
    rule: ConstitutionRule,
    artifact: Artifact,
    principle: ConstitutionPrinciple
  ): ValidationResult {
    const ruleDescription = rule.description.toLowerCase();

    // Check for common patterns in rule description
    if (ruleDescription.includes('test')) {
      return this.validateTestRequirement(artifact, rule);
    }

    if (ruleDescription.includes('library') || ruleDescription.includes('standalone')) {
      return this.validateLibraryRequirement(artifact, rule);
    }

    if (ruleDescription.includes('cli') || ruleDescription.includes('text in/out')) {
      return this.validateCLIRequirement(artifact, rule);
    }

    if (ruleDescription.includes('document') || ruleDescription.includes('documented')) {
      return this.validateDocumentationRequirement(artifact, rule);
    }

    // Default: pass if we can't validate
    return { passed: true };
  }

  /**
   * Validate test-related rules
   */
  private validateTestRequirement(artifact: Artifact, rule: ConstitutionRule): ValidationResult {
    // For task lists, check for test tasks
    if (artifact.type === 'task-list') {
      const taskList = artifact as TaskList;
      const hasTests = taskList.tasks.some(
        (t) => t.type === 'test' || t.type === 'testing'
      );

      if (!hasTests) {
        return {
          passed: false,
          message: 'No test tasks defined',
          severity: 'critical',
          suggestion: 'Add test tasks following TDD: write tests first, then implement',
        };
      }
    }

    // For plans, check for test strategy
    if (artifact.type === 'plan') {
      const plan = artifact as ImplementationPlan;
      const hasTestFramework = plan.techStack?.testingFramework;

      if (!hasTestFramework || hasTestFramework === 'Unknown') {
        return {
          passed: false,
          message: 'No testing framework specified',
          severity: 'major',
          suggestion: 'Specify a testing framework in Technical Context',
        };
      }
    }

    return { passed: true };
  }

  /**
   * Validate library-first rules
   */
  private validateLibraryRequirement(artifact: Artifact, rule: ConstitutionRule): ValidationResult {
    // Check project structure for library organization
    if (artifact.type === 'plan') {
      const plan = artifact as ImplementationPlan;
      const hasLibPath = plan.projectStructure?.sourceCodePaths.some(
        (p) => p.includes('lib') || p.includes('packages') || p.includes('modules')
      );

      if (!hasLibPath) {
        return {
          passed: false,
          message: 'Project structure does not indicate library-first design',
          severity: 'major',
          suggestion: 'Consider organizing code into standalone libraries in /lib or /packages',
        };
      }
    }

    return { passed: true };
  }

  /**
   * Validate CLI-related rules
   */
  private validateCLIRequirement(artifact: Artifact, rule: ConstitutionRule): ValidationResult {
    // Check for CLI in project structure
    if (artifact.type === 'plan') {
      const plan = artifact as ImplementationPlan;
      const hasCLI = plan.projectStructure?.sourceCodePaths.some(
        (p) => p.includes('cli') || p.includes('bin')
      );

      if (!hasCLI) {
        return {
          passed: false,
          message: 'No CLI interface planned',
          severity: 'minor',
          suggestion: 'Consider adding CLI interface for library functionality',
        };
      }
    }

    return { passed: true };
  }

  /**
   * Validate documentation rules
   */
  private validateDocumentationRequirement(artifact: Artifact, rule: ConstitutionRule): ValidationResult {
    if (artifact.type === 'plan') {
      const plan = artifact as ImplementationPlan;
      const hasDocs = (plan.projectStructure?.documentationPaths?.length ?? 0) > 0;

      if (!hasDocs) {
        return {
          passed: false,
          message: 'No documentation paths defined',
          severity: 'minor',
          suggestion: 'Plan for documentation in project structure',
        };
      }
    }

    return { passed: true };
  }

  /**
   * Get rules for a specific check type
   */
  private getRulesForCheckType(
    checkType: RuleCheckType
  ): Array<{ principle: ConstitutionPrinciple; rule: ConstitutionRule }> {
    const results: Array<{ principle: ConstitutionPrinciple; rule: ConstitutionRule }> = [];

    for (const principle of this.constitution!.principles) {
      for (const rule of principle.rules) {
        if (rule.checkType === checkType || checkType === 'continuous') {
          results.push({ principle, rule });
        }
      }
    }

    return results;
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(
    violations: ComplianceViolation[],
    warnings: ComplianceWarning[]
  ): number {
    let score = 100;

    // Deduct points for violations
    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'major':
          score -= 10;
          break;
        case 'minor':
          score -= 5;
          break;
      }
    }

    // Deduct points for warnings
    score -= warnings.length * 2;

    return Math.max(0, score);
  }

  /**
   * Initialize default validators
   */
  private initializeDefaultValidators(): void {
    // Add any custom validators from config
    for (const [name, validator] of this.config.validators) {
      this.validators.set(name, validator);
    }
  }

  /**
   * Register a custom validator
   */
  public registerValidator(name: string, validator: RuleValidator): void {
    this.validators.set(name, validator);
  }

  // ==========================================================================
  // Event Handling
  // ==========================================================================

  /**
   * Subscribe to compliance events
   */
  public subscribe(handler: EventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) {
        this.eventHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Emit an event
   */
  private emitEvent(event: SpecKitEvent): void {
    if (!this.config.enableEvents) return;

    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('Event handler error:', error);
      }
    }
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get compliance history
   */
  public getComplianceHistory(): ComplianceResult[] {
    return [...this.complianceHistory];
  }

  /**
   * Clear compliance history
   */
  public clearHistory(): void {
    this.complianceHistory = [];
  }

  /**
   * Export state to JSON
   */
  public toJSON(): string {
    return JSON.stringify({
      constitution: this.constitution,
      exceptions: this.exceptions,
      history: this.complianceHistory,
    });
  }

  /**
   * Import state from JSON
   */
  public fromJSON(json: string): void {
    const data = JSON.parse(json);
    this.constitution = data.constitution;
    this.exceptions = data.exceptions || [];
    this.complianceHistory = data.history || [];
  }
}

export default ConstitutionalEnforcer;
