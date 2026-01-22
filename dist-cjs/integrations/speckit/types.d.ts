/**
 * Spec-Kit Integration Types
 * Core type definitions for spec-kit + claude-flow integration
 *
 * Includes types for:
 * - Specification parsing
 * - Plan/Research/Data-model parsing
 * - Task list parsing
 * - Constitution parsing
 * - Artifact lineage tracking
 * - Constitutional compliance enforcement
 */
/**
 * Base artifact type for all spec-kit documents
 */
export interface Artifact {
    id: string;
    type: ArtifactType;
    path: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    hash: string;
    metadata: Record<string, unknown>;
}
export type ArtifactType = 'specification' | 'plan' | 'research' | 'data-model' | 'contract' | 'task-list' | 'constitution' | 'code' | 'test' | 'documentation';
/**
 * Relationship between artifacts for lineage tracking
 */
export interface ArtifactRelationship {
    id: string;
    sourceId: string;
    targetId: string;
    relationshipType: RelationshipType;
    createdAt: Date;
    metadata: Record<string, unknown>;
}
export type RelationshipType = 'derives-from' | 'implements' | 'tests' | 'references' | 'supersedes' | 'depends-on';
export interface UserStory {
    id: string;
    priority: Priority;
    title: string;
    description: string;
    priorityJustification?: string;
    independentTest?: string;
    acceptanceCriteria: AcceptanceCriterion[];
    acceptanceScenarios?: AcceptanceScenario[];
    edgeCases: string[];
}
export type Priority = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
export interface AcceptanceCriterion {
    id: string;
    given: string;
    when: string;
    then: string;
}
export interface AcceptanceScenario {
    id: string;
    given: string;
    when: string;
    then: string;
}
export interface Requirement {
    id: string;
    type: 'functional' | 'non-functional';
    description: string;
    priority?: 'must' | 'should' | 'could' | 'wont';
    needsClarification?: boolean;
    clarificationNote?: string;
}
export interface SuccessCriterion {
    id: string;
    description: string;
    measurable: boolean;
    metric?: string;
}
export interface EdgeCase {
    id: string;
    description: string;
    scenario: string;
}
export interface Entity {
    name: string;
    description: string;
    attributes: string[];
    relationships: string[];
}
export interface SpecificationDocument extends Artifact {
    type: 'specification';
    specId: string;
    featureName: string;
    featureBranch: string;
    version: string;
    branchName: string;
    status: SpecStatus;
    userStories: UserStory[];
    functionalRequirements: Requirement[];
    nonFunctionalRequirements: Requirement[];
    requirements?: Requirement[];
    successCriteria: SuccessCriterion[] | string[];
    edgeCases: EdgeCase[] | string[];
    entities?: Entity[];
    clarifications: Clarification[];
}
export type SpecStatus = 'draft' | 'review' | 'approved' | 'implemented' | 'deprecated';
export interface Clarification {
    id: string;
    question: string;
    answer: string;
    resolvedAt?: Date;
    resolvedBy?: string;
}
export interface TechStack {
    language: string;
    version?: string;
    framework: string;
    database?: string;
    testingFramework: string;
    additionalTools: string[];
}
export interface TechnicalContext {
    language: string;
    version?: string;
    primaryDependencies: string[];
    storage?: string;
    testing: string;
    targetPlatform: string;
    projectType: 'single' | 'web' | 'mobile' | 'monorepo';
    performanceGoals?: string;
    constraints?: string;
    scaleScope?: string;
    needsClarification: string[];
}
export interface ArchitectureDecision {
    id: string;
    title: string;
    context: string;
    decision: string;
    rationale: string;
    alternatives: string[];
    consequences: string[];
}
export interface DataModel {
    entityName: string;
    fields: DataField[];
    relationships: Relationship[];
    validationRules: string[];
}
export interface DataField {
    name: string;
    type: string;
    required: boolean;
    description: string;
    constraints?: string[];
    defaultValue?: string;
}
export interface Relationship {
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    targetEntity: string;
    foreignKey?: string;
    name?: string;
    from?: string;
    to?: string;
    description?: string;
}
export interface APIContract {
    name: string;
    type: 'rest' | 'graphql' | 'grpc' | 'websocket';
    endpoints: Endpoint[];
    schemas: Record<string, unknown>;
}
export interface Endpoint {
    method: string;
    path: string;
    description: string;
    requestSchema?: string;
    responseSchema?: string;
    errorResponses: ErrorResponse[];
}
export interface ErrorResponse {
    code: number;
    description: string;
}
export interface ImplementationPlan extends Artifact {
    type: 'plan';
    planId: string;
    specId: string;
    featureName: string;
    featureBranch: string;
    specPath: string;
    version: string;
    summary: string;
    techStack: TechStack;
    technicalContext?: TechnicalContext;
    architectureDecisions: ArchitectureDecision[];
    dataModels: DataModel[];
    apiContracts: APIContract[];
    researchFindings: ResearchFinding[];
    constitutionGates: ConstitutionGate[];
    constitutionCheck?: ConstitutionCheckResult;
    projectStructure?: ProjectStructure;
    complexityTracking?: ComplexityViolation[];
    phases: ImplementationPhase[];
}
export interface ResearchFinding {
    id: string;
    topic: string;
    findings: string;
    summary?: string;
    details?: string;
    sources: string[];
    recommendation: string;
    confidence?: 'high' | 'medium' | 'low';
}
export interface ConstitutionGate {
    articleId: string;
    articleName: string;
    status: 'pass' | 'fail' | 'exception' | 'passed' | 'failed' | 'pending' | 'exempted';
    justification?: string;
    notes?: string;
    checkedAt?: Date;
    checkedBy?: string;
}
export interface ConstitutionCheckResult {
    passed: boolean;
    gates: ConstitutionGate[];
    violations: ConstitutionViolation[];
}
export interface ConstitutionViolation {
    articleId: string;
    articleName: string;
    description: string;
    justification?: string;
    approved: boolean;
    approvedBy?: string;
    approvedAt?: Date;
}
export interface ProjectStructure {
    documentationPaths: string[];
    sourceCodePaths: string[];
    testPaths: string[];
    structureDecision: string;
}
export interface ComplexityViolation {
    violation: string;
    whyNeeded: string;
    simplerAlternativeRejected: string;
}
export interface ImplementationPhase {
    phaseId: string;
    name: string;
    description: string;
    deliverables: string[];
    estimatedTasks: number;
}
export interface ResearchDocument extends Artifact {
    type: 'research';
    featureName: string;
    sections: ResearchSection[];
    findings: ResearchFinding[];
    recommendations: string[];
}
export interface ResearchSection {
    title: string;
    content: string;
}
export interface DataModelDocument extends Artifact {
    type: 'data-model';
    featureName: string;
    entities: DataEntity[];
    relationships: DataRelationship[];
    diagrams?: string[];
}
export interface DataEntity {
    name: string;
    description: string;
    attributes: DataAttribute[];
    primaryKey?: string;
    indexes?: string[];
}
export interface DataAttribute {
    name: string;
    type: string;
    required: boolean;
    description?: string;
    constraints?: string[];
    defaultValue?: string;
}
export interface DataRelationship {
    name: string;
    from: string;
    to: string;
    cardinality: 'one-to-one' | 'one-to-many' | 'many-to-many';
    description?: string;
}
export interface Task {
    taskId: string;
    id?: string;
    storyId?: string;
    planId?: string;
    description: string;
    type: TaskType;
    priority?: Priority;
    parallelizable: boolean;
    parallel?: boolean;
    dependencies: string[];
    filePaths: string[];
    filePath?: string;
    acceptanceCriteria: string[];
    testScenarios: string[];
    assignedAgent?: string;
    status: TaskStatus;
    userStory?: string;
    completed?: boolean;
    startedAt?: Date;
    completedAt?: Date;
    failureReason?: string;
}
export type TaskType = 'setup' | 'infrastructure' | 'model' | 'service' | 'endpoint' | 'test' | 'integration' | 'documentation' | 'validation' | 'refactoring' | 'read-constitution' | 'validate-plan' | 'check-gate' | 'record-exception' | 'audit-violations' | 'analyze-metrics' | 'propose-updates' | 'trigger-regeneration' | 'forecast-metrics' | 'detect-drift' | 'validate-spec' | 'check-coverage' | 'identify-gaps' | 'analyze-consistency' | 'trace-requirements' | 'parse-tasks' | 'build-graph' | 'assign-agents' | 'track-progress' | 'extract-unknowns' | 'spawn-research' | 'consolidate-findings' | 'generate-document' | 'track-research' | 'generate-questions' | 'record-answers' | 'validate-completeness' | 'analyze-coverage' | 'manage-session' | 'parse-contracts' | 'generate-tests' | 'validate-models' | 'check-completeness' | 'analyze-breaking-changes' | 'extract-nfrs' | 'create-tests' | 'assess-risks' | 'coding' | 'testing' | 'research' | 'review';
export type TaskStatus = 'pending' | 'blocked' | 'in_progress' | 'completed' | 'failed';
export interface TaskList extends Artifact {
    type: 'task-list';
    planId: string;
    specId: string;
    featureName: string;
    version: string;
    inputDocs: string[];
    tasks: Task[];
    phases: TaskPhase[];
    dependencyGraph: DependencyEdge[];
    dependencies?: TaskDependency[];
    mvpScope: string[];
    executionStrategy?: ExecutionStrategy;
}
export interface TaskPhase {
    id: string;
    phaseId?: string;
    name: string;
    number: number;
    purpose: string;
    userStory?: string;
    priority?: Priority;
    tasks: Task[];
    checkpoint?: string;
}
export interface TaskDependency {
    taskId: string;
    dependsOn: string[];
    description?: string;
}
export interface DependencyEdge {
    from: string;
    to: string;
}
export interface ExecutionStrategy {
    approach: 'mvp-first' | 'incremental' | 'parallel-team';
    description: string;
    phases: string[];
}
export interface ConstitutionDocument extends Artifact {
    type: 'constitution';
    projectName: string;
    version: string;
    ratifiedDate?: Date;
    lastAmendedDate?: Date;
    principles: ConstitutionPrinciple[];
    additionalSections: ConstitutionSection[];
    governance: GovernanceRules;
}
export interface ConstitutionPrinciple {
    id: string;
    name: string;
    description: string;
    rules: ConstitutionRule[];
    enforcementLevel: EnforcementLevel;
}
export type EnforcementLevel = 'mandatory' | 'recommended' | 'optional';
export interface ConstitutionRule {
    id: string;
    description: string;
    checkType: RuleCheckType;
    validator?: string;
    errorMessage: string;
}
export type RuleCheckType = 'pre-implementation' | 'post-implementation' | 'continuous' | 'gate';
export interface ConstitutionSection {
    name: string;
    content: string;
    rules?: ConstitutionRule[];
}
export interface GovernanceRules {
    constitutionSupersedes: boolean;
    amendmentRequirements: string[];
    reviewProcess: string;
}
export type AgentType = 'coordinator' | 'researcher' | 'coder' | 'analyst' | 'architect' | 'tester' | 'reviewer' | 'optimizer' | 'documenter' | 'monitor' | 'specialist' | 'constitutional-enforcer' | 'specification-optimizer' | 'artifact-validator' | 'task-orchestrator' | 'research-coordinator' | 'clarification-expert' | 'contract-validator' | 'nfr-specialist';
export interface AgentCapability {
    name: string;
    description: string;
    taskTypes: TaskType[];
}
export interface AgentAssignment {
    agentId: string;
    agentType: AgentType;
    taskId: string;
    assignedAt: Date;
    status: 'assigned' | 'working' | 'completed' | 'failed';
}
export interface ArtifactLineage {
    artifactId: string;
    artifactType: ArtifactType;
    sourceArtifacts: string[];
    derivedArtifacts: string[];
    generatingAgent: string;
    generatedAt: Date;
    validationStatus: 'pending' | 'valid' | 'invalid' | 'stale';
}
export interface LineageGraph {
    artifacts: Map<string, Artifact>;
    relationships: ArtifactRelationship[];
    rootArtifacts: string[];
}
export interface LineageNode {
    artifact: Artifact;
    parents: LineageNode[];
    children: LineageNode[];
    depth: number;
}
export interface LineageQuery {
    artifactId?: string;
    artifactType?: ArtifactType;
    relationshipType?: RelationshipType;
    depth?: number;
    includeOrphans?: boolean;
}
export interface ImpactAnalysis {
    changedArtifact: Artifact;
    impactedArtifacts: Artifact[];
    impactLevel: 'high' | 'medium' | 'low';
    recommendations: string[];
}
export interface OrphanedArtifact {
    artifact: Artifact;
    reason: string;
    suggestedAction: string;
}
export interface ComplianceResult {
    timestamp: Date;
    artifact: Artifact;
    passed: boolean;
    violations: ComplianceViolation[];
    warnings: ComplianceWarning[];
    score: number;
}
export interface ComplianceViolation {
    id: string;
    principleId: string;
    principleName: string;
    ruleId: string;
    description: string;
    severity: 'critical' | 'major' | 'minor';
    location?: string;
    suggestion?: string;
}
export interface ComplianceWarning {
    id: string;
    principleId: string;
    description: string;
    suggestion?: string;
}
export interface ComplianceException {
    id: string;
    violationId: string;
    justification: string;
    approvedBy: string;
    approvedAt: Date;
    expiresAt?: Date;
    scope: 'permanent' | 'temporary' | 'one-time';
}
export interface ComplianceReport {
    generatedAt: Date;
    projectName: string;
    constitutionVersion: string;
    overallScore: number;
    totalArtifacts: number;
    compliantArtifacts: number;
    principleBreakdown: PrincipleComplianceBreakdown[];
    violations: ComplianceViolation[];
    exceptions: ComplianceException[];
    recommendations: string[];
}
export interface PrincipleComplianceBreakdown {
    principleId: string;
    principleName: string;
    passed: boolean;
    passRate: number;
    violationCount: number;
    exceptionCount: number;
}
export interface ParseResult<T> {
    success: boolean;
    data?: T;
    errors: ParseError[];
    warnings: ParseWarning[];
}
export interface ParseError {
    line?: number;
    column?: number;
    message: string;
    code: string;
    context?: string;
}
export interface ParseWarning {
    line?: number;
    message: string;
    suggestion?: string;
}
export interface Metric {
    id: string;
    type: 'error' | 'performance' | 'usage' | 'coverage' | 'quality';
    name: string;
    value: number;
    unit: string;
    timestamp: Date;
    context: Record<string, unknown>;
}
export interface SpecRecommendation {
    id: string;
    type: 'add' | 'modify' | 'remove';
    targetArtifact: string;
    description: string;
    rationale: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    metrics: string[];
}
export type WorkflowPhase = 'specification' | 'clarification' | 'planning' | 'task-generation' | 'implementation' | 'validation' | 'complete';
export interface WorkflowState {
    workflowId: string;
    specId: string;
    currentPhase: WorkflowPhase;
    phaseHistory: PhaseTransition[];
    gates: GateStatus[];
    startedAt: Date;
    completedAt?: Date;
}
export interface PhaseTransition {
    from: WorkflowPhase;
    to: WorkflowPhase;
    timestamp: Date;
    triggeredBy: string;
    notes?: string;
}
export interface GateStatus {
    gateName: string;
    phase: WorkflowPhase;
    status: 'pending' | 'passed' | 'failed' | 'bypassed';
    checkedAt?: Date;
    checkedBy?: string;
    failureReason?: string;
}
export interface AuditEntry {
    id: string;
    timestamp: Date;
    agentId: string;
    agentType: AgentType;
    action: string;
    artifactType?: ArtifactType;
    artifactId?: string;
    details: Record<string, unknown>;
    outcome: 'success' | 'failure' | 'warning';
}
export type SpecKitEvent = {
    type: 'spec:created';
    payload: {
        specId: string;
    };
} | {
    type: 'spec:updated';
    payload: {
        specId: string;
        version: string;
    };
} | {
    type: 'plan:created';
    payload: {
        planId: string;
        specId: string;
    };
} | {
    type: 'tasks:generated';
    payload: {
        planId: string;
        taskCount: number;
    };
} | {
    type: 'task:started';
    payload: {
        taskId: string;
        agentId: string;
    };
} | {
    type: 'task:completed';
    payload: {
        taskId: string;
        agentId: string;
    };
} | {
    type: 'task:failed';
    payload: {
        taskId: string;
        reason: string;
    };
} | {
    type: 'gate:passed';
    payload: {
        gateName: string;
        phase: WorkflowPhase;
    };
} | {
    type: 'gate:failed';
    payload: {
        gateName: string;
        reason: string;
    };
} | {
    type: 'workflow:phase-changed';
    payload: {
        from: WorkflowPhase;
        to: WorkflowPhase;
    };
} | {
    type: 'constitution:violation';
    payload: {
        articleId: string;
        description: string;
    };
} | {
    type: 'artifact:created';
    payload: {
        artifactId: string;
        type: ArtifactType;
    };
} | {
    type: 'artifact:linked';
    payload: {
        sourceId: string;
        targetId: string;
        relationshipType: RelationshipType;
    };
} | {
    type: 'compliance:checked';
    payload: {
        artifactId: string;
        passed: boolean;
        score: number;
    };
} | {
    type: 'exception:granted';
    payload: {
        exceptionId: string;
        violationId: string;
    };
};
export interface EventHandler {
    (event: SpecKitEvent): void | Promise<void>;
}
export interface MarkdownSection {
    level: number;
    title: string;
    content: string;
    children: MarkdownSection[];
    lineStart: number;
    lineEnd: number;
}
export interface ChecklistItem {
    checked: boolean;
    text: string;
    id?: string;
    metadata?: Record<string, string>;
}
export interface MarkdownTable {
    headers: string[];
    rows: TableRow[];
}
export interface TableRow {
    cells: string[];
}
export interface ArtifactEvent {
    id: string;
    timestamp: Date;
    eventType: ArtifactEventType;
    artifactId: string;
    userId?: string;
    details: Record<string, unknown>;
}
export type ArtifactEventType = 'created' | 'updated' | 'deleted' | 'linked' | 'unlinked' | 'compliance-checked' | 'exception-granted' | 'exception-revoked';
//# sourceMappingURL=types.d.ts.map