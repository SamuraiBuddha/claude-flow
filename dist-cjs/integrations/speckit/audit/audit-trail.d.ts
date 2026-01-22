/**
 * Audit Trail for SpecKit Integration
 * Records all decisions, changes, and agent actions with compliance-ready export
 */
import { EventEmitter } from 'node:events';
export type ActionType = 'spec_created' | 'spec_updated' | 'spec_approved' | 'spec_rejected' | 'spec_deprecated' | 'plan_created' | 'plan_updated' | 'plan_approved' | 'plan_started' | 'plan_completed' | 'plan_failed' | 'task_created' | 'task_assigned' | 'task_started' | 'task_completed' | 'task_failed' | 'task_retried' | 'agent_registered' | 'agent_started' | 'agent_stopped' | 'agent_error' | 'gate_checked' | 'gate_passed' | 'gate_blocked' | 'workflow_started' | 'workflow_advanced' | 'workflow_completed' | 'workflow_failed' | 'workflow_rolled_back' | 'decision_made' | 'approval_granted' | 'approval_denied' | 'config_changed' | 'system_event' | 'custom';
export type AuditSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';
export interface AuditEntry {
    id: string;
    timestamp: Date;
    action: ActionType;
    severity: AuditSeverity;
    agentId?: string;
    agentName?: string;
    artifactId?: string;
    artifactType?: 'spec' | 'plan' | 'task' | 'workflow' | 'config' | 'system';
    description: string;
    details?: Record<string, any>;
    previousState?: any;
    newState?: any;
    initiatedBy: string;
    approvedBy?: string;
    complianceFlags?: string[];
    securityLevel?: 'public' | 'internal' | 'confidential' | 'restricted';
    parentId?: string;
    correlationId?: string;
    sessionId?: string;
    success: boolean;
    error?: string;
    duration?: number;
}
export interface AuditQuery {
    agentId?: string;
    artifactId?: string;
    artifactType?: string;
    action?: ActionType | ActionType[];
    severity?: AuditSeverity | AuditSeverity[];
    initiatedBy?: string;
    startTime?: Date;
    endTime?: Date;
    success?: boolean;
    correlationId?: string;
    sessionId?: string;
    limit?: number;
    offset?: number;
    sortOrder?: 'asc' | 'desc';
}
export interface TimelineEntry {
    timestamp: Date;
    action: ActionType;
    description: string;
    agentId?: string;
    artifactId?: string;
    success: boolean;
}
export interface AuditExportOptions {
    format: 'json' | 'csv' | 'ndjson';
    query?: AuditQuery;
    includeDetails?: boolean;
    includeStates?: boolean;
    pretty?: boolean;
}
export interface AuditConfig {
    maxEntries: number;
    persistPath?: string;
    autoFlushInterval: number;
    retentionDays: number;
    minSeverity: AuditSeverity;
    complianceMode: boolean;
}
export declare class AuditTrail extends EventEmitter {
    private config;
    private entries;
    private flushTimer?;
    private entryCounter;
    private sessionId;
    constructor(config?: Partial<AuditConfig>);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    record(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'sessionId'>): AuditEntry;
    recordSpecAction(action: 'spec_created' | 'spec_updated' | 'spec_approved' | 'spec_rejected' | 'spec_deprecated', specId: string, description: string, details?: Record<string, any>, initiatedBy?: string): AuditEntry;
    recordPlanAction(action: 'plan_created' | 'plan_updated' | 'plan_approved' | 'plan_started' | 'plan_completed' | 'plan_failed', planId: string, description: string, details?: Record<string, any>, initiatedBy?: string, success?: boolean): AuditEntry;
    recordTaskAction(action: 'task_created' | 'task_assigned' | 'task_started' | 'task_completed' | 'task_failed' | 'task_retried', taskId: string, description: string, agentId?: string, details?: Record<string, any>, success?: boolean, error?: string): AuditEntry;
    recordAgentAction(action: 'agent_registered' | 'agent_started' | 'agent_stopped' | 'agent_error', agentId: string, agentName: string, description: string, details?: Record<string, any>, success?: boolean, error?: string): AuditEntry;
    recordGateAction(action: 'gate_checked' | 'gate_passed' | 'gate_blocked', gateName: string, description: string, details?: Record<string, any>, success?: boolean): AuditEntry;
    recordWorkflowAction(action: 'workflow_started' | 'workflow_advanced' | 'workflow_completed' | 'workflow_failed' | 'workflow_rolled_back', workflowId: string, description: string, details?: Record<string, any>, success?: boolean, error?: string): AuditEntry;
    recordDecision(description: string, decision: any, rationale: string, initiatedBy: string, approvedBy?: string, correlationId?: string): AuditEntry;
    recordStateChange(artifactId: string, artifactType: 'spec' | 'plan' | 'task' | 'workflow' | 'config' | 'system', description: string, previousState: any, newState: any, initiatedBy: string): AuditEntry;
    query(queryParams?: AuditQuery): AuditEntry[];
    queryByAgent(agentId: string, limit?: number): AuditEntry[];
    queryByArtifact(artifactId: string, limit?: number): AuditEntry[];
    queryByTimeRange(startTime: Date, endTime: Date, limit?: number): AuditEntry[];
    queryByAction(action: ActionType | ActionType[], limit?: number): AuditEntry[];
    queryErrors(limit?: number): AuditEntry[];
    getTimeline(options?: {
        artifactId?: string;
        agentId?: string;
        startTime?: Date;
        endTime?: Date;
        limit?: number;
    }): TimelineEntry[];
    getSessionTimeline(): TimelineEntry[];
    export(options: AuditExportOptions): Promise<string>;
    private exportCSV;
    private exportNDJSON;
    exportToFile(filePath: string, options: AuditExportOptions): Promise<void>;
    exportComplianceReport(outputDir: string): Promise<{
        reportPath: string;
        summaryPath: string;
        entriesPath: string;
    }>;
    private generateComplianceSummary;
    private loadFromDisk;
    private flushToDisk;
    private startAutoFlush;
    private stopAutoFlush;
    private generateId;
    private shouldRecord;
    private createDummyEntry;
    getStatistics(): {
        totalEntries: number;
        entriesByAction: Record<string, number>;
        entriesBySeverity: Record<string, number>;
        successRate: number;
        oldestEntry?: Date;
        newestEntry?: Date;
    };
    clear(): void;
    pruneOldEntries(retentionDays?: number): number;
    getCurrentSessionId(): string;
}
export default AuditTrail;
//# sourceMappingURL=audit-trail.d.ts.map