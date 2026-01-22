/**
 * System Monitor - Real-time monitoring of system processes
 */
import type { ProcessManager } from './process-manager.js';
export declare class SystemMonitor {
    private processManager;
    private events;
    private maxEvents;
    private metricsInterval?;
    constructor(processManager: ProcessManager);
    private setupEventListeners;
    private addEvent;
    start(): void;
    stop(): void;
    private collectMetrics;
    getRecentEvents(count?: number): any[];
    printEventLog(count?: number): void;
    private getEventIcon;
    private getEventColor;
    private formatEventMessage;
    printSystemHealth(): void;
    private getProcessStatusIcon;
    private formatUptime;
}
//# sourceMappingURL=system-monitor.d.ts.map