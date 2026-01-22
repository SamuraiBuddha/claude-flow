/**
 * Comprehensive resource management system for swarm operations
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../core/logger.js';
import type { IEventBus } from '../core/event-bus.js';
import type { AgentId, TaskId } from '../swarm/types.js';
export interface ResourceManagerConfig {
    enableResourcePooling: boolean;
    enableResourceMonitoring: boolean;
    enableAutoScaling: boolean;
    enableQoS: boolean;
    monitoringInterval: number;
    cleanupInterval: number;
    defaultLimits: ResourceLimits;
    reservationTimeout: number;
    allocationStrategy: 'first-fit' | 'best-fit' | 'worst-fit' | 'balanced';
    priorityWeights: PriorityWeights;
    enablePredictiveAllocation: boolean;
    enableResourceSharing: boolean;
    debugMode: boolean;
}
export interface ResourceLimits {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    gpu?: number;
    custom: Record<string, number>;
}
export interface PriorityWeights {
    critical: number;
    high: number;
    normal: number;
    low: number;
    background: number;
}
export interface Resource {
    id: string;
    type: ResourceType;
    name: string;
    description: string;
    capacity: ResourceLimits;
    allocated: ResourceLimits;
    available: ResourceLimits;
    status: ResourceStatus;
    metadata: ResourceMetadata;
    reservations: ResourceReservation[];
    allocations: ResourceAllocation[];
    sharable: boolean;
    persistent: boolean;
    cost: number;
    location?: string;
    tags: string[];
}
export interface ResourcePool {
    id: string;
    name: string;
    type: ResourceType;
    resources: string[];
    strategy: PoolStrategy;
    loadBalancing: LoadBalancingStrategy;
    scaling: ScalingConfig;
    qos: QoSConfig;
    statistics: PoolStatistics;
    filters: ResourceFilter[];
}
export interface ResourceReservation {
    id: string;
    resourceId: string;
    agentId: AgentId;
    taskId?: TaskId;
    requirements: ResourceRequirements;
    status: ReservationStatus;
    priority: ResourcePriority;
    createdAt: Date;
    expiresAt?: Date;
    activatedAt?: Date;
    releasedAt?: Date;
    metadata: Record<string, any>;
}
export interface ResourceAllocation {
    id: string;
    reservationId: string;
    resourceId: string;
    agentId: AgentId;
    taskId?: TaskId;
    allocated: ResourceLimits;
    actualUsage: ResourceUsage;
    efficiency: number;
    startTime: Date;
    endTime?: Date;
    status: AllocationStatus;
    qosViolations: QoSViolation[];
}
export interface ResourceRequirements {
    cpu?: ResourceSpec;
    memory?: ResourceSpec;
    disk?: ResourceSpec;
    network?: ResourceSpec;
    gpu?: ResourceSpec;
    custom?: Record<string, ResourceSpec>;
    constraints?: ResourceConstraints;
    preferences?: ResourcePreferences;
}
export interface ResourceSpec {
    min: number;
    max?: number;
    preferred?: number;
    unit: string;
    shared?: boolean;
    exclusive?: boolean;
}
export interface ResourceConstraints {
    location?: string[];
    excludeLocation?: string[];
    nodeAffinity?: NodeAffinity[];
    antiAffinity?: AntiAffinity[];
    timeWindow?: TimeWindow;
    dependencies?: string[];
    maxCost?: number;
}
export interface ResourcePreferences {
    location?: string;
    performanceClass?: 'high' | 'medium' | 'low';
    costOptimized?: boolean;
    energyEfficient?: boolean;
    highAvailability?: boolean;
}
export interface ResourceUsage {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    gpu?: number;
    custom: Record<string, number>;
    timestamp: Date;
    duration: number;
}
export interface ResourceMetadata {
    provider: string;
    region?: string;
    zone?: string;
    instance?: string;
    capabilities: string[];
    performance: PerformanceMetrics;
    reliability: ReliabilityMetrics;
    cost: CostMetrics;
    lastUpdated: Date;
}
export interface PerformanceMetrics {
    cpuScore: number;
    memoryBandwidth: number;
    diskIOPS: number;
    networkBandwidth: number;
    gpuScore?: number;
    benchmarkResults: Record<string, number>;
}
export interface ReliabilityMetrics {
    uptime: number;
    meanTimeBetweenFailures: number;
    errorRate: number;
    lastFailure?: Date;
    failureHistory: FailureRecord[];
}
export interface CostMetrics {
    hourlyRate: number;
    dataTransferCost: number;
    storageCost: number;
    spotPricing?: boolean;
    billing: BillingModel;
}
export interface FailureRecord {
    timestamp: Date;
    type: string;
    duration: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
    resolved: boolean;
}
export interface QoSConfig {
    guarantees: QoSGuarantee[];
    objectives: QoSObjective[];
    violations: QoSViolationPolicy;
}
export interface QoSGuarantee {
    metric: string;
    threshold: number;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    priority: ResourcePriority;
    penalty?: number;
}
export interface QoSObjective {
    metric: string;
    target: number;
    weight: number;
    tolerance: number;
}
export interface QoSViolation {
    timestamp: Date;
    metric: string;
    expected: number;
    actual: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    duration: number;
    resolved: boolean;
}
export interface QoSViolationPolicy {
    autoRemediation: boolean;
    escalationThreshold: number;
    penaltyFunction: string;
    notificationEnabled: boolean;
}
export interface ScalingConfig {
    enabled: boolean;
    minResources: number;
    maxResources: number;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
    cooldownPeriod: number;
    metrics: ScalingMetric[];
}
export interface ScalingMetric {
    name: string;
    weight: number;
    threshold: number;
    aggregation: 'avg' | 'max' | 'min' | 'sum';
}
export interface PoolStatistics {
    totalResources: number;
    availableResources: number;
    utilizationRate: number;
    allocationSuccessRate: number;
    averageWaitTime: number;
    throughput: number;
    efficiency: number;
    costPerHour: number;
    qosScore: number;
}
export interface NodeAffinity {
    key: string;
    operator: 'in' | 'notin' | 'exists' | 'notexists';
    values?: string[];
}
export interface AntiAffinity {
    type: 'agent' | 'task' | 'resource';
    scope: 'node' | 'zone' | 'region';
    weight: number;
}
export interface TimeWindow {
    start: Date;
    end: Date;
    timezone?: string;
}
export interface ResourceFilter {
    id: string;
    name: string;
    enabled: boolean;
    conditions: FilterCondition[];
    action: 'include' | 'exclude' | 'prioritize' | 'deprioritize';
}
export interface FilterCondition {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'matches';
    value: any;
}
export type ResourceType = 'compute' | 'storage' | 'network' | 'memory' | 'gpu' | 'custom';
export type ResourceStatus = 'available' | 'allocated' | 'reserved' | 'maintenance' | 'failed' | 'offline';
export type ResourcePriority = 'critical' | 'high' | 'normal' | 'low' | 'background';
export type ReservationStatus = 'pending' | 'confirmed' | 'active' | 'expired' | 'cancelled' | 'failed';
export type AllocationStatus = 'active' | 'completed' | 'failed' | 'terminated' | 'suspended';
export type PoolStrategy = 'round-robin' | 'least-loaded' | 'performance-based' | 'cost-optimized';
export type LoadBalancingStrategy = 'round-robin' | 'weighted' | 'least-connections' | 'resource-based';
export type BillingModel = 'hourly' | 'per-usage' | 'reserved' | 'spot' | 'hybrid';
/**
 * Comprehensive resource management with allocation, monitoring, and optimization
 */
export declare class ResourceManager extends EventEmitter {
    private logger;
    private eventBus;
    private config;
    private resources;
    private pools;
    private reservations;
    private allocations;
    private usageHistory;
    private predictions;
    private optimizer;
    private monitoringInterval?;
    private cleanupInterval?;
    private scalingInterval?;
    private metrics;
    constructor(config: Partial<ResourceManagerConfig>, logger: ILogger, eventBus: IEventBus);
    private setupEventHandlers;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    registerResource(type: ResourceType, name: string, capacity: ResourceLimits, metadata?: Partial<ResourceMetadata>): Promise<string>;
    unregisterResource(resourceId: string): Promise<void>;
    requestResources(agentId: AgentId, requirements: ResourceRequirements, options?: {
        taskId?: TaskId;
        priority?: ResourcePriority;
        timeout?: number;
        preemptible?: boolean;
    }): Promise<string>;
    activateReservation(reservationId: string): Promise<string>;
    releaseResources(allocationId: string, reason?: string): Promise<void>;
    cancelReservation(reservationId: string, reason?: string): Promise<void>;
    createResourcePool(name: string, type: ResourceType, resourceIds: string[], strategy?: PoolStrategy): Promise<string>;
    addResourceToPool(poolId: string, resourceId: string): Promise<void>;
    removeResourceFromPool(poolId: string, resourceId: string): Promise<void>;
    private findSuitableResource;
    private calculateResourceScore;
    private canSatisfyRequirements;
    private checkConstraints;
    private selectResourceByStrategy;
    private calculateWaste;
    private calculateAllocation;
    private startMonitoring;
    private startCleanup;
    private startAutoScaling;
    private performMonitoring;
    private performCleanup;
    private evaluateScaling;
    private canActivateReservation;
    private calculateResourceUtilization;
    private calculateEfficiency;
    private updateResourceAvailability;
    private addToResourceLimits;
    private subtractFromResourceLimits;
    private createEmptyLimits;
    private createEmptyUsage;
    private createDefaultPerformanceMetrics;
    private createDefaultReliabilityMetrics;
    private createDefaultCostMetrics;
    private createPoolStatistics;
    private createDefaultPools;
    private updateResourceUsage;
    private updateResourceStatistics;
    private updatePoolStatistics;
    private checkQoSViolations;
    private checkPoolQoS;
    private updatePredictions;
    private calculatePoolMetrics;
    private shouldScale;
    private scalePoolUp;
    private scalePoolDown;
    private getMetricValue;
    private evaluateQoSCondition;
    private calculateViolationSeverity;
    private remediateQoSViolation;
    private releaseAllAllocations;
    private handleResourceRequest;
    private handleResourceRelease;
    private handleResourceFailure;
    private handleScalingTrigger;
    getResource(resourceId: string): Resource | undefined;
    getAllResources(): Resource[];
    getResourcesByType(type: ResourceType): Resource[];
    getPool(poolId: string): ResourcePool | undefined;
    getAllPools(): ResourcePool[];
    getReservation(reservationId: string): ResourceReservation | undefined;
    getAllReservations(): ResourceReservation[];
    getAllocation(allocationId: string): ResourceAllocation | undefined;
    getAllAllocations(): ResourceAllocation[];
    getResourceUsageHistory(resourceId: string): ResourceUsage[];
    getResourcePrediction(resourceId: string): ResourcePrediction | undefined;
    getManagerStatistics(): {
        resources: number;
        pools: number;
        reservations: number;
        allocations: number;
        utilization: number;
        efficiency: number;
    };
}
interface ResourcePrediction {
    resourceId: string;
    predictions: Array<{
        timestamp: Date;
        predictedUsage: ResourceUsage;
        confidence: number;
    }>;
    trends: {
        cpu: 'increasing' | 'decreasing' | 'stable';
        memory: 'increasing' | 'decreasing' | 'stable';
        disk: 'increasing' | 'decreasing' | 'stable';
    };
    recommendations: string[];
}
export {};
//# sourceMappingURL=resource-manager.d.ts.map