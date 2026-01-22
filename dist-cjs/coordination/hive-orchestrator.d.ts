/**
 * Hive Mind Orchestrator - Advanced task coordination with consensus
 */
import { EventEmitter } from 'events';
export interface HiveTask {
    id: string;
    type: 'analysis' | 'design' | 'implementation' | 'testing' | 'documentation' | 'research';
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    dependencies: string[];
    assignedTo?: string;
    status: 'pending' | 'voting' | 'assigned' | 'executing' | 'reviewing' | 'completed' | 'failed';
    votes: Map<string, {
        approve: boolean;
        confidence: number;
    }>;
    result?: any;
    metrics?: {
        startTime: number;
        endTime?: number;
        attempts: number;
        quality?: number;
    };
}
export interface HiveDecision {
    id: string;
    type: 'task_assignment' | 'quality_check' | 'architecture' | 'consensus';
    proposal: any;
    votes: Map<string, boolean>;
    result: 'approved' | 'rejected' | 'pending';
    timestamp: number;
}
export declare class HiveOrchestrator extends EventEmitter {
    private tasks;
    private decisions;
    private agentCapabilities;
    private consensusThreshold;
    private topology;
    constructor(options?: {
        consensusThreshold?: number;
        topology?: 'hierarchical' | 'mesh' | 'ring' | 'star';
    });
    /**
     * Register agent capabilities for task matching
     */
    registerAgentCapabilities(agentId: string, capabilities: string[]): void;
    /**
     * Decompose objective into coordinated tasks
     */
    decomposeObjective(objective: string): Promise<HiveTask[]>;
    /**
     * Create a new task
     */
    private createTask;
    /**
     * Apply topology-specific task ordering
     */
    private applyTopologyOrdering;
    /**
     * Propose task assignment with voting
     */
    proposeTaskAssignment(taskId: string, agentId: string): Promise<HiveDecision>;
    /**
     * Submit vote for a decision
     */
    submitVote(decisionId: string, agentId: string, vote: boolean): void;
    /**
     * Evaluate decision based on votes
     */
    private evaluateDecision;
    /**
     * Get optimal agent for task based on capabilities
     */
    getOptimalAgent(taskId: string): string | null;
    /**
     * Calculate how well agent capabilities match task
     */
    private calculateAgentTaskScore;
    /**
     * Update task status
     */
    updateTaskStatus(taskId: string, status: HiveTask['status'], result?: any): void;
    /**
     * Check and update dependent tasks
     */
    private checkDependentTasks;
    /**
     * Calculate swarm performance metrics
     */
    getPerformanceMetrics(): {
        totalTasks: number;
        completedTasks: number;
        failedTasks: number;
        pendingTasks: number;
        executingTasks: number;
        avgExecutionTime: number;
        totalDecisions: number;
        approvedDecisions: number;
        consensusRate: number;
        topology: string;
    };
    /**
     * Get task dependency graph
     */
    getTaskGraph(): {
        nodes: {
            id: string;
            type: "research" | "analysis" | "testing" | "documentation" | "implementation" | "design";
            status: "pending" | "assigned" | "completed" | "failed" | "executing" | "voting" | "reviewing";
            assignedTo: string | undefined;
        }[];
        edges: {
            from: string;
            to: string;
        }[];
    };
}
//# sourceMappingURL=hive-orchestrator.d.ts.map