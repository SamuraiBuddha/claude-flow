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
import { Artifact, ArtifactType, ArtifactRelationship, RelationshipType, LineageGraph, LineageNode, LineageQuery, ImpactAnalysis, OrphanedArtifact, EventHandler } from './types.js';
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
export declare class ArtifactLineageTracker {
    private artifacts;
    private relationships;
    private eventHandlers;
    private config;
    constructor(config?: LineageTrackerConfig);
    /**
     * Register a new artifact
     */
    registerArtifact(artifact: Artifact): void;
    /**
     * Update an existing artifact
     */
    updateArtifact(artifact: Artifact): void;
    /**
     * Remove an artifact and its relationships
     */
    removeArtifact(artifactId: string): void;
    /**
     * Get an artifact by ID
     */
    getArtifact(artifactId: string): Artifact | undefined;
    /**
     * Get all artifacts of a specific type
     */
    getArtifactsByType(type: ArtifactType): Artifact[];
    /**
     * Record a derivation relationship between artifacts
     *
     * @param sourceId - The source artifact ID (e.g., spec)
     * @param targetId - The derived artifact ID (e.g., plan derived from spec)
     * @param relationshipType - Type of relationship
     * @param metadata - Additional metadata about the derivation
     */
    recordDerivation(sourceId: string, targetId: string, relationshipType: RelationshipType, metadata?: Record<string, unknown>): ArtifactRelationship;
    /**
     * Remove a relationship between artifacts
     */
    removeRelationship(sourceId: string, targetId: string): void;
    /**
     * Get the complete lineage graph
     */
    getLineageGraph(): LineageGraph;
    /**
     * Get lineage for a specific artifact
     */
    getLineage(artifactId: string, depth?: number): LineageNode | null;
    /**
     * Query lineage with filters
     */
    queryLineage(query: LineageQuery): Artifact[];
    /**
     * Get ancestors (parents, grandparents, etc.) of an artifact
     */
    getAncestors(artifactId: string, depth?: number): Artifact[];
    /**
     * Get descendants (children, grandchildren, etc.) of an artifact
     */
    getDescendants(artifactId: string, depth?: number): Artifact[];
    /**
     * Get artifacts impacted by a change to the specified artifact
     */
    getImpactedArtifacts(artifactId: string): ImpactAnalysis;
    /**
     * Calculate impact level based on artifact type and affected artifacts
     */
    private calculateImpactLevel;
    /**
     * Generate recommendations based on impact analysis
     */
    private generateImpactRecommendations;
    /**
     * Detect orphaned artifacts (artifacts without proper lineage)
     */
    detectOrphanedArtifacts(): OrphanedArtifact[];
    /**
     * Check if an artifact is orphaned
     */
    private checkIfOrphan;
    /**
     * Suggest action for orphaned artifact
     */
    private suggestOrphanAction;
    /**
     * Generate a text-based dependency tree visualization
     */
    visualizeDependencyTree(rootId?: string): string;
    /**
     * Generate a Mermaid diagram of the lineage
     */
    toMermaidDiagram(): string;
    /**
     * Get icon for artifact type
     */
    private getTypeIcon;
    /**
     * Get Mermaid shape for artifact type
     */
    private getMermaidShape;
    /**
     * Get Mermaid arrow for relationship type
     */
    private getMermaidArrow;
    /**
     * Sanitize ID for Mermaid
     */
    private sanitizeId;
    /**
     * Subscribe to lineage events
     */
    subscribe(handler: EventHandler): () => void;
    /**
     * Emit an event to all handlers
     */
    private emitEvent;
    /**
     * Build a lineage node recursively
     */
    private buildLineageNode;
    /**
     * Export the lineage graph to JSON
     */
    toJSON(): string;
    /**
     * Import a lineage graph from JSON
     */
    fromJSON(json: string): void;
    /**
     * Get statistics about the lineage graph
     */
    getStats(): {
        totalArtifacts: number;
        totalRelationships: number;
        artifactsByType: Record<ArtifactType, number>;
        orphanCount: number;
        maxDepth: number;
    };
    /**
     * Calculate depth of a lineage chain
     */
    private calculateDepth;
}
export default ArtifactLineageTracker;
//# sourceMappingURL=artifact-lineage.d.ts.map