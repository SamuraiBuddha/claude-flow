/**
 * Neural training hooks for agentic-flow
 *
 * Enables learning from multi-model responses with
 * pattern detection and adaptive optimization.
 */
import type { AgenticHookContext, HookHandlerResult, NeuralHookPayload } from './types.js';
export declare const preNeuralTrainHook: {
    id: string;
    type: "pre-neural-train";
    priority: number;
    handler: (payload: NeuralHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const postNeuralTrainHook: {
    id: string;
    type: "post-neural-train";
    priority: number;
    handler: (payload: NeuralHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const neuralPatternDetectedHook: {
    id: string;
    type: "neural-pattern-detected";
    priority: number;
    handler: (payload: NeuralHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const neuralPredictionHook: {
    id: string;
    type: "neural-prediction";
    priority: number;
    handler: (payload: NeuralHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const neuralAdaptationHook: {
    id: string;
    type: "neural-adaptation";
    priority: number;
    handler: (payload: NeuralHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare function registerNeuralHooks(): void;
//# sourceMappingURL=neural-hooks.d.ts.map