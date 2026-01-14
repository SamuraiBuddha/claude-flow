/**
 * Task Orchestrator - Parse tasks.md and orchestrate multi-agent task execution
 *
 * Responsibilities:
 * - Parse spec-kit tasks.md format into structured task data
 * - Build dependency DAG from parsed tasks
 * - Identify parallelizable task sets
 * - Coordinate agent assignment and track progress
 * - Critical path analysis and bottleneck detection
 */

import { EventEmitter } from 'node:events';
import { DependencyGraph, type GraphNode, type TaskPriority, type CriticalPathResult, type ParallelBatch } from './dependency-graph.js';
import type { AgentType } from '../../swarm/types.js';

// ===== TYPES =====

export interface ParsedTask {
  id: string;
  name: string;
  description: string;
  priority: TaskPriority;
  estimatedDuration: number;
  dependencies: string[];
  parallelizable: boolean;
  agentType: AgentType | null;
  tags: string[];
  status: TaskStatus;
  section: string;
  metadata: Record<string, unknown>;
}

export type TaskStatus =
  | 'pending'
  | 'ready'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'cancelled';

export interface TaskSection {
  name: string;
  tasks: ParsedTask[];
  subsections: TaskSection[];
}

export interface OrchestratorConfig {
  maxParallelTasks: number;
  defaultEstimatedDuration: number;
  priorityWeights: Record<TaskPriority, number>;
  enableCriticalPathOptimization: boolean;
  autoAssignAgents: boolean;
}

export interface OrchestratorState {
  pendingTasks: Set<string>;
  readyTasks: Set<string>;
  runningTasks: Set<string>;
  completedTasks: Set<string>;
  failedTasks: Set<string>;
  blockedTasks: Set<string>;
}

export interface TaskAssignment {
  taskId: string;
  agentId: string;
  agentType: AgentType;
  assignedAt: Date;
  estimatedCompletion: Date;
}

// ===== TASK ORCHESTRATOR CLASS =====

export class TaskOrchestrator extends EventEmitter {
  private graph: DependencyGraph;
  private tasks: Map<string, ParsedTask> = new Map();
  private assignments: Map<string, TaskAssignment> = new Map();
  private state: OrchestratorState;
  private config: OrchestratorConfig;
  private sections: TaskSection[] = [];

  constructor(config: Partial<OrchestratorConfig> = {}) {
    super();

    this.config = {
      maxParallelTasks: config.maxParallelTasks ?? 8,
      defaultEstimatedDuration: config.defaultEstimatedDuration ?? 30,
      priorityWeights: config.priorityWeights ?? { P1: 3, P2: 2, P3: 1 },
      enableCriticalPathOptimization: config.enableCriticalPathOptimization ?? true,
      autoAssignAgents: config.autoAssignAgents ?? true,
    };

    this.graph = new DependencyGraph();
    this.state = {
      pendingTasks: new Set(),
      readyTasks: new Set(),
      runningTasks: new Set(),
      completedTasks: new Set(),
      failedTasks: new Set(),
      blockedTasks: new Set(),
    };

    // Forward graph events
    this.graph.on('node:added', (data) => this.emit('task:added', data));
    this.graph.on('edge:added', (data) => this.emit('dependency:added', data));
  }

  // ===== TASKS.MD PARSING =====

  /**
   * Parse a tasks.md file content and build the dependency graph
   */
  parseTasksMarkdown(content: string): ParsedTask[] {
    const lines = content.split('\n');
    const parsedTasks: ParsedTask[] = [];
    let currentSection = 'root';
    let taskIdCounter = 0;

    // Section stack for nested headers
    const sectionStack: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Parse headers (sections)
      const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const sectionName = headerMatch[2];

        // Adjust section stack based on header level
        while (sectionStack.length >= level) {
          sectionStack.pop();
        }
        sectionStack.push(sectionName);
        currentSection = sectionStack.join(' > ');
        continue;
      }

      // Parse task lines (checkbox items)
      const taskMatch = trimmed.match(/^[-*]\s*\[([xX\s])\]\s*(.+)$/);
      if (taskMatch) {
        const isCompleted = taskMatch[1].toLowerCase() === 'x';
        const taskContent = taskMatch[2];

        const task = this.parseTaskLine(taskContent, currentSection, taskIdCounter++, isCompleted);
        parsedTasks.push(task);
        continue;
      }

      // Parse simple list items as tasks (without checkbox)
      const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
      if (listMatch && !trimmed.includes('[')) {
        const taskContent = listMatch[1];

        // Skip if it looks like metadata or a description continuation
        if (taskContent.includes(':') && !taskContent.match(/^[A-Z][a-z]+:/)) {
          continue;
        }

        const task = this.parseTaskLine(taskContent, currentSection, taskIdCounter++, false);
        parsedTasks.push(task);
      }
    }

    // Build the dependency graph
    this.buildDependencyGraph(parsedTasks);

    return parsedTasks;
  }

  /**
   * Parse a single task line into a ParsedTask object
   */
  private parseTaskLine(content: string, section: string, index: number, isCompleted: boolean): ParsedTask {
    let name = content;
    let priority: TaskPriority = 'P2';
    let parallelizable = false;
    let estimatedDuration = this.config.defaultEstimatedDuration;
    let agentType: AgentType | null = null;
    const dependencies: string[] = [];
    const tags: string[] = [];

    // Extract priority: [P1], [P2], [P3]
    const priorityMatch = content.match(/\[P([123])\]/i);
    if (priorityMatch) {
      priority = `P${priorityMatch[1]}` as TaskPriority;
      name = name.replace(/\[P[123]\]/gi, '').trim();
    }

    // Extract parallelizable marker: [P] for parallel
    if (content.includes('[P]') && !priorityMatch) {
      parallelizable = true;
      name = name.replace(/\[P\]/g, '').trim();
    }

    // Explicit parallel marker
    const parallelMarkerMatch = content.match(/\[parallel\]/i);
    if (parallelMarkerMatch) {
      parallelizable = true;
      name = name.replace(/\[parallel\]/gi, '').trim();
    }

    // Extract estimated duration: [30m], [2h], [1d]
    const durationMatch = content.match(/\[(\d+)([mhd])\]/i);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      estimatedDuration = unit === 'm' ? value : unit === 'h' ? value * 60 : value * 480;
      name = name.replace(/\[\d+[mhd]\]/gi, '').trim();
    }

    // Extract agent type: @coder, @researcher, @analyst, etc.
    const agentMatch = content.match(/@(coder|researcher|analyst|architect|tester|reviewer|coordinator|specialist)/i);
    if (agentMatch) {
      agentType = agentMatch[1].toLowerCase() as AgentType;
      name = name.replace(/@\w+/g, '').trim();
    }

    // Extract dependencies: depends:task1,task2 or blocks:task3
    const dependsMatch = content.match(/depends:\s*([^\s\]]+)/i);
    if (dependsMatch) {
      dependencies.push(...dependsMatch[1].split(',').map(d => d.trim()));
      name = name.replace(/depends:[^\s\]]+/gi, '').trim();
    }

    // Extract tags: #tag1 #tag2
    const tagMatches = content.matchAll(/#(\w+)/g);
    for (const match of tagMatches) {
      tags.push(match[1]);
      name = name.replace(`#${match[1]}`, '').trim();
    }

    // Clean up extra whitespace
    name = name.replace(/\s+/g, ' ').trim();

    // Generate task ID from name
    const id = this.generateTaskId(name, index);

    return {
      id,
      name,
      description: name,
      priority,
      estimatedDuration,
      dependencies,
      parallelizable,
      agentType,
      tags,
      status: isCompleted ? 'completed' : 'pending',
      section,
      metadata: {},
    };
  }

  /**
   * Generate a unique task ID from the task name
   */
  private generateTaskId(name: string, index: number): string {
    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 40);

    return `task-${slug}-${index}`;
  }

  // ===== DEPENDENCY GRAPH BUILDING =====

  /**
   * Build the dependency graph from parsed tasks
   */
  buildDependencyGraph(tasks: ParsedTask[] = Array.from(this.tasks.values())): DependencyGraph {
    // Clear existing graph
    this.graph.clear();
    this.tasks.clear();
    this.state.pendingTasks.clear();
    this.state.readyTasks.clear();

    // Add all tasks as nodes first
    for (const task of tasks) {
      this.tasks.set(task.id, task);

      this.graph.addTask(task.id, task.name, {
        description: task.description,
        priority: task.priority,
        estimatedDuration: task.estimatedDuration,
        tags: task.tags,
        parallelizable: task.parallelizable,
        metadata: {
          agentType: task.agentType,
          section: task.section,
        },
      });

      // Track initial state
      if (task.status === 'completed') {
        this.state.completedTasks.add(task.id);
      } else {
        this.state.pendingTasks.add(task.id);
      }
    }

    // Add dependencies (edges)
    for (const task of tasks) {
      for (const depId of task.dependencies) {
        // Find the dependency by ID or name
        const depTask = this.findTaskByIdOrName(depId);
        if (depTask) {
          try {
            this.graph.addDependency(depTask.id, task.id, 'blocks');
          } catch (error) {
            // Log but don't fail if dependency creates a cycle
            this.emit('warning', {
              type: 'cycle_detected',
              message: `Skipping dependency from ${depTask.id} to ${task.id}: would create cycle`,
            });
          }
        }
      }
    }

    // Update ready tasks
    this.updateReadyTasks();

    this.emit('graph:built', {
      taskCount: tasks.length,
      edgeCount: this.graph.getStats().edgeCount,
    });

    return this.graph;
  }

  /**
   * Find a task by ID or partial name match
   */
  private findTaskByIdOrName(idOrName: string): ParsedTask | undefined {
    // Try exact ID match first
    if (this.tasks.has(idOrName)) {
      return this.tasks.get(idOrName);
    }

    // Try name-based lookup
    const normalized = idOrName.toLowerCase();
    for (const task of this.tasks.values()) {
      if (task.name.toLowerCase().includes(normalized)) {
        return task;
      }
      if (task.id.includes(normalized)) {
        return task;
      }
    }

    return undefined;
  }

  /**
   * Update the set of ready tasks based on current state
   */
  private updateReadyTasks(): void {
    this.state.readyTasks.clear();
    this.state.blockedTasks.clear();

    const readyNodes = this.graph.getReadyTasks(this.state.completedTasks);

    for (const node of readyNodes) {
      const task = this.tasks.get(node.id);
      if (task && task.status !== 'completed' && !this.state.runningTasks.has(node.id)) {
        this.state.readyTasks.add(node.id);
        task.status = 'ready';
      }
    }

    // Mark blocked tasks
    for (const taskId of this.state.pendingTasks) {
      if (!this.state.readyTasks.has(taskId) && !this.state.runningTasks.has(taskId)) {
        this.state.blockedTasks.add(taskId);
        const task = this.tasks.get(taskId);
        if (task) task.status = 'blocked';
      }
    }
  }

  // ===== PARALLEL TASK SETS =====

  /**
   * Get sets of tasks that can be executed in parallel
   */
  getParallelSets(): ParallelBatch[] {
    return this.graph.getParallelBatches();
  }

  /**
   * Get tasks that are ready for immediate execution
   */
  getReadyTasks(): ParsedTask[] {
    const result: ParsedTask[] = [];

    for (const taskId of this.state.readyTasks) {
      const task = this.tasks.get(taskId);
      if (task) result.push(task);
    }

    // Sort by priority
    const priorityOrder: Record<TaskPriority, number> = { P1: 0, P2: 1, P3: 2 };
    result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return result;
  }

  /**
   * Get tasks that can run in parallel right now
   * Considers both task dependencies and parallel markers
   */
  getParallelizableReadyTasks(): ParsedTask[] {
    const ready = this.getReadyTasks();

    // Filter to only parallelizable tasks, but always include P1 tasks
    return ready.filter(t => t.parallelizable || t.priority === 'P1');
  }

  // ===== AGENT ASSIGNMENT =====

  /**
   * Assign tasks to agents
   * Returns a map of task assignments
   */
  assignToAgents(
    availableAgents: Array<{ id: string; type: AgentType; workload: number }>
  ): TaskAssignment[] {
    const assignments: TaskAssignment[] = [];
    const ready = this.getReadyTasks();

    // Calculate how many tasks each agent can take
    const agentCapacity = new Map<string, number>();
    for (const agent of availableAgents) {
      const capacity = Math.max(0, Math.floor((1 - agent.workload) * this.config.maxParallelTasks / availableAgents.length));
      agentCapacity.set(agent.id, capacity);
    }

    // Assign tasks based on agent type match and capacity
    for (const task of ready) {
      if (assignments.length >= this.config.maxParallelTasks) break;

      // Find best matching agent
      let bestAgent: { id: string; type: AgentType } | null = null;
      let bestScore = -1;

      for (const agent of availableAgents) {
        const capacity = agentCapacity.get(agent.id) ?? 0;
        if (capacity <= 0) continue;

        let score = capacity;

        // Prefer agents that match the task's required type
        if (task.agentType && agent.type === task.agentType) {
          score += 10;
        }

        // Consider agent type suitability for task tags
        score += this.calculateAgentSuitability(agent.type, task);

        if (score > bestScore) {
          bestScore = score;
          bestAgent = agent;
        }
      }

      if (bestAgent) {
        const assignment: TaskAssignment = {
          taskId: task.id,
          agentId: bestAgent.id,
          agentType: bestAgent.type,
          assignedAt: new Date(),
          estimatedCompletion: new Date(Date.now() + task.estimatedDuration * 60 * 1000),
        };

        assignments.push(assignment);
        this.assignments.set(task.id, assignment);

        // Update capacity
        agentCapacity.set(bestAgent.id, (agentCapacity.get(bestAgent.id) ?? 1) - 1);

        // Update task and state
        task.status = 'assigned';
        this.state.readyTasks.delete(task.id);
        this.state.runningTasks.add(task.id);

        this.emit('task:assigned', { assignment });
      }
    }

    return assignments;
  }

  /**
   * Calculate how suitable an agent type is for a task
   */
  private calculateAgentSuitability(agentType: AgentType, task: ParsedTask): number {
    let score = 0;
    const name = task.name.toLowerCase();
    const tags = task.tags.map(t => t.toLowerCase());

    const suitabilityMap: Record<AgentType, string[]> = {
      coder: ['code', 'implement', 'develop', 'build', 'create', 'fix', 'refactor', 'api', 'database'],
      researcher: ['research', 'investigate', 'analyze', 'study', 'explore', 'gather', 'find'],
      analyst: ['analyze', 'data', 'metrics', 'performance', 'report', 'statistics'],
      architect: ['design', 'architecture', 'structure', 'plan', 'system', 'infrastructure'],
      tester: ['test', 'validate', 'verify', 'check', 'qa', 'quality'],
      reviewer: ['review', 'audit', 'inspect', 'evaluate', 'assess'],
      coordinator: ['coordinate', 'manage', 'organize', 'plan', 'schedule'],
      specialist: [],
      optimizer: ['optimize', 'performance', 'improve', 'speed', 'efficiency'],
      documenter: ['document', 'docs', 'readme', 'api-docs'],
      monitor: ['monitor', 'watch', 'alert', 'health'],
    };

    const keywords = suitabilityMap[agentType] ?? [];

    for (const keyword of keywords) {
      if (name.includes(keyword)) score += 2;
      if (tags.some(t => t.includes(keyword))) score += 1;
    }

    return score;
  }

  // ===== PROGRESS TRACKING =====

  /**
   * Track progress of task execution
   */
  trackProgress(): {
    total: number;
    completed: number;
    failed: number;
    running: number;
    ready: number;
    blocked: number;
    percentComplete: number;
    estimatedTimeRemaining: number;
  } {
    const total = this.tasks.size;
    const completed = this.state.completedTasks.size;
    const failed = this.state.failedTasks.size;
    const running = this.state.runningTasks.size;
    const ready = this.state.readyTasks.size;
    const blocked = this.state.blockedTasks.size;

    const percentComplete = total > 0 ? (completed / total) * 100 : 0;

    // Estimate remaining time based on critical path
    let estimatedTimeRemaining = 0;
    const remaining = Array.from(this.tasks.values())
      .filter(t => !this.state.completedTasks.has(t.id))
      .reduce((sum, t) => sum + t.estimatedDuration, 0);

    // Adjust for parallelization
    const batches = this.getParallelSets();
    for (const batch of batches) {
      if (batch.tasks.some(t => !this.state.completedTasks.has(t))) {
        estimatedTimeRemaining += batch.estimatedDuration;
      }
    }

    return {
      total,
      completed,
      failed,
      running,
      ready,
      blocked,
      percentComplete,
      estimatedTimeRemaining,
    };
  }

  /**
   * Mark a task as started
   */
  startTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task '${taskId}' not found`);

    task.status = 'in_progress';
    this.state.readyTasks.delete(taskId);
    this.state.runningTasks.add(taskId);
    this.state.pendingTasks.delete(taskId);

    this.emit('task:started', { taskId, task });
  }

  /**
   * Mark a task as completed
   */
  completeTask(taskId: string, result?: unknown): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task '${taskId}' not found`);

    task.status = 'completed';
    task.metadata.result = result;
    task.metadata.completedAt = new Date();

    this.state.runningTasks.delete(taskId);
    this.state.completedTasks.add(taskId);
    this.assignments.delete(taskId);

    // Update ready tasks
    this.updateReadyTasks();

    this.emit('task:completed', { taskId, task, result });
  }

  /**
   * Mark a task as failed
   */
  failTask(taskId: string, error: Error | string): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task '${taskId}' not found`);

    task.status = 'failed';
    task.metadata.error = error instanceof Error ? error.message : error;
    task.metadata.failedAt = new Date();

    this.state.runningTasks.delete(taskId);
    this.state.failedTasks.add(taskId);
    this.assignments.delete(taskId);

    // Update ready tasks (blocked tasks might become unblocked)
    this.updateReadyTasks();

    this.emit('task:failed', { taskId, task, error });
  }

  // ===== CRITICAL PATH ANALYSIS =====

  /**
   * Get the critical path through the task graph
   */
  getCriticalPath(): CriticalPathResult {
    return this.graph.getCriticalPath();
  }

  /**
   * Get bottleneck tasks
   */
  getBottlenecks(): Array<{ taskId: string; blockedCount: number; impact: number }> {
    return this.graph.getBottlenecks();
  }

  /**
   * Optimize task scheduling based on critical path
   * Returns reordered tasks with recommendations
   */
  optimizeSchedule(): {
    criticalPath: string[];
    recommendations: string[];
    parallelOpportunities: string[][];
  } {
    const criticalPath = this.getCriticalPath();
    const bottlenecks = this.getBottlenecks();
    const batches = this.getParallelSets();

    const recommendations: string[] = [];

    // Recommendation: parallelize tasks not on critical path
    const criticalSet = new Set(criticalPath.path);
    const parallelOpportunities: string[][] = [];

    for (const batch of batches) {
      const nonCritical = batch.tasks.filter(t => !criticalSet.has(t));
      if (nonCritical.length > 1) {
        parallelOpportunities.push(nonCritical);
        recommendations.push(
          `Tasks [${nonCritical.join(', ')}] can run in parallel without affecting critical path`
        );
      }
    }

    // Recommendation: address bottlenecks
    const topBottlenecks = bottlenecks.slice(0, 3);
    for (const bottleneck of topBottlenecks) {
      const task = this.tasks.get(bottleneck.taskId);
      if (task && bottleneck.blockedCount > 2) {
        recommendations.push(
          `Task '${task.name}' blocks ${bottleneck.blockedCount} other tasks. Consider prioritizing or breaking it down.`
        );
      }
    }

    // Recommendation: critical path optimization
    if (criticalPath.totalDuration > 0) {
      const avgDuration = criticalPath.totalDuration / criticalPath.path.length;
      for (const taskId of criticalPath.bottlenecks) {
        const task = this.tasks.get(taskId);
        if (task && task.estimatedDuration > avgDuration * 2) {
          recommendations.push(
            `Task '${task.name}' on critical path has high duration (${task.estimatedDuration}min). Consider breaking it down.`
          );
        }
      }
    }

    return {
      criticalPath: criticalPath.path,
      recommendations,
      parallelOpportunities,
    };
  }

  // ===== UTILITIES =====

  /**
   * Get all tasks
   */
  getAllTasks(): ParsedTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get a specific task by ID
   */
  getTask(taskId: string): ParsedTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get the underlying dependency graph
   */
  getGraph(): DependencyGraph {
    return this.graph;
  }

  /**
   * Export to Mermaid diagram
   */
  toMermaid(): string {
    return this.graph.toMermaid();
  }

  /**
   * Get tasks grouped by section
   */
  getTasksBySection(): Map<string, ParsedTask[]> {
    const sections = new Map<string, ParsedTask[]>();

    for (const task of this.tasks.values()) {
      const sectionTasks = sections.get(task.section) ?? [];
      sectionTasks.push(task);
      sections.set(task.section, sectionTasks);
    }

    return sections;
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): ParsedTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status === status);
  }

  /**
   * Get tasks by priority
   */
  getTasksByPriority(priority: TaskPriority): ParsedTask[] {
    return Array.from(this.tasks.values()).filter(t => t.priority === priority);
  }

  /**
   * Get tasks assigned to a specific agent type
   */
  getTasksByAgentType(agentType: AgentType): ParsedTask[] {
    return Array.from(this.tasks.values()).filter(t => t.agentType === agentType);
  }

  /**
   * Clear all data and reset state
   */
  reset(): void {
    this.tasks.clear();
    this.assignments.clear();
    this.graph.clear();
    this.sections = [];

    this.state = {
      pendingTasks: new Set(),
      readyTasks: new Set(),
      runningTasks: new Set(),
      completedTasks: new Set(),
      failedTasks: new Set(),
      blockedTasks: new Set(),
    };

    this.emit('orchestrator:reset', {});
  }
}

export default TaskOrchestrator;
