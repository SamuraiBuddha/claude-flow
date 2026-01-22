/**
 * Progress Tracker - Real-time task execution monitoring and progress reporting
 *
 * Responsibilities:
 * - Real-time task status updates
 * - Progress calculation and estimation
 * - Blocker identification
 * - Event emission for status changes
 * - Completion percentage and ETA calculation
 */
import { EventEmitter } from 'node:events';
import type { TaskPriority } from './dependency-graph.js';
import type { TaskStatus } from './task-orchestrator.js';
export interface TrackedTask {
    id: string;
    name: string;
    status: TaskStatus;
    priority: TaskPriority;
    estimatedDuration: number;
    actualDuration?: number;
    startedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    assignedAgent?: string;
    blockedBy: string[];
    error?: string;
    progress: number;
    metadata: Record<string, unknown>;
}
export interface ProgressSnapshot {
    timestamp: Date;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    runningTasks: number;
    blockedTasks: number;
    pendingTasks: number;
    percentComplete: number;
    estimatedTimeRemaining: number;
    estimatedCompletionTime: Date;
    velocity: number;
    health: ProgressHealth;
}
export type ProgressHealth = 'healthy' | 'warning' | 'critical' | 'stalled';
export interface Blocker {
    taskId: string;
    taskName: string;
    blockedTasks: string[];
    reason: BlockerReason;
    since: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export type BlockerReason = 'dependency_failed' | 'dependency_running' | 'no_available_agents' | 'resource_constraint' | 'external_dependency' | 'unknown';
export interface ProgressEvent {
    type: ProgressEventType;
    taskId: string;
    timestamp: Date;
    data: Record<string, unknown>;
}
export type ProgressEventType = 'task:started' | 'task:completed' | 'task:failed' | 'task:blocked' | 'task:unblocked' | 'task:progress' | 'milestone:reached' | 'velocity:changed' | 'health:changed';
export interface Milestone {
    id: string;
    name: string;
    description: string;
    targetPercentage: number;
    reached: boolean;
    reachedAt?: Date;
}
export interface TrackerConfig {
    snapshotIntervalMs: number;
    velocityWindowSize: number;
    stallThresholdMinutes: number;
    healthCheckIntervalMs: number;
    emitProgressUpdates: boolean;
}
export declare class ProgressTracker extends EventEmitter {
    private tasks;
    private history;
    private snapshots;
    private milestones;
    private completionTimes;
    private lastHealthCheck;
    private config;
    private intervalId?;
    constructor(config?: Partial<TrackerConfig>);
    /**
     * Register a task to be tracked
     */
    registerTask(id: string, name: string, options?: {
        priority?: TaskPriority;
        estimatedDuration?: number;
        metadata?: Record<string, unknown>;
    }): void;
    /**
     * Start tracking a task
     */
    startTask(taskId: string, agentId?: string): void;
    /**
     * Update task progress (0-100)
     */
    updateProgress(taskId: string, progress: number): void;
    /**
     * Mark a task as completed
     */
    completeTask(taskId: string, result?: unknown): void;
    /**
     * Mark a task as failed
     */
    failTask(taskId: string, error: Error | string): void;
    /**
     * Mark a task as blocked
     */
    blockTask(taskId: string, blockedBy: string[], reason: BlockerReason): void;
    /**
     * Unblock tasks that were waiting for the completed task
     */
    private unblockDependentTasks;
    /**
     * Get current progress snapshot
     */
    getProgress(): ProgressSnapshot;
    /**
     * Calculate current velocity (tasks per hour)
     */
    private calculateVelocity;
    /**
     * Calculate estimated time remaining
     */
    private calculateEstimatedTimeRemaining;
    /**
     * Assess overall progress health
     */
    private assessHealth;
    /**
     * Check if progress has stalled
     */
    private isStalled;
    /**
     * Get all current blockers
     */
    getBlockers(): Blocker[];
    /**
     * Determine reason for a blocker
     */
    private determineBlockerReason;
    /**
     * Get when a task became a blocker
     */
    private getBlockerSince;
    /**
     * Calculate blocker severity
     */
    private calculateBlockerSeverity;
    /**
     * Check and update milestone status
     */
    private checkMilestones;
    /**
     * Get milestone status
     */
    getMilestones(): Milestone[];
    /**
     * Add a custom milestone
     */
    addMilestone(id: string, name: string, description: string, targetPercentage: number): void;
    /**
     * Record a progress event
     */
    private recordEvent;
    /**
     * Get event history
     */
    getHistory(options?: {
        taskId?: string;
        type?: ProgressEventType;
        since?: Date;
        limit?: number;
    }): ProgressEvent[];
    /**
     * Generate a progress report
     */
    generateReport(): {
        summary: ProgressSnapshot;
        milestones: Milestone[];
        blockers: Blocker[];
        taskBreakdown: Record<TaskStatus, number>;
        priorityBreakdown: Record<TaskPriority, {
            total: number;
            completed: number;
        }>;
        estimations: {
            optimistic: number;
            realistic: number;
            pessimistic: number;
        };
        recommendations: string[];
    };
    /**
     * Start automatic snapshot collection
     */
    startAutoTracking(): void;
    /**
     * Stop automatic snapshot collection
     */
    stopAutoTracking(): void;
    /**
     * Get a specific tracked task
     */
    getTask(taskId: string): TrackedTask | undefined;
    /**
     * Get all tracked tasks
     */
    getAllTasks(): TrackedTask[];
    /**
     * Get historical snapshots
     */
    getSnapshots(count?: number): ProgressSnapshot[];
    /**
     * Reset all tracking data
     */
    reset(): void;
}
export default ProgressTracker;
//# sourceMappingURL=progress-tracker.d.ts.map