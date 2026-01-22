/**
 * Migration Validator - Validates successful migration
 */
import type { ValidationResult } from './types.js';
export declare class MigrationValidator {
    private requiredFiles;
    private requiredCommands;
    validate(projectPath: string): Promise<ValidationResult>;
    private validateFileStructure;
    private validateCommandFiles;
    private validateCommandFileContent;
    private validateConfiguration;
    private validateFileIntegrity;
    private validateFunctionality;
    printValidation(validation: ValidationResult): void;
}
//# sourceMappingURL=migration-validator.d.ts.map