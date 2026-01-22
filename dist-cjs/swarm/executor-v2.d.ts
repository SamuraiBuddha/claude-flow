/**
 * Enhanced Task Executor v2.0 with improved environment handling
 */
import { TaskDefinition, AgentState } from './types.js';
import { TaskExecutor, ExecutionConfig, ExecutionResult, ClaudeExecutionOptions } from './executor.js';
export interface ClaudeExecutionOptionsV2 extends ClaudeExecutionOptions {
    nonInteractive?: boolean;
    autoApprove?: boolean;
    promptDefaults?: Record<string, any>;
    environmentOverride?: Record<string, string>;
    retryOnInteractiveError?: boolean;
    dangerouslySkipPermissions?: boolean;
}
export declare class TaskExecutorV2 extends TaskExecutor {
    private environment;
    constructor(config?: Partial<ExecutionConfig>);
    executeClaudeTask(task: TaskDefinition, agent: AgentState, claudeOptions?: ClaudeExecutionOptionsV2): Promise<ExecutionResult>;
    private executeClaudeWithTimeoutV2;
    private buildClaudeCommandV2;
    private isInteractiveError;
    private isInteractiveErrorMessage;
    private getDefaultResourceUsage;
}
export default TaskExecutorV2;
//# sourceMappingURL=executor-v2.d.ts.map