/**
 * Coder Agent - Specialized in software development and code generation
 */
import { BaseAgent } from './base-agent.js';
import type { AgentCapabilities, AgentConfig, AgentEnvironment, TaskDefinition } from '../../swarm/types.js';
import type { ILogger } from '../../core/logger.js';
import type { IEventBus } from '../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../memory/distributed-memory.js';
export declare class CoderAgent extends BaseAgent {
    constructor(id: string, config: AgentConfig, environment: AgentEnvironment, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem);
    protected getDefaultCapabilities(): AgentCapabilities;
    protected getDefaultConfig(): Partial<AgentConfig>;
    executeTask(task: TaskDefinition): Promise<any>;
    private generateCode;
    private reviewCode;
    private refactorCode;
    private writeTests;
    private debugCode;
    private developAPI;
    private designDatabase;
    private optimizePerformance;
    private performGeneralDevelopment;
    private getFileExtension;
    private generateSampleCode;
    private generateTypesCode;
    private generateTestCode;
    private generateDocumentation;
    private suggestDependencies;
    private generateBuildInstructions;
    private delay;
    getAgentStatus(): any;
}
export declare const createCoderAgent: (id: string, config: Partial<AgentConfig>, environment: Partial<AgentEnvironment>, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem) => CoderAgent;
//# sourceMappingURL=coder.d.ts.map