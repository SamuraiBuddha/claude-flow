import { EventEmitter } from 'events';
import { Logger } from '../core/logger.js';
import { ConfigManager } from '../core/config.js';
export interface ProjectPhase {
    id: string;
    name: string;
    description: string;
    status: 'planned' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
    startDate?: Date;
    endDate?: Date;
    estimatedDuration: number;
    actualDuration?: number;
    dependencies: string[];
    assignedTeam: string[];
    deliverables: string[];
    risks: ProjectRisk[];
    milestones: ProjectMilestone[];
    budget: {
        estimated: number;
        actual: number;
        currency: string;
    };
    resources: ProjectResource[];
    completionPercentage: number;
    qualityMetrics: {
        testCoverage: number;
        codeQuality: number;
        documentation: number;
        securityScore: number;
    };
}
export interface ProjectRisk {
    id: string;
    description: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
    status: 'open' | 'mitigated' | 'closed';
    assignedTo: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ProjectMilestone {
    id: string;
    name: string;
    description: string;
    targetDate: Date;
    actualDate?: Date;
    status: 'pending' | 'achieved' | 'missed' | 'at-risk';
    dependencies: string[];
    deliverables: string[];
    successCriteria: string[];
}
export interface ProjectResource {
    id: string;
    name: string;
    type: 'human' | 'infrastructure' | 'software' | 'hardware';
    availability: number;
    cost: {
        amount: number;
        currency: string;
        period: 'hour' | 'day' | 'week' | 'month';
    };
    skills: string[];
    allocation: {
        phaseId: string;
        percentage: number;
        startDate: Date;
        endDate: Date;
    }[];
}
export interface Project {
    id: string;
    name: string;
    description: string;
    type: 'web-app' | 'api' | 'microservice' | 'infrastructure' | 'research' | 'migration' | 'custom';
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    owner: string;
    stakeholders: string[];
    phases: ProjectPhase[];
    budget: {
        total: number;
        spent: number;
        remaining: number;
        currency: string;
    };
    timeline: {
        plannedStart: Date;
        plannedEnd: Date;
        actualStart?: Date;
        actualEnd?: Date;
    };
    tags: string[];
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    auditLog: ProjectAuditEntry[];
    collaboration: {
        teamMembers: TeamMember[];
        communication: CommunicationChannel[];
        sharedResources: string[];
    };
    qualityGates: QualityGate[];
    complianceRequirements: ComplianceRequirement[];
}
export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    skills: string[];
    availability: number;
    permissions: string[];
    joinDate: Date;
    status: 'active' | 'inactive' | 'on-leave';
}
export interface CommunicationChannel {
    id: string;
    name: string;
    type: 'slack' | 'teams' | 'email' | 'webhook' | 'custom';
    configuration: Record<string, any>;
    isActive: boolean;
}
export interface QualityGate {
    id: string;
    name: string;
    phase: string;
    criteria: {
        metric: string;
        threshold: number;
        operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    }[];
    status: 'pending' | 'passed' | 'failed' | 'skipped';
    executedAt?: Date;
    results: Record<string, number>;
}
export interface ComplianceRequirement {
    id: string;
    name: string;
    framework: string;
    description: string;
    status: 'not-started' | 'in-progress' | 'compliant' | 'non-compliant';
    evidence: string[];
    reviewer: string;
    reviewDate?: Date;
    dueDate: Date;
}
export interface ProjectAuditEntry {
    id: string;
    timestamp: Date;
    userId: string;
    action: string;
    target: string;
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export interface ProjectMetrics {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    averageProjectDuration: number;
    budgetVariance: number;
    resourceUtilization: number;
    qualityScore: number;
    riskScore: number;
    teamProductivity: number;
    customerSatisfaction: number;
}
export interface ProjectReport {
    id: string;
    projectId: string;
    type: 'status' | 'financial' | 'quality' | 'risk' | 'resource' | 'compliance';
    title: string;
    summary: string;
    details: Record<string, any>;
    recommendations: string[];
    generatedAt: Date;
    generatedBy: string;
    format: 'json' | 'pdf' | 'html' | 'csv';
    recipients: string[];
}
export declare class ProjectManager extends EventEmitter {
    private projects;
    private projectsPath;
    private logger;
    private config;
    constructor(projectsPath?: string, logger?: Logger, config?: ConfigManager);
    initialize(): Promise<void>;
    createProject(projectData: Partial<Project>): Promise<Project>;
    updateProject(projectId: string, updates: Partial<Project>): Promise<Project>;
    deleteProject(projectId: string, userId?: string): Promise<void>;
    getProject(projectId: string): Promise<Project | null>;
    listProjects(filters?: {
        status?: Project['status'];
        type?: Project['type'];
        priority?: Project['priority'];
        owner?: string;
        tags?: string[];
    }): Promise<Project[]>;
    addPhase(projectId: string, phase: Omit<ProjectPhase, 'id'>): Promise<ProjectPhase>;
    updatePhase(projectId: string, phaseId: string, updates: Partial<ProjectPhase>): Promise<ProjectPhase>;
    addTeamMember(projectId: string, member: TeamMember): Promise<void>;
    removeTeamMember(projectId: string, memberId: string): Promise<void>;
    getProjectMetrics(projectId?: string): Promise<ProjectMetrics>;
    generateReport(projectId: string, type: ProjectReport['type'], userId?: string): Promise<ProjectReport>;
    private loadProjects;
    private saveProject;
    private addAuditEntry;
    private calculateProjectProgress;
    private getUpcomingMilestones;
    private calculateCostBreakdown;
    private projectFinalCost;
    private calculateQualityMetrics;
    private generateQualityRecommendations;
    private getAllRisks;
    private generateRiskMatrix;
    private generateRiskMitigation;
    private getTotalResources;
    private calculateResourceAllocation;
    private calculateResourceUtilization;
    private calculateCapacity;
    private calculateComplianceStatus;
    private identifyComplianceGaps;
    private generateComplianceRecommendations;
}
//# sourceMappingURL=project-manager.d.ts.map