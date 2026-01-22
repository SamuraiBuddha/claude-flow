"use strict";
/**
 * Task Parser
 *
 * Parses tasks.md files into structured TaskList objects with dependencies.
 * Handles the spec-kit template format with phases, user stories, and parallel markers.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskParser = void 0;
exports.parseTasks = parseTasks;
const crypto = __importStar(require("crypto"));
/**
 * Parser for tasks.md task list files
 */
class TaskParser {
    errors = [];
    warnings = [];
    taskIdMap = new Map();
    /**
     * Parse a tasks.md file content into a TaskList
     */
    parse(content, filePath) {
        this.reset();
        try {
            const sections = this.parseMarkdownSections(content);
            const metadata = this.parseHeader(content);
            // Parse phases
            const phases = this.parsePhases(sections);
            // Extract all tasks from phases
            const tasks = phases.flatMap((phase) => phase.tasks);
            // Build dependency graph
            const { dependencies, dependencyGraph } = this.buildDependencyGraph(tasks, sections);
            // Parse execution strategy
            const executionStrategy = this.parseExecutionStrategy(sections);
            // Determine MVP scope
            const mvpScope = this.determineMvpScope(tasks, phases);
            // Generate ID and hash
            const id = this.generateId(filePath, metadata.featureName);
            const hash = this.generateHash(content);
            const taskList = {
                id,
                type: 'task-list',
                path: filePath,
                name: `Tasks: ${metadata.featureName}`,
                createdAt: new Date(),
                updatedAt: new Date(),
                hash,
                metadata: {},
                planId: metadata.planId || '',
                specId: metadata.specId || '',
                featureName: metadata.featureName,
                version: '1.0.0',
                inputDocs: metadata.inputDocs,
                tasks,
                phases,
                dependencyGraph,
                dependencies,
                mvpScope,
                executionStrategy,
            };
            this.validateTaskList(taskList);
            return {
                success: this.errors.length === 0,
                data: taskList,
                errors: this.errors,
                warnings: this.warnings,
            };
        }
        catch (error) {
            this.errors.push({
                message: `Failed to parse tasks: ${error instanceof Error ? error.message : String(error)}`,
                code: 'PARSE_FAILED',
            });
            return {
                success: false,
                errors: this.errors,
                warnings: this.warnings,
            };
        }
    }
    /**
     * Reset parser state
     */
    reset() {
        this.errors = [];
        this.warnings = [];
        this.taskIdMap = new Map();
    }
    /**
     * Parse header metadata from tasks file
     */
    parseHeader(content) {
        let featureName = 'Unknown Feature';
        let planId = '';
        let specId = '';
        const inputDocs = [];
        const lines = content.split('\n');
        for (let i = 0; i < Math.min(lines.length, 20); i++) {
            const line = lines[i];
            // Feature name from title
            const titleMatch = line.match(/^#\s+Tasks:\s*(.+)/i);
            if (titleMatch) {
                featureName = titleMatch[1].trim();
            }
            // Input documents
            const inputMatch = line.match(/\*\*Input\*\*:\s*(.+)/i);
            if (inputMatch) {
                const paths = inputMatch[1].match(/`([^`]+)`/g);
                if (paths) {
                    inputDocs.push(...paths.map((p) => p.replace(/`/g, '')));
                }
            }
            // Prerequisites
            const prereqMatch = line.match(/\*\*Prerequisites\*\*:\s*(.+)/i);
            if (prereqMatch) {
                const paths = prereqMatch[1].match(/[a-zA-Z-]+\.md/g);
                if (paths) {
                    inputDocs.push(...paths);
                }
            }
        }
        // Try to extract IDs from input docs
        for (const doc of inputDocs) {
            if (doc.includes('plan')) {
                planId = this.generateId(doc, '');
            }
            if (doc.includes('spec')) {
                specId = this.generateId(doc, '');
            }
        }
        return { featureName, planId, specId, inputDocs };
    }
    /**
     * Parse task phases from sections
     */
    parsePhases(sections) {
        const phases = [];
        const phaseSections = this.findAllSections(sections, /Phase\s*\d+/i);
        for (let i = 0; i < phaseSections.length; i++) {
            const section = phaseSections[i];
            const phase = this.parsePhase(section, i);
            if (phase) {
                phases.push(phase);
            }
        }
        // If no explicit phases found, try to parse tasks from the whole document
        if (phases.length === 0) {
            const defaultPhase = this.createDefaultPhase(sections);
            if (defaultPhase) {
                phases.push(defaultPhase);
            }
        }
        return phases;
    }
    /**
     * Parse a single phase section
     */
    parsePhase(section, index) {
        // Extract phase number and name
        const phaseMatch = section.title.match(/Phase\s*(\d+)[:\s]*(.+)?/i);
        const phaseNum = phaseMatch ? parseInt(phaseMatch[1]) : index + 1;
        const phaseName = phaseMatch?.[2]?.trim() || section.title;
        // Check for user story reference
        const userStoryMatch = section.title.match(/User Story\s*(\d+)/i);
        const userStory = userStoryMatch ? `US${userStoryMatch[1]}` : undefined;
        // Extract priority
        const priorityMatch = section.title.match(/\(Priority:\s*(P[1-5])\)/i);
        const priority = priorityMatch ? priorityMatch[1].toUpperCase() : undefined;
        // Extract purpose
        let purpose = '';
        const purposeMatch = section.content.match(/\*\*Purpose\*\*:\s*(.+?)(?=\n\n|\n\*\*|$)/is);
        if (purposeMatch) {
            purpose = purposeMatch[1].trim();
        }
        // Extract checkpoint
        let checkpoint;
        const checkpointMatch = section.content.match(/\*\*Checkpoint\*\*:\s*(.+?)(?=\n\n|\n-|$)/is);
        if (checkpointMatch) {
            checkpoint = checkpointMatch[1].trim();
        }
        // Parse tasks in this phase
        const tasks = this.parseTasksFromContent(section.content, userStory);
        // Also parse tasks from child sections
        for (const child of section.children) {
            const childTasks = this.parseTasksFromContent(child.content, userStory);
            tasks.push(...childTasks);
        }
        if (tasks.length === 0) {
            return null;
        }
        return {
            id: `phase-${phaseNum}`,
            phaseId: `phase-${phaseNum}`,
            name: phaseName,
            number: phaseNum,
            purpose,
            userStory,
            priority,
            tasks,
            checkpoint,
        };
    }
    /**
     * Create a default phase from all tasks in document
     */
    createDefaultPhase(sections) {
        const tasks = [];
        for (const section of sections) {
            const sectionTasks = this.parseTasksFromContent(section.content);
            tasks.push(...sectionTasks);
        }
        if (tasks.length === 0) {
            return null;
        }
        return {
            id: 'phase-1',
            phaseId: 'phase-1',
            name: 'Default Phase',
            number: 1,
            purpose: 'All tasks',
            tasks,
        };
    }
    /**
     * Parse tasks from markdown content
     */
    parseTasksFromContent(content, defaultUserStory) {
        const tasks = [];
        const lines = content.split('\n');
        for (const line of lines) {
            const task = this.parseTaskLine(line, defaultUserStory);
            if (task) {
                tasks.push(task);
                this.taskIdMap.set(task.taskId, task);
            }
        }
        return tasks;
    }
    /**
     * Parse a single task line
     * Format: "- [ ] T001 [P] [US1] Description in src/path/file.ts"
     */
    parseTaskLine(line, defaultUserStory) {
        // Match checkbox tasks
        // Format: "- [ ] T001 [P] [US1] Description"
        const taskMatch = line.match(/^-\s*\[([xX ])\]\s*(T\d+)\s*(\[P\])?\s*(?:\[([^\]]+)\])?\s*(.+)/);
        if (!taskMatch) {
            return null;
        }
        const completed = taskMatch[1].toLowerCase() === 'x';
        const taskId = taskMatch[2];
        const parallel = !!taskMatch[3];
        const userStoryOrTag = taskMatch[4];
        let description = taskMatch[5].trim();
        // Determine user story
        let userStory = defaultUserStory;
        if (userStoryOrTag && userStoryOrTag.match(/^US\d+$/i)) {
            userStory = userStoryOrTag.toUpperCase();
        }
        // Extract file path if present
        let filePath;
        const pathMatch = description.match(/(?:in|at)\s+([a-zA-Z0-9_\-./]+\.[a-zA-Z]+)/i);
        if (pathMatch) {
            filePath = pathMatch[1];
        }
        // Also check for paths at end
        const endPathMatch = description.match(/([a-zA-Z0-9_\-./]+\/[a-zA-Z0-9_\-./]+\.[a-zA-Z]+)$/);
        if (endPathMatch && !filePath) {
            filePath = endPathMatch[1];
        }
        // Determine task type
        const type = this.inferTaskType(description, filePath);
        // Extract dependencies from description (e.g., "depends on T001, T002")
        const dependencies = [];
        const depMatch = description.match(/(?:depends on|after|requires)\s+(T\d+(?:\s*,\s*T\d+)*)/i);
        if (depMatch) {
            const depIds = depMatch[1].match(/T\d+/g);
            if (depIds) {
                dependencies.push(...depIds);
            }
            description = description.replace(depMatch[0], '').trim();
        }
        return {
            taskId,
            id: taskId,
            description,
            type,
            parallelizable: parallel,
            parallel,
            dependencies,
            filePaths: filePath ? [filePath] : [],
            filePath,
            acceptanceCriteria: [],
            testScenarios: [],
            status: completed ? 'completed' : 'pending',
            userStory,
            completed,
        };
    }
    /**
     * Infer task type from description and file path
     */
    inferTaskType(description, filePath) {
        const lower = description.toLowerCase();
        // Test-related
        if (lower.includes('test') || filePath?.includes('test')) {
            if (lower.includes('contract'))
                return 'test';
            if (lower.includes('integration'))
                return 'integration';
            return 'testing';
        }
        // Setup/Infrastructure
        if (lower.includes('setup') || lower.includes('initialize') || lower.includes('create project')) {
            return 'setup';
        }
        if (lower.includes('infrastructure') || lower.includes('configure') || lower.includes('framework')) {
            return 'infrastructure';
        }
        // Models
        if (lower.includes('model') || lower.includes('entity') || lower.includes('schema')) {
            return 'model';
        }
        // Services
        if (lower.includes('service') || lower.includes('implement')) {
            return 'service';
        }
        // Endpoints/API
        if (lower.includes('endpoint') || lower.includes('api') || lower.includes('route')) {
            return 'endpoint';
        }
        // Documentation
        if (lower.includes('document') || lower.includes('readme') || filePath?.includes('doc')) {
            return 'documentation';
        }
        // Validation
        if (lower.includes('validat') || lower.includes('verify')) {
            return 'validation';
        }
        // Refactoring
        if (lower.includes('refactor') || lower.includes('cleanup') || lower.includes('optimize')) {
            return 'refactoring';
        }
        // Default to coding
        return 'coding';
    }
    /**
     * Build dependency graph from tasks
     */
    buildDependencyGraph(tasks, sections) {
        const dependencies = [];
        const dependencyGraph = [];
        // First, collect explicit dependencies from task lines
        for (const task of tasks) {
            if (task.dependencies.length > 0) {
                dependencies.push({
                    taskId: task.taskId,
                    dependsOn: task.dependencies,
                });
                for (const dep of task.dependencies) {
                    dependencyGraph.push({ from: dep, to: task.taskId });
                }
            }
        }
        // Parse dependency section if exists
        const depSection = this.findSection(sections, /Dependencies|Execution Order/i);
        if (depSection) {
            const additionalDeps = this.parseDependencySection(depSection.content);
            for (const dep of additionalDeps) {
                // Check if we already have this dependency
                const existing = dependencies.find((d) => d.taskId === dep.taskId);
                if (existing) {
                    existing.dependsOn = [...new Set([...existing.dependsOn, ...dep.dependsOn])];
                }
                else {
                    dependencies.push(dep);
                }
                for (const depId of dep.dependsOn) {
                    const edgeExists = dependencyGraph.some((e) => e.from === depId && e.to === dep.taskId);
                    if (!edgeExists) {
                        dependencyGraph.push({ from: depId, to: dep.taskId });
                    }
                }
            }
        }
        // Infer dependencies based on phase ordering
        this.inferPhaseDependencies(tasks, dependencies, dependencyGraph);
        return { dependencies, dependencyGraph };
    }
    /**
     * Parse dependency section content
     */
    parseDependencySection(content) {
        const dependencies = [];
        // Parse patterns like "T005 depends on T001, T002"
        const depPattern = /(T\d+)\s*(?:depends on|requires|after|->)\s*(T\d+(?:\s*,\s*T\d+)*)/gi;
        let match;
        while ((match = depPattern.exec(content)) !== null) {
            const taskId = match[1];
            const depIds = match[2].match(/T\d+/g) || [];
            dependencies.push({
                taskId,
                dependsOn: depIds,
            });
        }
        return dependencies;
    }
    /**
     * Infer dependencies based on phase structure
     */
    inferPhaseDependencies(tasks, dependencies, dependencyGraph) {
        // Non-parallel tasks in sequence depend on previous task
        let lastNonParallelTask = null;
        for (const task of tasks) {
            if (!task.parallelizable && lastNonParallelTask) {
                // Check if dependency already exists
                const hasExplicitDep = task.dependencies.includes(lastNonParallelTask.taskId);
                if (!hasExplicitDep) {
                    // Add implicit dependency
                    const existing = dependencies.find((d) => d.taskId === task.taskId);
                    if (existing) {
                        if (!existing.dependsOn.includes(lastNonParallelTask.taskId)) {
                            existing.dependsOn.push(lastNonParallelTask.taskId);
                        }
                    }
                    else {
                        dependencies.push({
                            taskId: task.taskId,
                            dependsOn: [lastNonParallelTask.taskId],
                            description: 'Implicit sequential dependency',
                        });
                    }
                    const edgeExists = dependencyGraph.some((e) => e.from === lastNonParallelTask.taskId && e.to === task.taskId);
                    if (!edgeExists) {
                        dependencyGraph.push({
                            from: lastNonParallelTask.taskId,
                            to: task.taskId,
                        });
                    }
                }
            }
            if (!task.parallelizable) {
                lastNonParallelTask = task;
            }
        }
    }
    /**
     * Parse execution strategy from sections
     */
    parseExecutionStrategy(sections) {
        const strategy = {
            approach: 'mvp-first',
            description: '',
            phases: [],
        };
        const stratSection = this.findSection(sections, /Implementation Strategy|Execution/i);
        if (!stratSection) {
            return strategy;
        }
        // Detect approach
        const content = stratSection.content.toLowerCase();
        if (content.includes('parallel team')) {
            strategy.approach = 'parallel-team';
            strategy.description = 'Multiple developers working on different user stories in parallel';
        }
        else if (content.includes('incremental')) {
            strategy.approach = 'incremental';
            strategy.description = 'Deliver user stories one at a time, each independently testable';
        }
        else {
            strategy.approach = 'mvp-first';
            strategy.description = 'Complete MVP (User Story 1) first, then expand';
        }
        // Extract phase names
        const phaseMatches = stratSection.content.match(/Phase\s*\d+[:\s]+[^\n]+/gi);
        if (phaseMatches) {
            strategy.phases = phaseMatches.map((p) => p.trim());
        }
        return strategy;
    }
    /**
     * Determine MVP scope based on tasks and phases
     */
    determineMvpScope(tasks, phases) {
        const mvpTasks = [];
        // MVP typically includes:
        // 1. All setup/foundational tasks
        // 2. User Story 1 tasks (P1 priority)
        for (const task of tasks) {
            const isSetup = task.type === 'setup' || task.type === 'infrastructure';
            const isUS1 = task.userStory === 'US1' || task.priority === 'P1';
            if (isSetup || isUS1) {
                mvpTasks.push(task.taskId);
            }
        }
        // If no US1 tasks found, include first phase non-setup tasks
        if (mvpTasks.filter((t) => !this.taskIdMap.get(t)?.type?.includes('setup')).length === 0) {
            const firstPhase = phases[0];
            if (firstPhase) {
                for (const task of firstPhase.tasks.slice(0, 5)) {
                    if (!mvpTasks.includes(task.taskId)) {
                        mvpTasks.push(task.taskId);
                    }
                }
            }
        }
        return mvpTasks;
    }
    /**
     * Parse markdown into sections
     */
    parseMarkdownSections(content) {
        const sections = [];
        const lines = content.split('\n');
        const stack = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
            if (headerMatch) {
                const level = headerMatch[1].length;
                const title = headerMatch[2].trim();
                let endLine = lines.length - 1;
                for (let j = i + 1; j < lines.length; j++) {
                    const nextHeaderMatch = lines[j].match(/^(#{1,6})\s+/);
                    if (nextHeaderMatch && nextHeaderMatch[1].length <= level) {
                        endLine = j - 1;
                        break;
                    }
                }
                const contentLines = lines.slice(i + 1, endLine + 1);
                const sectionContent = contentLines.join('\n').trim();
                const section = {
                    level,
                    title,
                    content: sectionContent,
                    children: [],
                    lineStart: i,
                    lineEnd: endLine,
                };
                while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                    stack.pop();
                }
                if (stack.length === 0) {
                    sections.push(section);
                }
                else {
                    stack[stack.length - 1].children.push(section);
                }
                stack.push(section);
            }
        }
        return sections;
    }
    /**
     * Find a section by title pattern
     */
    findSection(sections, titlePattern) {
        const pattern = typeof titlePattern === 'string'
            ? new RegExp(titlePattern, 'i')
            : titlePattern;
        for (const section of sections) {
            if (pattern.test(section.title)) {
                return section;
            }
            const found = this.findSection(section.children, pattern);
            if (found)
                return found;
        }
        return null;
    }
    /**
     * Find all sections matching a pattern
     */
    findAllSections(sections, titlePattern) {
        const pattern = typeof titlePattern === 'string'
            ? new RegExp(titlePattern, 'i')
            : titlePattern;
        const results = [];
        for (const section of sections) {
            if (pattern.test(section.title)) {
                results.push(section);
            }
            results.push(...this.findAllSections(section.children, pattern));
        }
        return results;
    }
    /**
     * Generate unique ID
     */
    generateId(filePath, featureName) {
        const base = featureName || filePath;
        const hash = crypto.createHash('md5').update(base).digest('hex').substring(0, 8);
        return `tasks-${hash}`;
    }
    /**
     * Generate content hash
     */
    generateHash(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }
    /**
     * Validate the parsed task list
     */
    validateTaskList(taskList) {
        // Check for empty task list
        if (taskList.tasks.length === 0) {
            this.warnings.push({
                message: 'No tasks found in document',
                suggestion: 'Add tasks using format: "- [ ] T001 [P] [US1] Description"',
            });
        }
        // Check for circular dependencies
        const visited = new Set();
        const recursionStack = new Set();
        const hasCycle = (taskId) => {
            visited.add(taskId);
            recursionStack.add(taskId);
            const deps = taskList.dependencyGraph.filter((e) => e.from === taskId);
            for (const dep of deps) {
                if (!visited.has(dep.to)) {
                    if (hasCycle(dep.to))
                        return true;
                }
                else if (recursionStack.has(dep.to)) {
                    return true;
                }
            }
            recursionStack.delete(taskId);
            return false;
        };
        for (const task of taskList.tasks) {
            if (!visited.has(task.taskId) && hasCycle(task.taskId)) {
                this.errors.push({
                    message: `Circular dependency detected involving task ${task.taskId}`,
                    code: 'CIRCULAR_DEPENDENCY',
                });
                break;
            }
        }
        // Check for missing dependency targets
        for (const dep of taskList.dependencies || []) {
            for (const depId of dep.dependsOn) {
                if (!this.taskIdMap.has(depId)) {
                    this.warnings.push({
                        message: `Task ${dep.taskId} depends on non-existent task ${depId}`,
                        suggestion: `Verify task ID ${depId} exists or remove the dependency`,
                    });
                }
            }
        }
        // Check for tasks without types
        const untypedTasks = taskList.tasks.filter((t) => !t.type);
        if (untypedTasks.length > 0) {
            this.warnings.push({
                message: `${untypedTasks.length} task(s) have no explicit type`,
                suggestion: 'Consider adding type hints to task descriptions',
            });
        }
    }
    /**
     * Get tasks in topological order (respecting dependencies)
     */
    getTopologicalOrder(taskList) {
        const sorted = [];
        const visited = new Set();
        const temp = new Set();
        const visit = (taskId) => {
            if (temp.has(taskId)) {
                throw new Error(`Circular dependency detected at ${taskId}`);
            }
            if (visited.has(taskId))
                return;
            temp.add(taskId);
            // Visit dependencies first
            const task = this.taskIdMap.get(taskId);
            if (task) {
                for (const dep of task.dependencies) {
                    visit(dep);
                }
            }
            temp.delete(taskId);
            visited.add(taskId);
            if (task) {
                sorted.push(task);
            }
        };
        for (const task of taskList.tasks) {
            if (!visited.has(task.taskId)) {
                visit(task.taskId);
            }
        }
        return sorted;
    }
    /**
     * Get tasks that can be executed in parallel
     */
    getParallelGroups(taskList) {
        const groups = [];
        const completed = new Set();
        while (completed.size < taskList.tasks.length) {
            const currentGroup = [];
            for (const task of taskList.tasks) {
                if (completed.has(task.taskId))
                    continue;
                // Check if all dependencies are completed
                const depsComplete = task.dependencies.every((d) => completed.has(d));
                // Check if task is parallelizable or has no incomplete deps
                if (depsComplete && (task.parallelizable || currentGroup.length === 0)) {
                    currentGroup.push(task);
                }
            }
            if (currentGroup.length === 0) {
                // No progress possible - might be circular deps
                break;
            }
            groups.push(currentGroup);
            for (const task of currentGroup) {
                completed.add(task.taskId);
            }
        }
        return groups;
    }
}
exports.TaskParser = TaskParser;
/**
 * Convenience function to parse a tasks file
 */
function parseTasks(content, filePath) {
    const parser = new TaskParser();
    return parser.parse(content, filePath);
}
exports.default = TaskParser;
//# sourceMappingURL=task-parser.js.map