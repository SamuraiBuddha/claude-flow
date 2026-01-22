/**
 * Compatible Terminal UI - Works without raw mode
 * Designed for environments that don't support stdin raw mode
 */
export interface UIProcess {
    id: string;
    name: string;
    status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | 'crashed';
    type: string;
    pid?: number;
    startTime?: number;
    metrics?: {
        cpu?: number;
        memory?: number;
        restarts?: number;
        lastError?: string;
    };
}
export interface UISystemStats {
    totalProcesses: number;
    runningProcesses: number;
    errorProcesses: number;
}
export declare class CompatibleUI {
    private processes;
    private running;
    private rl;
    constructor();
    start(): Promise<void>;
    stop(): void;
    updateProcesses(processes: UIProcess[]): void;
    private promptCommand;
    private handleCommand;
    private render;
    private showStatus;
    private showProcessList;
    private showProcessDetails;
    private getStatusDisplay;
    private getSystemStats;
    private getSystemLoad;
    private getSystemUptime;
    private formatUptime;
    private showHelp;
    private handleExit;
}
export declare function createCompatibleUI(): CompatibleUI;
export declare function isRawModeSupported(): boolean;
export declare function launchUI(): Promise<void>;
//# sourceMappingURL=compatible-ui.d.ts.map