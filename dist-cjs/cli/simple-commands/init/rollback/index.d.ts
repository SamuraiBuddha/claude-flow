/**
 * Create and manage atomic operations
 */
export function createAtomicOperation(rollbackSystem: any, operationName: any): AtomicOperation;
/**
 * Main rollback orchestrator
 */
export class RollbackSystem {
    constructor(workingDir: any);
    workingDir: any;
    backupManager: BackupManager;
    rollbackExecutor: RollbackExecutor;
    stateTracker: StateTracker;
    recoveryManager: RecoveryManager;
    /**
     * Create backup before initialization
     */
    createPreInitBackup(): Promise<{
        success: boolean;
        backupId: null;
        errors: never[];
        warnings: never[];
    }>;
    /**
     * Create checkpoint during initialization
     */
    createCheckpoint(phase: any, data?: {}): Promise<{
        success: boolean;
        checkpointId: null;
        errors: never[];
    }>;
    /**
     * Perform full rollback to pre-initialization state
     */
    performFullRollback(backupId?: null): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Perform partial rollback to specific checkpoint
     */
    performPartialRollback(phase: any, checkpointId?: null): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        actions: never[];
    }>;
    /**
     * Auto-recovery from common failures
     */
    performAutoRecovery(failureType: any, context?: {}): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        recoveryActions: never[];
    }>;
    /**
     * List available rollback points
     */
    listRollbackPoints(): Promise<{
        success: boolean;
        rollbackPoints: never[];
        checkpoints: never[];
        errors: never[];
    }>;
    /**
     * Clean up old backups and checkpoints
     */
    cleanupOldBackups(keepCount?: number): Promise<{
        success: boolean;
        cleaned: never[];
        errors: never[];
    }>;
    /**
     * Validate rollback system integrity
     */
    validateRollbackSystem(): Promise<{
        success: boolean;
        checks: {};
        errors: never[];
        warnings: never[];
    }>;
    findLatestPreInitBackup(): Promise<any>;
    findLatestCheckpoint(phase: any): Promise<any>;
}
/**
 * Atomic operation wrapper
 */
export class AtomicOperation {
    constructor(rollbackSystem: any, operationName: any);
    rollbackSystem: any;
    operationName: any;
    checkpointId: any;
    completed: boolean;
    /**
     * Begin atomic operation
     */
    begin(): Promise<any>;
    /**
     * Commit atomic operation
     */
    commit(): Promise<void>;
    /**
     * Rollback atomic operation
     */
    rollback(): Promise<void>;
}
import { BackupManager } from './backup-manager.js';
import { RollbackExecutor } from './rollback-executor.js';
import { StateTracker } from './state-tracker.js';
import { RecoveryManager } from './recovery-manager.js';
//# sourceMappingURL=index.d.ts.map