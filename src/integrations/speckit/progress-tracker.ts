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

// ===== TYPES =====

export interface TrackedTask {
  id: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  assignedAgent?: string;
  blockedBy: string[];
  error?: string;
  progress: number; // 0-100
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
  estimatedTimeRemaining: number; // minutes
  estimatedCompletionTime: Date;
  velocity: number; // tasks per hour
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

export type BlockerReason =
  | 'dependency_failed'
  | 'dependency_running'
  | 'no_available_agents'
  | 'resource_constraint'
  | 'external_dependency'
  | 'unknown';

export interface ProgressEvent {
  type: ProgressEventType;
  taskId: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export type ProgressEventType =
  | 'task:started'
  | 'task:completed'
  | 'task:failed'
  | 'task:blocked'
  | 'task:unblocked'
  | 'task:progress'
  | 'milestone:reached'
  | 'velocity:changed'
  | 'health:changed';

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
  velocityWindowSize: number; // number of tasks to consider for velocity
  stallThresholdMinutes: number;
  healthCheckIntervalMs: number;
  emitProgressUpdates: boolean;
}

// ===== PROGRESS TRACKER CLASS =====

export class ProgressTracker extends EventEmitter {
  private tasks: Map<string, TrackedTask> = new Map();
  private history: ProgressEvent[] = [];
  private snapshots: ProgressSnapshot[] = [];
  private milestones: Milestone[] = [];
  private completionTimes: number[] = []; // for velocity calculation
  private lastHealthCheck: Date = new Date();
  private config: TrackerConfig;
  private intervalId?: ReturnType<typeof setInterval>;

  constructor(config: Partial<TrackerConfig> = {}) {
    super();

    this.config = {
      snapshotIntervalMs: config.snapshotIntervalMs ?? 30000, // 30 seconds
      velocityWindowSize: config.velocityWindowSize ?? 10,
      stallThresholdMinutes: config.stallThresholdMinutes ?? 15,
      healthCheckIntervalMs: config.healthCheckIntervalMs ?? 60000, // 1 minute
      emitProgressUpdates: config.emitProgressUpdates ?? true,
    };

    // Set up default milestones
    this.milestones = [
      { id: 'start', name: 'Started', description: 'First task started', targetPercentage: 0, reached: false },
      { id: 'quarter', name: '25% Complete', description: 'Quarter milestone', targetPercentage: 25, reached: false },
      { id: 'half', name: '50% Complete', description: 'Halfway milestone', targetPercentage: 50, reached: false },
      { id: 'three-quarters', name: '75% Complete', description: 'Three-quarters milestone', targetPercentage: 75, reached: false },
      { id: 'complete', name: 'Complete', description: 'All tasks complete', targetPercentage: 100, reached: false },
    ];
  }

  // ===== TASK TRACKING =====

  /**
   * Register a task to be tracked
   */
  registerTask(
    id: string,
    name: string,
    options: {
      priority?: TaskPriority;
      estimatedDuration?: number;
      metadata?: Record<string, unknown>;
    } = {}
  ): void {
    const task: TrackedTask = {
      id,
      name,
      status: 'pending',
      priority: options.priority ?? 'P2',
      estimatedDuration: options.estimatedDuration ?? 30,
      blockedBy: [],
      progress: 0,
      metadata: options.metadata ?? {},
    };

    this.tasks.set(id, task);
    this.recordEvent('task:progress', id, { progress: 0 });
  }

  /**
   * Start tracking a task
   */
  startTask(taskId: string, agentId?: string): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task '${taskId}' not found`);

    task.status = 'in_progress';
    task.startedAt = new Date();
    task.assignedAgent = agentId;
    task.progress = 5; // Starting progress

    this.recordEvent('task:started', taskId, { agentId });
    this.checkMilestones();

    this.emit('task:started', { taskId, task });
  }

  /**
   * Update task progress (0-100)
   */
  updateProgress(taskId: string, progress: number): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const previousProgress = task.progress;
    task.progress = Math.min(100, Math.max(0, progress));

    if (task.progress !== previousProgress) {
      this.recordEvent('task:progress', taskId, {
        previousProgress,
        newProgress: task.progress,
      });

      if (this.config.emitProgressUpdates) {
        this.emit('task:progress', { taskId, progress: task.progress });
      }

      this.checkMilestones();
    }
  }

  /**
   * Mark a task as completed
   */
  completeTask(taskId: string, result?: unknown): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task '${taskId}' not found`);

    task.status = 'completed';
    task.completedAt = new Date();
    task.progress = 100;

    // Calculate actual duration
    if (task.startedAt) {
      task.actualDuration = (task.completedAt.getTime() - task.startedAt.getTime()) / (1000 * 60);
      this.completionTimes.push(task.actualDuration);

      // Keep only recent completions for velocity calculation
      if (this.completionTimes.length > this.config.velocityWindowSize) {
        this.completionTimes.shift();
      }
    }

    task.metadata.result = result;

    this.recordEvent('task:completed', taskId, {
      duration: task.actualDuration,
      result,
    });

    // Unblock dependent tasks
    this.unblockDependentTasks(taskId);
    this.checkMilestones();

    this.emit('task:completed', { taskId, task, result });
  }

  /**
   * Mark a task as failed
   */
  failTask(taskId: string, error: Error | string): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task '${taskId}' not found`);

    task.status = 'failed';
    task.failedAt = new Date();
    task.error = error instanceof Error ? error.message : error;

    // Calculate actual duration
    if (task.startedAt) {
      task.actualDuration = (task.failedAt.getTime() - task.startedAt.getTime()) / (1000 * 60);
    }

    this.recordEvent('task:failed', taskId, {
      error: task.error,
      duration: task.actualDuration,
    });

    this.emit('task:failed', { taskId, task, error: task.error });
  }

  /**
   * Mark a task as blocked
   */
  blockTask(taskId: string, blockedBy: string[], reason: BlockerReason): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'blocked';
    task.blockedBy = blockedBy;

    this.recordEvent('task:blocked', taskId, {
      blockedBy,
      reason,
    });

    this.emit('task:blocked', { taskId, blockedBy, reason });
  }

  /**
   * Unblock tasks that were waiting for the completed task
   */
  private unblockDependentTasks(completedTaskId: string): void {
    for (const [taskId, task] of this.tasks) {
      if (task.blockedBy.includes(completedTaskId)) {
        task.blockedBy = task.blockedBy.filter(id => id !== completedTaskId);

        if (task.blockedBy.length === 0 && task.status === 'blocked') {
          task.status = 'ready';
          this.recordEvent('task:unblocked', taskId, {
            unblockingTask: completedTaskId,
          });
          this.emit('task:unblocked', { taskId, unblockingTask: completedTaskId });
        }
      }
    }
  }

  // ===== PROGRESS CALCULATION =====

  /**
   * Get current progress snapshot
   */
  getProgress(): ProgressSnapshot {
    const tasks = Array.from(this.tasks.values());

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const failedTasks = tasks.filter(t => t.status === 'failed').length;
    const runningTasks = tasks.filter(t => t.status === 'in_progress').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    const pendingTasks = tasks.filter(
      t => t.status === 'pending' || t.status === 'ready'
    ).length;

    const percentComplete = totalTasks > 0
      ? (completedTasks / totalTasks) * 100
      : 0;

    const velocity = this.calculateVelocity();
    const estimatedTimeRemaining = this.calculateEstimatedTimeRemaining(tasks);
    const estimatedCompletionTime = new Date(
      Date.now() + estimatedTimeRemaining * 60 * 1000
    );

    const health = this.assessHealth(tasks, velocity);

    const snapshot: ProgressSnapshot = {
      timestamp: new Date(),
      totalTasks,
      completedTasks,
      failedTasks,
      runningTasks,
      blockedTasks,
      pendingTasks,
      percentComplete,
      estimatedTimeRemaining,
      estimatedCompletionTime,
      velocity,
      health,
    };

    this.snapshots.push(snapshot);

    // Keep only recent snapshots
    if (this.snapshots.length > 100) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  /**
   * Calculate current velocity (tasks per hour)
   */
  private calculateVelocity(): number {
    if (this.completionTimes.length === 0) return 0;

    const avgDuration =
      this.completionTimes.reduce((sum, t) => sum + t, 0) / this.completionTimes.length;

    // Tasks per hour
    return avgDuration > 0 ? 60 / avgDuration : 0;
  }

  /**
   * Calculate estimated time remaining
   */
  private calculateEstimatedTimeRemaining(tasks: TrackedTask[]): number {
    const remaining = tasks.filter(
      t => t.status !== 'completed' && t.status !== 'failed'
    );

    if (remaining.length === 0) return 0;

    // Use actual average duration if we have data
    const avgActualDuration =
      this.completionTimes.length > 0
        ? this.completionTimes.reduce((sum, t) => sum + t, 0) / this.completionTimes.length
        : null;

    // Calculate based on estimated or actual duration
    let totalEstimate = 0;
    for (const task of remaining) {
      if (task.status === 'in_progress' && task.startedAt) {
        // Subtract time already spent
        const elapsed = (Date.now() - task.startedAt.getTime()) / (1000 * 60);
        const remaining = Math.max(0, task.estimatedDuration - elapsed);
        totalEstimate += remaining;
      } else {
        // Use actual average or estimate
        totalEstimate += avgActualDuration ?? task.estimatedDuration;
      }
    }

    // Account for parallelization (rough estimate: divide by number of running tasks)
    const parallelFactor = Math.max(1, tasks.filter(t => t.status === 'in_progress').length);

    return totalEstimate / parallelFactor;
  }

  /**
   * Assess overall progress health
   */
  private assessHealth(tasks: TrackedTask[], velocity: number): ProgressHealth {
    const failedCount = tasks.filter(t => t.status === 'failed').length;
    const blockedCount = tasks.filter(t => t.status === 'blocked').length;
    const runningCount = tasks.filter(t => t.status === 'in_progress').length;
    const totalCount = tasks.length;

    // Critical: high failure rate or everything blocked
    if (failedCount > totalCount * 0.2) return 'critical';
    if (blockedCount > totalCount * 0.5) return 'critical';

    // Stalled: no progress for a while
    if (this.isStalled()) return 'stalled';

    // Warning: moderate issues
    if (failedCount > totalCount * 0.1) return 'warning';
    if (blockedCount > totalCount * 0.3) return 'warning';
    if (velocity === 0 && runningCount > 0) return 'warning';

    return 'healthy';
  }

  /**
   * Check if progress has stalled
   */
  private isStalled(): boolean {
    const recentEvents = this.history.filter(e => {
      const age = Date.now() - e.timestamp.getTime();
      return age < this.config.stallThresholdMinutes * 60 * 1000;
    });

    const completionEvents = recentEvents.filter(
      e => e.type === 'task:completed'
    );

    // Stalled if we have running tasks but no completions recently
    const hasRunningTasks = Array.from(this.tasks.values()).some(
      t => t.status === 'in_progress'
    );

    return hasRunningTasks && completionEvents.length === 0;
  }

  // ===== BLOCKER DETECTION =====

  /**
   * Get all current blockers
   */
  getBlockers(): Blocker[] {
    const blockers: Blocker[] = [];

    for (const task of this.tasks.values()) {
      if (task.status === 'blocked' && task.blockedBy.length > 0) {
        for (const blockerId of task.blockedBy) {
          const blockerTask = this.tasks.get(blockerId);
          if (!blockerTask) continue;

          // Find or create blocker entry
          let blocker = blockers.find(b => b.taskId === blockerId);

          if (!blocker) {
            const reason = this.determineBlockerReason(blockerTask);
            const since = this.getBlockerSince(blockerId);

            blocker = {
              taskId: blockerId,
              taskName: blockerTask.name,
              blockedTasks: [],
              reason,
              since,
              severity: this.calculateBlockerSeverity(task.priority, reason),
            };
            blockers.push(blocker);
          }

          blocker.blockedTasks.push(task.id);
        }
      }
    }

    // Sort by severity and number of blocked tasks
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    blockers.sort((a, b) => {
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.blockedTasks.length - a.blockedTasks.length;
    });

    return blockers;
  }

  /**
   * Determine reason for a blocker
   */
  private determineBlockerReason(blockerTask: TrackedTask): BlockerReason {
    switch (blockerTask.status) {
      case 'failed':
        return 'dependency_failed';
      case 'in_progress':
        return 'dependency_running';
      case 'blocked':
        return 'external_dependency';
      default:
        return 'unknown';
    }
  }

  /**
   * Get when a task became a blocker
   */
  private getBlockerSince(taskId: string): Date {
    const blockedEvent = this.history.find(
      e => e.type === 'task:blocked' &&
           Array.isArray(e.data.blockedBy) &&
           (e.data.blockedBy as string[]).includes(taskId)
    );

    return blockedEvent?.timestamp ?? new Date();
  }

  /**
   * Calculate blocker severity
   */
  private calculateBlockerSeverity(
    blockedPriority: TaskPriority,
    reason: BlockerReason
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (reason === 'dependency_failed') {
      return blockedPriority === 'P1' ? 'critical' : 'high';
    }

    if (blockedPriority === 'P1') return 'high';
    if (blockedPriority === 'P2') return 'medium';
    return 'low';
  }

  // ===== MILESTONES =====

  /**
   * Check and update milestone status
   */
  private checkMilestones(): void {
    const progress = this.getProgress();

    for (const milestone of this.milestones) {
      if (!milestone.reached && progress.percentComplete >= milestone.targetPercentage) {
        milestone.reached = true;
        milestone.reachedAt = new Date();

        this.recordEvent('milestone:reached', milestone.id, {
          name: milestone.name,
          percentComplete: progress.percentComplete,
        });

        this.emit('milestone:reached', { milestone, progress });
      }
    }
  }

  /**
   * Get milestone status
   */
  getMilestones(): Milestone[] {
    return [...this.milestones];
  }

  /**
   * Add a custom milestone
   */
  addMilestone(
    id: string,
    name: string,
    description: string,
    targetPercentage: number
  ): void {
    this.milestones.push({
      id,
      name,
      description,
      targetPercentage,
      reached: false,
    });

    // Sort milestones by target percentage
    this.milestones.sort((a, b) => a.targetPercentage - b.targetPercentage);
  }

  // ===== EVENT RECORDING =====

  /**
   * Record a progress event
   */
  private recordEvent(
    type: ProgressEventType,
    taskId: string,
    data: Record<string, unknown>
  ): void {
    const event: ProgressEvent = {
      type,
      taskId,
      timestamp: new Date(),
      data,
    };

    this.history.push(event);

    // Keep history bounded
    if (this.history.length > 1000) {
      this.history.shift();
    }
  }

  /**
   * Get event history
   */
  getHistory(options: {
    taskId?: string;
    type?: ProgressEventType;
    since?: Date;
    limit?: number;
  } = {}): ProgressEvent[] {
    let events = [...this.history];

    if (options.taskId) {
      events = events.filter(e => e.taskId === options.taskId);
    }

    if (options.type) {
      events = events.filter(e => e.type === options.type);
    }

    if (options.since) {
      events = events.filter(e => e.timestamp >= options.since!);
    }

    if (options.limit) {
      events = events.slice(-options.limit);
    }

    return events;
  }

  // ===== REPORTING =====

  /**
   * Generate a progress report
   */
  generateReport(): {
    summary: ProgressSnapshot;
    milestones: Milestone[];
    blockers: Blocker[];
    taskBreakdown: Record<TaskStatus, number>;
    priorityBreakdown: Record<TaskPriority, { total: number; completed: number }>;
    estimations: {
      optimistic: number;
      realistic: number;
      pessimistic: number;
    };
    recommendations: string[];
  } {
    const summary = this.getProgress();
    const milestones = this.getMilestones();
    const blockers = this.getBlockers();
    const tasks = Array.from(this.tasks.values());

    // Task status breakdown
    const taskBreakdown: Record<TaskStatus, number> = {
      pending: 0,
      ready: 0,
      assigned: 0,
      in_progress: 0,
      completed: 0,
      failed: 0,
      blocked: 0,
      cancelled: 0,
    };

    for (const task of tasks) {
      taskBreakdown[task.status]++;
    }

    // Priority breakdown
    const priorityBreakdown: Record<TaskPriority, { total: number; completed: number }> = {
      P1: { total: 0, completed: 0 },
      P2: { total: 0, completed: 0 },
      P3: { total: 0, completed: 0 },
    };

    for (const task of tasks) {
      priorityBreakdown[task.priority].total++;
      if (task.status === 'completed') {
        priorityBreakdown[task.priority].completed++;
      }
    }

    // Calculate estimations
    const remainingTasks = tasks.filter(
      t => t.status !== 'completed' && t.status !== 'failed'
    );
    const avgDuration = this.completionTimes.length > 0
      ? this.completionTimes.reduce((sum, t) => sum + t, 0) / this.completionTimes.length
      : 30;

    const totalRemaining = remainingTasks.reduce(
      (sum, t) => sum + t.estimatedDuration,
      0
    );

    const estimations = {
      optimistic: totalRemaining * 0.7,
      realistic: totalRemaining,
      pessimistic: totalRemaining * 1.5,
    };

    // Generate recommendations
    const recommendations: string[] = [];

    if (blockers.length > 0) {
      recommendations.push(
        `Address ${blockers.length} blocker(s) to unblock ${blockers.reduce((sum, b) => sum + b.blockedTasks.length, 0)} task(s).`
      );
    }

    if (summary.health === 'critical') {
      recommendations.push('CRITICAL: Significant issues detected. Immediate attention required.');
    } else if (summary.health === 'stalled') {
      recommendations.push('Progress has stalled. Check for blocked tasks or resource issues.');
    }

    if (taskBreakdown.failed > 0) {
      recommendations.push(
        `${taskBreakdown.failed} task(s) have failed. Review and retry or reassign.`
      );
    }

    const p1Incomplete = priorityBreakdown.P1.total - priorityBreakdown.P1.completed;
    if (p1Incomplete > 0) {
      recommendations.push(
        `${p1Incomplete} P1 (critical) task(s) still pending. Prioritize these first.`
      );
    }

    if (summary.velocity < 1) {
      recommendations.push(
        'Low velocity detected. Consider adding more agents or reducing task complexity.'
      );
    }

    return {
      summary,
      milestones,
      blockers,
      taskBreakdown,
      priorityBreakdown,
      estimations,
      recommendations,
    };
  }

  // ===== LIFECYCLE =====

  /**
   * Start automatic snapshot collection
   */
  startAutoTracking(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.getProgress();
    }, this.config.snapshotIntervalMs);
  }

  /**
   * Stop automatic snapshot collection
   */
  stopAutoTracking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * Get a specific tracked task
   */
  getTask(taskId: string): TrackedTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tracked tasks
   */
  getAllTasks(): TrackedTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get historical snapshots
   */
  getSnapshots(count?: number): ProgressSnapshot[] {
    if (count) {
      return this.snapshots.slice(-count);
    }
    return [...this.snapshots];
  }

  /**
   * Reset all tracking data
   */
  reset(): void {
    this.stopAutoTracking();
    this.tasks.clear();
    this.history = [];
    this.snapshots = [];
    this.completionTimes = [];

    // Reset milestones
    for (const milestone of this.milestones) {
      milestone.reached = false;
      milestone.reachedAt = undefined;
    }

    this.emit('tracker:reset', {});
  }
}

export default ProgressTracker;
