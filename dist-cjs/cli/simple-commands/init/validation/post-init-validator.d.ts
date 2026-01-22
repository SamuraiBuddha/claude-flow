export class PostInitValidator {
    constructor(workingDir: any);
    workingDir: any;
    /**
     * Check file integrity (existence, size, readability)
     */
    checkFileIntegrity(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        files: {};
    }>;
    /**
     * Check completeness of initialization
     */
    checkCompleteness(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        missing: never[];
    }>;
    /**
     * Validate directory structure and organization
     */
    validateStructure(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        structure: {};
    }>;
    /**
     * Check permissions on created files and directories
     */
    checkPermissions(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        permissions: {};
    }>;
    validateMemoryStructure(): Promise<{
        valid: boolean;
        dirs: never[];
        files: never[];
    }>;
    validateCoordinationStructure(): Promise<{
        valid: boolean;
        dirs: never[];
    }>;
    validateClaudeStructure(): Promise<{
        valid: boolean;
        dirs: never[];
        hasCommands: boolean;
    }>;
    checkSparcExists(): Promise<boolean>;
    validateSparcStructure(): Promise<{
        valid: boolean;
        hasRoomodes: boolean;
        hasRooDir: boolean;
        dirs: never[];
    }>;
}
//# sourceMappingURL=post-init-validator.d.ts.map