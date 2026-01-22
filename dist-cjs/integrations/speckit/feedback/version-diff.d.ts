/**
 * VersionDiff - Compare spec versions with semantic diff
 *
 * Identifies added requirements, removed features, changed acceptance criteria
 * Outputs human-readable change reports
 */
import { EventEmitter } from 'events';
export interface SpecVersion {
    id: string;
    version: string;
    timestamp: Date;
    author?: string;
    content: SpecContent;
    checksum: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
}
export interface SpecContent {
    title: string;
    description?: string;
    stories?: UserStory[];
    requirements?: Requirement[];
    acceptanceCriteria?: AcceptanceCriterion[];
    nonFunctional?: NonFunctionalRequirement[];
    dependencies?: Dependency[];
    metadata?: Record<string, unknown>;
}
export interface UserStory {
    id: string;
    title: string;
    description: string;
    persona?: string;
    acceptanceCriteria?: string[];
    priority?: string;
    points?: number;
    status?: string;
    tags?: string[];
}
export interface Requirement {
    id: string;
    title: string;
    description: string;
    type: 'functional' | 'non-functional' | 'technical' | 'business';
    priority: 'must' | 'should' | 'could' | 'wont';
    status?: string;
    rationale?: string;
    source?: string;
}
export interface AcceptanceCriterion {
    id: string;
    storyId?: string;
    description: string;
    type: 'given-when-then' | 'scenario' | 'checklist';
    steps?: string[];
    expectedResult?: string;
}
export interface NonFunctionalRequirement {
    id: string;
    category: 'performance' | 'security' | 'scalability' | 'usability' | 'reliability' | 'other';
    description: string;
    metric?: string;
    target?: string;
    priority?: string;
}
export interface Dependency {
    id: string;
    type: 'internal' | 'external' | 'library' | 'service';
    name: string;
    version?: string;
    required: boolean;
    description?: string;
}
export interface DiffResult {
    id: string;
    baseVersion: string;
    compareVersion: string;
    timestamp: Date;
    summary: DiffSummary;
    changes: ChangeSet;
    impact: ImpactAssessment;
    humanReadable: string;
}
export interface DiffSummary {
    totalChanges: number;
    additions: number;
    removals: number;
    modifications: number;
    breakingChanges: number;
    hasBreakingChanges: boolean;
    changeScore: number;
}
export interface ChangeSet {
    stories: StoryChange[];
    requirements: RequirementChange[];
    acceptanceCriteria: AcceptanceCriteriaChange[];
    nonFunctional: NFRChange[];
    dependencies: DependencyChange[];
    metadata: MetadataChange[];
}
export interface BaseChange<T> {
    id: string;
    type: 'added' | 'removed' | 'modified';
    path: string;
    itemId: string;
    isBreaking: boolean;
    before?: T;
    after?: T;
    description: string;
}
export interface StoryChange extends BaseChange<UserStory> {
    changeType: 'story';
    priorityChange?: {
        from: string;
        to: string;
    };
    criteriaChanges?: string[];
}
export interface RequirementChange extends BaseChange<Requirement> {
    changeType: 'requirement';
    priorityChange?: {
        from: string;
        to: string;
    };
    typeChange?: {
        from: string;
        to: string;
    };
}
export interface AcceptanceCriteriaChange extends BaseChange<AcceptanceCriterion> {
    changeType: 'acceptance_criteria';
    storyId?: string;
    stepsChanged?: boolean;
}
export interface NFRChange extends BaseChange<NonFunctionalRequirement> {
    changeType: 'nfr';
    categoryChange?: {
        from: string;
        to: string;
    };
    targetChange?: {
        from: string;
        to: string;
    };
}
export interface DependencyChange extends BaseChange<Dependency> {
    changeType: 'dependency';
    versionChange?: {
        from: string;
        to: string;
    };
    requiredChange?: {
        from: boolean;
        to: boolean;
    };
}
export interface MetadataChange extends BaseChange<any> {
    changeType: 'metadata';
    key: string;
}
export interface ImpactAssessment {
    severity: 'critical' | 'high' | 'medium' | 'low' | 'none';
    affectedAreas: string[];
    estimatedEffort: 'high' | 'medium' | 'low';
    riskLevel: 'high' | 'medium' | 'low';
    recommendations: string[];
    breakingChangeDetails: BreakingChangeDetail[];
}
export interface BreakingChangeDetail {
    changeId: string;
    description: string;
    impact: string;
    mitigation: string;
}
export interface VersionDiffConfig {
    trackMetadataChanges: boolean;
    breakingChangeRules: BreakingChangeRule[];
    diffAlgorithm: 'semantic' | 'structural' | 'hybrid';
    includeWhitespaceChanges: boolean;
}
export interface BreakingChangeRule {
    id: string;
    name: string;
    pattern: string;
    severity: 'critical' | 'high' | 'medium';
    description: string;
}
export interface VersionDiffEvents {
    'diff:started': {
        baseVersion: string;
        compareVersion: string;
    };
    'diff:completed': DiffResult;
    'breaking:detected': BreakingChangeDetail;
    'change:found': BaseChange<any>;
    'error': Error;
}
/**
 * VersionDiff class for semantic spec version comparison
 */
export declare class VersionDiff extends EventEmitter {
    private config;
    private versionHistory;
    private diffCache;
    constructor(config?: Partial<VersionDiffConfig>);
    /**
     * Get default breaking change rules
     */
    private getDefaultBreakingRules;
    /**
     * Compare two spec versions
     */
    diff(baseVersion: SpecVersion, compareVersion: SpecVersion): Promise<DiffResult>;
    /**
     * Get stories that changed between versions
     */
    getChangedStories(result: DiffResult): StoryChange[];
    /**
     * Get impact assessment for a diff
     */
    getImpactAssessment(result: DiffResult): ImpactAssessment;
    /**
     * Store a version for history tracking
     */
    storeVersion(specId: string, version: SpecVersion): void;
    /**
     * Get version history for a spec
     */
    getVersionHistory(specId: string): SpecVersion[];
    /**
     * Get latest version
     */
    getLatestVersion(specId: string): SpecVersion | undefined;
    /**
     * Compare with previous version
     */
    diffWithPrevious(specId: string): Promise<DiffResult | null>;
    private diffStories;
    private diffRequirements;
    private diffAcceptanceCriteria;
    private diffNFRs;
    private diffDependencies;
    private diffMetadata;
    private calculateSummary;
    private assessImpact;
    private generateReport;
    private getMitigationForChange;
    private isTargetRelaxed;
    private deepEqual;
    private arraysEqual;
    private getArrayDiff;
    private generateId;
}
export default VersionDiff;
//# sourceMappingURL=version-diff.d.ts.map