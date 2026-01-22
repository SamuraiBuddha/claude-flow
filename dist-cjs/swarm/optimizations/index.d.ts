/**
 * Swarm Optimizations
 * Export all optimization components
 */
import { ClaudeConnectionPool } from './connection-pool.js';
import { AsyncFileManager } from './async-file-manager.js';
import { OptimizedExecutor } from './optimized-executor.js';
export { ClaudeConnectionPool } from './connection-pool.js';
export type { PoolConfig, PooledConnection } from './connection-pool.js';
export { AsyncFileManager } from './async-file-manager.js';
export type { FileOperationResult } from './async-file-manager.js';
export { CircularBuffer } from './circular-buffer.js';
export { TTLMap } from './ttl-map.js';
export type { TTLMapOptions } from './ttl-map.js';
export { OptimizedExecutor } from './optimized-executor.js';
export type { ExecutorConfig, ExecutionMetrics } from './optimized-executor.js';
export declare const createOptimizedSwarmStack: (config?: {
    connectionPool?: any;
    executor?: any;
    fileManager?: any;
}) => {
    connectionPool: ClaudeConnectionPool;
    fileManager: AsyncFileManager;
    executor: OptimizedExecutor;
    shutdown: () => Promise<void>;
};
//# sourceMappingURL=index.d.ts.map