/**
 * Advanced load balancing and work stealing implementation
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../core/logger.js';
import type { IEventBus } from '../core/event-bus.js';
import type { AgentId, AgentState, TaskDefinition, TaskId, LoadBalancingStrategy } from '../swarm/types.js';
export interface LoadBalancerConfig {
    strategy: LoadBalancingStrategy;
    enableWorkStealing: boolean;
    stealThreshold: number;
    maxStealBatch: number;
    rebalanceInterval: number;
    loadSamplingInterval: number;
    affinityWeight: number;
    performanceWeight: number;
    loadWeight: number;
    latencyWeight: number;
    queueDepthThreshold: number;
    adaptiveThresholds: boolean;
    predictiveEnabled: boolean;
    debugMode: boolean;
}
export interface AgentLoad {
    agentId: string;
    queueDepth: number;
    cpuUsage: number;
    memoryUsage: number;
    taskCount: number;
    averageResponseTime: number;
    throughput: number;
    lastUpdated: Date;
    capacity: number;
    utilization: number;
    efficiency: number;
    affinityScore: number;
}
export interface LoadBalancingDecision {
    selectedAgent: AgentId;
    reason: string;
    confidence: number;
    alternatives: Array<{
        agent: AgentId;
        score: number;
        reason: string;
    }>;
    loadBefore: Record<string, number>;
    predictedLoadAfter: Record<string, number>;
    timestamp: Date;
}
export interface WorkStealingOperation {
    id: string;
    sourceAgent: AgentId;
    targetAgent: AgentId;
    tasks: TaskId[];
    reason: string;
    status: 'planned' | 'executing' | 'completed' | 'failed';
    startTime: Date;
    endTime?: Date;
    metrics: {
        tasksStolen: number;
        loadReduction: number;
        latencyImprovement: number;
    };
}
export interface LoadPrediction {
    agentId: string;
    currentLoad: number;
    predictedLoad: number;
    confidence: number;
    timeHorizon: number;
    factors: Record<string, number>;
}
/**
 * Advanced load balancing system with work stealing and predictive capabilities
 */
export declare class LoadBalancer extends EventEmitter {
    private logger;
    private eventBus;
    private config;
    private workStealer;
    private agentLoads;
    private loadHistory;
    private taskQueues;
    private loadSamplingInterval?;
    private rebalanceInterval?;
    private decisions;
    private stealOperations;
    private loadPredictors;
    private performanceBaselines;
    constructor(config: Partial<LoadBalancerConfig>, logger: ILogger, eventBus: IEventBus);
    private setupEventHandlers;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    selectAgent(task: TaskDefinition, availableAgents: AgentState[], constraints?: {
        excludeAgents?: AgentId[];
        preferredAgents?: AgentId[];
        maxLoad?: number;
        requireCapabilities?: string[];
    }): Promise<LoadBalancingDecision>;
    private filterAgentsByConstraints;
    private applySelectionStrategy;
    private calculateLoadScore;
    private calculatePerformanceScore;
    private calculateCapabilityScore;
    private calculateAffinityScore;
    private calculateCostScore;
    private calculateHybridScore;
    private calculatePredictiveScore;
    private executeWorkStealing;
    private startLoadSampling;
    private startRebalancing;
    private sampleAgentLoads;
    private performRebalancing;
    private predictLoad;
    private updateLoadPredictor;
    private isAgentCompatible;
    private checkTypeCompatibility;
    private updateAgentLoad;
    private updateTaskQueue;
    private updatePerformanceBaseline;
    private calculateUtilization;
    private calculateLoadReduction;
    private createDefaultLoad;
    getAgentLoad(agentId: string): AgentLoad | undefined;
    getAllLoads(): AgentLoad[];
    getRecentDecisions(limit?: number): LoadBalancingDecision[];
    getStealOperations(): WorkStealingOperation[];
    getLoadStatistics(): {
        totalAgents: number;
        averageUtilization: number;
        overloadedAgents: number;
        underloadedAgents: number;
        totalStealOperations: number;
        successfulSteals: number;
    };
    forceRebalance(): Promise<void>;
}
//# sourceMappingURL=load-balancer.d.ts.map