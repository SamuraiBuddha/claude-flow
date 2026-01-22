import { EventEmitter } from 'node:events';
export interface BackgroundTask {
    id: string;
    type: 'claude-spawn' | 'script' | 'command';
    command: string;
    args: string[];
    options?: {
        cwd?: string;
        env?: Record<string, string>;
        timeout?: number;
        retries?: number;
        detached?: boolean;
    };
    status: 'pending' | 'running' | 'completed' | 'failed';
    pid?: number;
    output?: string;
    error?: string;
    startTime?: Date;
    endTime?: Date;
    retryCount: number;
}
export interface BackgroundExecutorConfig {
    maxConcurrentTasks: number;
    defaultTimeout: number;
    logPath: string;
    enablePersistence: boolean;
    checkInterval: number;
    cleanupInterval: number;
    maxRetries: number;
}
export declare class BackgroundExecutor extends EventEmitter {
    private logger;
    private config;
    private tasks;
    private processes;
    private queue;
    private isRunning;
    private checkTimer?;
    private cleanupTimer?;
    constructor(config?: Partial<BackgroundExecutorConfig>);
    start(): Promise<void>;
    stop(): Promise<void>;
    submitTask(type: BackgroundTask['type'], command: string, args?: string[], options?: BackgroundTask['options']): Promise<string>;
    submitClaudeTask(prompt: string, tools?: string[], options?: Partial<{
        cwd: string;
        env: Record<string, string>;
        timeout: number;
        model?: string;
        maxTokens?: number;
    }>): Promise<string>;
    private processQueue;
    private executeTask;
    private checkRunningTasks;
    private cleanupCompletedTasks;
    private saveTaskState;
    private saveTaskOutput;
    getTask(taskId: string): BackgroundTask | undefined;
    getTasks(status?: BackgroundTask['status']): BackgroundTask[];
    waitForTask(taskId: string, timeout?: number): Promise<BackgroundTask>;
    killTask(taskId: string): Promise<void>;
    getStatus(): {
        running: number;
        pending: number;
        completed: number;
        failed: number;
        queueLength: number;
    };
}
//# sourceMappingURL=background-executor.d.ts.map