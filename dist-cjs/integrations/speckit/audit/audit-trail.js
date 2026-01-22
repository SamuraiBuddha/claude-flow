"use strict";
/**
 * Audit Trail for SpecKit Integration
 * Records all decisions, changes, and agent actions with compliance-ready export
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
exports.AuditTrail = void 0;
const node_events_1 = require("node:events");
const node_fs_1 = require("node:fs");
const path = __importStar(require("node:path"));
// ===== Audit Trail Class =====
class AuditTrail extends node_events_1.EventEmitter {
    config;
    entries = [];
    flushTimer;
    entryCounter = 0;
    sessionId;
    constructor(config = {}) {
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
    async initialize() {
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
    async shutdown() {
        this.stopAutoFlush();
        // Flush pending entries
        if (this.config.persistPath) {
            await this.flushToDisk();
        }
        this.emit('audit:shutdown');
    }
    // ===== Core Recording Methods =====
    record(entry) {
        // Check severity filter
        if (!this.shouldRecord(entry.severity)) {
            return this.createDummyEntry(entry);
        }
        const fullEntry = {
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
    recordSpecAction(action, specId, description, details, initiatedBy = 'system') {
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
    recordPlanAction(action, planId, description, details, initiatedBy = 'system', success = true) {
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
    recordTaskAction(action, taskId, description, agentId, details, success = true, error) {
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
    recordAgentAction(action, agentId, agentName, description, details, success = true, error) {
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
    recordGateAction(action, gateName, description, details, success = true) {
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
    recordWorkflowAction(action, workflowId, description, details, success = true, error) {
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
    recordDecision(description, decision, rationale, initiatedBy, approvedBy, correlationId) {
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
    recordStateChange(artifactId, artifactType, description, previousState, newState, initiatedBy) {
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
    query(queryParams = {}) {
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
            results = results.filter(e => e.timestamp >= queryParams.startTime);
        }
        if (queryParams.endTime) {
            results = results.filter(e => e.timestamp <= queryParams.endTime);
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
    queryByAgent(agentId, limit) {
        return this.query({ agentId, limit });
    }
    queryByArtifact(artifactId, limit) {
        return this.query({ artifactId, limit });
    }
    queryByTimeRange(startTime, endTime, limit) {
        return this.query({ startTime, endTime, limit });
    }
    queryByAction(action, limit) {
        return this.query({ action, limit });
    }
    queryErrors(limit) {
        return this.query({ success: false, limit });
    }
    // ===== Timeline Methods =====
    getTimeline(options = {}) {
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
    getSessionTimeline() {
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
    async export(options) {
        const entries = options.query ? this.query(options.query) : [...this.entries];
        // Filter fields if needed
        const processedEntries = entries.map(e => {
            const entry = {
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
                if (e.previousState !== undefined)
                    entry.previousState = e.previousState;
                if (e.newState !== undefined)
                    entry.newState = e.newState;
            }
            if (e.error)
                entry.error = e.error;
            if (e.approvedBy)
                entry.approvedBy = e.approvedBy;
            if (e.correlationId)
                entry.correlationId = e.correlationId;
            if (e.complianceFlags?.length)
                entry.complianceFlags = e.complianceFlags;
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
    exportCSV(entries) {
        if (entries.length === 0)
            return '';
        const headers = [
            'id', 'timestamp', 'action', 'severity', 'description',
            'agentId', 'artifactId', 'artifactType', 'initiatedBy', 'success', 'error'
        ];
        const rows = [headers.join(',')];
        for (const entry of entries) {
            const row = headers.map(h => {
                const value = entry[h];
                if (value === undefined || value === null)
                    return '';
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
    exportNDJSON(entries) {
        return entries.map(e => JSON.stringify(e)).join('\n');
    }
    async exportToFile(filePath, options) {
        const content = await this.export(options);
        await node_fs_1.promises.writeFile(filePath, content, 'utf-8');
        this.emit('audit:exported', { filePath, count: this.entries.length });
    }
    // ===== Compliance Export =====
    async exportComplianceReport(outputDir) {
        await node_fs_1.promises.mkdir(outputDir, { recursive: true });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportPath = path.join(outputDir, `compliance-report-${timestamp}.json`);
        const summaryPath = path.join(outputDir, `compliance-summary-${timestamp}.json`);
        const entriesPath = path.join(outputDir, `audit-entries-${timestamp}.ndjson`);
        // Generate summary
        const summary = this.generateComplianceSummary();
        await node_fs_1.promises.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
        // Export all entries
        const entries = await this.export({ format: 'ndjson', includeDetails: true, includeStates: true });
        await node_fs_1.promises.writeFile(entriesPath, entries, 'utf-8');
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
        await node_fs_1.promises.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
        this.emit('audit:compliance_exported', { outputDir, report });
        return { reportPath, summaryPath, entriesPath };
    }
    generateComplianceSummary() {
        const entries = this.entries;
        // Count by action type
        const actionCounts = {};
        for (const entry of entries) {
            actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;
        }
        // Count by severity
        const severityCounts = {};
        for (const entry of entries) {
            severityCounts[entry.severity] = (severityCounts[entry.severity] || 0) + 1;
        }
        // Count by artifact type
        const artifactCounts = {};
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
    async loadFromDisk() {
        if (!this.config.persistPath)
            return;
        try {
            const content = await node_fs_1.promises.readFile(this.config.persistPath, 'utf-8');
            const data = JSON.parse(content);
            // Convert timestamp strings back to Date objects
            this.entries = (data.entries || []).map((e) => ({
                ...e,
                timestamp: new Date(e.timestamp),
            }));
            // Apply retention policy
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
            this.entries = this.entries.filter(e => e.timestamp >= cutoffDate);
            this.emit('audit:loaded', { count: this.entries.length });
        }
        catch (error) {
            // File doesn't exist or is invalid - start fresh
            this.entries = [];
        }
    }
    async flushToDisk() {
        if (!this.config.persistPath)
            return;
        try {
            const data = {
                version: '1.0',
                sessionId: this.sessionId,
                exportedAt: new Date().toISOString(),
                entries: this.entries,
            };
            await node_fs_1.promises.mkdir(path.dirname(this.config.persistPath), { recursive: true });
            await node_fs_1.promises.writeFile(this.config.persistPath, JSON.stringify(data), 'utf-8');
            this.emit('audit:flushed', { count: this.entries.length });
        }
        catch (error) {
            this.emit('audit:flush_error', { error });
        }
    }
    startAutoFlush() {
        this.stopAutoFlush();
        this.flushTimer = setInterval(async () => {
            await this.flushToDisk();
        }, this.config.autoFlushInterval);
    }
    stopAutoFlush() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = undefined;
        }
    }
    // ===== Utility Methods =====
    generateId(prefix) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `${prefix}-${timestamp}-${random}`;
    }
    shouldRecord(severity) {
        const levels = ['debug', 'info', 'warning', 'error', 'critical'];
        const minIndex = levels.indexOf(this.config.minSeverity);
        const severityIndex = levels.indexOf(severity);
        return severityIndex >= minIndex;
    }
    createDummyEntry(entry) {
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
    getStatistics() {
        const entriesByAction = {};
        const entriesBySeverity = {};
        let successCount = 0;
        for (const entry of this.entries) {
            entriesByAction[entry.action] = (entriesByAction[entry.action] || 0) + 1;
            entriesBySeverity[entry.severity] = (entriesBySeverity[entry.severity] || 0) + 1;
            if (entry.success)
                successCount++;
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
    clear() {
        this.entries = [];
        this.emit('audit:cleared');
    }
    pruneOldEntries(retentionDays) {
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
    getCurrentSessionId() {
        return this.sessionId;
    }
}
exports.AuditTrail = AuditTrail;
exports.default = AuditTrail;
//# sourceMappingURL=audit-trail.js.map