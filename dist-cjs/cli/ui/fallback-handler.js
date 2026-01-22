"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRawModeError = handleRawModeError;
exports.withRawModeFallback = withRawModeFallback;
exports.checkUISupport = checkUISupport;
exports.showUISupport = showUISupport;
const type_guards_js_1 = require("../../utils/type-guards.js");
/**
 * Fallback UI Handler - Handles raw mode errors gracefully
 * Provides alternative UI when Ink/raw mode isn't supported
 */
const chalk_1 = __importDefault(require("chalk"));
const compatible_ui_js_1 = require("./compatible-ui.js");
/**
 * Handles raw mode errors and provides fallback UI
 */
async function handleRawModeError(error, options = {}) {
    const isRawModeError = (error instanceof Error ? error.message : String(error)).includes('Raw mode is not supported') ||
        (error instanceof Error ? error.message : String(error)).includes('stdin') ||
        (error instanceof Error ? error.message : String(error)).includes('Ink');
    if (!isRawModeError) {
        throw error; // Re-throw if it's not a raw mode error
    }
    console.clear();
    console.log(chalk_1.default.yellow.bold('⚠️  Interactive Mode Not Supported'));
    console.log(chalk_1.default.gray('─'.repeat(50)));
    console.log(chalk_1.default.white('The current terminal environment does not support'));
    console.log(chalk_1.default.white('interactive UI features (raw mode).'));
    console.log();
    console.log(chalk_1.default.cyan('Common causes:'));
    console.log(chalk_1.default.gray('• VS Code integrated terminal'));
    console.log(chalk_1.default.gray('• WSL (Windows Subsystem for Linux)'));
    console.log(chalk_1.default.gray('• Native Windows terminals'));
    console.log(chalk_1.default.gray('• CI/CD environments'));
    console.log(chalk_1.default.gray('• Docker containers'));
    console.log(chalk_1.default.gray('• SSH sessions without TTY'));
    console.log();
    if (options.fallbackMessage) {
        console.log(chalk_1.default.blue('ℹ️  '), options.fallbackMessage);
        console.log();
    }
    if (options.enableUI) {
        console.log(chalk_1.default.green('✅ Launching compatible UI mode...'));
        console.log();
        try {
            const ui = (0, compatible_ui_js_1.createCompatibleUI)();
            await ui.start();
        }
        catch (fallbackError) {
            console.log(chalk_1.default.red('❌ Fallback UI also failed:'), (0, type_guards_js_1.getErrorMessage)(fallbackError));
            await showBasicInterface(options);
        }
    }
    else {
        await showBasicInterface(options);
    }
}
/**
 * Shows a basic text-based interface when UI isn't available
 */
async function showBasicInterface(options) {
    console.log(chalk_1.default.green('📋 Available alternatives:'));
    console.log();
    console.log(chalk_1.default.white('1. Use CLI commands directly:'));
    console.log(chalk_1.default.gray('   ./claude-flow status'));
    console.log(chalk_1.default.gray('   ./claude-flow memory list'));
    console.log(chalk_1.default.gray('   ./claude-flow sparc modes'));
    console.log();
    console.log(chalk_1.default.white('2. Use non-interactive modes:'));
    console.log(chalk_1.default.gray('   ./claude-flow start (without --ui)'));
    console.log(chalk_1.default.gray('   ./claude-flow swarm "task" --monitor'));
    console.log();
    console.log(chalk_1.default.white('3. Use external terminal:'));
    console.log(chalk_1.default.gray('   Run in a standalone terminal application'));
    console.log();
    if (options.showHelp) {
        console.log(chalk_1.default.cyan('💡 For help with any command, use:'));
        console.log(chalk_1.default.gray('   ./claude-flow help <command>'));
        console.log(chalk_1.default.gray('   ./claude-flow <command> --help'));
        console.log();
    }
    console.log(chalk_1.default.gray('Press Ctrl+C to exit'));
    // Wait for user to exit
    await new Promise(() => {
        process.on('SIGINT', () => {
            console.log(chalk_1.default.green('\n👋 Goodbye!'));
            process.exit(0);
        });
    });
}
/**
 * Wraps a function to catch and handle raw mode errors
 */
function withRawModeFallback(fn, fallbackOptions = {}) {
    return async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            if (error instanceof Error) {
                await handleRawModeError(error, fallbackOptions);
            }
            else {
                throw error;
            }
        }
    };
}
/**
 * Checks if the current environment supports interactive UI
 */
function checkUISupport() {
    // Check if we're in a TTY
    if (!process.stdin.isTTY) {
        return {
            supported: false,
            reason: 'Not running in a TTY environment',
            recommendation: 'Use a proper terminal application',
        };
    }
    // Check if raw mode is available
    if (typeof process.stdin.setRawMode !== 'function') {
        return {
            supported: false,
            reason: 'Raw mode not available',
            recommendation: 'Use --no-ui flag or run in external terminal',
        };
    }
    // Check for VS Code terminal
    if (process.env.TERM_PROGRAM === 'vscode') {
        return {
            supported: false,
            reason: 'Running in VS Code integrated terminal',
            recommendation: 'Use VS Code external terminal or standalone terminal',
        };
    }
    // Check for other problematic environments
    if (process.env.CI || process.env.GITHUB_ACTIONS) {
        return {
            supported: false,
            reason: 'Running in CI/CD environment',
            recommendation: 'Use non-interactive mode',
        };
    }
    return { supported: true };
}
/**
 * Shows UI support information
 */
function showUISupport() {
    const support = checkUISupport();
    console.log(chalk_1.default.cyan.bold('🖥️  UI Support Information'));
    console.log(chalk_1.default.gray('─'.repeat(40)));
    if (support.supported) {
        console.log(chalk_1.default.green('✅ Interactive UI supported'));
        console.log(chalk_1.default.gray('Your terminal supports all UI features'));
    }
    else {
        console.log(chalk_1.default.yellow('⚠️  Limited UI support'));
        console.log(chalk_1.default.gray(`Reason: ${support.reason}`));
        if (support.recommendation) {
            console.log(chalk_1.default.blue(`Recommendation: ${support.recommendation}`));
        }
    }
    console.log();
    console.log(chalk_1.default.white('Environment details:'));
    console.log(chalk_1.default.gray(`• Terminal: ${process.env.TERM || 'unknown'}`));
    console.log(chalk_1.default.gray(`• TTY: ${process.stdin.isTTY ? 'yes' : 'no'}`));
    console.log(chalk_1.default.gray(`• Program: ${process.env.TERM_PROGRAM || 'unknown'}`));
    console.log(chalk_1.default.gray(`• Platform: ${process.platform}`));
}
//# sourceMappingURL=fallback-handler.js.map