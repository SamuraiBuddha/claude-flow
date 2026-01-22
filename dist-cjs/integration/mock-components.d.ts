/**
 * Mock Components for System Integration Testing
 * These are lightweight mocks for missing components during development
 */
import { EventBus } from '../core/event-bus.js';
import { Logger } from '../core/logger.js';
export declare class MockConfigManager {
    private config;
    static getInstance(): MockConfigManager;
    load(): Promise<void>;
    get(path: string): any;
    set(path: string, value: any): void;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<any>;
}
export declare class MockMemoryManager {
    private storage;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    delete(key: string): Promise<boolean>;
    keys(pattern?: string): Promise<string[]>;
    healthCheck(): Promise<any>;
    getMetrics(): Promise<any>;
}
export declare class MockAgentManager {
    private eventBus;
    private logger;
    private agents;
    constructor(eventBus: EventBus, logger: Logger);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    spawnAgent(type: string, config: any): Promise<string>;
    terminateAgent(agentId: string): Promise<void>;
    listAgents(): Promise<any[]>;
    getAgent(agentId: string): Promise<any>;
    sendMessage(message: any): Promise<any>;
    healthCheck(): Promise<any>;
    getMetrics(): Promise<any>;
}
export declare class MockSwarmCoordinator {
    private eventBus;
    private logger;
    private memoryManager;
    private swarms;
    constructor(eventBus: EventBus, logger: Logger, memoryManager: MockMemoryManager);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    createSwarm(config: any): Promise<string>;
    getSwarmStatus(swarmId: string): Promise<any>;
    spawnAgentInSwarm(swarmId: string, agentConfig: any): Promise<string>;
    getSwarmAgents(swarmId: string): Promise<string[]>;
    healthCheck(): Promise<any>;
    getMetrics(): Promise<any>;
}
export declare class MockTaskEngine {
    private eventBus;
    private logger;
    private memoryManager;
    private tasks;
    constructor(eventBus: EventBus, logger: Logger, memoryManager: MockMemoryManager);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    createTask(taskConfig: any): Promise<string>;
    getTaskStatus(taskId: string): Promise<any>;
    getActiveTasks(swarmId?: string): Promise<any[]>;
    healthCheck(): Promise<any>;
    getMetrics(): Promise<any>;
}
export declare class MockRealTimeMonitor {
    private eventBus;
    private logger;
    constructor(eventBus: EventBus, logger: Logger);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    attachToOrchestrator(orchestrator: any): void;
    attachToAgentManager(agentManager: any): void;
    attachToSwarmCoordinator(swarmCoordinator: any): void;
    attachToTaskEngine(taskEngine: any): void;
    healthCheck(): Promise<any>;
}
export declare class MockMcpServer {
    private eventBus;
    private logger;
    constructor(eventBus: EventBus, logger: Logger);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    attachToOrchestrator(orchestrator: any): void;
    attachToAgentManager(agentManager: any): void;
    attachToSwarmCoordinator(swarmCoordinator: any): void;
    attachToTaskEngine(taskEngine: any): void;
    attachToMemoryManager(memoryManager: any): void;
    healthCheck(): Promise<any>;
}
export declare class MockOrchestrator {
    private configManager;
    private eventBus;
    private logger;
    constructor(configManager: any, eventBus: EventBus, logger: Logger);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    setAgentManager(agentManager: any): void;
    healthCheck(): Promise<any>;
}
//# sourceMappingURL=mock-components.d.ts.map