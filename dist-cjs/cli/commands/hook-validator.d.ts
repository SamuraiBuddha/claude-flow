/**
 * Hook validation utilities
 */
import type { HookType } from './hook-types.js';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Validate hook parameters before execution
 */
export declare function validateHookParams(hookType: HookType, params: Record<string, any>): ValidationResult;
/**
 * Sanitize hook parameters for safe execution
 */
export declare function sanitizeHookParams(params: Record<string, any>): Record<string, any>;
//# sourceMappingURL=hook-validator.d.ts.map