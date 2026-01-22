import { EventEmitter } from 'events';
import { Logger } from '../core/logger.js';
import { ConfigManager } from '../core/config.js';
export interface SecurityScan {
    id: string;
    name: string;
    type: 'vulnerability' | 'dependency' | 'code-quality' | 'secrets' | 'compliance' | 'infrastructure' | 'container';
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    projectId?: string;
    target: {
        type: 'repository' | 'container' | 'infrastructure' | 'application' | 'dependencies';
        path: string;
        branch?: string;
        commit?: string;
        image?: string;
        tag?: string;
    };
    configuration: {
        scanner: string;
        rules: string[];
        excludes: string[];
        severity: SecuritySeverity[];
        formats: string[];
        outputPath: string;
    };
    results: SecurityFinding[];
    metrics: {
        totalFindings: number;
        criticalFindings: number;
        highFindings: number;
        mediumFindings: number;
        lowFindings: number;
        falsePositives: number;
        suppressed: number;
        scanDuration: number;
        filesScanned: number;
        linesScanned: number;
    };
    compliance: {
        frameworks: string[];
        requirements: ComplianceCheck[];
        overallScore: number;
        passedChecks: number;
        failedChecks: number;
    };
    remediation: {
        autoFixAvailable: SecurityFinding[];
        manualReview: SecurityFinding[];
        recommendations: SecurityRecommendation[];
    };
    schedule?: {
        frequency: 'manual' | 'daily' | 'weekly' | 'monthly' | 'on-commit' | 'on-deploy';
        nextRun?: Date;
        lastRun?: Date;
    };
    notifications: {
        channels: string[];
        thresholds: {
            critical: number;
            high: number;
            medium: number;
        };
    };
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    auditLog: SecurityAuditEntry[];
}
export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export interface SecurityFinding {
    id: string;
    title: string;
    description: string;
    severity: SecuritySeverity;
    category: 'vulnerability' | 'secret' | 'misconfiguration' | 'compliance' | 'code-quality' | 'license';
    cwe?: string;
    cve?: string;
    cvss?: {
        score: number;
        vector: string;
        version: string;
    };
    location: {
        file: string;
        line?: number;
        column?: number;
        function?: string;
        component?: string;
    };
    evidence: {
        snippet?: string;
        context?: string;
        references?: string[];
    };
    impact: string;
    remediation: {
        description: string;
        effort: 'low' | 'medium' | 'high';
        priority: 'low' | 'medium' | 'high' | 'critical';
        autoFixable: boolean;
        steps: string[];
        references: string[];
    };
    status: 'open' | 'triaged' | 'in-progress' | 'resolved' | 'suppressed' | 'false-positive';
    assignedTo?: string;
    dueDate?: Date;
    tags: string[];
    metadata: Record<string, any>;
    firstSeen: Date;
    lastSeen: Date;
    occurrences: number;
}
export interface ComplianceCheck {
    id: string;
    framework: string;
    control: string;
    description: string;
    status: 'passed' | 'failed' | 'not-applicable' | 'manual-review';
    severity: SecuritySeverity;
    evidence?: string;
    remediation?: string;
    lastChecked: Date;
}
export interface SecurityRecommendation {
    id: string;
    title: string;
    description: string;
    category: 'security-hardening' | 'vulnerability-management' | 'access-control' | 'monitoring' | 'compliance';
    priority: 'low' | 'medium' | 'high' | 'critical';
    effort: 'low' | 'medium' | 'high';
    impact: string;
    implementation: {
        steps: string[];
        tools: string[];
        timeEstimate: string;
        cost: string;
    };
    references: string[];
    applicableFrameworks: string[];
}
export interface SecurityPolicy {
    id: string;
    name: string;
    description: string;
    type: 'scanning' | 'access-control' | 'compliance' | 'incident-response' | 'data-protection';
    version: string;
    status: 'draft' | 'active' | 'deprecated';
    rules: SecurityRule[];
    enforcement: {
        level: 'advisory' | 'warning' | 'blocking';
        exceptions: string[];
        approvers: string[];
    };
    applicability: {
        projects: string[];
        environments: string[];
        resources: string[];
    };
    schedule: {
        reviewFrequency: 'quarterly' | 'annually' | 'as-needed';
        nextReview: Date;
        lastReview?: Date;
        reviewer: string;
    };
    metrics: {
        violations: number;
        compliance: number;
        exceptions: number;
    };
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}
export interface SecurityRule {
    id: string;
    name: string;
    description: string;
    condition: string;
    action: 'allow' | 'deny' | 'alert' | 'audit';
    severity: SecuritySeverity;
    parameters: Record<string, any>;
    enabled: boolean;
}
export interface SecurityIncident {
    id: string;
    title: string;
    description: string;
    severity: SecuritySeverity;
    status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
    type: 'security-breach' | 'vulnerability-exploit' | 'policy-violation' | 'suspicious-activity' | 'compliance-violation';
    source: {
        type: 'scan' | 'alert' | 'user-report' | 'automated-detection';
        details: Record<string, any>;
    };
    affected: {
        systems: string[];
        data: string[];
        users: string[];
    };
    timeline: {
        detected: Date;
        reported: Date;
        acknowledged: Date;
        contained?: Date;
        resolved?: Date;
        closed?: Date;
    };
    response: {
        assignedTo: string[];
        actions: SecurityAction[];
        communications: SecurityCommunication[];
        lessons: string[];
    };
    evidence: {
        logs: string[];
        files: string[];
        screenshots: string[];
        forensics: string[];
    };
    impact: {
        confidentiality: 'none' | 'low' | 'medium' | 'high';
        integrity: 'none' | 'low' | 'medium' | 'high';
        availability: 'none' | 'low' | 'medium' | 'high';
        financialLoss?: number;
        reputationalDamage?: string;
        regulatoryImplications?: string[];
    };
    rootCause: {
        primary: string;
        contributing: string[];
        analysis: string;
    };
    remediation: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
        preventive: string[];
    };
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    auditLog: SecurityAuditEntry[];
}
export interface SecurityAction {
    id: string;
    type: 'investigation' | 'containment' | 'eradication' | 'recovery' | 'notification' | 'documentation';
    description: string;
    assignedTo: string;
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    dueDate?: Date;
    completedAt?: Date;
    notes: string;
}
export interface SecurityCommunication {
    id: string;
    type: 'internal' | 'external' | 'regulatory' | 'customer' | 'media';
    audience: string[];
    subject: string;
    message: string;
    sentAt: Date;
    sentBy: string;
    channel: 'email' | 'phone' | 'meeting' | 'document' | 'portal';
}
export interface SecurityAuditEntry {
    id: string;
    timestamp: Date;
    userId: string;
    action: string;
    target: string;
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export interface VulnerabilityDatabase {
    id: string;
    name: string;
    type: 'nvd' | 'github' | 'snyk' | 'custom';
    url: string;
    updateFrequency: 'hourly' | 'daily' | 'weekly';
    lastUpdate: Date;
    status: 'active' | 'inactive' | 'error';
    configuration: Record<string, any>;
}
export interface SecurityMetrics {
    scans: {
        total: number;
        completed: number;
        failed: number;
        inProgress: number;
        byType: Record<string, number>;
        averageDuration: number;
    };
    findings: {
        total: number;
        open: number;
        resolved: number;
        suppressed: number;
        bySeverity: Record<SecuritySeverity, number>;
        byCategory: Record<string, number>;
        meanTimeToResolution: number;
    };
    compliance: {
        frameworks: Record<string, {
            total: number;
            passed: number;
            failed: number;
            score: number;
        }>;
        overallScore: number;
        trending: 'improving' | 'stable' | 'declining';
    };
    incidents: {
        total: number;
        open: number;
        resolved: number;
        bySeverity: Record<SecuritySeverity, number>;
        meanTimeToDetection: number;
        meanTimeToResponse: number;
        meanTimeToResolution: number;
    };
    policies: {
        total: number;
        active: number;
        violations: number;
        compliance: number;
    };
    trends: {
        findingsTrend: Array<{
            date: Date;
            count: number;
        }>;
        complianceTrend: Array<{
            date: Date;
            score: number;
        }>;
        incidentsTrend: Array<{
            date: Date;
            count: number;
        }>;
    };
}
export declare class SecurityManager extends EventEmitter {
    private scans;
    private policies;
    private incidents;
    private vulnerabilityDatabases;
    private securityPath;
    private logger;
    private config;
    constructor(securityPath?: string, logger?: Logger, config?: ConfigManager);
    initialize(): Promise<void>;
    createSecurityScan(scanData: {
        name: string;
        type: SecurityScan['type'];
        target: SecurityScan['target'];
        configuration?: Partial<SecurityScan['configuration']>;
        projectId?: string;
        schedule?: SecurityScan['schedule'];
    }): Promise<SecurityScan>;
    executeScan(scanId: string): Promise<void>;
    createSecurityIncident(incidentData: {
        title: string;
        description: string;
        severity: SecuritySeverity;
        type: SecurityIncident['type'];
        source: SecurityIncident['source'];
        affected?: Partial<SecurityIncident['affected']>;
    }): Promise<SecurityIncident>;
    updateIncident(incidentId: string, updates: Partial<SecurityIncident>, userId?: string): Promise<SecurityIncident>;
    runComplianceAssessment(frameworks: string[], scope?: {
        projectId?: string;
        environment?: string;
        resources?: string[];
    }): Promise<ComplianceCheck[]>;
    createSecurityPolicy(policyData: {
        name: string;
        description: string;
        type: SecurityPolicy['type'];
        rules: Omit<SecurityRule, 'id'>[];
        enforcement?: Partial<SecurityPolicy['enforcement']>;
        applicability?: Partial<SecurityPolicy['applicability']>;
    }): Promise<SecurityPolicy>;
    getSecurityMetrics(filters?: {
        timeRange?: {
            start: Date;
            end: Date;
        };
        projectId?: string;
        environment?: string;
        severity?: SecuritySeverity[];
    }): Promise<SecurityMetrics>;
    private loadConfigurations;
    private initializeDefaultPolicies;
    private initializeVulnerabilityDatabases;
    private getDefaultScanner;
    private executeScanEngine;
    private executeTrivyScan;
    private executeNpmAuditScan;
    private executeGitleaksScan;
    private executeCheckovScan;
    private executeGenericScan;
    private parseNpmAuditResults;
    private calculateScanMetrics;
    private runComplianceChecks;
    private runFrameworkChecks;
    private generateRemediationRecommendations;
    private checkNotificationThresholds;
    private sendScanNotification;
    private autoAssignIncident;
    private sendIncidentNotification;
    private updateIncidentTimeline;
    private saveScan;
    private savePolicy;
    private saveIncident;
    private addAuditEntry;
    private groupBy;
    private calculateMTTR;
    private calculateMTTD;
    private calculateMTTResponse;
    private calculateIncidentMTTR;
}
//# sourceMappingURL=security-manager.d.ts.map