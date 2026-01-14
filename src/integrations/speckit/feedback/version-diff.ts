/**
 * VersionDiff - Compare spec versions with semantic diff
 *
 * Identifies added requirements, removed features, changed acceptance criteria
 * Outputs human-readable change reports
 */

import { EventEmitter } from 'events';

// Types for version diffing
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
  changeScore: number; // 0-100, higher = more changes
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
  priorityChange?: { from: string; to: string };
  criteriaChanges?: string[];
}

export interface RequirementChange extends BaseChange<Requirement> {
  changeType: 'requirement';
  priorityChange?: { from: string; to: string };
  typeChange?: { from: string; to: string };
}

export interface AcceptanceCriteriaChange extends BaseChange<AcceptanceCriterion> {
  changeType: 'acceptance_criteria';
  storyId?: string;
  stepsChanged?: boolean;
}

export interface NFRChange extends BaseChange<NonFunctionalRequirement> {
  changeType: 'nfr';
  categoryChange?: { from: string; to: string };
  targetChange?: { from: string; to: string };
}

export interface DependencyChange extends BaseChange<Dependency> {
  changeType: 'dependency';
  versionChange?: { from: string; to: string };
  requiredChange?: { from: boolean; to: boolean };
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
  'diff:started': { baseVersion: string; compareVersion: string };
  'diff:completed': DiffResult;
  'breaking:detected': BreakingChangeDetail;
  'change:found': BaseChange<any>;
  'error': Error;
}

/**
 * VersionDiff class for semantic spec version comparison
 */
export class VersionDiff extends EventEmitter {
  private config: VersionDiffConfig;
  private versionHistory = new Map<string, SpecVersion[]>();
  private diffCache = new Map<string, DiffResult>();

  constructor(config: Partial<VersionDiffConfig> = {}) {
    super();
    this.config = {
      trackMetadataChanges: config.trackMetadataChanges ?? true,
      breakingChangeRules: config.breakingChangeRules || this.getDefaultBreakingRules(),
      diffAlgorithm: config.diffAlgorithm || 'semantic',
      includeWhitespaceChanges: config.includeWhitespaceChanges ?? false,
    };
  }

  /**
   * Get default breaking change rules
   */
  private getDefaultBreakingRules(): BreakingChangeRule[] {
    return [
      {
        id: 'removed-story',
        name: 'Story Removed',
        pattern: 'story.removed',
        severity: 'high',
        description: 'A user story has been completely removed',
      },
      {
        id: 'removed-requirement',
        name: 'Requirement Removed',
        pattern: 'requirement.removed',
        severity: 'critical',
        description: 'A requirement has been removed',
      },
      {
        id: 'priority-downgrade',
        name: 'Priority Downgrade',
        pattern: 'priority.changed.must-to-*',
        severity: 'high',
        description: 'A must-have priority was downgraded',
      },
      {
        id: 'criteria-removed',
        name: 'Acceptance Criteria Removed',
        pattern: 'acceptance.removed',
        severity: 'high',
        description: 'Acceptance criteria were removed from a story',
      },
      {
        id: 'nfr-relaxed',
        name: 'NFR Target Relaxed',
        pattern: 'nfr.target.relaxed',
        severity: 'medium',
        description: 'A non-functional requirement target was relaxed',
      },
      {
        id: 'dependency-removed',
        name: 'Required Dependency Removed',
        pattern: 'dependency.required.removed',
        severity: 'critical',
        description: 'A required dependency was removed',
      },
    ];
  }

  /**
   * Compare two spec versions
   */
  async diff(
    baseVersion: SpecVersion,
    compareVersion: SpecVersion
  ): Promise<DiffResult> {
    this.emit('diff:started', {
      baseVersion: baseVersion.version,
      compareVersion: compareVersion.version,
    });

    // Check cache
    const cacheKey = `${baseVersion.checksum}-${compareVersion.checksum}`;
    const cached = this.diffCache.get(cacheKey);
    if (cached) return cached;

    const result: DiffResult = {
      id: this.generateId(),
      baseVersion: baseVersion.version,
      compareVersion: compareVersion.version,
      timestamp: new Date(),
      summary: {
        totalChanges: 0,
        additions: 0,
        removals: 0,
        modifications: 0,
        breakingChanges: 0,
        hasBreakingChanges: false,
        changeScore: 0,
      },
      changes: {
        stories: [],
        requirements: [],
        acceptanceCriteria: [],
        nonFunctional: [],
        dependencies: [],
        metadata: [],
      },
      impact: {
        severity: 'none',
        affectedAreas: [],
        estimatedEffort: 'low',
        riskLevel: 'low',
        recommendations: [],
        breakingChangeDetails: [],
      },
      humanReadable: '',
    };

    // Perform diffs for each section
    result.changes.stories = this.diffStories(
      baseVersion.content.stories || [],
      compareVersion.content.stories || []
    );

    result.changes.requirements = this.diffRequirements(
      baseVersion.content.requirements || [],
      compareVersion.content.requirements || []
    );

    result.changes.acceptanceCriteria = this.diffAcceptanceCriteria(
      baseVersion.content.acceptanceCriteria || [],
      compareVersion.content.acceptanceCriteria || []
    );

    result.changes.nonFunctional = this.diffNFRs(
      baseVersion.content.nonFunctional || [],
      compareVersion.content.nonFunctional || []
    );

    result.changes.dependencies = this.diffDependencies(
      baseVersion.content.dependencies || [],
      compareVersion.content.dependencies || []
    );

    if (this.config.trackMetadataChanges) {
      result.changes.metadata = this.diffMetadata(
        baseVersion.content.metadata || {},
        compareVersion.content.metadata || {}
      );
    }

    // Calculate summary
    this.calculateSummary(result);

    // Assess impact
    result.impact = this.assessImpact(result);

    // Generate human-readable report
    result.humanReadable = this.generateReport(result);

    // Cache result
    this.diffCache.set(cacheKey, result);

    this.emit('diff:completed', result);
    return result;
  }

  /**
   * Get stories that changed between versions
   */
  getChangedStories(result: DiffResult): StoryChange[] {
    return result.changes.stories;
  }

  /**
   * Get impact assessment for a diff
   */
  getImpactAssessment(result: DiffResult): ImpactAssessment {
    return result.impact;
  }

  /**
   * Store a version for history tracking
   */
  storeVersion(specId: string, version: SpecVersion): void {
    const history = this.versionHistory.get(specId) || [];
    history.push(version);
    history.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    this.versionHistory.set(specId, history);
  }

  /**
   * Get version history for a spec
   */
  getVersionHistory(specId: string): SpecVersion[] {
    return this.versionHistory.get(specId) || [];
  }

  /**
   * Get latest version
   */
  getLatestVersion(specId: string): SpecVersion | undefined {
    const history = this.versionHistory.get(specId);
    return history?.[history.length - 1];
  }

  /**
   * Compare with previous version
   */
  async diffWithPrevious(specId: string): Promise<DiffResult | null> {
    const history = this.versionHistory.get(specId);
    if (!history || history.length < 2) return null;

    const current = history[history.length - 1];
    const previous = history[history.length - 2];

    return this.diff(previous, current);
  }

  // Private diff methods

  private diffStories(base: UserStory[], compare: UserStory[]): StoryChange[] {
    const changes: StoryChange[] = [];
    const baseMap = new Map(base.map(s => [s.id, s]));
    const compareMap = new Map(compare.map(s => [s.id, s]));

    // Find additions and modifications
    for (const [id, story] of compareMap) {
      const baseStory = baseMap.get(id);

      if (!baseStory) {
        // Added
        const change: StoryChange = {
          id: this.generateId(),
          type: 'added',
          changeType: 'story',
          path: `stories.${id}`,
          itemId: id,
          isBreaking: false,
          after: story,
          description: `Added story: ${story.title}`,
        };
        changes.push(change);
        this.emit('change:found', change);
      } else if (!this.deepEqual(baseStory, story)) {
        // Modified
        const change: StoryChange = {
          id: this.generateId(),
          type: 'modified',
          changeType: 'story',
          path: `stories.${id}`,
          itemId: id,
          isBreaking: false,
          before: baseStory,
          after: story,
          description: `Modified story: ${story.title}`,
        };

        // Check for priority changes
        if (baseStory.priority !== story.priority) {
          change.priorityChange = { from: baseStory.priority || 'none', to: story.priority || 'none' };
        }

        // Check for criteria changes
        if (!this.arraysEqual(baseStory.acceptanceCriteria, story.acceptanceCriteria)) {
          change.criteriaChanges = this.getArrayDiff(
            baseStory.acceptanceCriteria || [],
            story.acceptanceCriteria || []
          );
        }

        changes.push(change);
        this.emit('change:found', change);
      }
    }

    // Find removals
    for (const [id, story] of baseMap) {
      if (!compareMap.has(id)) {
        const change: StoryChange = {
          id: this.generateId(),
          type: 'removed',
          changeType: 'story',
          path: `stories.${id}`,
          itemId: id,
          isBreaking: true,
          before: story,
          description: `Removed story: ${story.title}`,
        };
        changes.push(change);
        this.emit('change:found', change);

        // Emit breaking change
        this.emit('breaking:detected', {
          changeId: change.id,
          description: `Story "${story.title}" was removed`,
          impact: 'May affect dependent plans and tasks',
          mitigation: 'Review dependent items and update or remove them',
        });
      }
    }

    return changes;
  }

  private diffRequirements(base: Requirement[], compare: Requirement[]): RequirementChange[] {
    const changes: RequirementChange[] = [];
    const baseMap = new Map(base.map(r => [r.id, r]));
    const compareMap = new Map(compare.map(r => [r.id, r]));

    // Find additions and modifications
    for (const [id, req] of compareMap) {
      const baseReq = baseMap.get(id);

      if (!baseReq) {
        const change: RequirementChange = {
          id: this.generateId(),
          type: 'added',
          changeType: 'requirement',
          path: `requirements.${id}`,
          itemId: id,
          isBreaking: false,
          after: req,
          description: `Added requirement: ${req.title}`,
        };
        changes.push(change);
        this.emit('change:found', change);
      } else if (!this.deepEqual(baseReq, req)) {
        const change: RequirementChange = {
          id: this.generateId(),
          type: 'modified',
          changeType: 'requirement',
          path: `requirements.${id}`,
          itemId: id,
          isBreaking: false,
          before: baseReq,
          after: req,
          description: `Modified requirement: ${req.title}`,
        };

        if (baseReq.priority !== req.priority) {
          change.priorityChange = { from: baseReq.priority, to: req.priority };
          // Breaking if downgrading from must
          if (baseReq.priority === 'must' && req.priority !== 'must') {
            change.isBreaking = true;
          }
        }

        if (baseReq.type !== req.type) {
          change.typeChange = { from: baseReq.type, to: req.type };
        }

        changes.push(change);
        this.emit('change:found', change);
      }
    }

    // Find removals
    for (const [id, req] of baseMap) {
      if (!compareMap.has(id)) {
        const change: RequirementChange = {
          id: this.generateId(),
          type: 'removed',
          changeType: 'requirement',
          path: `requirements.${id}`,
          itemId: id,
          isBreaking: true,
          before: req,
          description: `Removed requirement: ${req.title}`,
        };
        changes.push(change);
        this.emit('change:found', change);

        this.emit('breaking:detected', {
          changeId: change.id,
          description: `Requirement "${req.title}" was removed`,
          impact: 'Implementation may need to be reverted',
          mitigation: 'Verify this requirement is truly obsolete',
        });
      }
    }

    return changes;
  }

  private diffAcceptanceCriteria(
    base: AcceptanceCriterion[],
    compare: AcceptanceCriterion[]
  ): AcceptanceCriteriaChange[] {
    const changes: AcceptanceCriteriaChange[] = [];
    const baseMap = new Map(base.map(ac => [ac.id, ac]));
    const compareMap = new Map(compare.map(ac => [ac.id, ac]));

    for (const [id, ac] of compareMap) {
      const baseAC = baseMap.get(id);

      if (!baseAC) {
        changes.push({
          id: this.generateId(),
          type: 'added',
          changeType: 'acceptance_criteria',
          path: `acceptanceCriteria.${id}`,
          itemId: id,
          isBreaking: false,
          after: ac,
          storyId: ac.storyId,
          description: `Added acceptance criterion: ${ac.description.substring(0, 50)}...`,
        });
      } else if (!this.deepEqual(baseAC, ac)) {
        const stepsChanged = !this.arraysEqual(baseAC.steps, ac.steps);
        changes.push({
          id: this.generateId(),
          type: 'modified',
          changeType: 'acceptance_criteria',
          path: `acceptanceCriteria.${id}`,
          itemId: id,
          isBreaking: stepsChanged, // Changing test steps is potentially breaking
          before: baseAC,
          after: ac,
          storyId: ac.storyId,
          stepsChanged,
          description: `Modified acceptance criterion: ${ac.description.substring(0, 50)}...`,
        });
      }
    }

    for (const [id, ac] of baseMap) {
      if (!compareMap.has(id)) {
        changes.push({
          id: this.generateId(),
          type: 'removed',
          changeType: 'acceptance_criteria',
          path: `acceptanceCriteria.${id}`,
          itemId: id,
          isBreaking: true,
          before: ac,
          storyId: ac.storyId,
          description: `Removed acceptance criterion: ${ac.description.substring(0, 50)}...`,
        });
      }
    }

    return changes;
  }

  private diffNFRs(
    base: NonFunctionalRequirement[],
    compare: NonFunctionalRequirement[]
  ): NFRChange[] {
    const changes: NFRChange[] = [];
    const baseMap = new Map(base.map(n => [n.id, n]));
    const compareMap = new Map(compare.map(n => [n.id, n]));

    for (const [id, nfr] of compareMap) {
      const baseNFR = baseMap.get(id);

      if (!baseNFR) {
        changes.push({
          id: this.generateId(),
          type: 'added',
          changeType: 'nfr',
          path: `nonFunctional.${id}`,
          itemId: id,
          isBreaking: false,
          after: nfr,
          description: `Added NFR: ${nfr.description.substring(0, 50)}...`,
        });
      } else if (!this.deepEqual(baseNFR, nfr)) {
        const change: NFRChange = {
          id: this.generateId(),
          type: 'modified',
          changeType: 'nfr',
          path: `nonFunctional.${id}`,
          itemId: id,
          isBreaking: false,
          before: baseNFR,
          after: nfr,
          description: `Modified NFR: ${nfr.description.substring(0, 50)}...`,
        };

        if (baseNFR.category !== nfr.category) {
          change.categoryChange = { from: baseNFR.category, to: nfr.category };
        }

        if (baseNFR.target !== nfr.target) {
          change.targetChange = { from: baseNFR.target || '', to: nfr.target || '' };
          // Check if target was relaxed (potentially breaking)
          if (this.isTargetRelaxed(baseNFR.target, nfr.target, baseNFR.category)) {
            change.isBreaking = true;
          }
        }

        changes.push(change);
      }
    }

    for (const [id, nfr] of baseMap) {
      if (!compareMap.has(id)) {
        changes.push({
          id: this.generateId(),
          type: 'removed',
          changeType: 'nfr',
          path: `nonFunctional.${id}`,
          itemId: id,
          isBreaking: true,
          before: nfr,
          description: `Removed NFR: ${nfr.description.substring(0, 50)}...`,
        });
      }
    }

    return changes;
  }

  private diffDependencies(base: Dependency[], compare: Dependency[]): DependencyChange[] {
    const changes: DependencyChange[] = [];
    const baseMap = new Map(base.map(d => [d.id, d]));
    const compareMap = new Map(compare.map(d => [d.id, d]));

    for (const [id, dep] of compareMap) {
      const baseDep = baseMap.get(id);

      if (!baseDep) {
        changes.push({
          id: this.generateId(),
          type: 'added',
          changeType: 'dependency',
          path: `dependencies.${id}`,
          itemId: id,
          isBreaking: false,
          after: dep,
          description: `Added dependency: ${dep.name}`,
        });
      } else if (!this.deepEqual(baseDep, dep)) {
        const change: DependencyChange = {
          id: this.generateId(),
          type: 'modified',
          changeType: 'dependency',
          path: `dependencies.${id}`,
          itemId: id,
          isBreaking: false,
          before: baseDep,
          after: dep,
          description: `Modified dependency: ${dep.name}`,
        };

        if (baseDep.version !== dep.version) {
          change.versionChange = { from: baseDep.version || '', to: dep.version || '' };
        }

        if (baseDep.required !== dep.required) {
          change.requiredChange = { from: baseDep.required, to: dep.required };
          if (baseDep.required && !dep.required) {
            change.isBreaking = true;
          }
        }

        changes.push(change);
      }
    }

    for (const [id, dep] of baseMap) {
      if (!compareMap.has(id)) {
        changes.push({
          id: this.generateId(),
          type: 'removed',
          changeType: 'dependency',
          path: `dependencies.${id}`,
          itemId: id,
          isBreaking: dep.required,
          before: dep,
          description: `Removed dependency: ${dep.name}`,
        });
      }
    }

    return changes;
  }

  private diffMetadata(base: Record<string, any>, compare: Record<string, any>): MetadataChange[] {
    const changes: MetadataChange[] = [];
    const allKeys = new Set([...Object.keys(base), ...Object.keys(compare)]);

    for (const key of allKeys) {
      const baseVal = base[key];
      const compareVal = compare[key];

      if (baseVal === undefined && compareVal !== undefined) {
        changes.push({
          id: this.generateId(),
          type: 'added',
          changeType: 'metadata',
          path: `metadata.${key}`,
          itemId: key,
          key,
          isBreaking: false,
          after: compareVal,
          description: `Added metadata: ${key}`,
        });
      } else if (baseVal !== undefined && compareVal === undefined) {
        changes.push({
          id: this.generateId(),
          type: 'removed',
          changeType: 'metadata',
          path: `metadata.${key}`,
          itemId: key,
          key,
          isBreaking: false,
          before: baseVal,
          description: `Removed metadata: ${key}`,
        });
      } else if (!this.deepEqual(baseVal, compareVal)) {
        changes.push({
          id: this.generateId(),
          type: 'modified',
          changeType: 'metadata',
          path: `metadata.${key}`,
          itemId: key,
          key,
          isBreaking: false,
          before: baseVal,
          after: compareVal,
          description: `Modified metadata: ${key}`,
        });
      }
    }

    return changes;
  }

  // Helper methods

  private calculateSummary(result: DiffResult): void {
    const allChanges = [
      ...result.changes.stories,
      ...result.changes.requirements,
      ...result.changes.acceptanceCriteria,
      ...result.changes.nonFunctional,
      ...result.changes.dependencies,
      ...result.changes.metadata,
    ];

    result.summary.totalChanges = allChanges.length;
    result.summary.additions = allChanges.filter(c => c.type === 'added').length;
    result.summary.removals = allChanges.filter(c => c.type === 'removed').length;
    result.summary.modifications = allChanges.filter(c => c.type === 'modified').length;
    result.summary.breakingChanges = allChanges.filter(c => c.isBreaking).length;
    result.summary.hasBreakingChanges = result.summary.breakingChanges > 0;

    // Calculate change score (0-100)
    const maxChangesForFullScore = 50;
    const breakingMultiplier = 2;
    const weightedChanges = result.summary.totalChanges +
      (result.summary.breakingChanges * breakingMultiplier);
    result.summary.changeScore = Math.min(100, (weightedChanges / maxChangesForFullScore) * 100);
  }

  private assessImpact(result: DiffResult): ImpactAssessment {
    const assessment: ImpactAssessment = {
      severity: 'none',
      affectedAreas: [],
      estimatedEffort: 'low',
      riskLevel: 'low',
      recommendations: [],
      breakingChangeDetails: [],
    };

    // Determine severity
    if (result.summary.breakingChanges > 5) {
      assessment.severity = 'critical';
    } else if (result.summary.breakingChanges > 0) {
      assessment.severity = 'high';
    } else if (result.summary.totalChanges > 20) {
      assessment.severity = 'medium';
    } else if (result.summary.totalChanges > 0) {
      assessment.severity = 'low';
    }

    // Identify affected areas
    if (result.changes.stories.length > 0) assessment.affectedAreas.push('User Stories');
    if (result.changes.requirements.length > 0) assessment.affectedAreas.push('Requirements');
    if (result.changes.acceptanceCriteria.length > 0) assessment.affectedAreas.push('Acceptance Criteria');
    if (result.changes.nonFunctional.length > 0) assessment.affectedAreas.push('Non-Functional Requirements');
    if (result.changes.dependencies.length > 0) assessment.affectedAreas.push('Dependencies');

    // Estimate effort
    if (result.summary.totalChanges > 30 || result.summary.breakingChanges > 3) {
      assessment.estimatedEffort = 'high';
    } else if (result.summary.totalChanges > 10 || result.summary.breakingChanges > 0) {
      assessment.estimatedEffort = 'medium';
    }

    // Assess risk
    if (result.summary.breakingChanges > 0) {
      assessment.riskLevel = result.summary.breakingChanges > 3 ? 'high' : 'medium';
    }

    // Generate recommendations
    if (result.summary.breakingChanges > 0) {
      assessment.recommendations.push('Review all breaking changes before deployment');
      assessment.recommendations.push('Update dependent systems and documentation');
      assessment.recommendations.push('Plan migration strategy for affected features');
    }

    if (result.changes.requirements.filter(r => r.type === 'removed').length > 0) {
      assessment.recommendations.push('Verify removed requirements are truly obsolete');
    }

    if (result.changes.acceptanceCriteria.filter(a => a.stepsChanged).length > 0) {
      assessment.recommendations.push('Update test cases to match new acceptance criteria');
    }

    // Collect breaking change details
    const allChanges = [
      ...result.changes.stories,
      ...result.changes.requirements,
      ...result.changes.acceptanceCriteria,
      ...result.changes.nonFunctional,
      ...result.changes.dependencies,
    ];

    for (const change of allChanges.filter(c => c.isBreaking)) {
      assessment.breakingChangeDetails.push({
        changeId: change.id,
        description: change.description,
        impact: `Affects ${change.changeType} implementation`,
        mitigation: this.getMitigationForChange(change),
      });
    }

    return assessment;
  }

  private generateReport(result: DiffResult): string {
    const lines: string[] = [];

    lines.push('# Spec Version Diff Report');
    lines.push('');
    lines.push(`**Base Version:** ${result.baseVersion}`);
    lines.push(`**Compare Version:** ${result.compareVersion}`);
    lines.push(`**Generated:** ${result.timestamp.toISOString()}`);
    lines.push('');

    // Summary
    lines.push('## Summary');
    lines.push('');
    lines.push(`- **Total Changes:** ${result.summary.totalChanges}`);
    lines.push(`- **Additions:** ${result.summary.additions}`);
    lines.push(`- **Removals:** ${result.summary.removals}`);
    lines.push(`- **Modifications:** ${result.summary.modifications}`);
    lines.push(`- **Breaking Changes:** ${result.summary.breakingChanges}`);
    lines.push(`- **Change Score:** ${result.summary.changeScore.toFixed(1)}/100`);
    lines.push('');

    // Breaking changes warning
    if (result.summary.hasBreakingChanges) {
      lines.push('## ⚠️ Breaking Changes');
      lines.push('');
      for (const detail of result.impact.breakingChangeDetails) {
        lines.push(`### ${detail.description}`);
        lines.push(`- **Impact:** ${detail.impact}`);
        lines.push(`- **Mitigation:** ${detail.mitigation}`);
        lines.push('');
      }
    }

    // Detailed changes
    if (result.changes.stories.length > 0) {
      lines.push('## Story Changes');
      lines.push('');
      for (const change of result.changes.stories) {
        const icon = change.type === 'added' ? '➕' : change.type === 'removed' ? '➖' : '✏️';
        lines.push(`- ${icon} ${change.description}`);
      }
      lines.push('');
    }

    if (result.changes.requirements.length > 0) {
      lines.push('## Requirement Changes');
      lines.push('');
      for (const change of result.changes.requirements) {
        const icon = change.type === 'added' ? '➕' : change.type === 'removed' ? '➖' : '✏️';
        lines.push(`- ${icon} ${change.description}`);
        if (change.priorityChange) {
          lines.push(`  - Priority: ${change.priorityChange.from} → ${change.priorityChange.to}`);
        }
      }
      lines.push('');
    }

    // Impact assessment
    lines.push('## Impact Assessment');
    lines.push('');
    lines.push(`- **Severity:** ${result.impact.severity}`);
    lines.push(`- **Estimated Effort:** ${result.impact.estimatedEffort}`);
    lines.push(`- **Risk Level:** ${result.impact.riskLevel}`);
    lines.push(`- **Affected Areas:** ${result.impact.affectedAreas.join(', ') || 'None'}`);
    lines.push('');

    if (result.impact.recommendations.length > 0) {
      lines.push('### Recommendations');
      lines.push('');
      for (const rec of result.impact.recommendations) {
        lines.push(`- ${rec}`);
      }
    }

    return lines.join('\n');
  }

  private getMitigationForChange(change: BaseChange<any>): string {
    if (change.type === 'removed') {
      return 'Verify removal is intentional and update/remove dependent implementations';
    }
    if (change.type === 'modified') {
      return 'Review modified specification and update implementation accordingly';
    }
    return 'Review change and assess implementation impact';
  }

  private isTargetRelaxed(oldTarget?: string, newTarget?: string, category?: string): boolean {
    if (!oldTarget || !newTarget) return false;

    // Extract numeric values for comparison
    const oldNum = parseFloat(oldTarget);
    const newNum = parseFloat(newTarget);

    if (isNaN(oldNum) || isNaN(newNum)) return false;

    // For performance metrics, higher values are usually worse
    if (category === 'performance') {
      return newNum > oldNum;
    }

    // For reliability, lower values are worse (e.g., 99.9% → 99%)
    if (category === 'reliability') {
      return newNum < oldNum;
    }

    return false;
  }

  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;

    if (typeof a !== 'object') return a === b;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, i) => this.deepEqual(item, b[i]));
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => this.deepEqual(a[key], b[key]));
  }

  private arraysEqual(a?: any[], b?: any[]): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    return a.every((item, i) => this.deepEqual(item, b[i]));
  }

  private getArrayDiff(oldArr: string[], newArr: string[]): string[] {
    const added = newArr.filter(item => !oldArr.includes(item)).map(i => `+${i}`);
    const removed = oldArr.filter(item => !newArr.includes(item)).map(i => `-${i}`);
    return [...added, ...removed];
  }

  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 11);
    return `diff_${timestamp}_${random}`;
  }
}

export default VersionDiff;
