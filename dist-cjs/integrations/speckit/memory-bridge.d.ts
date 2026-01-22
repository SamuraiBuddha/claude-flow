/**
 * SpecKitMemoryBridge - Bridge between spec-kit markdown artifacts and SQLite storage
 *
 * This class provides methods to parse spec-kit generated markdown artifacts
 * (spec.md, plan.md, tasks.md) and persist them into the SQLite database
 * with proper relationships and artifact lineage tracking.
 */
import type { ILogger } from '../../core/logger.js';
export interface SpecKitConfig {
    dbPath: string;
    specsDirectory?: string;
    autoTrackLineage?: boolean;
}
export interface ParsedUserStory {
    storyId: string;
    title: string;
    priority: string;
    description: string;
    whyPriority: string;
    independentTest: string;
    acceptanceScenarios: Array<{
        given: string;
        when: string;
        then: string;
    }>;
}
export interface ParsedSpecification {
    specId: string;
    featureName: string;
    featureBranch: string;
    userStories: ParsedUserStory[];
    requirements: {
        functional: Array<{
            id: string;
            requirement: string;
            needsClarification?: boolean;
        }>;
        entities: Array<{
            name: string;
            description: string;
        }>;
    };
    acceptanceCriteria: string[];
    successCriteria: Array<{
        id: string;
        metric: string;
    }>;
    edgeCases: string[];
    status: string;
    rawMarkdown: string;
}
export interface ParsedPlan {
    planId: string;
    specId: string;
    techStack: {
        language?: string;
        primaryDependencies?: string;
        storage?: string;
        testing?: string;
        targetPlatform?: string;
        projectType?: string;
        performanceGoals?: string;
        constraints?: string;
        scale?: string;
    };
    architectureDecisions: Array<{
        decision: string;
        rationale: string;
    }>;
    researchFindings: any;
    constitutionGates: {
        simplicityGate: {
            passed: boolean;
            checks: string[];
        };
        antiAbstractionGate: {
            passed: boolean;
            checks: string[];
        };
        integrationGate: {
            passed: boolean;
            checks: string[];
        };
    };
    dataModels: any;
    contracts: any[];
    projectStructure: any;
    complexityTracking: Array<{
        violation: string;
        whyNeeded: string;
        alternativeRejected: string;
    }>;
    quickstartScenarios: any[];
    rawMarkdown: string;
}
export interface ParsedTask {
    taskId: string;
    planId: string;
    storyId?: string;
    phase: string;
    description: string;
    dependencies: string[];
    parallelizable: boolean;
    filePaths: string[];
    testScenarios: string[];
    priority: number;
    estimatedEffort?: string;
}
export interface ArtifactLineageEntry {
    id: string;
    artifactType: string;
    artifactId: string;
    sourceArtifactId?: string;
    sourceArtifactType?: string;
    derivedArtifacts: Array<{
        type: string;
        id: string;
    }>;
    generatingAgent: string;
    filePath?: string;
    contentHash?: string;
}
export declare class SpecKitMemoryBridge {
    private db;
    private config;
    private logger;
    private initialized;
    private statements;
    constructor(config: SpecKitConfig, logger: ILogger);
    initialize(): Promise<void>;
    private prepareStatements;
    shutdown(): Promise<void>;
    /**
     * Parse a spec.md file into structured data
     */
    parseSpecMarkdown(markdown: string, sourcePath?: string): ParsedSpecification;
    private parseUserStories;
    /**
     * Parse a plan.md file into structured data
     */
    parsePlanMarkdown(markdown: string, specId: string, sourcePath?: string): ParsedPlan;
    /**
     * Parse a tasks.md file into structured task list
     */
    parseTasksMarkdown(markdown: string, planId: string): ParsedTask[];
    private extractSection;
    private generateId;
    private computeHash;
    /**
     * Process and store a specification from markdown
     * Called when /speckit.specify generates a spec.md
     */
    onSpecGenerated(markdownPath: string, createdByAgent: string, options?: {
        version?: string;
        parentVersionId?: string;
    }): Promise<{
        specId: string;
        userStoryIds: string[];
    }>;
    /**
     * Process and store an implementation plan from markdown
     * Called when /speckit.plan generates plan.md and related files
     */
    onPlanGenerated(planMarkdownPath: string, specId: string, generatedByAgent: string, relatedFiles?: {
        researchPath?: string;
        dataModelPath?: string;
        contractsDir?: string;
        quickstartPath?: string;
    }): Promise<{
        planId: string;
        contractIds: string[];
    }>;
    /**
     * Process and store tasks from markdown
     * Called when /speckit.tasks generates tasks.md
     */
    onTasksGenerated(tasksMarkdownPath: string, planId: string, generatedByAgent: string): Promise<{
        taskIds: string[];
    }>;
    private trackLineage;
    /**
     * Get all artifacts that would need regeneration if a source artifact changes
     */
    getCascadeAffected(artifactId: string): Promise<Array<{
        type: string;
        id: string;
    }>>;
    /**
     * Mark artifacts as stale when their source changes
     */
    invalidateDownstream(artifactId: string, reason: string): Promise<number>;
    /**
     * Get a specification by ID
     */
    getSpecification(specId: string): Promise<ParsedSpecification | null>;
    /**
     * Get a specification by feature name
     */
    getSpecificationByFeature(featureName: string): Promise<ParsedSpecification | null>;
    /**
     * Get an implementation plan by ID
     */
    getPlan(planId: string): Promise<ParsedPlan | null>;
    /**
     * Get all plans for a specification
     */
    getPlansBySpec(specId: string): Promise<ParsedPlan[]>;
    /**
     * Get all tasks for a plan
     */
    getTasksByPlan(planId: string): Promise<ParsedTask[]>;
    /**
     * Get user stories for a specification
     */
    getUserStories(specId: string): Promise<ParsedUserStory[]>;
    /**
     * Update task status
     */
    updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped'): Promise<void>;
    private rowToSpec;
    private rowToPlan;
    private rowToTask;
    private rowToUserStory;
}
export default SpecKitMemoryBridge;
//# sourceMappingURL=memory-bridge.d.ts.map