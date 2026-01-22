/**
 * Swarm spawning utilities
 */
interface Agent {
    id: string;
    type: string;
    status: string;
    name: string;
    task: string;
    parentId?: string;
    terminalId?: string;
}
interface SwarmState {
    swarmId: string;
    objective: string;
    agents: Map<string, Agent>;
    startTime: number;
}
export declare function initializeSwarm(swarmId: string, objective: string): void;
export declare function spawnSwarmAgent(swarmId: string, agentType: string, task: string): Promise<string>;
export declare function monitorSwarm(swarmId: string): Promise<void>;
export declare function getSwarmState(swarmId: string): SwarmState | undefined;
export {};
//# sourceMappingURL=swarm-spawn.d.ts.map