/**
 * Hook Safety CLI Commands
 */
export function hookSafetyCommand(subArgs: any, flags: any): Promise<void>;
/**
 * Emergency CLI flags for Claude commands
 */
export function addSafetyFlags(command: any): any;
/**
 * Hook Context Manager - Tracks hook execution context
 */
export class HookContextManager {
    static setContext(hookType: any, depth?: number): void;
    static getContext(): {
        type: string | undefined;
        depth: number;
        sessionId: string | undefined;
        skipHooks: boolean;
        safeMode: boolean;
    };
    static clearContext(): void;
    static isInHookContext(): boolean;
    static setSafeMode(enabled?: boolean): void;
    static setSkipHooks(enabled?: boolean): void;
}
/**
 * Command Validator - Validates commands for hook safety
 */
export class HookCommandValidator {
    /**
     * Validate if a command is safe to execute from a hook
     */
    static validateCommand(command: any, hookType: any): {
        warnings: {
            type: string;
            message: string;
        }[];
        errors: {
            type: string;
            message: string;
        }[];
        safe: boolean;
    };
    static isClaudeCommand(command: any): boolean;
    static isDangerousPattern(command: any, hookType: any): boolean;
}
/**
 * Circuit Breaker - Prevents runaway hook execution
 */
export class HookCircuitBreaker {
    /**
     * Check if hook execution should be allowed
     */
    static checkExecution(hookType: any): boolean;
    static reset(): void;
    static getStatus(): {
        sessionId: string;
        executions: {
            hookType: any;
            count: any;
        }[];
    };
}
/**
 * Configuration Validator - Validates hook configurations for safety
 */
export class HookConfigValidator {
    /**
     * Validate Claude Code settings.json for dangerous hook configurations
     */
    static validateClaudeCodeConfig(configPath?: null): {
        safe: boolean;
        message: string;
        error?: undefined;
        configPath?: undefined;
    } | {
        warnings: {
            type: string;
            message: string;
        }[];
        errors: {
            type: string;
            message: string;
        }[];
        safe: boolean;
        configPath: never;
        message?: undefined;
        error?: undefined;
    } | {
        safe: boolean;
        error: string;
        configPath: never;
        message?: undefined;
    };
    /**
     * Validate hooks configuration object
     */
    static validateHooksConfig(hooksConfig: any): {
        warnings: {
            type: string;
            message: string;
        }[];
        errors: {
            type: string;
            message: string;
        }[];
    };
    /**
     * Generate safe configuration recommendations
     */
    static generateSafeAlternatives(dangerousConfig: any): {
        pattern: string;
        problem: string;
        solution: string;
        example: string;
    }[];
}
/**
 * Safe Hook Execution Wrapper
 */
export class SafeHookExecutor {
    /**
     * Safely execute a hook command with all safety checks
     */
    static executeHookCommand(command: any, hookType: any, options?: {}): Promise<{
        success: boolean;
        skipped: boolean;
        blocked?: undefined;
        errors?: undefined;
        result?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        blocked: boolean;
        errors: {
            type: string;
            message: string;
        }[];
        skipped?: undefined;
        result?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        result: {
            stdout: string;
            stderr: string;
            exitCode: number;
        };
        skipped?: undefined;
        blocked?: undefined;
        errors?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        skipped?: undefined;
        blocked?: undefined;
        errors?: undefined;
        result?: undefined;
    }>;
    static executeCommand(command: any, options?: {}): Promise<{
        stdout: string;
        stderr: string;
        exitCode: number;
    }>;
}
declare namespace _default {
    export { HookContextManager };
    export { HookCommandValidator };
    export { HookCircuitBreaker };
    export { HookConfigValidator };
    export { SafeHookExecutor };
    export { hookSafetyCommand };
    export { addSafetyFlags };
}
export default _default;
//# sourceMappingURL=hook-safety.d.ts.map