/**
 * Task Orchestrator Agent
 *
 * Manages task execution, dependencies, and parallelization. Assigns tasks
 * to available agents and tracks completion status across the specification
 * workflow.
 *
 * @module TaskOrchestratorAgent
 */

import { BaseAgent } from '../../../cli/agents/base-agent.js';
import type {
  AgentCapabilities,
  AgentConfig,
  AgentEnvironment,
  TaskDefinition,
  TaskId,
  AgentId,
} from '../../../swarm/types.js';
import type { ILogger } from '../../../core/logger.js';
import type { IEventBus } from '../../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../../memory/distributed-memory.js';

/**
 * Task node in the dependency graph
 */
export interface TaskNode {
  id: string;
  name: string;
  description: string;
  type: string;
  dependencies: string[];
  dependents: string[];
  status: TaskNodeStatus;
  assignedAgent?: string;
  priority: number;
  estimatedDuration: number;
  actualDuration?: number;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  retryCount: number;
  maxRetries: number;
  metadata: Record<string, any>;
}

/**
 * Task execution status
 */
export type TaskNodeStatus =
  | 'pending'
  | 'ready'
  | 'assigned'
  | 'running'
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'cancelled';

/**
 * Dependency graph for task orchestration
 */
export interface TaskGraph {
  nodes: Map<string, TaskNode>;
  edges: Map<string, string[]>; // taskId -> [dependentTaskIds]
  criticalPath: string[];
  parallelGroups: string[][];
}

/**
 * Agent availability information
 */
export interface AgentAvailability {
  agentId: string;
  agentType: string;
  status: 'available' | 'busy' | 'offline';
  currentLoad: number;
  maxLoad: number;
  capabilities: string[];
  assignedTasks: string[];
  performance: {
    avgCompletionTime: number;
    successRate: number;
  };
}

/**
 * Task assignment decision
 */
export interface TaskAssignment {
  taskId: string;
  agentId: string;
  assignedAt: Date;
  reason: string;
  estimatedCompletion: Date;
  priority: number;
}

/**
 * Orchestration progress report
 */
export interface OrchestrationProgress {
  totalTasks: number;
  completedTasks: number;
  runningTasks: number;
  pendingTasks: number;
  failedTasks: number;
  blockedTasks: number;
  progressPercentage: number;
  estimatedCompletion: Date;
  criticalPathProgress: number;
  activeAgents: number;
}

/**
 * Task Orchestrator Agent - Manages task execution and dependencies
 */
export class TaskOrchestratorAgent extends BaseAgent {
  private taskGraph: TaskGraph;
  private agentAvailability: Map<string, AgentAvailability> = new Map();
  private assignments: Map<string, TaskAssignment> = new Map();
  private completedTasks: Set<string> = new Set();

  constructor(
    id: string,
    config: AgentConfig,
    environment: AgentEnvironment,
    logger: ILogger,
    eventBus: IEventBus,
    memory: DistributedMemorySystem,
  ) {
    super(id, 'coordinator', config, environment, logger, eventBus, memory);
    this.taskGraph = {
      nodes: new Map(),
      edges: new Map(),
      criticalPath: [],
      parallelGroups: [],
    };
    this.setupOrchestratorEvents();
  }

  /**
   * Get default capabilities for task orchestration
   */
  protected getDefaultCapabilities(): AgentCapabilities {
    return {
      codeGeneration: false,
      codeReview: false,
      testing: false,
      documentation: true,
      research: false,
      analysis: true,
      webSearch: false,
      apiIntegration: true,
      fileSystem: true,
      terminalAccess: false,
      languages: [],
      frameworks: [],
      domains: [
        'task-orchestration',
        'dependency-management',
        'parallel-execution',
        'agent-coordination',
        'progress-tracking',
        'resource-allocation',
      ],
      tools: [
        'parse-tasks',
        'build-graph',
        'assign-agents',
        'track-progress',
        'optimize-schedule',
        'handle-failures',
      ],
      maxConcurrentTasks: 10,
      maxMemoryUsage: 512 * 1024 * 1024, // 512MB
      maxExecutionTime: 3600000, // 1 hour
      reliability: 0.95,
      speed: 0.9,
      quality: 0.92,
    };
  }

  /**
   * Get default configuration for the agent
   */
  protected getDefaultConfig(): Partial<AgentConfig> {
    return {
      autonomyLevel: 0.9,
      learningEnabled: true,
      adaptationEnabled: true,
      maxTasksPerHour: 100,
      maxConcurrentTasks: 10,
      timeoutThreshold: 3600000,
      reportingInterval: 10000,
      heartbeatInterval: 5000,
      permissions: ['task-assign', 'agent-query', 'memory-access', 'event-emit'],
      trustedAgents: [],
      expertise: {
        'task-orchestration': 0.95,
        'dependency-analysis': 0.92,
        'resource-allocation': 0.9,
        'parallel-scheduling': 0.88,
      },
      preferences: {
        prioritizeCriticalPath: true,
        maximizeParallelism: true,
        balanceAgentLoad: true,
        retryOnFailure: true,
        maxRetries: 3,
      },
    };
  }

  /**
   * Execute a task orchestration task
   */
  override async executeTask(task: TaskDefinition): Promise<any> {
    this.logger.info('Task Orchestrator executing task', {
      agentId: this.id,
      taskType: task.type,
      taskId: task.id,
    });

    try {
      switch (task.type) {
        case 'parse-tasks':
          return await this.parseTasks(task);
        case 'build-graph':
          return await this.buildGraph(task);
        case 'assign-agents':
          return await this.assignAgents(task);
        case 'track-progress':
          return await this.trackProgress(task);
        case 'optimize-schedule':
          return await this.optimizeSchedule(task);
        case 'handle-failure':
          return await this.handleFailure(task);
        default:
          return await this.performGeneralOrchestration(task);
      }
    } catch (error) {
      this.logger.error('Task orchestration failed', {
        agentId: this.id,
        taskId: task.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Parse tasks from specification or plan
   */
  private async parseTasks(task: TaskDefinition): Promise<any> {
    const source = task.input?.source;
    const format = task.parameters?.format || 'auto';

    this.logger.info('Parsing tasks from source', { format });

    const parsedTasks: TaskNode[] = [];

    if (typeof source === 'string') {
      // Parse from text/markdown
      parsedTasks.push(...this.parseTasksFromText(source));
    } else if (Array.isArray(source)) {
      // Parse from array of task definitions
      parsedTasks.push(...this.parseTasksFromArray(source));
    } else if (source?.tasks) {
      // Parse from structured object
      parsedTasks.push(...this.parseTasksFromObject(source));
    }

    // Add to task graph
    for (const taskNode of parsedTasks) {
      this.taskGraph.nodes.set(taskNode.id, taskNode);
    }

    await this.memory.store(`tasks:${task.id.id}:parsed`, {
      taskCount: parsedTasks.length,
      tasks: parsedTasks.map(t => ({
        id: t.id,
        name: t.name,
        dependencies: t.dependencies,
        priority: t.priority,
      })),
    }, {
      type: 'parsed-tasks',
      tags: ['orchestration', 'tasks'],
      partition: 'orchestration',
    });

    return {
      parsed: parsedTasks.length,
      tasks: parsedTasks,
      summary: {
        withDependencies: parsedTasks.filter(t => t.dependencies.length > 0).length,
        noDependencies: parsedTasks.filter(t => t.dependencies.length === 0).length,
        highPriority: parsedTasks.filter(t => t.priority > 7).length,
      },
    };
  }

  /**
   * Build dependency graph from tasks
   */
  private async buildGraph(task: TaskDefinition): Promise<TaskGraph> {
    const tasks = task.input?.tasks || Array.from(this.taskGraph.nodes.values());

    this.logger.info('Building dependency graph', { taskCount: tasks.length });

    // Clear existing edges
    this.taskGraph.edges.clear();

    // Build edges from dependencies
    for (const taskNode of tasks) {
      this.taskGraph.edges.set(taskNode.id, []);

      for (const dep of taskNode.dependencies) {
        const depEdges = this.taskGraph.edges.get(dep) || [];
        depEdges.push(taskNode.id);
        this.taskGraph.edges.set(dep, depEdges);
      }

      // Update dependents
      taskNode.dependents = tasks
        .filter((t: TaskNode) => t.dependencies.includes(taskNode.id))
        .map((t: TaskNode) => t.id);

      this.taskGraph.nodes.set(taskNode.id, taskNode);
    }

    // Calculate critical path
    this.taskGraph.criticalPath = this.calculateCriticalPath();

    // Identify parallel groups
    this.taskGraph.parallelGroups = this.identifyParallelGroups();

    // Update task statuses
    this.updateTaskStatuses();

    await this.memory.store(`graph:${task.id.id}:built`, {
      nodeCount: this.taskGraph.nodes.size,
      edgeCount: Array.from(this.taskGraph.edges.values()).reduce((sum, e) => sum + e.length, 0),
      criticalPathLength: this.taskGraph.criticalPath.length,
      parallelGroups: this.taskGraph.parallelGroups.length,
    }, {
      type: 'task-graph',
      tags: ['orchestration', 'graph'],
      partition: 'orchestration',
    });

    return this.taskGraph;
  }

  /**
   * Assign tasks to available agents
   */
  private async assignAgents(task: TaskDefinition): Promise<TaskAssignment[]> {
    const availableAgents = task.input?.agents as AgentAvailability[] || [];
    const maxAssignments = task.parameters?.maxAssignments || 10;

    this.logger.info('Assigning tasks to agents', {
      availableAgents: availableAgents.length,
      maxAssignments,
    });

    // Update agent availability
    for (const agent of availableAgents) {
      this.agentAvailability.set(agent.agentId, agent);
    }

    const newAssignments: TaskAssignment[] = [];
    const readyTasks = Array.from(this.taskGraph.nodes.values())
      .filter(t => t.status === 'ready')
      .sort((a, b) => {
        // Prioritize critical path tasks
        const aOnCriticalPath = this.taskGraph.criticalPath.includes(a.id) ? 1 : 0;
        const bOnCriticalPath = this.taskGraph.criticalPath.includes(b.id) ? 1 : 0;
        if (aOnCriticalPath !== bOnCriticalPath) {
          return bOnCriticalPath - aOnCriticalPath;
        }
        return b.priority - a.priority;
      });

    for (const taskNode of readyTasks.slice(0, maxAssignments)) {
      const bestAgent = this.findBestAgent(taskNode, availableAgents);

      if (bestAgent) {
        const assignment: TaskAssignment = {
          taskId: taskNode.id,
          agentId: bestAgent.agentId,
          assignedAt: new Date(),
          reason: this.getAssignmentReason(taskNode, bestAgent),
          estimatedCompletion: new Date(
            Date.now() + taskNode.estimatedDuration + bestAgent.performance.avgCompletionTime
          ),
          priority: taskNode.priority,
        };

        newAssignments.push(assignment);
        this.assignments.set(taskNode.id, assignment);

        // Update task status
        taskNode.status = 'assigned';
        taskNode.assignedAgent = bestAgent.agentId;
        this.taskGraph.nodes.set(taskNode.id, taskNode);

        // Update agent availability
        bestAgent.currentLoad++;
        bestAgent.assignedTasks.push(taskNode.id);
        this.agentAvailability.set(bestAgent.agentId, bestAgent);

        // Emit assignment event
        this.eventBus.emit('task:assigned', {
          taskId: taskNode.id,
          agentId: bestAgent.agentId,
          orchestratorId: this.id,
        });
      }
    }

    await this.memory.store(`assignments:${task.id.id}`, {
      assignments: newAssignments,
      timestamp: new Date(),
    }, {
      type: 'task-assignments',
      tags: ['orchestration', 'assignments'],
      partition: 'orchestration',
    });

    return newAssignments;
  }

  /**
   * Track progress of task execution
   */
  private async trackProgress(task: TaskDefinition): Promise<OrchestrationProgress> {
    const includeDetails = task.parameters?.includeDetails ?? false;

    this.logger.info('Tracking orchestration progress');

    const nodes = Array.from(this.taskGraph.nodes.values());
    const completed = nodes.filter(n => n.status === 'completed');
    const running = nodes.filter(n => n.status === 'running');
    const pending = nodes.filter(n => n.status === 'pending' || n.status === 'ready');
    const failed = nodes.filter(n => n.status === 'failed');
    const blocked = nodes.filter(n => n.status === 'blocked');

    // Calculate critical path progress
    const criticalPathCompleted = this.taskGraph.criticalPath.filter(
      id => this.taskGraph.nodes.get(id)?.status === 'completed'
    ).length;

    // Estimate completion time
    const remainingDuration = pending.reduce((sum, t) => sum + t.estimatedDuration, 0) +
                              running.reduce((sum, t) => sum + (t.estimatedDuration / 2), 0);

    const progress: OrchestrationProgress = {
      totalTasks: nodes.length,
      completedTasks: completed.length,
      runningTasks: running.length,
      pendingTasks: pending.length,
      failedTasks: failed.length,
      blockedTasks: blocked.length,
      progressPercentage: nodes.length > 0 ? (completed.length / nodes.length) * 100 : 0,
      estimatedCompletion: new Date(Date.now() + remainingDuration),
      criticalPathProgress: this.taskGraph.criticalPath.length > 0
        ? (criticalPathCompleted / this.taskGraph.criticalPath.length) * 100
        : 100,
      activeAgents: Array.from(this.agentAvailability.values())
        .filter(a => a.status === 'busy').length,
    };

    // Store progress snapshot
    await this.memory.store(`progress:${Date.now()}`, progress, {
      type: 'progress-snapshot',
      tags: ['orchestration', 'progress'],
      partition: 'orchestration',
    });

    if (includeDetails) {
      return {
        ...progress,
        details: {
          byStatus: {
            completed: completed.map(t => t.id),
            running: running.map(t => ({ id: t.id, agent: t.assignedAgent })),
            pending: pending.map(t => t.id),
            failed: failed.map(t => ({ id: t.id, error: t.error })),
            blocked: blocked.map(t => ({ id: t.id, blockedBy: t.dependencies })),
          },
          criticalPath: this.taskGraph.criticalPath,
          parallelGroups: this.taskGraph.parallelGroups,
        },
      } as any;
    }

    return progress;
  }

  /**
   * Optimize the task schedule
   */
  private async optimizeSchedule(task: TaskDefinition): Promise<any> {
    const constraints = task.input?.constraints || {};
    const objective = task.parameters?.objective || 'minimize-time';

    this.logger.info('Optimizing task schedule', { objective });

    // Recalculate critical path
    const criticalPath = this.calculateCriticalPath();

    // Identify parallelization opportunities
    const parallelGroups = this.identifyParallelGroups();

    // Calculate optimal agent assignments
    const optimalAssignments = this.calculateOptimalAssignments();

    // Estimate improvements
    const currentEstimate = this.estimateTotalDuration();
    const optimizedEstimate = this.estimateOptimizedDuration(optimalAssignments);

    const optimization = {
      criticalPath,
      parallelGroups,
      optimalAssignments,
      improvement: {
        currentDuration: currentEstimate,
        optimizedDuration: optimizedEstimate,
        timeSaved: currentEstimate - optimizedEstimate,
        percentImprovement: ((currentEstimate - optimizedEstimate) / currentEstimate) * 100,
      },
      recommendations: this.generateScheduleRecommendations(criticalPath, parallelGroups),
    };

    // Update task graph
    this.taskGraph.criticalPath = criticalPath;
    this.taskGraph.parallelGroups = parallelGroups;

    return optimization;
  }

  /**
   * Handle task failure
   */
  private async handleFailure(task: TaskDefinition): Promise<any> {
    const failedTaskId = task.input?.taskId;
    const error = task.input?.error;
    const retryPolicy = task.parameters?.retryPolicy || 'auto';

    this.logger.info('Handling task failure', { failedTaskId, retryPolicy });

    const failedTask = this.taskGraph.nodes.get(failedTaskId);
    if (!failedTask) {
      throw new Error(`Task not found: ${failedTaskId}`);
    }

    // Update task status
    failedTask.status = 'failed';
    failedTask.error = error;
    failedTask.retryCount++;

    const response: any = {
      taskId: failedTaskId,
      handled: true,
      action: 'none',
      impact: [],
    };

    // Determine retry eligibility
    const canRetry = failedTask.retryCount < failedTask.maxRetries;

    if (canRetry && (retryPolicy === 'auto' || retryPolicy === 'retry')) {
      // Reset for retry
      failedTask.status = 'ready';
      failedTask.assignedAgent = undefined;
      failedTask.error = undefined;
      response.action = 'retry';
      response.retriesRemaining = failedTask.maxRetries - failedTask.retryCount;

      // Remove from assignments
      this.assignments.delete(failedTaskId);
    } else {
      // Mark as permanently failed
      failedTask.status = 'failed';
      response.action = 'failed';

      // Identify impacted dependent tasks
      const impactedTasks = this.findImpactedTasks(failedTaskId);
      for (const impactedId of impactedTasks) {
        const impacted = this.taskGraph.nodes.get(impactedId);
        if (impacted) {
          impacted.status = 'blocked';
          this.taskGraph.nodes.set(impactedId, impacted);
        }
      }
      response.impact = impactedTasks;
    }

    this.taskGraph.nodes.set(failedTaskId, failedTask);

    // Emit failure event
    this.eventBus.emit('task:failure-handled', {
      taskId: failedTaskId,
      action: response.action,
      orchestratorId: this.id,
    });

    return response;
  }

  /**
   * Perform general orchestration
   */
  private async performGeneralOrchestration(task: TaskDefinition): Promise<any> {
    // Build graph if needed
    if (this.taskGraph.nodes.size === 0 && task.input?.tasks) {
      await this.parseTasks({
        ...task,
        type: 'parse-tasks',
        input: { source: task.input.tasks },
      });
      await this.buildGraph({
        ...task,
        type: 'build-graph',
      });
    }

    // Get current progress
    const progress = await this.trackProgress({
      ...task,
      type: 'track-progress',
      parameters: { includeDetails: true },
    });

    // Assign ready tasks if agents available
    if (task.input?.agents) {
      const assignments = await this.assignAgents({
        ...task,
        type: 'assign-agents',
        input: { agents: task.input.agents },
      });

      return {
        progress,
        newAssignments: assignments,
        graph: {
          totalNodes: this.taskGraph.nodes.size,
          criticalPath: this.taskGraph.criticalPath,
          parallelGroups: this.taskGraph.parallelGroups.length,
        },
      };
    }

    return { progress };
  }

  /**
   * Parse tasks from text/markdown
   */
  private parseTasksFromText(text: string): TaskNode[] {
    const tasks: TaskNode[] = [];
    const lines = text.split('\n');
    let taskId = 1;

    for (const line of lines) {
      const match = line.match(/^[-*]\s+(.+)$/);
      if (match) {
        tasks.push(this.createTaskNode(
          `task-${taskId++}`,
          match[1].trim(),
          []
        ));
      }
    }

    return tasks;
  }

  /**
   * Parse tasks from array
   */
  private parseTasksFromArray(source: any[]): TaskNode[] {
    return source.map((item, index) => {
      if (typeof item === 'string') {
        return this.createTaskNode(`task-${index + 1}`, item, []);
      }
      return this.createTaskNode(
        item.id || `task-${index + 1}`,
        item.name || item.description || `Task ${index + 1}`,
        item.dependencies || []
      );
    });
  }

  /**
   * Parse tasks from structured object
   */
  private parseTasksFromObject(source: any): TaskNode[] {
    const tasks = source.tasks || [];
    return tasks.map((t: any) => this.createTaskNode(
      t.id,
      t.name,
      t.dependencies || [],
      t
    ));
  }

  /**
   * Create a task node
   */
  private createTaskNode(
    id: string,
    name: string,
    dependencies: string[],
    extra?: any
  ): TaskNode {
    return {
      id,
      name,
      description: extra?.description || name,
      type: extra?.type || 'general',
      dependencies,
      dependents: [],
      status: 'pending',
      priority: extra?.priority || 5,
      estimatedDuration: extra?.estimatedDuration || 60000, // 1 minute default
      retryCount: 0,
      maxRetries: extra?.maxRetries || 3,
      metadata: extra?.metadata || {},
    };
  }

  /**
   * Calculate critical path using topological sort and longest path
   */
  private calculateCriticalPath(): string[] {
    const nodes = Array.from(this.taskGraph.nodes.values());
    const distances = new Map<string, number>();
    const predecessors = new Map<string, string>();

    // Initialize distances
    for (const node of nodes) {
      distances.set(node.id, node.dependencies.length === 0 ? 0 : -Infinity);
    }

    // Topological sort
    const sorted = this.topologicalSort();

    // Calculate longest paths
    for (const nodeId of sorted) {
      const node = this.taskGraph.nodes.get(nodeId)!;
      const currentDist = distances.get(nodeId) || 0;

      for (const depId of node.dependents) {
        const depNode = this.taskGraph.nodes.get(depId);
        if (depNode) {
          const newDist = currentDist + node.estimatedDuration;
          if (newDist > (distances.get(depId) || -Infinity)) {
            distances.set(depId, newDist);
            predecessors.set(depId, nodeId);
          }
        }
      }
    }

    // Find end node with longest path
    let maxDist = -Infinity;
    let endNode = '';
    for (const [nodeId, dist] of distances) {
      const node = this.taskGraph.nodes.get(nodeId);
      if (node && node.dependents.length === 0 && dist > maxDist) {
        maxDist = dist;
        endNode = nodeId;
      }
    }

    // Reconstruct critical path
    const criticalPath: string[] = [];
    let current = endNode;
    while (current) {
      criticalPath.unshift(current);
      current = predecessors.get(current) || '';
    }

    return criticalPath;
  }

  /**
   * Topological sort of task graph
   */
  private topologicalSort(): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = this.taskGraph.nodes.get(nodeId);
      if (node) {
        for (const dep of node.dependencies) {
          visit(dep);
        }
      }
      result.push(nodeId);
    };

    for (const nodeId of this.taskGraph.nodes.keys()) {
      visit(nodeId);
    }

    return result;
  }

  /**
   * Identify groups of tasks that can run in parallel
   */
  private identifyParallelGroups(): string[][] {
    const groups: string[][] = [];
    const remaining = new Set(this.taskGraph.nodes.keys());

    while (remaining.size > 0) {
      const group: string[] = [];

      for (const nodeId of remaining) {
        const node = this.taskGraph.nodes.get(nodeId)!;
        const depsCompleted = node.dependencies.every(
          d => !remaining.has(d)
        );

        if (depsCompleted) {
          group.push(nodeId);
        }
      }

      if (group.length === 0) break; // Cycle detection

      for (const nodeId of group) {
        remaining.delete(nodeId);
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Update task statuses based on dependencies
   */
  private updateTaskStatuses(): void {
    for (const [nodeId, node] of this.taskGraph.nodes) {
      if (node.status === 'pending') {
        const depsCompleted = node.dependencies.every(
          d => this.taskGraph.nodes.get(d)?.status === 'completed'
        );

        if (depsCompleted) {
          node.status = 'ready';
          this.taskGraph.nodes.set(nodeId, node);
        }
      }
    }
  }

  /**
   * Find best agent for a task
   */
  private findBestAgent(
    taskNode: TaskNode,
    agents: AgentAvailability[]
  ): AgentAvailability | null {
    const available = agents.filter(a =>
      a.status === 'available' && a.currentLoad < a.maxLoad
    );

    if (available.length === 0) return null;

    // Score agents based on capabilities, load, and performance
    const scored = available.map(agent => {
      let score = 0;

      // Capability match
      const requiredCaps = taskNode.metadata.requiredCapabilities || [];
      const matchedCaps = requiredCaps.filter((c: string) =>
        agent.capabilities.includes(c)
      ).length;
      score += matchedCaps * 10;

      // Load balance (prefer less loaded agents)
      score += (1 - agent.currentLoad / agent.maxLoad) * 20;

      // Performance history
      score += agent.performance.successRate * 30;
      score -= agent.performance.avgCompletionTime / 60000; // Penalize slow agents

      return { agent, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.agent || null;
  }

  /**
   * Get reason for assignment
   */
  private getAssignmentReason(task: TaskNode, agent: AgentAvailability): string {
    const reasons: string[] = [];

    if (agent.currentLoad === 0) {
      reasons.push('agent is available');
    }

    if (agent.performance.successRate > 0.9) {
      reasons.push('high success rate');
    }

    if (this.taskGraph.criticalPath.includes(task.id)) {
      reasons.push('task is on critical path');
    }

    return reasons.join(', ') || 'best match';
  }

  /**
   * Calculate optimal agent assignments
   */
  private calculateOptimalAssignments(): Map<string, string> {
    const assignments = new Map<string, string>();
    // Placeholder for optimization logic
    return assignments;
  }

  /**
   * Estimate total duration
   */
  private estimateTotalDuration(): number {
    return Array.from(this.taskGraph.nodes.values())
      .reduce((sum, n) => sum + n.estimatedDuration, 0);
  }

  /**
   * Estimate optimized duration
   */
  private estimateOptimizedDuration(assignments: Map<string, string>): number {
    // Calculate based on parallel execution
    const groups = this.taskGraph.parallelGroups;
    return groups.reduce((sum, group) => {
      const maxGroupDuration = Math.max(
        ...group.map(id => this.taskGraph.nodes.get(id)?.estimatedDuration || 0)
      );
      return sum + maxGroupDuration;
    }, 0);
  }

  /**
   * Generate schedule recommendations
   */
  private generateScheduleRecommendations(
    criticalPath: string[],
    parallelGroups: string[][]
  ): string[] {
    const recommendations: string[] = [];

    if (criticalPath.length > 3) {
      recommendations.push(
        `Critical path has ${criticalPath.length} tasks - consider breaking down large tasks`
      );
    }

    const maxParallel = Math.max(...parallelGroups.map(g => g.length));
    if (maxParallel > 5) {
      recommendations.push(
        `Up to ${maxParallel} tasks can run in parallel - ensure sufficient agents`
      );
    }

    return recommendations;
  }

  /**
   * Find tasks impacted by a failure
   */
  private findImpactedTasks(failedTaskId: string): string[] {
    const impacted: string[] = [];
    const visited = new Set<string>();

    const findDependents = (taskId: string) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);

      const node = this.taskGraph.nodes.get(taskId);
      if (node) {
        for (const depId of node.dependents) {
          impacted.push(depId);
          findDependents(depId);
        }
      }
    };

    findDependents(failedTaskId);
    return impacted;
  }

  /**
   * Setup orchestrator-specific events
   */
  private setupOrchestratorEvents(): void {
    this.eventBus.on('task:completed', (data: any) => {
      const node = this.taskGraph.nodes.get(data.taskId);
      if (node) {
        node.status = 'completed';
        node.completedAt = new Date();
        node.result = data.result;
        this.taskGraph.nodes.set(data.taskId, node);
        this.completedTasks.add(data.taskId);
        this.updateTaskStatuses();
      }
    });

    this.eventBus.on('task:failed', (data: any) => {
      const node = this.taskGraph.nodes.get(data.taskId);
      if (node) {
        node.status = 'failed';
        node.error = data.error;
        this.taskGraph.nodes.set(data.taskId, node);
      }
    });
  }

  /**
   * Get agent status with orchestration-specific information
   */
  override getAgentStatus(): any {
    return {
      ...super.getAgentStatus(),
      specialization: 'Task Orchestration',
      taskGraphSize: this.taskGraph.nodes.size,
      activeAssignments: this.assignments.size,
      completedTasks: this.completedTasks.size,
      criticalPathLength: this.taskGraph.criticalPath.length,
      capabilities: [
        'parse-tasks',
        'build-graph',
        'assign-agents',
        'track-progress',
      ],
    };
  }
}

/**
 * Factory function to create a Task Orchestrator Agent
 */
export const createTaskOrchestratorAgent = (
  id: string,
  config: Partial<AgentConfig>,
  environment: Partial<AgentEnvironment>,
  logger: ILogger,
  eventBus: IEventBus,
  memory: DistributedMemorySystem,
): TaskOrchestratorAgent => {
  const defaultConfig: AgentConfig = {
    autonomyLevel: 0.9,
    learningEnabled: true,
    adaptationEnabled: true,
    maxTasksPerHour: 100,
    maxConcurrentTasks: 10,
    timeoutThreshold: 3600000,
    reportingInterval: 10000,
    heartbeatInterval: 5000,
    permissions: ['task-assign', 'agent-query', 'memory-access', 'event-emit'],
    trustedAgents: [],
    expertise: {
      'task-orchestration': 0.95,
      'dependency-analysis': 0.92,
    },
    preferences: {
      prioritizeCriticalPath: true,
      maximizeParallelism: true,
    },
  };

  const defaultEnv: AgentEnvironment = {
    runtime: 'node',
    version: '20.0.0',
    workingDirectory: './agents/task-orchestrator',
    tempDirectory: './tmp/task-orchestrator',
    logDirectory: './logs/task-orchestrator',
    apiEndpoints: {},
    credentials: {},
    availableTools: ['parse-tasks', 'build-graph', 'assign-agents', 'track-progress'],
    toolConfigs: {},
  };

  return new TaskOrchestratorAgent(
    id,
    { ...defaultConfig, ...config } as AgentConfig,
    { ...defaultEnv, ...environment } as AgentEnvironment,
    logger,
    eventBus,
    memory,
  );
};
