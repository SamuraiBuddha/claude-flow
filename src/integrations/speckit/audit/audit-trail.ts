/**
 * Audit Trail for SpecKit Integration
 * Records all decisions, changes, and agent actions with compliance-ready export
 */

import { EventEmitter } from 'node:events';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

// ===== Types =====

export type ActionType =
  | 'spec_created'
  | 'spec_updated'
  | 'spec_approved'
  | 'spec_rejected'
  | 'spec_deprecated'
  | 'plan_created'
  | 'plan_updated'
  | 'plan_approved'
  | 'plan_started'
  | 'plan_completed'
  | 'plan_failed'
  | 'task_created'
  | 'task_assigned'
  | 'task_started'
  | 'task_completed'
  | 'task_failed'
  | 'task_retried'
  | 'agent_registered'
  | 'agent_started'
  | 'agent_stopped'
  | 'agent_error'
  | 'gate_checked'
  | 'gate_passed'
  | 'gate_blocked'
  | 'workflow_started'
  | 'workflow_advanced'
  | 'workflow_completed'
  | 'workflow_failed'
  | 'workflow_rolled_back'
  | 'decision_made'
  | 'approval_granted'
  | 'approval_denied'
  | 'config_changed'
  | 'system_event'
  | 'custom';

export type AuditSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: ActionType;
  severity: AuditSeverity;

  // Context
  agentId?: string;
  agentName?: string;
  artifactId?: string;
  artifactType?: 'spec' | 'plan' | 'task' | 'workflow' | 'config' | 'system';

  // Details
  description: string;
  details?: Record<string, any>;
  previousState?: any;
  newState?: any;

  // Attribution
  initiatedBy: string; // agent, user, or system
  approvedBy?: string;

  // Compliance
  complianceFlags?: string[];
  securityLevel?: 'public' | 'internal' | 'confidential' | 'restricted';

  // Relations
  parentId?: string;
  correlationId?: string;
  sessionId?: string;

  // Result
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
  autoFlushInterval: number; // ms, 0 to disable
  retentionDays: number;
  minSeverity: AuditSeverity;
  complianceMode: boolean;
}

// ===== Audit Trail Class =====

export class AuditTrail extends EventEmitter {
  private config: AuditConfig;
  private entries: AuditEntry[] = [];
  private flushTimer?: NodeJS.Timeout;
  private entryCounter = 0;
  private sessionId: string;

  constructor(config: Partial<AuditConfig> = {}) {
    super();
    this.config = {
      maxEntries: 10000,
      autoFlushInterval: 60000, // 1 minute
      retentionDays: 90,
      minSeverity: 'info',
      complianceMode: false,
      ...config,
    };
    this.sessionId = this.generateId('session');
  }

  // ===== Initialization =====

  async initialize(): Promise<void> {
    // Load existing entries if persist path is configured
    if (this.config.persistPath) {
      await this.loadFromDisk();
    }

    // Start auto-flush if configured
    if (this.config.autoFlushInterval > 0 && this.config.persistPath) {
      this.startAutoFlush();
    }

    this.emit('audit:initialized');
  }

  async shutdown(): Promise<void> {
    this.stopAutoFlush();

    // Flush pending entries
    if (this.config.persistPath) {
      await this.flushToDisk();
    }

    this.emit('audit:shutdown');
  }

  // ===== Core Recording Methods =====

  record(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'sessionId'>): AuditEntry {
    // Check severity filter
    if (!this.shouldRecord(entry.severity)) {
      return this.createDummyEntry(entry);
    }

    const fullEntry: AuditEntry = {
      ...entry,
      id: this.generateId('audit'),
      timestamp: new Date(),
      sessionId: this.sessionId,
    };

    // Add to entries
    this.entries.push(fullEntry);
    this.entryCounter++;

    // Enforce max entries limit
    if (this.entries.length > this.config.maxEntries) {
      const removed = this.entries.shift();
      if (removed) {
        this.emit('audit:entry_evicted', removed);
      }
    }

    // Emit event
    this.emit('audit:recorded', fullEntry);

    // Emit specific events for critical entries
    if (fullEntry.severity === 'error' || fullEntry.severity === 'critical') {
      this.emit('audit:alert', fullEntry);
    }

    return fullEntry;
  }

  // Convenience methods for common actions

  recordSpecAction(
    action: 'spec_created' | 'spec_updated' | 'spec_approved' | 'spec_rejected' | 'spec_deprecated',
    specId: string,
    description: string,
    details?: Record<string, any>,
    initiatedBy: string = 'system',
  ): AuditEntry {
    return this.record({
      action,
      severity: 'info',
      artifactId: specId,
      artifactType: 'spec',
      description,
      details,
      initiatedBy,
      success: true,
    });
  }

  recordPlanAction(
    action: 'plan_created' | 'plan_updated' | 'plan_approved' | 'plan_started' | 'plan_completed' | 'plan_failed',
    planId: string,
    description: string,
    details?: Record<string, any>,
    initiatedBy: string = 'system',
    success: boolean = true,
  ): AuditEntry {
    return this.record({
      action,
      severity: success ? 'info' : 'error',
      artifactId: planId,
      artifactType: 'plan',
      description,
      details,
      initiatedBy,
      success,
    });
  }

  recordTaskAction(
    action: 'task_created' | 'task_assigned' | 'task_started' | 'task_completed' | 'task_failed' | 'task_retried',
    taskId: string,
    description: string,
    agentId?: string,
    details?: Record<string, any>,
    success: boolean = true,
    error?: string,
  ): AuditEntry {
    return this.record({
      action,
      severity: success ? 'info' : (action === 'task_failed' ? 'error' : 'warning'),
      artifactId: taskId,
      artifactType: 'task',
      agentId,
      description,
      details,
      initiatedBy: agentId || 'system',
      success,
      error,
    });
  }

  recordAgentAction(
    action: 'agent_registered' | 'agent_started' | 'agent_stopped' | 'agent_error',
    agentId: string,
    agentName: string,
    description: string,
    details?: Record<string, any>,
    success: boolean = true,
    error?: string,
  ): AuditEntry {
    return this.record({
      action,
      severity: action === 'agent_error' ? 'error' : 'info',
      agentId,
      agentName,
      description,
      details,
      initiatedBy: agentId,
      success,
      error,
    });
  }

  recordGateAction(
    action: 'gate_checked' | 'gate_passed' | 'gate_blocked',
    gateName: string,
    description: string,
    details?: Record<string, any>,
    success: boolean = true,
  ): AuditEntry {
    return this.record({
      action,
      severity: action === 'gate_blocked' ? 'warning' : 'info',
      artifactId: gateName,
      artifactType: 'workflow',
      description,
      details,
      initiatedBy: 'system',
      success,
    });
  }

  recordWorkflowAction(
    action: 'workflow_started' | 'workflow_advanced' | 'workflow_completed' | 'workflow_failed' | 'workflow_rolled_back',
    workflowId: string,
    description: string,
    details?: Record<string, any>,
    success: boolean = true,
    error?: string,
  ): AuditEntry {
    return this.record({
      action,
      severity: action === 'workflow_failed' ? 'error' : 'info',
      artifactId: workflowId,
      artifactType: 'workflow',
      description,
      details,
      initiatedBy: 'system',
      success,
      error,
    });
  }

  recordDecision(
    description: string,
    decision: any,
    rationale: string,
    initiatedBy: string,
    approvedBy?: string,
    correlationId?: string,
  ): AuditEntry {
    return this.record({
      action: 'decision_made',
      severity: 'info',
      description,
      details: { decision, rationale },
      initiatedBy,
      approvedBy,
      correlationId,
      success: true,
    });
  }

  recordStateChange(
    artifactId: string,
    artifactType: 'spec' | 'plan' | 'task' | 'workflow' | 'config' | 'system',
    description: string,
    previousState: any,
    newState: any,
    initiatedBy: string,
  ): AuditEntry {
    return this.record({
      action: 'config_changed',
      severity: 'info',
      artifactId,
      artifactType,
      description,
      previousState,
      newState,
      initiatedBy,
      success: true,
    });
  }

  // ===== Query Methods =====

  query(queryParams: AuditQuery = {}): AuditEntry[] {
    let results = [...this.entries];

    // Apply filters
    if (queryParams.agentId) {
      results = results.filter(e => e.agentId === queryParams.agentId);
    }

    if (queryParams.artifactId) {
      results = results.filter(e => e.artifactId === queryParams.artifactId);
    }

    if (queryParams.artifactType) {
      results = results.filter(e => e.artifactType === queryParams.artifactType);
    }

    if (queryParams.action) {
      const actions = Array.isArray(queryParams.action) ? queryParams.action : [queryParams.action];
      results = results.filter(e => actions.includes(e.action));
    }

    if (queryParams.severity) {
      const severities = Array.isArray(queryParams.severity) ? queryParams.severity : [queryParams.severity];
      results = results.filter(e => severities.includes(e.severity));
    }

    if (queryParams.initiatedBy) {
      results = results.filter(e => e.initiatedBy === queryParams.initiatedBy);
    }

    if (queryParams.startTime) {
      results = results.filter(e => e.timestamp >= queryParams.startTime!);
    }

    if (queryParams.endTime) {
      results = results.filter(e => e.timestamp <= queryParams.endTime!);
    }

    if (queryParams.success !== undefined) {
      results = results.filter(e => e.success === queryParams.success);
    }

    if (queryParams.correlationId) {
      results = results.filter(e => e.correlationId === queryParams.correlationId);
    }

    if (queryParams.sessionId) {
      results = results.filter(e => e.sessionId === queryParams.sessionId);
    }

    // Sort
    const sortOrder = queryParams.sortOrder || 'desc';
    results.sort((a, b) => {
      const diff = a.timestamp.getTime() - b.timestamp.getTime();
      return sortOrder === 'asc' ? diff : -diff;
    });

    // Pagination
    const offset = queryParams.offset || 0;
    const limit = queryParams.limit || results.length;
    results = results.slice(offset, offset + limit);

    return results;
  }

  queryByAgent(agentId: string, limit?: number): AuditEntry[] {
    return this.query({ agentId, limit });
  }

  queryByArtifact(artifactId: string, limit?: number): AuditEntry[] {
    return this.query({ artifactId, limit });
  }

  queryByTimeRange(startTime: Date, endTime: Date, limit?: number): AuditEntry[] {
    return this.query({ startTime, endTime, limit });
  }

  queryByAction(action: ActionType | ActionType[], limit?: number): AuditEntry[] {
    return this.query({ action, limit });
  }

  queryErrors(limit?: number): AuditEntry[] {
    return this.query({ success: false, limit });
  }

  // ===== Timeline Methods =====

  getTimeline(options: {
    artifactId?: string;
    agentId?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  } = {}): TimelineEntry[] {
    const entries = this.query({
      artifactId: options.artifactId,
      agentId: options.agentId,
      startTime: options.startTime,
      endTime: options.endTime,
      limit: options.limit,
      sortOrder: 'asc',
    });

    return entries.map(e => ({
      timestamp: e.timestamp,
      action: e.action,
      description: e.description,
      agentId: e.agentId,
      artifactId: e.artifactId,
      success: e.success,
    }));
  }

  getSessionTimeline(): TimelineEntry[] {
    const entries = this.query({
      sessionId: this.sessionId,
      sortOrder: 'asc',
    });

    return entries.map(e => ({
      timestamp: e.timestamp,
      action: e.action,
      description: e.description,
      agentId: e.agentId,
      artifactId: e.artifactId,
      success: e.success,
    }));
  }

  // ===== Export Methods =====

  async export(options: AuditExportOptions): Promise<string> {
    const entries = options.query ? this.query(options.query) : [...this.entries];

    // Filter fields if needed
    const processedEntries = entries.map(e => {
      const entry: Record<string, any> = {
        id: e.id,
        timestamp: e.timestamp.toISOString(),
        action: e.action,
        severity: e.severity,
        description: e.description,
        agentId: e.agentId,
        artifactId: e.artifactId,
        artifactType: e.artifactType,
        initiatedBy: e.initiatedBy,
        success: e.success,
      };

      if (options.includeDetails && e.details) {
        entry.details = e.details;
      }

      if (options.includeStates) {
        if (e.previousState !== undefined) entry.previousState = e.previousState;
        if (e.newState !== undefined) entry.newState = e.newState;
      }

      if (e.error) entry.error = e.error;
      if (e.approvedBy) entry.approvedBy = e.approvedBy;
      if (e.correlationId) entry.correlationId = e.correlationId;
      if (e.complianceFlags?.length) entry.complianceFlags = e.complianceFlags;

      return entry;
    });

    switch (options.format) {
      case 'csv':
        return this.exportCSV(processedEntries);
      case 'ndjson':
        return this.exportNDJSON(processedEntries);
      case 'json':
      default:
        return options.pretty
          ? JSON.stringify(processedEntries, null, 2)
          : JSON.stringify(processedEntries);
    }
  }

  private exportCSV(entries: Record<string, any>[]): string {
    if (entries.length === 0) return '';

    const headers = [
      'id', 'timestamp', 'action', 'severity', 'description',
      'agentId', 'artifactId', 'artifactType', 'initiatedBy', 'success', 'error'
    ];

    const rows = [headers.join(',')];

    for (const entry of entries) {
      const row = headers.map(h => {
        const value = entry[h];
        if (value === undefined || value === null) return '';
        const str = String(value);
        // Escape CSV special characters
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      rows.push(row.join(','));
    }

    return rows.join('\n');
  }

  private exportNDJSON(entries: Record<string, any>[]): string {
    return entries.map(e => JSON.stringify(e)).join('\n');
  }

  async exportToFile(filePath: string, options: AuditExportOptions): Promise<void> {
    const content = await this.export(options);
    await fs.writeFile(filePath, content, 'utf-8');
    this.emit('audit:exported', { filePath, count: this.entries.length });
  }

  // ===== Compliance Export =====

  async exportComplianceReport(outputDir: string): Promise<{
    reportPath: string;
    summaryPath: string;
    entriesPath: string;
  }> {
    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(outputDir, `compliance-report-${timestamp}.json`);
    const summaryPath = path.join(outputDir, `compliance-summary-${timestamp}.json`);
    const entriesPath = path.join(outputDir, `audit-entries-${timestamp}.ndjson`);

    // Generate summary
    const summary = this.generateComplianceSummary();
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');

    // Export all entries
    const entries = await this.export({ format: 'ndjson', includeDetails: true, includeStates: true });
    await fs.writeFile(entriesPath, entries, 'utf-8');

    // Generate report
    const report = {
      generatedAt: new Date().toISOString(),
      sessionId: this.sessionId,
      totalEntries: this.entries.length,
      retentionDays: this.config.retentionDays,
      summary,
      files: {
        summary: summaryPath,
        entries: entriesPath,
      },
    };
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    this.emit('audit:compliance_exported', { outputDir, report });

    return { reportPath, summaryPath, entriesPath };
  }

  private generateComplianceSummary(): Record<string, any> {
    const entries = this.entries;

    // Count by action type
    const actionCounts: Record<string, number> = {};
    for (const entry of entries) {
      actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;
    }

    // Count by severity
    const severityCounts: Record<string, number> = {};
    for (const entry of entries) {
      severityCounts[entry.severity] = (severityCounts[entry.severity] || 0) + 1;
    }

    // Count by artifact type
    const artifactCounts: Record<string, number> = {};
    for (const entry of entries) {
      if (entry.artifactType) {
        artifactCounts[entry.artifactType] = (artifactCounts[entry.artifactType] || 0) + 1;
      }
    }

    // Success/failure rates
    const successCount = entries.filter(e => e.success).length;
    const failureCount = entries.filter(e => !e.success).length;

    // Unique agents
    const uniqueAgents = new Set(entries.filter(e => e.agentId).map(e => e.agentId));

    // Time range
    const timestamps = entries.map(e => e.timestamp.getTime());
    const earliestEntry = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null;
    const latestEntry = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;

    return {
      totalEntries: entries.length,
      actionBreakdown: actionCounts,
      severityBreakdown: severityCounts,
      artifactBreakdown: artifactCounts,
      successRate: entries.length > 0 ? (successCount / entries.length * 100).toFixed(2) + '%' : 'N/A',
      failureRate: entries.length > 0 ? (failureCount / entries.length * 100).toFixed(2) + '%' : 'N/A',
      uniqueAgents: uniqueAgents.size,
      timeRange: {
        earliest: earliestEntry?.toISOString() || null,
        latest: latestEntry?.toISOString() || null,
      },
    };
  }

  // ===== Persistence =====

  private async loadFromDisk(): Promise<void> {
    if (!this.config.persistPath) return;

    try {
      const content = await fs.readFile(this.config.persistPath, 'utf-8');
      const data = JSON.parse(content);

      // Convert timestamp strings back to Date objects
      this.entries = (data.entries || []).map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp),
      }));

      // Apply retention policy
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
      this.entries = this.entries.filter(e => e.timestamp >= cutoffDate);

      this.emit('audit:loaded', { count: this.entries.length });
    } catch (error) {
      // File doesn't exist or is invalid - start fresh
      this.entries = [];
    }
  }

  private async flushToDisk(): Promise<void> {
    if (!this.config.persistPath) return;

    try {
      const data = {
        version: '1.0',
        sessionId: this.sessionId,
        exportedAt: new Date().toISOString(),
        entries: this.entries,
      };

      await fs.mkdir(path.dirname(this.config.persistPath), { recursive: true });
      await fs.writeFile(this.config.persistPath, JSON.stringify(data), 'utf-8');

      this.emit('audit:flushed', { count: this.entries.length });
    } catch (error) {
      this.emit('audit:flush_error', { error });
    }
  }

  private startAutoFlush(): void {
    this.stopAutoFlush();
    this.flushTimer = setInterval(async () => {
      await this.flushToDisk();
    }, this.config.autoFlushInterval);
  }

  private stopAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  // ===== Utility Methods =====

  private generateId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`;
  }

  private shouldRecord(severity: AuditSeverity): boolean {
    const levels: AuditSeverity[] = ['debug', 'info', 'warning', 'error', 'critical'];
    const minIndex = levels.indexOf(this.config.minSeverity);
    const severityIndex = levels.indexOf(severity);
    return severityIndex >= minIndex;
  }

  private createDummyEntry(entry: Partial<AuditEntry>): AuditEntry {
    return {
      id: 'filtered',
      timestamp: new Date(),
      action: entry.action || 'system_event',
      severity: entry.severity || 'debug',
      description: entry.description || '',
      initiatedBy: entry.initiatedBy || 'system',
      success: entry.success ?? true,
      sessionId: this.sessionId,
    };
  }

  // ===== Statistics =====

  getStatistics(): {
    totalEntries: number;
    entriesByAction: Record<string, number>;
    entriesBySeverity: Record<string, number>;
    successRate: number;
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    const entriesByAction: Record<string, number> = {};
    const entriesBySeverity: Record<string, number> = {};
    let successCount = 0;

    for (const entry of this.entries) {
      entriesByAction[entry.action] = (entriesByAction[entry.action] || 0) + 1;
      entriesBySeverity[entry.severity] = (entriesBySeverity[entry.severity] || 0) + 1;
      if (entry.success) successCount++;
    }

    const timestamps = this.entries.map(e => e.timestamp);

    return {
      totalEntries: this.entries.length,
      entriesByAction,
      entriesBySeverity,
      successRate: this.entries.length > 0 ? successCount / this.entries.length : 0,
      oldestEntry: timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : undefined,
      newestEntry: timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : undefined,
    };
  }

  // ===== Cleanup =====

  clear(): void {
    this.entries = [];
    this.emit('audit:cleared');
  }

  pruneOldEntries(retentionDays?: number): number {
    const days = retentionDays || this.config.retentionDays;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const initialCount = this.entries.length;
    this.entries = this.entries.filter(e => e.timestamp >= cutoffDate);
    const prunedCount = initialCount - this.entries.length;

    if (prunedCount > 0) {
      this.emit('audit:pruned', { prunedCount, retentionDays: days });
    }

    return prunedCount;
  }

  getCurrentSessionId(): string {
    return this.sessionId;
  }
}

export default AuditTrail;
