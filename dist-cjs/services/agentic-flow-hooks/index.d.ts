/**
 * Agentic Flow Hook System
 *
 * Main entry point for the hook system integration with agentic-flow.
 * Provides initialization, registration, and management of all hook types.
 */
export * from './types.js';
export { agenticHookManager } from './hook-manager.js';
export * from './llm-hooks.js';
export * from './memory-hooks.js';
export * from './neural-hooks.js';
export * from './performance-hooks.js';
export * from './workflow-hooks.js';
/**
 * Initialize the agentic-flow hook system
 */
export declare function initializeAgenticFlowHooks(): Promise<void>;
/**
 * Shutdown the hook system gracefully
 */
export declare function shutdownAgenticFlowHooks(): Promise<void>;
/**
 * Get hook system status
 */
export declare function getHookSystemStatus(): {
    initialized: boolean;
    metrics: Record<string, any>;
    pipelines: string[];
    activeExecutions: number;
};
/**
 * Create a context builder for hook execution
 */
export declare function createHookContext(): HookContextBuilder;
import type { HookContextBuilder } from './types.js';
//# sourceMappingURL=index.d.ts.map