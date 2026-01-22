"use strict";
/**
 * SpecKitMemoryBridge - Bridge between spec-kit markdown artifacts and SQLite storage
 *
 * This class provides methods to parse spec-kit generated markdown artifacts
 * (spec.md, plan.md, tasks.md) and persist them into the SQLite database
 * with proper relationships and artifact lineage tracking.
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
exports.SpecKitMemoryBridge = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
// Dynamic import for better-sqlite3
let Database;
// ============================================================================
// MEMORY BRIDGE CLASS
// ============================================================================
class SpecKitMemoryBridge {
    db;
    config;
    logger;
    initialized = false;
    statements = new Map();
    constructor(config, logger) {
        this.config = {
            autoTrackLineage: true,
            ...config,
        };
        this.logger = logger;
    }
    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================
    async initialize() {
        if (this.initialized) {
            return;
        }
        this.logger.info('Initializing SpecKitMemoryBridge', { dbPath: this.config.dbPath });
        try {
            // Dynamically import better-sqlite3
            const module = await Promise.resolve().then(() => __importStar(require('better-sqlite3')));
            Database = module.default;
            // Ensure directory exists
            const dir = path_1.default.dirname(this.config.dbPath);
            await fs_1.promises.mkdir(dir, { recursive: true });
            // Open database
            this.db = new Database(this.config.dbPath);
            // Enable WAL mode and other pragmas
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('synchronous = NORMAL');
            this.db.pragma('foreign_keys = ON');
            this.db.pragma('cache_size = 1000');
            this.db.pragma('temp_store = memory');
            // Read and execute schema
            const schemaPath = path_1.default.join(path_1.default.dirname(new URL(import.meta.url).pathname), 'schema.sql');
            const schema = await fs_1.promises.readFile(schemaPath, 'utf-8');
            this.db.exec(schema);
            // Prepare statements
            this.prepareStatements();
            this.initialized = true;
            this.logger.info('SpecKitMemoryBridge initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize SpecKitMemoryBridge', error);
            throw error;
        }
    }
    prepareStatements() {
        // Specification statements
        this.statements.set('insertSpec', this.db.prepare(`
        INSERT OR REPLACE INTO specifications (
          spec_id, feature_name, feature_branch, user_stories, requirements,
          acceptance_criteria, success_criteria, edge_cases, status,
          created_by_agent, version, spec_source_path, raw_markdown, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `));
        this.statements.set('getSpec', this.db.prepare(`SELECT * FROM specifications WHERE spec_id = ?`));
        this.statements.set('getSpecByFeature', this.db.prepare(`SELECT * FROM specifications WHERE feature_name = ? ORDER BY created_at DESC LIMIT 1`));
        // Implementation plan statements
        this.statements.set('insertPlan', this.db.prepare(`
        INSERT OR REPLACE INTO implementation_plans (
          plan_id, spec_id, tech_stack, architecture_decisions, research_findings,
          constitution_gates, data_models, contracts, project_structure,
          complexity_tracking, quickstart_scenarios, generated_by, status,
          plan_source_path, raw_markdown, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `));
        this.statements.set('getPlan', this.db.prepare(`SELECT * FROM implementation_plans WHERE plan_id = ?`));
        this.statements.set('getPlansBySpec', this.db.prepare(`SELECT * FROM implementation_plans WHERE spec_id = ? ORDER BY created_at DESC`));
        // Task registry statements
        this.statements.set('insertTask', this.db.prepare(`
        INSERT OR REPLACE INTO task_registry (
          task_id, plan_id, story_id, phase, description, dependencies,
          parallelizable, file_paths, assigned_agent, status, test_scenarios,
          priority, estimated_effort, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `));
        this.statements.set('getTask', this.db.prepare(`SELECT * FROM task_registry WHERE task_id = ?`));
        this.statements.set('getTasksByPlan', this.db.prepare(`SELECT * FROM task_registry WHERE plan_id = ? ORDER BY priority DESC, task_id`));
        this.statements.set('updateTaskStatus', this.db.prepare(`UPDATE task_registry SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE task_id = ?`));
        // Artifact lineage statements
        this.statements.set('insertLineage', this.db.prepare(`
        INSERT OR REPLACE INTO artifact_lineage (
          id, artifact_type, artifact_id, source_artifact_id, source_artifact_type,
          derived_artifacts, generating_agent, validation_status, file_path, content_hash, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `));
        this.statements.set('getLineage', this.db.prepare(`SELECT * FROM artifact_lineage WHERE artifact_id = ?`));
        this.statements.set('updateLineageStatus', this.db.prepare(`
        UPDATE artifact_lineage
        SET validation_status = ?, invalidated_at = CURRENT_TIMESTAMP, invalidation_reason = ?
        WHERE artifact_id = ?
      `));
        this.statements.set('getDerivedArtifacts', this.db.prepare(`SELECT * FROM artifact_lineage WHERE source_artifact_id = ?`));
        // Constitutional compliance statements
        this.statements.set('insertCompliance', this.db.prepare(`
        INSERT OR REPLACE INTO constitutional_compliance (
          id, gate_name, status, artifact_id, artifact_type, check_details,
          reason_for_exception, exception_justification, simpler_alternative_rejected,
          approved_by_agent, approved_at, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `));
        // User stories statements
        this.statements.set('insertUserStory', this.db.prepare(`
        INSERT OR REPLACE INTO user_stories (
          story_id, spec_id, title, priority, description, why_priority,
          independent_test, acceptance_scenarios, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `));
        this.statements.set('getStoriesBySpec', this.db.prepare(`SELECT * FROM user_stories WHERE spec_id = ? ORDER BY priority`));
        // Spec versions statements
        this.statements.set('insertVersion', this.db.prepare(`
        INSERT INTO spec_versions (
          version_id, spec_id, version_number, version_type, change_summary,
          changed_sections, diff_from_previous, breaking_changes, affected_downstream,
          created_by_agent, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `));
        this.statements.set('getVersionsBySpec', this.db.prepare(`SELECT * FROM spec_versions WHERE spec_id = ? ORDER BY created_at DESC`));
    }
    async shutdown() {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.initialized = false;
            this.logger.info('SpecKitMemoryBridge shutdown complete');
        }
    }
    // ==========================================================================
    // MARKDOWN PARSING
    // ==========================================================================
    /**
     * Parse a spec.md file into structured data
     */
    parseSpecMarkdown(markdown, sourcePath) {
        const lines = markdown.split('\n');
        const spec = {
            specId: this.generateId('spec'),
            featureName: '',
            featureBranch: '',
            userStories: [],
            requirements: { functional: [], entities: [] },
            acceptanceCriteria: [],
            successCriteria: [],
            edgeCases: [],
            status: 'draft',
            rawMarkdown: markdown,
        };
        // Extract feature name from title
        const titleMatch = markdown.match(/^#\s+Feature Specification:\s*(.+)$/m);
        if (titleMatch) {
            spec.featureName = titleMatch[1].trim();
        }
        // Extract feature branch
        const branchMatch = markdown.match(/\*\*Feature Branch\*\*:\s*`([^`]+)`/);
        if (branchMatch) {
            spec.featureBranch = branchMatch[1].trim();
            // Generate spec ID from branch if available
            spec.specId = `spec_${spec.featureBranch.replace(/[^a-z0-9]/gi, '_')}`;
        }
        // Parse user stories
        spec.userStories = this.parseUserStories(markdown);
        // Parse functional requirements
        const frMatches = markdown.matchAll(/\*\*FR-(\d+)\*\*:\s*(.+)/g);
        for (const match of frMatches) {
            const requirement = match[2].trim();
            spec.requirements.functional.push({
                id: `FR-${match[1]}`,
                requirement,
                needsClarification: requirement.includes('[NEEDS CLARIFICATION'),
            });
        }
        // Parse key entities
        const entitiesSection = this.extractSection(markdown, '### Key Entities');
        if (entitiesSection) {
            const entityMatches = entitiesSection.matchAll(/\*\*\[?([^\]]+)\]?\*\*:\s*(.+)/g);
            for (const match of entityMatches) {
                spec.requirements.entities.push({
                    name: match[1].trim(),
                    description: match[2].trim(),
                });
            }
        }
        // Parse success criteria
        const scMatches = markdown.matchAll(/\*\*SC-(\d+)\*\*:\s*(.+)/g);
        for (const match of scMatches) {
            spec.successCriteria.push({
                id: `SC-${match[1]}`,
                metric: match[2].trim(),
            });
        }
        // Parse edge cases
        const edgeCasesSection = this.extractSection(markdown, '### Edge Cases');
        if (edgeCasesSection) {
            const edgeMatches = edgeCasesSection.matchAll(/^-\s+(.+)$/gm);
            for (const match of edgeMatches) {
                if (!match[1].includes('ACTION REQUIRED') && !match[1].includes('placeholder')) {
                    spec.edgeCases.push(match[1].trim());
                }
            }
        }
        return spec;
    }
    parseUserStories(markdown) {
        const stories = [];
        const storyPattern = /###\s+User Story\s+(\d+)\s*-\s*(.+?)\s*\(Priority:\s*(P\d+)\)/g;
        let match;
        while ((match = storyPattern.exec(markdown)) !== null) {
            const storyNumber = match[1];
            const storyId = `US${storyNumber}`;
            const title = match[2].trim();
            const priority = match[3];
            // Find the content until the next story or section
            const startIdx = match.index + match[0].length;
            let endIdx = markdown.length;
            const nextStoryMatch = markdown.slice(startIdx).search(/###\s+User Story\s+\d+/);
            const nextSectionMatch = markdown.slice(startIdx).search(/^##\s+/m);
            if (nextStoryMatch > -1 && (nextSectionMatch === -1 || nextStoryMatch < nextSectionMatch)) {
                endIdx = startIdx + nextStoryMatch;
            }
            else if (nextSectionMatch > -1) {
                endIdx = startIdx + nextSectionMatch;
            }
            const storyContent = markdown.slice(startIdx, endIdx);
            // Extract description (first paragraph after title)
            const descMatch = storyContent.match(/^\s*\n\s*([^*\n][^\n]+)/);
            const description = descMatch ? descMatch[1].trim() : '';
            // Extract why priority
            const whyMatch = storyContent.match(/\*\*Why this priority\*\*:\s*(.+)/);
            const whyPriority = whyMatch ? whyMatch[1].trim() : '';
            // Extract independent test
            const testMatch = storyContent.match(/\*\*Independent Test\*\*:\s*(.+)/);
            const independentTest = testMatch ? testMatch[1].trim() : '';
            // Extract acceptance scenarios
            const scenarios = [];
            const scenarioMatches = storyContent.matchAll(/\d+\.\s+\*\*Given\*\*\s+([^,]+),\s*\*\*When\*\*\s+([^,]+),\s*\*\*Then\*\*\s+(.+)/g);
            for (const scenarioMatch of scenarioMatches) {
                scenarios.push({
                    given: scenarioMatch[1].trim(),
                    when: scenarioMatch[2].trim(),
                    then: scenarioMatch[3].trim(),
                });
            }
            stories.push({
                storyId,
                title,
                priority,
                description,
                whyPriority,
                independentTest,
                acceptanceScenarios: scenarios,
            });
        }
        return stories;
    }
    /**
     * Parse a plan.md file into structured data
     */
    parsePlanMarkdown(markdown, specId, sourcePath) {
        const plan = {
            planId: this.generateId('plan'),
            specId,
            techStack: {},
            architectureDecisions: [],
            researchFindings: null,
            constitutionGates: {
                simplicityGate: { passed: false, checks: [] },
                antiAbstractionGate: { passed: false, checks: [] },
                integrationGate: { passed: false, checks: [] },
            },
            dataModels: null,
            contracts: [],
            projectStructure: null,
            complexityTracking: [],
            quickstartScenarios: [],
            rawMarkdown: markdown,
        };
        // Extract plan ID from branch in markdown
        const branchMatch = markdown.match(/\*\*Branch\*\*:\s*`([^`]+)`/);
        if (branchMatch) {
            plan.planId = `plan_${branchMatch[1].replace(/[^a-z0-9]/gi, '_')}`;
        }
        // Parse tech stack
        const techStackFields = [
            { key: 'language', pattern: /\*\*Language\/Version\*\*:\s*(.+)/ },
            { key: 'primaryDependencies', pattern: /\*\*Primary Dependencies\*\*:\s*(.+)/ },
            { key: 'storage', pattern: /\*\*Storage\*\*:\s*(.+)/ },
            { key: 'testing', pattern: /\*\*Testing\*\*:\s*(.+)/ },
            { key: 'targetPlatform', pattern: /\*\*Target Platform\*\*:\s*(.+)/ },
            { key: 'projectType', pattern: /\*\*Project Type\*\*:\s*(.+)/ },
            { key: 'performanceGoals', pattern: /\*\*Performance Goals\*\*:\s*(.+)/ },
            { key: 'constraints', pattern: /\*\*Constraints\*\*:\s*(.+)/ },
            { key: 'scale', pattern: /\*\*Scale\/Scope\*\*:\s*(.+)/ },
        ];
        for (const field of techStackFields) {
            const match = markdown.match(field.pattern);
            if (match) {
                const value = match[1].trim();
                if (!value.includes('NEEDS CLARIFICATION') && value !== 'N/A') {
                    plan.techStack[field.key] = value;
                }
            }
        }
        // Parse constitution gates
        const gateSection = this.extractSection(markdown, '## Constitution Check');
        if (gateSection) {
            // Look for checkbox patterns
            const simplicityChecks = gateSection.matchAll(/- \[(x| )\]\s+(.+)/gi);
            for (const check of simplicityChecks) {
                const passed = check[1].toLowerCase() === 'x';
                const checkText = check[2].trim();
                if (checkText.toLowerCase().includes('project') || checkText.toLowerCase().includes('future')) {
                    plan.constitutionGates.simplicityGate.checks.push(checkText);
                    if (passed)
                        plan.constitutionGates.simplicityGate.passed = true;
                }
                else if (checkText.toLowerCase().includes('framework') || checkText.toLowerCase().includes('model')) {
                    plan.constitutionGates.antiAbstractionGate.checks.push(checkText);
                    if (passed)
                        plan.constitutionGates.antiAbstractionGate.passed = true;
                }
                else if (checkText.toLowerCase().includes('contract') || checkText.toLowerCase().includes('test')) {
                    plan.constitutionGates.integrationGate.checks.push(checkText);
                    if (passed)
                        plan.constitutionGates.integrationGate.passed = true;
                }
            }
        }
        // Parse complexity tracking
        const complexitySection = this.extractSection(markdown, '## Complexity Tracking');
        if (complexitySection) {
            const tableRows = complexitySection.matchAll(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g);
            for (const row of tableRows) {
                if (!row[1].includes('Violation') && !row[1].includes('---')) {
                    plan.complexityTracking.push({
                        violation: row[1].trim(),
                        whyNeeded: row[2].trim(),
                        alternativeRejected: row[3].trim(),
                    });
                }
            }
        }
        return plan;
    }
    /**
     * Parse a tasks.md file into structured task list
     */
    parseTasksMarkdown(markdown, planId) {
        const tasks = [];
        let currentPhase = 'Unknown';
        let taskPriority = 1000;
        const lines = markdown.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Detect phase headers
            const phaseMatch = line.match(/^##\s+Phase\s+\d+:\s*(.+)/);
            if (phaseMatch) {
                currentPhase = phaseMatch[1].trim();
                continue;
            }
            // Also detect story-based phases
            const storyPhaseMatch = line.match(/^##\s+Phase\s+\d+:\s*User Story\s+\d+\s*-\s*(.+)/);
            if (storyPhaseMatch) {
                currentPhase = storyPhaseMatch[1].trim();
                continue;
            }
            // Parse task lines
            const taskMatch = line.match(/^-\s+\[\s*\]\s+(T\d+)\s+(?:\[P\])?\s*(?:\[(US\d+)\])?\s*(.+)/);
            if (taskMatch) {
                const taskId = taskMatch[1];
                const storyId = taskMatch[2] || null;
                const description = taskMatch[3].trim();
                const parallelizable = line.includes('[P]');
                // Extract file paths from description
                const filePaths = [];
                const filePathMatches = description.matchAll(/(?:in|at|to)\s+([^\s,]+\.[a-z]+)/gi);
                for (const fpMatch of filePathMatches) {
                    filePaths.push(fpMatch[1]);
                }
                // Look for dependencies in description
                const dependencies = [];
                const depMatch = description.match(/\(depends on (T\d+(?:,\s*T\d+)*)\)/i);
                if (depMatch) {
                    dependencies.push(...depMatch[1].split(/,\s*/).filter(d => d.startsWith('T')));
                }
                tasks.push({
                    taskId,
                    planId,
                    storyId: storyId || undefined,
                    phase: currentPhase,
                    description,
                    dependencies,
                    parallelizable,
                    filePaths,
                    testScenarios: [],
                    priority: taskPriority--,
                });
            }
        }
        return tasks;
    }
    extractSection(markdown, sectionHeader) {
        const headerIndex = markdown.indexOf(sectionHeader);
        if (headerIndex === -1)
            return null;
        const startIndex = headerIndex + sectionHeader.length;
        let endIndex = markdown.length;
        // Find next same-level or higher-level header
        const headerLevel = sectionHeader.match(/^#+/)?.[0].length || 2;
        const nextHeaderRegex = new RegExp(`^#{1,${headerLevel}}\\s+`, 'gm');
        nextHeaderRegex.lastIndex = startIndex;
        const nextMatch = nextHeaderRegex.exec(markdown);
        if (nextMatch) {
            endIndex = nextMatch.index;
        }
        return markdown.slice(startIndex, endIndex);
    }
    generateId(prefix) {
        const timestamp = Date.now().toString(36);
        const random = crypto_1.default.randomBytes(4).toString('hex');
        return `${prefix}_${timestamp}_${random}`;
    }
    computeHash(content) {
        return crypto_1.default.createHash('sha256').update(content).digest('hex');
    }
    // ==========================================================================
    // MAIN API METHODS
    // ==========================================================================
    /**
     * Process and store a specification from markdown
     * Called when /speckit.specify generates a spec.md
     */
    async onSpecGenerated(markdownPath, createdByAgent, options = {}) {
        await this.initialize();
        const markdown = await fs_1.promises.readFile(markdownPath, 'utf-8');
        const spec = this.parseSpecMarkdown(markdown, markdownPath);
        this.logger.info('Processing specification', {
            specId: spec.specId,
            featureName: spec.featureName,
            userStoryCount: spec.userStories.length,
        });
        // Insert specification
        this.statements.get('insertSpec').run(spec.specId, spec.featureName, spec.featureBranch, JSON.stringify(spec.userStories), JSON.stringify(spec.requirements), JSON.stringify(spec.acceptanceCriteria), JSON.stringify(spec.successCriteria), JSON.stringify(spec.edgeCases), spec.status, createdByAgent, options.version || '1.0', markdownPath, spec.rawMarkdown, JSON.stringify({ parsedAt: new Date().toISOString() }));
        // Insert user stories
        const userStoryIds = [];
        for (const story of spec.userStories) {
            const globalStoryId = `${spec.specId}_${story.storyId}`;
            this.statements.get('insertUserStory').run(globalStoryId, spec.specId, story.title, story.priority, story.description, story.whyPriority, story.independentTest, JSON.stringify(story.acceptanceScenarios), 'pending');
            userStoryIds.push(globalStoryId);
        }
        // Track lineage
        if (this.config.autoTrackLineage) {
            await this.trackLineage({
                id: this.generateId('lineage'),
                artifactType: 'specification',
                artifactId: spec.specId,
                derivedArtifacts: [],
                generatingAgent: createdByAgent,
                filePath: markdownPath,
                contentHash: this.computeHash(markdown),
            });
        }
        this.logger.info('Specification stored successfully', { specId: spec.specId });
        return { specId: spec.specId, userStoryIds };
    }
    /**
     * Process and store an implementation plan from markdown
     * Called when /speckit.plan generates plan.md and related files
     */
    async onPlanGenerated(planMarkdownPath, specId, generatedByAgent, relatedFiles) {
        await this.initialize();
        const markdown = await fs_1.promises.readFile(planMarkdownPath, 'utf-8');
        const plan = this.parsePlanMarkdown(markdown, specId, planMarkdownPath);
        this.logger.info('Processing implementation plan', {
            planId: plan.planId,
            specId: plan.specId,
        });
        // Parse related files if provided
        if (relatedFiles?.researchPath) {
            try {
                const research = await fs_1.promises.readFile(relatedFiles.researchPath, 'utf-8');
                plan.researchFindings = { raw: research, parsedAt: new Date().toISOString() };
            }
            catch (e) {
                this.logger.warn('Could not read research file', { path: relatedFiles.researchPath });
            }
        }
        if (relatedFiles?.dataModelPath) {
            try {
                const dataModel = await fs_1.promises.readFile(relatedFiles.dataModelPath, 'utf-8');
                plan.dataModels = { raw: dataModel, parsedAt: new Date().toISOString() };
            }
            catch (e) {
                this.logger.warn('Could not read data model file', { path: relatedFiles.dataModelPath });
            }
        }
        if (relatedFiles?.quickstartPath) {
            try {
                const quickstart = await fs_1.promises.readFile(relatedFiles.quickstartPath, 'utf-8');
                plan.quickstartScenarios = [{ raw: quickstart, parsedAt: new Date().toISOString() }];
            }
            catch (e) {
                this.logger.warn('Could not read quickstart file', { path: relatedFiles.quickstartPath });
            }
        }
        // Parse contracts from directory
        const contractIds = [];
        if (relatedFiles?.contractsDir) {
            try {
                const contractFiles = await fs_1.promises.readdir(relatedFiles.contractsDir);
                for (const file of contractFiles) {
                    if (file.endsWith('.md') || file.endsWith('.yaml') || file.endsWith('.json')) {
                        const contractPath = path_1.default.join(relatedFiles.contractsDir, file);
                        const contractContent = await fs_1.promises.readFile(contractPath, 'utf-8');
                        plan.contracts.push({
                            file,
                            content: contractContent,
                            parsedAt: new Date().toISOString(),
                        });
                    }
                }
            }
            catch (e) {
                this.logger.warn('Could not read contracts directory', { path: relatedFiles.contractsDir });
            }
        }
        // Insert plan
        this.statements.get('insertPlan').run(plan.planId, plan.specId, JSON.stringify(plan.techStack), JSON.stringify(plan.architectureDecisions), plan.researchFindings ? JSON.stringify(plan.researchFindings) : null, JSON.stringify(plan.constitutionGates), plan.dataModels ? JSON.stringify(plan.dataModels) : null, JSON.stringify(plan.contracts), plan.projectStructure ? JSON.stringify(plan.projectStructure) : null, JSON.stringify(plan.complexityTracking), JSON.stringify(plan.quickstartScenarios), generatedByAgent, 'draft', planMarkdownPath, plan.rawMarkdown, JSON.stringify({ parsedAt: new Date().toISOString() }));
        // Record constitutional compliance
        for (const [gateName, gate] of Object.entries(plan.constitutionGates)) {
            const complianceId = this.generateId('compliance');
            this.statements.get('insertCompliance').run(complianceId, gateName, gate.passed ? 'passed' : 'failed', plan.planId, 'plan', JSON.stringify(gate.checks), null, null, null, generatedByAgent, gate.passed ? new Date().toISOString() : null, null);
        }
        // Track lineage - plan depends on spec
        if (this.config.autoTrackLineage) {
            await this.trackLineage({
                id: this.generateId('lineage'),
                artifactType: 'plan',
                artifactId: plan.planId,
                sourceArtifactId: specId,
                sourceArtifactType: 'specification',
                derivedArtifacts: [],
                generatingAgent: generatedByAgent,
                filePath: planMarkdownPath,
                contentHash: this.computeHash(markdown),
            });
            // Update spec's derived artifacts
            const specLineage = this.statements.get('getLineage').get(specId);
            if (specLineage) {
                const derived = JSON.parse(specLineage.derived_artifacts || '[]');
                derived.push({ type: 'plan', id: plan.planId });
                this.db.prepare(`UPDATE artifact_lineage SET derived_artifacts = ? WHERE artifact_id = ?`).run(JSON.stringify(derived), specId);
            }
        }
        this.logger.info('Implementation plan stored successfully', { planId: plan.planId });
        return { planId: plan.planId, contractIds };
    }
    /**
     * Process and store tasks from markdown
     * Called when /speckit.tasks generates tasks.md
     */
    async onTasksGenerated(tasksMarkdownPath, planId, generatedByAgent) {
        await this.initialize();
        const markdown = await fs_1.promises.readFile(tasksMarkdownPath, 'utf-8');
        const tasks = this.parseTasksMarkdown(markdown, planId);
        this.logger.info('Processing tasks', {
            planId,
            taskCount: tasks.length,
        });
        const taskIds = [];
        for (const task of tasks) {
            const globalTaskId = `${planId}_${task.taskId}`;
            this.statements.get('insertTask').run(globalTaskId, task.planId, task.storyId ? `${planId.replace('plan_', 'spec_')}_${task.storyId}` : null, task.phase, task.description, JSON.stringify(task.dependencies.map(d => `${planId}_${d}`)), task.parallelizable ? 1 : 0, JSON.stringify(task.filePaths), null, // assigned_agent
            'pending', JSON.stringify(task.testScenarios), task.priority, task.estimatedEffort || null, JSON.stringify({ parsedAt: new Date().toISOString() }));
            taskIds.push(globalTaskId);
        }
        // Track lineage - tasks depend on plan
        if (this.config.autoTrackLineage) {
            for (const taskId of taskIds) {
                await this.trackLineage({
                    id: this.generateId('lineage'),
                    artifactType: 'task',
                    artifactId: taskId,
                    sourceArtifactId: planId,
                    sourceArtifactType: 'plan',
                    derivedArtifacts: [],
                    generatingAgent: generatedByAgent,
                    filePath: tasksMarkdownPath,
                    contentHash: this.computeHash(taskId),
                });
            }
        }
        this.logger.info('Tasks stored successfully', { taskCount: taskIds.length });
        return { taskIds };
    }
    // ==========================================================================
    // LINEAGE TRACKING
    // ==========================================================================
    async trackLineage(entry) {
        this.statements.get('insertLineage').run(entry.id, entry.artifactType, entry.artifactId, entry.sourceArtifactId || null, entry.sourceArtifactType || null, JSON.stringify(entry.derivedArtifacts), entry.generatingAgent, 'valid', entry.filePath || null, entry.contentHash || null, null);
    }
    /**
     * Get all artifacts that would need regeneration if a source artifact changes
     */
    async getCascadeAffected(artifactId) {
        await this.initialize();
        const affected = [];
        const visited = new Set();
        const traverse = (id) => {
            if (visited.has(id))
                return;
            visited.add(id);
            const derived = this.statements.get('getDerivedArtifacts').all(id);
            for (const row of derived) {
                const derivedList = JSON.parse(row.derived_artifacts || '[]');
                for (const artifact of derivedList) {
                    affected.push(artifact);
                    traverse(artifact.id);
                }
            }
        };
        traverse(artifactId);
        return affected;
    }
    /**
     * Mark artifacts as stale when their source changes
     */
    async invalidateDownstream(artifactId, reason) {
        await this.initialize();
        const affected = await this.getCascadeAffected(artifactId);
        let count = 0;
        for (const artifact of affected) {
            this.statements.get('updateLineageStatus').run('stale', reason, artifact.id);
            count++;
        }
        this.logger.info('Invalidated downstream artifacts', { sourceId: artifactId, count });
        return count;
    }
    // ==========================================================================
    // QUERY METHODS
    // ==========================================================================
    /**
     * Get a specification by ID
     */
    async getSpecification(specId) {
        await this.initialize();
        const row = this.statements.get('getSpec').get(specId);
        if (!row)
            return null;
        return this.rowToSpec(row);
    }
    /**
     * Get a specification by feature name
     */
    async getSpecificationByFeature(featureName) {
        await this.initialize();
        const row = this.statements.get('getSpecByFeature').get(featureName);
        if (!row)
            return null;
        return this.rowToSpec(row);
    }
    /**
     * Get an implementation plan by ID
     */
    async getPlan(planId) {
        await this.initialize();
        const row = this.statements.get('getPlan').get(planId);
        if (!row)
            return null;
        return this.rowToPlan(row);
    }
    /**
     * Get all plans for a specification
     */
    async getPlansBySpec(specId) {
        await this.initialize();
        const rows = this.statements.get('getPlansBySpec').all(specId);
        return rows.map((row) => this.rowToPlan(row));
    }
    /**
     * Get all tasks for a plan
     */
    async getTasksByPlan(planId) {
        await this.initialize();
        const rows = this.statements.get('getTasksByPlan').all(planId);
        return rows.map((row) => this.rowToTask(row));
    }
    /**
     * Get user stories for a specification
     */
    async getUserStories(specId) {
        await this.initialize();
        const rows = this.statements.get('getStoriesBySpec').all(specId);
        return rows.map((row) => this.rowToUserStory(row));
    }
    /**
     * Update task status
     */
    async updateTaskStatus(taskId, status) {
        await this.initialize();
        this.statements.get('updateTaskStatus').run(status, taskId);
        this.logger.info('Task status updated', { taskId, status });
    }
    // ==========================================================================
    // ROW CONVERTERS
    // ==========================================================================
    rowToSpec(row) {
        return {
            specId: row.spec_id,
            featureName: row.feature_name,
            featureBranch: row.feature_branch,
            userStories: JSON.parse(row.user_stories || '[]'),
            requirements: JSON.parse(row.requirements || '{"functional":[],"entities":[]}'),
            acceptanceCriteria: JSON.parse(row.acceptance_criteria || '[]'),
            successCriteria: JSON.parse(row.success_criteria || '[]'),
            edgeCases: JSON.parse(row.edge_cases || '[]'),
            status: row.status,
            rawMarkdown: row.raw_markdown || '',
        };
    }
    rowToPlan(row) {
        return {
            planId: row.plan_id,
            specId: row.spec_id,
            techStack: JSON.parse(row.tech_stack || '{}'),
            architectureDecisions: JSON.parse(row.architecture_decisions || '[]'),
            researchFindings: row.research_findings ? JSON.parse(row.research_findings) : null,
            constitutionGates: JSON.parse(row.constitution_gates || '{}'),
            dataModels: row.data_models ? JSON.parse(row.data_models) : null,
            contracts: JSON.parse(row.contracts || '[]'),
            projectStructure: row.project_structure ? JSON.parse(row.project_structure) : null,
            complexityTracking: JSON.parse(row.complexity_tracking || '[]'),
            quickstartScenarios: JSON.parse(row.quickstart_scenarios || '[]'),
            rawMarkdown: row.raw_markdown || '',
        };
    }
    rowToTask(row) {
        return {
            taskId: row.task_id,
            planId: row.plan_id,
            storyId: row.story_id || undefined,
            phase: row.phase,
            description: row.description,
            dependencies: JSON.parse(row.dependencies || '[]'),
            parallelizable: row.parallelizable === 1,
            filePaths: JSON.parse(row.file_paths || '[]'),
            testScenarios: JSON.parse(row.test_scenarios || '[]'),
            priority: row.priority,
            estimatedEffort: row.estimated_effort || undefined,
        };
    }
    rowToUserStory(row) {
        return {
            storyId: row.story_id,
            title: row.title,
            priority: row.priority,
            description: row.description,
            whyPriority: row.why_priority,
            independentTest: row.independent_test,
            acceptanceScenarios: JSON.parse(row.acceptance_scenarios || '[]'),
        };
    }
}
exports.SpecKitMemoryBridge = SpecKitMemoryBridge;
exports.default = SpecKitMemoryBridge;
//# sourceMappingURL=memory-bridge.js.map