/**
 * SwarmOrchestrator Class
 *
 * Orchestrates task distribution, agent coordination, and
 * execution strategies within the Hive Mind swarm.
 */
import { EventEmitter } from 'events';
import { HiveMind } from '../core/HiveMind.js';
import { Task } from '../types.js';
export declare class SwarmOrchestrator extends EventEmitter {
    private hiveMind;
    private db;
    private mcpWrapper;
    private executionPlans;
    private taskAssignments;
    private activeExecutions;
    private isActive;
    constructor(hiveMind: HiveMind);
    /**
     * Initialize the orchestrator
     */
    initialize(): Promise<void>;
    /**
     * Submit a task for orchestration
     */
    submitTask(task: Task): Promise<void>;
    /**
     * Create execution plan for a task
     */
    private createExecutionPlan;
    /**
     * Execute task according to plan
     */
    private executeTask;
    /**
     * Execute phases in parallel
     */
    private executeParallel;
    /**
     * Execute phases sequentially
     */
    private executeSequential;
    /**
     * Execute a single phase
     */
    private executePhase;
    /**
     * Assign agents to phase tasks
     */
    private assignAgentsToPhase;
    /**
     * Execute a specific assignment
     */
    private executeAssignment;
    /**
     * Assign task to a specific agent
     */
    assignTaskToAgent(taskId: string, agentId: string): Promise<void>;
    /**
     * Cancel a task
     */
    cancelTask(taskId: string): Promise<void>;
    /**
     * Rebalance agent assignments
     */
    rebalance(): Promise<void>;
    /**
     * Strategy implementations
     */
    private getStrategyImplementation;
    /**
     * Analyze task complexity
     */
    private analyzeTaskComplexity;
    /**
     * Create phase assignments
     */
    private createPhaseAssignments;
    /**
     * Create execution checkpoints
     */
    private createCheckpoints;
    /**
     * Get validation criteria for a phase
     */
    private getValidationCriteria;
    /**
     * Find suitable agent for capabilities
     */
    private findSuitableAgent;
    /**
     * Select best agent from candidates
     */
    private selectBestAgent;
    /**
     * Wait for agent to complete task
     */
    private waitForAgentCompletion;
    /**
     * Aggregate results from phase execution
     */
    private aggregatePhaseResults;
    /**
     * Summarize phase results
     */
    private summarizeResults;
    /**
     * Queue assignment for later
     */
    private queueAssignment;
    /**
     * Evaluate checkpoint
     */
    private evaluateCheckpoint;
    /**
     * Evaluate validation criterion
     */
    private evaluateCriterion;
    /**
     * Complete task execution
     */
    private completeTask;
    /**
     * Handle task failure
     */
    private handleTaskFailure;
    /**
     * Create execution summary
     */
    private createExecutionSummary;
    /**
     * Notify agent of task cancellation
     */
    private notifyAgentTaskCancelled;
    /**
     * Analyze load distribution
     */
    private analyzeLoadDistribution;
    /**
     * Apply load balancing reassignments
     */
    private applyReassignments;
    /**
     * Reassign task from one agent to another
     */
    private reassignTask;
    /**
     * Notify agents of reassignment
     */
    private notifyAgentReassignment;
    /**
     * Start task distributor loop
     */
    private startTaskDistributor;
    /**
     * Start progress monitor loop
     */
    private startProgressMonitor;
    /**
     * Start load balancer loop
     */
    private startLoadBalancer;
    /**
     * Calculate task progress
     */
    private calculateProgress;
    /**
     * Shutdown orchestrator
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=SwarmOrchestrator.d.ts.map