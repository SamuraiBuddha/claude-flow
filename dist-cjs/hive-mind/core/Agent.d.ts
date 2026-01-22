/**
 * Base Agent Class
 *
 * Foundation for all agent types in the Hive Mind swarm.
 * Provides core functionality for task execution, communication, and coordination.
 */
import { EventEmitter } from 'events';
import { AgentType, AgentStatus, AgentCapability, Message, MessageType, AgentConfig, ExecutionResult } from '../types.js';
export declare class Agent extends EventEmitter {
    readonly id: string;
    readonly name: string;
    readonly type: AgentType;
    readonly swarmId: string;
    readonly capabilities: AgentCapability[];
    readonly createdAt: Date;
    status: AgentStatus;
    currentTask: string | null;
    messageCount: number;
    private db;
    private mcpWrapper;
    private memory;
    private communicationBuffer;
    private lastHeartbeat;
    private isActive;
    constructor(config: AgentConfig);
    /**
     * Initialize the agent
     */
    initialize(): Promise<void>;
    /**
     * Assign a task to this agent
     */
    assignTask(taskId: string, executionPlan: any): Promise<void>;
    /**
     * Execute assigned task
     */
    private executeTask;
    /**
     * Execute task based on agent type
     */
    protected executeByType(task: any, executionPlan: any): Promise<ExecutionResult>;
    /**
     * Execute a specific phase of the task
     */
    protected executePhase(phase: string, task: any, plan: any): Promise<any>;
    /**
     * Perform analysis phase
     */
    protected performAnalysis(task: any): Promise<any>;
    /**
     * Perform execution phase
     */
    protected performExecution(task: any, plan: any): Promise<any>;
    /**
     * Perform validation phase
     */
    protected performValidation(task: any): Promise<any>;
    /**
     * Execute a specific action
     */
    protected executeAction(action: string, task: any): Promise<any>;
    /**
     * Send a message to another agent or broadcast
     */
    sendMessage(toAgentId: string | null, messageType: MessageType, content: any): Promise<void>;
    /**
     * Receive and process a message
     */
    receiveMessage(message: Message): Promise<void>;
    /**
     * Vote on a consensus proposal
     */
    voteOnProposal(proposalId: string, vote: boolean, reason?: string): Promise<void>;
    /**
     * Update task progress
     */
    protected updateTaskProgress(taskId: string, progress: number): Promise<void>;
    /**
     * Communicate progress to other agents
     */
    protected communicateProgress(taskId: string, phase: string, progress: number): Promise<void>;
    /**
     * Store data in agent memory
     */
    protected storeInMemory(key: string, value: any): Promise<void>;
    /**
     * Retrieve from agent memory
     */
    protected retrieveFromMemory(key: string): Promise<any>;
    /**
     * Learn from task execution
     */
    protected learnFromExecution(task: any, result: ExecutionResult): Promise<void>;
    /**
     * Handle task failure
     */
    protected handleTaskFailure(taskId: string, error: any): Promise<void>;
    /**
     * Start heartbeat loop
     */
    private startHeartbeatLoop;
    /**
     * Start communication processing loop
     */
    private startCommunicationLoop;
    /**
     * Start learning loop
     */
    private startLearningLoop;
    /**
     * Process incoming message
     */
    protected processMessage(message: Message): Promise<void>;
    /**
     * Check if agent is responsive
     */
    isResponsive(): boolean;
    /**
     * Get agent state
     */
    getState(): any;
    /**
     * Shutdown the agent
     */
    shutdown(): Promise<void>;
    private detectTaskType;
    private extractPatterns;
    private analyzeRecentPatterns;
    private updateCapabilities;
    private handleTaskAssignment;
    private handleConsensusRequest;
    private handleQuery;
    private handleCoordination;
    private analyzeProposal;
    private processQuery;
}
//# sourceMappingURL=Agent.d.ts.map