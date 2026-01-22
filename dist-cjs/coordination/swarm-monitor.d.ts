import { EventEmitter } from 'node:events';
interface AgentMetrics {
    id: string;
    name: string;
    status: 'idle' | 'running' | 'completed' | 'failed' | 'stalled';
    currentTask?: string;
    startTime?: number;
    endTime?: number;
    duration?: number;
    cpuUsage?: number;
    memoryUsage?: number;
    taskCount: number;
    successCount: number;
    failureCount: number;
    averageTaskDuration: number;
    lastActivity: number;
    outputSize?: number;
    errorRate: number;
}
interface SystemMetrics {
    timestamp: number;
    cpuUsage: number;
    memoryUsage: number;
    totalMemory: number;
    freeMemory: number;
    loadAverage: number[];
    activeAgents: number;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    pendingTasks: number;
    averageTaskDuration: number;
    throughput: number;
}
interface Alert {
    id: string;
    timestamp: number;
    level: 'info' | 'warning' | 'error' | 'critical';
    type: 'agent_failure' | 'high_cpu' | 'high_memory' | 'stalled_agent' | 'low_throughput' | 'error_rate';
    message: string;
    details?: any;
}
interface MonitoringConfig {
    updateInterval: number;
    metricsRetention: number;
    cpuThreshold: number;
    memoryThreshold: number;
    stallTimeout: number;
    errorRateThreshold: number;
    throughputThreshold: number;
    enableAlerts: boolean;
    enableHistory: boolean;
    historyPath?: string;
}
export declare class SwarmMonitor extends EventEmitter {
    private logger;
    private config;
    private agentMetrics;
    private systemMetrics;
    private alerts;
    private monitoringInterval?;
    private startTime;
    private taskStartTimes;
    private taskCompletionTimes;
    private lastThroughputCheck;
    private tasksInLastMinute;
    constructor(config?: Partial<MonitoringConfig>);
    start(): Promise<void>;
    stop(): void;
    registerAgent(agentId: string, name: string): void;
    unregisterAgent(agentId: string): void;
    taskStarted(agentId: string, taskId: string, taskDescription?: string): void;
    taskCompleted(agentId: string, taskId: string, outputSize?: number): void;
    taskFailed(agentId: string, taskId: string, error: string): void;
    private collectMetrics;
    private getCPUUsage;
    private getMemoryInfo;
    private checkThresholds;
    private createAlert;
    private cleanOldMetrics;
    private saveHistory;
    getSystemMetrics(): SystemMetrics | undefined;
    getAgentMetrics(agentId?: string): AgentMetrics | AgentMetrics[] | undefined;
    getAlerts(since?: number): Alert[];
    getHistoricalMetrics(hours?: number): SystemMetrics[];
    getSummary(): {
        uptime: number;
        totalAgents: number;
        activeAgents: number;
        totalTasks: number;
        completedTasks: number;
        failedTasks: number;
        successRate: number;
        averageDuration: number;
        currentThroughput: number;
        alerts: number;
    };
    exportMetrics(filepath: string): Promise<void>;
}
export type { AgentMetrics, SystemMetrics, Alert, MonitoringConfig };
//# sourceMappingURL=swarm-monitor.d.ts.map