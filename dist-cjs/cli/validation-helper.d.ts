/**
 * CLI Parameter Validation Helper
 * Provides standardized error messages for invalid parameters
 */
export declare class ValidationHelper {
    /**
     * Validate enum parameter
     */
    static validateEnum(value: string, paramName: string, validOptions: string[], commandPath: string): void;
    /**
     * Validate numeric parameter
     */
    static validateNumber(value: string, paramName: string, min?: number, max?: number, commandPath?: string): number;
    /**
     * Validate required parameter
     */
    static validateRequired(value: any, paramName: string, commandPath?: string): void;
    /**
     * Validate file path exists
     */
    static validateFilePath(path: string, paramName: string, commandPath?: string): Promise<void>;
    /**
     * Validate boolean flag
     */
    static validateBoolean(value: string, paramName: string, commandPath?: string): boolean;
}
//# sourceMappingURL=validation-helper.d.ts.map