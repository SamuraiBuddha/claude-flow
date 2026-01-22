#!/usr/bin/env -S deno run --allow-all
"use strict";
/**
 * Claude-Flow CLI entry point
 * This redirects to simple-cli.ts for remote execution compatibility
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import and run the simple CLI which doesn't have external dependencies
require("./simple-cli.js");
// Spinner import removed - not available in current cliffy version
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const logger_js_1 = require("../core/logger.js");
const config_js_1 = require("../core/config.js");
const formatter_js_1 = require("./formatter.js");
const repl_js_1 = require("./repl.js");
const completion_js_1 = require("./completion.js");
// Version information
const VERSION = '1.0.71';
const BUILD_DATE = new Date().toISOString().split('T')[0];
// Main CLI command
const cli = new commander_1.Command()
    .name('claude-flow')
    .version(VERSION)
    .description('Claude-Flow: Advanced AI agent orchestration system for multi-agent coordination')
    // .meta() commented out - not available
    // .meta() commented out - not available
    .option('-c, --config <path>', 'Path to configuration file', './claude-flow.config.json')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-q, --quiet', 'Suppress non-essential output')
    .option('--log-level <level>', 'Set log level (debug, info, warn, error)', 'info')
    .option('--no-color', 'Disable colored output')
    .option('--json', 'Output in JSON format where applicable')
    .option('--profile <profile>', 'Use named configuration profile')
    .action(async (options) => {
    // If no subcommand, show banner and start REPL
    await setupLogging(options);
    if (!options.quiet) {
        (0, formatter_js_1.displayBanner)(VERSION);
        console.log(chalk_1.default.gray('Type "help" for available commands or "exit" to quit.\n'));
    }
    await (0, repl_js_1.startREPL)(options);
});
// Add subcommands
// NOTE: Temporarily disabled due to Cliffy/Commander compatibility issues
// These commands are created with Cliffy but being added to Commander
// cli
//   .addCommand(startCommand)
//   .addCommand(agentCommand)
//   .addCommand(taskCommand)
//   .addCommand(memoryCommand)
//   .addCommand(configCommand)
//   .addCommand(statusCommand)
//   .addCommand(monitorCommand)
//   .addCommand(sessionCommand)
//   .addCommand(workflowCommand)
//   .addCommand(mcpCommand)
//   .addCommand(helpCommand);
// Add repl command
const replCommand = new commander_1.Command('repl')
    .description('Start interactive REPL mode with command completion')
    .option('--no-banner', 'Skip welcome banner')
    .option('--history-file <path>', 'Custom history file path')
    .action(async (options) => {
    await setupLogging(options);
    if (options.banner !== false) {
        (0, formatter_js_1.displayBanner)(VERSION);
    }
    await (0, repl_js_1.startREPL)(options);
});
cli.addCommand(replCommand);
// Add version command
const versionCommand = new commander_1.Command('version')
    .description('Show detailed version information')
    .option('--short', 'Show version number only')
    .action(async (options) => {
    if (options.short) {
        console.log(VERSION);
    }
    else {
        (0, formatter_js_1.displayVersion)(VERSION, BUILD_DATE);
    }
});
cli.addCommand(versionCommand);
// Add completion command
const completionCommand = new commander_1.Command('completion')
    .description('Generate shell completion scripts')
    .argument('[shell]', 'Shell type')
    .option('--install', 'Install completion script automatically')
    .action(async (shell, options) => {
    const generator = new completion_js_1.CompletionGenerator();
    await generator.generate(shell || 'detect', options.install === true);
});
cli.addCommand(completionCommand);
// Global error handler
async function handleError(error, options) {
    const formatted = (0, formatter_js_1.formatError)(error);
    if (options?.json) {
        console.error(JSON.stringify({
            error: true,
            message: formatted,
            timestamp: new Date().toISOString(),
        }));
    }
    else {
        console.error(chalk_1.default.red(chalk_1.default.bold('✗ Error:')), formatted);
    }
    // Show stack trace in debug mode or verbose
    if (process.env['CLAUDE_FLOW_DEBUG'] === 'true' || options?.verbose) {
        console.error(chalk_1.default.gray('\nStack trace:'));
        console.error(error);
    }
    // Suggest helpful actions
    if (!options?.quiet) {
        console.error(chalk_1.default.gray('\nTry running with --verbose for more details'));
        console.error(chalk_1.default.gray('Or use "claude-flow help" to see available commands'));
    }
    process.exit(1);
}
// Setup logging and configuration based on CLI options
async function setupLogging(options) {
    // Determine log level
    let logLevel = options.logLevel;
    if (options.verbose)
        logLevel = 'debug';
    if (options.quiet)
        logLevel = 'warn';
    // Configure logger
    await logger_js_1.logger.configure({
        level: logLevel,
        format: options.json ? 'json' : 'text',
        destination: 'console',
    });
    // Load configuration
    try {
        if (options.config) {
            await config_js_1.configManager.load(options.config);
        }
        else {
            // Try to load default config file if it exists
            try {
                await config_js_1.configManager.load('./claude-flow.config.json');
            }
            catch {
                // Use default config if no file found
                config_js_1.configManager.loadDefault();
            }
        }
        // Apply profile if specified
        if (options.profile) {
            await config_js_1.configManager.applyProfile(options.profile);
        }
    }
    catch (error) {
        logger_js_1.logger.warn('Failed to load configuration:', error.message);
        config_js_1.configManager.loadDefault();
    }
}
// Signal handlers for graceful shutdown
function setupSignalHandlers() {
    const gracefulShutdown = () => {
        console.log('\n' + chalk_1.default.gray('Gracefully shutting down...'));
        process.exit(0);
    };
    Deno.addSignalListener('SIGINT', gracefulShutdown);
    Deno.addSignalListener('SIGTERM', gracefulShutdown);
}
// Main entry point
if (false) {
    // import.meta.main not available
    let globalOptions = {};
    try {
        // Setup signal handlers
        setupSignalHandlers();
        // Pre-parse global options for error handling
        const args = Deno.args;
        globalOptions = {
            verbose: args.includes('-v') || args.includes('--verbose'),
            quiet: args.includes('-q') || args.includes('--quiet'),
            json: args.includes('--json'),
            noColor: args.includes('--no-color'),
        };
        // Configure colors based on options
        if (globalOptions.noColor) {
            // colors.setColorEnabled(false);
        }
        await cli.parse(args);
    }
    catch (error) {
        await handleError(error, globalOptions);
    }
}
//# sourceMappingURL=index.js.map