/**
 * Comprehensive Agent management commands - Simplified version
 */
export declare const agentCommands: {
    spawn(args: string[], options?: Record<string, any>): Promise<void>;
    list(args: string[], options?: Record<string, any>): Promise<void>;
    info(args: string[], options?: Record<string, any>): Promise<void>;
    terminate(args: string[], options?: Record<string, any>): Promise<void>;
    start(args: string[], options?: Record<string, any>): Promise<void>;
    restart(args: string[], options?: Record<string, any>): Promise<void>;
    health(args: string[], options?: Record<string, any>): Promise<void>;
    help(): Promise<void>;
};
export declare const spawnAgent: (args: string[], options?: Record<string, any>) => Promise<void>, listAgents: (args: string[], options?: Record<string, any>) => Promise<void>, agentInfo: (args: string[], options?: Record<string, any>) => Promise<void>, terminateAgent: (args: string[], options?: Record<string, any>) => Promise<void>, startAgent: (args: string[], options?: Record<string, any>) => Promise<void>, restartAgent: (args: string[], options?: Record<string, any>) => Promise<void>, agentHealth: (args: string[], options?: Record<string, any>) => Promise<void>;
//# sourceMappingURL=agent-simple.d.ts.map