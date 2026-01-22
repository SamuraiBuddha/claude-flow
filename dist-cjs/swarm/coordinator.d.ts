import { EventEmitter } from 'events';
import { SwarmId, AgentState, TaskDefinition, SwarmObjective, SwarmConfig, SwarmStatus, SwarmMetrics, SwarmStrategy, AgentType, TaskType, SwarmEvent, EventType, SwarmEventEmitter } from './types.js';
export declare class SwarmCoordinator extends EventEmitter implements SwarmEventEmitter {
    private logger;
    private config;
    private swarmId;
    private agents;
    private tasks;
    private objectives;
    private _isRunning;
    private status;
    private startTime?;
    private endTime?;
    private metrics;
    private events;
    private lastHeartbeat;
    private jsonOutputAggregator?;
    private heartbeatTimer?;
    private monitoringTimer?;
    private cleanupTimer?;
    private executionIntervals?;
    private autoStrategy;
    constructor(config?: Partial<SwarmConfig>);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    createObjective(name: string, description: string, strategy?: SwarmStrategy, requirements?: Partial<SwarmObjective['requirements']>): Promise<string>;
    executeObjective(objectiveId: string): Promise<void>;
    registerAgent(name: string, type: AgentType, capabilities?: Partial<AgentState['capabilities']>): Promise<string>;
    unregisterAgent(agentId: string): Promise<void>;
    startAgent(agentId: string): Promise<void>;
    stopAgent(agentId: string): Promise<void>;
    pauseAgent(agentId: string): Promise<void>;
    resumeAgent(agentId: string): Promise<void>;
    createTask(type: TaskType, name: string, description: string, instructions: string, options?: Partial<TaskDefinition>): Promise<string>;
    assignTask(taskId: string, agentId?: string): Promise<void>;
    startTaskExecution(task: TaskDefinition): Promise<void>;
    completeTask(taskId: string, result: any): Promise<void>;
    failTask(taskId: string, error: any): Promise<void>;
    cancelTask(taskId: string, reason: string): Promise<void>;
    selectAgentForTask(task: TaskDefinition): Promise<string | null>;
    private calculateAgentScore;
    private calculateCapabilityMatch;
    private agentHasCapability;
    private agentCanHandleTask;
    private generateSwarmId;
    private mergeWithDefaults;
    private initializeMetrics;
    private initializeProgress;
    private setupEventHandlers;
    emitSwarmEvent(event: SwarmEvent): boolean;
    emitSwarmEvents(events: SwarmEvent[]): boolean;
    onSwarmEvent(type: EventType, handler: (event: SwarmEvent) => void): this;
    offSwarmEvent(type: EventType, handler: (event: SwarmEvent) => void): this;
    filterEvents(predicate: (event: SwarmEvent) => boolean): SwarmEvent[];
    correlateEvents(correlationId: string): SwarmEvent[];
    getSwarmId(): SwarmId;
    getStatus(): SwarmStatus;
    getAgents(): AgentState[];
    getAgent(agentId: string): AgentState | undefined;
    getTasks(): TaskDefinition[];
    getTask(taskId: string): TaskDefinition | undefined;
    getObjectives(): SwarmObjective[];
    getObjective(objectiveId: string): SwarmObjective | undefined;
    getMetrics(): SwarmMetrics;
    getEvents(): SwarmEvent[];
    isRunning(): boolean;
    getUptime(): number;
    getSwarmStatus(): {
        status: SwarmStatus;
        objectives: number;
        tasks: {
            completed: number;
            failed: number;
            total: number;
        };
        agents: {
            total: number;
        };
    };
    private validateConfiguration;
    private initializeSubsystems;
    private startBackgroundProcesses;
    private stopBackgroundProcesses;
    private stopAllAgents;
    private completeRunningTasks;
    private saveState;
    private determineRequiredAgentTypes;
    private getAgentTypeInstructions;
    private getAgentCapabilities;
    private decomposeObjective;
    private createTaskForObjective;
    private analyzeDependencies;
    private convertDependenciesToTaskDependencies;
    private ensureRequiredAgents;
    private scheduleInitialTasks;
    private startTaskExecutionLoop;
    private taskDependenciesMet;
    private getNextInstanceNumber;
    private getDefaultPermissions;
    private initializeAgentCapabilities;
    private initializeAgentEnvironment;
    private startAgentHeartbeat;
    private stopAgentHeartbeat;
    private cleanupAgentEnvironment;
    private getRequiredCapabilities;
    private getRequiredTools;
    private getRequiredPermissions;
    private executeTaskWithAgent;
    private createExecutionPrompt;
    private extractTargetDirectory;
    private executeClaudeTask;
    private determineToolsForTask;
    private simulateTaskExecution;
    private executeCodeGenerationTask;
    private executeAnalysisTask;
    private executeDocumentationTask;
    private executeTestingTask;
    private executeGenericTask;
    private assessTaskQuality;
    private updateAgentMetrics;
    private processDependentTasks;
    private isRecoverableError;
    private isRetryableError;
    private handleTaskFailureCascade;
    private reassignTask;
    private processHeartbeats;
    private updateSwarmMetrics;
    private performCleanup;
    private checkObjectiveCompletion;
    private checkObjectiveFailure;
    private handleAgentError;
    /**
     * Enable JSON output collection for non-interactive mode
     */
    enableJsonOutput(objective: string): void;
    /**
     * Get the final JSON output for the swarm
     */
    getJsonOutput(status?: 'completed' | 'failed' | 'timeout' | 'cancelled'): string | null;
    /**
     * Save JSON output to file
     */
    saveJsonOutput(filePath: string, status?: 'completed' | 'failed' | 'timeout' | 'cancelled'): Promise<void>;
    /**
     * Track agent activity in JSON output
     */
    private trackAgentInJsonOutput;
    /**
     * Track task activity in JSON output
     */
    private trackTaskInJsonOutput;
    /**
     * Add output to JSON aggregator
     */
    private addOutputToJsonAggregator;
    /**
     * Add insight to JSON aggregator
     */
    addInsight(insight: string): void;
    /**
     * Add artifact to JSON aggregator
     */
    addArtifact(key: string, artifact: any): void;
    /**
     * Create a Gradio application
     */
    private createGradioApp;
    /**
     * Create a Python REST API (FastAPI)
     */
    private createPythonRestAPI;
}
//# sourceMappingURL=coordinator.d.ts.map