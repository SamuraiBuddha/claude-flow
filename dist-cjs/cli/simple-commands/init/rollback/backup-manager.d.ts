export class BackupManager {
    constructor(workingDir: any);
    workingDir: any;
    backupDir: string;
    /**
     * Create a backup of the current state
     */
    createBackup(type?: string, description?: string): Promise<{
        success: boolean;
        id: null;
        location: null;
        errors: never[];
        warnings: never[];
        files: never[];
    }>;
    /**
     * Restore from backup
     */
    restoreBackup(backupId: any): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        restored: never[];
    }>;
    /**
     * List available backups
     */
    listBackups(): Promise<{
        id: any;
        type: any;
        description: any;
        created: any;
        size: any;
        fileCount: any;
        dirCount: any;
    }[]>;
    /**
     * Delete a backup
     */
    deleteBackup(backupId: any): Promise<{
        success: boolean;
        errors: never[];
    }>;
    /**
     * Clean up old backups
     */
    cleanupOldBackups(keepCount?: number): Promise<{
        success: boolean;
        cleaned: never[];
        errors: never[];
    }>;
    /**
     * Validate backup system
     */
    validateBackupSystem(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
    }>;
    ensureBackupDir(): Promise<void>;
    getCriticalFiles(): Promise<string[]>;
    getCriticalDirectories(): Promise<string[]>;
    backupFile(relativePath: any, backupPath: any): Promise<{
        success: boolean;
        fileInfo: null;
    }>;
    backupDirectory(relativePath: any, backupPath: any): Promise<{
        success: boolean;
        dirInfo: null;
    }>;
    copyDirectoryRecursive(source: any, dest: any): Promise<void>;
    restoreFile(fileInfo: any, backupPath: any): Promise<{
        success: boolean;
    }>;
    restoreDirectory(dirInfo: any, backupPath: any): Promise<{
        success: boolean;
    }>;
    calculateBackupSize(backupPath: any): Promise<number>;
    createTestBackup(): Promise<{
        success: boolean;
        id: null;
        location: null;
        errors: never[];
        warnings: never[];
        files: never[];
    } | {
        success: boolean;
        error: any;
    }>;
    checkBackupDiskSpace(): Promise<{
        adequate: boolean;
        available: number;
    }>;
}
//# sourceMappingURL=backup-manager.d.ts.map