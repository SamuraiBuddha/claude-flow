/**
 * Constitutional Enforcer Agent
 *
 * Monitors all design decisions for constitution compliance. Pre-blocks violations
 * and requires justification for exceptions. Ensures that all specification and
 * implementation decisions align with the project's constitutional principles.
 *
 * @module ConstitutionalEnforcerAgent
 */
import { BaseAgent } from '../../../cli/agents/base-agent.js';
import type { AgentCapabilities, AgentConfig, AgentEnvironment, TaskDefinition } from '../../../swarm/types.js';
import type { ILogger } from '../../../core/logger.js';
import type { IEventBus } from '../../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../../memory/distributed-memory.js';
/**
 * Constitution rule definition
 */
export interface ConstitutionRule {
    id: string;
    name: string;
    description: string;
    category: 'security' | 'quality' | 'architecture' | 'process' | 'compliance';
    severity: 'critical' | 'high' | 'medium' | 'low';
    checkFn?: (context: any) => ConstitutionCheckResult;
    patterns?: RegExp[];
    antiPatterns?: RegExp[];
}
/**
 * Result of a constitution check
 */
export interface ConstitutionCheckResult {
    passed: boolean;
    rule: string;
    violations: ConstitutionViolation[];
    warnings: string[];
    metadata: Record<string, any>;
}
/**
 * A specific violation of a constitution rule
 */
export interface ConstitutionViolation {
    ruleId: string;
    ruleName: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    location?: string;
    context: Record<string, any>;
    suggestedFix?: string;
}
/**
 * Exception record for justified violations
 */
export interface ConstitutionException {
    id: string;
    ruleId: string;
    justification: string;
    approvedBy: string;
    approvedAt: Date;
    expiresAt?: Date;
    scope: string;
    conditions?: string[];
}
/**
 * Gate check result for phase transitions
 */
export interface GateCheckResult {
    gate: string;
    passed: boolean;
    blockers: ConstitutionViolation[];
    warnings: string[];
    recommendations: string[];
    canOverride: boolean;
}
/**
 * Constitutional Enforcer Agent - Ensures compliance with project constitution
 */
export declare class ConstitutionalEnforcerAgent extends BaseAgent {
    private constitution;
    private exceptions;
    private violationHistory;
    constructor(id: string, config: AgentConfig, environment: AgentEnvironment, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem);
    /**
     * Get default capabilities for constitutional enforcement
     */
    protected getDefaultCapabilities(): AgentCapabilities;
    /**
     * Get default configuration for the agent
     */
    protected getDefaultConfig(): Partial<AgentConfig>;
    /**
     * Execute a task for constitutional enforcement
     */
    executeTask(task: TaskDefinition): Promise<any>;
    /**
     * Read and return the current constitution
     */
    private readConstitution;
    /**
     * Validate a plan or decision against the constitution
     */
    private validatePlan;
    /**
     * Check a gate for phase transition approval
     */
    private checkGate;
    /**
     * Record an exception to a constitution rule
     */
    private recordException;
    /**
     * Audit past violations
     */
    private auditViolations;
    /**
     * Perform general enforcement check
     */
    private performGeneralEnforcement;
    /**
     * Check a single rule against provided data
     */
    private checkRule;
    /**
     * Get an exception by rule ID
     */
    private getException;
    /**
     * Check if an exception has expired
     */
    private isExceptionExpired;
    /**
     * Generate recommendations based on violations
     */
    private generateRecommendations;
    /**
     * Generate recommendations from audit results
     */
    private generateAuditRecommendations;
    /**
     * Load default constitution rules
     */
    private loadDefaultConstitution;
    /**
     * Get agent status with enforcement-specific information
     */
    getAgentStatus(): any;
}
/**
 * Factory function to create a Constitutional Enforcer Agent
 */
export declare const createConstitutionalEnforcerAgent: (id: string, config: Partial<AgentConfig>, environment: Partial<AgentEnvironment>, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem) => ConstitutionalEnforcerAgent;
//# sourceMappingURL=constitutional-enforcer.d.ts.map