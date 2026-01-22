/**
 * Agentic Flow Hook Manager
 *
 * Central manager for all agentic-flow hooks, providing registration,
 * execution, and lifecycle management.
 */
import { EventEmitter } from 'events';
import type { AgenticHookContext, AgenticHookType, HookFilter, HookHandlerResult, HookPayload, HookPipeline, HookRegistration, HookRegistry } from './types.js';
export declare class AgenticHookManager extends EventEmitter implements HookRegistry {
    private hooks;
    private pipelines;
    private metrics;
    private activeExecutions;
    constructor();
    /**
     * Register a new hook
     */
    register(registration: HookRegistration): void;
    /**
     * Unregister a hook
     */
    unregister(id: string): void;
    /**
     * Get hooks by type with optional filtering
     */
    getHooks(type: AgenticHookType, filter?: HookFilter): HookRegistration[];
    /**
     * Execute hooks for a given type
     */
    executeHooks(type: AgenticHookType, payload: HookPayload, context: AgenticHookContext): Promise<HookHandlerResult[]>;
    /**
     * Create a new hook pipeline
     */
    createPipeline(config: Partial<HookPipeline>): HookPipeline;
    /**
     * Execute a pipeline
     */
    executePipeline(pipelineId: string, initialPayload: HookPayload, context: AgenticHookContext): Promise<HookHandlerResult[]>;
    /**
     * Get current metrics
     */
    getMetrics(): Record<string, any>;
    private validateRegistration;
    private matchesFilter;
    private createFilterFromPayload;
    private executeHook;
    private retryHook;
    private processSideEffects;
    private processSideEffect;
    private processMemorySideEffect;
    private processNeuralSideEffect;
    private processMetricSideEffect;
    private processNotificationSideEffect;
    private processLogSideEffect;
    private handleHookError;
    private executeStage;
    private updatePipelineMetrics;
    private rollbackPipeline;
    private getTotalHookCount;
    private initializeMetrics;
    private updateMetric;
    private generateExecutionId;
    private generatePipelineId;
    private getCachedResult;
    private cacheResult;
    private withTimeout;
    private delay;
}
export declare const agenticHookManager: AgenticHookManager;
//# sourceMappingURL=hook-manager.d.ts.map