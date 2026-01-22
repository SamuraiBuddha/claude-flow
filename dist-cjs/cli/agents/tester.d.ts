/**
 * Tester Agent - Specialized in testing and quality assurance
 */
import { BaseAgent } from './base-agent.js';
import type { AgentCapabilities, AgentConfig, AgentEnvironment, TaskDefinition } from '../../swarm/types.js';
import type { ILogger } from '../../core/logger.js';
import type { IEventBus } from '../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../memory/distributed-memory.js';
export declare class TesterAgent extends BaseAgent {
    constructor(id: string, config: AgentConfig, environment: AgentEnvironment, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem);
    protected getDefaultCapabilities(): AgentCapabilities;
    protected getDefaultConfig(): Partial<AgentConfig>;
    executeTask(task: TaskDefinition): Promise<any>;
    private createUnitTests;
    private createIntegrationTests;
    private createE2ETests;
    private performanceTest;
    private securityTest;
    private testAPI;
    private automateTests;
    private analyzeTests;
    private performGeneralTesting;
    private delay;
    getAgentStatus(): any;
}
export declare const createTesterAgent: (id: string, config: Partial<AgentConfig>, environment: Partial<AgentEnvironment>, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem) => TesterAgent;
//# sourceMappingURL=tester.d.ts.map