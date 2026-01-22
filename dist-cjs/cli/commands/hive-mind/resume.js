#!/usr/bin/env node
"use strict";
/**
 * Hive Mind Resume Command
 *
 * Resume paused swarm sessions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const session_manager_js_1 = require("../../simple-commands/hive-mind/session-manager.js");
const inquirer_1 = __importDefault(require("inquirer"));
exports.resumeCommand = new commander_1.Command('resume')
    .description('Resume paused hive mind sessions')
    .option('-s, --session <id>', 'Resume specific session by ID')
    .action(async (options) => {
    const sessionManager = new session_manager_js_1.HiveMindSessionManager();
    try {
        if (options.session) {
            // Resume specific session
            const sessionId = options.session;
            console.log(chalk_1.default.cyan(`Resuming session ${sessionId}...`));
            const session = await sessionManager.resumeSession(sessionId);
            console.log(chalk_1.default.green(`✓ Session ${sessionId} resumed successfully`));
            console.log(chalk_1.default.gray(`Swarm: ${session.swarm_name || 'N/A'}`));
            console.log(chalk_1.default.gray(`Objective: ${session.objective || 'N/A'}`));
            console.log(chalk_1.default.gray(`Progress: ${session.statistics.completionPercentage}%`));
        }
        else {
            // Interactive selection
            const sessions = await sessionManager.getActiveSessions();
            const pausedSessions = sessions.filter((s) => s.status === 'paused');
            if (pausedSessions.length === 0) {
                console.log(chalk_1.default.yellow('No paused sessions found to resume'));
                return;
            }
            const { sessionId } = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'sessionId',
                    message: 'Select session to resume:',
                    choices: pausedSessions.map((s) => ({
                        name: `${s.swarm_name} (${s.id}) - ${s.completion_percentage}% complete`,
                        value: s.id,
                    })),
                },
            ]);
            console.log(chalk_1.default.cyan(`Resuming session ${sessionId}...`));
            const session = await sessionManager.resumeSession(sessionId);
            console.log(chalk_1.default.green(`✓ Session resumed successfully`));
            console.log(chalk_1.default.gray(`Swarm: ${session.swarm_name || 'N/A'}`));
            console.log(chalk_1.default.gray(`Objective: ${session.objective || 'N/A'}`));
            console.log(chalk_1.default.gray(`Progress: ${session.statistics.completionPercentage}%`));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error resuming session:'), error.message);
        process.exit(1);
    }
    finally {
        sessionManager.close();
    }
});
//# sourceMappingURL=resume.js.map