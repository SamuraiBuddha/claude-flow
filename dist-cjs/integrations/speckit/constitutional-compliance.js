"use strict";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstitutionalEnforcer = void 0;
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
const constitution_parser_js_1 = require("./parsers/constitution-parser.js");
/**
 * ConstitutionalEnforcer - Enforces constitutional compliance
 */
class ConstitutionalEnforcer {
    constitution = null;
    exceptions = [];
    complianceHistory = [];
    eventHandlers = [];
    validators = new Map();
    config;
    constructor(config = {}) {
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
    async loadConstitution(filePath) {
        const targetPath = filePath || this.config.constitutionPath;
        if (!targetPath) {
            throw new Error('No constitution path provided');
        }
        try {
            const content = await fs.promises.readFile(targetPath, 'utf-8');
            const result = (0, constitution_parser_js_1.parseConstitution)(content, targetPath);
            if (!result.success || !result.data) {
                throw new Error(`Failed to parse constitution: ${result.errors.map((e) => e.message).join(', ')}`);
            }
            this.constitution = result.data;
            return this.constitution;
        }
        catch (error) {
            throw new Error(`Failed to load constitution from ${targetPath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Load constitution from string content
     */
    loadConstitutionFromString(content, name = 'constitution.md') {
        const result = (0, constitution_parser_js_1.parseConstitution)(content, name);
        if (!result.success || !result.data) {
            throw new Error(`Failed to parse constitution: ${result.errors.map((e) => e.message).join(', ')}`);
        }
        this.constitution = result.data;
        return this.constitution;
    }
    /**
     * Get loaded constitution
     */
    getConstitution() {
        return this.constitution;
    }
    // ==========================================================================
    // Plan Validation
    // ==========================================================================
    /**
     * Validate an implementation plan against the constitution
     */
    validatePlan(plan) {
        this.ensureConstitutionLoaded();
        const violations = [];
        const warnings = [];
        let score = 100;
        // Check each principle
        for (const principle of this.constitution.principles) {
            const principleResult = this.validateArtifactAgainstPrinciple(plan, principle, 'plan');
            violations.push(...principleResult.violations);
            warnings.push(...principleResult.warnings);
        }
        // Calculate score
        score = this.calculateComplianceScore(violations, warnings);
        const result = {
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
    validateSpec(spec) {
        this.ensureConstitutionLoaded();
        const violations = [];
        const warnings = [];
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
        const result = {
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
    validateTaskList(taskList) {
        this.ensureConstitutionLoaded();
        const violations = [];
        const warnings = [];
        // Check Test-First principle (III)
        const testFirstPrinciple = this.constitution.principles.find((p) => p.name.toLowerCase().includes('test'));
        if (testFirstPrinciple) {
            // Verify test tasks come before implementation tasks
            const testTasks = taskList.tasks.filter((t) => t.type === 'test' || t.type === 'testing');
            const codeTasks = taskList.tasks.filter((t) => t.type === 'coding' || t.type === 'service' || t.type === 'endpoint');
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
            }
            else {
                // Check ordering - tests should come before code
                const firstTestIdx = taskList.tasks.findIndex((t) => t.type === 'test' || t.type === 'testing');
                const firstCodeIdx = taskList.tasks.findIndex((t) => t.type === 'coding' || t.type === 'service' || t.type === 'endpoint');
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
        const libraryFirstPrinciple = this.constitution.principles.find((p) => p.name.toLowerCase().includes('library'));
        if (libraryFirstPrinciple) {
            // Verify library/module tasks exist
            const hasLibraryTasks = taskList.tasks.some((t) => t.description.toLowerCase().includes('library') ||
                t.description.toLowerCase().includes('module') ||
                t.filePath?.includes('/lib/'));
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
        const result = {
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
    checkGate(gateName, artifact, checkType) {
        this.ensureConstitutionLoaded();
        const violations = [];
        const warnings = [];
        const requiredActions = [];
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
                }
                else {
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
        const unresolvedViolations = violations.filter((v) => !applicableExceptions.find((e) => e.violationId === v.id));
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
        }
        else {
            this.emitEvent({
                type: 'gate:passed',
                payload: {
                    gateName,
                    phase: 'implementation',
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
    checkPreImplementationGate(artifact) {
        return this.checkGate('pre-implementation', artifact, 'pre-implementation');
    }
    /**
     * Check post-implementation gate
     */
    checkPostImplementationGate(artifact) {
        return this.checkGate('post-implementation', artifact, 'post-implementation');
    }
    // ==========================================================================
    // Exception Management
    // ==========================================================================
    /**
     * Record an exception for a violation
     */
    recordException(violationId, justification, approvedBy, scope = 'one-time', expiresAt) {
        if (!this.config.allowExceptions) {
            throw new Error('Exceptions are not allowed in current configuration');
        }
        if (!justification || justification.trim().length < 10) {
            throw new Error('Justification must be at least 10 characters');
        }
        const exception = {
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
    revokeException(exceptionId) {
        const index = this.exceptions.findIndex((e) => e.id === exceptionId);
        if (index > -1) {
            this.exceptions.splice(index, 1);
        }
    }
    /**
     * Get all active exceptions
     */
    getActiveExceptions() {
        const now = new Date();
        return this.exceptions.filter((e) => !e.expiresAt || e.expiresAt > now);
    }
    /**
     * Get applicable exceptions for violations
     */
    getApplicableExceptions(violations) {
        const now = new Date();
        return this.exceptions.filter((e) => violations.some((v) => v.id === e.violationId) &&
            (!e.expiresAt || e.expiresAt > now));
    }
    // ==========================================================================
    // Compliance Reports
    // ==========================================================================
    /**
     * Generate a comprehensive compliance report
     */
    getComplianceReport(artifacts) {
        this.ensureConstitutionLoaded();
        const targetArtifacts = artifacts || this.complianceHistory.map((h) => h.artifact);
        // Re-validate all artifacts
        const results = [];
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
        const overallScore = results.length > 0
            ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
            : 100;
        // Generate recommendations
        const recommendations = this.generateRecommendations(allViolations, allWarnings);
        return {
            generatedAt: new Date(),
            projectName: this.constitution.projectName,
            constitutionVersion: this.constitution.version,
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
    validateArtifact(artifact) {
        switch (artifact.type) {
            case 'plan':
                return this.validatePlan(artifact);
            case 'specification':
                return this.validateSpec(artifact);
            case 'task-list':
                return this.validateTaskList(artifact);
            default:
                // Generic validation
                return this.validateGenericArtifact(artifact);
        }
    }
    /**
     * Generic artifact validation
     */
    validateGenericArtifact(artifact) {
        this.ensureConstitutionLoaded();
        const violations = [];
        const warnings = [];
        for (const principle of this.constitution.principles) {
            const principleResult = this.validateArtifactAgainstPrinciple(artifact, principle, artifact.type);
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
    calculatePrincipleBreakdown(results) {
        const breakdown = [];
        for (const principle of this.constitution.principles) {
            const principleViolations = results.flatMap((r) => r.violations.filter((v) => v.principleId === principle.id));
            const principleExceptions = this.exceptions.filter((e) => principleViolations.some((v) => v.id === e.violationId));
            const passRate = results.length > 0
                ? Math.round(((results.length - principleViolations.length) / results.length) * 100)
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
    generateRecommendations(violations, warnings) {
        const recommendations = [];
        const seenPrinciples = new Set();
        // Prioritize critical violations
        for (const violation of violations.filter((v) => v.severity === 'critical')) {
            if (!seenPrinciples.has(violation.principleId)) {
                recommendations.push(`CRITICAL: Address ${violation.principleName} violations - ${violation.suggestion || violation.description}`);
                seenPrinciples.add(violation.principleId);
            }
        }
        // Add major violations
        for (const violation of violations.filter((v) => v.severity === 'major')) {
            if (!seenPrinciples.has(violation.principleId)) {
                recommendations.push(`Review ${violation.principleName}: ${violation.suggestion || violation.description}`);
                seenPrinciples.add(violation.principleId);
            }
        }
        // Add top warnings
        const warningPrinciples = new Set();
        for (const warning of warnings.slice(0, 5)) {
            if (!warningPrinciples.has(warning.principleId)) {
                recommendations.push(`Consider: ${warning.suggestion || warning.description}`);
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
    shouldBlockImplementation(artifact) {
        const gateResult = this.checkPreImplementationGate(artifact);
        const criticalViolations = gateResult.violations.filter((v) => v.severity === 'critical');
        // Check for exceptions
        const unresolvedCritical = criticalViolations.filter((v) => !this.exceptions.find((e) => e.violationId === v.id));
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
    ensureConstitutionLoaded() {
        if (!this.constitution) {
            throw new Error('Constitution not loaded. Call loadConstitution() first.');
        }
    }
    /**
     * Validate artifact against a specific principle
     */
    validateArtifactAgainstPrinciple(artifact, principle, artifactType) {
        const violations = [];
        const warnings = [];
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
                }
                else {
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
    validateRule(rule, artifact, principle) {
        // Check for custom validator
        if (rule.validator && this.validators.has(rule.validator)) {
            const validator = this.validators.get(rule.validator);
            return validator(rule, artifact, {
                constitution: this.constitution,
                principle,
            });
        }
        // Use default validation based on rule description
        return this.defaultValidateRule(rule, artifact, principle);
    }
    /**
     * Default rule validation
     */
    defaultValidateRule(rule, artifact, principle) {
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
    validateTestRequirement(artifact, rule) {
        // For task lists, check for test tasks
        if (artifact.type === 'task-list') {
            const taskList = artifact;
            const hasTests = taskList.tasks.some((t) => t.type === 'test' || t.type === 'testing');
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
            const plan = artifact;
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
    validateLibraryRequirement(artifact, rule) {
        // Check project structure for library organization
        if (artifact.type === 'plan') {
            const plan = artifact;
            const hasLibPath = plan.projectStructure?.sourceCodePaths.some((p) => p.includes('lib') || p.includes('packages') || p.includes('modules'));
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
    validateCLIRequirement(artifact, rule) {
        // Check for CLI in project structure
        if (artifact.type === 'plan') {
            const plan = artifact;
            const hasCLI = plan.projectStructure?.sourceCodePaths.some((p) => p.includes('cli') || p.includes('bin'));
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
    validateDocumentationRequirement(artifact, rule) {
        if (artifact.type === 'plan') {
            const plan = artifact;
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
    getRulesForCheckType(checkType) {
        const results = [];
        for (const principle of this.constitution.principles) {
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
    calculateComplianceScore(violations, warnings) {
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
    initializeDefaultValidators() {
        // Add any custom validators from config
        for (const [name, validator] of this.config.validators) {
            this.validators.set(name, validator);
        }
    }
    /**
     * Register a custom validator
     */
    registerValidator(name, validator) {
        this.validators.set(name, validator);
    }
    // ==========================================================================
    // Event Handling
    // ==========================================================================
    /**
     * Subscribe to compliance events
     */
    subscribe(handler) {
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
    emitEvent(event) {
        if (!this.config.enableEvents)
            return;
        for (const handler of this.eventHandlers) {
            try {
                handler(event);
            }
            catch (error) {
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
    getComplianceHistory() {
        return [...this.complianceHistory];
    }
    /**
     * Clear compliance history
     */
    clearHistory() {
        this.complianceHistory = [];
    }
    /**
     * Export state to JSON
     */
    toJSON() {
        return JSON.stringify({
            constitution: this.constitution,
            exceptions: this.exceptions,
            history: this.complianceHistory,
        });
    }
    /**
     * Import state from JSON
     */
    fromJSON(json) {
        const data = JSON.parse(json);
        this.constitution = data.constitution;
        this.exceptions = data.exceptions || [];
        this.complianceHistory = data.history || [];
    }
}
exports.ConstitutionalEnforcer = ConstitutionalEnforcer;
exports.default = ConstitutionalEnforcer;
//# sourceMappingURL=constitutional-compliance.js.map