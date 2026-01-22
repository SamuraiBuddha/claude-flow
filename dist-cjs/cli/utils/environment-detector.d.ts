/**
 * Environment Detection Utility for Claude-Flow v2.0
 * Detects execution environment and recommends appropriate flags
 */
export interface ExecutionEnvironment {
    isInteractive: boolean;
    isVSCode: boolean;
    isVSCodeInsiders: boolean;
    isCI: boolean;
    isDocker: boolean;
    isSSH: boolean;
    isGitBash: boolean;
    isWindowsTerminal: boolean;
    isWSL: boolean;
    isWindows: boolean;
    supportsRawMode: boolean;
    supportsColor: boolean;
    terminalType: string;
    recommendedFlags: string[];
    warnings: string[];
}
export interface EnvironmentOptions {
    skipWarnings?: boolean;
    autoApplyDefaults?: boolean;
    verbose?: boolean;
}
/**
 * Detects the current execution environment
 */
export declare function detectExecutionEnvironment(options?: EnvironmentOptions): ExecutionEnvironment;
/**
 * Applies smart defaults based on environment
 */
export declare function applySmartDefaults<T extends Record<string, any>>(options: T, env?: ExecutionEnvironment): T & {
    appliedDefaults: string[];
    skipPermissions?: boolean;
    dangerouslySkipPermissions?: boolean;
    nonInteractive?: boolean;
    json?: boolean;
    noColor?: boolean;
};
/**
 * Gets a human-readable environment description
 */
export declare function getEnvironmentDescription(env?: ExecutionEnvironment): string;
/**
 * Checks if we should use non-interactive mode
 */
export declare function shouldUseNonInteractiveMode(options?: {
    force?: boolean;
}): boolean;
declare const _default: {
    detectExecutionEnvironment: typeof detectExecutionEnvironment;
    applySmartDefaults: typeof applySmartDefaults;
    getEnvironmentDescription: typeof getEnvironmentDescription;
    shouldUseNonInteractiveMode: typeof shouldUseNonInteractiveMode;
};
export default _default;
//# sourceMappingURL=environment-detector.d.ts.map