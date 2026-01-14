/**
 * Status Dashboard for SpecKit Integration
 * Provides real-time view of specs, plans, tasks, and agents
 */

import { EventEmitter } from 'node:events';
import chalk from 'chalk';
import Table from 'cli-table3';

// ===== Types =====

export type OutputFormat = 'json' | 'table' | 'html';

export interface SpecStatus {
  id: string;
  name: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'implemented' | 'deprecated';
  author: string;
  createdAt: Date;
  updatedAt: Date;
  completeness: number; // 0-100
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
  health: number; // 0-1
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
  refreshInterval: number; // ms
  maxHistoryEntries: number;
  showWarnings: boolean;
  showErrors: boolean;
  compactMode: boolean;
}

// ===== Status Dashboard Class =====

export class StatusDashboard extends EventEmitter {
  private config: DashboardConfig;
  private specs: Map<string, SpecStatus> = new Map();
  private plans: Map<string, PlanStatus> = new Map();
  private tasks: Map<string, TaskStatus> = new Map();
  private agents: Map<string, AgentActivity> = new Map();
  private startTime: Date;
  private refreshTimer?: NodeJS.Timeout;
  private history: SystemOverview[] = [];

  constructor(config: Partial<DashboardConfig> = {}) {
    super();
    this.config = {
      refreshInterval: 5000,
      maxHistoryEntries: 100,
      showWarnings: true,
      showErrors: true,
      compactMode: false,
      ...config,
    };
    this.startTime = new Date();
  }

  // ===== Initialization =====

  async initialize(): Promise<void> {
    this.emit('dashboard:initialized');
  }

  async shutdown(): Promise<void> {
    this.stopAutoRefresh();
    this.emit('dashboard:shutdown');
  }

  // ===== Data Registration Methods =====

  registerSpec(spec: SpecStatus): void {
    this.specs.set(spec.id, spec);
    this.emit('spec:registered', spec);
  }

  updateSpec(specId: string, updates: Partial<SpecStatus>): void {
    const spec = this.specs.get(specId);
    if (spec) {
      const updated = { ...spec, ...updates, updatedAt: new Date() };
      this.specs.set(specId, updated);
      this.emit('spec:updated', updated);
    }
  }

  removeSpec(specId: string): void {
    this.specs.delete(specId);
    this.emit('spec:removed', specId);
  }

  registerPlan(plan: PlanStatus): void {
    this.plans.set(plan.id, plan);
    this.emit('plan:registered', plan);
  }

  updatePlan(planId: string, updates: Partial<PlanStatus>): void {
    const plan = this.plans.get(planId);
    if (plan) {
      const updated = { ...plan, ...updates, updatedAt: new Date() };
      this.plans.set(planId, updated);
      this.emit('plan:updated', updated);
    }
  }

  removePlan(planId: string): void {
    this.plans.delete(planId);
    this.emit('plan:removed', planId);
  }

  registerTask(task: TaskStatus): void {
    this.tasks.set(task.id, task);
    this.emit('task:registered', task);
  }

  updateTask(taskId: string, updates: Partial<TaskStatus>): void {
    const task = this.tasks.get(taskId);
    if (task) {
      const updated = { ...task, ...updates };
      this.tasks.set(taskId, updated);
      this.emit('task:updated', updated);
    }
  }

  removeTask(taskId: string): void {
    this.tasks.delete(taskId);
    this.emit('task:removed', taskId);
  }

  registerAgent(agent: AgentActivity): void {
    this.agents.set(agent.id, agent);
    this.emit('agent:registered', agent);
  }

  updateAgent(agentId: string, updates: Partial<AgentActivity>): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      const updated = { ...agent, ...updates, lastActivity: new Date() };
      this.agents.set(agentId, updated);
      this.emit('agent:updated', updated);
    }
  }

  removeAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.emit('agent:removed', agentId);
  }

  // ===== Core Query Methods =====

  getOverview(): SystemOverview {
    const specsArray = Array.from(this.specs.values());
    const plansArray = Array.from(this.plans.values());
    const tasksArray = Array.from(this.tasks.values());
    const agentsArray = Array.from(this.agents.values());

    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for issues
    const blockedPlans = plansArray.filter(p => p.status === 'blocked');
    if (blockedPlans.length > 0) {
      warnings.push(`${blockedPlans.length} plan(s) are blocked`);
    }

    const failedTasks = tasksArray.filter(t => t.status === 'failed');
    if (failedTasks.length > 0) {
      errors.push(`${failedTasks.length} task(s) have failed`);
    }

    const errorAgents = agentsArray.filter(a => a.status === 'error');
    if (errorAgents.length > 0) {
      errors.push(`${errorAgents.length} agent(s) in error state`);
    }

    // Determine overall health
    let health: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (warnings.length > 0) health = 'degraded';
    if (errors.length > 0) health = 'unhealthy';

    const overview: SystemOverview = {
      timestamp: new Date(),
      uptime: Date.now() - this.startTime.getTime(),
      specs: {
        total: specsArray.length,
        draft: specsArray.filter(s => s.status === 'draft').length,
        approved: specsArray.filter(s => s.status === 'approved').length,
        implemented: specsArray.filter(s => s.status === 'implemented').length,
      },
      plans: {
        total: plansArray.length,
        active: plansArray.filter(p => p.status === 'in_progress').length,
        completed: plansArray.filter(p => p.status === 'completed').length,
        blocked: plansArray.filter(p => p.status === 'blocked').length,
      },
      tasks: {
        total: tasksArray.length,
        pending: tasksArray.filter(t => t.status === 'pending').length,
        running: tasksArray.filter(t => t.status === 'running').length,
        completed: tasksArray.filter(t => t.status === 'completed').length,
        failed: tasksArray.filter(t => t.status === 'failed').length,
      },
      agents: {
        total: agentsArray.length,
        idle: agentsArray.filter(a => a.status === 'idle').length,
        busy: agentsArray.filter(a => a.status === 'busy').length,
        error: agentsArray.filter(a => a.status === 'error').length,
      },
      health,
      warnings,
      errors,
    };

    // Store in history
    this.history.push(overview);
    if (this.history.length > this.config.maxHistoryEntries) {
      this.history.shift();
    }

    return overview;
  }

  getSpecStatus(specId?: string): SpecStatus | SpecStatus[] | null {
    if (specId) {
      return this.specs.get(specId) || null;
    }
    return Array.from(this.specs.values());
  }

  getPlanStatus(planId?: string): PlanStatus | PlanStatus[] | null {
    if (planId) {
      return this.plans.get(planId) || null;
    }
    return Array.from(this.plans.values());
  }

  getTaskStatus(taskId?: string): TaskStatus | TaskStatus[] | null {
    if (taskId) {
      return this.tasks.get(taskId) || null;
    }
    return Array.from(this.tasks.values());
  }

  getAgentActivity(agentId?: string): AgentActivity | AgentActivity[] | null {
    if (agentId) {
      return this.agents.get(agentId) || null;
    }
    return Array.from(this.agents.values());
  }

  getHistory(): SystemOverview[] {
    return [...this.history];
  }

  // ===== Rendering Methods =====

  render(format: OutputFormat = 'table'): string {
    switch (format) {
      case 'json':
        return this.renderJSON();
      case 'html':
        return this.renderHTML();
      case 'table':
      default:
        return this.renderTable();
    }
  }

  private renderJSON(): string {
    const overview = this.getOverview();
    const data = {
      overview,
      specs: Array.from(this.specs.values()),
      plans: Array.from(this.plans.values()),
      tasks: Array.from(this.tasks.values()),
      agents: Array.from(this.agents.values()),
    };
    return JSON.stringify(data, null, 2);
  }

  private renderTable(): string {
    const overview = this.getOverview();
    const lines: string[] = [];

    // Header
    lines.push(chalk.cyan.bold('SpecKit Status Dashboard'));
    lines.push(chalk.gray('─'.repeat(60)));
    lines.push('');

    // System Overview
    const healthColor = {
      healthy: chalk.green,
      degraded: chalk.yellow,
      unhealthy: chalk.red,
    }[overview.health];

    lines.push(chalk.white.bold('System Overview'));
    lines.push(`  ${chalk.white('Status:')} ${healthColor(overview.health.toUpperCase())}`);
    lines.push(`  ${chalk.white('Uptime:')} ${this.formatDuration(overview.uptime)}`);
    lines.push('');

    // Specs Summary
    lines.push(chalk.cyan.bold('Specifications'));
    const specTable = new Table({
      head: ['Status', 'Count'],
      colWidths: [20, 15],
    });
    specTable.push(
      ['Total', overview.specs.total.toString()],
      ['Draft', overview.specs.draft.toString()],
      ['Approved', chalk.green(overview.specs.approved.toString())],
      ['Implemented', chalk.blue(overview.specs.implemented.toString())],
    );
    lines.push(specTable.toString());
    lines.push('');

    // Plans Summary
    lines.push(chalk.cyan.bold('Plans'));
    const planTable = new Table({
      head: ['Status', 'Count'],
      colWidths: [20, 15],
    });
    planTable.push(
      ['Total', overview.plans.total.toString()],
      ['Active', chalk.cyan(overview.plans.active.toString())],
      ['Completed', chalk.green(overview.plans.completed.toString())],
      ['Blocked', overview.plans.blocked > 0 ? chalk.red(overview.plans.blocked.toString()) : '0'],
    );
    lines.push(planTable.toString());
    lines.push('');

    // Tasks Summary
    lines.push(chalk.cyan.bold('Tasks'));
    const taskTable = new Table({
      head: ['Status', 'Count'],
      colWidths: [20, 15],
    });
    taskTable.push(
      ['Total', overview.tasks.total.toString()],
      ['Pending', chalk.gray(overview.tasks.pending.toString())],
      ['Running', chalk.cyan(overview.tasks.running.toString())],
      ['Completed', chalk.green(overview.tasks.completed.toString())],
      ['Failed', overview.tasks.failed > 0 ? chalk.red(overview.tasks.failed.toString()) : '0'],
    );
    lines.push(taskTable.toString());
    lines.push('');

    // Agents Summary
    lines.push(chalk.cyan.bold('Agents'));
    const agentTable = new Table({
      head: ['Status', 'Count'],
      colWidths: [20, 15],
    });
    agentTable.push(
      ['Total', overview.agents.total.toString()],
      ['Idle', chalk.gray(overview.agents.idle.toString())],
      ['Busy', chalk.cyan(overview.agents.busy.toString())],
      ['Error', overview.agents.error > 0 ? chalk.red(overview.agents.error.toString()) : '0'],
    );
    lines.push(agentTable.toString());
    lines.push('');

    // Warnings and Errors
    if (this.config.showWarnings && overview.warnings.length > 0) {
      lines.push(chalk.yellow.bold('Warnings'));
      for (const warning of overview.warnings) {
        lines.push(`  ${chalk.yellow('!')} ${warning}`);
      }
      lines.push('');
    }

    if (this.config.showErrors && overview.errors.length > 0) {
      lines.push(chalk.red.bold('Errors'));
      for (const error of overview.errors) {
        lines.push(`  ${chalk.red('x')} ${error}`);
      }
      lines.push('');
    }

    // Detailed Lists (if not compact)
    if (!this.config.compactMode) {
      // Active Tasks
      const runningTasks = Array.from(this.tasks.values()).filter(t => t.status === 'running');
      if (runningTasks.length > 0) {
        lines.push(chalk.cyan.bold('Active Tasks'));
        const activeTable = new Table({
          head: ['ID', 'Name', 'Agent', 'Priority'],
          colWidths: [15, 30, 15, 12],
        });
        for (const task of runningTasks.slice(0, 10)) {
          activeTable.push([
            task.id.slice(0, 12) + '...',
            task.name.slice(0, 28),
            task.assignedAgent || '-',
            task.priority,
          ]);
        }
        lines.push(activeTable.toString());
        lines.push('');
      }

      // Busy Agents
      const busyAgents = Array.from(this.agents.values()).filter(a => a.status === 'busy');
      if (busyAgents.length > 0) {
        lines.push(chalk.cyan.bold('Busy Agents'));
        const busyTable = new Table({
          head: ['ID', 'Name', 'Type', 'Current Task'],
          colWidths: [15, 20, 15, 25],
        });
        for (const agent of busyAgents.slice(0, 10)) {
          busyTable.push([
            agent.id.slice(0, 12) + '...',
            agent.name.slice(0, 18),
            agent.type,
            agent.currentTask || '-',
          ]);
        }
        lines.push(busyTable.toString());
      }
    }

    return lines.join('\n');
  }

  private renderHTML(): string {
    const overview = this.getOverview();
    const healthColor = {
      healthy: '#22c55e',
      degraded: '#eab308',
      unhealthy: '#ef4444',
    }[overview.health];

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SpecKit Status Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #eee; padding: 20px; }
    .dashboard { max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 30px; }
    .header h1 { color: #06b6d4; font-size: 28px; }
    .header .status { display: inline-block; padding: 4px 12px; border-radius: 4px; background: ${healthColor}; color: white; font-weight: bold; margin-left: 10px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .card { background: #16213e; border-radius: 8px; padding: 20px; }
    .card h3 { color: #06b6d4; margin-bottom: 15px; font-size: 16px; }
    .stat { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #333; }
    .stat:last-child { border-bottom: none; }
    .stat-label { color: #888; }
    .stat-value { font-weight: bold; }
    .stat-value.success { color: #22c55e; }
    .stat-value.warning { color: #eab308; }
    .stat-value.error { color: #ef4444; }
    .alerts { margin-top: 30px; }
    .alert { padding: 12px 16px; border-radius: 4px; margin-bottom: 10px; }
    .alert.warning { background: rgba(234, 179, 8, 0.2); border-left: 4px solid #eab308; }
    .alert.error { background: rgba(239, 68, 68, 0.2); border-left: 4px solid #ef4444; }
    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="dashboard">
    <div class="header">
      <h1>SpecKit Status Dashboard <span class="status">${overview.health.toUpperCase()}</span></h1>
      <p style="color: #888; margin-top: 8px;">Last updated: ${overview.timestamp.toLocaleString()}</p>
    </div>

    <div class="grid">
      <div class="card">
        <h3>Specifications</h3>
        <div class="stat"><span class="stat-label">Total</span><span class="stat-value">${overview.specs.total}</span></div>
        <div class="stat"><span class="stat-label">Draft</span><span class="stat-value">${overview.specs.draft}</span></div>
        <div class="stat"><span class="stat-label">Approved</span><span class="stat-value success">${overview.specs.approved}</span></div>
        <div class="stat"><span class="stat-label">Implemented</span><span class="stat-value">${overview.specs.implemented}</span></div>
      </div>

      <div class="card">
        <h3>Plans</h3>
        <div class="stat"><span class="stat-label">Total</span><span class="stat-value">${overview.plans.total}</span></div>
        <div class="stat"><span class="stat-label">Active</span><span class="stat-value">${overview.plans.active}</span></div>
        <div class="stat"><span class="stat-label">Completed</span><span class="stat-value success">${overview.plans.completed}</span></div>
        <div class="stat"><span class="stat-label">Blocked</span><span class="stat-value ${overview.plans.blocked > 0 ? 'error' : ''}">${overview.plans.blocked}</span></div>
      </div>

      <div class="card">
        <h3>Tasks</h3>
        <div class="stat"><span class="stat-label">Total</span><span class="stat-value">${overview.tasks.total}</span></div>
        <div class="stat"><span class="stat-label">Running</span><span class="stat-value">${overview.tasks.running}</span></div>
        <div class="stat"><span class="stat-label">Completed</span><span class="stat-value success">${overview.tasks.completed}</span></div>
        <div class="stat"><span class="stat-label">Failed</span><span class="stat-value ${overview.tasks.failed > 0 ? 'error' : ''}">${overview.tasks.failed}</span></div>
      </div>

      <div class="card">
        <h3>Agents</h3>
        <div class="stat"><span class="stat-label">Total</span><span class="stat-value">${overview.agents.total}</span></div>
        <div class="stat"><span class="stat-label">Idle</span><span class="stat-value">${overview.agents.idle}</span></div>
        <div class="stat"><span class="stat-label">Busy</span><span class="stat-value">${overview.agents.busy}</span></div>
        <div class="stat"><span class="stat-label">Error</span><span class="stat-value ${overview.agents.error > 0 ? 'error' : ''}">${overview.agents.error}</span></div>
      </div>
    </div>

    ${overview.warnings.length > 0 || overview.errors.length > 0 ? `
    <div class="alerts">
      ${overview.warnings.map(w => `<div class="alert warning">${w}</div>`).join('')}
      ${overview.errors.map(e => `<div class="alert error">${e}</div>`).join('')}
    </div>
    ` : ''}

    <div class="footer">
      <p>SpecKit Integration Dashboard - Uptime: ${this.formatDuration(overview.uptime)}</p>
    </div>
  </div>
</body>
</html>`;
  }

  // ===== Auto-Refresh =====

  startAutoRefresh(callback?: (overview: SystemOverview) => void): void {
    this.stopAutoRefresh();
    this.refreshTimer = setInterval(() => {
      const overview = this.getOverview();
      this.emit('dashboard:refresh', overview);
      callback?.(overview);
    }, this.config.refreshInterval);
  }

  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  // ===== Utility Methods =====

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // ===== Bulk Operations =====

  clearAll(): void {
    this.specs.clear();
    this.plans.clear();
    this.tasks.clear();
    this.agents.clear();
    this.history = [];
    this.emit('dashboard:cleared');
  }

  importState(state: {
    specs?: SpecStatus[];
    plans?: PlanStatus[];
    tasks?: TaskStatus[];
    agents?: AgentActivity[];
  }): void {
    if (state.specs) {
      for (const spec of state.specs) {
        this.specs.set(spec.id, spec);
      }
    }
    if (state.plans) {
      for (const plan of state.plans) {
        this.plans.set(plan.id, plan);
      }
    }
    if (state.tasks) {
      for (const task of state.tasks) {
        this.tasks.set(task.id, task);
      }
    }
    if (state.agents) {
      for (const agent of state.agents) {
        this.agents.set(agent.id, agent);
      }
    }
    this.emit('dashboard:imported', state);
  }

  exportState(): {
    specs: SpecStatus[];
    plans: PlanStatus[];
    tasks: TaskStatus[];
    agents: AgentActivity[];
    overview: SystemOverview;
  } {
    return {
      specs: Array.from(this.specs.values()),
      plans: Array.from(this.plans.values()),
      tasks: Array.from(this.tasks.values()),
      agents: Array.from(this.agents.values()),
      overview: this.getOverview(),
    };
  }
}

export default StatusDashboard;
