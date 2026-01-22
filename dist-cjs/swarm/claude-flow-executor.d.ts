/**
 * Claude Flow SPARC Executor
 * Executes tasks using the full claude-flow SPARC system in non-interactive mode
 */
import type { TaskDefinition, AgentState, TaskResult } from './types.js';
import { Logger } from '../core/logger.js';
export interface ClaudeFlowExecutorConfig {
    logger?: Logger;
    claudeFlowPath?: string;
    enableSparc?: boolean;
    verbose?: boolean;
    timeoutMinutes?: number;
}
export declare class ClaudeFlowExecutor {
    private logger;
    private claudeFlowPath;
    private enableSparc;
    private verbose;
    private timeoutMinutes;
    constructor(config?: ClaudeFlowExecutorConfig);
    executeTask(task: TaskDefinition, agent: AgentState, targetDir?: string): Promise<TaskResult>;
    private determineSparcMode;
    private buildSparcCommand;
    private formatTaskDescription;
    private executeCommand;
}
export default ClaudeFlowExecutor;
//# sourceMappingURL=claude-flow-executor.d.ts.map