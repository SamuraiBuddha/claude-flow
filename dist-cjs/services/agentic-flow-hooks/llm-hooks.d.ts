/**
 * LLM-specific hooks for agentic-flow integration
 *
 * Provides pre/post operation hooks for all LLM calls with
 * memory persistence and performance optimization.
 */
import type { AgenticHookContext, HookHandlerResult, LLMHookPayload } from './types.js';
export declare const preLLMCallHook: {
    id: string;
    type: "pre-llm-call";
    priority: number;
    handler: (payload: LLMHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const postLLMCallHook: {
    id: string;
    type: "post-llm-call";
    priority: number;
    handler: (payload: LLMHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const llmErrorHook: {
    id: string;
    type: "llm-error";
    priority: number;
    handler: (payload: LLMHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const llmRetryHook: {
    id: string;
    type: "llm-retry";
    priority: number;
    handler: (payload: LLMHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare function registerLLMHooks(): void;
//# sourceMappingURL=llm-hooks.d.ts.map