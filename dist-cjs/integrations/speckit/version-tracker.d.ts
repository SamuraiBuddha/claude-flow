/**
 * SpecVersionTracker - Track specification versions and detect cascade changes
 *
 * This module provides semantic versioning for specifications and detects
 * which downstream artifacts (plans, tasks) need regeneration when specs change.
 */
import type { ILogger } from '../../core/logger.js';
export interface VersionInfo {
    versionId: string;
    specId: string;
    versionNumber: string;
    versionType: 'major' | 'minor' | 'patch';
    changeSummary: string;
    changedSections: string[];
    breakingChanges: boolean;
    createdAt: Date;
    createdByAgent: string;
}
export interface VersionDiff {
    oldVersion: string;
    newVersion: string;
    addedSections: string[];
    removedSections: string[];
    modifiedSections: string[];
    userStoriesAdded: string[];
    userStoriesRemoved: string[];
    userStoriesModified: string[];
    requirementsAdded: string[];
    requirementsRemoved: string[];
    requirementsModified: string[];
    isBreaking: boolean;
    summary: string;
}
export interface CascadeResult {
    specId: string;
    fromVersion: string;
    toVersion: string;
    affectedPlans: Array<{
        planId: string;
        status: string;
        reason: string;
    }>;
    affectedTasks: Array<{
        taskId: string;
        planId: string;
        status: string;
        reason: string;
    }>;
    totalAffected: number;
    recommendations: string[];
}
export interface SpecSnapshot {
    specId: string;
    version: string;
    featureName: string;
    userStories: any[];
    requirements: any;
    successCriteria: any[];
    edgeCases: string[];
    contentHash: string;
    timestamp: Date;
}
export declare class SpecVersionTracker {
    private db;
    private dbPath;
    private logger;
    private initialized;
    private statements;
    constructor(dbPath: string, logger: ILogger);
    initialize(): Promise<void>;
    private prepareStatements;
    shutdown(): Promise<void>;
    /**
     * Parse a semantic version string
     */
    private parseVersion;
    /**
     * Format version components into a string
     */
    private formatVersion;
    /**
     * Get the latest version number for a specification
     */
    getLatestVersion(specId: string): Promise<string>;
    /**
     * Calculate the next version number based on change type
     */
    calculateNextVersion(specId: string, changeType: 'major' | 'minor' | 'patch'): Promise<string>;
    /**
     * Determine what type of version bump is needed based on changes
     */
    determineVersionType(diff: VersionDiff): 'major' | 'minor' | 'patch';
    /**
     * Create a snapshot of a specification for comparison
     */
    createSnapshot(specId: string): Promise<SpecSnapshot | null>;
    /**
     * Generate a diff between two spec snapshots
     */
    generateDiff(oldSnapshot: SpecSnapshot, newSnapshot: SpecSnapshot): VersionDiff;
    private extractSections;
    /**
     * Record a new version of a specification
     */
    recordVersion(specId: string, changeSummary: string, createdByAgent: string, options?: {
        forceVersionType?: 'major' | 'minor' | 'patch';
        previousSnapshot?: SpecSnapshot;
    }): Promise<VersionInfo>;
    private getLatestVersionId;
    /**
     * Detect what downstream artifacts need regeneration when a spec changes
     */
    detectCascade(specId: string, diff?: VersionDiff | null): Promise<CascadeResult>;
    /**
     * Get version history for a specification
     */
    getVersionHistory(specId: string, limit?: number): Promise<VersionInfo[]>;
    /**
     * Get a specific version
     */
    getVersion(specId: string, versionNumber: string): Promise<VersionInfo | null>;
    /**
     * Compare two versions
     */
    compareVersions(specId: string, version1: string, version2: string): Promise<VersionDiff | null>;
    /**
     * Get all stale artifacts that need regeneration
     */
    getStaleArtifacts(specId: string): Promise<Array<{
        type: string;
        id: string;
        reason: string;
    }>>;
}
export default SpecVersionTracker;
//# sourceMappingURL=version-tracker.d.ts.map