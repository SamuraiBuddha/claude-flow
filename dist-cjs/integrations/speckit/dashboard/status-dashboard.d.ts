/**
 * Status Dashboard for SpecKit Integration
 * Provides real-time view of specs, plans, tasks, and agents
 */
import { EventEmitter } from 'node:events';
export type OutputFormat = 'json' | 'table' | 'html';
export interface SpecStatus {
    id: string;
    name: string;
    version: string;
    status: 'draft' | 'review' | 'approved' | 'implemented' | 'deprecated';
    author: string;
    createdAt: Date;
    updatedAt: Date;
    completeness: number;
    validationErrors: string[];
    dependencies: string[];
}
export interface PlanStatus {
    id: string;
    specId: string;
    name: string;
    status: 'planning' | 'ready' | 'in_progress' | 'completed' | 'blocked';
    tasksTotal: number;
    tasksCompleted: number;
    tasksFailed: number;
    estimatedDuration: number;
    actualDuration?: number;
    assignedAgents: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface TaskStatus {
    id: string;
    planId: string;
    name: string;
    description: string;
    status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'blocked';
    priority: 'critical' | 'high' | 'normal' | 'low';
    assignedAgent?: string;
    dependencies: string[];
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
}
export interface AgentActivity {
    id: string;
    name: string;
    type: string;
    status: 'idle' | 'busy' | 'paused' | 'error' | 'offline';
    currentTask?: string;
    tasksCompleted: number;
    tasksFailed: number;
    uptime: number;
    lastActivity: Date;
    health: number;
}
export interface SystemOverview {
    timestamp: Date;
    uptime: number;
    specs: {
        total: number;
        draft: number;
        approved: number;
        implemented: number;
    };
    plans: {
        total: number;
        active: number;
        completed: number;
        blocked: number;
    };
    tasks: {
        total: number;
        pending: number;
        running: number;
        completed: number;
        failed: number;
    };
    agents: {
        total: number;
        idle: number;
        busy: number;
        error: number;
    };
    health: 'healthy' | 'degraded' | 'unhealthy';
    warnings: string[];
    errors: string[];
}
export interface DashboardConfig {
    refreshInterval: number;
    maxHistoryEntries: number;
    showWarnings: boolean;
    showErrors: boolean;
    compactMode: boolean;
}
export declare class StatusDashboard extends EventEmitter {
    private config;
    private specs;
    private plans;
    private tasks;
    private agents;
    private startTime;
    private refreshTimer?;
    private history;
    constructor(config?: Partial<DashboardConfig>);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    registerSpec(spec: SpecStatus): void;
    updateSpec(specId: string, updates: Partial<SpecStatus>): void;
    removeSpec(specId: string): void;
    registerPlan(plan: PlanStatus): void;
    updatePlan(planId: string, updates: Partial<PlanStatus>): void;
    removePlan(planId: string): void;
    registerTask(task: TaskStatus): void;
    updateTask(taskId: string, updates: Partial<TaskStatus>): void;
    removeTask(taskId: string): void;
    registerAgent(agent: AgentActivity): void;
    updateAgent(agentId: string, updates: Partial<AgentActivity>): void;
    removeAgent(agentId: string): void;
    getOverview(): SystemOverview;
    getSpecStatus(specId?: string): SpecStatus | SpecStatus[] | null;
    getPlanStatus(planId?: string): PlanStatus | PlanStatus[] | null;
    getTaskStatus(taskId?: string): TaskStatus | TaskStatus[] | null;
    getAgentActivity(agentId?: string): AgentActivity | AgentActivity[] | null;
    getHistory(): SystemOverview[];
    render(format?: OutputFormat): string;
    private renderJSON;
    private renderTable;
    private renderHTML;
    startAutoRefresh(callback?: (overview: SystemOverview) => void): void;
    stopAutoRefresh(): void;
    private formatDuration;
    clearAll(): void;
    importState(state: {
        specs?: SpecStatus[];
        plans?: PlanStatus[];
        tasks?: TaskStatus[];
        agents?: AgentActivity[];
    }): void;
    exportState(): {
        specs: SpecStatus[];
        plans: PlanStatus[];
        tasks: TaskStatus[];
        agents: AgentActivity[];
        overview: SystemOverview;
    };
}
export default StatusDashboard;
//# sourceMappingURL=status-dashboard.d.ts.map