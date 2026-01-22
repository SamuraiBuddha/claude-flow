"use strict";
/**
 * SpecVersionTracker - Track specification versions and detect cascade changes
 *
 * This module provides semantic versioning for specifications and detects
 * which downstream artifacts (plans, tasks) need regeneration when specs change.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecVersionTracker = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
// Dynamic import for better-sqlite3
let Database;
// ============================================================================
// VERSION TRACKER CLASS
// ============================================================================
class SpecVersionTracker {
    db;
    dbPath;
    logger;
    initialized = false;
    statements = new Map();
    constructor(dbPath, logger) {
        this.dbPath = dbPath;
        this.logger = logger;
    }
    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================
    async initialize() {
        if (this.initialized) {
            return;
        }
        this.logger.info('Initializing SpecVersionTracker', { dbPath: this.dbPath });
        try {
            // Dynamically import better-sqlite3
            const module = await Promise.resolve().then(() => __importStar(require('better-sqlite3')));
            Database = module.default;
            // Ensure directory exists
            const dir = path_1.default.dirname(this.dbPath);
            await fs_1.promises.mkdir(dir, { recursive: true });
            // Open database
            this.db = new Database(this.dbPath);
            // Enable pragmas
            this.db.pragma('foreign_keys = ON');
            // Prepare statements
            this.prepareStatements();
            this.initialized = true;
            this.logger.info('SpecVersionTracker initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize SpecVersionTracker', error);
            throw error;
        }
    }
    prepareStatements() {
        // Version queries
        this.statements.set('getLatestVersion', this.db.prepare(`
        SELECT version_number FROM spec_versions
        WHERE spec_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `));
        this.statements.set('getVersionHistory', this.db.prepare(`
        SELECT * FROM spec_versions
        WHERE spec_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `));
        this.statements.set('getVersion', this.db.prepare(`
        SELECT * FROM spec_versions
        WHERE spec_id = ? AND version_number = ?
      `));
        this.statements.set('insertVersion', this.db.prepare(`
        INSERT INTO spec_versions (
          version_id, spec_id, version_number, version_type, change_summary,
          changed_sections, diff_from_previous, breaking_changes, affected_downstream,
          created_by_agent, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `));
        // Spec snapshot queries
        this.statements.set('getSpec', this.db.prepare(`SELECT * FROM specifications WHERE spec_id = ?`));
        this.statements.set('updateSpecVersion', this.db.prepare(`
        UPDATE specifications
        SET version = ?, parent_version_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE spec_id = ?
      `));
        // Cascade queries
        this.statements.set('getPlansForSpec', this.db.prepare(`
        SELECT plan_id, status FROM implementation_plans
        WHERE spec_id = ?
      `));
        this.statements.set('getTasksForPlan', this.db.prepare(`
        SELECT task_id, story_id, status FROM task_registry
        WHERE plan_id = ?
      `));
        this.statements.set('getStaleArtifacts', this.db.prepare(`
        SELECT * FROM artifact_lineage
        WHERE source_artifact_id = ? AND validation_status = 'stale'
      `));
        this.statements.set('markArtifactStale', this.db.prepare(`
        UPDATE artifact_lineage
        SET validation_status = 'stale', invalidated_at = CURRENT_TIMESTAMP, invalidation_reason = ?
        WHERE artifact_id = ?
      `));
    }
    async shutdown() {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.initialized = false;
        }
    }
    // ==========================================================================
    // VERSION MANAGEMENT
    // ==========================================================================
    /**
     * Parse a semantic version string
     */
    parseVersion(version) {
        const parts = version.split('.').map(Number);
        return {
            major: parts[0] || 1,
            minor: parts[1] || 0,
            patch: parts[2] || 0,
        };
    }
    /**
     * Format version components into a string
     */
    formatVersion(major, minor, patch) {
        return `${major}.${minor}.${patch}`;
    }
    /**
     * Get the latest version number for a specification
     */
    async getLatestVersion(specId) {
        await this.initialize();
        const row = this.statements.get('getLatestVersion').get(specId);
        if (row) {
            return row.version_number;
        }
        // Check the spec itself
        const spec = this.statements.get('getSpec').get(specId);
        return spec?.version || '1.0.0';
    }
    /**
     * Calculate the next version number based on change type
     */
    async calculateNextVersion(specId, changeType) {
        const currentVersion = await this.getLatestVersion(specId);
        const { major, minor, patch } = this.parseVersion(currentVersion);
        switch (changeType) {
            case 'major':
                return this.formatVersion(major + 1, 0, 0);
            case 'minor':
                return this.formatVersion(major, minor + 1, 0);
            case 'patch':
                return this.formatVersion(major, minor, patch + 1);
        }
    }
    /**
     * Determine what type of version bump is needed based on changes
     */
    determineVersionType(diff) {
        // Breaking changes = major version
        if (diff.isBreaking) {
            return 'major';
        }
        // New user stories or significant requirement changes = minor
        if (diff.userStoriesAdded.length > 0 ||
            diff.requirementsAdded.length > 2 ||
            diff.addedSections.length > 0 ||
            diff.removedSections.length > 0) {
            return 'minor';
        }
        // Small modifications = patch
        return 'patch';
    }
    // ==========================================================================
    // DIFF GENERATION
    // ==========================================================================
    /**
     * Create a snapshot of a specification for comparison
     */
    async createSnapshot(specId) {
        await this.initialize();
        const row = this.statements.get('getSpec').get(specId);
        if (!row)
            return null;
        const content = JSON.stringify({
            userStories: row.user_stories,
            requirements: row.requirements,
            successCriteria: row.success_criteria,
            edgeCases: row.edge_cases,
        });
        return {
            specId: row.spec_id,
            version: row.version,
            featureName: row.feature_name,
            userStories: JSON.parse(row.user_stories || '[]'),
            requirements: JSON.parse(row.requirements || '{}'),
            successCriteria: JSON.parse(row.success_criteria || '[]'),
            edgeCases: JSON.parse(row.edge_cases || '[]'),
            contentHash: crypto_1.default.createHash('sha256').update(content).digest('hex'),
            timestamp: new Date(row.updated_at),
        };
    }
    /**
     * Generate a diff between two spec snapshots
     */
    generateDiff(oldSnapshot, newSnapshot) {
        const diff = {
            oldVersion: oldSnapshot.version,
            newVersion: newSnapshot.version,
            addedSections: [],
            removedSections: [],
            modifiedSections: [],
            userStoriesAdded: [],
            userStoriesRemoved: [],
            userStoriesModified: [],
            requirementsAdded: [],
            requirementsRemoved: [],
            requirementsModified: [],
            isBreaking: false,
            summary: '',
        };
        // Compare user stories
        const oldStoryIds = new Set(oldSnapshot.userStories.map((s) => s.storyId || s.title));
        const newStoryIds = new Set(newSnapshot.userStories.map((s) => s.storyId || s.title));
        for (const story of newSnapshot.userStories) {
            const id = story.storyId || story.title;
            if (!oldStoryIds.has(id)) {
                diff.userStoriesAdded.push(id);
            }
            else {
                // Check if modified
                const oldStory = oldSnapshot.userStories.find((s) => (s.storyId || s.title) === id);
                if (oldStory && JSON.stringify(oldStory) !== JSON.stringify(story)) {
                    diff.userStoriesModified.push(id);
                }
            }
        }
        for (const story of oldSnapshot.userStories) {
            const id = story.storyId || story.title;
            if (!newStoryIds.has(id)) {
                diff.userStoriesRemoved.push(id);
                diff.isBreaking = true; // Removing user stories is breaking
            }
        }
        // Compare requirements
        const oldReqs = new Set((oldSnapshot.requirements.functional || []).map((r) => r.id));
        const newReqs = new Set((newSnapshot.requirements.functional || []).map((r) => r.id));
        for (const req of newSnapshot.requirements.functional || []) {
            if (!oldReqs.has(req.id)) {
                diff.requirementsAdded.push(req.id);
            }
            else {
                const oldReq = (oldSnapshot.requirements.functional || []).find((r) => r.id === req.id);
                if (oldReq && JSON.stringify(oldReq) !== JSON.stringify(req)) {
                    diff.requirementsModified.push(req.id);
                }
            }
        }
        for (const req of oldSnapshot.requirements.functional || []) {
            if (!newReqs.has(req.id)) {
                diff.requirementsRemoved.push(req.id);
                diff.isBreaking = true; // Removing requirements is breaking
            }
        }
        // Check for section-level changes
        const oldSections = this.extractSections(oldSnapshot);
        const newSections = this.extractSections(newSnapshot);
        for (const section of newSections) {
            if (!oldSections.includes(section)) {
                diff.addedSections.push(section);
            }
        }
        for (const section of oldSections) {
            if (!newSections.includes(section)) {
                diff.removedSections.push(section);
            }
        }
        // Generate summary
        const summaryParts = [];
        if (diff.userStoriesAdded.length > 0) {
            summaryParts.push(`Added ${diff.userStoriesAdded.length} user story(ies)`);
        }
        if (diff.userStoriesRemoved.length > 0) {
            summaryParts.push(`Removed ${diff.userStoriesRemoved.length} user story(ies)`);
        }
        if (diff.userStoriesModified.length > 0) {
            summaryParts.push(`Modified ${diff.userStoriesModified.length} user story(ies)`);
        }
        if (diff.requirementsAdded.length > 0) {
            summaryParts.push(`Added ${diff.requirementsAdded.length} requirement(s)`);
        }
        if (diff.requirementsRemoved.length > 0) {
            summaryParts.push(`Removed ${diff.requirementsRemoved.length} requirement(s)`);
        }
        if (diff.requirementsModified.length > 0) {
            summaryParts.push(`Modified ${diff.requirementsModified.length} requirement(s)`);
        }
        diff.summary = summaryParts.join('; ') || 'No significant changes';
        return diff;
    }
    extractSections(snapshot) {
        const sections = [];
        if (snapshot.userStories.length > 0)
            sections.push('user_stories');
        if (snapshot.requirements.functional?.length > 0 ||
            snapshot.requirements.entities?.length > 0) {
            sections.push('requirements');
        }
        if (snapshot.successCriteria.length > 0)
            sections.push('success_criteria');
        if (snapshot.edgeCases.length > 0)
            sections.push('edge_cases');
        return sections;
    }
    // ==========================================================================
    // VERSION RECORDING
    // ==========================================================================
    /**
     * Record a new version of a specification
     */
    async recordVersion(specId, changeSummary, createdByAgent, options = {}) {
        await this.initialize();
        // Get current and previous snapshots
        const currentSnapshot = await this.createSnapshot(specId);
        if (!currentSnapshot) {
            throw new Error(`Specification not found: ${specId}`);
        }
        let diff = null;
        let versionType;
        if (options.previousSnapshot) {
            diff = this.generateDiff(options.previousSnapshot, currentSnapshot);
            versionType = options.forceVersionType || this.determineVersionType(diff);
        }
        else {
            versionType = options.forceVersionType || 'patch';
        }
        // Calculate new version
        const newVersion = await this.calculateNextVersion(specId, versionType);
        // Generate version ID
        const versionId = `ver_${Date.now().toString(36)}_${crypto_1.default.randomBytes(4).toString('hex')}`;
        // Determine affected downstream artifacts
        const affectedDownstream = await this.detectCascade(specId, diff);
        // Insert version record
        this.statements.get('insertVersion').run(versionId, specId, newVersion, versionType, changeSummary, JSON.stringify(diff?.modifiedSections || []), diff ? JSON.stringify(diff) : null, diff?.isBreaking ? 1 : 0, JSON.stringify({
            plans: affectedDownstream.affectedPlans.map((p) => p.planId),
            tasks: affectedDownstream.affectedTasks.map((t) => t.taskId),
        }), createdByAgent, JSON.stringify({ createdAt: new Date().toISOString() }));
        // Update spec's version
        const previousVersionId = await this.getLatestVersionId(specId);
        this.statements.get('updateSpecVersion').run(newVersion, previousVersionId, specId);
        this.logger.info('Version recorded', {
            specId,
            versionId,
            version: newVersion,
            versionType,
            breaking: diff?.isBreaking || false,
        });
        return {
            versionId,
            specId,
            versionNumber: newVersion,
            versionType,
            changeSummary,
            changedSections: diff?.modifiedSections || [],
            breakingChanges: diff?.isBreaking || false,
            createdAt: new Date(),
            createdByAgent,
        };
    }
    async getLatestVersionId(specId) {
        const row = this.db
            .prepare(`SELECT version_id FROM spec_versions WHERE spec_id = ? ORDER BY created_at DESC LIMIT 1`)
            .get(specId);
        return row?.version_id || null;
    }
    // ==========================================================================
    // CASCADE DETECTION
    // ==========================================================================
    /**
     * Detect what downstream artifacts need regeneration when a spec changes
     */
    async detectCascade(specId, diff) {
        await this.initialize();
        const result = {
            specId,
            fromVersion: diff?.oldVersion || 'unknown',
            toVersion: diff?.newVersion || 'unknown',
            affectedPlans: [],
            affectedTasks: [],
            totalAffected: 0,
            recommendations: [],
        };
        // Get all plans for this spec
        const plans = this.statements.get('getPlansForSpec').all(specId);
        for (const plan of plans) {
            let affectReason = 'Spec was updated';
            // Determine if plan is affected based on diff
            if (diff) {
                if (diff.isBreaking) {
                    affectReason = 'Breaking changes in specification';
                }
                else if (diff.userStoriesAdded.length > 0 || diff.userStoriesRemoved.length > 0) {
                    affectReason = 'User stories changed';
                }
                else if (diff.requirementsAdded.length > 0 || diff.requirementsRemoved.length > 0) {
                    affectReason = 'Requirements changed';
                }
            }
            result.affectedPlans.push({
                planId: plan.plan_id,
                status: plan.status,
                reason: affectReason,
            });
            // Mark plan lineage as stale
            this.statements.get('markArtifactStale').run(affectReason, plan.plan_id);
            // Get tasks for this plan
            const tasks = this.statements.get('getTasksForPlan').all(plan.plan_id);
            for (const task of tasks) {
                let taskAffectReason = 'Parent plan needs regeneration';
                // Check if this task's story was modified
                if (diff && task.story_id) {
                    const storyId = task.story_id.split('_').pop(); // Extract US1, US2, etc.
                    if (diff.userStoriesModified.includes(storyId)) {
                        taskAffectReason = `User story ${storyId} was modified`;
                    }
                    else if (diff.userStoriesRemoved.includes(storyId)) {
                        taskAffectReason = `User story ${storyId} was removed`;
                    }
                }
                result.affectedTasks.push({
                    taskId: task.task_id,
                    planId: plan.plan_id,
                    status: task.status,
                    reason: taskAffectReason,
                });
                // Mark task lineage as stale
                this.statements.get('markArtifactStale').run(taskAffectReason, task.task_id);
            }
        }
        result.totalAffected = result.affectedPlans.length + result.affectedTasks.length;
        // Generate recommendations
        if (result.totalAffected > 0) {
            result.recommendations.push('Run /speckit.plan to regenerate implementation plan(s)');
            if (result.affectedTasks.length > 0) {
                result.recommendations.push('Run /speckit.tasks to regenerate task list(s)');
            }
            if (diff?.isBreaking) {
                result.recommendations.push('Review all downstream artifacts carefully - breaking changes detected');
            }
            if (diff?.userStoriesRemoved.length) {
                result.recommendations.push(`Consider archiving tasks for removed user stories: ${diff.userStoriesRemoved.join(', ')}`);
            }
        }
        this.logger.info('Cascade detection complete', {
            specId,
            affectedPlans: result.affectedPlans.length,
            affectedTasks: result.affectedTasks.length,
        });
        return result;
    }
    // ==========================================================================
    // QUERY METHODS
    // ==========================================================================
    /**
     * Get version history for a specification
     */
    async getVersionHistory(specId, limit = 10) {
        await this.initialize();
        const rows = this.statements.get('getVersionHistory').all(specId, limit);
        return rows.map((row) => ({
            versionId: row.version_id,
            specId: row.spec_id,
            versionNumber: row.version_number,
            versionType: row.version_type,
            changeSummary: row.change_summary,
            changedSections: JSON.parse(row.changed_sections || '[]'),
            breakingChanges: row.breaking_changes === 1,
            createdAt: new Date(row.created_at),
            createdByAgent: row.created_by_agent,
        }));
    }
    /**
     * Get a specific version
     */
    async getVersion(specId, versionNumber) {
        await this.initialize();
        const row = this.statements.get('getVersion').get(specId, versionNumber);
        if (!row)
            return null;
        return {
            versionId: row.version_id,
            specId: row.spec_id,
            versionNumber: row.version_number,
            versionType: row.version_type,
            changeSummary: row.change_summary,
            changedSections: JSON.parse(row.changed_sections || '[]'),
            breakingChanges: row.breaking_changes === 1,
            createdAt: new Date(row.created_at),
            createdByAgent: row.created_by_agent,
        };
    }
    /**
     * Compare two versions
     */
    async compareVersions(specId, version1, version2) {
        await this.initialize();
        const v1Row = this.statements.get('getVersion').get(specId, version1);
        const v2Row = this.statements.get('getVersion').get(specId, version2);
        if (!v1Row || !v2Row) {
            return null;
        }
        // If we have stored diffs, we can try to reconstruct
        // For now, return the diff from the newer version
        const diff = v2Row.diff_from_previous
            ? JSON.parse(v2Row.diff_from_previous)
            : null;
        return diff;
    }
    /**
     * Get all stale artifacts that need regeneration
     */
    async getStaleArtifacts(specId) {
        await this.initialize();
        const rows = this.statements.get('getStaleArtifacts').all(specId);
        return rows.map((row) => ({
            type: row.artifact_type,
            id: row.artifact_id,
            reason: row.invalidation_reason || 'Source artifact was modified',
        }));
    }
}
exports.SpecVersionTracker = SpecVersionTracker;
exports.default = SpecVersionTracker;
//# sourceMappingURL=version-tracker.js.map