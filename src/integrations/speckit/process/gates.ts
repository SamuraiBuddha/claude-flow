/**
 * Process Gates for SpecKit Integration
 * Defines quality gates and approval checkpoints for workflows
 */

import { EventEmitter } from 'node:events';

// ===== Types =====

export type GateId =
  | 'SPEC_APPROVED'
  | 'PLAN_APPROVED'
  | 'TASKS_COMPLETE'
  | 'TESTS_PASS'
  | 'REVIEW_APPROVED'
  | 'SECURITY_CLEARED'
  | 'PERFORMANCE_VALIDATED'
  | 'DOCUMENTATION_COMPLETE'
  | 'DEPLOYMENT_READY'
  | string; // Allow custom gates

export type GateStatus = 'pending' | 'checking' | 'passed' | 'failed' | 'blocked' | 'skipped';

export interface GateRequirement {
  id: string;
  name: string;
  description: string;
  check: () => Promise<boolean> | boolean;
  mandatory: boolean;
  weight: number; // 0-100, for weighted pass calculations
  errorMessage?: string;
}

export interface GateDefinition {
  id: GateId;
  name: string;
  description: string;
  requirements: GateRequirement[];
  minPassScore: number; // 0-100, percentage of weighted requirements that must pass
  autoAdvance: boolean; // Automatically advance workflow when gate passes
  timeout: number; // ms, 0 for no timeout
  retryable: boolean;
  maxRetries: number;
  dependencies: GateId[];
  metadata?: Record<string, any>;
}

export interface GateCheckResult {
  gateId: GateId;
  status: GateStatus;
  checkedAt: Date;
  duration: number;
  passedRequirements: string[];
  failedRequirements: string[];
  skippedRequirements: string[];
  score: number; // 0-100
  error?: string;
  details?: Record<string, any>;
}

export interface GateState {
  gateId: GateId;
  status: GateStatus;
  lastCheckedAt?: Date;
  lastResult?: GateCheckResult;
  passCount: number;
  failCount: number;
  blockedReason?: string;
  overriddenBy?: string;
  overriddenAt?: Date;
}

export interface GatesConfig {
  defaultTimeout: number;
  parallelChecks: boolean;
  strictMode: boolean; // Fail on any failed mandatory requirement
  allowOverrides: boolean;
  notifyOnPass: boolean;
  notifyOnFail: boolean;
}

// ===== Process Gates Class =====

export class ProcessGates extends EventEmitter {
  private config: GatesConfig;
  private gates: Map<GateId, GateDefinition> = new Map();
  private states: Map<GateId, GateState> = new Map();
  private contextData: Map<string, any> = new Map();

  constructor(config: Partial<GatesConfig> = {}) {
    super();
    this.config = {
      defaultTimeout: 30000,
      parallelChecks: true,
      strictMode: true,
      allowOverrides: true,
      notifyOnPass: true,
      notifyOnFail: true,
      ...config,
    };

    // Register default gates
    this.registerDefaultGates();
  }

  // ===== Initialization =====

  async initialize(): Promise<void> {
    this.emit('gates:initialized');
  }

  async shutdown(): Promise<void> {
    this.emit('gates:shutdown');
  }

  // ===== Gate Registration =====

  registerGate(definition: GateDefinition): void {
    this.gates.set(definition.id, definition);
    this.states.set(definition.id, {
      gateId: definition.id,
      status: 'pending',
      passCount: 0,
      failCount: 0,
    });
    this.emit('gate:registered', definition);
  }

  unregisterGate(gateId: GateId): void {
    this.gates.delete(gateId);
    this.states.delete(gateId);
    this.emit('gate:unregistered', gateId);
  }

  getGate(gateId: GateId): GateDefinition | undefined {
    return this.gates.get(gateId);
  }

  getAllGates(): GateDefinition[] {
    return Array.from(this.gates.values());
  }

  // ===== Context Management =====

  setContext(key: string, value: any): void {
    this.contextData.set(key, value);
  }

  getContext(key: string): any {
    return this.contextData.get(key);
  }

  clearContext(): void {
    this.contextData.clear();
  }

  // ===== Gate Checking =====

  async checkGate(gateId: GateId): Promise<GateCheckResult> {
    const gate = this.gates.get(gateId);
    if (!gate) {
      throw new Error(`Gate '${gateId}' not found`);
    }

    const state = this.states.get(gateId)!;

    // Check if blocked
    if (state.status === 'blocked') {
      return {
        gateId,
        status: 'blocked',
        checkedAt: new Date(),
        duration: 0,
        passedRequirements: [],
        failedRequirements: [],
        skippedRequirements: gate.requirements.map(r => r.id),
        score: 0,
        error: state.blockedReason || 'Gate is blocked',
      };
    }

    // Check dependencies
    for (const depId of gate.dependencies) {
      const depState = this.states.get(depId);
      if (!depState || depState.status !== 'passed') {
        return {
          gateId,
          status: 'blocked',
          checkedAt: new Date(),
          duration: 0,
          passedRequirements: [],
          failedRequirements: [],
          skippedRequirements: gate.requirements.map(r => r.id),
          score: 0,
          error: `Dependency gate '${depId}' has not passed`,
        };
      }
    }

    // Update state to checking
    state.status = 'checking';
    this.emit('gate:checking', { gateId });

    const startTime = Date.now();
    const passedRequirements: string[] = [];
    const failedRequirements: string[] = [];
    const skippedRequirements: string[] = [];
    let totalWeight = 0;
    let passedWeight = 0;

    try {
      // Check requirements
      const checkPromises = gate.requirements.map(async (req) => {
        try {
          const result = await this.withTimeout(
            Promise.resolve(req.check()),
            gate.timeout || this.config.defaultTimeout,
          );

          if (result) {
            passedRequirements.push(req.id);
            passedWeight += req.weight;
          } else {
            failedRequirements.push(req.id);

            // In strict mode, fail immediately on mandatory requirement
            if (this.config.strictMode && req.mandatory) {
              throw new Error(req.errorMessage || `Mandatory requirement '${req.id}' failed`);
            }
          }
          totalWeight += req.weight;
        } catch (error) {
          failedRequirements.push(req.id);
          if (this.config.strictMode && req.mandatory) {
            throw error;
          }
          totalWeight += req.weight;
        }
      });

      if (this.config.parallelChecks) {
        await Promise.all(checkPromises);
      } else {
        for (const promise of checkPromises) {
          await promise;
        }
      }

      // Calculate score
      const score = totalWeight > 0 ? (passedWeight / totalWeight) * 100 : 0;
      const passed = score >= gate.minPassScore;

      const duration = Date.now() - startTime;

      const result: GateCheckResult = {
        gateId,
        status: passed ? 'passed' : 'failed',
        checkedAt: new Date(),
        duration,
        passedRequirements,
        failedRequirements,
        skippedRequirements,
        score,
      };

      // Update state
      state.status = result.status;
      state.lastCheckedAt = result.checkedAt;
      state.lastResult = result;
      if (passed) {
        state.passCount++;
      } else {
        state.failCount++;
      }

      // Emit events
      this.emit('gate:checked', result);
      if (passed) {
        if (this.config.notifyOnPass) {
          this.emit('gate:passed', result);
        }
        // Auto-advance if configured
        if (gate.autoAdvance) {
          this.emit('gate:advance', { gateId, result });
        }
      } else {
        if (this.config.notifyOnFail) {
          this.emit('gate:failed', result);
        }
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: GateCheckResult = {
        gateId,
        status: 'failed',
        checkedAt: new Date(),
        duration,
        passedRequirements,
        failedRequirements,
        skippedRequirements,
        score: totalWeight > 0 ? (passedWeight / totalWeight) * 100 : 0,
        error: error instanceof Error ? error.message : String(error),
      };

      state.status = 'failed';
      state.lastCheckedAt = result.checkedAt;
      state.lastResult = result;
      state.failCount++;

      this.emit('gate:checked', result);
      if (this.config.notifyOnFail) {
        this.emit('gate:failed', result);
      }

      return result;
    }
  }

  async checkAllGates(): Promise<Map<GateId, GateCheckResult>> {
    const results = new Map<GateId, GateCheckResult>();
    const gateIds = Array.from(this.gates.keys());

    // Check gates in dependency order
    const sortedGates = this.topologicalSort(gateIds);

    for (const gateId of sortedGates) {
      const result = await this.checkGate(gateId);
      results.set(gateId, result);

      // Stop if a gate fails in strict mode
      if (this.config.strictMode && result.status === 'failed') {
        break;
      }
    }

    return results;
  }

  // ===== Gate Control =====

  passGate(gateId: GateId, overriddenBy?: string): void {
    const state = this.states.get(gateId);
    if (!state) {
      throw new Error(`Gate '${gateId}' not found`);
    }

    state.status = 'passed';
    state.passCount++;
    if (overriddenBy) {
      state.overriddenBy = overriddenBy;
      state.overriddenAt = new Date();
    }

    this.emit('gate:passed', {
      gateId,
      status: 'passed',
      overriddenBy,
      manual: true,
    });
  }

  blockGate(gateId: GateId, reason: string): void {
    const state = this.states.get(gateId);
    if (!state) {
      throw new Error(`Gate '${gateId}' not found`);
    }

    state.status = 'blocked';
    state.blockedReason = reason;

    this.emit('gate:blocked', { gateId, reason });
  }

  unblockGate(gateId: GateId): void {
    const state = this.states.get(gateId);
    if (!state) {
      throw new Error(`Gate '${gateId}' not found`);
    }

    state.status = 'pending';
    state.blockedReason = undefined;

    this.emit('gate:unblocked', { gateId });
  }

  skipGate(gateId: GateId, reason: string): void {
    const state = this.states.get(gateId);
    if (!state) {
      throw new Error(`Gate '${gateId}' not found`);
    }

    state.status = 'skipped';

    this.emit('gate:skipped', { gateId, reason });
  }

  resetGate(gateId: GateId): void {
    const state = this.states.get(gateId);
    if (!state) {
      throw new Error(`Gate '${gateId}' not found`);
    }

    state.status = 'pending';
    state.lastCheckedAt = undefined;
    state.lastResult = undefined;
    state.blockedReason = undefined;
    state.overriddenBy = undefined;
    state.overriddenAt = undefined;

    this.emit('gate:reset', { gateId });
  }

  resetAllGates(): void {
    for (const gateId of this.gates.keys()) {
      this.resetGate(gateId);
    }
    this.emit('gates:reset_all');
  }

  // ===== State Queries =====

  getGateStatus(gateId: GateId): GateState | undefined {
    return this.states.get(gateId);
  }

  getAllGateStatuses(): Map<GateId, GateState> {
    return new Map(this.states);
  }

  isGatePassed(gateId: GateId): boolean {
    const state = this.states.get(gateId);
    return state?.status === 'passed';
  }

  areAllGatesPassed(): boolean {
    for (const state of this.states.values()) {
      if (state.status !== 'passed' && state.status !== 'skipped') {
        return false;
      }
    }
    return true;
  }

  getBlockedGates(): GateId[] {
    return Array.from(this.states.entries())
      .filter(([_, state]) => state.status === 'blocked')
      .map(([gateId, _]) => gateId);
  }

  getFailedGates(): GateId[] {
    return Array.from(this.states.entries())
      .filter(([_, state]) => state.status === 'failed')
      .map(([gateId, _]) => gateId);
  }

  getPendingGates(): GateId[] {
    return Array.from(this.states.entries())
      .filter(([_, state]) => state.status === 'pending')
      .map(([gateId, _]) => gateId);
  }

  // ===== Default Gates =====

  private registerDefaultGates(): void {
    // SPEC_APPROVED gate
    this.registerGate({
      id: 'SPEC_APPROVED',
      name: 'Specification Approved',
      description: 'Ensures the specification has been reviewed and approved',
      requirements: [
        {
          id: 'spec_exists',
          name: 'Specification Exists',
          description: 'A specification document exists',
          check: () => this.getContext('spec') !== undefined,
          mandatory: true,
          weight: 30,
        },
        {
          id: 'spec_complete',
          name: 'Specification Complete',
          description: 'All required sections are filled',
          check: () => {
            const spec = this.getContext('spec');
            return spec?.completeness >= 80;
          },
          mandatory: true,
          weight: 40,
        },
        {
          id: 'spec_approved',
          name: 'Approval Status',
          description: 'Specification has been approved',
          check: () => {
            const spec = this.getContext('spec');
            return spec?.status === 'approved';
          },
          mandatory: true,
          weight: 30,
        },
      ],
      minPassScore: 100,
      autoAdvance: true,
      timeout: 5000,
      retryable: true,
      maxRetries: 3,
      dependencies: [],
    });

    // PLAN_APPROVED gate
    this.registerGate({
      id: 'PLAN_APPROVED',
      name: 'Plan Approved',
      description: 'Ensures the implementation plan has been created and approved',
      requirements: [
        {
          id: 'plan_exists',
          name: 'Plan Exists',
          description: 'An implementation plan exists',
          check: () => this.getContext('plan') !== undefined,
          mandatory: true,
          weight: 25,
        },
        {
          id: 'plan_has_tasks',
          name: 'Plan Has Tasks',
          description: 'Plan includes actionable tasks',
          check: () => {
            const plan = this.getContext('plan');
            return plan?.tasksTotal > 0;
          },
          mandatory: true,
          weight: 25,
        },
        {
          id: 'plan_has_agents',
          name: 'Agents Assigned',
          description: 'Agents have been assigned to the plan',
          check: () => {
            const plan = this.getContext('plan');
            return plan?.assignedAgents?.length > 0;
          },
          mandatory: false,
          weight: 25,
        },
        {
          id: 'plan_approved',
          name: 'Plan Approved',
          description: 'Plan has been approved',
          check: () => {
            const plan = this.getContext('plan');
            return plan?.status === 'ready' || plan?.status === 'in_progress';
          },
          mandatory: true,
          weight: 25,
        },
      ],
      minPassScore: 75,
      autoAdvance: true,
      timeout: 5000,
      retryable: true,
      maxRetries: 3,
      dependencies: ['SPEC_APPROVED'],
    });

    // TASKS_COMPLETE gate
    this.registerGate({
      id: 'TASKS_COMPLETE',
      name: 'Tasks Complete',
      description: 'Ensures all tasks have been completed successfully',
      requirements: [
        {
          id: 'all_tasks_done',
          name: 'All Tasks Completed',
          description: 'All tasks have finished execution',
          check: () => {
            const plan = this.getContext('plan');
            if (!plan) return false;
            return plan.tasksCompleted >= plan.tasksTotal;
          },
          mandatory: true,
          weight: 50,
        },
        {
          id: 'no_failed_tasks',
          name: 'No Failed Tasks',
          description: 'No tasks have failed',
          check: () => {
            const plan = this.getContext('plan');
            if (!plan) return false;
            return plan.tasksFailed === 0;
          },
          mandatory: false,
          weight: 30,
        },
        {
          id: 'success_rate',
          name: 'Success Rate',
          description: 'Task success rate meets threshold',
          check: () => {
            const plan = this.getContext('plan');
            if (!plan || plan.tasksTotal === 0) return false;
            const successRate = (plan.tasksCompleted / plan.tasksTotal) * 100;
            return successRate >= 90;
          },
          mandatory: true,
          weight: 20,
        },
      ],
      minPassScore: 80,
      autoAdvance: true,
      timeout: 5000,
      retryable: true,
      maxRetries: 3,
      dependencies: ['PLAN_APPROVED'],
    });

    // TESTS_PASS gate
    this.registerGate({
      id: 'TESTS_PASS',
      name: 'Tests Pass',
      description: 'Ensures all tests pass successfully',
      requirements: [
        {
          id: 'tests_exist',
          name: 'Tests Exist',
          description: 'Test suite exists',
          check: () => {
            const tests = this.getContext('tests');
            return tests !== undefined && tests.total > 0;
          },
          mandatory: true,
          weight: 20,
        },
        {
          id: 'tests_run',
          name: 'Tests Executed',
          description: 'Tests have been executed',
          check: () => {
            const tests = this.getContext('tests');
            return tests?.executed === true;
          },
          mandatory: true,
          weight: 20,
        },
        {
          id: 'tests_pass',
          name: 'Tests Pass',
          description: 'All tests pass',
          check: () => {
            const tests = this.getContext('tests');
            if (!tests) return false;
            return tests.passed === tests.total;
          },
          mandatory: true,
          weight: 40,
        },
        {
          id: 'coverage_threshold',
          name: 'Coverage Threshold',
          description: 'Code coverage meets minimum threshold',
          check: () => {
            const tests = this.getContext('tests');
            if (!tests) return false;
            return tests.coverage >= 70;
          },
          mandatory: false,
          weight: 20,
        },
      ],
      minPassScore: 80,
      autoAdvance: true,
      timeout: 60000,
      retryable: true,
      maxRetries: 3,
      dependencies: ['TASKS_COMPLETE'],
    });
  }

  // ===== Utility Methods =====

  private async withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    if (timeout <= 0) return promise;

    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Gate check timed out')), timeout)
      ),
    ]);
  }

  private topologicalSort(gateIds: GateId[]): GateId[] {
    const sorted: GateId[] = [];
    const visited = new Set<GateId>();
    const temp = new Set<GateId>();

    const visit = (gateId: GateId) => {
      if (temp.has(gateId)) {
        throw new Error(`Circular dependency detected at gate '${gateId}'`);
      }
      if (visited.has(gateId)) return;

      temp.add(gateId);

      const gate = this.gates.get(gateId);
      if (gate) {
        for (const depId of gate.dependencies) {
          if (gateIds.includes(depId)) {
            visit(depId);
          }
        }
      }

      temp.delete(gateId);
      visited.add(gateId);
      sorted.push(gateId);
    };

    for (const gateId of gateIds) {
      visit(gateId);
    }

    return sorted;
  }

  // ===== Export State =====

  exportState(): {
    gates: GateDefinition[];
    states: Record<string, GateState>;
    context: Record<string, any>;
  } {
    const states: Record<string, GateState> = {};
    for (const [id, state] of this.states) {
      states[id] = state;
    }

    const context: Record<string, any> = {};
    for (const [key, value] of this.contextData) {
      context[key] = value;
    }

    return {
      gates: Array.from(this.gates.values()),
      states,
      context,
    };
  }

  importState(data: {
    gates?: GateDefinition[];
    states?: Record<string, GateState>;
    context?: Record<string, any>;
  }): void {
    if (data.gates) {
      for (const gate of data.gates) {
        this.gates.set(gate.id, gate);
      }
    }

    if (data.states) {
      for (const [id, state] of Object.entries(data.states)) {
        this.states.set(id, state);
      }
    }

    if (data.context) {
      for (const [key, value] of Object.entries(data.context)) {
        this.contextData.set(key, value);
      }
    }

    this.emit('gates:imported', data);
  }
}

export default ProcessGates;
