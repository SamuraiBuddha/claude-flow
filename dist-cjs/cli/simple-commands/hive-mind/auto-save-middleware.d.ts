/**
 * Create auto-save middleware for a session
 */
export function createAutoSaveMiddleware(sessionId: any, sessionManager: any, options?: {}): AutoSaveMiddleware;
export class AutoSaveMiddleware {
    constructor(sessionId: any, sessionManager: any, saveInterval?: number);
    sessionId: any;
    saveInterval: number;
    sessionManager: any;
    saveTimer: NodeJS.Timeout | null;
    pendingChanges: any[];
    isActive: boolean;
    childProcesses: Set<any>;
    /**
     * Start auto-save monitoring
     */
    start(): void;
    /**
     * Stop auto-save monitoring
     */
    stop(): void;
    /**
     * Track a change for auto-save
     */
    trackChange(changeType: any, data: any): void;
    /**
     * Track task progress
     */
    trackTaskProgress(taskId: any, status: any, result?: null): void;
    /**
     * Track agent activity
     */
    trackAgentActivity(agentId: any, activity: any, data?: null): void;
    /**
     * Track memory updates
     */
    trackMemoryUpdate(key: any, value: any, type?: string): void;
    /**
     * Track consensus decisions
     */
    trackConsensusDecision(topic: any, decision: any, votes: any): void;
    /**
     * Perform auto-save
     */
    performAutoSave(): Promise<void>;
    /**
     * Force immediate save
     */
    forceSave(): Promise<void>;
    /**
     * Get pending changes count
     */
    getPendingChangesCount(): number;
    /**
     * Check if auto-save is active
     */
    isAutoSaveActive(): boolean;
    /**
     * Register a child process
     */
    registerChildProcess(childProcess: any): void;
    /**
     * Clean up all resources and child processes
     */
    cleanup(): Promise<void>;
}
export default AutoSaveMiddleware;
//# sourceMappingURL=auto-save-middleware.d.ts.map