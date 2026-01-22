/**
 * Process Gates for SpecKit Integration
 * Defines quality gates and approval checkpoints for workflows
 */
import { EventEmitter } from 'node:events';
export type GateId = 'SPEC_APPROVED' | 'PLAN_APPROVED' | 'TASKS_COMPLETE' | 'TESTS_PASS' | 'REVIEW_APPROVED' | 'SECURITY_CLEARED' | 'PERFORMANCE_VALIDATED' | 'DOCUMENTATION_COMPLETE' | 'DEPLOYMENT_READY' | string;
export type GateStatus = 'pending' | 'checking' | 'passed' | 'failed' | 'blocked' | 'skipped';
export interface GateRequirement {
    id: string;
    name: string;
    description: string;
    check: () => Promise<boolean> | boolean;
    mandatory: boolean;
    weight: number;
    errorMessage?: string;
}
export interface GateDefinition {
    id: GateId;
    name: string;
    description: string;
    requirements: GateRequirement[];
    minPassScore: number;
    autoAdvance: boolean;
    timeout: number;
    retryable: boolean;
    maxRetries: number;
    dependencies: GateId[];
    metadata?: Record<string, any>;
}
export interface GateCheckResult {
    gateId: GateId;
    status: GateStatus;
    checkedAt: Date;
    duration: number;
    passedRequirements: string[];
    failedRequirements: string[];
    skippedRequirements: string[];
    score: number;
    error?: string;
    details?: Record<string, any>;
}
export interface GateState {
    gateId: GateId;
    status: GateStatus;
    lastCheckedAt?: Date;
    lastResult?: GateCheckResult;
    passCount: number;
    failCount: number;
    blockedReason?: string;
    overriddenBy?: string;
    overriddenAt?: Date;
}
export interface GatesConfig {
    defaultTimeout: number;
    parallelChecks: boolean;
    strictMode: boolean;
    allowOverrides: boolean;
    notifyOnPass: boolean;
    notifyOnFail: boolean;
}
export declare class ProcessGates extends EventEmitter {
    private config;
    private gates;
    private states;
    private contextData;
    constructor(config?: Partial<GatesConfig>);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    registerGate(definition: GateDefinition): void;
    unregisterGate(gateId: GateId): void;
    getGate(gateId: GateId): GateDefinition | undefined;
    getAllGates(): GateDefinition[];
    setContext(key: string, value: any): void;
    getContext(key: string): any;
    clearContext(): void;
    checkGate(gateId: GateId): Promise<GateCheckResult>;
    checkAllGates(): Promise<Map<GateId, GateCheckResult>>;
    passGate(gateId: GateId, overriddenBy?: string): void;
    blockGate(gateId: GateId, reason: string): void;
    unblockGate(gateId: GateId): void;
    skipGate(gateId: GateId, reason: string): void;
    resetGate(gateId: GateId): void;
    resetAllGates(): void;
    getGateStatus(gateId: GateId): GateState | undefined;
    getAllGateStatuses(): Map<GateId, GateState>;
    isGatePassed(gateId: GateId): boolean;
    areAllGatesPassed(): boolean;
    getBlockedGates(): GateId[];
    getFailedGates(): GateId[];
    getPendingGates(): GateId[];
    private registerDefaultGates;
    private withTimeout;
    private topologicalSort;
    exportState(): {
        gates: GateDefinition[];
        states: Record<string, GateState>;
        context: Record<string, any>;
    };
    importState(data: {
        gates?: GateDefinition[];
        states?: Record<string, GateState>;
        context?: Record<string, any>;
    }): void;
}
export default ProcessGates;
//# sourceMappingURL=gates.d.ts.map