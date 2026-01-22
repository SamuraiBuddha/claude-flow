"use strict";
/**
 * Artifact Validator Agent
 *
 * Performs cross-artifact consistency checking (/speckit.analyze).
 * Validates user story coverage and test completeness across all
 * specification artifacts.
 *
 * @module ArtifactValidatorAgent
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createArtifactValidatorAgent = exports.ArtifactValidatorAgent = void 0;
const base_agent_js_1 = require("../../../cli/agents/base-agent.js");
/**
 * Artifact Validator Agent - Cross-artifact consistency and coverage checking
 */
class ArtifactValidatorAgent extends base_agent_js_1.BaseAgent {
    artifactCache = new Map();
    validationHistory = [];
    constructor(id, config, environment, logger, eventBus, memory) {
        super(id, 'reviewer', config, environment, logger, eventBus, memory);
    }
    /**
     * Get default capabilities for artifact validation
     */
    getDefaultCapabilities() {
        return {
            codeGeneration: false,
            codeReview: true,
            testing: true,
            documentation: true,
            research: false,
            analysis: true,
            webSearch: false,
            apiIntegration: false,
            fileSystem: true,
            terminalAccess: false,
            languages: [],
            frameworks: [],
            domains: [
                'artifact-validation',
                'consistency-checking',
                'coverage-analysis',
                'cross-reference-validation',
                'specification-analysis',
                'gap-detection',
            ],
            tools: [
                'validate-spec',
                'check-coverage',
                'identify-gaps',
                'analyze-consistency',
                'trace-requirements',
                'generate-report',
            ],
            maxConcurrentTasks: 4,
            maxMemoryUsage: 512 * 1024 * 1024, // 512MB
            maxExecutionTime: 600000, // 10 minutes
            reliability: 0.95,
            speed: 0.85,
            quality: 0.98,
        };
    }
    /**
     * Get default configuration for the agent
     */
    getDefaultConfig() {
        return {
            autonomyLevel: 0.85,
            learningEnabled: true,
            adaptationEnabled: true,
            maxTasksPerHour: 30,
            maxConcurrentTasks: 4,
            timeoutThreshold: 600000,
            reportingInterval: 30000,
            heartbeatInterval: 10000,
            permissions: ['file-read', 'memory-access', 'validation-write'],
            trustedAgents: [],
            expertise: {
                'artifact-validation': 0.95,
                'coverage-analysis': 0.92,
                'consistency-checking': 0.94,
                'gap-detection': 0.9,
            },
            preferences: {
                strictValidation: true,
                requireFullCoverage: true,
                validateReferences: true,
                detectOrphans: true,
            },
        };
    }
    /**
     * Execute an artifact validation task
     */
    async executeTask(task) {
        this.logger.info('Artifact Validator executing task', {
            agentId: this.id,
            taskType: task.type,
            taskId: task.id,
        });
        try {
            switch (task.type) {
                case 'validate-spec':
                    return await this.validateSpec(task);
                case 'check-coverage':
                    return await this.checkCoverage(task);
                case 'identify-gaps':
                    return await this.identifyGaps(task);
                case 'analyze-consistency':
                    return await this.analyzeConsistency(task);
                case 'trace-requirements':
                    return await this.traceRequirements(task);
                default:
                    return await this.performGeneralValidation(task);
            }
        }
        catch (error) {
            this.logger.error('Artifact validation task failed', {
                agentId: this.id,
                taskId: task.id,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    /**
     * Validate a specification artifact
     */
    async validateSpec(task) {
        const artifact = task.input?.artifact;
        const relatedArtifacts = task.input?.relatedArtifacts || [];
        const strictMode = task.parameters?.strictMode ?? true;
        this.logger.info('Validating specification artifact', {
            artifactId: artifact?.id,
            artifactType: artifact?.type,
        });
        if (!artifact) {
            throw new Error('No artifact provided for validation');
        }
        // Cache artifact for reference checking
        this.artifactCache.set(artifact.id, artifact);
        for (const related of relatedArtifacts) {
            this.artifactCache.set(related.id, related);
        }
        const errors = [];
        const warnings = [];
        // Validate artifact structure
        const structureErrors = this.validateStructure(artifact);
        errors.push(...structureErrors);
        // Validate references
        const referenceErrors = this.validateReferences(artifact, relatedArtifacts);
        errors.push(...referenceErrors);
        // Type-specific validation
        const typeErrors = await this.validateByType(artifact, relatedArtifacts);
        errors.push(...typeErrors.errors);
        warnings.push(...typeErrors.warnings);
        // Calculate coverage
        const coverage = await this.calculateCoverage(artifact, relatedArtifacts);
        // Check consistency
        const consistency = await this.checkArtifactConsistency(artifact, relatedArtifacts);
        const result = {
            artifactId: artifact.id,
            artifactType: artifact.type,
            valid: errors.length === 0,
            errors,
            warnings,
            coverage,
            consistency,
            timestamp: new Date(),
        };
        this.validationHistory.push(result);
        await this.memory.store(`validation:${artifact.id}:result`, result, {
            type: 'artifact-validation',
            tags: ['validation', artifact.type, artifact.id],
            partition: 'validation',
        });
        return result;
    }
    /**
     * Check coverage of requirements and user stories
     */
    async checkCoverage(task) {
        const artifacts = task.input?.artifacts || [];
        const coverageType = task.parameters?.coverageType || 'all';
        this.logger.info('Checking specification coverage', {
            artifactCount: artifacts.length,
            coverageType,
        });
        const requirements = artifacts.filter(a => a.type === 'requirements');
        const userStories = artifacts.filter(a => a.type === 'user-stories');
        const tests = artifacts.filter(a => a.type === 'test-plan');
        const implementations = artifacts.filter(a => a.type === 'implementation');
        const coverage = {
            totalItems: 0,
            coveredItems: 0,
            uncoveredItems: [],
            coveragePercentage: 0,
            byCategory: {},
        };
        // Check requirements coverage
        if (coverageType === 'all' || coverageType === 'requirements') {
            const reqCoverage = this.analyzeRequirementsCoverage(requirements, tests, implementations);
            coverage.byCategory['requirements'] = reqCoverage;
            coverage.totalItems += reqCoverage.total;
            coverage.coveredItems += reqCoverage.covered;
        }
        // Check user story coverage
        if (coverageType === 'all' || coverageType === 'user-stories') {
            const storyCoverage = this.analyzeUserStoryCoverage(userStories, implementations, tests);
            coverage.byCategory['user-stories'] = storyCoverage;
            coverage.totalItems += storyCoverage.total;
            coverage.coveredItems += storyCoverage.covered;
        }
        // Check test coverage
        if (coverageType === 'all' || coverageType === 'tests') {
            const testCoverage = this.analyzeTestCoverage(tests, requirements, implementations);
            coverage.byCategory['tests'] = testCoverage;
            coverage.totalItems += testCoverage.total;
            coverage.coveredItems += testCoverage.covered;
        }
        coverage.coveragePercentage = coverage.totalItems > 0
            ? (coverage.coveredItems / coverage.totalItems) * 100
            : 0;
        // Identify uncovered items
        for (const [category, data] of Object.entries(coverage.byCategory)) {
            if (data.covered < data.total) {
                coverage.uncoveredItems.push(`${category}: ${data.total - data.covered} items uncovered`);
            }
        }
        await this.memory.store(`coverage:${task.id.id}:report`, coverage, {
            type: 'coverage-report',
            tags: ['coverage', coverageType],
            partition: 'validation',
        });
        return coverage;
    }
    /**
     * Identify gaps in specification
     */
    async identifyGaps(task) {
        const artifacts = task.input?.artifacts || [];
        const focusAreas = task.parameters?.focusAreas || ['all'];
        this.logger.info('Identifying specification gaps', {
            artifactCount: artifacts.length,
            focusAreas,
        });
        const gaps = [];
        let gapId = 1;
        // Cache all artifacts
        for (const artifact of artifacts) {
            this.artifactCache.set(artifact.id, artifact);
        }
        // Check for missing requirements
        if (focusAreas.includes('all') || focusAreas.includes('requirements')) {
            const reqGaps = this.findRequirementGaps(artifacts);
            gaps.push(...reqGaps.map(g => ({
                id: `gap-${gapId++}`,
                ...g,
            })));
        }
        // Check for missing tests
        if (focusAreas.includes('all') || focusAreas.includes('tests')) {
            const testGaps = this.findTestGaps(artifacts);
            gaps.push(...testGaps.map(g => ({
                id: `gap-${gapId++}`,
                ...g,
            })));
        }
        // Check for missing implementations
        if (focusAreas.includes('all') || focusAreas.includes('implementation')) {
            const implGaps = this.findImplementationGaps(artifacts);
            gaps.push(...implGaps.map(g => ({
                id: `gap-${gapId++}`,
                ...g,
            })));
        }
        // Check for incomplete specs
        if (focusAreas.includes('all') || focusAreas.includes('completeness')) {
            const incompleteGaps = this.findIncompleteSpecs(artifacts);
            gaps.push(...incompleteGaps.map(g => ({
                id: `gap-${gapId++}`,
                ...g,
            })));
        }
        // Sort by priority
        gaps.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        await this.memory.store(`gaps:${task.id.id}:report`, {
            gaps,
            summary: {
                total: gaps.length,
                high: gaps.filter(g => g.priority === 'high').length,
                medium: gaps.filter(g => g.priority === 'medium').length,
                low: gaps.filter(g => g.priority === 'low').length,
            },
        }, {
            type: 'gaps-report',
            tags: ['gaps', ...focusAreas],
            partition: 'validation',
        });
        return gaps;
    }
    /**
     * Analyze consistency across artifacts
     */
    async analyzeConsistency(task) {
        const artifacts = task.input?.artifacts || [];
        this.logger.info('Analyzing artifact consistency', {
            artifactCount: artifacts.length,
        });
        // Cache all artifacts
        for (const artifact of artifacts) {
            this.artifactCache.set(artifact.id, artifact);
        }
        const inconsistencies = [];
        const crossReferences = [];
        // Check for missing references
        for (const artifact of artifacts) {
            for (const ref of artifact.references) {
                const target = this.artifactCache.get(ref);
                const crossRef = {
                    sourceArtifact: artifact.id,
                    targetArtifact: ref,
                    referenceType: 'direct',
                    valid: !!target,
                };
                crossReferences.push(crossRef);
                if (!target) {
                    inconsistencies.push({
                        type: 'missing-reference',
                        description: `Artifact ${artifact.id} references non-existent artifact ${ref}`,
                        artifacts: [artifact.id, ref],
                        severity: 'high',
                    });
                }
            }
        }
        // Check for orphaned artifacts
        const referenced = new Set();
        for (const artifact of artifacts) {
            for (const ref of artifact.references) {
                referenced.add(ref);
            }
        }
        for (const artifact of artifacts) {
            if (!referenced.has(artifact.id) && artifact.type !== 'requirements') {
                inconsistencies.push({
                    type: 'orphaned-artifact',
                    description: `Artifact ${artifact.id} is not referenced by any other artifact`,
                    artifacts: [artifact.id],
                    severity: 'low',
                });
            }
        }
        // Check for circular dependencies
        const circularDeps = this.detectCircularDependencies(artifacts);
        inconsistencies.push(...circularDeps);
        // Check for conflicting definitions
        const conflicts = this.findConflictingDefinitions(artifacts);
        inconsistencies.push(...conflicts);
        const report = {
            consistent: inconsistencies.length === 0,
            inconsistencies,
            crossReferences,
        };
        await this.memory.store(`consistency:${task.id.id}:report`, report, {
            type: 'consistency-report',
            tags: ['consistency'],
            partition: 'validation',
        });
        return report;
    }
    /**
     * Trace requirements through implementation
     */
    async traceRequirements(task) {
        const artifacts = task.input?.artifacts || [];
        const requirementId = task.parameters?.requirementId;
        this.logger.info('Tracing requirements', {
            artifactCount: artifacts.length,
            requirementId,
        });
        // Cache all artifacts
        for (const artifact of artifacts) {
            this.artifactCache.set(artifact.id, artifact);
        }
        const requirements = artifacts.filter(a => a.type === 'requirements');
        const userStories = artifacts.filter(a => a.type === 'user-stories');
        const tests = artifacts.filter(a => a.type === 'test-plan');
        const implementations = artifacts.filter(a => a.type === 'implementation');
        const traces = [];
        const targetRequirements = requirementId
            ? requirements.filter(r => r.id === requirementId)
            : requirements;
        for (const req of targetRequirements) {
            const trace = {
                requirement: req.id,
                userStories: this.findRelatedItems(req, userStories),
                tests: this.findRelatedItems(req, tests),
                implementations: this.findRelatedItems(req, implementations),
                complete: false,
                gaps: [],
            };
            // Check completeness
            if (trace.userStories.length === 0) {
                trace.gaps.push('No user stories linked');
            }
            if (trace.tests.length === 0) {
                trace.gaps.push('No tests linked');
            }
            if (trace.implementations.length === 0) {
                trace.gaps.push('No implementations linked');
            }
            trace.complete = trace.gaps.length === 0;
            traces.push(trace);
        }
        return {
            totalRequirements: targetRequirements.length,
            completeTraces: traces.filter(t => t.complete).length,
            incompleteTraces: traces.filter(t => !t.complete).length,
            traces,
            summary: {
                fullyCovered: traces.every(t => t.complete),
                coverageRate: traces.filter(t => t.complete).length / traces.length,
            },
        };
    }
    /**
     * Perform general validation
     */
    async performGeneralValidation(task) {
        const artifacts = task.input?.artifacts || [];
        // Run all validation checks
        const coverage = await this.checkCoverage({
            ...task,
            type: 'check-coverage',
            input: { artifacts },
        });
        const gaps = await this.identifyGaps({
            ...task,
            type: 'identify-gaps',
            input: { artifacts },
        });
        const consistency = await this.analyzeConsistency({
            ...task,
            type: 'analyze-consistency',
            input: { artifacts },
        });
        return {
            coverage,
            gaps,
            consistency,
            overallHealth: this.calculateOverallHealth(coverage, gaps, consistency),
            recommendations: this.generateValidationRecommendations(coverage, gaps, consistency),
        };
    }
    /**
     * Validate artifact structure
     */
    validateStructure(artifact) {
        const errors = [];
        if (!artifact.id) {
            errors.push({
                code: 'MISSING_ID',
                message: 'Artifact is missing required id field',
                severity: 'critical',
                location: 'artifact.id',
                context: { artifact },
            });
        }
        if (!artifact.type) {
            errors.push({
                code: 'MISSING_TYPE',
                message: 'Artifact is missing required type field',
                severity: 'critical',
                location: 'artifact.type',
                context: { artifact },
            });
        }
        if (!artifact.content) {
            errors.push({
                code: 'MISSING_CONTENT',
                message: 'Artifact is missing content',
                severity: 'error',
                location: 'artifact.content',
                context: { artifactId: artifact.id },
            });
        }
        return errors;
    }
    /**
     * Validate artifact references
     */
    validateReferences(artifact, relatedArtifacts) {
        const errors = [];
        const availableIds = new Set(relatedArtifacts.map(a => a.id));
        for (const ref of artifact.references) {
            if (!availableIds.has(ref) && !this.artifactCache.has(ref)) {
                errors.push({
                    code: 'INVALID_REFERENCE',
                    message: `Referenced artifact ${ref} not found`,
                    severity: 'error',
                    location: `artifact.references[${artifact.references.indexOf(ref)}]`,
                    context: { artifactId: artifact.id, reference: ref },
                    suggestedFix: `Add artifact ${ref} or remove the reference`,
                });
            }
        }
        return errors;
    }
    /**
     * Validate artifact by its type
     */
    async validateByType(artifact, relatedArtifacts) {
        const errors = [];
        const warnings = [];
        switch (artifact.type) {
            case 'requirements':
                if (!artifact.content.items || artifact.content.items.length === 0) {
                    errors.push({
                        code: 'EMPTY_REQUIREMENTS',
                        message: 'Requirements document has no items',
                        severity: 'error',
                        location: 'artifact.content.items',
                        context: { artifactId: artifact.id },
                    });
                }
                break;
            case 'user-stories':
                if (artifact.content.stories) {
                    for (const story of artifact.content.stories) {
                        if (!story.acceptanceCriteria || story.acceptanceCriteria.length === 0) {
                            warnings.push({
                                code: 'MISSING_ACCEPTANCE_CRITERIA',
                                message: `User story ${story.id} is missing acceptance criteria`,
                                location: `artifact.content.stories[${story.id}]`,
                                recommendation: 'Add acceptance criteria to define done criteria',
                            });
                        }
                    }
                }
                break;
            case 'api-contracts':
                if (!artifact.content.endpoints || artifact.content.endpoints.length === 0) {
                    errors.push({
                        code: 'EMPTY_API_CONTRACT',
                        message: 'API contract has no endpoints defined',
                        severity: 'error',
                        location: 'artifact.content.endpoints',
                        context: { artifactId: artifact.id },
                    });
                }
                break;
            case 'test-plan':
                if (!artifact.content.testCases || artifact.content.testCases.length === 0) {
                    errors.push({
                        code: 'EMPTY_TEST_PLAN',
                        message: 'Test plan has no test cases',
                        severity: 'error',
                        location: 'artifact.content.testCases',
                        context: { artifactId: artifact.id },
                    });
                }
                break;
        }
        return { errors, warnings };
    }
    /**
     * Calculate coverage for an artifact
     */
    async calculateCoverage(artifact, relatedArtifacts) {
        // Simplified coverage calculation
        const totalItems = artifact.content?.items?.length ||
            artifact.content?.stories?.length ||
            artifact.content?.testCases?.length || 0;
        return {
            totalItems,
            coveredItems: Math.floor(totalItems * 0.8), // Placeholder
            uncoveredItems: [],
            coveragePercentage: 80,
            byCategory: {},
        };
    }
    /**
     * Check consistency for a single artifact
     */
    async checkArtifactConsistency(artifact, relatedArtifacts) {
        const inconsistencies = [];
        const crossReferences = [];
        for (const ref of artifact.references) {
            const target = relatedArtifacts.find(a => a.id === ref);
            crossReferences.push({
                sourceArtifact: artifact.id,
                targetArtifact: ref,
                referenceType: 'direct',
                valid: !!target,
            });
        }
        return {
            consistent: inconsistencies.length === 0,
            inconsistencies,
            crossReferences,
        };
    }
    /**
     * Analyze requirements coverage
     */
    analyzeRequirementsCoverage(requirements, tests, implementations) {
        let total = 0;
        let covered = 0;
        for (const req of requirements) {
            const items = req.content?.items || [];
            total += items.length;
            for (const item of items) {
                const hasTest = tests.some(t => t.references.includes(item.id) ||
                    t.content?.testCases?.some((tc) => tc.requirementId === item.id));
                const hasImpl = implementations.some(i => i.references.includes(item.id));
                if (hasTest && hasImpl) {
                    covered++;
                }
            }
        }
        return { total, covered };
    }
    /**
     * Analyze user story coverage
     */
    analyzeUserStoryCoverage(stories, implementations, tests) {
        let total = 0;
        let covered = 0;
        for (const storyArtifact of stories) {
            const storyList = storyArtifact.content?.stories || [];
            total += storyList.length;
            for (const story of storyList) {
                const hasImpl = implementations.some(i => i.references.includes(story.id));
                const hasTest = tests.some(t => t.references.includes(story.id));
                if (hasImpl && hasTest) {
                    covered++;
                }
            }
        }
        return { total, covered };
    }
    /**
     * Analyze test coverage
     */
    analyzeTestCoverage(tests, requirements, implementations) {
        let total = 0;
        let covered = 0;
        for (const req of requirements) {
            const items = req.content?.items || [];
            total += items.length;
            for (const item of items) {
                const hasTest = tests.some(t => t.content?.testCases?.some((tc) => tc.requirementId === item.id || t.references.includes(item.id)));
                if (hasTest) {
                    covered++;
                }
            }
        }
        return { total, covered };
    }
    /**
     * Find requirement gaps
     */
    findRequirementGaps(artifacts) {
        const gaps = [];
        const requirements = artifacts.filter(a => a.type === 'requirements');
        const tests = artifacts.filter(a => a.type === 'test-plan');
        for (const req of requirements) {
            const items = req.content?.items || [];
            for (const item of items) {
                const hasTest = tests.some(t => t.references.includes(item.id) ||
                    t.content?.testCases?.some((tc) => tc.requirementId === item.id));
                if (!hasTest) {
                    gaps.push({
                        type: 'missing-test',
                        description: `Requirement ${item.id} has no associated tests`,
                        affectedArtifacts: [req.id, item.id],
                        priority: item.priority === 'high' ? 'high' : 'medium',
                        suggestedAction: `Create test cases for requirement ${item.id}`,
                    });
                }
            }
        }
        return gaps;
    }
    /**
     * Find test gaps
     */
    findTestGaps(artifacts) {
        const gaps = [];
        const tests = artifacts.filter(a => a.type === 'test-plan');
        const implementations = artifacts.filter(a => a.type === 'implementation');
        for (const impl of implementations) {
            const hasTest = tests.some(t => t.references.includes(impl.id));
            if (!hasTest) {
                gaps.push({
                    type: 'missing-test',
                    description: `Implementation ${impl.id} has no associated tests`,
                    affectedArtifacts: [impl.id],
                    priority: 'high',
                    suggestedAction: `Create tests for implementation ${impl.id}`,
                });
            }
        }
        return gaps;
    }
    /**
     * Find implementation gaps
     */
    findImplementationGaps(artifacts) {
        const gaps = [];
        const requirements = artifacts.filter(a => a.type === 'requirements');
        const implementations = artifacts.filter(a => a.type === 'implementation');
        for (const req of requirements) {
            const items = req.content?.items || [];
            for (const item of items) {
                const hasImpl = implementations.some(i => i.references.includes(item.id));
                if (!hasImpl) {
                    gaps.push({
                        type: 'missing-implementation',
                        description: `Requirement ${item.id} has no implementation`,
                        affectedArtifacts: [req.id, item.id],
                        priority: 'high',
                        suggestedAction: `Implement requirement ${item.id}`,
                    });
                }
            }
        }
        return gaps;
    }
    /**
     * Find incomplete specifications
     */
    findIncompleteSpecs(artifacts) {
        const gaps = [];
        for (const artifact of artifacts) {
            if (!artifact.content || Object.keys(artifact.content).length === 0) {
                gaps.push({
                    type: 'incomplete-spec',
                    description: `Artifact ${artifact.id} has empty or missing content`,
                    affectedArtifacts: [artifact.id],
                    priority: 'medium',
                    suggestedAction: `Complete the content for ${artifact.id}`,
                });
            }
        }
        return gaps;
    }
    /**
     * Detect circular dependencies
     */
    detectCircularDependencies(artifacts) {
        const issues = [];
        const visited = new Set();
        const recursionStack = new Set();
        const dfs = (artifactId, path) => {
            visited.add(artifactId);
            recursionStack.add(artifactId);
            const artifact = this.artifactCache.get(artifactId);
            if (!artifact)
                return false;
            for (const ref of artifact.references) {
                if (!visited.has(ref)) {
                    if (dfs(ref, [...path, ref])) {
                        return true;
                    }
                }
                else if (recursionStack.has(ref)) {
                    issues.push({
                        type: 'circular-dependency',
                        description: `Circular dependency detected: ${[...path, ref].join(' -> ')}`,
                        artifacts: [...path, ref],
                        severity: 'high',
                    });
                    return true;
                }
            }
            recursionStack.delete(artifactId);
            return false;
        };
        for (const artifact of artifacts) {
            if (!visited.has(artifact.id)) {
                dfs(artifact.id, [artifact.id]);
            }
        }
        return issues;
    }
    /**
     * Find conflicting definitions
     */
    findConflictingDefinitions(artifacts) {
        const issues = [];
        const definitions = new Map();
        // Group by defined entities
        for (const artifact of artifacts) {
            const entities = artifact.content?.entities || artifact.content?.definitions || [];
            for (const entity of entities) {
                const key = entity.name || entity.id;
                if (!definitions.has(key)) {
                    definitions.set(key, []);
                }
                definitions.get(key).push(artifact);
            }
        }
        // Check for conflicts
        for (const [name, definingArtifacts] of definitions) {
            if (definingArtifacts.length > 1) {
                issues.push({
                    type: 'conflicting-definition',
                    description: `Entity "${name}" is defined in multiple artifacts`,
                    artifacts: definingArtifacts.map(a => a.id),
                    severity: 'medium',
                });
            }
        }
        return issues;
    }
    /**
     * Find related items for requirement tracing
     */
    findRelatedItems(requirement, candidates) {
        return candidates
            .filter(c => c.references.includes(requirement.id))
            .map(c => c.id);
    }
    /**
     * Calculate overall health score
     */
    calculateOverallHealth(coverage, gaps, consistency) {
        let health = 100;
        // Reduce for coverage gaps
        health -= (100 - coverage.coveragePercentage) * 0.3;
        // Reduce for gaps
        health -= gaps.filter(g => g.priority === 'high').length * 5;
        health -= gaps.filter(g => g.priority === 'medium').length * 2;
        // Reduce for inconsistencies
        health -= consistency.inconsistencies.filter(i => i.severity === 'high').length * 5;
        health -= consistency.inconsistencies.filter(i => i.severity === 'medium').length * 2;
        return Math.max(0, Math.min(100, health));
    }
    /**
     * Generate validation recommendations
     */
    generateValidationRecommendations(coverage, gaps, consistency) {
        const recommendations = [];
        if (coverage.coveragePercentage < 80) {
            recommendations.push(`Improve coverage from ${coverage.coveragePercentage.toFixed(1)}% to at least 80%`);
        }
        const highPriorityGaps = gaps.filter(g => g.priority === 'high');
        if (highPriorityGaps.length > 0) {
            recommendations.push(`Address ${highPriorityGaps.length} high-priority gaps`);
        }
        if (!consistency.consistent) {
            recommendations.push(`Resolve ${consistency.inconsistencies.length} consistency issues`);
        }
        return recommendations;
    }
    /**
     * Get agent status with validation-specific information
     */
    getAgentStatus() {
        return {
            ...super.getAgentStatus(),
            specialization: 'Artifact Validation',
            cachedArtifacts: this.artifactCache.size,
            validationsPerformed: this.validationHistory.length,
            capabilities: [
                'validate-spec',
                'check-coverage',
                'identify-gaps',
            ],
        };
    }
}
exports.ArtifactValidatorAgent = ArtifactValidatorAgent;
/**
 * Factory function to create an Artifact Validator Agent
 */
const createArtifactValidatorAgent = (id, config, environment, logger, eventBus, memory) => {
    const defaultConfig = {
        autonomyLevel: 0.85,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 30,
        maxConcurrentTasks: 4,
        timeoutThreshold: 600000,
        reportingInterval: 30000,
        heartbeatInterval: 10000,
        permissions: ['file-read', 'memory-access', 'validation-write'],
        trustedAgents: [],
        expertise: {
            'artifact-validation': 0.95,
            'coverage-analysis': 0.92,
        },
        preferences: {
            strictValidation: true,
            requireFullCoverage: true,
        },
    };
    const defaultEnv = {
        runtime: 'node',
        version: '20.0.0',
        workingDirectory: './agents/artifact-validator',
        tempDirectory: './tmp/artifact-validator',
        logDirectory: './logs/artifact-validator',
        apiEndpoints: {},
        credentials: {},
        availableTools: ['validate-spec', 'check-coverage', 'identify-gaps'],
        toolConfigs: {},
    };
    return new ArtifactValidatorAgent(id, { ...defaultConfig, ...config }, { ...defaultEnv, ...environment }, logger, eventBus, memory);
};
exports.createArtifactValidatorAgent = createArtifactValidatorAgent;
//# sourceMappingURL=artifact-validator.js.map