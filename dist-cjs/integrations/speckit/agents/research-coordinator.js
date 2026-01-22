"use strict";
/**
 * Research Coordinator Agent
 *
 * Extracts [NEEDS CLARIFICATION] items from specifications, spawns research
 * tasks to gather information, and consolidates findings into research.md
 * documentation.
 *
 * @module ResearchCoordinatorAgent
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResearchCoordinatorAgent = exports.ResearchCoordinatorAgent = void 0;
const base_agent_js_1 = require("../../../cli/agents/base-agent.js");
/**
 * Research Coordinator Agent - Manages research tasks and consolidation
 */
class ResearchCoordinatorAgent extends base_agent_js_1.BaseAgent {
    unknownItems = new Map();
    researchTasks = new Map();
    results = new Map();
    constructor(id, config, environment, logger, eventBus, memory) {
        super(id, 'coordinator', config, environment, logger, eventBus, memory);
        this.setupResearchEvents();
    }
    /**
     * Get default capabilities for research coordination
     */
    getDefaultCapabilities() {
        return {
            codeGeneration: false,
            codeReview: false,
            testing: false,
            documentation: true,
            research: true,
            analysis: true,
            webSearch: true,
            apiIntegration: true,
            fileSystem: true,
            terminalAccess: false,
            languages: [],
            frameworks: [],
            domains: [
                'research-coordination',
                'information-extraction',
                'knowledge-consolidation',
                'question-analysis',
                'source-aggregation',
                'documentation-generation',
            ],
            tools: [
                'extract-unknowns',
                'spawn-research',
                'consolidate-findings',
                'generate-document',
                'track-research',
                'prioritize-items',
            ],
            maxConcurrentTasks: 5,
            maxMemoryUsage: 512 * 1024 * 1024, // 512MB
            maxExecutionTime: 900000, // 15 minutes
            reliability: 0.92,
            speed: 0.85,
            quality: 0.94,
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
            maxTasksPerHour: 40,
            maxConcurrentTasks: 5,
            timeoutThreshold: 900000,
            reportingInterval: 30000,
            heartbeatInterval: 10000,
            permissions: ['file-read', 'file-write', 'web-search', 'memory-access', 'task-spawn'],
            trustedAgents: [],
            expertise: {
                'research-coordination': 0.95,
                'information-extraction': 0.92,
                'knowledge-synthesis': 0.9,
                'documentation': 0.88,
            },
            preferences: {
                autoSpawnResearch: true,
                parallelResearch: true,
                consolidateOnComplete: true,
                minConfidenceThreshold: 0.6,
            },
        };
    }
    /**
     * Execute a research coordination task
     */
    async executeTask(task) {
        this.logger.info('Research Coordinator executing task', {
            agentId: this.id,
            taskType: task.type,
            taskId: task.id,
        });
        try {
            switch (task.type) {
                case 'extract-unknowns':
                    return await this.extractUnknowns(task);
                case 'spawn-research':
                    return await this.spawnResearch(task);
                case 'consolidate-findings':
                    return await this.consolidateFindings(task);
                case 'generate-document':
                    return await this.generateDocument(task);
                case 'track-research':
                    return await this.trackResearch(task);
                default:
                    return await this.performGeneralCoordination(task);
            }
        }
        catch (error) {
            this.logger.error('Research coordination task failed', {
                agentId: this.id,
                taskId: task.id,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    /**
     * Extract unknown items from specification content
     */
    async extractUnknowns(task) {
        const content = task.input?.content;
        const source = task.input?.source || 'unknown';
        const patterns = task.parameters?.patterns || [
            /\[NEEDS CLARIFICATION\]/gi,
            /\[TBD\]/gi,
            /\[TODO\]/gi,
            /\[UNKNOWN\]/gi,
            /\?{2,}/g,
            /need(?:s)?\s+(?:more\s+)?(?:information|clarification|research)/gi,
        ];
        this.logger.info('Extracting unknown items', { source });
        const extracted = [];
        if (typeof content === 'string') {
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                for (const pattern of patterns) {
                    pattern.lastIndex = 0; // Reset regex state
                    const matches = line.match(pattern);
                    if (matches) {
                        const contextStart = Math.max(0, i - 2);
                        const contextEnd = Math.min(lines.length, i + 3);
                        const context = lines.slice(contextStart, contextEnd).join('\n');
                        const item = {
                            id: `unknown-${Date.now()}-${extracted.length}`,
                            source,
                            sourceLocation: `line ${i + 1}`,
                            question: this.extractQuestion(line, context),
                            context,
                            priority: this.determinePriority(line, context),
                            category: this.categorizeUnknown(line, context),
                            extractedAt: new Date(),
                            status: 'pending',
                        };
                        extracted.push(item);
                        this.unknownItems.set(item.id, item);
                    }
                }
            }
        }
        else if (Array.isArray(content)) {
            // Handle structured content
            for (const item of content) {
                if (item.needsClarification || item.unknown) {
                    const unknown = {
                        id: `unknown-${Date.now()}-${extracted.length}`,
                        source,
                        sourceLocation: item.location || 'unknown',
                        question: item.question || item.description || 'Needs clarification',
                        context: JSON.stringify(item),
                        priority: item.priority || 'medium',
                        category: item.category || 'other',
                        extractedAt: new Date(),
                        status: 'pending',
                    };
                    extracted.push(unknown);
                    this.unknownItems.set(unknown.id, unknown);
                }
            }
        }
        await this.memory.store(`unknowns:${task.id.id}:extracted`, {
            source,
            count: extracted.length,
            items: extracted,
        }, {
            type: 'extracted-unknowns',
            tags: ['research', 'unknowns', source],
            partition: 'research',
        });
        return {
            extracted: extracted.length,
            items: extracted,
            byPriority: {
                high: extracted.filter(i => i.priority === 'high').length,
                medium: extracted.filter(i => i.priority === 'medium').length,
                low: extracted.filter(i => i.priority === 'low').length,
            },
            byCategory: this.groupByCategory(extracted),
        };
    }
    /**
     * Spawn research tasks for unknown items
     */
    async spawnResearch(task) {
        const itemIds = task.input?.itemIds || Array.from(this.unknownItems.keys());
        const maxConcurrent = task.parameters?.maxConcurrent || 5;
        const autoAssign = task.parameters?.autoAssign ?? true;
        this.logger.info('Spawning research tasks', {
            itemCount: itemIds.length,
            maxConcurrent,
        });
        const spawnedTasks = [];
        for (const itemId of itemIds.slice(0, maxConcurrent)) {
            const item = this.unknownItems.get(itemId);
            if (!item || item.status !== 'pending')
                continue;
            const researchTask = {
                id: `research-${Date.now()}-${spawnedTasks.length}`,
                unknownItemId: itemId,
                question: item.question,
                searchTerms: this.generateSearchTerms(item),
                sources: this.determineSources(item),
                status: 'pending',
                createdAt: new Date(),
            };
            spawnedTasks.push(researchTask);
            this.researchTasks.set(researchTask.id, researchTask);
            // Update item status
            item.status = 'researching';
            this.unknownItems.set(itemId, item);
            // Emit task spawn event
            this.eventBus.emit('research:task-spawned', {
                taskId: researchTask.id,
                question: researchTask.question,
                coordinatorId: this.id,
            });
        }
        await this.memory.store(`research:${task.id.id}:spawned`, {
            taskCount: spawnedTasks.length,
            tasks: spawnedTasks.map(t => ({
                id: t.id,
                question: t.question,
                searchTerms: t.searchTerms,
            })),
        }, {
            type: 'spawned-research',
            tags: ['research', 'tasks'],
            partition: 'research',
        });
        return {
            spawned: spawnedTasks.length,
            tasks: spawnedTasks,
            remaining: itemIds.length - spawnedTasks.length,
        };
    }
    /**
     * Consolidate findings from research tasks
     */
    async consolidateFindings(task) {
        const taskIds = task.input?.taskIds || Array.from(this.researchTasks.keys());
        const minConfidence = task.parameters?.minConfidence || 0.6;
        this.logger.info('Consolidating research findings', {
            taskCount: taskIds.length,
        });
        const consolidated = [];
        for (const taskId of taskIds) {
            const researchTask = this.researchTasks.get(taskId);
            if (!researchTask || researchTask.status !== 'completed')
                continue;
            const findings = researchTask.findings || [];
            const relevantFindings = findings.filter(f => f.confidence >= minConfidence);
            // Synthesize answer from findings
            const answer = this.synthesizeAnswer(relevantFindings);
            const avgConfidence = relevantFindings.length > 0
                ? relevantFindings.reduce((sum, f) => sum + f.confidence, 0) / relevantFindings.length
                : 0;
            const result = {
                unknownItemId: researchTask.unknownItemId,
                question: researchTask.question,
                answer,
                confidence: avgConfidence,
                findings: relevantFindings,
                sources: [...new Set(relevantFindings.map(f => f.source))],
                recommendations: this.generateRecommendations(researchTask, relevantFindings),
                unresolved: avgConfidence < minConfidence,
                researchedAt: new Date(),
            };
            consolidated.push(result);
            this.results.set(researchTask.unknownItemId, result);
            // Update unknown item status
            const item = this.unknownItems.get(researchTask.unknownItemId);
            if (item) {
                item.status = result.unresolved ? 'unresolved' : 'completed';
                this.unknownItems.set(researchTask.unknownItemId, item);
            }
        }
        await this.memory.store(`findings:${task.id.id}:consolidated`, {
            count: consolidated.length,
            resolved: consolidated.filter(r => !r.unresolved).length,
            unresolved: consolidated.filter(r => r.unresolved).length,
            results: consolidated,
        }, {
            type: 'consolidated-findings',
            tags: ['research', 'findings'],
            partition: 'research',
        });
        return {
            consolidated: consolidated.length,
            results: consolidated,
            resolved: consolidated.filter(r => !r.unresolved).length,
            unresolved: consolidated.filter(r => r.unresolved).length,
            averageConfidence: consolidated.length > 0
                ? consolidated.reduce((sum, r) => sum + r.confidence, 0) / consolidated.length
                : 0,
        };
    }
    /**
     * Generate research documentation
     */
    async generateDocument(task) {
        const title = task.parameters?.title || 'Research Findings';
        const includeUnresolved = task.parameters?.includeUnresolved ?? true;
        this.logger.info('Generating research document', { title });
        let items = Array.from(this.results.values());
        if (!includeUnresolved) {
            items = items.filter(r => !r.unresolved);
        }
        // Sort by priority (high priority items first)
        items.sort((a, b) => {
            const itemA = this.unknownItems.get(a.unknownItemId);
            const itemB = this.unknownItems.get(b.unknownItemId);
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return (priorityOrder[itemA?.priority || 'low'] || 2) -
                (priorityOrder[itemB?.priority || 'low'] || 2);
        });
        const resolved = items.filter(r => !r.unresolved).length;
        const unresolved = items.filter(r => r.unresolved).length;
        // Calculate category statistics
        const byCategory = {};
        for (const result of items) {
            const item = this.unknownItems.get(result.unknownItemId);
            const category = item?.category || 'other';
            byCategory[category] = (byCategory[category] || 0) + 1;
        }
        const document = {
            title,
            generatedAt: new Date(),
            summary: this.generateSummary(items, resolved, unresolved),
            items,
            statistics: {
                total: items.length,
                resolved,
                unresolved,
                byCategory,
                averageConfidence: items.length > 0
                    ? items.reduce((sum, r) => sum + r.confidence, 0) / items.length
                    : 0,
            },
        };
        // Generate markdown content
        const markdown = this.generateMarkdown(document);
        await this.memory.store(`document:${task.id.id}:research`, {
            document,
            markdown,
        }, {
            type: 'research-document',
            tags: ['research', 'documentation'],
            partition: 'research',
        });
        return document;
    }
    /**
     * Track research progress
     */
    async trackResearch(task) {
        this.logger.info('Tracking research progress');
        const unknowns = Array.from(this.unknownItems.values());
        const tasks = Array.from(this.researchTasks.values());
        const results = Array.from(this.results.values());
        const progress = {
            unknownItems: {
                total: unknowns.length,
                pending: unknowns.filter(i => i.status === 'pending').length,
                researching: unknowns.filter(i => i.status === 'researching').length,
                completed: unknowns.filter(i => i.status === 'completed').length,
                unresolved: unknowns.filter(i => i.status === 'unresolved').length,
            },
            researchTasks: {
                total: tasks.length,
                pending: tasks.filter(t => t.status === 'pending').length,
                inProgress: tasks.filter(t => t.status === 'in-progress').length,
                completed: tasks.filter(t => t.status === 'completed').length,
                failed: tasks.filter(t => t.status === 'failed').length,
            },
            results: {
                total: results.length,
                resolved: results.filter(r => !r.unresolved).length,
                unresolved: results.filter(r => r.unresolved).length,
                averageConfidence: results.length > 0
                    ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length
                    : 0,
            },
            overallProgress: unknowns.length > 0
                ? ((unknowns.filter(i => i.status === 'completed').length / unknowns.length) * 100)
                : 100,
        };
        return progress;
    }
    /**
     * Perform general research coordination
     */
    async performGeneralCoordination(task) {
        // Run extraction if content provided
        if (task.input?.content) {
            await this.extractUnknowns({
                ...task,
                type: 'extract-unknowns',
            });
        }
        // Spawn research for pending items
        const pendingItems = Array.from(this.unknownItems.values())
            .filter(i => i.status === 'pending');
        if (pendingItems.length > 0) {
            await this.spawnResearch({
                ...task,
                type: 'spawn-research',
                input: { itemIds: pendingItems.map(i => i.id) },
            });
        }
        // Track progress
        const progress = await this.trackResearch({
            ...task,
            type: 'track-research',
        });
        return {
            progress,
            actions: {
                extracted: this.unknownItems.size,
                tasksSpawned: this.researchTasks.size,
                resultsConsolidated: this.results.size,
            },
        };
    }
    /**
     * Extract question from line and context
     */
    extractQuestion(line, context) {
        // Remove markers
        let question = line
            .replace(/\[NEEDS CLARIFICATION\]/gi, '')
            .replace(/\[TBD\]/gi, '')
            .replace(/\[TODO\]/gi, '')
            .replace(/\[UNKNOWN\]/gi, '')
            .replace(/\?{2,}/g, '?')
            .trim();
        // If empty, use context
        if (!question || question.length < 10) {
            question = context.split('\n')[0].substring(0, 200);
        }
        // Ensure it ends with ?
        if (!question.endsWith('?')) {
            question += '?';
        }
        return question;
    }
    /**
     * Determine priority of unknown item
     */
    determinePriority(line, context) {
        const highPriorityTerms = ['critical', 'blocker', 'urgent', 'security', 'must'];
        const lowPriorityTerms = ['nice to have', 'optional', 'future', 'later'];
        const combined = (line + context).toLowerCase();
        if (highPriorityTerms.some(term => combined.includes(term))) {
            return 'high';
        }
        if (lowPriorityTerms.some(term => combined.includes(term))) {
            return 'low';
        }
        return 'medium';
    }
    /**
     * Categorize unknown item
     */
    categorizeUnknown(line, context) {
        const combined = (line + context).toLowerCase();
        if (combined.match(/api|endpoint|database|server|architecture/)) {
            return 'technical';
        }
        if (combined.match(/requirement|stakeholder|user|customer|business/)) {
            return 'business';
        }
        if (combined.match(/workflow|process|step|procedure/)) {
            return 'process';
        }
        if (combined.match(/domain|industry|regulation|compliance/)) {
            return 'domain';
        }
        return 'other';
    }
    /**
     * Group items by category
     */
    groupByCategory(items) {
        const grouped = {};
        for (const item of items) {
            grouped[item.category] = (grouped[item.category] || 0) + 1;
        }
        return grouped;
    }
    /**
     * Generate search terms for research
     */
    generateSearchTerms(item) {
        const terms = [];
        // Extract key words from question
        const words = item.question
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 3);
        terms.push(...words.slice(0, 5));
        // Add category-specific terms
        if (item.category === 'technical') {
            terms.push('implementation', 'technical');
        }
        else if (item.category === 'business') {
            terms.push('requirements', 'business');
        }
        return [...new Set(terms)];
    }
    /**
     * Determine sources to search
     */
    determineSources(item) {
        const sources = ['internal'];
        if (item.category === 'technical') {
            sources.push('documentation', 'codebase');
        }
        if (item.category === 'domain' || item.category === 'business') {
            sources.push('web', 'documentation');
        }
        return sources;
    }
    /**
     * Synthesize answer from findings
     */
    synthesizeAnswer(findings) {
        if (findings.length === 0) {
            return 'No relevant findings available.';
        }
        // Sort by relevance and confidence
        const sorted = findings.sort((a, b) => (b.relevance * b.confidence) - (a.relevance * a.confidence));
        // Combine top findings
        const topFindings = sorted.slice(0, 3);
        const answer = topFindings
            .map(f => f.content)
            .join('\n\n');
        return answer || 'Findings inconclusive.';
    }
    /**
     * Generate recommendations from research
     */
    generateRecommendations(task, findings) {
        const recommendations = [];
        if (findings.length === 0) {
            recommendations.push('Conduct additional research with different search terms');
            recommendations.push('Consult domain experts for clarification');
        }
        else if (findings.length < 3) {
            recommendations.push('Consider gathering more sources for confidence');
        }
        const avgConfidence = findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length;
        if (avgConfidence < 0.7) {
            recommendations.push('Validate findings with stakeholders');
        }
        return recommendations;
    }
    /**
     * Generate summary for document
     */
    generateSummary(items, resolved, unresolved) {
        const total = items.length;
        const percentage = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0';
        return `This document contains ${total} research findings. ` +
            `${resolved} items (${percentage}%) have been resolved, ` +
            `${unresolved} items remain unresolved.`;
    }
    /**
     * Generate markdown document
     */
    generateMarkdown(document) {
        const lines = [
            `# ${document.title}`,
            '',
            `*Generated: ${document.generatedAt.toISOString()}*`,
            '',
            '## Summary',
            '',
            document.summary,
            '',
            '## Statistics',
            '',
            `- Total Items: ${document.statistics.total}`,
            `- Resolved: ${document.statistics.resolved}`,
            `- Unresolved: ${document.statistics.unresolved}`,
            `- Average Confidence: ${(document.statistics.averageConfidence * 100).toFixed(1)}%`,
            '',
            '### By Category',
            '',
        ];
        for (const [category, count] of Object.entries(document.statistics.byCategory)) {
            lines.push(`- ${category}: ${count}`);
        }
        lines.push('', '## Research Items', '');
        for (const item of document.items) {
            lines.push(`### ${item.question}`, '', `**Status:** ${item.unresolved ? 'Unresolved' : 'Resolved'}`, `**Confidence:** ${(item.confidence * 100).toFixed(1)}%`, '', '**Answer:**', '', item.answer, '', '**Sources:**', '', ...item.sources.map(s => `- ${s}`), '');
            if (item.recommendations.length > 0) {
                lines.push('**Recommendations:**', '', ...item.recommendations.map(r => `- ${r}`), '');
            }
        }
        return lines.join('\n');
    }
    /**
     * Setup research-specific events
     */
    setupResearchEvents() {
        this.eventBus.on('research:finding-received', (data) => {
            const task = this.researchTasks.get(data.taskId);
            if (task) {
                task.findings = task.findings || [];
                task.findings.push(data.finding);
                this.researchTasks.set(data.taskId, task);
            }
        });
        this.eventBus.on('research:task-completed', (data) => {
            const task = this.researchTasks.get(data.taskId);
            if (task) {
                task.status = 'completed';
                task.completedAt = new Date();
                this.researchTasks.set(data.taskId, task);
            }
        });
    }
    /**
     * Get agent status with research-specific information
     */
    getAgentStatus() {
        return {
            ...super.getAgentStatus(),
            specialization: 'Research Coordination',
            unknownItems: this.unknownItems.size,
            activeResearchTasks: Array.from(this.researchTasks.values())
                .filter(t => t.status === 'in-progress').length,
            completedResults: this.results.size,
            capabilities: [
                'extract-unknowns',
                'spawn-research',
                'consolidate-findings',
            ],
        };
    }
}
exports.ResearchCoordinatorAgent = ResearchCoordinatorAgent;
/**
 * Factory function to create a Research Coordinator Agent
 */
const createResearchCoordinatorAgent = (id, config, environment, logger, eventBus, memory) => {
    const defaultConfig = {
        autonomyLevel: 0.85,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 40,
        maxConcurrentTasks: 5,
        timeoutThreshold: 900000,
        reportingInterval: 30000,
        heartbeatInterval: 10000,
        permissions: ['file-read', 'file-write', 'web-search', 'memory-access', 'task-spawn'],
        trustedAgents: [],
        expertise: {
            'research-coordination': 0.95,
            'information-extraction': 0.92,
        },
        preferences: {
            autoSpawnResearch: true,
            parallelResearch: true,
        },
    };
    const defaultEnv = {
        runtime: 'node',
        version: '20.0.0',
        workingDirectory: './agents/research-coordinator',
        tempDirectory: './tmp/research-coordinator',
        logDirectory: './logs/research-coordinator',
        apiEndpoints: {},
        credentials: {},
        availableTools: ['extract-unknowns', 'spawn-research', 'consolidate-findings'],
        toolConfigs: {},
    };
    return new ResearchCoordinatorAgent(id, { ...defaultConfig, ...config }, { ...defaultEnv, ...environment }, logger, eventBus, memory);
};
exports.createResearchCoordinatorAgent = createResearchCoordinatorAgent;
//# sourceMappingURL=research-coordinator.js.map