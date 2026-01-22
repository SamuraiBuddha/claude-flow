/**
 * Memory persistence hooks for agentic-flow
 *
 * Provides cross-provider memory state management with
 * synchronization and persistence capabilities.
 */
import type { AgenticHookContext, HookHandlerResult, MemoryHookPayload } from './types.js';
export declare const preMemoryStoreHook: {
    id: string;
    type: "pre-memory-store";
    priority: number;
    handler: (payload: MemoryHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const postMemoryStoreHook: {
    id: string;
    type: "post-memory-store";
    priority: number;
    handler: (payload: MemoryHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const preMemoryRetrieveHook: {
    id: string;
    type: "pre-memory-retrieve";
    priority: number;
    handler: (payload: MemoryHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const postMemoryRetrieveHook: {
    id: string;
    type: "post-memory-retrieve";
    priority: number;
    handler: (payload: MemoryHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const memorySyncHook: {
    id: string;
    type: "memory-sync";
    priority: number;
    handler: (payload: MemoryHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const memoryPersistHook: {
    id: string;
    type: "memory-persist";
    priority: number;
    handler: (payload: MemoryHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare function registerMemoryHooks(): void;
//# sourceMappingURL=memory-hooks.d.ts.map