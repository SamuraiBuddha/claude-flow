"use strict";
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
exports.logger = exports.MigrationLogger = void 0;
const process = __importStar(require("node:process"));
/**
 * Migration Logger - Structured logging for migration operations
 */
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const chalk = __importStar(require("chalk"));
class MigrationLogger {
    logFile;
    entries = [];
    constructor(logFile) {
        this.logFile = logFile;
    }
    info(message, context) {
        this.log('info', message, context);
        console.log(chalk.blue(`ℹ️  ${message}`));
    }
    warn(message, context) {
        this.log('warn', message, context);
        console.log(chalk.yellow(`⚠️  ${message}`));
    }
    error(message, error, context) {
        this.log('error', message, context, error?.stack);
        console.log(chalk.red(`❌ ${message}`));
        if (error && (error instanceof Error ? error.message : String(error)) !== message) {
            console.log(chalk.red(`   ${error instanceof Error ? error.message : String(error)}`));
        }
    }
    success(message, context) {
        this.log('success', message, context);
        console.log(chalk.green(`✅ ${message}`));
    }
    debug(message, context) {
        if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') {
            this.log('debug', message, context);
            console.log(chalk.gray(`🔍 ${message}`));
        }
    }
    log(level, message, context, stack) {
        const entry = {
            timestamp: new Date(),
            level,
            message,
            context,
            stack,
        };
        this.entries.push(entry);
        if (this.logFile) {
            this.writeToFile(entry);
        }
    }
    async writeToFile(entry) {
        if (!this.logFile)
            return;
        try {
            const logDir = path.dirname(this.logFile);
            await fs.ensureDir(logDir);
            const logLine = JSON.stringify(entry) + '\n';
            await fs.appendFile(this.logFile, logLine);
        }
        catch (error) {
            // Prevent recursive logging
            console.error('Failed to write to log file:', error instanceof Error ? error.message : String(error));
        }
    }
    async saveToFile(filePath) {
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeJson(filePath, this.entries, { spaces: 2 });
    }
    getEntries() {
        return [...this.entries];
    }
    getEntriesByLevel(level) {
        return this.entries.filter((entry) => entry.level === level);
    }
    clear() {
        this.entries = [];
    }
    printSummary() {
        const summary = {
            total: this.entries.length,
            info: this.getEntriesByLevel('info').length,
            warn: this.getEntriesByLevel('warn').length,
            error: this.getEntriesByLevel('error').length,
            success: this.getEntriesByLevel('success').length,
            debug: this.getEntriesByLevel('debug').length,
        };
        console.log(chalk.bold('\n📊 Migration Log Summary'));
        console.log(chalk.gray('─'.repeat(30)));
        console.log(`Total entries: ${summary.total}`);
        console.log(`${chalk.blue('Info:')} ${summary.info}`);
        console.log(`${chalk.green('Success:')} ${summary.success}`);
        console.log(`${chalk.yellow('Warnings:')} ${summary.warn}`);
        console.log(`${chalk.red('Errors:')} ${summary.error}`);
        if (summary.debug > 0) {
            console.log(`${chalk.gray('Debug:')} ${summary.debug}`);
        }
        console.log(chalk.gray('─'.repeat(30)));
    }
}
exports.MigrationLogger = MigrationLogger;
// Global logger instance
exports.logger = new MigrationLogger();
// Set log file if in production
if (process.env.NODE_ENV === 'production') {
    const logFile = path.join(process.cwd(), 'logs', 'migration.log');
    exports.logger['logFile'] = logFile;
}
//# sourceMappingURL=logger.js.map