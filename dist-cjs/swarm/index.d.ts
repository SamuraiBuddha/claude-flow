export * from './coordinator.js';
export * from './executor.js';
export * from './types.js';
export * from './strategies/base.js';
export * from './strategies/auto.js';
export * from './strategies/research.js';
export * from './memory.js';
export * from './prompt-copier.js';
export * from './prompt-copier-enhanced.js';
export * from './prompt-utils.js';
export * from './prompt-manager.js';
export * from './prompt-cli.js';
export { ClaudeConnectionPool, AsyncFileManager, CircularBuffer, TTLMap, OptimizedExecutor, createOptimizedSwarmStack, } from './optimizations/index.js';
export type { PoolConfig, PooledConnection, FileOperationResult, TTLMapOptions, ExecutorConfig, ExecutionMetrics as OptimizedExecutionMetrics, } from './optimizations/index.js';
export declare function getSwarmComponents(): {
    coordinator: () => Promise<typeof import("./coordinator.js")>;
    executor: () => Promise<typeof import("./executor.js")>;
    types: () => Promise<typeof import("./types.js")>;
    strategies: {
        base: () => Promise<typeof import("./strategies/base.js")>;
        auto: () => Promise<typeof import("./strategies/auto.js")>;
        research: () => Promise<typeof import("./strategies/research.js")>;
    };
    memory: () => Promise<typeof import("./memory.js")>;
    promptCopier: () => Promise<typeof import("./prompt-copier.js")>;
    promptCopierEnhanced: () => Promise<typeof import("./prompt-copier-enhanced.js")>;
    promptUtils: () => Promise<typeof import("./prompt-utils.js")>;
    promptManager: () => Promise<typeof import("./prompt-manager.js")>;
    promptCli: () => Promise<typeof import("./prompt-cli.js")>;
    optimizations: () => Promise<typeof import("./optimizations/index.js")>;
};
//# sourceMappingURL=index.d.ts.map