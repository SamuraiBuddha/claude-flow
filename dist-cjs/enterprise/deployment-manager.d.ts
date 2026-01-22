import { EventEmitter } from 'events';
import { Logger } from '../core/logger.js';
import { ConfigManager } from '../core/config.js';
export interface DeploymentEnvironment {
    id: string;
    name: string;
    type: 'development' | 'staging' | 'production' | 'testing' | 'custom';
    status: 'active' | 'inactive' | 'maintenance' | 'error';
    configuration: {
        region: string;
        provider: 'aws' | 'gcp' | 'azure' | 'kubernetes' | 'docker' | 'custom';
        endpoints: string[];
        secrets: Record<string, string>;
        environment_variables: Record<string, string>;
        resources: {
            cpu: string;
            memory: string;
            storage: string;
            replicas: number;
        };
    };
    healthCheck: {
        url: string;
        method: 'GET' | 'POST' | 'HEAD';
        expectedStatus: number;
        timeout: number;
        interval: number;
        retries: number;
    };
    monitoring: {
        enabled: boolean;
        alerts: DeploymentAlert[];
        metrics: string[];
        logs: {
            level: string;
            retention: string;
            aggregation: boolean;
        };
    };
    security: {
        tls: boolean;
        authentication: boolean;
        authorization: string[];
        compliance: string[];
        scanning: {
            vulnerabilities: boolean;
            secrets: boolean;
            licenses: boolean;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface DeploymentStrategy {
    id: string;
    name: string;
    type: 'blue-green' | 'canary' | 'rolling' | 'recreate' | 'custom';
    configuration: {
        rolloutPercentage?: number;
        maxUnavailable?: number;
        maxSurge?: number;
        trafficSplitPercentage?: number;
        monitoringDuration?: number;
        rollbackThreshold?: number;
        approvalRequired?: boolean;
        automatedRollback?: boolean;
    };
    stages: DeploymentStage[];
    rollbackStrategy: {
        automatic: boolean;
        conditions: RollbackCondition[];
        timeout: number;
    };
    notifications: {
        channels: string[];
        events: string[];
    };
}
export interface DeploymentStage {
    id: string;
    name: string;
    order: number;
    type: 'build' | 'test' | 'deploy' | 'verify' | 'promote' | 'rollback' | 'custom';
    status: 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'cancelled';
    commands: DeploymentCommand[];
    conditions: {
        runIf: string[];
        skipIf: string[];
    };
    timeout: number;
    retryPolicy: {
        maxRetries: number;
        backoffMultiplier: number;
        initialDelay: number;
    };
    artifacts: {
        inputs: string[];
        outputs: string[];
    };
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    logs: DeploymentLog[];
}
export interface DeploymentCommand {
    id: string;
    command: string;
    args: string[];
    workingDirectory?: string;
    environment?: Record<string, string>;
    timeout: number;
    retryOnFailure: boolean;
    successCriteria: {
        exitCode?: number;
        outputContains?: string[];
        outputNotContains?: string[];
    };
}
export interface DeploymentLog {
    timestamp: Date;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    source: string;
    metadata?: Record<string, any>;
}
export interface RollbackCondition {
    metric: string;
    threshold: number;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    duration: number;
    description: string;
}
export interface DeploymentAlert {
    id: string;
    name: string;
    condition: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    channels: string[];
    enabled: boolean;
}
export interface Deployment {
    id: string;
    name: string;
    version: string;
    projectId: string;
    environmentId: string;
    strategyId: string;
    status: 'pending' | 'running' | 'success' | 'failed' | 'rolled-back' | 'cancelled';
    initiatedBy: string;
    source: {
        repository: string;
        branch: string;
        commit: string;
        tag?: string;
    };
    artifacts: {
        buildId?: string;
        imageTag?: string;
        packageVersion?: string;
        files: string[];
    };
    metrics: {
        startTime: Date;
        endTime?: Date;
        duration?: number;
        deploymentSize: number;
        rollbackTime?: number;
        successRate: number;
        errorRate: number;
        performanceMetrics: Record<string, number>;
    };
    stages: DeploymentStage[];
    rollback?: {
        triggered: boolean;
        reason: string;
        timestamp: Date;
        previousDeploymentId: string;
        rollbackDuration: number;
    };
    approvals: DeploymentApproval[];
    notifications: DeploymentNotification[];
    auditLog: DeploymentAuditEntry[];
    createdAt: Date;
    updatedAt: Date;
}
export interface DeploymentApproval {
    id: string;
    stage: string;
    requiredApprovers: string[];
    approvals: {
        userId: string;
        decision: 'approved' | 'rejected';
        reason?: string;
        timestamp: Date;
    }[];
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    expiresAt: Date;
}
export interface DeploymentNotification {
    id: string;
    type: 'email' | 'slack' | 'teams' | 'webhook' | 'sms';
    recipients: string[];
    subject: string;
    message: string;
    timestamp: Date;
    status: 'sent' | 'failed' | 'pending';
}
export interface DeploymentAuditEntry {
    id: string;
    timestamp: Date;
    userId: string;
    action: string;
    target: string;
    details: Record<string, any>;
    ipAddress?: string;
}
export interface DeploymentPipeline {
    id: string;
    name: string;
    projectId: string;
    environments: string[];
    promotionStrategy: 'manual' | 'automatic' | 'conditional';
    promotionRules: {
        environmentId: string;
        conditions: string[];
        approvers: string[];
    }[];
    triggers: {
        type: 'webhook' | 'schedule' | 'manual' | 'git';
        configuration: Record<string, any>;
    }[];
    configuration: {
        parallelDeployments: boolean;
        rollbackOnFailure: boolean;
        notifications: boolean;
        qualityGates: boolean;
    };
    metrics: {
        totalDeployments: number;
        successRate: number;
        averageDeploymentTime: number;
        mttr: number;
        changeFailureRate: number;
        deploymentFrequency: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface DeploymentMetrics {
    totalDeployments: number;
    successfulDeployments: number;
    failedDeployments: number;
    rolledBackDeployments: number;
    averageDeploymentTime: number;
    deploymentFrequency: number;
    meanTimeToRecovery: number;
    changeFailureRate: number;
    leadTime: number;
    environmentMetrics: Record<string, {
        deployments: number;
        successRate: number;
        averageTime: number;
    }>;
    strategyMetrics: Record<string, {
        deployments: number;
        successRate: number;
        rollbackRate: number;
    }>;
}
export declare class DeploymentManager extends EventEmitter {
    private deployments;
    private environments;
    private strategies;
    private pipelines;
    private activeProcesses;
    private deploymentsPath;
    private logger;
    private config;
    constructor(deploymentsPath?: string, logger?: Logger, config?: ConfigManager);
    initialize(): Promise<void>;
    createEnvironment(environmentData: Partial<DeploymentEnvironment>): Promise<DeploymentEnvironment>;
    createDeployment(deploymentData: {
        name: string;
        version: string;
        projectId: string;
        environmentId: string;
        strategyId: string;
        initiatedBy: string;
        source: Deployment['source'];
        artifacts?: Partial<Deployment['artifacts']>;
    }): Promise<Deployment>;
    executeDeployment(deploymentId: string): Promise<void>;
    private executeStage;
    private executeCommand;
    rollbackDeployment(deploymentId: string, reason: string, userId?: string): Promise<void>;
    getDeploymentMetrics(filters?: {
        projectId?: string;
        environmentId?: string;
        strategyId?: string;
        timeRange?: {
            start: Date;
            end: Date;
        };
    }): Promise<DeploymentMetrics>;
    private loadConfigurations;
    private initializeDefaultStrategies;
    private saveEnvironment;
    private saveStrategy;
    private saveDeployment;
    private addAuditEntry;
    private addLog;
    private evaluateStageConditions;
    private requiresApproval;
    private requestApproval;
    private isPendingApproval;
    private isApproved;
    private evaluateCommandSuccess;
    private retryStage;
    private handleDeploymentFailure;
    private handleDeploymentError;
    private completeDeployment;
    private getPreviousSuccessfulDeployment;
    private executeRollbackStrategy;
    private calculateDeploymentFrequency;
    private calculateMTTR;
    private calculateLeadTime;
}
//# sourceMappingURL=deployment-manager.d.ts.map