/**
 * Workflow Engine for SpecKit Integration
 * Full workflow management: specify -> plan -> tasks -> implement -> validate
 */
import { EventEmitter } from 'node:events';
import type { ProcessGates, GateCheckResult, GateId } from './gates.js';
import type { AuditTrail } from '../audit/audit-trail.js';
import type { StatusDashboard } from '../dashboard/status-dashboard.js';
export type WorkflowPhase = 'initialize' | 'specify' | 'plan' | 'assign' | 'implement' | 'test' | 'review' | 'validate' | 'complete' | 'failed' | 'cancelled';
export type WorkflowStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'rolled_back';
export interface WorkflowDefinition {
    id: string;
    name: string;
    description: string;
    phases: PhaseDefinition[];
    settings: WorkflowSettings;
}
export interface PhaseDefinition {
    id: WorkflowPhase;
    name: string;
    description: string;
    gates: GateId[];
    timeout: number;
    retryable: boolean;
    maxRetries: number;
    onEnter?: () => Promise<void>;
    onExit?: () => Promise<void>;
    onError?: (error: Error) => Promise<void>;
}
export interface WorkflowSettings {
    autoAdvance: boolean;
    strictGates: boolean;
    rollbackOnFailure: boolean;
    maxDuration: number;
    notifyOnPhaseChange: boolean;
    preserveHistory: boolean;
}
export interface WorkflowInstance {
    id: string;
    workflowId: string;
    name: string;
    status: WorkflowStatus;
    currentPhase: WorkflowPhase;
    phaseHistory: PhaseHistoryEntry[];
    startedAt: Date;
    completedAt?: Date;
    pausedAt?: Date;
    error?: string;
    metadata: Record<string, any>;
    context: WorkflowContext;
}
export interface PhaseHistoryEntry {
    phase: WorkflowPhase;
    enteredAt: Date;
    exitedAt?: Date;
    status: 'entered' | 'completed' | 'failed' | 'skipped' | 'rolled_back' | 'cancelled';
    gateResults: Map<string, GateCheckResult>;
    error?: string;
    duration?: number;
}
export interface WorkflowContext {
    specId?: string;
    planId?: string;
    taskIds: string[];
    agentIds: string[];
    artifacts: Map<string, any>;
    variables: Map<string, any>;
}
export interface WorkflowTransition {
    from: WorkflowPhase;
    to: WorkflowPhase;
    timestamp: Date;
    reason: string;
    triggeredBy: string;
    automatic: boolean;
}
export interface WorkflowEngineConfig {
    maxConcurrentWorkflows: number;
    defaultTimeout: number;
    autoStart: boolean;
    cleanupCompletedAfter: number;
}
export declare class WorkflowEngine extends EventEmitter {
    private config;
    private workflows;
    private instances;
    private gates?;
    private audit?;
    private dashboard?;
    constructor(config?: Partial<WorkflowEngineConfig>);
    initialize(deps?: {
        gates?: ProcessGates;
        audit?: AuditTrail;
        dashboard?: StatusDashboard;
    }): Promise<void>;
    shutdown(): Promise<void>;
    registerWorkflow(definition: WorkflowDefinition): void;
    unregisterWorkflow(workflowId: string): void;
    getWorkflowDefinition(workflowId: string): WorkflowDefinition | undefined;
    startWorkflow(workflowId: string, options?: {
        name?: string;
        metadata?: Record<string, any>;
        context?: Partial<WorkflowContext>;
    }): Promise<WorkflowInstance>;
    advancePhase(instanceId: string, targetPhase?: WorkflowPhase): Promise<WorkflowInstance>;
    pauseWorkflow(instanceId: string): Promise<void>;
    resumeWorkflow(instanceId: string): Promise<void>;
    cancelWorkflow(instanceId: string, reason?: string): Promise<void>;
    rollbackWorkflow(instanceId: string, targetPhase?: WorkflowPhase): Promise<void>;
    private enterPhase;
    private exitPhase;
    private completeWorkflow;
    private failWorkflow;
    getCurrentPhase(instanceId: string): WorkflowPhase | undefined;
    getWorkflowInstance(instanceId: string): WorkflowInstance | undefined;
    getAllInstances(): WorkflowInstance[];
    getRunningInstances(): WorkflowInstance[];
    getHistory(instanceId: string): PhaseHistoryEntry[];
    private handleGatePassed;
    setWorkflowContext(instanceId: string, key: string, value: any): void;
    getWorkflowContext(instanceId: string, key: string): any;
    setWorkflowArtifact(instanceId: string, key: string, artifact: any): void;
    getWorkflowArtifact(instanceId: string, key: string): any;
    private registerDefaultWorkflow;
    private generateId;
    exportState(): {
        workflows: WorkflowDefinition[];
        instances: WorkflowInstance[];
    };
    importState(data: {
        workflows?: WorkflowDefinition[];
        instances?: WorkflowInstance[];
    }): void;
}
export default WorkflowEngine;
//# sourceMappingURL=workflow-engine.d.ts.map