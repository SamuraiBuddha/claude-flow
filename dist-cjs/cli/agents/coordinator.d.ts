/**
 * Coordinator Agent - Specialized in task orchestration and management
 */
import { BaseAgent } from './base-agent.js';
import type { AgentCapabilities, AgentConfig, AgentEnvironment, TaskDefinition } from '../../swarm/types.js';
import type { ILogger } from '../../core/logger.js';
import type { IEventBus } from '../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../memory/distributed-memory.js';
export declare class CoordinatorAgent extends BaseAgent {
    constructor(id: string, config: AgentConfig, environment: AgentEnvironment, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem);
    protected getDefaultCapabilities(): AgentCapabilities;
    protected getDefaultConfig(): Partial<AgentConfig>;
    executeTask(task: TaskDefinition): Promise<any>;
    private orchestrateTasks;
    private trackProgress;
    private allocateResources;
    private manageWorkflow;
    private coordinateTeam;
    private generateStatusReport;
    private performGeneralCoordination;
    private delay;
    getAgentStatus(): any;
}
export declare const createCoordinatorAgent: (id: string, config: Partial<AgentConfig>, environment: Partial<AgentEnvironment>, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem) => CoordinatorAgent;
//# sourceMappingURL=coordinator.d.ts.map