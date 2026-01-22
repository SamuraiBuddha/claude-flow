import { EventEmitter } from 'events';
import { type CopyOptions, type CopyResult } from './prompt-copier.js';
export interface PromptManagerOptions {
    configPath?: string;
    basePath?: string;
    autoDiscovery?: boolean;
    defaultProfile?: string;
}
export interface SyncOptions {
    bidirectional?: boolean;
    deleteOrphaned?: boolean;
    compareHashes?: boolean;
    incrementalOnly?: boolean;
}
export interface ValidationReport {
    totalFiles: number;
    validFiles: number;
    invalidFiles: number;
    issues: Array<{
        file: string;
        issues: string[];
        metadata?: any;
    }>;
}
export declare class PromptManager extends EventEmitter {
    private configManager;
    private pathResolver;
    private options;
    constructor(options?: PromptManagerOptions);
    initialize(): Promise<void>;
    copyPrompts(options?: Partial<CopyOptions>): Promise<CopyResult>;
    copyFromMultipleSources(options?: Partial<CopyOptions>): Promise<CopyResult[]>;
    validatePrompts(sourcePath?: string): Promise<ValidationReport>;
    private validateDirectory;
    private isPromptFile;
    syncPrompts(options?: SyncOptions): Promise<{
        forward: CopyResult;
        backward?: CopyResult;
    }>;
    private performIncrementalSync;
    generateReport(): Promise<{
        configuration: any;
        sources: Array<{
            path: string;
            exists: boolean;
            fileCount?: number;
            totalSize?: number;
        }>;
        validation?: ValidationReport;
        lastOperation?: {
            type: string;
            timestamp: Date;
            result: any;
        };
    }>;
    getConfig(): import("./prompt-utils.js").PromptConfig;
    updateConfig(updates: any): Promise<void>;
    getProfiles(): string[];
    getProfile(name: string): {
        backup: boolean;
        verify: boolean;
        parallel: boolean;
        maxWorkers: number;
        conflictResolution: "skip" | "overwrite" | "backup" | "merge";
        includePatterns: string[];
        excludePatterns: string[];
    };
    discoverPromptDirectories(): Promise<string[]>;
}
export declare function createPromptManager(options?: PromptManagerOptions): PromptManager;
export declare function getDefaultPromptManager(): PromptManager;
//# sourceMappingURL=prompt-manager.d.ts.map