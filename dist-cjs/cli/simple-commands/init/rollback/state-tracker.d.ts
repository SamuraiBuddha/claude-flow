export class StateTracker {
    constructor(workingDir: any);
    workingDir: any;
    stateFile: string;
    /**
     * Record a rollback point
     */
    recordRollbackPoint(type: any, data: any): Promise<{
        success: boolean;
        errors: never[];
    }>;
    /**
     * Create a checkpoint
     */
    createCheckpoint(phase: any, data: any): Promise<{
        success: boolean;
        id: null;
        errors: never[];
    }>;
    /**
     * Update a checkpoint
     */
    updateCheckpoint(checkpointId: any, updates: any): Promise<{
        success: boolean;
        errors: never[];
    }>;
    /**
     * Record a rollback operation
     */
    recordRollback(targetId: any, rollbackType: any, phase?: null): Promise<{
        success: boolean;
        errors: never[];
    }>;
    /**
     * Get rollback points
     */
    getRollbackPoints(): Promise<any>;
    /**
     * Get checkpoints
     */
    getCheckpoints(): Promise<any>;
    /**
     * Get rollback history
     */
    getRollbackHistory(): Promise<any>;
    /**
     * Track file operation
     */
    trackFileOperation(operation: any, filePath: any, metadata?: {}): Promise<{
        success: boolean;
        errors: never[];
    }>;
    /**
     * Get current initialization phase
     */
    getCurrentPhase(): Promise<any>;
    /**
     * Set current initialization phase
     */
    setCurrentPhase(phase: any): Promise<{
        success: boolean;
        errors: never[];
    }>;
    /**
     * Get initialization statistics
     */
    getInitializationStats(): Promise<{
        rollbackPoints: any;
        checkpoints: any;
        rollbackHistory: any;
        fileOperations: any;
        currentPhase: any;
        lastActivity: any;
        phaseHistory: any;
    }>;
    /**
     * Clean up old state data
     */
    cleanupOldState(daysToKeep?: number): Promise<{
        success: boolean;
        cleaned: number;
        errors: never[];
    }>;
    /**
     * Validate state tracking system
     */
    validateStateTracking(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
    }>;
    /**
     * Export state for backup
     */
    exportState(): Promise<{
        success: boolean;
        data: any;
        timestamp: number;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
        timestamp?: undefined;
    }>;
    /**
     * Import state from backup
     */
    importState(stateData: any): Promise<{
        success: boolean;
        errors: never[];
    }>;
    loadState(): Promise<any>;
    saveState(state: any): Promise<void>;
    generateId(): string;
    validateStateStructure(state: any): {
        valid: boolean;
        issues: never[];
    };
}
//# sourceMappingURL=state-tracker.d.ts.map