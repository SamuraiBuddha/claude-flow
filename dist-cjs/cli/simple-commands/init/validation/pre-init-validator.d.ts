export class PreInitValidator {
    constructor(workingDir: any);
    workingDir: any;
    /**
     * Check file system permissions
     */
    checkPermissions(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
    }>;
    /**
     * Check available disk space
     */
    checkDiskSpace(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
    }>;
    /**
     * Check for existing files and conflicts
     */
    checkConflicts(force?: boolean): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        conflicts: never[];
    }>;
    /**
     * Check for required dependencies
     */
    checkDependencies(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        dependencies: {};
    }>;
    /**
     * Check environment variables and configuration
     */
    checkEnvironment(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        environment: {};
    }>;
    /**
     * Run all pre-initialization checks
     */
    runAllChecks(options?: {}): Promise<{
        success: boolean;
        results: {
            permissions: {
                success: boolean;
                errors: never[];
                warnings: never[];
            };
            diskSpace: {
                success: boolean;
                errors: never[];
                warnings: never[];
            };
            conflicts: {
                success: boolean;
                errors: never[];
                warnings: never[];
                conflicts: never[];
            };
            dependencies: {
                success: boolean;
                errors: never[];
                warnings: never[];
                dependencies: {};
            };
            environment: {
                success: boolean;
                errors: never[];
                warnings: never[];
                environment: {};
            };
        };
        errors: any[];
        warnings: any[];
    }>;
}
//# sourceMappingURL=pre-init-validator.d.ts.map