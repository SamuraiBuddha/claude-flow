export class ConfigValidator {
    constructor(workingDir: any);
    workingDir: any;
    /**
     * Validate .roomodes configuration file
     */
    validateRoomodes(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        config: null;
    }>;
    /**
     * Validate CLAUDE.md configuration
     */
    validateClaudeMd(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        content: null;
    }>;
    /**
     * Validate memory configuration
     */
    validateMemoryConfig(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        data: null;
    }>;
    /**
     * Validate coordination configuration
     */
    validateCoordinationConfig(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        content: null;
    }>;
    /**
     * Validate executable configuration
     */
    validateExecutable(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
    }>;
    validateRoomodesStructure(config: any): {
        valid: boolean;
        errors: never[];
        warnings: never[];
    };
    validateModeConfig(modeName: any, modeConfig: any): {
        valid: boolean;
        errors: never[];
    };
    validateMemoryDataStructure(data: any): {
        valid: boolean;
        errors: never[];
        warnings: never[];
    };
}
//# sourceMappingURL=config-validator.d.ts.map