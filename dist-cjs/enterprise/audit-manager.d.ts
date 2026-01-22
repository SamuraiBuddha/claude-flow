import { EventEmitter } from 'events';
import { Logger } from '../core/logger.js';
import { ConfigManager } from '../core/config.js';
export interface AuditEntry {
    id: string;
    timestamp: Date;
    eventType: string;
    category: 'authentication' | 'authorization' | 'data-access' | 'system-change' | 'security' | 'compliance' | 'business';
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    sessionId?: string;
    resource: {
        type: string;
        id: string;
        name?: string;
        path?: string;
    };
    action: string;
    outcome: 'success' | 'failure' | 'partial' | 'denied';
    details: Record<string, any>;
    context: {
        ipAddress?: string;
        userAgent?: string;
        location?: string;
        source: string;
        requestId?: string;
    };
    compliance: {
        frameworks: string[];
        controls: string[];
        retention: string;
        classification: 'public' | 'internal' | 'confidential' | 'restricted';
    };
    integrity: {
        hash: string;
        signature?: string;
        verified: boolean;
    };
    metadata: Record<string, any>;
}
export interface ComplianceFramework {
    id: string;
    name: string;
    version: string;
    description: string;
    type: 'regulatory' | 'industry' | 'internal' | 'certification';
    requirements: ComplianceRequirement[];
    auditFrequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    retentionPeriod: string;
    reportingRequirements: {
        frequency: string;
        recipients: string[];
        format: string[];
        automated: boolean;
    };
    controls: ComplianceControl[];
    status: 'active' | 'inactive' | 'pending' | 'deprecated';
    implementationDate: Date;
    nextReview: Date;
    responsible: string;
}
export interface ComplianceRequirement {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'compliant' | 'non-compliant' | 'partial' | 'not-applicable' | 'pending';
    evidence: string[];
    gaps: string[];
    remediation: {
        actions: string[];
        owner: string;
        dueDate: Date;
        cost?: number;
        effort?: string;
    };
    lastAssessed: Date;
    nextAssessment: Date;
    automatedCheck: {
        enabled: boolean;
        frequency: string;
        query: string;
        threshold?: any;
    };
}
export interface ComplianceControl {
    id: string;
    name: string;
    description: string;
    type: 'preventive' | 'detective' | 'corrective' | 'compensating';
    automationType: 'manual' | 'semi-automated' | 'automated';
    effectiveness: 'low' | 'medium' | 'high';
    frequency: string;
    owner: string;
    evidence: string[];
    testingProcedure: string;
    lastTested: Date;
    nextTest: Date;
    status: 'effective' | 'ineffective' | 'needs-improvement' | 'not-tested';
}
export interface AuditReport {
    id: string;
    title: string;
    description: string;
    type: 'compliance' | 'security' | 'operational' | 'financial' | 'investigation' | 'custom';
    scope: {
        timeRange: {
            start: Date;
            end: Date;
        };
        systems: string[];
        users: string[];
        events: string[];
        compliance: string[];
    };
    findings: AuditFinding[];
    recommendations: AuditRecommendation[];
    summary: {
        totalEvents: number;
        criticalFindings: number;
        complianceScore: number;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
    };
    methodology: string;
    limitations: string[];
    reviewers: string[];
    approvers: string[];
    status: 'draft' | 'under-review' | 'approved' | 'published' | 'archived';
    confidentiality: 'public' | 'internal' | 'confidential' | 'restricted';
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    publishedAt?: Date;
}
export interface AuditFinding {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    risk: string;
    impact: string;
    likelihood: string;
    evidence: AuditEvidence[];
    relatedEvents: string[];
    complianceImpact: {
        frameworks: string[];
        violations: string[];
        penalties?: string[];
    };
    remediation: {
        priority: 'low' | 'medium' | 'high' | 'immediate';
        owner: string;
        actions: string[];
        timeline: string;
        cost?: number;
    };
    status: 'open' | 'in-progress' | 'resolved' | 'accepted-risk' | 'false-positive';
}
export interface AuditEvidence {
    id: string;
    type: 'log-entry' | 'screenshot' | 'document' | 'system-output' | 'witness-statement' | 'data-export';
    description: string;
    source: string;
    timestamp: Date;
    hash: string;
    location: string;
    preservationStatus: 'intact' | 'modified' | 'corrupted' | 'missing';
    chainOfCustody: ChainOfCustodyEntry[];
}
export interface ChainOfCustodyEntry {
    timestamp: Date;
    action: 'collected' | 'accessed' | 'analyzed' | 'transferred' | 'stored' | 'destroyed';
    user: string;
    reason: string;
    hash: string;
}
export interface AuditRecommendation {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'policy' | 'process' | 'technology' | 'training' | 'governance';
    implementation: {
        effort: 'low' | 'medium' | 'high';
        cost: 'low' | 'medium' | 'high';
        timeline: string;
        dependencies: string[];
        risks: string[];
    };
    expectedBenefit: string;
    owner: string;
    status: 'proposed' | 'approved' | 'in-progress' | 'completed' | 'rejected';
    tracking: {
        milestones: string[];
        progress: number;
        nextReview: Date;
    };
}
export interface AuditTrail {
    id: string;
    name: string;
    description: string;
    category: string;
    entries: AuditEntry[];
    configuration: {
        retention: string;
        compression: boolean;
        encryption: boolean;
        archival: {
            enabled: boolean;
            location: string;
            schedule: string;
        };
        monitoring: {
            realTime: boolean;
            alerting: boolean;
            dashboards: string[];
        };
    };
    integrity: {
        verified: boolean;
        lastVerification: Date;
        checksum: string;
        tamperEvidence: TamperEvidence[];
    };
    access: {
        viewers: string[];
        admins: string[];
        readonly: boolean;
        auditAccess: boolean;
    };
    compliance: {
        frameworks: string[];
        retention: string;
        exportRequirements: string[];
        immutable: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface TamperEvidence {
    timestamp: Date;
    type: 'checksum-mismatch' | 'unauthorized-access' | 'missing-entries' | 'timestamp-anomaly';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    investigationStatus: 'pending' | 'investigating' | 'resolved' | 'false-alarm';
    evidence: string[];
}
export interface AuditConfiguration {
    general: {
        enabled: boolean;
        defaultRetention: string;
        compressionEnabled: boolean;
        encryptionEnabled: boolean;
        realTimeProcessing: boolean;
    };
    collection: {
        automaticCapture: boolean;
        bufferSize: number;
        batchSize: number;
        flushInterval: number;
        failureHandling: 'ignore' | 'retry' | 'alert' | 'stop';
    };
    storage: {
        primaryLocation: string;
        backupLocation?: string;
        archivalLocation?: string;
        partitioning: 'daily' | 'weekly' | 'monthly';
        indexing: boolean;
    };
    integrity: {
        checksumAlgorithm: 'sha256' | 'sha512' | 'blake2b';
        verificationFrequency: string;
        digitalSignatures: boolean;
        immutableStorage: boolean;
    };
    compliance: {
        frameworks: string[];
        automaticClassification: boolean;
        retentionPolicies: Record<string, string>;
        exportFormats: string[];
    };
    monitoring: {
        alerting: {
            enabled: boolean;
            channels: string[];
            thresholds: {
                failedLogins: number;
                privilegedAccess: number;
                dataExfiltration: number;
                configChanges: number;
            };
        };
        reporting: {
            automated: boolean;
            frequency: string;
            recipients: string[];
            dashboards: string[];
        };
    };
    privacy: {
        piiDetection: boolean;
        anonymization: boolean;
        masking: {
            enabled: boolean;
            patterns: string[];
        };
        consent: {
            required: boolean;
            tracking: boolean;
        };
    };
}
export interface AuditMetrics {
    volume: {
        totalEntries: number;
        dailyAverage: number;
        peakHourly: number;
        byCategory: Record<string, number>;
        bySeverity: Record<string, number>;
    };
    compliance: {
        overallScore: number;
        byFramework: Record<string, {
            score: number;
            compliant: number;
            nonCompliant: number;
            total: number;
        }>;
        trending: 'improving' | 'stable' | 'declining';
    };
    integrity: {
        verificationSuccess: number;
        tamperAttempts: number;
        dataLoss: number;
        corruptionEvents: number;
    };
    performance: {
        ingestionRate: number;
        queryResponseTime: number;
        storageEfficiency: number;
        availabilityPercentage: number;
    };
    security: {
        unauthorizedAccess: number;
        privilegedActions: number;
        suspiciousPatterns: number;
        escalatedIncidents: number;
    };
}
export declare class AuditManager extends EventEmitter {
    private auditTrails;
    private frameworks;
    private reports;
    private auditBuffer;
    private auditPath;
    private logger;
    private config;
    private configuration;
    constructor(auditPath?: string, logger?: Logger, config?: ConfigManager);
    initialize(): Promise<void>;
    logAuditEvent(eventData: {
        eventType: string;
        category: AuditEntry['category'];
        severity?: AuditEntry['severity'];
        userId?: string;
        sessionId?: string;
        resource: AuditEntry['resource'];
        action: string;
        outcome: AuditEntry['outcome'];
        details: Record<string, any>;
        context: Partial<AuditEntry['context']>;
        compliance?: {
            frameworks?: string[];
            controls?: string[];
            classification?: AuditEntry['compliance']['classification'];
        };
    }): Promise<AuditEntry>;
    createComplianceFramework(frameworkData: {
        name: string;
        version: string;
        description: string;
        type: ComplianceFramework['type'];
        requirements: Omit<ComplianceRequirement, 'id'>[];
        controls: Omit<ComplianceControl, 'id'>[];
        auditFrequency: ComplianceFramework['auditFrequency'];
        retentionPeriod: string;
        responsible: string;
    }): Promise<ComplianceFramework>;
    generateAuditReport(reportConfig: {
        title: string;
        description: string;
        type: AuditReport['type'];
        scope: AuditReport['scope'];
        includeRecommendations?: boolean;
        confidentiality?: AuditReport['confidentiality'];
    }): Promise<AuditReport>;
    exportAuditData(exportConfig: {
        format: 'json' | 'csv' | 'xml' | 'pdf';
        scope: {
            timeRange: {
                start: Date;
                end: Date;
            };
            categories?: string[];
            severity?: string[];
            users?: string[];
        };
        destination: string;
        encryption?: boolean;
        compression?: boolean;
    }): Promise<string>;
    verifyAuditIntegrity(trailId?: string): Promise<{
        verified: boolean;
        issues: TamperEvidence[];
        summary: {
            totalEntries: number;
            verifiedEntries: number;
            corruptedEntries: number;
            missingEntries: number;
        };
    }>;
    getAuditMetrics(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<AuditMetrics>;
    private getDefaultConfiguration;
    private loadConfigurations;
    private initializeDefaultFrameworks;
    private startAuditProcessing;
    private flushAuditBuffer;
    private processAuditEntry;
    private determineAuditTrail;
    private createAuditTrail;
    private calculateHash;
    private calculateTrailChecksum;
    private calculateRetentionPeriod;
    private parseRetentionPeriod;
    private queryAuditEntries;
    private analyzeAuditEntries;
    private calculateComplianceScore;
    private checkAutomatedRequirement;
    private calculateRiskLevel;
    private generateRecommendations;
    private checkComplianceViolations;
    private checkSecurityAlerts;
    private generateSecurityAlert;
    private calculatePeakHourly;
    private groupBy;
    private convertToCSV;
    private convertToXML;
    private convertToPDF;
    private saveFramework;
    private saveAuditTrail;
    private saveReport;
}
//# sourceMappingURL=audit-manager.d.ts.map