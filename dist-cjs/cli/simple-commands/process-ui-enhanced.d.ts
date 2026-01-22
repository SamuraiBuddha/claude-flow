export function launchEnhancedUI(): Promise<void>;
export class EnhancedProcessUI {
    processes: Map<any, any>;
    running: boolean;
    selectedIndex: number;
    currentView: string;
    agents: any[];
    tasks: any[];
    memoryStats: {
        totalEntries: number;
        totalSize: number;
        namespaces: never[];
    };
    logs: any[];
    systemStats: {
        uptime: number;
        totalTasks: number;
        completedTasks: number;
        activeAgents: number;
        memoryUsage: number;
        cpuUsage: number;
    };
    swarmIntegration: SwarmWebUIIntegration;
    initializeSwarm(): Promise<void>;
    start(): Promise<void>;
    render(): void;
    renderHeader(): void;
    renderProcessView(): void;
    renderStatusView(): void;
    renderOrchestrationView(): void;
    renderMemoryView(): void;
    renderLogsView(): void;
    renderHelpView(): void;
    renderFooter(): void;
    getStatusIcon(status: any): string;
    getHealthBar(): string;
    getUsageBar(value: any, max: any): string;
    formatUptime(seconds: any): string;
    handleInput(): Promise<void>;
    handleViewSpecificInput(input: any): Promise<void>;
    handleProcessInput(input: any): Promise<void>;
    handleOrchestrationInput(input: any): Promise<void>;
    handleMemoryInput(input: any): Promise<void>;
    handleLogsInput(input: any): Promise<void>;
    addLog(level: any, message: any): void;
    updateSystemStats(): void;
    toggleSelected(): Promise<void>;
    startProcess(id: any): Promise<void>;
    stopProcess(id: any): Promise<void>;
    startAll(): Promise<void>;
    stopAll(): Promise<void>;
    restartAll(): Promise<void>;
}
import SwarmWebUIIntegration from './swarm-webui-integration.js';
//# sourceMappingURL=process-ui-enhanced.d.ts.map