/**
 * Rollback Manager - Handles rollback operations and backup management
 */
import type { MigrationBackup } from './types.js';
export declare class RollbackManager {
    private projectPath;
    private backupDir;
    constructor(projectPath: string, backupDir?: string);
    createBackup(metadata?: Record<string, any>): Promise<MigrationBackup>;
    private backupDirectory;
    private backupFile;
    listBackups(): Promise<MigrationBackup[]>;
    rollback(backupId?: string, interactive?: boolean): Promise<void>;
    private selectBackupInteractively;
    private restoreFiles;
    private validateRestore;
    cleanupOldBackups(retentionDays?: number, maxBackups?: number): Promise<void>;
    getBackupInfo(backupId: string): Promise<MigrationBackup | null>;
    exportBackup(backupId: string, exportPath: string): Promise<void>;
    importBackup(importPath: string): Promise<MigrationBackup>;
    private updateBackupIndex;
    printBackupSummary(backups: MigrationBackup[]): void;
}
//# sourceMappingURL=rollback-manager.d.ts.map