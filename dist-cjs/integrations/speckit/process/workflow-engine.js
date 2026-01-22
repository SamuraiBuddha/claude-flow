"use strict";
/**
 * Workflow Engine for SpecKit Integration
 * Full workflow management: specify -> plan -> tasks -> implement -> validate
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngine = void 0;
const node_events_1 = require("node:events");
// ===== Default Workflow Definition =====
const DEFAULT_PHASES = [
    {
        id: 'initialize',
        name: 'Initialize',
        description: 'Initialize workflow and validate inputs',
        gates: [],
        timeout: 30000,
        retryable: false,
        maxRetries: 0,
    },
    {
        id: 'specify',
        name: 'Specify',
        description: 'Create and validate specification',
        gates: ['SPEC_APPROVED'],
        timeout: 0, // No timeout
        retryable: true,
        maxRetries: 3,
    },
    {
        id: 'plan',
        name: 'Plan',
        description: 'Create implementation plan from specification',
        gates: ['PLAN_APPROVED'],
        timeout: 0,
        retryable: true,
        maxRetries: 3,
    },
    {
        id: 'assign',
        name: 'Assign',
        description: 'Assign agents to tasks',
        gates: [],
        timeout: 60000,
        retryable: true,
        maxRetries: 3,
    },
    {
        id: 'implement',
        name: 'Implement',
        description: 'Execute tasks and implement solution',
        gates: ['TASKS_COMPLETE'],
        timeout: 0,
        retryable: true,
        maxRetries: 3,
    },
    {
        id: 'test',
        name: 'Test',
        description: 'Run tests and validate implementation',
        gates: ['TESTS_PASS'],
        timeout: 0,
        retryable: true,
        maxRetries: 3,
    },
    {
        id: 'review',
        name: 'Review',
        description: 'Review implementation and approve',
        gates: [],
        timeout: 0,
        retryable: true,
        maxRetries: 3,
    },
    {
        id: 'validate',
        name: 'Validate',
        description: 'Final validation before completion',
        gates: [],
        timeout: 60000,
        retryable: true,
        maxRetries: 3,
    },
    {
        id: 'complete',
        name: 'Complete',
        description: 'Workflow completed successfully',
        gates: [],
        timeout: 0,
        retryable: false,
        maxRetries: 0,
    },
];
// ===== Workflow Engine Class =====
class WorkflowEngine extends node_events_1.EventEmitter {
    config;
    workflows = new Map();
    instances = new Map();
    // External dependencies (injected)
    gates;
    audit;
    dashboard;
    constructor(config = {}) {
        super();
        this.config = {
            maxConcurrentWorkflows: 10,
            defaultTimeout: 300000, // 5 minutes
            autoStart: false,
            cleanupCompletedAfter: 3600000, // 1 hour
            ...config,
        };
        // Register default workflow
        this.registerDefaultWorkflow();
    }
    // ===== Initialization =====
    async initialize(deps) {
        if (deps) {
            this.gates = deps.gates;
            this.audit = deps.audit;
            this.dashboard = deps.dashboard;
        }
        // Listen to gate events if available
        if (this.gates) {
            this.gates.on('gate:passed', (result) => {
                this.handleGatePassed(result);
            });
        }
        this.emit('engine:initialized');
    }
    async shutdown() {
        // Stop all running workflows
        for (const [id, instance] of this.instances) {
            if (instance.status === 'running') {
                await this.cancelWorkflow(id, 'Engine shutdown');
            }
        }
        this.emit('engine:shutdown');
    }
    // ===== Workflow Registration =====
    registerWorkflow(definition) {
        this.workflows.set(definition.id, definition);
        this.emit('workflow:registered', definition);
    }
    unregisterWorkflow(workflowId) {
        this.workflows.delete(workflowId);
        this.emit('workflow:unregistered', workflowId);
    }
    getWorkflowDefinition(workflowId) {
        return this.workflows.get(workflowId);
    }
    // ===== Workflow Lifecycle =====
    async startWorkflow(workflowId, options = {}) {
        const definition = this.workflows.get(workflowId);
        if (!definition) {
            throw new Error(`Workflow definition '${workflowId}' not found`);
        }
        // Check concurrent workflow limit
        const runningCount = Array.from(this.instances.values()).filter((i) => i.status === 'running').length;
        if (runningCount >= this.config.maxConcurrentWorkflows) {
            throw new Error('Maximum concurrent workflow limit reached');
        }
        const instanceId = this.generateId('workflow-instance');
        const instance = {
            id: instanceId,
            workflowId,
            name: options.name || `${definition.name} - ${new Date().toISOString()}`,
            status: 'running',
            currentPhase: 'initialize',
            phaseHistory: [],
            startedAt: new Date(),
            metadata: options.metadata || {},
            context: {
                taskIds: [],
                agentIds: [],
                artifacts: new Map(),
                variables: new Map(),
                ...options.context,
            },
        };
        this.instances.set(instanceId, instance);
        // Record audit
        this.audit?.recordWorkflowAction('workflow_started', instanceId, `Workflow '${instance.name}' started`, { workflowId, phases: definition.phases.map((p) => p.id) });
        // Enter first phase
        await this.enterPhase(instanceId, 'initialize');
        this.emit('workflow:started', instance);
        // Auto-advance if configured
        if (definition.settings.autoAdvance) {
            await this.advancePhase(instanceId);
        }
        return instance;
    }
    async advancePhase(instanceId, targetPhase) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error(`Workflow instance '${instanceId}' not found`);
        }
        if (instance.status !== 'running') {
            throw new Error(`Cannot advance workflow in '${instance.status}' status`);
        }
        const definition = this.workflows.get(instance.workflowId);
        if (!definition) {
            throw new Error(`Workflow definition '${instance.workflowId}' not found`);
        }
        const currentPhaseIndex = definition.phases.findIndex((p) => p.id === instance.currentPhase);
        const currentPhaseDef = definition.phases[currentPhaseIndex];
        // Check gates for current phase
        if (currentPhaseDef && currentPhaseDef.gates.length > 0 && this.gates) {
            for (const gateId of currentPhaseDef.gates) {
                const result = await this.gates.checkGate(gateId);
                if (result.status !== 'passed') {
                    this.emit('workflow:gate_blocked', { instanceId, gateId, result });
                    throw new Error(`Gate '${gateId}' has not passed: ${result.error || 'Check failed'}`);
                }
            }
        }
        // Determine next phase
        let nextPhase;
        if (targetPhase) {
            const targetIndex = definition.phases.findIndex((p) => p.id === targetPhase);
            if (targetIndex < 0) {
                throw new Error(`Phase '${targetPhase}' not found in workflow`);
            }
            nextPhase = targetPhase;
        }
        else {
            if (currentPhaseIndex >= definition.phases.length - 1) {
                // Already at last phase
                await this.completeWorkflow(instanceId);
                return instance;
            }
            nextPhase = definition.phases[currentPhaseIndex + 1].id;
        }
        // Exit current phase
        await this.exitPhase(instanceId);
        // Enter next phase
        await this.enterPhase(instanceId, nextPhase);
        // Record transition
        const transition = {
            from: instance.currentPhase,
            to: nextPhase,
            timestamp: new Date(),
            reason: targetPhase ? 'Manual advance' : 'Auto advance',
            triggeredBy: 'system',
            automatic: !targetPhase,
        };
        this.emit('workflow:transition', { instanceId, transition });
        // Update dashboard
        this.dashboard?.updatePlan(instance.context.planId || instanceId, {
            status: nextPhase === 'complete' ? 'completed' : 'in_progress',
        });
        return instance;
    }
    async pauseWorkflow(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error(`Workflow instance '${instanceId}' not found`);
        }
        if (instance.status !== 'running') {
            throw new Error(`Cannot pause workflow in '${instance.status}' status`);
        }
        instance.status = 'paused';
        instance.pausedAt = new Date();
        this.audit?.recordWorkflowAction('workflow_advanced', instanceId, `Workflow '${instance.name}' paused at phase '${instance.currentPhase}'`);
        this.emit('workflow:paused', instance);
    }
    async resumeWorkflow(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error(`Workflow instance '${instanceId}' not found`);
        }
        if (instance.status !== 'paused') {
            throw new Error(`Cannot resume workflow in '${instance.status}' status`);
        }
        instance.status = 'running';
        instance.pausedAt = undefined;
        this.audit?.recordWorkflowAction('workflow_advanced', instanceId, `Workflow '${instance.name}' resumed at phase '${instance.currentPhase}'`);
        this.emit('workflow:resumed', instance);
    }
    async cancelWorkflow(instanceId, reason) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error(`Workflow instance '${instanceId}' not found`);
        }
        if (instance.status === 'completed' || instance.status === 'cancelled') {
            return; // Already in terminal state
        }
        // Exit current phase
        await this.exitPhase(instanceId, 'cancelled');
        instance.status = 'cancelled';
        instance.completedAt = new Date();
        instance.error = reason;
        this.audit?.recordWorkflowAction('workflow_failed', instanceId, `Workflow '${instance.name}' cancelled: ${reason || 'No reason provided'}`, { reason }, false, reason);
        this.emit('workflow:cancelled', { instance, reason });
    }
    async rollbackWorkflow(instanceId, targetPhase) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error(`Workflow instance '${instanceId}' not found`);
        }
        const definition = this.workflows.get(instance.workflowId);
        if (!definition) {
            throw new Error(`Workflow definition '${instance.workflowId}' not found`);
        }
        // Determine rollback target
        let rollbackTo;
        if (targetPhase) {
            rollbackTo = targetPhase;
        }
        else {
            // Rollback to previous phase
            const currentIndex = definition.phases.findIndex((p) => p.id === instance.currentPhase);
            if (currentIndex <= 0) {
                throw new Error('Cannot rollback from initial phase');
            }
            rollbackTo = definition.phases[currentIndex - 1].id;
        }
        // Record rollback in history
        const currentHistory = instance.phaseHistory[instance.phaseHistory.length - 1];
        if (currentHistory) {
            currentHistory.status = 'rolled_back';
            currentHistory.exitedAt = new Date();
        }
        // Reset gates for rolled back phases if needed
        if (this.gates) {
            const rollbackIndex = definition.phases.findIndex((p) => p.id === rollbackTo);
            for (let i = rollbackIndex; i < definition.phases.length; i++) {
                const phase = definition.phases[i];
                for (const gateId of phase.gates) {
                    this.gates.resetGate(gateId);
                }
            }
        }
        // Enter rollback target phase
        await this.enterPhase(instanceId, rollbackTo);
        this.audit?.recordWorkflowAction('workflow_rolled_back', instanceId, `Workflow '${instance.name}' rolled back from '${instance.currentPhase}' to '${rollbackTo}'`, { from: instance.currentPhase, to: rollbackTo });
        this.emit('workflow:rolled_back', { instanceId, from: instance.currentPhase, to: rollbackTo });
    }
    // ===== Phase Management =====
    async enterPhase(instanceId, phase) {
        const instance = this.instances.get(instanceId);
        if (!instance)
            return;
        const definition = this.workflows.get(instance.workflowId);
        const phaseDef = definition?.phases.find((p) => p.id === phase);
        instance.currentPhase = phase;
        const historyEntry = {
            phase,
            enteredAt: new Date(),
            status: 'entered',
            gateResults: new Map(),
        };
        instance.phaseHistory.push(historyEntry);
        // Call phase onEnter hook
        if (phaseDef?.onEnter) {
            try {
                await phaseDef.onEnter();
            }
            catch (error) {
                if (phaseDef.onError) {
                    await phaseDef.onError(error);
                }
            }
        }
        this.emit('workflow:phase_entered', { instanceId, phase });
        this.audit?.recordWorkflowAction('workflow_advanced', instanceId, `Entered phase '${phase}'`, { phase });
    }
    async exitPhase(instanceId, exitStatus = 'completed') {
        const instance = this.instances.get(instanceId);
        if (!instance)
            return;
        const definition = this.workflows.get(instance.workflowId);
        const phaseDef = definition?.phases.find((p) => p.id === instance.currentPhase);
        const historyEntry = instance.phaseHistory[instance.phaseHistory.length - 1];
        if (historyEntry) {
            historyEntry.exitedAt = new Date();
            historyEntry.status = exitStatus;
            historyEntry.duration = historyEntry.exitedAt.getTime() - historyEntry.enteredAt.getTime();
        }
        // Call phase onExit hook
        if (phaseDef?.onExit) {
            try {
                await phaseDef.onExit();
            }
            catch (error) {
                console.warn(`Phase onExit hook failed: ${error}`);
            }
        }
        this.emit('workflow:phase_exited', {
            instanceId,
            phase: instance.currentPhase,
            status: exitStatus,
        });
    }
    async completeWorkflow(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance)
            return;
        await this.exitPhase(instanceId, 'completed');
        instance.status = 'completed';
        instance.completedAt = new Date();
        this.audit?.recordWorkflowAction('workflow_completed', instanceId, `Workflow '${instance.name}' completed successfully`, {
            duration: instance.completedAt.getTime() - instance.startedAt.getTime(),
            phases: instance.phaseHistory.length,
        });
        this.emit('workflow:completed', instance);
        // Schedule cleanup if configured
        if (this.config.cleanupCompletedAfter > 0) {
            setTimeout(() => {
                this.instances.delete(instanceId);
            }, this.config.cleanupCompletedAfter);
        }
    }
    async failWorkflow(instanceId, error) {
        const instance = this.instances.get(instanceId);
        if (!instance)
            return;
        const definition = this.workflows.get(instance.workflowId);
        const phaseDef = definition?.phases.find((p) => p.id === instance.currentPhase);
        // Call phase onError hook
        if (phaseDef?.onError) {
            try {
                await phaseDef.onError(error);
            }
            catch (hookError) {
                console.warn(`Phase onError hook failed: ${hookError}`);
            }
        }
        // Check if rollback is configured
        if (definition?.settings.rollbackOnFailure) {
            try {
                await this.rollbackWorkflow(instanceId);
                return;
            }
            catch (rollbackError) {
                console.warn(`Rollback failed: ${rollbackError}`);
            }
        }
        await this.exitPhase(instanceId, 'cancelled');
        instance.status = 'failed';
        instance.completedAt = new Date();
        instance.error = error.message;
        const historyEntry = instance.phaseHistory[instance.phaseHistory.length - 1];
        if (historyEntry) {
            historyEntry.status = 'failed';
            historyEntry.error = error.message;
        }
        this.audit?.recordWorkflowAction('workflow_failed', instanceId, `Workflow '${instance.name}' failed: ${error.message}`, { error: error.message, phase: instance.currentPhase }, false, error.message);
        this.emit('workflow:failed', { instance, error });
    }
    // ===== Query Methods =====
    getCurrentPhase(instanceId) {
        return this.instances.get(instanceId)?.currentPhase;
    }
    getWorkflowInstance(instanceId) {
        return this.instances.get(instanceId);
    }
    getAllInstances() {
        return Array.from(this.instances.values());
    }
    getRunningInstances() {
        return Array.from(this.instances.values()).filter((i) => i.status === 'running');
    }
    getHistory(instanceId) {
        return this.instances.get(instanceId)?.phaseHistory || [];
    }
    // ===== Event Handlers =====
    handleGatePassed(result) {
        // Find workflows waiting on this gate
        for (const [instanceId, instance] of this.instances) {
            if (instance.status !== 'running')
                continue;
            const definition = this.workflows.get(instance.workflowId);
            if (!definition)
                continue;
            const currentPhaseDef = definition.phases.find((p) => p.id === instance.currentPhase);
            if (!currentPhaseDef)
                continue;
            // Check if this gate is required for current phase
            if (currentPhaseDef.gates.includes(result.gateId)) {
                // Record gate result
                const historyEntry = instance.phaseHistory[instance.phaseHistory.length - 1];
                if (historyEntry) {
                    historyEntry.gateResults.set(result.gateId, result);
                }
                // Check if all gates for this phase are now passed
                const allGatesPassed = currentPhaseDef.gates.every((gateId) => {
                    return historyEntry?.gateResults.get(gateId)?.status === 'passed';
                });
                // Auto-advance if configured and all gates passed
                if (allGatesPassed && definition.settings.autoAdvance) {
                    this.advancePhase(instanceId).catch((err) => {
                        console.error(`Auto-advance failed for workflow ${instanceId}:`, err);
                    });
                }
            }
        }
    }
    // ===== Context Management =====
    setWorkflowContext(instanceId, key, value) {
        const instance = this.instances.get(instanceId);
        if (instance) {
            instance.context.variables.set(key, value);
            // Also update gates context if available
            if (this.gates) {
                this.gates.setContext(key, value);
            }
        }
    }
    getWorkflowContext(instanceId, key) {
        return this.instances.get(instanceId)?.context.variables.get(key);
    }
    setWorkflowArtifact(instanceId, key, artifact) {
        const instance = this.instances.get(instanceId);
        if (instance) {
            instance.context.artifacts.set(key, artifact);
        }
    }
    getWorkflowArtifact(instanceId, key) {
        return this.instances.get(instanceId)?.context.artifacts.get(key);
    }
    // ===== Default Workflow =====
    registerDefaultWorkflow() {
        this.registerWorkflow({
            id: 'default-speckit-workflow',
            name: 'SpecKit Default Workflow',
            description: 'Standard workflow: specify -> plan -> tasks -> implement -> validate',
            phases: DEFAULT_PHASES,
            settings: {
                autoAdvance: true,
                strictGates: true,
                rollbackOnFailure: false,
                maxDuration: 0, // No limit
                notifyOnPhaseChange: true,
                preserveHistory: true,
            },
        });
    }
    // ===== Utility Methods =====
    generateId(prefix) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `${prefix}-${timestamp}-${random}`;
    }
    // ===== Export/Import =====
    exportState() {
        return {
            workflows: Array.from(this.workflows.values()),
            instances: Array.from(this.instances.values()).map((i) => ({
                ...i,
                context: {
                    ...i.context,
                    artifacts: Object.fromEntries(i.context.artifacts),
                    variables: Object.fromEntries(i.context.variables),
                },
            })),
        };
    }
    importState(data) {
        if (data.workflows) {
            for (const workflow of data.workflows) {
                this.workflows.set(workflow.id, workflow);
            }
        }
        if (data.instances) {
            for (const instance of data.instances) {
                // Restore Maps from objects
                const restored = {
                    ...instance,
                    context: {
                        ...instance.context,
                        artifacts: instance.context.artifacts instanceof Map
                            ? instance.context.artifacts
                            : new Map(Object.entries(instance.context.artifacts || {})),
                        variables: instance.context.variables instanceof Map
                            ? instance.context.variables
                            : new Map(Object.entries(instance.context.variables || {})),
                    },
                };
                this.instances.set(restored.id, restored);
            }
        }
        this.emit('engine:imported', data);
    }
}
exports.WorkflowEngine = WorkflowEngine;
exports.default = WorkflowEngine;
//# sourceMappingURL=workflow-engine.js.map