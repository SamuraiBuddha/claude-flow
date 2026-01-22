"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.claudeCommand = void 0;
/**
 * Claude instance management commands
 */
const node_fs_1 = require("node:fs");
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const node_child_process_1 = require("node:child_process");
const helpers_js_1 = require("../../utils/helpers.js");
exports.claudeCommand = new commander_1.Command()
    .name('claude')
    .description('Manage Claude instances')
    .action(() => {
    exports.claudeCommand.help();
});
// Spawn command
exports.claudeCommand
    .command('spawn')
    .description('Spawn a new Claude instance with specific configuration')
    .arguments('<task>')
    .option('-t, --tools <tools>', 'Allowed tools (comma-separated)', 'View,Edit,Replace,GlobTool,GrepTool,LS,Bash')
    .option('--no-permissions', 'Use --dangerously-skip-permissions flag')
    .option('-c, --config <config>', 'MCP config file path')
    .option('-m, --mode <mode>', 'Development mode (full, backend-only, frontend-only, api-only)', 'full')
    .option('--parallel', 'Enable parallel execution with BatchTool')
    .option('--research', 'Enable web research with WebFetchTool')
    .option('--coverage <coverage>', 'Test coverage target', '80')
    .option('--commit <frequency>', 'Commit frequency (phase, feature, manual)', 'phase')
    .option('-v, --verbose', 'Enable verbose output')
    .option('--dry-run', 'Show what would be executed without running')
    .action(async (task, options) => {
    try {
        const instanceId = (0, helpers_js_1.generateId)('claude');
        // Build allowed tools list
        let tools = options.tools;
        if (options.parallel && !tools.includes('BatchTool')) {
            tools += ',BatchTool,dispatch_agent';
        }
        if (options.research && !tools.includes('WebFetchTool')) {
            tools += ',WebFetchTool';
        }
        // Build Claude command
        const claudeArgs = [task];
        claudeArgs.push('--allowedTools', tools);
        if (options.noPermissions) {
            claudeArgs.push('--dangerously-skip-permissions');
        }
        if (options.config) {
            claudeArgs.push('--mcp-config', options.config);
        }
        if (options.verbose) {
            claudeArgs.push('--verbose');
        }
        if (options.dryRun) {
            console.log(chalk_1.default.yellow('DRY RUN - Would execute:'));
            console.log(chalk_1.default.gray(`claude ${claudeArgs.join(' ')}`));
            console.log('\nConfiguration:');
            console.log(`  Instance ID: ${instanceId}`);
            console.log(`  Task: ${task}`);
            console.log(`  Tools: ${tools}`);
            console.log(`  Mode: ${options.mode}`);
            console.log(`  Coverage: ${parseInt(options.coverage)}%`);
            console.log(`  Commit: ${options.commit}`);
            return;
        }
        console.log(chalk_1.default.green(`Spawning Claude instance: ${instanceId}`));
        console.log(chalk_1.default.gray(`Task: ${task}`));
        console.log(chalk_1.default.gray(`Tools: ${tools}`));
        // Spawn Claude process
        const claude = (0, node_child_process_1.spawn)('claude', claudeArgs, {
            stdio: 'inherit',
            env: {
                ...process.env,
                CLAUDE_INSTANCE_ID: instanceId,
                CLAUDE_FLOW_MODE: options.mode,
                CLAUDE_FLOW_COVERAGE: parseInt(options.coverage).toString(),
                CLAUDE_FLOW_COMMIT: options.commit,
            },
        });
        claude.on('error', (err) => {
            console.error(chalk_1.default.red('Failed to spawn Claude:'), err.message);
        });
        claude.on('exit', (code) => {
            if (code === 0) {
                console.log(chalk_1.default.green(`Claude instance ${instanceId} completed successfully`));
            }
            else {
                console.log(chalk_1.default.red(`Claude instance ${instanceId} exited with code ${code}`));
            }
        });
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to spawn Claude:'), error.message);
    }
});
// Batch command
exports.claudeCommand
    .command('batch')
    .description('Spawn multiple Claude instances from workflow')
    .arguments('<workflow-file>')
    .option('--dry-run', 'Show what would be executed without running')
    .action(async (workflowFile, options) => {
    try {
        const content = await node_fs_1.promises.readFile(workflowFile, 'utf-8');
        const workflow = JSON.parse(content);
        console.log(chalk_1.default.green('Loading workflow:'), workflow.name || 'Unnamed');
        console.log(chalk_1.default.gray(`Tasks: ${workflow.tasks?.length || 0}`));
        if (!workflow.tasks || workflow.tasks.length === 0) {
            console.log(chalk_1.default.yellow('No tasks found in workflow'));
            return;
        }
        for (const task of workflow.tasks) {
            const claudeArgs = [task.description || task.name];
            // Add tools
            if (task.tools) {
                claudeArgs.push('--allowedTools', Array.isArray(task.tools) ? task.tools.join(',') : task.tools);
            }
            // Add flags
            if (task.skipPermissions) {
                claudeArgs.push('--dangerously-skip-permissions');
            }
            if (task.config) {
                claudeArgs.push('--mcp-config', task.config);
            }
            if (options.dryRun) {
                console.log(chalk_1.default.yellow(`\nDRY RUN - Task: ${task.name || task.id}`));
                console.log(chalk_1.default.gray(`claude ${claudeArgs.join(' ')}`));
            }
            else {
                console.log(chalk_1.default.blue(`\nSpawning Claude for task: ${task.name || task.id}`));
                const claude = (0, node_child_process_1.spawn)('claude', claudeArgs, {
                    stdio: 'inherit',
                    env: {
                        ...process.env,
                        CLAUDE_TASK_ID: task.id || (0, helpers_js_1.generateId)('task'),
                        CLAUDE_TASK_TYPE: task.type || 'general',
                    },
                });
                // Wait for completion if sequential
                if (!workflow.parallel) {
                    await new Promise((resolve) => {
                        claude.on('exit', resolve);
                    });
                }
            }
        }
        if (!options.dryRun && workflow.parallel) {
            console.log(chalk_1.default.green('\nAll Claude instances spawned in parallel mode'));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to process workflow:'), error.message);
    }
});
//# sourceMappingURL=claude.js.map