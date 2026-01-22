/**
 * Connection Pool for Claude API
 * Manages reusable connections to improve performance
 */
import { EventEmitter } from 'node:events';
export declare class ClaudeAPI {
    id: string;
    isHealthy: boolean;
    constructor();
    healthCheck(): Promise<boolean>;
    complete(options: any): Promise<any>;
}
export interface PoolConfig {
    min: number;
    max: number;
    acquireTimeoutMillis: number;
    idleTimeoutMillis: number;
    evictionRunIntervalMillis: number;
    testOnBorrow: boolean;
}
export interface PooledConnection {
    id: string;
    api: ClaudeAPI;
    inUse: boolean;
    createdAt: Date;
    lastUsedAt: Date;
    useCount: number;
}
export declare class ClaudeConnectionPool extends EventEmitter {
    private connections;
    private waitingQueue;
    private config;
    private logger;
    private evictionTimer?;
    private isShuttingDown;
    constructor(config?: Partial<PoolConfig>);
    private initialize;
    private createConnection;
    acquire(): Promise<PooledConnection>;
    release(connection: PooledConnection): Promise<void>;
    execute<T>(fn: (api: ClaudeAPI) => Promise<T>): Promise<T>;
    private testConnection;
    private destroyConnection;
    private evictIdleConnections;
    drain(): Promise<void>;
    getStats(): {
        total: number;
        inUse: number;
        idle: number;
        waitingQueue: number;
        totalUseCount: number;
    };
}
//# sourceMappingURL=connection-pool.d.ts.map