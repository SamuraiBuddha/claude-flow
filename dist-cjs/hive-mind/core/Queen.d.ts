/**
 * Queen Coordinator Class
 *
 * The Queen manages high-level coordination, decision-making,
 * and strategic planning for the Hive Mind swarm.
 */
import { EventEmitter } from 'events';
import { Agent } from './Agent.js';
import { SwarmTopology, Task, QueenMode, QueenDecision } from '../types.js';
interface QueenConfig {
    swarmId: string;
    mode: QueenMode;
    topology: SwarmTopology;
}
export declare class Queen extends EventEmitter {
    private id;
    private config;
    private agents;
    private taskQueue;
    private strategies;
    private db;
    private mcpWrapper;
    private isActive;
    constructor(config: QueenConfig);
    /**
     * Initialize the Queen and her coordination capabilities
     */
    initialize(): Promise<void>;
    /**
     * Register a new agent with the Queen
     */
    registerAgent(agent: Agent): Promise<void>;
    /**
     * Handle task submission
     */
    onTaskSubmitted(task: Task): Promise<QueenDecision>;
    /**
     * Make a strategic decision about task execution
     */
    private makeStrategicDecision;
    /**
     * Select optimal coordination strategy
     */
    private selectOptimalStrategy;
    /**
     * Select best agents for a task
     */
    private selectAgentsForTask;
    /**
     * Score an agent for a specific task
     */
    private scoreAgentForTask;
    /**
     * Get type suitability score for a task
     */
    private getTypeSuitabilityForTask;
    /**
     * Detect task type from description
     */
    private detectTaskType;
    /**
     * Create execution plan for task
     */
    private createExecutionPlan;
    /**
     * Initiate consensus process
     */
    private initiateConsensus;
    /**
     * Apply Queen's decision
     */
    private applyDecision;
    /**
     * Start coordination loop
     */
    private startCoordinationLoop;
    /**
     * Start optimization loop
     */
    private startOptimizationLoop;
    /**
     * Initialize coordination strategies
     */
    private initializeStrategies;
    /**
     * Helper methods
     */
    private getAvailableAgents;
    private analyzeTask;
    private analyzeAgentCapabilities;
    private broadcastAgentRegistration;
    private broadcastConsensusRequest;
    private determineAgentRole;
    private getAgentResponsibilities;
    private createCheckpoints;
    private createFallbackPlan;
    private monitorAgentHealth;
    private checkTaskProgress;
    private checkRebalancing;
    private analyzePerformancePatterns;
    private optimizeStrategies;
    private trainNeuralPatterns;
    private handleAgentFailure;
    private handleStalledTask;
    private isTaskStalled;
    private reassignTask;
    private applyPerformanceRecommendations;
    private adjustStrategy;
    /**
     * Shutdown the Queen
     */
    shutdown(): Promise<void>;
}
export {};
//# sourceMappingURL=Queen.d.ts.map