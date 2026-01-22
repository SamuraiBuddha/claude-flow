/**
 * Performance optimization hooks for agentic-flow
 *
 * Tracks metrics, identifies bottlenecks, and provides
 * optimization suggestions based on provider performance.
 */
import type { AgenticHookContext, HookHandlerResult, PerformanceHookPayload } from './types.js';
export declare const performanceMetricHook: {
    id: string;
    type: "performance-metric";
    priority: number;
    handler: (payload: PerformanceHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const performanceBottleneckHook: {
    id: string;
    type: "performance-bottleneck";
    priority: number;
    handler: (payload: PerformanceHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const performanceOptimizationHook: {
    id: string;
    type: "performance-optimization";
    priority: number;
    handler: (payload: PerformanceHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const performanceThresholdHook: {
    id: string;
    type: "performance-threshold";
    priority: number;
    handler: (payload: PerformanceHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare function registerPerformanceHooks(): void;
//# sourceMappingURL=performance-hooks.d.ts.map