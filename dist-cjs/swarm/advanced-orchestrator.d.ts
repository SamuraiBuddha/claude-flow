/**
 * Advanced Swarm Orchestration Engine
 *
 * This is the core orchestration engine that manages swarm lifecycle,
 * agent coordination, task distribution, and result aggregation.
 * It integrates with existing MCP tools and provides production-ready
 * swarm collaboration capabilities.
 */
import { EventEmitter } from 'node:events';
import { AdvancedTaskScheduler } from '../coordination/advanced-scheduler.js';
import { SwarmMonitor } from '../coordination/swarm-monitor.js';
import { MemoryManager } from '../memory/manager.js';
import TaskExecutor from './executor.js';
import { SwarmConfig, SwarmObjective, SwarmAgent, SwarmTask, SwarmId, SwarmMetrics } from './types.js';
export interface AdvancedSwarmConfig extends SwarmConfig {
    autoScaling: boolean;
    loadBalancing: boolean;
    faultTolerance: boolean;
    realTimeMonitoring: boolean;
    maxConcurrentTasks: number;
    maxRetries: number;
    maxThroughput: number;
    latencyTarget: number;
    reliabilityTarget: number;
    mcpIntegration: boolean;
    hiveIntegration: boolean;
    claudeCodeIntegration: boolean;
    neuralProcessing: boolean;
    learningEnabled: boolean;
    adaptiveScheduling: boolean;
}
export interface SwarmExecutionContext {
    swarmId: SwarmId;
    objective: SwarmObjective;
    agents: Map<string, SwarmAgent>;
    tasks: Map<string, SwarmTask>;
    scheduler: AdvancedTaskScheduler;
    monitor: SwarmMonitor;
    memoryManager: MemoryManager;
    taskExecutor: TaskExecutor;
    startTime: Date;
    endTime?: Date;
    metrics: SwarmMetrics;
}
export interface SwarmDeploymentOptions {
    environment: 'development' | 'staging' | 'production';
    region?: string;
    resourceLimits?: {
        maxAgents: number;
        maxMemory: number;
        maxCpu: number;
        maxDisk: number;
    };
    networking?: {
        allowedPorts: number[];
        firewallRules: string[];
    };
    security?: {
        encryption: boolean;
        authentication: boolean;
        auditing: boolean;
    };
}
export declare class AdvancedSwarmOrchestrator extends EventEmitter {
    private logger;
    private config;
    private activeSwarms;
    private globalMetrics;
    private coordinator;
    private memoryManager;
    private isRunning;
    private healthCheckInterval?;
    private metricsCollectionInterval?;
    constructor(config?: Partial<AdvancedSwarmConfig>);
    /**
     * Initialize the orchestrator and all subsystems
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the orchestrator gracefully
     */
    shutdown(): Promise<void>;
    /**
     * Create and initialize a new swarm for a given objective
     */
    createSwarm(objective: string, strategy?: SwarmObjective['strategy'], options?: Partial<SwarmDeploymentOptions>): Promise<string>;
    /**
     * Start executing a swarm with automatic task decomposition and agent spawning
     */
    startSwarm(swarmId: string): Promise<void>;
    /**
     * Stop a running swarm gracefully
     */
    stopSwarm(swarmId: string, reason?: string): Promise<void>;
    /**
     * Get comprehensive status of a swarm
     */
    getSwarmStatus(swarmId: string): SwarmExecutionContext | null;
    /**
     * Get status of all active swarms
     */
    getAllSwarmStatuses(): SwarmExecutionContext[];
    /**
     * Get comprehensive orchestrator metrics
     */
    getOrchestratorMetrics(): {
        global: SwarmMetrics;
        swarms: Record<string, SwarmMetrics>;
        system: {
            activeSwarms: number;
            totalAgents: number;
            totalTasks: number;
            uptime: number;
            memoryUsage: number;
            cpuUsage: number;
        };
    };
    /**
     * Perform comprehensive health check
     */
    performHealthCheck(): Promise<{
        healthy: boolean;
        issues: string[];
        metrics: any;
        timestamp: Date;
    }>;
    private decomposeObjective;
    private createTaskDefinition;
    private spawnRequiredAgents;
    private scheduleAndExecuteTasks;
    private monitorSwarmExecution;
    private updateSwarmProgress;
    private isSwarmComplete;
    private shouldFailSwarm;
    private completeSwarm;
    private failSwarm;
    private collectSwarmResults;
    private storeFinalResults;
    private terminateAgent;
    private getRequiredAgentTypes;
    private getAgentCapabilities;
    private estimateCompletion;
    private calculateTimeRemaining;
    private calculateAverageQuality;
    private getPriorityNumber;
    private startHealthChecks;
    private startMetricsCollection;
    private updateGlobalMetrics;
    private calculateGlobalThroughput;
    private calculateGlobalLatency;
    private calculateGlobalEfficiency;
    private calculateGlobalReliability;
    private calculateGlobalQuality;
    private calculateGlobalDefectRate;
    private calculateGlobalReworkRate;
    private calculateGlobalResourceUtilization;
    private calculateGlobalCostEfficiency;
    private calculateGlobalAgentUtilization;
    private calculateGlobalScheduleVariance;
    private calculateGlobalDeadlineAdherence;
    private initializeProgress;
    private initializeMetrics;
    private createDefaultConfig;
    private setupEventHandlers;
}
export default AdvancedSwarmOrchestrator;
//# sourceMappingURL=advanced-orchestrator.d.ts.map