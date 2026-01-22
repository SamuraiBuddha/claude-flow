/**
 * Migration Analyzer - Analyzes existing projects for migration readiness
 */
import type { MigrationAnalysis } from './types.js';
export declare class MigrationAnalyzer {
    private optimizedCommands;
    analyze(projectPath: string): Promise<MigrationAnalysis>;
    private analyzeCommands;
    private checkOptimizedPrompts;
    private analyzeConfigurations;
    private detectConflicts;
    private isStandardFile;
    private assessRisks;
    private generateRecommendations;
    printAnalysis(analysis: MigrationAnalysis, detailed?: boolean): void;
    saveAnalysis(analysis: MigrationAnalysis, outputPath: string): Promise<void>;
}
//# sourceMappingURL=migration-analyzer.d.ts.map