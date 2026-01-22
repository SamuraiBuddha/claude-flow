/**
 * Check if the current environment supports interactive TTY features
 */
export function isInteractive(): boolean;
/**
 * Check if raw mode is supported (for Ink UI components)
 */
export function isRawModeSupported(): boolean;
/**
 * Get environment type for logging/debugging
 */
export function getEnvironmentType(): "vscode" | "docker" | "interactive" | "github-actions" | "windows" | "non-tty-stdin" | "non-tty-stdout" | "ci-environment" | "wsl" | "no-raw-mode";
/**
 * Wrap a command to handle non-interactive environments
 */
export function handleNonInteractive(commandName: any, interactiveFn: any, nonInteractiveFn: any): (...args: any[]) => Promise<any>;
/**
 * Show warning for commands that work better in interactive mode
 */
export function warnNonInteractive(commandName: any): void;
/**
 * Check for required environment variables in non-interactive mode
 */
export function checkNonInteractiveAuth(): boolean;
//# sourceMappingURL=interactive-detector.d.ts.map