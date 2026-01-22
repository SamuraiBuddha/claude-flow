/**
 * Analyst Agent - Specialized in data analysis and performance optimization
 */
import { BaseAgent } from './base-agent.js';
import type { AgentCapabilities, AgentConfig, AgentEnvironment, TaskDefinition } from '../../swarm/types.js';
import type { ILogger } from '../../core/logger.js';
import type { IEventBus } from '../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../memory/distributed-memory.js';
export declare class AnalystAgent extends BaseAgent {
    constructor(id: string, config: AgentConfig, environment: AgentEnvironment, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem);
    protected getDefaultCapabilities(): AgentCapabilities;
    protected getDefaultConfig(): Partial<AgentConfig>;
    executeTask(task: TaskDefinition): Promise<any>;
    private analyzeData;
    private analyzePerformance;
    private performStatisticalAnalysis;
    private createVisualization;
    private buildPredictiveModel;
    private detectAnomalies;
    private analyzeTrends;
    private generateBusinessIntelligence;
    private analyzeQuality;
    private performGeneralAnalysis;
    private delay;
    getAgentStatus(): any;
}
export declare const createAnalystAgent: (id: string, config: Partial<AgentConfig>, environment: Partial<AgentEnvironment>, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem) => AnalystAgent;
//# sourceMappingURL=analyst.d.ts.map