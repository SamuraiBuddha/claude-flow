/**
 * Simple orchestrator implementation for Node.js compatibility
 */
export declare function startOrchestrator(options: any): Promise<void>;
export declare function getComponentStatus(): {
    eventBus: boolean;
    orchestrator: boolean;
    memoryManager: boolean;
    terminalPool: boolean;
    mcpServer: boolean;
    coordinationManager: boolean;
    webUI: boolean;
};
export declare function getStores(): {
    agents: Map<any, any>;
    tasks: Map<any, any>;
    memory: Map<any, any>;
};
//# sourceMappingURL=simple-orchestrator.d.ts.map