/**
 * Advanced Task Executor with timeout handling and process management
 */
import { EventEmitter } from 'node:events';
import { Logger } from '../core/logger.js';
import { TaskDefinition, AgentState } from './types.js';
export interface ExecutionContext {
    task: TaskDefinition;
    agent: AgentState;
    workingDirectory: string;
    tempDirectory: string;
    logDirectory: string;
    environment: Record<string, string>;
    resources: ExecutionResources;
}
export interface ExecutionResources {
    maxMemory: number;
    maxCpuTime: number;
    maxDiskSpace: number;
    maxNetworkConnections: number;
    maxFileHandles: number;
    priority: number;
}
export interface ExecutionResult {
    success: boolean;
    output: string;
    error?: string;
    exitCode: number;
    duration: number;
    resourcesUsed: ResourceUsage;
    artifacts: Record<string, any>;
    metadata: Record<string, any>;
}
export interface ResourceUsage {
    cpuTime: number;
    maxMemory: number;
    diskIO: number;
    networkIO: number;
    fileHandles: number;
}
export interface ExecutionConfig {
    timeoutMs: number;
    retryAttempts: number;
    killTimeout: number;
    resourceLimits: ExecutionResources;
    sandboxed: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    captureOutput: boolean;
    streamOutput: boolean;
    enableMetrics: boolean;
}
export declare class TaskExecutor extends EventEmitter {
    protected logger: Logger;
    protected config: ExecutionConfig;
    private activeExecutions;
    private resourceMonitor;
    private processPool;
    constructor(config?: Partial<ExecutionConfig>);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    executeTask(task: TaskDefinition, agent: AgentState, options?: Partial<ExecutionConfig>): Promise<ExecutionResult>;
    stopExecution(sessionId: string, reason: string): Promise<void>;
    executeClaudeTask(task: TaskDefinition, agent: AgentState, claudeOptions?: ClaudeExecutionOptions): Promise<ExecutionResult>;
    getActiveExecutions(): ExecutionSession[];
    getExecutionMetrics(): ExecutionMetrics;
    private executeWithTimeout;
    private executeClaudeWithTimeout;
    private buildClaudeCommand;
    protected buildClaudePrompt(task: TaskDefinition, agent: AgentState): string;
    protected createExecutionContext(task: TaskDefinition, agent: AgentState): Promise<ExecutionContext>;
    private cleanupExecution;
    protected collectResourceUsage(sessionId: string): Promise<ResourceUsage>;
    protected collectArtifacts(context: ExecutionContext): Promise<Record<string, any>>;
    private scanDirectory;
    private collectLogs;
    private collectOutputs;
    private getPriorityNumber;
    private mergeWithDefaults;
    private setupEventHandlers;
}
declare class ExecutionSession {
    id: string;
    task: TaskDefinition;
    agent: AgentState;
    context: ExecutionContext;
    config: ExecutionConfig;
    private logger;
    private process?;
    private startTime?;
    private endTime?;
    constructor(id: string, task: TaskDefinition, agent: AgentState, context: ExecutionContext, config: ExecutionConfig, logger: Logger);
    execute(): Promise<ExecutionResult>;
    stop(reason: string): Promise<void>;
    cleanup(): Promise<void>;
}
export interface ClaudeExecutionOptions {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    timeout?: number;
    claudePath?: string;
    useStdin?: boolean;
    detached?: boolean;
    outputFormat?: string;
}
export interface ClaudeCommand {
    command: string;
    args: string[];
    input?: string;
}
export interface ExecutionMetrics {
    activeExecutions: number;
    totalExecutions: number;
    averageDuration: number;
    successRate: number;
    resourceUtilization: Record<string, number>;
    errorRate: number;
}
export default TaskExecutor;
//# sourceMappingURL=executor.d.ts.map