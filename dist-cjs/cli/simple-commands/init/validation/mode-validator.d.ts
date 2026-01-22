export class ModeValidator {
    constructor(workingDir: any);
    workingDir: any;
    /**
     * Test all SPARC modes for basic functionality
     */
    testAllModes(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        modes: {};
    }>;
    /**
     * Test a specific SPARC mode
     */
    testMode(modeName: any): Promise<{
        success: boolean;
        error: null;
        checks: {
            accessible: boolean;
            configValid: boolean;
            executable: boolean;
        };
    }>;
    /**
     * Check if SPARC is properly initialized
     */
    checkSparcInitialization(): Promise<{
        initialized: boolean;
        hasRoomodes: boolean;
        hasExecutable: boolean;
        error: null;
    }>;
    /**
     * Get list of available SPARC modes
     */
    getAvailableModes(): Promise<string[]>;
    /**
     * Test if a mode is accessible via CLI
     */
    testModeAccess(modeName: any): Promise<{
        success: boolean;
        error: null;
    }>;
    /**
     * Test mode configuration validity
     */
    testModeConfig(modeName: any): Promise<{
        success: boolean;
        error: null;
    }>;
    /**
     * Test mode execution with a safe dry run
     */
    testModeExecution(modeName: any): Promise<{
        success: boolean;
        error: null;
    }>;
    /**
     * Test SPARC workflow functionality
     */
    testWorkflowFunctionality(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        workflows: {};
    }>;
    /**
     * Test a specific workflow file
     */
    testWorkflowFile(filename: any): Promise<{
        success: boolean;
        error: null;
    }>;
}
//# sourceMappingURL=mode-validator.d.ts.map