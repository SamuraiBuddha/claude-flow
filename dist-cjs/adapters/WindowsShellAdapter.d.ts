/**
 * Windows Shell Adapter - Replaces Unix commands with Windows equivalents
 * Provides cross-platform command execution for claude-flow on Windows
 */
export declare class WindowsShellAdapter {
    private isWindows;
    private shell;
    private shellFlag;
    constructor();
    /**
     * Execute a shell command with Windows/Unix compatibility
     */
    execute(args: {
        command: string;
        elevated?: boolean;
        workingDir?: string;
        env?: Record<string, string>;
    }): Promise<any>;
    /**
     * Convert Unix commands to Windows PowerShell equivalents
     */
    private convertToWindows;
    /**
     * Convert Unix pipeline to PowerShell pipeline
     */
    private convertPipeline;
    /**
     * Convert a single command (used internally to avoid infinite recursion with pipes)
     */
    private convertSingleCommand;
    /**
     * Convert grep command to PowerShell Select-String
     */
    private convertGrepToPS;
    /**
     * Convert sed command to PowerShell
     */
    private convertSedToPS;
    /**
     * Convert awk command to PowerShell
     */
    private convertAwkToPS;
    /**
     * Convert jq command to PowerShell
     * This is simplified - full jq functionality would require a library
     */
    private convertJqToPS;
    /**
     * Convert xargs to PowerShell ForEach-Object
     */
    private convertXargsToPS;
    /**
     * Check if WSL is available and use it for complex Unix commands
     */
    checkWSL(): Promise<boolean>;
    /**
     * Bridge to WSL for complex Unix commands that can't be easily converted
     */
    wslBridge(args: {
        command: string;
        distribution?: string;
    }): Promise<any>;
    /**
     * Get system information
     */
    getSystemInfo(): any;
}
//# sourceMappingURL=WindowsShellAdapter.d.ts.map