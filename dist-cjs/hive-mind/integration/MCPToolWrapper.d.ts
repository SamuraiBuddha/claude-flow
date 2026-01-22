/**
 * MCPToolWrapper Class
 *
 * Wraps all MCP tools for use within the Hive Mind system,
 * providing a unified interface for swarm coordination, neural processing,
 * and memory management.
 */
import { EventEmitter } from 'events';
export declare class MCPToolWrapper extends EventEmitter {
    private toolPrefix;
    private isInitialized;
    constructor();
    /**
     * Initialize MCP tools
     */
    initialize(): Promise<void>;
    /**
     * Check if MCP tools are available
     */
    private checkToolAvailability;
    /**
     * Execute MCP tool via CLI
     */
    private executeTool;
    initSwarm(params: {
        topology: string;
        maxAgents?: number;
        strategy?: string;
    }): Promise<any>;
    spawnAgent(params: {
        type: string;
        name?: string;
        swarmId?: string;
        capabilities?: string[];
    }): Promise<any>;
    orchestrateTask(params: {
        task: string;
        priority?: string;
        strategy?: string;
        dependencies?: string[];
    }): Promise<any>;
    getSwarmStatus(swarmId?: string): Promise<any>;
    monitorSwarm(params: {
        swarmId?: string;
        interval?: number;
    }): Promise<any>;
    analyzePattern(params: {
        action: string;
        operation?: string;
        metadata?: any;
    }): Promise<any>;
    trainNeural(params: {
        pattern_type: string;
        training_data: string;
        epochs?: number;
    }): Promise<any>;
    predict(params: {
        modelId: string;
        input: string;
    }): Promise<any>;
    getNeuralStatus(modelId?: string): Promise<any>;
    storeMemory(params: {
        action: 'store';
        key: string;
        value: string;
        namespace?: string;
        ttl?: number;
    }): Promise<any>;
    retrieveMemory(params: {
        action: 'retrieve';
        key: string;
        namespace?: string;
    }): Promise<any>;
    searchMemory(params: {
        pattern: string;
        namespace?: string;
        limit?: number;
    }): Promise<any>;
    deleteMemory(params: {
        action: 'delete';
        key: string;
        namespace?: string;
    }): Promise<any>;
    listMemory(params: {
        action: 'list';
        namespace?: string;
    }): Promise<any>;
    getPerformanceReport(params?: {
        format?: string;
        timeframe?: string;
    }): Promise<any>;
    analyzeBottlenecks(params?: {
        component?: string;
        metrics?: string[];
    }): Promise<any>;
    getTokenUsage(params?: {
        operation?: string;
        timeframe?: string;
    }): Promise<any>;
    listAgents(swarmId?: string): Promise<any>;
    getAgentMetrics(agentId: string): Promise<any>;
    getTaskStatus(taskId: string): Promise<any>;
    getTaskResults(taskId: string): Promise<any>;
    optimizeTopology(swarmId?: string): Promise<any>;
    loadBalance(params: {
        swarmId?: string;
        tasks: any[];
    }): Promise<any>;
    syncCoordination(swarmId?: string): Promise<any>;
    scaleSwarm(params: {
        swarmId?: string;
        targetSize: number;
    }): Promise<any>;
    runSparcMode(params: {
        mode: string;
        task_description: string;
        options?: any;
    }): Promise<any>;
    createWorkflow(params: {
        name: string;
        steps: any[];
        triggers?: any[];
    }): Promise<any>;
    executeWorkflow(params: {
        workflowId: string;
        params?: any;
    }): Promise<any>;
    analyzeRepository(params: {
        repo: string;
        analysis_type?: string;
    }): Promise<any>;
    manageGitHubPR(params: {
        repo: string;
        action: string;
        pr_number?: number;
    }): Promise<any>;
    createDynamicAgent(params: {
        agent_type: string;
        capabilities?: string[];
        resources?: any;
    }): Promise<any>;
    matchCapabilities(params: {
        task_requirements: string[];
        available_agents?: any[];
    }): Promise<any>;
    runBenchmark(suite?: string): Promise<any>;
    collectMetrics(components?: string[]): Promise<any>;
    analyzeTrends(params: {
        metric: string;
        period?: string;
    }): Promise<any>;
    analyzeCost(timeframe?: string): Promise<any>;
    assessQuality(params: {
        target: string;
        criteria?: string[];
    }): Promise<any>;
    healthCheck(components?: string[]): Promise<any>;
    batchProcess(params: {
        items: any[];
        operation: string;
    }): Promise<any>;
    parallelExecute(tasks: any[]): Promise<any>;
    /**
     * Generic tool execution for custom tools
     */
    executeMCPTool(toolName: string, params: any): Promise<any>;
    /**
     * Helper to format tool responses
     */
    private formatResponse;
}
//# sourceMappingURL=MCPToolWrapper.d.ts.map