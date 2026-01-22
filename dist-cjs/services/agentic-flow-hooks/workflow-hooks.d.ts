/**
 * Self-improving workflow hooks for agentic-flow
 *
 * Enables adaptive workflows with provider selection
 * and continuous improvement based on outcomes.
 */
import type { AgenticHookContext, HookHandlerResult, WorkflowHookPayload } from './types.js';
export declare const workflowStartHook: {
    id: string;
    type: "workflow-start";
    priority: number;
    handler: (payload: WorkflowHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const workflowStepHook: {
    id: string;
    type: "workflow-step";
    priority: number;
    handler: (payload: WorkflowHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const workflowDecisionHook: {
    id: string;
    type: "workflow-decision";
    priority: number;
    handler: (payload: WorkflowHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const workflowCompleteHook: {
    id: string;
    type: "workflow-complete";
    priority: number;
    handler: (payload: WorkflowHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare const workflowErrorHook: {
    id: string;
    type: "workflow-error";
    priority: number;
    handler: (payload: WorkflowHookPayload, context: AgenticHookContext) => Promise<HookHandlerResult>;
};
export declare function registerWorkflowHooks(): void;
//# sourceMappingURL=workflow-hooks.d.ts.map