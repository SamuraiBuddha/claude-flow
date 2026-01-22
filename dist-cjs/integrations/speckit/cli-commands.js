"use strict";
/**
 * CLI Commands for SpecKit Integration
 * Registers speckit:init, speckit:status, speckit:workflow commands
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
exports.speckitCommand = void 0;
exports.registerSpecKitCommands = registerSpecKitCommands;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const cli_table3_1 = __importDefault(require("cli-table3"));
const inquirer_1 = __importDefault(require("inquirer"));
const node_fs_1 = require("node:fs");
const path = __importStar(require("node:path"));
const index_js_1 = require("./index.js");
// ===== Global Integration Instance =====
let integrationInstance = null;
async function getIntegration() {
    if (!integrationInstance) {
        integrationInstance = await (0, index_js_1.createFullIntegration)({
            autoInitialize: true,
        });
    }
    return integrationInstance;
}
// ===== Main SpecKit Command =====
exports.speckitCommand = new commander_1.Command()
    .name('speckit')
    .description('SpecKit integration - Specification-Driven Development workflow')
    .action(() => {
    exports.speckitCommand.outputHelp();
});
// ===== Init Command =====
exports.speckitCommand
    .command('init')
    .description('Initialize SpecKit integration in current project')
    .option('-d, --db-path <path>', 'Path to SQLite database', './.speckit/speckit.db')
    .option('-s, --specs-dir <path>', 'Directory for specifications', './specs')
    .option('-f, --force', 'Overwrite existing configuration')
    .option('--wizard', 'Run interactive configuration wizard')
    .action(async (options) => {
    if (options.wizard) {
        await runInitWizard();
    }
    else {
        await initSpecKit(options);
    }
});
async function initSpecKit(options) {
    console.log(chalk_1.default.cyan.bold('Initializing SpecKit Integration'));
    console.log(chalk_1.default.gray('─'.repeat(50)));
    try {
        // Create directories
        const dbDir = path.dirname(options.dbPath);
        await node_fs_1.promises.mkdir(dbDir, { recursive: true });
        await node_fs_1.promises.mkdir(options.specsDir, { recursive: true });
        console.log(chalk_1.default.green('  [OK]') + ' Created database directory: ' + chalk_1.default.gray(dbDir));
        console.log(chalk_1.default.green('  [OK]') + ' Created specs directory: ' + chalk_1.default.gray(options.specsDir));
        // Create config file
        const configPath = './.speckit/config.json';
        const config = {
            dbPath: options.dbPath,
            specsDirectory: options.specsDir,
            autoInitialize: true,
            dashboard: {
                refreshInterval: 5000,
            },
            audit: {
                retentionDays: 90,
                minSeverity: 'info',
            },
            gates: {
                strictMode: true,
                allowOverrides: true,
            },
            workflow: {
                maxConcurrentWorkflows: 5,
            },
        };
        await node_fs_1.promises.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
        console.log(chalk_1.default.green('  [OK]') + ' Created config file: ' + chalk_1.default.gray(configPath));
        // Initialize integration
        const integration = await (0, index_js_1.createFullIntegration)(config);
        await integration.initialize();
        console.log(chalk_1.default.green('  [OK]') + ' Integration initialized');
        // Create example spec structure
        const exampleSpecDir = path.join(options.specsDir, '000-example');
        await node_fs_1.promises.mkdir(exampleSpecDir, { recursive: true });
        const exampleSpec = `# Example Specification

## Overview
This is an example specification template.

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2
`;
        await node_fs_1.promises.writeFile(path.join(exampleSpecDir, 'spec.md'), exampleSpec, 'utf-8');
        console.log(chalk_1.default.green('  [OK]') + ' Created example specification');
        console.log();
        console.log(chalk_1.default.green.bold('SpecKit integration initialized successfully!'));
        console.log();
        console.log(chalk_1.default.white('Next steps:'));
        console.log('  1. Create specifications in ' + chalk_1.default.cyan(options.specsDir));
        console.log('  2. Run ' + chalk_1.default.cyan('speckit status') + ' to view dashboard');
        console.log('  3. Run ' + chalk_1.default.cyan('speckit workflow start') + ' to begin a workflow');
        await integration.shutdown();
    }
    catch (error) {
        console.error(chalk_1.default.red('Initialization failed:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
async function runInitWizard() {
    console.log(chalk_1.default.cyan.bold('SpecKit Configuration Wizard'));
    console.log(chalk_1.default.gray('─'.repeat(50)));
    console.log();
    const answers = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'dbPath',
            message: 'Database path:',
            default: './.speckit/speckit.db',
        },
        {
            type: 'input',
            name: 'specsDir',
            message: 'Specifications directory:',
            default: './specs',
        },
        {
            type: 'confirm',
            name: 'enableAudit',
            message: 'Enable audit trail?',
            default: true,
        },
        {
            type: 'number',
            name: 'retentionDays',
            message: 'Audit retention (days):',
            default: 90,
            when: (ans) => ans.enableAudit,
        },
        {
            type: 'confirm',
            name: 'strictGates',
            message: 'Use strict gate mode? (fail on any mandatory requirement)',
            default: true,
        },
        {
            type: 'number',
            name: 'maxWorkflows',
            message: 'Maximum concurrent workflows:',
            default: 5,
        },
    ]);
    await initSpecKit({
        dbPath: answers.dbPath,
        specsDir: answers.specsDir,
    });
}
// ===== Status Command =====
exports.speckitCommand
    .command('status')
    .description('Show SpecKit status dashboard')
    .option('-f, --format <format>', 'Output format (table, json, html)', 'table')
    .option('-w, --watch', 'Watch mode - continuously update')
    .option('-i, --interval <seconds>', 'Update interval in seconds', '5')
    .option('--specs', 'Show specifications only')
    .option('--plans', 'Show plans only')
    .option('--tasks', 'Show tasks only')
    .option('--agents', 'Show agents only')
    .option('--gates', 'Show gate status')
    .option('--audit', 'Show recent audit entries')
    .action(async (options) => {
    try {
        const integration = await getIntegration();
        if (options.watch) {
            await watchStatus(integration, options);
        }
        else {
            await showStatus(integration, options);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
async function showStatus(integration, options) {
    // Full dashboard
    if (!options.specs && !options.plans && !options.tasks && !options.agents && !options.gates && !options.audit) {
        const output = integration.dashboard.render(options.format);
        console.log(output);
        return;
    }
    // Specific views
    if (options.gates) {
        showGateStatus(integration);
    }
    if (options.audit) {
        showAuditEntries(integration);
    }
}
async function watchStatus(integration, options) {
    const interval = parseInt(options.interval) * 1000;
    console.log(chalk_1.default.cyan('Watching SpecKit status...'));
    console.log(chalk_1.default.gray(`Update interval: ${options.interval}s`));
    console.log(chalk_1.default.gray('Press Ctrl+C to stop'));
    console.log();
    const update = () => {
        console.clear();
        console.log(chalk_1.default.cyan.bold('SpecKit Status Monitor'));
        console.log(chalk_1.default.gray(`Last updated: ${new Date().toLocaleTimeString()}`));
        console.log();
        const output = integration.dashboard.render(options.format);
        console.log(output);
    };
    update();
    setInterval(update, interval);
}
function showGateStatus(integration) {
    console.log(chalk_1.default.cyan.bold('Gate Status'));
    console.log(chalk_1.default.gray('─'.repeat(50)));
    const allGates = integration.gates.getAllGates();
    const table = new cli_table3_1.default({
        head: ['Gate', 'Status', 'Requirements', 'Last Check'],
    });
    for (const gate of allGates) {
        const state = integration.gates.getGateStatus(gate.id);
        const statusColor = getStatusColor(state?.status || 'pending');
        table.push([
            chalk_1.default.white(gate.name),
            statusColor(state?.status || 'pending'),
            `${gate.requirements.length} total`,
            state?.lastCheckedAt ? state.lastCheckedAt.toLocaleString() : '-',
        ]);
    }
    console.log(table.toString());
}
function showAuditEntries(integration, limit = 20) {
    console.log(chalk_1.default.cyan.bold('Recent Audit Entries'));
    console.log(chalk_1.default.gray('─'.repeat(50)));
    const entries = integration.audit.query({ limit, sortOrder: 'desc' });
    if (entries.length === 0) {
        console.log(chalk_1.default.gray('No audit entries found'));
        return;
    }
    const table = new cli_table3_1.default({
        head: ['Time', 'Action', 'Description', 'By', 'Status'],
    });
    for (const entry of entries) {
        const statusIcon = entry.success ? chalk_1.default.green('[OK]') : chalk_1.default.red('[FAIL]');
        table.push([
            entry.timestamp.toLocaleTimeString(),
            entry.action,
            entry.description.slice(0, 40) + (entry.description.length > 40 ? '...' : ''),
            entry.initiatedBy,
            statusIcon,
        ]);
    }
    console.log(table.toString());
}
// ===== Workflow Command =====
exports.speckitCommand
    .command('workflow')
    .description('Manage SpecKit workflows')
    .action(() => {
    exports.speckitCommand.commands.find(c => c.name() === 'workflow')?.outputHelp();
});
// Workflow subcommands
exports.speckitCommand
    .command('workflow:start')
    .description('Start a new workflow')
    .option('-n, --name <name>', 'Workflow name')
    .option('-s, --spec <specId>', 'Specification ID to use')
    .option('-w, --workflow-id <id>', 'Workflow definition ID', 'default-speckit-workflow')
    .action(async (options) => {
    try {
        const integration = await getIntegration();
        const name = options.name || `Workflow-${Date.now()}`;
        console.log(chalk_1.default.cyan(`Starting workflow: ${name}`));
        const instance = await integration.workflow.startWorkflow(options.workflowId, {
            name,
            context: options.spec ? { specId: options.spec } : undefined,
        });
        console.log(chalk_1.default.green('Workflow started successfully'));
        console.log();
        console.log(chalk_1.default.white('ID:') + ' ' + instance.id);
        console.log(chalk_1.default.white('Phase:') + ' ' + instance.currentPhase);
        console.log(chalk_1.default.white('Status:') + ' ' + instance.status);
        console.log();
        console.log(chalk_1.default.gray('Use "speckit workflow:status ' + instance.id + '" to check progress'));
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to start workflow:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
exports.speckitCommand
    .command('workflow:status')
    .description('Show workflow status')
    .argument('[workflow-id]', 'Workflow instance ID (shows all if omitted)')
    .option('-w, --watch', 'Watch mode')
    .action(async (workflowId, options) => {
    try {
        const integration = await getIntegration();
        if (workflowId) {
            const instance = integration.workflow.getWorkflowInstance(workflowId);
            if (!instance) {
                console.error(chalk_1.default.red(`Workflow '${workflowId}' not found`));
                process.exit(1);
            }
            displayWorkflowInstance(instance);
        }
        else {
            const instances = integration.workflow.getAllInstances();
            if (instances.length === 0) {
                console.log(chalk_1.default.gray('No workflows found'));
                return;
            }
            const table = new cli_table3_1.default({
                head: ['ID', 'Name', 'Status', 'Phase', 'Started'],
            });
            for (const instance of instances) {
                const statusColor = getStatusColor(instance.status);
                table.push([
                    instance.id.slice(0, 12) + '...',
                    instance.name.slice(0, 25),
                    statusColor(instance.status),
                    instance.currentPhase,
                    instance.startedAt.toLocaleString(),
                ]);
            }
            console.log(table.toString());
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
exports.speckitCommand
    .command('workflow:advance')
    .description('Advance workflow to next phase')
    .argument('<workflow-id>', 'Workflow instance ID')
    .option('-p, --phase <phase>', 'Target phase (auto if omitted)')
    .action(async (workflowId, options) => {
    try {
        const integration = await getIntegration();
        console.log(chalk_1.default.cyan(`Advancing workflow: ${workflowId}`));
        const instance = await integration.workflow.advancePhase(workflowId, options.phase);
        console.log(chalk_1.default.green('Workflow advanced'));
        console.log(chalk_1.default.white('New Phase:') + ' ' + instance.currentPhase);
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to advance:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
exports.speckitCommand
    .command('workflow:cancel')
    .description('Cancel a running workflow')
    .argument('<workflow-id>', 'Workflow instance ID')
    .option('-r, --reason <reason>', 'Cancellation reason')
    .action(async (workflowId, options) => {
    try {
        const integration = await getIntegration();
        console.log(chalk_1.default.yellow(`Cancelling workflow: ${workflowId}`));
        await integration.workflow.cancelWorkflow(workflowId, options.reason);
        console.log(chalk_1.default.green('Workflow cancelled'));
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to cancel:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
// ===== Gate Commands =====
exports.speckitCommand
    .command('gate:check')
    .description('Check a specific gate')
    .argument('<gate-id>', 'Gate ID (e.g., SPEC_APPROVED)')
    .action(async (gateId) => {
    try {
        const integration = await getIntegration();
        console.log(chalk_1.default.cyan(`Checking gate: ${gateId}`));
        const result = await integration.gates.checkGate(gateId);
        const statusColor = result.status === 'passed' ? chalk_1.default.green : chalk_1.default.red;
        console.log();
        console.log(chalk_1.default.white('Status:') + ' ' + statusColor(result.status));
        console.log(chalk_1.default.white('Score:') + ' ' + result.score.toFixed(1) + '%');
        console.log(chalk_1.default.white('Passed:') + ' ' + result.passedRequirements.join(', ') || 'none');
        console.log(chalk_1.default.white('Failed:') + ' ' + result.failedRequirements.join(', ') || 'none');
        if (result.error) {
            console.log(chalk_1.default.red('Error:') + ' ' + result.error);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
exports.speckitCommand
    .command('gate:pass')
    .description('Manually pass a gate (override)')
    .argument('<gate-id>', 'Gate ID')
    .option('-b, --by <name>', 'Override approved by', 'cli-user')
    .action(async (gateId, options) => {
    try {
        const integration = await getIntegration();
        integration.gates.passGate(gateId, options.by);
        console.log(chalk_1.default.green(`Gate '${gateId}' manually passed`));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
// ===== Audit Commands =====
exports.speckitCommand
    .command('audit:query')
    .description('Query audit trail')
    .option('-a, --action <action>', 'Filter by action type')
    .option('-s, --severity <level>', 'Filter by severity')
    .option('-l, --limit <number>', 'Maximum entries', '50')
    .option('--agent <id>', 'Filter by agent ID')
    .option('--artifact <id>', 'Filter by artifact ID')
    .option('--failed', 'Show only failed entries')
    .option('-f, --format <format>', 'Output format (table, json)', 'table')
    .action(async (options) => {
    try {
        const integration = await getIntegration();
        const entries = integration.audit.query({
            action: options.action,
            severity: options.severity,
            agentId: options.agent,
            artifactId: options.artifact,
            success: options.failed ? false : undefined,
            limit: parseInt(options.limit),
        });
        if (options.format === 'json') {
            console.log(JSON.stringify(entries, null, 2));
        }
        else {
            if (entries.length === 0) {
                console.log(chalk_1.default.gray('No audit entries found'));
                return;
            }
            const table = new cli_table3_1.default({
                head: ['Time', 'Action', 'Description', 'Status'],
            });
            for (const entry of entries) {
                table.push([
                    entry.timestamp.toLocaleString(),
                    entry.action,
                    entry.description.slice(0, 50),
                    entry.success ? chalk_1.default.green('[OK]') : chalk_1.default.red('[FAIL]'),
                ]);
            }
            console.log(table.toString());
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
exports.speckitCommand
    .command('audit:export')
    .description('Export audit trail')
    .argument('<output-path>', 'Output file path')
    .option('-f, --format <format>', 'Export format (json, csv, ndjson)', 'json')
    .option('--include-details', 'Include full details')
    .option('--include-states', 'Include state changes')
    .action(async (outputPath, options) => {
    try {
        const integration = await getIntegration();
        await integration.audit.exportToFile(outputPath, {
            format: options.format,
            includeDetails: options.includeDetails,
            includeStates: options.includeStates,
            pretty: true,
        });
        console.log(chalk_1.default.green(`Audit trail exported to: ${outputPath}`));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
// ===== Helper Functions =====
function displayWorkflowInstance(instance) {
    console.log(chalk_1.default.cyan.bold('Workflow Details'));
    console.log(chalk_1.default.gray('─'.repeat(50)));
    const statusColor = getStatusColor(instance.status);
    console.log(chalk_1.default.white('ID:') + ' ' + instance.id);
    console.log(chalk_1.default.white('Name:') + ' ' + instance.name);
    console.log(chalk_1.default.white('Status:') + ' ' + statusColor(instance.status));
    console.log(chalk_1.default.white('Current Phase:') + ' ' + instance.currentPhase);
    console.log(chalk_1.default.white('Started:') + ' ' + instance.startedAt.toLocaleString());
    if (instance.completedAt) {
        console.log(chalk_1.default.white('Completed:') + ' ' + instance.completedAt.toLocaleString());
    }
    if (instance.error) {
        console.log(chalk_1.default.red('Error:') + ' ' + instance.error);
    }
    console.log();
    console.log(chalk_1.default.cyan.bold('Phase History'));
    console.log(chalk_1.default.gray('─'.repeat(50)));
    const table = new cli_table3_1.default({
        head: ['Phase', 'Status', 'Entered', 'Duration'],
    });
    for (const entry of instance.phaseHistory) {
        const phaseStatus = entry.status === 'completed' ? chalk_1.default.green(entry.status) :
            entry.status === 'failed' ? chalk_1.default.red(entry.status) :
                chalk_1.default.yellow(entry.status);
        table.push([
            entry.phase,
            phaseStatus,
            entry.enteredAt.toLocaleTimeString(),
            entry.duration ? formatDuration(entry.duration) : '-',
        ]);
    }
    console.log(table.toString());
}
function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'passed':
        case 'completed':
        case 'running':
        case 'ready':
            return chalk_1.default.green;
        case 'pending':
        case 'checking':
        case 'paused':
            return chalk_1.default.yellow;
        case 'failed':
        case 'blocked':
        case 'error':
            return chalk_1.default.red;
        default:
            return chalk_1.default.gray;
    }
}
function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0)
        return `${hours}h ${minutes % 60}m`;
    if (minutes > 0)
        return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}
// ===== Registration Function =====
/**
 * Register SpecKit commands with a Commander program
 */
function registerSpecKitCommands(program) {
    program.addCommand(exports.speckitCommand);
    // Also register shorthand aliases
    program
        .command('speckit-init')
        .description('Alias for speckit init')
        .action(() => {
        exports.speckitCommand.parse(['node', 'cli', 'init', ...process.argv.slice(3)]);
    });
    program
        .command('speckit-status')
        .description('Alias for speckit status')
        .action(() => {
        exports.speckitCommand.parse(['node', 'cli', 'status', ...process.argv.slice(3)]);
    });
}
exports.default = {
    speckitCommand: exports.speckitCommand,
    registerSpecKitCommands,
};
//# sourceMappingURL=cli-commands.js.map