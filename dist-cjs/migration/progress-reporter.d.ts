/**
 * Progress Reporter - Provides visual feedback during migration
 */
import type { MigrationProgress } from './types.js';
export declare class ProgressReporter {
    private progress;
    private startTime;
    private spinner;
    private spinnerIndex;
    private intervalId;
    constructor();
    start(phase: MigrationProgress['phase'], message: string): void;
    update(phase: MigrationProgress['phase'], message: string, completed?: number, total?: number): void;
    complete(message: string): void;
    error(message: string): void;
    warning(message: string): void;
    info(message: string): void;
    private startSpinner;
    private stopSpinner;
    private updateDisplay;
    private getPhaseDisplay;
    private getProgressDisplay;
    private createProgressBar;
    setTotal(total: number): void;
    increment(message?: string): void;
    getProgress(): MigrationProgress;
}
//# sourceMappingURL=progress-reporter.d.ts.map