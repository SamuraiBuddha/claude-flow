/**
 * Hive Mind Monitoring Dashboard
 * Real-time visualization of swarm activity and consensus
 */
import { HiveOrchestrator } from '../coordination/hive-orchestrator.js';
import { HiveCommunicationProtocol } from '../coordination/hive-protocol.js';
export interface HiveDashboardData {
    swarmId: string;
    status: 'initializing' | 'active' | 'voting' | 'executing' | 'completed';
    agents: AgentStatus[];
    tasks: TaskProgress[];
    consensus: ConsensusMetrics;
    communication: CommunicationStats;
    performance: PerformanceMetrics;
    timestamp: number;
}
export interface AgentStatus {
    id: string;
    name: string;
    type: string;
    status: 'idle' | 'thinking' | 'voting' | 'executing' | 'communicating';
    currentTask?: string;
    workload: number;
    votes: number;
    contributions: number;
}
export interface TaskProgress {
    id: string;
    type: string;
    description: string;
    status: string;
    assignedTo?: string;
    progress: number;
    dependencies: string[];
    votes?: {
        approve: number;
        reject: number;
    };
}
export interface ConsensusMetrics {
    totalDecisions: number;
    approvedDecisions: number;
    rejectedDecisions: number;
    averageConsensus: number;
    currentVotes: VoteStatus[];
}
export interface VoteStatus {
    topic: string;
    votes: {
        for: number;
        against: number;
        pending: number;
    };
    deadline?: number;
}
export interface CommunicationStats {
    totalMessages: number;
    messageRate: number;
    channelActivity: Map<string, number>;
    knowledgeShared: number;
}
export interface PerformanceMetrics {
    tasksCompleted: number;
    tasksPending: number;
    avgExecutionTime: number;
    successRate: number;
    qualityScore: number;
}
export declare class HiveDashboard {
    private orchestrator;
    private protocol;
    private refreshInterval;
    private updateCallback?;
    constructor(orchestrator: HiveOrchestrator, protocol: HiveCommunicationProtocol);
    /**
     * Start monitoring with callback for updates
     */
    startMonitoring(callback: (data: HiveDashboardData) => void): () => void;
    /**
     * Get current dashboard data
     */
    private update;
    /**
     * Collect all dashboard data
     */
    private collectDashboardData;
    /**
     * Determine overall swarm status
     */
    private determineSwarmStatus;
    /**
     * Get status of all agents
     */
    private getAgentStatuses;
    /**
     * Get task progress information
     */
    private getTaskProgress;
    /**
     * Calculate task progress based on status
     */
    private calculateTaskProgress;
    /**
     * Get consensus metrics
     */
    private getConsensusMetrics;
    /**
     * Get communication statistics
     */
    private getCommunicationStats;
    /**
     * Get performance metrics
     */
    private getPerformanceMetrics;
    /**
     * Format dashboard for console output
     */
    static formatConsoleOutput(data: HiveDashboardData): string;
    /**
     * Get status icon for agent
     */
    private static getStatusIcon;
    /**
     * Get status icon for task
     */
    private static getTaskStatusIcon;
    /**
     * Create ASCII progress bar
     */
    private static createProgressBar;
    /**
     * Export dashboard data as JSON
     */
    exportData(): string;
    /**
     * Get real-time event stream
     */
    getEventStream(): AsyncGenerator<any>;
}
//# sourceMappingURL=hive-dashboard.d.ts.map