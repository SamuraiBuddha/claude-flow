/**
 * SPARC-Enhanced Task Executor for Swarm
 * Implements the full SPARC methodology with TDD
 */
import type { TaskDefinition, AgentState, TaskResult } from './types.js';
import { Logger } from '../core/logger.js';
export interface SparcPhase {
    name: string;
    description: string;
    outputs: string[];
}
export interface SparcExecutorConfig {
    logger?: Logger;
    enableTDD?: boolean;
    qualityThreshold?: number;
    enableMemory?: boolean;
}
export declare class SparcTaskExecutor {
    private logger;
    private enableTDD;
    private qualityThreshold;
    private enableMemory;
    private phases;
    constructor(config?: SparcExecutorConfig);
    private initializePhases;
    executeTask(task: TaskDefinition, agent: AgentState, targetDir?: string): Promise<TaskResult>;
    private executeSparcPhase;
    private executeSpecificationPhase;
    private executePseudocodePhase;
    private executeArchitecturePhase;
    private executeTDDPhase;
    private executeTestingPhase;
    private executeReviewPhase;
    private executeDocumentationPhase;
    private determineAppType;
    private detectLanguage;
    private generateRequirements;
    private generateUserStories;
    private generateAcceptanceCriteria;
    private generateFailingTests;
    private generateMinimalImplementation;
    private refactorImplementation;
    private createProjectStructure;
    private writeTestFiles;
    private writeImplementationFiles;
    private generateProjectFiles;
    private getTestFramework;
    private getProjectStructure;
    private getTestDirectory;
    private getSourceDirectory;
    private getTestFileName;
    private getSourceFileName;
    private getFunctionalRequirements;
    private getNonFunctionalRequirements;
    private getTechnicalRequirements;
    private getBusinessRequirements;
    private generateUnitTestCases;
    private generateIntegrationTestCases;
    private generateTestFixtures;
    private generateMocks;
    private generateModules;
    private generateClasses;
    private generateFunctions;
    private generateConfig;
    private getProjectFiles;
    private calculateCoverage;
    private formatRequirements;
    private formatUserStories;
    private formatAcceptanceCriteria;
    private formatAlgorithms;
    private formatDataStructures;
    private formatArchitecture;
    private formatComponentDiagram;
    private formatTestPlan;
    private formatReviewReport;
    private generateReadme;
    private generateApiDocs;
    private generateUserGuide;
    private generateDeveloperGuide;
    private assessCodeQuality;
    private assessSecurity;
    private assessPerformance;
    private assessMaintainability;
    private generateRecommendations;
    private generateUnitTests;
    private generateIntegrationTests;
    private generateE2ETests;
    private generatePerformanceTests;
    private identifyConstraints;
    private designComponents;
    private designInterfaces;
    private selectPatterns;
    private designInfrastructure;
    private generateAlgorithms;
    private generateDataStructures;
    private generateFlowDiagrams;
    private executeAnalysisPhase;
    private executeImplementationPhase;
    private executeCoordinationPhase;
    private executeGenericPhase;
    private executeAnalyzerTask;
    private executeCoordinationTask;
    private executeGenericTask;
}
//# sourceMappingURL=sparc-executor.d.ts.map