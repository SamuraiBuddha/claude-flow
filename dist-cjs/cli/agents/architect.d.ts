/**
 * Architect Agent - Specialized in system design and architecture
 */
import { BaseAgent } from './base-agent.js';
import type { AgentCapabilities, AgentConfig, AgentEnvironment, TaskDefinition } from '../../swarm/types.js';
import type { ILogger } from '../../core/logger.js';
import type { IEventBus } from '../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../memory/distributed-memory.js';
export declare class ArchitectAgent extends BaseAgent {
    constructor(id: string, config: AgentConfig, environment: AgentEnvironment, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem);
    protected getDefaultCapabilities(): AgentCapabilities;
    protected getDefaultConfig(): Partial<AgentConfig>;
    executeTask(task: TaskDefinition): Promise<any>;
    private designSystem;
    private reviewArchitecture;
    private designAPI;
    private designCloudArchitecture;
    private designMicroservices;
    private designSecurity;
    private designScalability;
    private designDatabase;
    private performGeneralDesign;
    private delay;
    getAgentStatus(): any;
}
export declare const createArchitectAgent: (id: string, config: Partial<AgentConfig>, environment: Partial<AgentEnvironment>, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem) => ArchitectAgent;
//# sourceMappingURL=architect.d.ts.map