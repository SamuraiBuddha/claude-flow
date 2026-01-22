import { EventEmitter } from 'events';
export interface CopyOptions {
    source: string;
    destination: string;
    backup?: boolean;
    overwrite?: boolean;
    verify?: boolean;
    preservePermissions?: boolean;
    excludePatterns?: string[];
    includePatterns?: string[];
    parallel?: boolean;
    maxWorkers?: number;
    dryRun?: boolean;
    conflictResolution?: 'skip' | 'overwrite' | 'backup' | 'merge';
    progressCallback?: (progress: CopyProgress) => void;
}
export interface CopyProgress {
    total: number;
    completed: number;
    failed: number;
    skipped: number;
    currentFile?: string;
    percentage: number;
}
export interface CopyResult {
    success: boolean;
    totalFiles: number;
    copiedFiles: number;
    failedFiles: number;
    skippedFiles: number;
    backupLocation?: string;
    errors: CopyError[];
    duration: number;
}
export interface CopyError {
    file: string;
    error: string;
    phase: 'read' | 'write' | 'verify' | 'backup';
}
export interface FileInfo {
    path: string;
    relativePath: string;
    size: number;
    hash?: string;
    permissions?: number;
}
export declare class PromptCopier extends EventEmitter {
    private options;
    private fileQueue;
    private copiedFiles;
    private errors;
    private backupMap;
    private rollbackStack;
    constructor(options: CopyOptions);
    copy(): Promise<CopyResult>;
    private discoverFiles;
    private scanDirectory;
    private shouldIncludeFile;
    private matchPattern;
    private ensureDestinationDirectories;
    private copyFilesSequential;
    protected copyFilesParallel(): Promise<void>;
    private processChunk;
    private copyFile;
    private backupFile;
    private mergeFiles;
    protected verifyFiles(): Promise<void>;
    private calculateFileHash;
    private fileExists;
    private createBackupManifest;
    private rollback;
    private reportProgress;
    restoreFromBackup(manifestPath: string): Promise<void>;
}
export declare function copyPrompts(options: CopyOptions): Promise<CopyResult>;
//# sourceMappingURL=prompt-copier.d.ts.map