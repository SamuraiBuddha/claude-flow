export class RollbackExecutor {
    constructor(workingDir: any);
    workingDir: any;
    /**
     * Execute full rollback to pre-initialization state
     */
    executeFullRollback(backupId: any): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Execute partial rollback for specific component
     */
    executePartialRollback(phase: any, checkpoint: any): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Rollback SPARC initialization
     */
    rollbackSparcInitialization(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Rollback Claude commands
     */
    rollbackClaudeCommands(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Rollback memory setup
     */
    rollbackMemorySetup(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Rollback coordination setup
     */
    rollbackCoordinationSetup(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Rollback executable creation
     */
    rollbackExecutableCreation(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Generic phase rollback
     */
    rollbackGenericPhase(phase: any, checkpoint: any): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Clean up all initialization artifacts
     */
    cleanupInitializationArtifacts(): Promise<{
        success: boolean;
        errors: never[];
        actions: never[];
    }>;
    /**
     * Restore from backup
     */
    restoreFromBackup(backupId: any): Promise<{
        success: boolean;
        errors: never[];
        actions: never[];
    }>;
    /**
     * Verify rollback completed successfully
     */
    verifyRollback(): Promise<{
        success: boolean;
        errors: never[];
        actions: never[];
    }>;
    /**
     * Remove SPARC content from CLAUDE.md
     */
    removeSPARCContentFromClaudeMd(): Promise<void>;
    /**
     * Reverse a specific action
     */
    reverseAction(action: any): Promise<{
        success: boolean;
        description: string;
    }>;
}
//# sourceMappingURL=rollback-executor.d.ts.map