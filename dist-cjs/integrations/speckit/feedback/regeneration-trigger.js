"use strict";
/**
 * RegenerationTrigger - Monitor for spec changes and cascade regeneration
 *
 * Handles spec -> plan -> tasks cascade with customization preservation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegenerationTrigger = void 0;
const events_1 = require("events");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
/**
 * RegenerationTrigger class for monitoring and cascading spec changes
 */
class RegenerationTrigger extends events_1.EventEmitter {
    config;
    watchedFiles = new Map();
    customizations = new Map();
    activeJobs = new Map();
    jobQueue = [];
    pollTimer;
    debounceTimers = new Map();
    isWatching = false;
    regenerators = new Map();
    constructor(config = {}) {
        super();
        this.config = {
            watchPaths: config.watchPaths || [
                { path: './specs', pattern: '*.spec.yaml', recursive: true, type: 'spec' },
                { path: './specs', pattern: '*.spec.json', recursive: true, type: 'spec' },
                { path: './plans', pattern: '*.plan.yaml', recursive: true, type: 'plan' },
                { path: './tasks', pattern: '*.task.yaml', recursive: true, type: 'task' },
            ],
            cascade: {
                specToPlans: config.cascade?.specToPlans ?? true,
                plansToTasks: config.cascade?.plansToTasks ?? true,
                preserveCustomizations: config.cascade?.preserveCustomizations ?? true,
                dryRun: config.cascade?.dryRun ?? false,
                maxConcurrentJobs: config.cascade?.maxConcurrentJobs ?? 3,
                debounceMs: config.cascade?.debounceMs ?? 1000,
            },
            outputDir: config.outputDir || './generated',
            customizationsFile: config.customizationsFile || './data/customizations.json',
            pollInterval: config.pollInterval || 5000,
            enableFileWatching: config.enableFileWatching ?? true,
        };
    }
    /**
     * Initialize the regeneration trigger
     */
    async initialize() {
        // Ensure output directory exists
        await promises_1.default.mkdir(this.config.outputDir, { recursive: true });
        // Load existing customizations
        await this.loadCustomizations();
        // Scan initial files
        await this.scanWatchedPaths();
    }
    /**
     * Start watching for spec changes
     */
    async watchSpec(specPath) {
        if (this.isWatching)
            return;
        // If specific path provided, add it to watch paths
        if (specPath) {
            const exists = this.config.watchPaths.some(w => w.path === specPath);
            if (!exists) {
                this.config.watchPaths.push({
                    path: specPath,
                    pattern: '*',
                    recursive: false,
                    type: 'spec',
                });
            }
        }
        // Start polling (more reliable than fs.watch across platforms)
        this.pollTimer = setInterval(async () => {
            try {
                await this.checkForChanges();
            }
            catch (error) {
                this.emit('error', error);
            }
        }, this.config.pollInterval);
        // Process job queue
        this.processJobQueue();
        this.isWatching = true;
    }
    /**
     * Stop watching for changes
     */
    stopWatching() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
        }
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
        this.isWatching = false;
    }
    /**
     * Trigger regeneration manually
     */
    async triggerRegeneration(specPath, options = {}) {
        const cascade = options.cascade ?? this.config.cascade.specToPlans;
        const preserve = options.preserveCustomizations ?? this.config.cascade.preserveCustomizations;
        const dryRun = options.dryRun ?? this.config.cascade.dryRun;
        // Get or create spec file info
        let specFile = this.watchedFiles.get(specPath);
        if (!specFile) {
            specFile = await this.scanFile(specPath);
            this.watchedFiles.set(specPath, specFile);
        }
        // Create job
        const job = {
            id: this.generateId(),
            specPath,
            type: 'spec',
            status: 'pending',
            preservedCustomizations: [],
            cascadedJobs: [],
        };
        // Get customizations to preserve
        if (preserve) {
            job.preservedCustomizations = this.getCustomizationsForPath(specPath);
        }
        // Queue the job
        this.jobQueue.push(job);
        // Process immediately if not many active jobs
        if (this.activeJobs.size < this.config.cascade.maxConcurrentJobs) {
            await this.processNextJob();
        }
        return job;
    }
    /**
     * Cascade updates from spec to plans and tasks
     */
    async cascadeUpdates(sourceJob, options = {}) {
        const cascadedJobIds = [];
        if (!options.skipPlans && this.config.cascade.specToPlans) {
            // Find plans that depend on this spec
            const dependentPlans = await this.findDependentPlans(sourceJob.specPath);
            for (const planPath of dependentPlans) {
                const planJob = {
                    id: this.generateId(),
                    specPath: planPath,
                    type: 'plan',
                    status: 'pending',
                    preservedCustomizations: this.getCustomizationsForPath(planPath),
                    cascadedJobs: [],
                };
                this.jobQueue.push(planJob);
                cascadedJobIds.push(planJob.id);
            }
        }
        if (!options.skipTasks && this.config.cascade.plansToTasks) {
            // Find tasks that depend on plans from this spec
            const dependentTasks = await this.findDependentTasks(sourceJob.specPath);
            for (const taskPath of dependentTasks) {
                const taskJob = {
                    id: this.generateId(),
                    specPath: taskPath,
                    type: 'task',
                    status: 'pending',
                    preservedCustomizations: this.getCustomizationsForPath(taskPath),
                    cascadedJobs: [],
                };
                this.jobQueue.push(taskJob);
                cascadedJobIds.push(taskJob.id);
            }
        }
        if (cascadedJobIds.length > 0) {
            sourceJob.cascadedJobs = cascadedJobIds;
            this.emit('cascade:started', {
                sourceJob: sourceJob.id,
                cascadedJobs: cascadedJobIds,
            });
        }
        return cascadedJobIds;
    }
    /**
     * Register a regenerator function for a specific type
     */
    registerRegenerator(type, regenerator) {
        this.regenerators.set(type, regenerator);
    }
    /**
     * Record a customization to preserve during regeneration
     */
    async recordCustomization(customization) {
        const full = {
            ...customization,
            id: this.generateId(),
            timestamp: new Date(),
        };
        const existing = this.customizations.get(customization.source) || [];
        existing.push(full);
        this.customizations.set(customization.source, existing);
        // Persist customizations
        await this.saveCustomizations();
        return full;
    }
    /**
     * Get customizations for a specific path
     */
    getCustomizationsForPath(filePath) {
        const result = [];
        for (const [source, customizations] of this.customizations) {
            if (source === filePath || source.startsWith(filePath)) {
                result.push(...customizations);
            }
        }
        return result;
    }
    /**
     * Apply customizations after regeneration
     */
    async applyCustomizations(filePath, content, customizations) {
        if (customizations.length === 0)
            return content;
        let result = JSON.parse(JSON.stringify(content)); // Deep clone
        for (const customization of customizations) {
            try {
                result = this.applyJsonPath(result, customization.path, customization.value);
                this.emit('customization:preserved', customization);
            }
            catch (error) {
                // Check if new value conflicts with customization
                const currentValue = this.getJsonPath(result, customization.path);
                if (currentValue !== undefined && currentValue !== customization.value) {
                    this.emit('customization:conflict', {
                        customization,
                        newValue: currentValue,
                    });
                }
            }
        }
        return result;
    }
    /**
     * Get current job status
     */
    getJobStatus(jobId) {
        return this.activeJobs.get(jobId) ||
            this.jobQueue.find(j => j.id === jobId);
    }
    /**
     * Get all active and queued jobs
     */
    getAllJobs() {
        return [
            ...Array.from(this.activeJobs.values()),
            ...this.jobQueue,
        ];
    }
    /**
     * Cancel a pending job
     */
    cancelJob(jobId) {
        const index = this.jobQueue.findIndex(j => j.id === jobId);
        if (index !== -1) {
            this.jobQueue.splice(index, 1);
            return true;
        }
        return false;
    }
    // Private methods
    /**
     * Scan watched paths for files
     */
    async scanWatchedPaths() {
        for (const watchPath of this.config.watchPaths) {
            try {
                const files = await this.globFiles(watchPath.path, watchPath.pattern, watchPath.recursive);
                for (const filePath of files) {
                    const specFile = await this.scanFile(filePath);
                    this.watchedFiles.set(filePath, specFile);
                }
            }
            catch (error) {
                // Path may not exist yet
                console.debug(`Watch path not found: ${watchPath.path}`);
            }
        }
    }
    /**
     * Scan a single file
     */
    async scanFile(filePath) {
        const stats = await promises_1.default.stat(filePath);
        const content = await promises_1.default.readFile(filePath, 'utf-8');
        const hash = crypto_1.default.createHash('sha256').update(content).digest('hex');
        return {
            path: filePath,
            hash,
            lastModified: stats.mtime,
        };
    }
    /**
     * Check for file changes
     */
    async checkForChanges() {
        for (const watchPath of this.config.watchPaths) {
            try {
                const files = await this.globFiles(watchPath.path, watchPath.pattern, watchPath.recursive);
                for (const filePath of files) {
                    const current = await this.scanFile(filePath);
                    const previous = this.watchedFiles.get(filePath);
                    if (!previous) {
                        // New file
                        this.watchedFiles.set(filePath, current);
                        this.handleFileChange(filePath, current, undefined);
                    }
                    else if (previous.hash !== current.hash) {
                        // Changed file
                        this.watchedFiles.set(filePath, current);
                        this.handleFileChange(filePath, current, previous.hash);
                    }
                }
            }
            catch (error) {
                // Ignore scan errors
            }
        }
    }
    /**
     * Handle a file change with debouncing
     */
    handleFileChange(filePath, file, previousHash) {
        // Clear existing debounce timer
        const existingTimer = this.debounceTimers.get(filePath);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
        // Set new debounce timer
        const timer = setTimeout(async () => {
            this.debounceTimers.delete(filePath);
            // Emit change event
            this.emit('spec:changed', { file, previousHash });
            // Auto-trigger regeneration if watching
            if (this.isWatching) {
                try {
                    await this.triggerRegeneration(filePath);
                }
                catch (error) {
                    this.emit('error', error);
                }
            }
        }, this.config.cascade.debounceMs);
        this.debounceTimers.set(filePath, timer);
    }
    /**
     * Process the job queue
     */
    async processJobQueue() {
        while (this.isWatching || this.jobQueue.length > 0) {
            if (this.jobQueue.length > 0 &&
                this.activeJobs.size < this.config.cascade.maxConcurrentJobs) {
                await this.processNextJob();
            }
            // Small delay to prevent tight loop
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    /**
     * Process the next job in the queue
     */
    async processNextJob() {
        const job = this.jobQueue.shift();
        if (!job)
            return;
        this.activeJobs.set(job.id, job);
        job.status = 'running';
        job.startedAt = new Date();
        this.emit('regeneration:started', job);
        try {
            // Get the regenerator for this type
            const regenerator = this.regenerators.get(job.type);
            if (regenerator) {
                const specFile = this.watchedFiles.get(job.specPath);
                if (specFile) {
                    // Run regeneration
                    if (!this.config.cascade.dryRun) {
                        await regenerator(specFile);
                    }
                    // Apply preserved customizations
                    if (job.preservedCustomizations.length > 0) {
                        await this.reapplyCustomizations(job);
                    }
                    // Cascade to dependent files
                    if (job.type === 'spec' && this.config.cascade.specToPlans) {
                        await this.cascadeUpdates(job);
                    }
                }
            }
            job.status = 'completed';
            job.completedAt = new Date();
            this.emit('regeneration:completed', job);
        }
        catch (error) {
            job.status = 'failed';
            job.error = error.message;
            job.completedAt = new Date();
            this.emit('regeneration:failed', { job, error: error });
        }
        finally {
            this.activeJobs.delete(job.id);
            // Check if cascade is complete
            if (job.cascadedJobs.length > 0) {
                const allComplete = job.cascadedJobs.every(jid => {
                    const cascaded = this.getJobStatus(jid);
                    return cascaded && (cascaded.status === 'completed' || cascaded.status === 'failed');
                });
                if (allComplete) {
                    this.emit('cascade:completed', {
                        sourceJob: job.id,
                        cascadedJobs: job.cascadedJobs,
                    });
                }
            }
        }
    }
    /**
     * Reapply customizations to regenerated file
     */
    async reapplyCustomizations(job) {
        // Read the regenerated file
        const outputPath = this.getOutputPath(job.specPath, job.type);
        try {
            const content = await promises_1.default.readFile(outputPath, 'utf-8');
            const parsed = JSON.parse(content); // Assuming JSON output
            // Apply customizations
            const customized = await this.applyCustomizations(job.specPath, parsed, job.preservedCustomizations);
            // Write back
            await promises_1.default.writeFile(outputPath, JSON.stringify(customized, null, 2));
        }
        catch (error) {
            // File may not exist or not be JSON
            console.debug(`Could not reapply customizations to ${outputPath}:`, error);
        }
    }
    /**
     * Find plans that depend on a spec
     */
    async findDependentPlans(specPath) {
        const dependentPlans = [];
        const specName = path_1.default.basename(specPath, path_1.default.extname(specPath));
        // Look in plans directory for files referencing this spec
        const planPaths = this.config.watchPaths.filter(w => w.type === 'plan');
        for (const planPath of planPaths) {
            try {
                const files = await this.globFiles(planPath.path, planPath.pattern, planPath.recursive);
                for (const file of files) {
                    const content = await promises_1.default.readFile(file, 'utf-8');
                    if (content.includes(specName) || content.includes(specPath)) {
                        dependentPlans.push(file);
                    }
                }
            }
            catch (error) {
                // Ignore scan errors
            }
        }
        return dependentPlans;
    }
    /**
     * Find tasks that depend on a spec (through plans)
     */
    async findDependentTasks(specPath) {
        const dependentTasks = [];
        const specName = path_1.default.basename(specPath, path_1.default.extname(specPath));
        // First find dependent plans
        const plans = await this.findDependentPlans(specPath);
        // Then find tasks dependent on those plans
        const taskPaths = this.config.watchPaths.filter(w => w.type === 'task');
        for (const taskPath of taskPaths) {
            try {
                const files = await this.globFiles(taskPath.path, taskPath.pattern, taskPath.recursive);
                for (const file of files) {
                    const content = await promises_1.default.readFile(file, 'utf-8');
                    // Check if task references the spec or any of its plans
                    if (content.includes(specName)) {
                        dependentTasks.push(file);
                        continue;
                    }
                    for (const plan of plans) {
                        const planName = path_1.default.basename(plan, path_1.default.extname(plan));
                        if (content.includes(planName)) {
                            dependentTasks.push(file);
                            break;
                        }
                    }
                }
            }
            catch (error) {
                // Ignore scan errors
            }
        }
        return dependentTasks;
    }
    /**
     * Get output path for generated file
     */
    getOutputPath(inputPath, type) {
        const baseName = path_1.default.basename(inputPath);
        return path_1.default.join(this.config.outputDir, type, baseName);
    }
    /**
     * Glob files matching a pattern
     */
    async globFiles(basePath, pattern, recursive) {
        const results = [];
        try {
            const entries = await promises_1.default.readdir(basePath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path_1.default.join(basePath, entry.name);
                if (entry.isDirectory() && recursive) {
                    const subFiles = await this.globFiles(fullPath, pattern, recursive);
                    results.push(...subFiles);
                }
                else if (entry.isFile() && this.matchPattern(entry.name, pattern)) {
                    results.push(fullPath);
                }
            }
        }
        catch (error) {
            // Directory doesn't exist
        }
        return results;
    }
    /**
     * Match filename against glob pattern
     */
    matchPattern(filename, pattern) {
        if (pattern === '*')
            return true;
        // Convert glob to regex
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        return new RegExp(`^${regexPattern}$`).test(filename);
    }
    /**
     * Load customizations from file
     */
    async loadCustomizations() {
        try {
            const content = await promises_1.default.readFile(this.config.customizationsFile, 'utf-8');
            const data = JSON.parse(content);
            this.customizations.clear();
            for (const [source, customs] of Object.entries(data)) {
                this.customizations.set(source, customs.map(c => ({
                    ...c,
                    timestamp: new Date(c.timestamp),
                })));
            }
        }
        catch (error) {
            // File doesn't exist yet
            this.customizations.clear();
        }
    }
    /**
     * Save customizations to file
     */
    async saveCustomizations() {
        const data = {};
        for (const [source, customs] of this.customizations) {
            data[source] = customs;
        }
        const dir = path_1.default.dirname(this.config.customizationsFile);
        await promises_1.default.mkdir(dir, { recursive: true });
        await promises_1.default.writeFile(this.config.customizationsFile, JSON.stringify(data, null, 2));
    }
    /**
     * Apply value at JSON path
     */
    applyJsonPath(obj, jsonPath, value) {
        const parts = jsonPath.split('.').filter(p => p);
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
            if (arrayMatch) {
                current = current[arrayMatch[1]][parseInt(arrayMatch[2])];
            }
            else {
                if (!(part in current)) {
                    current[part] = {};
                }
                current = current[part];
            }
        }
        const lastPart = parts[parts.length - 1];
        const arrayMatch = lastPart.match(/^(.+)\[(\d+)\]$/);
        if (arrayMatch) {
            current[arrayMatch[1]][parseInt(arrayMatch[2])] = value;
        }
        else {
            current[lastPart] = value;
        }
        return obj;
    }
    /**
     * Get value at JSON path
     */
    getJsonPath(obj, jsonPath) {
        const parts = jsonPath.split('.').filter(p => p);
        let current = obj;
        for (const part of parts) {
            const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
            if (arrayMatch) {
                current = current?.[arrayMatch[1]]?.[parseInt(arrayMatch[2])];
            }
            else {
                current = current?.[part];
            }
            if (current === undefined)
                break;
        }
        return current;
    }
    /**
     * Generate unique ID
     */
    generateId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 11);
        return `regen_${timestamp}_${random}`;
    }
}
exports.RegenerationTrigger = RegenerationTrigger;
exports.default = RegenerationTrigger;
//# sourceMappingURL=regeneration-trigger.js.map