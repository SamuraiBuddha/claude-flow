/**
 * Artifact Lineage Tracker
 *
 * Tracks relationships between spec-driven development artifacts:
 * spec -> plan -> tasks -> code
 *
 * Provides methods for:
 * - Recording derivations between artifacts
 * - Querying lineage graphs
 * - Detecting orphaned artifacts
 * - Analyzing change impact
 * - Visualizing dependency trees
 */

import * as crypto from 'crypto';
import {
  Artifact,
  ArtifactType,
  ArtifactRelationship,
  RelationshipType,
  LineageGraph,
  LineageNode,
  LineageQuery,
  ImpactAnalysis,
  OrphanedArtifact,
  ArtifactEvent,
  ArtifactEventType,
  EventHandler,
} from './types.js';

/**
 * Configuration for ArtifactLineageTracker
 */
export interface LineageTrackerConfig {
  /** Enable event emission */
  enableEvents?: boolean;
  /** Maximum depth for lineage queries */
  maxQueryDepth?: number;
  /** Auto-detect orphans on each operation */
  autoDetectOrphans?: boolean;
}

/**
 * ArtifactLineageTracker - Tracks relationships between SDD artifacts
 */
export class ArtifactLineageTracker {
  private artifacts: Map<string, Artifact> = new Map();
  private relationships: ArtifactRelationship[] = [];
  private eventHandlers: EventHandler[] = [];
  private config: Required<LineageTrackerConfig>;

  constructor(config: LineageTrackerConfig = {}) {
    this.config = {
      enableEvents: config.enableEvents ?? true,
      maxQueryDepth: config.maxQueryDepth ?? 10,
      autoDetectOrphans: config.autoDetectOrphans ?? false,
    };
  }

  // ==========================================================================
  // Artifact Management
  // ==========================================================================

  /**
   * Register a new artifact
   */
  public registerArtifact(artifact: Artifact): void {
    this.artifacts.set(artifact.id, artifact);
    this.emitEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'created',
      artifactId: artifact.id,
      details: { type: artifact.type, path: artifact.path },
    });
  }

  /**
   * Update an existing artifact
   */
  public updateArtifact(artifact: Artifact): void {
    if (!this.artifacts.has(artifact.id)) {
      throw new Error(`Artifact ${artifact.id} not found`);
    }
    artifact.updatedAt = new Date();
    this.artifacts.set(artifact.id, artifact);
    this.emitEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'updated',
      artifactId: artifact.id,
      details: { type: artifact.type, newHash: artifact.hash },
    });
  }

  /**
   * Remove an artifact and its relationships
   */
  public removeArtifact(artifactId: string): void {
    if (!this.artifacts.has(artifactId)) {
      return;
    }

    // Remove relationships involving this artifact
    this.relationships = this.relationships.filter(
      (r) => r.sourceId !== artifactId && r.targetId !== artifactId
    );

    this.artifacts.delete(artifactId);
    this.emitEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'deleted',
      artifactId,
      details: {},
    });
  }

  /**
   * Get an artifact by ID
   */
  public getArtifact(artifactId: string): Artifact | undefined {
    return this.artifacts.get(artifactId);
  }

  /**
   * Get all artifacts of a specific type
   */
  public getArtifactsByType(type: ArtifactType): Artifact[] {
    return Array.from(this.artifacts.values()).filter((a) => a.type === type);
  }

  // ==========================================================================
  // Derivation Recording
  // ==========================================================================

  /**
   * Record a derivation relationship between artifacts
   *
   * @param sourceId - The source artifact ID (e.g., spec)
   * @param targetId - The derived artifact ID (e.g., plan derived from spec)
   * @param relationshipType - Type of relationship
   * @param metadata - Additional metadata about the derivation
   */
  public recordDerivation(
    sourceId: string,
    targetId: string,
    relationshipType: RelationshipType,
    metadata: Record<string, unknown> = {}
  ): ArtifactRelationship {
    // Validate artifacts exist
    if (!this.artifacts.has(sourceId)) {
      throw new Error(`Source artifact ${sourceId} not found`);
    }
    if (!this.artifacts.has(targetId)) {
      throw new Error(`Target artifact ${targetId} not found`);
    }

    // Check for existing relationship
    const existing = this.relationships.find(
      (r) =>
        r.sourceId === sourceId &&
        r.targetId === targetId &&
        r.relationshipType === relationshipType
    );

    if (existing) {
      // Update existing relationship
      existing.metadata = { ...existing.metadata, ...metadata };
      return existing;
    }

    // Create new relationship
    const relationship: ArtifactRelationship = {
      id: crypto.randomUUID(),
      sourceId,
      targetId,
      relationshipType,
      createdAt: new Date(),
      metadata,
    };

    this.relationships.push(relationship);

    this.emitEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'linked',
      artifactId: targetId,
      details: { sourceId, relationshipType },
    });

    return relationship;
  }

  /**
   * Remove a relationship between artifacts
   */
  public removeRelationship(sourceId: string, targetId: string): void {
    const initialLength = this.relationships.length;
    this.relationships = this.relationships.filter(
      (r) => !(r.sourceId === sourceId && r.targetId === targetId)
    );

    if (this.relationships.length < initialLength) {
      this.emitEvent({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        eventType: 'unlinked',
        artifactId: targetId,
        details: { sourceId },
      });
    }
  }

  // ==========================================================================
  // Lineage Queries
  // ==========================================================================

  /**
   * Get the complete lineage graph
   */
  public getLineageGraph(): LineageGraph {
    // Find root artifacts (specs, constitutions)
    const rootTypes: ArtifactType[] = ['specification', 'constitution'];
    const rootArtifacts: string[] = [];

    for (const [id, artifact] of this.artifacts) {
      if (rootTypes.includes(artifact.type)) {
        rootArtifacts.push(id);
      }
    }

    // Also include artifacts with no incoming relationships
    for (const [id] of this.artifacts) {
      const hasIncoming = this.relationships.some((r) => r.targetId === id);
      if (!hasIncoming && !rootArtifacts.includes(id)) {
        rootArtifacts.push(id);
      }
    }

    return {
      artifacts: new Map(this.artifacts),
      relationships: [...this.relationships],
      rootArtifacts,
    };
  }

  /**
   * Get lineage for a specific artifact
   */
  public getLineage(artifactId: string, depth: number = this.config.maxQueryDepth): LineageNode | null {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) return null;

    return this.buildLineageNode(artifactId, depth, new Set());
  }

  /**
   * Query lineage with filters
   */
  public queryLineage(query: LineageQuery): Artifact[] {
    let results: Artifact[] = [];

    if (query.artifactId) {
      const artifact = this.artifacts.get(query.artifactId);
      if (artifact) results.push(artifact);
    } else if (query.artifactType) {
      results = this.getArtifactsByType(query.artifactType);
    } else {
      results = Array.from(this.artifacts.values());
    }

    // Filter by relationship type if specified
    if (query.relationshipType) {
      const relatedIds = new Set(
        this.relationships
          .filter((r) => r.relationshipType === query.relationshipType)
          .flatMap((r) => [r.sourceId, r.targetId])
      );
      results = results.filter((a) => relatedIds.has(a.id));
    }

    // Include orphans if requested
    if (query.includeOrphans) {
      const orphans = this.detectOrphanedArtifacts();
      for (const orphan of orphans) {
        if (!results.find((r) => r.id === orphan.artifact.id)) {
          results.push(orphan.artifact);
        }
      }
    }

    return results;
  }

  /**
   * Get ancestors (parents, grandparents, etc.) of an artifact
   */
  public getAncestors(artifactId: string, depth: number = this.config.maxQueryDepth): Artifact[] {
    const ancestors: Artifact[] = [];
    const visited = new Set<string>();

    const traverse = (id: string, currentDepth: number) => {
      if (currentDepth <= 0 || visited.has(id)) return;
      visited.add(id);

      const parents = this.relationships
        .filter((r) => r.targetId === id)
        .map((r) => this.artifacts.get(r.sourceId))
        .filter((a): a is Artifact => a !== undefined);

      for (const parent of parents) {
        if (!ancestors.find((a) => a.id === parent.id)) {
          ancestors.push(parent);
          traverse(parent.id, currentDepth - 1);
        }
      }
    };

    traverse(artifactId, depth);
    return ancestors;
  }

  /**
   * Get descendants (children, grandchildren, etc.) of an artifact
   */
  public getDescendants(artifactId: string, depth: number = this.config.maxQueryDepth): Artifact[] {
    const descendants: Artifact[] = [];
    const visited = new Set<string>();

    const traverse = (id: string, currentDepth: number) => {
      if (currentDepth <= 0 || visited.has(id)) return;
      visited.add(id);

      const children = this.relationships
        .filter((r) => r.sourceId === id)
        .map((r) => this.artifacts.get(r.targetId))
        .filter((a): a is Artifact => a !== undefined);

      for (const child of children) {
        if (!descendants.find((a) => a.id === child.id)) {
          descendants.push(child);
          traverse(child.id, currentDepth - 1);
        }
      }
    };

    traverse(artifactId, depth);
    return descendants;
  }

  // ==========================================================================
  // Impact Analysis
  // ==========================================================================

  /**
   * Get artifacts impacted by a change to the specified artifact
   */
  public getImpactedArtifacts(artifactId: string): ImpactAnalysis {
    const changedArtifact = this.artifacts.get(artifactId);
    if (!changedArtifact) {
      throw new Error(`Artifact ${artifactId} not found`);
    }

    // Get all descendants
    const impactedArtifacts = this.getDescendants(artifactId);

    // Determine impact level based on artifact type and relationship depth
    const impactLevel = this.calculateImpactLevel(changedArtifact, impactedArtifacts);

    // Generate recommendations
    const recommendations = this.generateImpactRecommendations(
      changedArtifact,
      impactedArtifacts
    );

    return {
      changedArtifact,
      impactedArtifacts,
      impactLevel,
      recommendations,
    };
  }

  /**
   * Calculate impact level based on artifact type and affected artifacts
   */
  private calculateImpactLevel(
    changed: Artifact,
    impacted: Artifact[]
  ): 'high' | 'medium' | 'low' {
    // Specification changes are always high impact
    if (changed.type === 'specification') {
      return 'high';
    }

    // Constitution changes affect everything
    if (changed.type === 'constitution') {
      return 'high';
    }

    // If code artifacts are impacted
    const hasCodeImpact = impacted.some(
      (a) => a.type === 'code' || a.type === 'test'
    );
    if (hasCodeImpact) {
      return 'high';
    }

    // Plan changes are medium impact
    if (changed.type === 'plan') {
      return 'medium';
    }

    // Few artifacts impacted
    if (impacted.length <= 2) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * Generate recommendations based on impact analysis
   */
  private generateImpactRecommendations(
    changed: Artifact,
    impacted: Artifact[]
  ): string[] {
    const recommendations: string[] = [];

    if (changed.type === 'specification') {
      recommendations.push('Review and update plan.md to reflect specification changes');
      recommendations.push('Re-generate tasks.md from updated plan');
      recommendations.push('Review existing code for alignment with new requirements');
    }

    if (changed.type === 'plan') {
      recommendations.push('Re-generate tasks.md to reflect planning changes');
      recommendations.push('Update task assignments and dependencies');
    }

    if (changed.type === 'constitution') {
      recommendations.push('Run compliance check on all artifacts');
      recommendations.push('Review and update plans for constitutional compliance');
    }

    // Add specific recommendations for impacted artifact types
    const impactedTypes = new Set(impacted.map((a) => a.type));

    if (impactedTypes.has('code')) {
      recommendations.push('Update affected code files');
      recommendations.push('Run tests to verify changes');
    }

    if (impactedTypes.has('test')) {
      recommendations.push('Update test cases to match new requirements');
      recommendations.push('Run full test suite');
    }

    if (impactedTypes.has('documentation')) {
      recommendations.push('Update documentation to reflect changes');
    }

    return recommendations;
  }

  // ==========================================================================
  // Orphan Detection
  // ==========================================================================

  /**
   * Detect orphaned artifacts (artifacts without proper lineage)
   */
  public detectOrphanedArtifacts(): OrphanedArtifact[] {
    const orphans: OrphanedArtifact[] = [];

    for (const [id, artifact] of this.artifacts) {
      const orphanInfo = this.checkIfOrphan(artifact);
      if (orphanInfo) {
        orphans.push(orphanInfo);
      }
    }

    return orphans;
  }

  /**
   * Check if an artifact is orphaned
   */
  private checkIfOrphan(artifact: Artifact): OrphanedArtifact | null {
    // Root types (specs, constitutions) are never orphans
    const rootTypes: ArtifactType[] = ['specification', 'constitution'];
    if (rootTypes.includes(artifact.type)) {
      return null;
    }

    // Check for incoming relationships
    const hasIncoming = this.relationships.some((r) => r.targetId === artifact.id);

    if (!hasIncoming) {
      return {
        artifact,
        reason: `No source artifact found. ${artifact.type} should derive from another artifact.`,
        suggestedAction: this.suggestOrphanAction(artifact),
      };
    }

    // Check for proper derivation chain
    const ancestors = this.getAncestors(artifact.id);
    const hasSpecAncestor = ancestors.some((a) => a.type === 'specification');

    if (!hasSpecAncestor && !['specification', 'constitution'].includes(artifact.type)) {
      return {
        artifact,
        reason: 'No specification in lineage chain',
        suggestedAction: 'Link this artifact to its source specification',
      };
    }

    return null;
  }

  /**
   * Suggest action for orphaned artifact
   */
  private suggestOrphanAction(artifact: Artifact): string {
    switch (artifact.type) {
      case 'plan':
        return 'Link plan to a specification using recordDerivation()';
      case 'task-list':
        return 'Link task list to a plan using recordDerivation()';
      case 'code':
        return 'Link code to a task or specification using recordDerivation()';
      case 'test':
        return 'Link test to the code it tests using recordDerivation()';
      case 'documentation':
        return 'Link documentation to its source artifact';
      default:
        return 'Identify and link to the source artifact';
    }
  }

  // ==========================================================================
  // Visualization
  // ==========================================================================

  /**
   * Generate a text-based dependency tree visualization
   */
  public visualizeDependencyTree(rootId?: string): string {
    const lines: string[] = [];
    const graph = this.getLineageGraph();

    const roots = rootId ? [rootId] : graph.rootArtifacts;
    const visited = new Set<string>();

    const renderNode = (id: string, indent: string, isLast: boolean) => {
      if (visited.has(id)) {
        const artifact = this.artifacts.get(id);
        if (artifact) {
          lines.push(`${indent}${isLast ? '\\-- ' : '+-- '}[${artifact.type}] ${artifact.name} (circular ref)`);
        }
        return;
      }
      visited.add(id);

      const artifact = this.artifacts.get(id);
      if (!artifact) return;

      const prefix = isLast ? '\\-- ' : '+-- ';
      const typeIcon = this.getTypeIcon(artifact.type);
      lines.push(`${indent}${prefix}${typeIcon} [${artifact.type}] ${artifact.name}`);

      // Get children
      const children = this.relationships
        .filter((r) => r.sourceId === id)
        .map((r) => r.targetId);

      const nextIndent = indent + (isLast ? '    ' : '|   ');
      for (let i = 0; i < children.length; i++) {
        renderNode(children[i], nextIndent, i === children.length - 1);
      }
    };

    for (let i = 0; i < roots.length; i++) {
      renderNode(roots[i], '', i === roots.length - 1);
    }

    return lines.join('\n');
  }

  /**
   * Generate a Mermaid diagram of the lineage
   */
  public toMermaidDiagram(): string {
    const lines: string[] = ['graph TD'];

    // Add nodes
    for (const [id, artifact] of this.artifacts) {
      const label = `${artifact.name}\\n[${artifact.type}]`;
      const shape = this.getMermaidShape(artifact.type);
      lines.push(`    ${this.sanitizeId(id)}${shape[0]}"${label}"${shape[1]}`);
    }

    // Add edges
    for (const rel of this.relationships) {
      const arrow = this.getMermaidArrow(rel.relationshipType);
      lines.push(`    ${this.sanitizeId(rel.sourceId)} ${arrow} ${this.sanitizeId(rel.targetId)}`);
    }

    return lines.join('\n');
  }

  /**
   * Get icon for artifact type
   */
  private getTypeIcon(type: ArtifactType): string {
    const icons: Record<ArtifactType, string> = {
      specification: 'S',
      plan: 'P',
      research: 'R',
      'data-model': 'D',
      contract: 'C',
      'task-list': 'T',
      constitution: 'N',
      code: '<>',
      test: 'U',
      documentation: 'D',
    };
    return icons[type] || '?';
  }

  /**
   * Get Mermaid shape for artifact type
   */
  private getMermaidShape(type: ArtifactType): [string, string] {
    switch (type) {
      case 'specification':
        return ['([', '])'];
      case 'constitution':
        return ['[[', ']]'];
      case 'plan':
        return ['[/', '/]'];
      case 'code':
        return ['{{', '}}'];
      case 'test':
        return ['[/', '\\]'];
      default:
        return ['[', ']'];
    }
  }

  /**
   * Get Mermaid arrow for relationship type
   */
  private getMermaidArrow(type: RelationshipType): string {
    switch (type) {
      case 'derives-from':
        return '-->';
      case 'implements':
        return '==>';
      case 'tests':
        return '-.->|tests|';
      case 'references':
        return '-->|ref|';
      case 'supersedes':
        return '-->|supersedes|';
      case 'depends-on':
        return '-.->|depends|';
      default:
        return '-->';
    }
  }

  /**
   * Sanitize ID for Mermaid
   */
  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9]/g, '_');
  }

  // ==========================================================================
  // Event Handling
  // ==========================================================================

  /**
   * Subscribe to lineage events
   */
  public subscribe(handler: EventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) {
        this.eventHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Emit an event to all handlers
   */
  private emitEvent(event: ArtifactEvent): void {
    if (!this.config.enableEvents) return;

    for (const handler of this.eventHandlers) {
      try {
        handler({
          type: `artifact:${event.eventType}` as any,
          payload: event as any,
        });
      } catch (error) {
        console.error('Event handler error:', error);
      }
    }
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * Build a lineage node recursively
   */
  private buildLineageNode(
    artifactId: string,
    depth: number,
    visited: Set<string>
  ): LineageNode | null {
    if (depth <= 0 || visited.has(artifactId)) return null;
    visited.add(artifactId);

    const artifact = this.artifacts.get(artifactId);
    if (!artifact) return null;

    // Get parents
    const parentIds = this.relationships
      .filter((r) => r.targetId === artifactId)
      .map((r) => r.sourceId);

    const parents: LineageNode[] = [];
    for (const parentId of parentIds) {
      const parentNode = this.buildLineageNode(parentId, depth - 1, new Set(visited));
      if (parentNode) {
        parents.push(parentNode);
      }
    }

    // Get children
    const childIds = this.relationships
      .filter((r) => r.sourceId === artifactId)
      .map((r) => r.targetId);

    const children: LineageNode[] = [];
    for (const childId of childIds) {
      const childNode = this.buildLineageNode(childId, depth - 1, new Set(visited));
      if (childNode) {
        children.push(childNode);
      }
    }

    return {
      artifact,
      parents,
      children,
      depth: this.config.maxQueryDepth - depth,
    };
  }

  // ==========================================================================
  // Serialization
  // ==========================================================================

  /**
   * Export the lineage graph to JSON
   */
  public toJSON(): string {
    return JSON.stringify({
      artifacts: Array.from(this.artifacts.entries()),
      relationships: this.relationships,
    });
  }

  /**
   * Import a lineage graph from JSON
   */
  public fromJSON(json: string): void {
    const data = JSON.parse(json);
    this.artifacts = new Map(data.artifacts);
    this.relationships = data.relationships;
  }

  /**
   * Get statistics about the lineage graph
   */
  public getStats(): {
    totalArtifacts: number;
    totalRelationships: number;
    artifactsByType: Record<ArtifactType, number>;
    orphanCount: number;
    maxDepth: number;
  } {
    const artifactsByType: Partial<Record<ArtifactType, number>> = {};

    for (const artifact of this.artifacts.values()) {
      artifactsByType[artifact.type] = (artifactsByType[artifact.type] || 0) + 1;
    }

    const orphans = this.detectOrphanedArtifacts();

    // Calculate max depth
    let maxDepth = 0;
    const graph = this.getLineageGraph();
    for (const rootId of graph.rootArtifacts) {
      const descendants = this.getDescendants(rootId);
      const depth = this.calculateDepth(rootId, new Set());
      if (depth > maxDepth) maxDepth = depth;
    }

    return {
      totalArtifacts: this.artifacts.size,
      totalRelationships: this.relationships.length,
      artifactsByType: artifactsByType as Record<ArtifactType, number>,
      orphanCount: orphans.length,
      maxDepth,
    };
  }

  /**
   * Calculate depth of a lineage chain
   */
  private calculateDepth(artifactId: string, visited: Set<string>): number {
    if (visited.has(artifactId)) return 0;
    visited.add(artifactId);

    const children = this.relationships
      .filter((r) => r.sourceId === artifactId)
      .map((r) => r.targetId);

    if (children.length === 0) return 1;

    let maxChildDepth = 0;
    for (const childId of children) {
      const childDepth = this.calculateDepth(childId, new Set(visited));
      if (childDepth > maxChildDepth) maxChildDepth = childDepth;
    }

    return 1 + maxChildDepth;
  }
}

export default ArtifactLineageTracker;
