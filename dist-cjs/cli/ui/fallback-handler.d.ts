export interface FallbackOptions {
    enableUI?: boolean;
    fallbackMessage?: string;
    showHelp?: boolean;
}
/**
 * Handles raw mode errors and provides fallback UI
 */
export declare function handleRawModeError(error: Error, options?: FallbackOptions): Promise<void>;
/**
 * Wraps a function to catch and handle raw mode errors
 */
export declare function withRawModeFallback<T extends any[], R>(fn: (...args: T) => Promise<R>, fallbackOptions?: FallbackOptions): (...args: T) => Promise<R | void>;
/**
 * Checks if the current environment supports interactive UI
 */
export declare function checkUISupport(): {
    supported: boolean;
    reason?: string;
    recommendation?: string;
};
/**
 * Shows UI support information
 */
export declare function showUISupport(): void;
//# sourceMappingURL=fallback-handler.d.ts.map