/**
 * RegenerationTrigger - Monitor for spec changes and cascade regeneration
 *
 * Handles spec -> plan -> tasks cascade with customization preservation
 */
import { EventEmitter } from 'events';
export interface SpecFile {
    path: string;
    hash: string;
    lastModified: Date;
    version?: string;
    metadata?: Record<string, unknown>;
}
export interface RegenerationJob {
    id: string;
    specPath: string;
    type: 'spec' | 'plan' | 'task';
    status: 'pending' | 'running' | 'completed' | 'failed';
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
    preservedCustomizations: Customization[];
    cascadedJobs: string[];
}
export interface Customization {
    id: string;
    type: 'manual_override' | 'local_config' | 'user_preference' | 'annotation';
    path: string;
    value: unknown;
    source: string;
    timestamp: Date;
    reason?: string;
}
export interface CascadeConfig {
    specToPlans: boolean;
    plansToTasks: boolean;
    preserveCustomizations: boolean;
    dryRun: boolean;
    maxConcurrentJobs: number;
    debounceMs: number;
}
export interface WatchedPath {
    path: string;
    pattern: string;
    recursive: boolean;
    type: 'spec' | 'plan' | 'task' | 'config';
}
export interface RegenerationTriggerConfig {
    watchPaths: WatchedPath[];
    cascade: CascadeConfig;
    outputDir: string;
    customizationsFile: string;
    pollInterval: number;
    enableFileWatching: boolean;
}
export interface RegenerationTriggerEvents {
    'spec:changed': {
        file: SpecFile;
        previousHash?: string;
    };
    'regeneration:started': RegenerationJob;
    'regeneration:completed': RegenerationJob;
    'regeneration:failed': {
        job: RegenerationJob;
        error: Error;
    };
    'cascade:started': {
        sourceJob: string;
        cascadedJobs: string[];
    };
    'cascade:completed': {
        sourceJob: string;
        cascadedJobs: string[];
    };
    'customization:preserved': Customization;
    'customization:conflict': {
        customization: Customization;
        newValue: unknown;
    };
    'error': Error;
}
/**
 * RegenerationTrigger class for monitoring and cascading spec changes
 */
export declare class RegenerationTrigger extends EventEmitter {
    private config;
    private watchedFiles;
    private customizations;
    private activeJobs;
    private jobQueue;
    private pollTimer?;
    private debounceTimers;
    private isWatching;
    private regenerators;
    constructor(config?: Partial<RegenerationTriggerConfig>);
    /**
     * Initialize the regeneration trigger
     */
    initialize(): Promise<void>;
    /**
     * Start watching for spec changes
     */
    watchSpec(specPath?: string): Promise<void>;
    /**
     * Stop watching for changes
     */
    stopWatching(): void;
    /**
     * Trigger regeneration manually
     */
    triggerRegeneration(specPath: string, options?: {
        cascade?: boolean;
        preserveCustomizations?: boolean;
        dryRun?: boolean;
    }): Promise<RegenerationJob>;
    /**
     * Cascade updates from spec to plans and tasks
     */
    cascadeUpdates(sourceJob: RegenerationJob, options?: {
        skipPlans?: boolean;
        skipTasks?: boolean;
    }): Promise<string[]>;
    /**
     * Register a regenerator function for a specific type
     */
    registerRegenerator(type: 'spec' | 'plan' | 'task', regenerator: (spec: SpecFile) => Promise<void>): void;
    /**
     * Record a customization to preserve during regeneration
     */
    recordCustomization(customization: Omit<Customization, 'id' | 'timestamp'>): Promise<Customization>;
    /**
     * Get customizations for a specific path
     */
    getCustomizationsForPath(filePath: string): Customization[];
    /**
     * Apply customizations after regeneration
     */
    applyCustomizations(filePath: string, content: unknown, customizations: Customization[]): Promise<unknown>;
    /**
     * Get current job status
     */
    getJobStatus(jobId: string): RegenerationJob | undefined;
    /**
     * Get all active and queued jobs
     */
    getAllJobs(): RegenerationJob[];
    /**
     * Cancel a pending job
     */
    cancelJob(jobId: string): boolean;
    /**
     * Scan watched paths for files
     */
    private scanWatchedPaths;
    /**
     * Scan a single file
     */
    private scanFile;
    /**
     * Check for file changes
     */
    private checkForChanges;
    /**
     * Handle a file change with debouncing
     */
    private handleFileChange;
    /**
     * Process the job queue
     */
    private processJobQueue;
    /**
     * Process the next job in the queue
     */
    private processNextJob;
    /**
     * Reapply customizations to regenerated file
     */
    private reapplyCustomizations;
    /**
     * Find plans that depend on a spec
     */
    private findDependentPlans;
    /**
     * Find tasks that depend on a spec (through plans)
     */
    private findDependentTasks;
    /**
     * Get output path for generated file
     */
    private getOutputPath;
    /**
     * Glob files matching a pattern
     */
    private globFiles;
    /**
     * Match filename against glob pattern
     */
    private matchPattern;
    /**
     * Load customizations from file
     */
    private loadCustomizations;
    /**
     * Save customizations to file
     */
    private saveCustomizations;
    /**
     * Apply value at JSON path
     */
    private applyJsonPath;
    /**
     * Get value at JSON path
     */
    private getJsonPath;
    /**
     * Generate unique ID
     */
    private generateId;
}
export default RegenerationTrigger;
//# sourceMappingURL=regeneration-trigger.d.ts.map