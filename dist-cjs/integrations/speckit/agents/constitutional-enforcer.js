"use strict";
/**
 * Constitutional Enforcer Agent
 *
 * Monitors all design decisions for constitution compliance. Pre-blocks violations
 * and requires justification for exceptions. Ensures that all specification and
 * implementation decisions align with the project's constitutional principles.
 *
 * @module ConstitutionalEnforcerAgent
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConstitutionalEnforcerAgent = exports.ConstitutionalEnforcerAgent = void 0;
const base_agent_js_1 = require("../../../cli/agents/base-agent.js");
/**
 * Constitutional Enforcer Agent - Ensures compliance with project constitution
 */
class ConstitutionalEnforcerAgent extends base_agent_js_1.BaseAgent {
    constitution = [];
    exceptions = new Map();
    violationHistory = [];
    constructor(id, config, environment, logger, eventBus, memory) {
        super(id, 'specialist', config, environment, logger, eventBus, memory);
        this.loadDefaultConstitution();
    }
    /**
     * Get default capabilities for constitutional enforcement
     */
    getDefaultCapabilities() {
        return {
            codeGeneration: false,
            codeReview: true,
            testing: false,
            documentation: true,
            research: false,
            analysis: true,
            webSearch: false,
            apiIntegration: false,
            fileSystem: true,
            terminalAccess: false,
            languages: [],
            frameworks: [],
            domains: [
                'constitution-compliance',
                'policy-enforcement',
                'design-validation',
                'gate-checking',
                'exception-management',
                'audit-trail',
            ],
            tools: [
                'read-constitution',
                'validate-plan',
                'check-gate',
                'record-exception',
                'audit-violations',
                'generate-compliance-report',
            ],
            maxConcurrentTasks: 5,
            maxMemoryUsage: 256 * 1024 * 1024, // 256MB
            maxExecutionTime: 300000, // 5 minutes
            reliability: 0.98,
            speed: 0.9,
            quality: 0.98,
        };
    }
    /**
     * Get default configuration for the agent
     */
    getDefaultConfig() {
        return {
            autonomyLevel: 0.7,
            learningEnabled: true,
            adaptationEnabled: false, // Constitution rules should be stable
            maxTasksPerHour: 50,
            maxConcurrentTasks: 5,
            timeoutThreshold: 300000,
            reportingInterval: 30000,
            heartbeatInterval: 10000,
            permissions: ['file-read', 'memory-access', 'audit-write'],
            trustedAgents: [],
            expertise: {
                'constitution-compliance': 0.98,
                'policy-enforcement': 0.95,
                'risk-assessment': 0.92,
                'audit-trail': 0.95,
            },
            preferences: {
                strictMode: true,
                blockOnCritical: true,
                requireJustification: true,
                auditAllDecisions: true,
            },
        };
    }
    /**
     * Execute a task for constitutional enforcement
     */
    async executeTask(task) {
        this.logger.info('Constitutional Enforcer executing task', {
            agentId: this.id,
            taskType: task.type,
            taskId: task.id,
        });
        try {
            switch (task.type) {
                case 'read-constitution':
                    return await this.readConstitution(task);
                case 'validate-plan':
                    return await this.validatePlan(task);
                case 'check-gate':
                    return await this.checkGate(task);
                case 'record-exception':
                    return await this.recordException(task);
                case 'audit-violations':
                    return await this.auditViolations(task);
                default:
                    return await this.performGeneralEnforcement(task);
            }
        }
        catch (error) {
            this.logger.error('Constitutional enforcement task failed', {
                agentId: this.id,
                taskId: task.id,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    /**
     * Read and return the current constitution
     */
    async readConstitution(task) {
        const category = task.parameters?.category;
        const severity = task.parameters?.severity;
        let rules = [...this.constitution];
        if (category) {
            rules = rules.filter(r => r.category === category);
        }
        if (severity) {
            rules = rules.filter(r => r.severity === severity);
        }
        await this.memory.store(`constitution:${task.id.id}:read`, {
            rules: rules.map(r => ({
                id: r.id,
                name: r.name,
                description: r.description,
                category: r.category,
                severity: r.severity,
            })),
            timestamp: new Date(),
        }, {
            type: 'constitution-read',
            tags: ['constitution', 'audit'],
            partition: 'audit',
        });
        return {
            totalRules: rules.length,
            rules,
            activeExceptions: this.exceptions.size,
            lastUpdated: new Date(),
        };
    }
    /**
     * Validate a plan or decision against the constitution
     */
    async validatePlan(task) {
        const plan = task.input?.plan;
        const context = task.input?.context || {};
        const strictMode = task.parameters?.strictMode ?? true;
        this.logger.info('Validating plan against constitution', {
            planId: plan?.id,
            ruleCount: this.constitution.length,
        });
        const results = [];
        const allViolations = [];
        for (const rule of this.constitution) {
            const result = await this.checkRule(rule, plan, context);
            results.push(result);
            if (!result.passed) {
                allViolations.push(...result.violations);
                this.violationHistory.push(...result.violations);
            }
        }
        // Check for applicable exceptions
        const blockedViolations = allViolations.filter(v => {
            const exception = this.getException(v.ruleId);
            return !exception || this.isExceptionExpired(exception);
        });
        const criticalViolations = blockedViolations.filter(v => v.severity === 'critical');
        const blocked = strictMode && criticalViolations.length > 0;
        await this.memory.store(`validation:${task.id.id}:result`, {
            planId: plan?.id,
            passed: blockedViolations.length === 0,
            blocked,
            violations: allViolations,
            blockedViolations,
            timestamp: new Date(),
        }, {
            type: 'constitution-validation',
            tags: ['validation', 'constitution'],
            partition: 'audit',
        });
        return {
            passed: blockedViolations.length === 0,
            blocked,
            totalChecks: results.length,
            passedChecks: results.filter(r => r.passed).length,
            violations: allViolations,
            blockedViolations,
            criticalViolations,
            requiresJustification: blockedViolations.length > 0,
            recommendations: this.generateRecommendations(allViolations),
        };
    }
    /**
     * Check a gate for phase transition approval
     */
    async checkGate(task) {
        const gate = task.input?.gate || task.parameters?.gate;
        const artifacts = task.input?.artifacts || [];
        const context = task.input?.context || {};
        this.logger.info('Checking gate', { gate, artifactCount: artifacts.length });
        const gateRules = this.constitution.filter(r => r.category === 'process' || r.category === 'quality');
        const blockers = [];
        const warnings = [];
        for (const rule of gateRules) {
            const result = await this.checkRule(rule, { gate, artifacts }, context);
            if (!result.passed) {
                blockers.push(...result.violations);
            }
            warnings.push(...result.warnings);
        }
        const criticalBlockers = blockers.filter(b => b.severity === 'critical');
        const canOverride = criticalBlockers.length === 0;
        const gateResult = {
            gate,
            passed: blockers.length === 0,
            blockers,
            warnings,
            recommendations: this.generateRecommendations(blockers),
            canOverride,
        };
        await this.memory.store(`gate:${task.id.id}:result`, gateResult, {
            type: 'gate-check',
            tags: ['gate', gate],
            partition: 'audit',
        });
        return gateResult;
    }
    /**
     * Record an exception to a constitution rule
     */
    async recordException(task) {
        const ruleId = task.input?.ruleId;
        const justification = task.input?.justification;
        const approvedBy = task.input?.approvedBy;
        const expiresAt = task.input?.expiresAt;
        const scope = task.input?.scope || 'global';
        if (!ruleId || !justification || !approvedBy) {
            throw new Error('Exception requires ruleId, justification, and approvedBy');
        }
        const rule = this.constitution.find(r => r.id === ruleId);
        if (!rule) {
            throw new Error(`Rule not found: ${ruleId}`);
        }
        // Critical rules require additional approval
        if (rule.severity === 'critical') {
            const additionalApprovers = task.input?.additionalApprovers || [];
            if (additionalApprovers.length < 2) {
                throw new Error('Critical rule exceptions require at least 2 additional approvers');
            }
        }
        const exception = {
            id: `exception-${Date.now()}-${ruleId}`,
            ruleId,
            justification,
            approvedBy,
            approvedAt: new Date(),
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            scope,
            conditions: task.input?.conditions,
        };
        this.exceptions.set(exception.id, exception);
        await this.memory.store(`exception:${exception.id}`, exception, {
            type: 'constitution-exception',
            tags: ['exception', ruleId],
            partition: 'audit',
        });
        this.logger.info('Exception recorded', {
            exceptionId: exception.id,
            ruleId,
            approvedBy,
        });
        return {
            success: true,
            exception,
            message: `Exception granted for rule ${ruleId}`,
            warning: rule.severity === 'critical'
                ? 'This is a critical rule exception - closely monitor for issues'
                : undefined,
        };
    }
    /**
     * Audit past violations
     */
    async auditViolations(task) {
        const startDate = task.parameters?.startDate
            ? new Date(task.parameters.startDate)
            : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const category = task.parameters?.category;
        const severity = task.parameters?.severity;
        let violations = [...this.violationHistory];
        if (category) {
            violations = violations.filter(v => {
                const rule = this.constitution.find(r => r.id === v.ruleId);
                return rule?.category === category;
            });
        }
        if (severity) {
            violations = violations.filter(v => v.severity === severity);
        }
        const bySeverity = {
            critical: violations.filter(v => v.severity === 'critical').length,
            high: violations.filter(v => v.severity === 'high').length,
            medium: violations.filter(v => v.severity === 'medium').length,
            low: violations.filter(v => v.severity === 'low').length,
        };
        const byRule = {};
        for (const v of violations) {
            byRule[v.ruleId] = (byRule[v.ruleId] || 0) + 1;
        }
        return {
            period: {
                start: startDate,
                end: new Date(),
            },
            totalViolations: violations.length,
            bySeverity,
            byRule,
            topViolatedRules: Object.entries(byRule)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([ruleId, count]) => ({
                ruleId,
                ruleName: this.constitution.find(r => r.id === ruleId)?.name,
                count,
            })),
            activeExceptions: this.exceptions.size,
            recommendations: this.generateAuditRecommendations(violations),
        };
    }
    /**
     * Perform general enforcement check
     */
    async performGeneralEnforcement(task) {
        const content = task.input?.content || task.description;
        const context = task.input?.context || {};
        const results = [];
        for (const rule of this.constitution) {
            const result = await this.checkRule(rule, { content }, context);
            results.push(result);
        }
        const violations = results.flatMap(r => r.violations);
        const warnings = results.flatMap(r => r.warnings);
        return {
            checked: true,
            totalRules: this.constitution.length,
            violations,
            warnings,
            passed: violations.length === 0,
            recommendations: this.generateRecommendations(violations),
        };
    }
    /**
     * Check a single rule against provided data
     */
    async checkRule(rule, data, context) {
        const result = {
            passed: true,
            rule: rule.id,
            violations: [],
            warnings: [],
            metadata: { checkedAt: new Date() },
        };
        try {
            // Check with custom function if provided
            if (rule.checkFn) {
                const fnResult = rule.checkFn({ data, context, rule });
                result.passed = fnResult.passed;
                result.violations = fnResult.violations;
                result.warnings = fnResult.warnings;
                return result;
            }
            // Pattern-based checking
            const contentStr = JSON.stringify(data);
            if (rule.antiPatterns) {
                for (const pattern of rule.antiPatterns) {
                    if (pattern.test(contentStr)) {
                        result.passed = false;
                        result.violations.push({
                            ruleId: rule.id,
                            ruleName: rule.name,
                            severity: rule.severity,
                            description: `Detected anti-pattern: ${rule.description}`,
                            context: { pattern: pattern.source },
                        });
                    }
                }
            }
            if (rule.patterns) {
                const hasRequiredPattern = rule.patterns.some(p => p.test(contentStr));
                if (!hasRequiredPattern) {
                    result.warnings.push(`Expected pattern not found for rule: ${rule.name}`);
                }
            }
        }
        catch (error) {
            result.warnings.push(`Error checking rule ${rule.id}: ${error}`);
        }
        return result;
    }
    /**
     * Get an exception by rule ID
     */
    getException(ruleId) {
        for (const exception of this.exceptions.values()) {
            if (exception.ruleId === ruleId) {
                return exception;
            }
        }
        return undefined;
    }
    /**
     * Check if an exception has expired
     */
    isExceptionExpired(exception) {
        if (!exception.expiresAt)
            return false;
        return new Date() > exception.expiresAt;
    }
    /**
     * Generate recommendations based on violations
     */
    generateRecommendations(violations) {
        const recommendations = [];
        for (const v of violations) {
            if (v.suggestedFix) {
                recommendations.push(v.suggestedFix);
            }
            else {
                recommendations.push(`Address ${v.severity} violation: ${v.description}`);
            }
        }
        if (violations.some(v => v.severity === 'critical')) {
            recommendations.unshift('PRIORITY: Address all critical violations before proceeding');
        }
        return [...new Set(recommendations)];
    }
    /**
     * Generate recommendations from audit results
     */
    generateAuditRecommendations(violations) {
        const recommendations = [];
        const ruleViolationCounts = new Map();
        for (const v of violations) {
            ruleViolationCounts.set(v.ruleId, (ruleViolationCounts.get(v.ruleId) || 0) + 1);
        }
        for (const [ruleId, count] of ruleViolationCounts) {
            if (count > 5) {
                const rule = this.constitution.find(r => r.id === ruleId);
                recommendations.push(`Rule "${rule?.name || ruleId}" violated ${count} times - consider team training`);
            }
        }
        return recommendations;
    }
    /**
     * Load default constitution rules
     */
    loadDefaultConstitution() {
        this.constitution = [
            {
                id: 'sec-001',
                name: 'No Hardcoded Secrets',
                description: 'No secrets, API keys, or credentials should be hardcoded',
                category: 'security',
                severity: 'critical',
                antiPatterns: [
                    /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
                    /password\s*[:=]\s*['"][^'"]+['"]/i,
                    /secret\s*[:=]\s*['"][^'"]+['"]/i,
                ],
            },
            {
                id: 'sec-002',
                name: 'Input Validation Required',
                description: 'All user inputs must be validated before processing',
                category: 'security',
                severity: 'high',
                patterns: [/validate|sanitize|escape/i],
            },
            {
                id: 'arch-001',
                name: 'Separation of Concerns',
                description: 'Business logic should be separate from presentation and data layers',
                category: 'architecture',
                severity: 'medium',
            },
            {
                id: 'arch-002',
                name: 'No Circular Dependencies',
                description: 'Module dependencies should not form cycles',
                category: 'architecture',
                severity: 'high',
            },
            {
                id: 'qual-001',
                name: 'Test Coverage Required',
                description: 'All new features must have accompanying tests',
                category: 'quality',
                severity: 'high',
            },
            {
                id: 'qual-002',
                name: 'Documentation Required',
                description: 'Public APIs must be documented',
                category: 'quality',
                severity: 'medium',
            },
            {
                id: 'proc-001',
                name: 'Code Review Required',
                description: 'All code changes must be reviewed before merge',
                category: 'process',
                severity: 'high',
            },
            {
                id: 'comp-001',
                name: 'License Compliance',
                description: 'All dependencies must have compatible licenses',
                category: 'compliance',
                severity: 'critical',
            },
        ];
    }
    /**
     * Get agent status with enforcement-specific information
     */
    getAgentStatus() {
        return {
            ...super.getAgentStatus(),
            specialization: 'Constitutional Enforcement',
            constitutionRules: this.constitution.length,
            activeExceptions: this.exceptions.size,
            totalViolationsRecorded: this.violationHistory.length,
            capabilities: [
                'read-constitution',
                'validate-plan',
                'check-gate',
                'record-exception',
            ],
        };
    }
}
exports.ConstitutionalEnforcerAgent = ConstitutionalEnforcerAgent;
/**
 * Factory function to create a Constitutional Enforcer Agent
 */
const createConstitutionalEnforcerAgent = (id, config, environment, logger, eventBus, memory) => {
    const defaultConfig = {
        autonomyLevel: 0.7,
        learningEnabled: true,
        adaptationEnabled: false,
        maxTasksPerHour: 50,
        maxConcurrentTasks: 5,
        timeoutThreshold: 300000,
        reportingInterval: 30000,
        heartbeatInterval: 10000,
        permissions: ['file-read', 'memory-access', 'audit-write'],
        trustedAgents: [],
        expertise: {
            'constitution-compliance': 0.98,
            'policy-enforcement': 0.95,
        },
        preferences: {
            strictMode: true,
            blockOnCritical: true,
        },
    };
    const defaultEnv = {
        runtime: 'node',
        version: '20.0.0',
        workingDirectory: './agents/constitutional-enforcer',
        tempDirectory: './tmp/constitutional-enforcer',
        logDirectory: './logs/constitutional-enforcer',
        apiEndpoints: {},
        credentials: {},
        availableTools: ['read-constitution', 'validate-plan', 'check-gate', 'record-exception'],
        toolConfigs: {},
    };
    return new ConstitutionalEnforcerAgent(id, { ...defaultConfig, ...config }, { ...defaultEnv, ...environment }, logger, eventBus, memory);
};
exports.createConstitutionalEnforcerAgent = createConstitutionalEnforcerAgent;
//# sourceMappingURL=constitutional-enforcer.js.map