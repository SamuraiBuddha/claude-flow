export class RecoveryManager {
    constructor(workingDir: any);
    workingDir: any;
    /**
     * Perform automated recovery based on failure type
     */
    performRecovery(failureType: any, context?: {}): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Recover from permission denied errors
     */
    recoverFromPermissionDenied(context: any): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Recover from disk space issues
     */
    recoverFromDiskSpace(context: any): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Recover from missing dependencies
     */
    recoverFromMissingDependencies(context: any): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Recover from corrupted configuration
     */
    recoverFromCorruptedConfig(context: any): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Recover from partial initialization
     */
    recoverFromPartialInitialization(context: any): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Recover from SPARC initialization failure
     */
    recoverFromSparcFailure(context: any): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Recover from executable creation failure
     */
    recoverFromExecutableFailure(context: any): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Recover from memory setup failure
     */
    recoverFromMemorySetupFailure(context: any): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Generic recovery for unknown failure types
     */
    performGenericRecovery(failureType: any, context: any): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Validate recovery system
     */
    validateRecoverySystem(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
    }>;
    cleanupTemporaryFiles(): Promise<{
        actions: never[];
    }>;
    cleanupOldBackups(): Promise<{
        actions: never[];
    }>;
    checkAvailableSpace(): Promise<{
        available: number;
    }>;
    attemptDependencyInstallation(dependency: any): Promise<{
        success: boolean;
        error: null;
    }>;
    verifyDependencies(dependencies: any): Promise<{
        allAvailable: boolean;
        missing: never[];
    }>;
    recoverConfigFile(filename: any): Promise<{
        success: boolean;
    }>;
    validateRecoveredConfigs(filenames: any): Promise<{
        valid: boolean;
    }>;
    identifyCompletedItems(): Promise<{
        name: string;
        type: string;
    }[]>;
    identifyMissingItems(): Promise<{
        name: string;
        type: string;
    }[]>;
    completeItem(item: any): Promise<{
        success: boolean;
    }>;
    verifyInitializationComplete(): Promise<{
        complete: boolean;
    }>;
    recoverRoomodesFile(): Promise<{
        success: boolean;
    }>;
    recoverRooDirectory(): Promise<{
        success: boolean;
    }>;
    recoverSparcCommands(): Promise<{
        success: boolean;
    }>;
    createExecutableWrapper(): Promise<{
        success: boolean;
    }>;
    verifyBasicPermissions(): Promise<{
        adequate: boolean;
    }>;
    checkForConflicts(): Promise<{
        conflicts: never[];
    }>;
    testRecoveryProcedure(procedureName: any): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=recovery-manager.d.ts.map