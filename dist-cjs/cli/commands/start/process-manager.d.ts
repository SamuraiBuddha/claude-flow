/**
 * Process Manager - Handles lifecycle of system processes
 */
import { EventEmitter } from './event-emitter.js';
import { ProcessInfo, SystemStats } from './types.js';
export declare class ProcessManager extends EventEmitter {
    private processes;
    private orchestrator;
    private terminalManager;
    private memoryManager;
    private coordinationManager;
    private mcpServer;
    private config;
    constructor();
    private initializeProcesses;
    initialize(configPath?: string): Promise<void>;
    startProcess(processId: string): Promise<void>;
    stopProcess(processId: string): Promise<void>;
    restartProcess(processId: string): Promise<void>;
    startAll(): Promise<void>;
    stopAll(): Promise<void>;
    getProcess(processId: string): ProcessInfo | undefined;
    getAllProcesses(): ProcessInfo[];
    getSystemStats(): SystemStats;
    private updateProcessStatus;
    private getSystemUptime;
    private getTotalMemoryUsage;
    private getTotalCpuUsage;
    getProcessLogs(processId: string, lines?: number): Promise<string[]>;
}
//# sourceMappingURL=process-manager.d.ts.map