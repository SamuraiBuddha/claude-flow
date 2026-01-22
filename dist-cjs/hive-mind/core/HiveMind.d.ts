/**
 * HiveMind Core Class
 *
 * Main orchestrator for the collective intelligence swarm system.
 * Manages agents, tasks, memory, and coordination.
 */
import { EventEmitter } from 'events';
import { Agent } from './Agent.js';
import { HiveMindConfig, Task, SwarmStatus, AgentSpawnOptions, TaskSubmitOptions } from '../types.js';
export declare class HiveMind extends EventEmitter {
    private id;
    private config;
    private queen;
    private agents;
    private memory;
    private communication;
    private orchestrator;
    private consensus;
    private db;
    private started;
    private startTime;
    constructor(config: HiveMindConfig);
    /**
     * Get the swarm ID
     */
    getSwarmId(): string;
    /**
     * Initialize the Hive Mind and all subsystems
     */
    initialize(): Promise<string>;
    /**
     * Load an existing Hive Mind from the database
     */
    static load(swarmId: string): Promise<HiveMind>;
    /**
     * Auto-spawn initial agents based on topology
     */
    autoSpawnAgents(): Promise<Agent[]>;
    /**
     * Spawn a new agent into the swarm
     */
    spawnAgent(options: AgentSpawnOptions): Promise<Agent>;
    /**
     * Submit a task to the Hive Mind
     */
    submitTask(options: TaskSubmitOptions): Promise<Task>;
    /**
     * Get full status of the Hive Mind
     */
    getFullStatus(): Promise<SwarmStatus>;
    /**
     * Get basic statistics
     */
    getStats(): Promise<{
        totalAgents: number;
        activeAgents: number;
        pendingTasks: number;
        availableCapacity: number;
    }>;
    /**
     * Get list of agents
     */
    getAgents(): Promise<Agent[]>;
    /**
     * Get list of tasks
     */
    getTasks(): Promise<any[]>;
    /**
     * Get specific task
     */
    getTask(taskId: string): Promise<any>;
    /**
     * Cancel a task
     */
    cancelTask(taskId: string): Promise<void>;
    /**
     * Retry a failed task
     */
    retryTask(taskId: string): Promise<Task>;
    /**
     * Rebalance agents across tasks
     */
    rebalanceAgents(): Promise<void>;
    /**
     * Shutdown the Hive Mind
     */
    shutdown(): Promise<void>;
    private getDefaultCapabilities;
    private assignPendingTasksToAgent;
    private calculatePerformanceMetrics;
    private determineHealth;
    private getSystemWarnings;
}
//# sourceMappingURL=HiveMind.d.ts.map