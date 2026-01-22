/**
 * Direct Task Executor for Swarm
 * Executes tasks directly without relying on Claude CLI
 * Works in both local development and npm installed environments
 */
import type { TaskDefinition, AgentState, TaskResult } from './types.js';
import { Logger } from '../core/logger.js';
export interface DirectExecutorConfig {
    logger?: Logger;
    timeout?: number;
}
export declare class DirectTaskExecutor {
    private logger;
    private timeout;
    constructor(config?: DirectExecutorConfig);
    executeTask(task: TaskDefinition, agent: AgentState, targetDir?: string): Promise<TaskResult>;
    private executeTaskByType;
    private executeAnalyzerTask;
    private createRestAPI;
    private createTodoApp;
    private createChatApp;
    private createAuthService;
    private createCalculator;
    private createHelloWorld;
    private createGenericApp;
    private executeTestingTask;
    private executeReviewTask;
    private executeDocumentationTask;
    private executeResearchTask;
    private executeCoordinationTask;
    private executeGenericTask;
    private generateRestAPIServer;
    private generateUserRoutes;
    private generateTodoApp;
    private generateChatServer;
    private generateChatHTML;
    private generateChatClient;
    private generateAuthServer;
    private generateAuthMiddleware;
    private generatePackageJson;
    private generateReadme;
    private generateGenericApp;
    private extractRequirements;
    private identifyComponents;
    private suggestTechnologies;
    private suggestArchitecture;
}
//# sourceMappingURL=direct-executor.d.ts.map