import { EventEmitter } from 'events';
import { Logger } from '../core/logger.js';
import { ConfigManager } from '../core/config.js';
export interface CloudProvider {
    id: string;
    name: string;
    type: 'aws' | 'gcp' | 'azure' | 'kubernetes' | 'docker' | 'digitalocean' | 'linode' | 'custom';
    credentials: {
        accessKey?: string;
        secretKey?: string;
        projectId?: string;
        subscriptionId?: string;
        token?: string;
        keyFile?: string;
        customConfig?: Record<string, any>;
    };
    configuration: {
        defaultRegion: string;
        availableRegions: string[];
        services: string[];
        endpoints: Record<string, string>;
        features: string[];
    };
    status: 'active' | 'inactive' | 'error' | 'maintenance';
    quotas: {
        computeInstances: number;
        storage: number;
        bandwidth: number;
        requests: number;
    };
    pricing: {
        currency: string;
        computePerHour: number;
        storagePerGB: number;
        bandwidthPerGB: number;
        requestsPer1000: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface CloudResource {
    id: string;
    name: string;
    type: 'compute' | 'storage' | 'network' | 'database' | 'cache' | 'queue' | 'function' | 'custom';
    providerId: string;
    region: string;
    status: 'creating' | 'running' | 'stopped' | 'error' | 'terminated';
    configuration: {
        size: string;
        image?: string;
        ports?: number[];
        environment?: Record<string, string>;
        volumes?: VolumeMount[];
        networks?: string[];
        tags: Record<string, string>;
    };
    monitoring: {
        enabled: boolean;
        metrics: CloudMetric[];
        alerts: CloudAlert[];
        healthChecks: HealthCheck[];
    };
    security: {
        encryption: boolean;
        backups: boolean;
        accessControl: AccessControl[];
        vulnerabilityScanning: boolean;
        complianceFrameworks: string[];
    };
    costs: {
        hourlyRate: number;
        monthlyEstimate: number;
        actualSpend: number;
        lastBillingDate: Date;
        costBreakdown: Record<string, number>;
    };
    performance: {
        cpu: number;
        memory: number;
        storage: number;
        network: number;
        uptime: number;
        availability: number;
    };
    metadata: {
        projectId?: string;
        environment: string;
        owner: string;
        purpose: string;
        lifecycle: 'temporary' | 'permanent' | 'scheduled';
        expiryDate?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
    auditLog: CloudAuditEntry[];
}
export interface VolumeMount {
    source: string;
    destination: string;
    type: 'bind' | 'volume' | 'tmpfs';
    readOnly: boolean;
    size?: string;
}
export interface CloudMetric {
    name: string;
    type: 'counter' | 'gauge' | 'histogram';
    value: number;
    unit: string;
    timestamp: Date;
    tags: Record<string, string>;
}
export interface CloudAlert {
    id: string;
    name: string;
    condition: string;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
    notifications: string[];
    lastTriggered?: Date;
}
export interface HealthCheck {
    id: string;
    name: string;
    type: 'http' | 'tcp' | 'command';
    configuration: {
        url?: string;
        port?: number;
        command?: string;
        expectedStatus?: number;
        timeout: number;
        interval: number;
        retries: number;
    };
    status: 'healthy' | 'unhealthy' | 'unknown';
    lastCheck: Date;
    history: HealthCheckResult[];
}
export interface HealthCheckResult {
    timestamp: Date;
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    details?: string;
}
export interface AccessControl {
    type: 'ip' | 'role' | 'user' | 'group';
    rule: string;
    permissions: string[];
    enabled: boolean;
}
export interface CloudAuditEntry {
    id: string;
    timestamp: Date;
    userId: string;
    action: string;
    resource: string;
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export interface CloudInfrastructure {
    id: string;
    name: string;
    description: string;
    projectId: string;
    environment: string;
    resources: string[];
    topology: {
        networks: NetworkTopology[];
        loadBalancers: LoadBalancer[];
        databases: Database[];
        caches: Cache[];
        queues: Queue[];
    };
    deployment: {
        strategy: 'manual' | 'terraform' | 'cloudformation' | 'kubernetes' | 'custom';
        template: string;
        parameters: Record<string, any>;
        lastDeployment?: Date;
        deploymentHistory: DeploymentHistory[];
    };
    monitoring: {
        dashboard: string;
        alerts: string[];
        sla: {
            availability: number;
            responseTime: number;
            errorRate: number;
        };
    };
    costs: {
        budgetLimit: number;
        currentSpend: number;
        projectedSpend: number;
        costAlerts: CostAlert[];
        optimization: CostOptimization[];
    };
    compliance: {
        frameworks: string[];
        requirements: ComplianceRequirement[];
        lastAudit: Date;
        nextAudit: Date;
    };
    backup: {
        enabled: boolean;
        schedule: string;
        retention: string;
        lastBackup?: Date;
        backupLocations: string[];
    };
    disaster_recovery: {
        enabled: boolean;
        rto: number;
        rpo: number;
        strategy: 'active-passive' | 'active-active' | 'pilot-light' | 'warm-standby';
        testFrequency: string;
        lastTest?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface NetworkTopology {
    id: string;
    name: string;
    type: 'vpc' | 'subnet' | 'security-group' | 'nat-gateway' | 'internet-gateway';
    configuration: Record<string, any>;
    connections: string[];
}
export interface LoadBalancer {
    id: string;
    name: string;
    type: 'application' | 'network' | 'classic';
    configuration: {
        algorithm: string;
        healthCheck: string;
        sslTermination: boolean;
        targets: string[];
    };
}
export interface Database {
    id: string;
    name: string;
    engine: string;
    version: string;
    configuration: {
        instanceClass: string;
        storage: number;
        backup: boolean;
        multiAZ: boolean;
        encryption: boolean;
    };
}
export interface Cache {
    id: string;
    name: string;
    engine: string;
    configuration: {
        nodeType: string;
        numNodes: number;
        evictionPolicy: string;
    };
}
export interface Queue {
    id: string;
    name: string;
    type: 'sqs' | 'rabbitmq' | 'kafka' | 'redis';
    configuration: {
        visibility: number;
        retention: number;
        dlq: boolean;
    };
}
export interface DeploymentHistory {
    id: string;
    timestamp: Date;
    version: string;
    changes: string[];
    status: 'success' | 'failed' | 'partial';
    duration: number;
    deployedBy: string;
}
export interface CostAlert {
    id: string;
    name: string;
    threshold: number;
    type: 'absolute' | 'percentage';
    frequency: 'daily' | 'weekly' | 'monthly';
    notifications: string[];
    enabled: boolean;
}
export interface CostOptimization {
    id: string;
    type: 'rightsizing' | 'scheduling' | 'reserved-instances' | 'spot-instances' | 'storage-optimization';
    description: string;
    potentialSavings: number;
    implementation: string;
    effort: 'low' | 'medium' | 'high';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'identified' | 'planned' | 'implemented' | 'monitoring';
}
export interface ComplianceRequirement {
    id: string;
    framework: string;
    requirement: string;
    status: 'compliant' | 'non-compliant' | 'pending';
    evidence: string[];
    remediation?: string;
    dueDate?: Date;
}
export interface CloudMetrics {
    providers: {
        total: number;
        active: number;
        inactive: number;
        errors: number;
    };
    resources: {
        total: number;
        running: number;
        stopped: number;
        errors: number;
        byType: Record<string, number>;
        byProvider: Record<string, number>;
        byEnvironment: Record<string, number>;
    };
    costs: {
        totalSpend: number;
        monthlySpend: number;
        projectedSpend: number;
        topSpenders: {
            resourceId: string;
            cost: number;
        }[];
        costByProvider: Record<string, number>;
        costByEnvironment: Record<string, number>;
        optimization: {
            potentialSavings: number;
            implementedSavings: number;
            opportunities: number;
        };
    };
    performance: {
        averageUptime: number;
        averageResponseTime: number;
        errorRate: number;
        availability: number;
    };
    security: {
        vulnerabilities: {
            critical: number;
            high: number;
            medium: number;
            low: number;
        };
        compliance: {
            compliant: number;
            nonCompliant: number;
            pending: number;
        };
        encryptionCoverage: number;
        backupCoverage: number;
    };
}
export declare class CloudManager extends EventEmitter {
    private providers;
    private resources;
    private infrastructures;
    private cloudPath;
    private logger;
    private config;
    constructor(cloudPath?: string, logger?: Logger, config?: ConfigManager);
    initialize(): Promise<void>;
    addProvider(providerData: Partial<CloudProvider>): Promise<CloudProvider>;
    createResource(resourceData: {
        name: string;
        type: CloudResource['type'];
        providerId: string;
        region: string;
        configuration: Partial<CloudResource['configuration']>;
        metadata: Partial<CloudResource['metadata']>;
    }): Promise<CloudResource>;
    createInfrastructure(infrastructureData: {
        name: string;
        description: string;
        projectId: string;
        environment: string;
        template: string;
        parameters: Record<string, any>;
    }): Promise<CloudInfrastructure>;
    deployInfrastructure(infrastructureId: string, userId?: string): Promise<void>;
    optimizeCosts(filters?: {
        providerId?: string;
        environment?: string;
        resourceType?: string;
    }): Promise<CostOptimization[]>;
    getCloudMetrics(filters?: {
        providerId?: string;
        environment?: string;
        timeRange?: {
            start: Date;
            end: Date;
        };
    }): Promise<CloudMetrics>;
    scaleResource(resourceId: string, scalingConfig: {
        size?: string;
        replicas?: number;
        autoScaling?: {
            enabled: boolean;
            minReplicas: number;
            maxReplicas: number;
            targetCPU: number;
            targetMemory: number;
        };
    }, userId?: string): Promise<void>;
    deleteResource(resourceId: string, userId?: string): Promise<void>;
    private loadConfigurations;
    private initializeDefaultProviders;
    private validateProviderCredentials;
    private validateAWSCredentials;
    private validateGCPCredentials;
    private validateAzureCredentials;
    private calculateResourceCost;
    private saveProvider;
    private saveResource;
    private saveInfrastructure;
    private addAuditEntry;
    private provisionResource;
    private deprovisionResource;
    private executeInfrastructureDeployment;
    private deployWithTerraform;
    private deployWithCloudFormation;
    private deployWithKubernetes;
    private deployWithCustomStrategy;
}
//# sourceMappingURL=cloud-manager.d.ts.map