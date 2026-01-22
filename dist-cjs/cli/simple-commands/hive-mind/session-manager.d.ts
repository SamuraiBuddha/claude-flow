export class HiveMindSessionManager {
    constructor(hiveMindDir?: null);
    hiveMindDir: string;
    sessionsDir: string;
    dbPath: string;
    db: any;
    isInMemory: boolean;
    memoryStore: {
        sessions: Map<any, any>;
        checkpoints: Map<any, any>;
        logs: Map<any, any>;
    } | null;
    /**
     * Initialize database with fallback support
     */
    initializeDatabase(): Promise<void>;
    /**
     * Ensure database is initialized before use
     */
    ensureInitialized(): Promise<void>;
    /**
     * Initialize in-memory fallback for session storage
     */
    initializeInMemoryFallback(): void;
    /**
     * Ensure required directories exist
     */
    ensureDirectories(): void;
    /**
     * Initialize database schema for sessions
     */
    initializeSchema(): void;
    /**
     * Run database migrations
     */
    runMigrations(): void;
    /**
     * Create a new session for a swarm
     */
    createSession(swarmId: any, swarmName: any, objective: any, metadata?: {}): Promise<string>;
    /**
     * Save session checkpoint
     */
    saveCheckpoint(sessionId: any, checkpointName: any, checkpointData: any): Promise<string>;
    /**
     * Get active sessions
     */
    getActiveSessions(): Promise<any>;
    /**
     * Get session by ID with full details
     */
    getSession(sessionId: any): Promise<any>;
    /**
     * Pause a session
     */
    pauseSession(sessionId: any): Promise<boolean>;
    /**
     * Resume any previous session (paused, stopped, or inactive)
     */
    resumeSession(sessionId: any): Promise<any>;
    /**
     * Mark session as completed
     */
    completeSession(sessionId: any): boolean;
    /**
     * Archive old sessions
     */
    archiveSessions(daysOld?: number): Promise<any>;
    /**
     * Log session event
     */
    logSessionEvent(sessionId: any, logLevel: any, message: any, agentId?: null, data?: null): Promise<void>;
    /**
     * Get session logs
     */
    getSessionLogs(sessionId: any, limit?: number, offset?: number): any;
    /**
     * Update session progress
     */
    updateSessionProgress(sessionId: any, completionPercentage: any): Promise<void>;
    /**
     * Generate session summary
     */
    generateSessionSummary(sessionId: any): {
        sessionId: any;
        swarmName: any;
        objective: any;
        status: any;
        duration: number;
        statistics: any;
        tasksByType: any;
        checkpointCount: any;
        lastCheckpoint: any;
        timeline: {
            created: any;
            lastUpdated: any;
            paused: any;
            resumed: any;
        };
    } | null;
    /**
     * Export session data
     */
    exportSession(sessionId: any, exportPath?: null): Promise<string>;
    /**
     * Import session data
     */
    importSession(importPath: any): Promise<string>;
    /**
     * Add a child process PID to session
     */
    addChildPid(sessionId: any, pid: any): boolean;
    /**
     * Remove a child process PID from session
     */
    removeChildPid(sessionId: any, pid: any): boolean;
    /**
     * Get all child PIDs for a session
     */
    getChildPids(sessionId: any): Promise<any>;
    /**
     * Stop a session and terminate all child processes
     */
    stopSession(sessionId: any): Promise<boolean>;
    /**
     * Get active sessions with process information
     */
    getActiveSessionsWithProcessInfo(): Promise<any>;
    /**
     * Clean up orphaned processes
     */
    cleanupOrphanedProcesses(): number;
    /**
     * Clean up and close database connection
     */
    close(): void;
}
export default HiveMindSessionManager;
//# sourceMappingURL=session-manager.d.ts.map