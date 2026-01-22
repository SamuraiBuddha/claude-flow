import type { MigrationOptions, MigrationResult } from './types.js';
export declare class MigrationRunner {
    private options;
    private progress;
    private analyzer;
    private validator;
    private manifest;
    constructor(options: MigrationOptions);
    run(): Promise<MigrationResult>;
    private fullMigration;
    private selectiveMigration;
    private mergeMigration;
    private mergeConfigurations;
    private copyRequiredFiles;
    private updateConfigurations;
    private createBackup;
    rollback(timestamp?: string): Promise<void>;
    validate(verbose?: boolean): Promise<boolean>;
    listBackups(): Promise<void>;
    private confirmMigration;
    private loadManifest;
    private getMergedClaudeMd;
    private getMergedRoomodes;
    private printSummary;
}
//# sourceMappingURL=migration-runner.d.ts.map