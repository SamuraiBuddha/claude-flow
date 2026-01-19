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

// ============================================================================
// Core Artifact Types
// ============================================================================

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
  hash: string; // Content hash for change detection
  metadata: Record<string, unknown>;
}

export type ArtifactType =
  | 'specification'
  | 'plan'
  | 'research'
  | 'data-model'
  | 'contract'
  | 'task-list'
  | 'constitution'
  | 'code'
  | 'test'
  | 'documentation';

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

export type RelationshipType =
  | 'derives-from'    // Target is derived from source (spec -> plan)
  | 'implements'      // Target implements source (code -> spec)
  | 'tests'           // Target tests source (test -> code)
  | 'references'      // Target references source
  | 'supersedes'      // Target replaces source (versioning)
  | 'depends-on';     // Target depends on source existing

// ============================================================================
// Specification Types
// ============================================================================

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
  id: string; // e.g., FR-001, NFR-001
  type: 'functional' | 'non-functional';
  description: string;
  priority?: 'must' | 'should' | 'could' | 'wont';
  needsClarification?: boolean;
  clarificationNote?: string;
}

export interface SuccessCriterion {
  id: string; // e.g., SC-001
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

// ============================================================================
// Implementation Plan Types
// ============================================================================

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
  needsClarification: string[]; // Fields that need clarification
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

// ============================================================================
// Research Document Types
// ============================================================================

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

// ============================================================================
// Data Model Document Types
// ============================================================================

export interface DataModelDocument extends Artifact {
  type: 'data-model';
  featureName: string;
  entities: DataEntity[];
  relationships: DataRelationship[];
  diagrams?: string[]; // Mermaid diagrams or other
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

// ============================================================================
// Task Types
// ============================================================================

export interface Task {
  taskId: string;
  id?: string; // Alias for taskId (e.g., T001)
  storyId?: string;
  planId?: string;
  description: string;
  type: TaskType;
  priority?: Priority;
  parallelizable: boolean;
  parallel?: boolean; // Alias for parallelizable
  dependencies: string[];
  filePaths: string[];
  filePath?: string;
  acceptanceCriteria: string[];
  testScenarios: string[];
  assignedAgent?: string;
  status: TaskStatus;
  userStory?: string; // e.g., US1, US2
  completed?: boolean;
  startedAt?: Date;
  completedAt?: Date;
  failureReason?: string;
}

export type TaskType =
  | 'setup'
  | 'infrastructure'
  | 'model'
  | 'service'
  | 'endpoint'
  | 'test'
  | 'integration'
  | 'documentation'
  | 'validation'
  | 'refactoring'
  // Constitutional Enforcer tasks
  | 'read-constitution'
  | 'validate-plan'
  | 'check-gate'
  | 'record-exception'
  | 'audit-violations'
  // Specification Optimizer tasks
  | 'analyze-metrics'
  | 'propose-updates'
  | 'trigger-regeneration'
  | 'forecast-metrics'
  | 'detect-drift'
  // Artifact Validator tasks
  | 'validate-spec'
  | 'check-coverage'
  | 'identify-gaps'
  | 'analyze-consistency'
  | 'trace-requirements'
  // Task Orchestrator Agent tasks
  | 'parse-tasks'
  | 'build-graph'
  | 'assign-agents'
  | 'track-progress'
  // Research Coordinator tasks
  | 'extract-unknowns'
  | 'spawn-research'
  | 'consolidate-findings'
  | 'generate-document'
  | 'track-research'
  // Clarification Expert tasks
  | 'generate-questions'
  | 'record-answers'
  | 'validate-completeness'
  | 'analyze-coverage'
  | 'manage-session'
  // Contract Validator tasks
  | 'parse-contracts'
  | 'generate-tests'
  | 'validate-models'
  | 'check-completeness'
  | 'analyze-breaking-changes'
  // NFR Specialist tasks
  | 'extract-nfrs'
  | 'create-tests'
  | 'assess-risks'
  | 'coding'
  | 'testing'
  | 'research'
  | 'review';

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
  userStory?: string; // e.g., US1, US2
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

// ============================================================================
// Constitution Types
// ============================================================================

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
  id: string; // e.g., I, II, III or PRINCIPLE_1
  name: string;
  description: string;
  rules: ConstitutionRule[];
  enforcementLevel: EnforcementLevel;
}

export type EnforcementLevel =
  | 'mandatory'     // Must be enforced, no exceptions
  | 'recommended'   // Should be enforced, exceptions allowed with justification
  | 'optional';     // Nice to have

export interface ConstitutionRule {
  id: string;
  description: string;
  checkType: RuleCheckType;
  validator?: string; // Reference to validation function
  errorMessage: string;
}

export type RuleCheckType =
  | 'pre-implementation'  // Check before code is written
  | 'post-implementation' // Check after code is written
  | 'continuous'          // Check throughout
  | 'gate';               // Blocking checkpoint

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

// ============================================================================
// Agent Types
// ============================================================================

export type AgentType =
  | 'coordinator'
  | 'researcher'
  | 'coder'
  | 'analyst'
  | 'architect'
  | 'tester'
  | 'reviewer'
  | 'optimizer'
  | 'documenter'
  | 'monitor'
  | 'specialist'
  | 'constitutional-enforcer'
  | 'specification-optimizer'
  | 'artifact-validator'
  | 'task-orchestrator'
  | 'research-coordinator'
  | 'clarification-expert'
  | 'contract-validator'
  | 'nfr-specialist';

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

// ============================================================================
// Artifact Lineage Types
// ============================================================================

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
  rootArtifacts: string[]; // IDs of root artifacts (typically specs)
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

// ============================================================================
// Compliance Types
// ============================================================================

export interface ComplianceResult {
  timestamp: Date;
  artifact: Artifact;
  passed: boolean;
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
  score: number; // 0-100
}

export interface ComplianceViolation {
  id: string;
  principleId: string;
  principleName: string;
  ruleId: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  location?: string; // File path or section
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
  passRate: number; // 0-100
  violationCount: number;
  exceptionCount: number;
}

// ============================================================================
// Parser Result Types
// ============================================================================

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

// ============================================================================
// Feedback & Metrics Types
// ============================================================================

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

// ============================================================================
// Workflow Types
// ============================================================================

export type WorkflowPhase =
  | 'specification'
  | 'clarification'
  | 'planning'
  | 'task-generation'
  | 'implementation'
  | 'validation'
  | 'complete';

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

// ============================================================================
// Audit Types
// ============================================================================

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

// ============================================================================
// Event Types
// ============================================================================

export type SpecKitEvent =
  | { type: 'spec:created'; payload: { specId: string } }
  | { type: 'spec:updated'; payload: { specId: string; version: string } }
  | { type: 'plan:created'; payload: { planId: string; specId: string } }
  | { type: 'tasks:generated'; payload: { planId: string; taskCount: number } }
  | { type: 'task:started'; payload: { taskId: string; agentId: string } }
  | { type: 'task:completed'; payload: { taskId: string; agentId: string } }
  | { type: 'task:failed'; payload: { taskId: string; reason: string } }
  | { type: 'gate:passed'; payload: { gateName: string; phase: WorkflowPhase } }
  | { type: 'gate:failed'; payload: { gateName: string; reason: string } }
  | { type: 'workflow:phase-changed'; payload: { from: WorkflowPhase; to: WorkflowPhase } }
  | { type: 'constitution:violation'; payload: { articleId: string; description: string } }
  | { type: 'artifact:created'; payload: { artifactId: string; type: ArtifactType } }
  | { type: 'artifact:linked'; payload: { sourceId: string; targetId: string; relationshipType: RelationshipType } }
  | { type: 'compliance:checked'; payload: { artifactId: string; passed: boolean; score: number } }
  | { type: 'exception:granted'; payload: { exceptionId: string; violationId: string } };

export interface EventHandler {
  (event: SpecKitEvent): void | Promise<void>;
}

// ============================================================================
// Utility Types
// ============================================================================

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

// ============================================================================
// Artifact Event Types (for tracking and auditing)
// ============================================================================

export interface ArtifactEvent {
  id: string;
  timestamp: Date;
  eventType: ArtifactEventType;
  artifactId: string;
  userId?: string;
  details: Record<string, unknown>;
}

export type ArtifactEventType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'linked'
  | 'unlinked'
  | 'compliance-checked'
  | 'exception-granted'
  | 'exception-revoked';
