#!/usr/bin/env node
"use strict";
/**
 * Claude-Flow Migration Tool
 * Helps existing projects migrate to optimized prompts and configurations
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
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const migration_runner_js_1 = require("./migration-runner.js");
const migration_analyzer_js_1 = require("./migration-analyzer.js");
const logger_js_1 = require("./logger.js");
const path = __importStar(require("path"));
const program = new commander_1.Command();
program
    .name('claude-flow-migrate')
    .description('Migrate existing claude-flow projects to optimized prompts')
    .version('1.0.0');
program
    .command('analyze [path]')
    .description('Analyze existing project for migration readiness')
    .option('-d, --detailed', 'Show detailed analysis')
    .option('-o, --output <file>', 'Output analysis to file')
    .action(async (projectPath = '.', options) => {
    try {
        const analyzer = new migration_analyzer_js_1.MigrationAnalyzer();
        const analysis = await analyzer.analyze(path.resolve(projectPath));
        if (options.output) {
            await analyzer.saveAnalysis(analysis, options.output);
            logger_js_1.logger.success(`Analysis saved to ${options.output}`);
        }
        analyzer.printAnalysis(analysis, options.detailed);
    }
    catch (error) {
        logger_js_1.logger.error('Analysis failed:', error);
        process.exit(1);
    }
});
program
    .command('migrate [path]')
    .description('Migrate project to optimized prompts')
    .option('-s, --strategy <type>', 'Migration strategy: full, selective, merge', 'selective')
    .option('-b, --backup <dir>', 'Backup directory', '.claude-backup')
    .option('-f, --force', 'Force migration without prompts')
    .option('--dry-run', 'Simulate migration without making changes')
    .option('--preserve-custom', 'Preserve custom commands and configurations')
    .option('--skip-validation', 'Skip post-migration validation')
    .action(async (projectPath = '.', options) => {
    try {
        const runner = new migration_runner_js_1.MigrationRunner({
            projectPath: path.resolve(projectPath),
            strategy: options.strategy,
            backupDir: options.backup,
            force: options.force,
            dryRun: options.dryRun,
            preserveCustom: options.preserveCustom,
            skipValidation: options.skipValidation,
        });
        await runner.run();
    }
    catch (error) {
        logger_js_1.logger.error('Migration failed:', error);
        process.exit(1);
    }
});
program
    .command('rollback [path]')
    .description('Rollback to previous configuration')
    .option('-b, --backup <dir>', 'Backup directory to restore from', '.claude-backup')
    .option('-t, --timestamp <time>', 'Restore from specific timestamp')
    .option('-f, --force', 'Force rollback without prompts')
    .action(async (projectPath = '.', options) => {
    try {
        const runner = new migration_runner_js_1.MigrationRunner({
            projectPath: path.resolve(projectPath),
            strategy: 'full',
            backupDir: options.backup,
            force: options.force,
        });
        await runner.rollback(options.timestamp);
    }
    catch (error) {
        logger_js_1.logger.error('Rollback failed:', error);
        process.exit(1);
    }
});
program
    .command('validate [path]')
    .description('Validate migration was successful')
    .option('-v, --verbose', 'Show detailed validation results')
    .action(async (projectPath = '.', options) => {
    try {
        const runner = new migration_runner_js_1.MigrationRunner({
            projectPath: path.resolve(projectPath),
            strategy: 'full',
        });
        const isValid = await runner.validate(options.verbose);
        if (isValid) {
            logger_js_1.logger.success('Migration validated successfully!');
        }
        else {
            logger_js_1.logger.error('Migration validation failed');
            process.exit(1);
        }
    }
    catch (error) {
        logger_js_1.logger.error('Validation failed:', error);
        process.exit(1);
    }
});
program
    .command('list-backups [path]')
    .description('List available backups')
    .option('-b, --backup <dir>', 'Backup directory', '.claude-backup')
    .action(async (projectPath = '.', options) => {
    try {
        const runner = new migration_runner_js_1.MigrationRunner({
            projectPath: path.resolve(projectPath),
            strategy: 'full',
            backupDir: options.backup,
        });
        await runner.listBackups();
    }
    catch (error) {
        logger_js_1.logger.error('Failed to list backups:', error);
        process.exit(1);
    }
});
// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.help();
}
program.parse(process.argv);
//# sourceMappingURL=index.js.map