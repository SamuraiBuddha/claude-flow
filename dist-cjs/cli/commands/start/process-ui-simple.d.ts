/**
 * Simplified Process UI without keypress dependency
 * Uses basic stdin reading for compatibility
 */
import type { ProcessManager } from './process-manager.js';
export declare class ProcessUI {
    private processManager;
    private running;
    private selectedIndex;
    constructor(processManager: ProcessManager);
    private setupEventListeners;
    start(): Promise<void>;
    stop(): Promise<void>;
    private handleCommand;
    private render;
    private showProcessMenu;
    private showProcessDetails;
    private waitForKey;
    private getStatusDisplay;
    private formatUptime;
    private showHelp;
    private startProcess;
    private stopProcess;
    private restartProcess;
    private startAll;
    private stopAll;
    private handleExit;
}
//# sourceMappingURL=process-ui-simple.d.ts.map