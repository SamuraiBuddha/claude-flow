"use strict";
/**
 * Migration CLI Command Integration
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMigrateCommand = createMigrateCommand;
const commander_1 = require("commander");
const logger_js_1 = require("../../migration/logger.js");
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
function createMigrateCommand() {
    const command = new commander_1.Command('migrate');
    command
        .description('Migrate existing claude-flow projects to optimized prompts')
        .option('-p, --path <path>', 'Project path', '.')
        .option('-s, --strategy <type>', 'Migration strategy: full, selective, merge', 'selective')
        .option('-b, --backup <dir>', 'Backup directory', '.claude-backup')
        .option('-f, --force', 'Force migration without prompts')
        .option('--dry-run', 'Simulate migration without making changes')
        .option('--preserve-custom', 'Preserve custom commands and configurations')
        .option('--skip-validation', 'Skip post-migration validation')
        .option('--analyze-only', 'Only analyze project without migrating')
        .option('--verbose', 'Show detailed output')
        .action(async (options) => {
        try {
            const projectPath = path.resolve(options.path);
            if (options.analyzeOnly) {
                await analyzeProject(projectPath, options);
            }
            else {
                await runMigration(projectPath, options);
            }
        }
        catch (error) {
            logger_js_1.logger.error('Migration command failed:', error);
            process.exit(1);
        }
    });
    // Sub-commands
    command
        .command('analyze [path]')
        .description('Analyze project for migration readiness')
        .option('-d, --detailed', 'Show detailed analysis')
        .option('-o, --output <file>', 'Output analysis to file')
        .action(async (projectPath = '.', options) => {
        await analyzeProject(path.resolve(projectPath), options);
    });
    command
        .command('rollback [path]')
        .description('Rollback to previous configuration')
        .option('-b, --backup <dir>', 'Backup directory', '.claude-backup')
        .option('-t, --timestamp <time>', 'Restore from specific timestamp')
        .option('-f, --force', 'Force rollback without prompts')
        .option('--list', 'List available backups')
        .action(async (projectPath = '.', options) => {
        const { RollbackManager } = await Promise.resolve().then(() => __importStar(require('../../migration/rollback-manager.js')));
        const rollbackManager = new RollbackManager(path.resolve(projectPath), options.backup);
        if (options.list) {
            const backups = await rollbackManager.listBackups();
            rollbackManager.printBackupSummary(backups);
            return;
        }
        await rollbackManager.rollback(options.timestamp, !options.force);
    });
    command
        .command('validate [path]')
        .description('Validate migration was successful')
        .option('-v, --verbose', 'Show detailed validation results')
        .action(async (projectPath = '.', options) => {
        const { MigrationRunner } = await Promise.resolve().then(() => __importStar(require('../../migration/migration-runner.js')));
        const runner = new MigrationRunner({
            projectPath: path.resolve(projectPath),
            strategy: 'full',
        });
        const isValid = await runner.validate(options.verbose);
        process.exit(isValid ? 0 : 1);
    });
    command
        .command('status [path]')
        .description('Show migration status and available backups')
        .action(async (projectPath = '.') => {
        await showMigrationStatus(path.resolve(projectPath));
    });
    return command;
}
async function analyzeProject(projectPath, options) {
    logger_js_1.logger.info(`Analyzing project at ${projectPath}...`);
    const { MigrationAnalyzer } = await Promise.resolve().then(() => __importStar(require('../../migration/migration-analyzer.js')));
    const analyzer = new MigrationAnalyzer();
    const analysis = await analyzer.analyze(projectPath);
    if (options.output) {
        await analyzer.saveAnalysis(analysis, options.output);
        logger_js_1.logger.success(`Analysis saved to ${options.output}`);
    }
    analyzer.printAnalysis(analysis, options.detailed || options.verbose);
}
async function runMigration(projectPath, options) {
    const { MigrationRunner } = await Promise.resolve().then(() => __importStar(require('../../migration/migration-runner.js')));
    const runner = new MigrationRunner({
        projectPath,
        strategy: options.strategy,
        backupDir: options.backup,
        force: options.force,
        dryRun: options.dryRun,
        preserveCustom: options.preserveCustom,
        skipValidation: options.skipValidation,
    });
    const result = await runner.run();
    if (!result.success) {
        process.exit(1);
    }
}
async function showMigrationStatus(projectPath) {
    console.log(chalk_1.default.bold('\n📊 Migration Status'));
    console.log(chalk_1.default.gray('─'.repeat(50)));
    // Project analysis
    const { MigrationAnalyzer } = await Promise.resolve().then(() => __importStar(require('../../migration/migration-analyzer.js')));
    const analyzer = new MigrationAnalyzer();
    const analysis = await analyzer.analyze(projectPath);
    console.log(`\n${chalk_1.default.bold('Project:')} ${projectPath}`);
    console.log(`${chalk_1.default.bold('Status:')} ${analysis.hasOptimizedPrompts ? chalk_1.default.green('Migrated') : chalk_1.default.yellow('Not Migrated')}`);
    console.log(`${chalk_1.default.bold('Custom Commands:')} ${analysis.customCommands.length}`);
    console.log(`${chalk_1.default.bold('Conflicts:')} ${analysis.conflictingFiles.length}`);
    // Backup status
    const { RollbackManager } = await Promise.resolve().then(() => __importStar(require('../../migration/rollback-manager.js')));
    const rollbackManager = new RollbackManager(projectPath);
    const backups = await rollbackManager.listBackups();
    console.log(`\n${chalk_1.default.bold('Backups Available:')} ${backups.length}`);
    if (backups.length > 0) {
        const latestBackup = backups[0];
        console.log(`${chalk_1.default.bold('Latest Backup:')} ${latestBackup.timestamp.toLocaleString()}`);
    }
    // Recommendations
    if (!analysis.hasOptimizedPrompts) {
        console.log(chalk_1.default.bold('\n💡 Recommendations:'));
        console.log('  • Run migration analysis: claude-flow migrate analyze');
        console.log('  • Start with dry run: claude-flow migrate --dry-run');
        console.log('  • Use selective strategy: claude-flow migrate --strategy selective');
    }
    console.log(chalk_1.default.gray('\n' + '─'.repeat(50)));
}
//# sourceMappingURL=migrate.js.map