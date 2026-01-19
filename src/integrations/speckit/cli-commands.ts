/**
 * CLI Commands for SpecKit Integration
 * Registers speckit:init, speckit:status, speckit:workflow commands
 */

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import inquirer from 'inquirer';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import {
  createFullIntegration,
  type FullIntegrationInstance,
  type FullIntegrationConfig,
  getDefaultDbPath,
  getSpecsDirectory,
} from './index.js';

import type { WorkflowInstance, WorkflowPhase } from './process/workflow-engine.js';
import type { GateCheckResult } from './process/gates.js';
import type { AuditEntry } from './audit/audit-trail.js';

// ===== Global Integration Instance =====

let integrationInstance: FullIntegrationInstance | null = null;

async function getIntegration(): Promise<FullIntegrationInstance> {
  if (!integrationInstance) {
    integrationInstance = await createFullIntegration({
      autoInitialize: true,
    });
  }
  return integrationInstance;
}

// ===== Main SpecKit Command =====

export const speckitCommand = new Command()
  .name('speckit')
  .description('SpecKit integration - Specification-Driven Development workflow')
  .action(() => {
    speckitCommand.outputHelp();
  });

// ===== Init Command =====

speckitCommand
  .command('init')
  .description('Initialize SpecKit integration in current project')
  .option('-d, --db-path <path>', 'Path to SQLite database', './.speckit/speckit.db')
  .option('-s, --specs-dir <path>', 'Directory for specifications', './specs')
  .option('-f, --force', 'Overwrite existing configuration')
  .option('--wizard', 'Run interactive configuration wizard')
  .action(async (options) => {
    if (options.wizard) {
      await runInitWizard();
    } else {
      await initSpecKit(options);
    }
  });

async function initSpecKit(options: {
  dbPath: string;
  specsDir: string;
  force?: boolean;
}): Promise<void> {
  console.log(chalk.cyan.bold('Initializing SpecKit Integration'));
  console.log(chalk.gray('─'.repeat(50)));

  try {
    // Create directories
    const dbDir = path.dirname(options.dbPath);
    await fs.mkdir(dbDir, { recursive: true });
    await fs.mkdir(options.specsDir, { recursive: true });

    console.log(chalk.green('  [OK]') + ' Created database directory: ' + chalk.gray(dbDir));
    console.log(chalk.green('  [OK]') + ' Created specs directory: ' + chalk.gray(options.specsDir));

    // Create config file
    const configPath = './.speckit/config.json';
    const config: FullIntegrationConfig = {
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

    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log(chalk.green('  [OK]') + ' Created config file: ' + chalk.gray(configPath));

    // Initialize integration
    const integration = await createFullIntegration(config);
    await integration.initialize();
    console.log(chalk.green('  [OK]') + ' Integration initialized');

    // Create example spec structure
    const exampleSpecDir = path.join(options.specsDir, '000-example');
    await fs.mkdir(exampleSpecDir, { recursive: true });

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

    await fs.writeFile(path.join(exampleSpecDir, 'spec.md'), exampleSpec, 'utf-8');
    console.log(chalk.green('  [OK]') + ' Created example specification');

    console.log();
    console.log(chalk.green.bold('SpecKit integration initialized successfully!'));
    console.log();
    console.log(chalk.white('Next steps:'));
    console.log('  1. Create specifications in ' + chalk.cyan(options.specsDir));
    console.log('  2. Run ' + chalk.cyan('speckit status') + ' to view dashboard');
    console.log('  3. Run ' + chalk.cyan('speckit workflow start') + ' to begin a workflow');

    await integration.shutdown();
  } catch (error) {
    console.error(chalk.red('Initialization failed:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function runInitWizard(): Promise<void> {
  console.log(chalk.cyan.bold('SpecKit Configuration Wizard'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  const answers = await inquirer.prompt([
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

speckitCommand
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
      } else {
        await showStatus(integration, options);
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

async function showStatus(
  integration: FullIntegrationInstance,
  options: {
    format: string;
    specs?: boolean;
    plans?: boolean;
    tasks?: boolean;
    agents?: boolean;
    gates?: boolean;
    audit?: boolean;
  }
): Promise<void> {
  // Full dashboard
  if (!options.specs && !options.plans && !options.tasks && !options.agents && !options.gates && !options.audit) {
    const output = integration.dashboard.render(options.format as any);
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

async function watchStatus(
  integration: FullIntegrationInstance,
  options: { interval: string; format: string }
): Promise<void> {
  const interval = parseInt(options.interval) * 1000;

  console.log(chalk.cyan('Watching SpecKit status...'));
  console.log(chalk.gray(`Update interval: ${options.interval}s`));
  console.log(chalk.gray('Press Ctrl+C to stop'));
  console.log();

  const update = () => {
    console.clear();
    console.log(chalk.cyan.bold('SpecKit Status Monitor'));
    console.log(chalk.gray(`Last updated: ${new Date().toLocaleTimeString()}`));
    console.log();

    const output = integration.dashboard.render(options.format as any);
    console.log(output);
  };

  update();
  setInterval(update, interval);
}

function showGateStatus(integration: FullIntegrationInstance): void {
  console.log(chalk.cyan.bold('Gate Status'));
  console.log(chalk.gray('─'.repeat(50)));

  const allGates = integration.gates.getAllGates();
  const table = new Table({
    head: ['Gate', 'Status', 'Requirements', 'Last Check'],
  });

  for (const gate of allGates) {
    const state = integration.gates.getGateStatus(gate.id);
    const statusColor = getStatusColor(state?.status || 'pending');

    table.push([
      chalk.white(gate.name),
      statusColor(state?.status || 'pending'),
      `${gate.requirements.length} total`,
      state?.lastCheckedAt ? state.lastCheckedAt.toLocaleString() : '-',
    ]);
  }

  console.log(table.toString());
}

function showAuditEntries(integration: FullIntegrationInstance, limit: number = 20): void {
  console.log(chalk.cyan.bold('Recent Audit Entries'));
  console.log(chalk.gray('─'.repeat(50)));

  const entries = integration.audit.query({ limit, sortOrder: 'desc' });

  if (entries.length === 0) {
    console.log(chalk.gray('No audit entries found'));
    return;
  }

  const table = new Table({
    head: ['Time', 'Action', 'Description', 'By', 'Status'],
  });

  for (const entry of entries) {
    const statusIcon = entry.success ? chalk.green('[OK]') : chalk.red('[FAIL]');

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

speckitCommand
  .command('workflow')
  .description('Manage SpecKit workflows')
  .action(() => {
    speckitCommand.commands.find(c => c.name() === 'workflow')?.outputHelp();
  });

// Workflow subcommands
speckitCommand
  .command('workflow:start')
  .description('Start a new workflow')
  .option('-n, --name <name>', 'Workflow name')
  .option('-s, --spec <specId>', 'Specification ID to use')
  .option('-w, --workflow-id <id>', 'Workflow definition ID', 'default-speckit-workflow')
  .action(async (options) => {
    try {
      const integration = await getIntegration();

      const name = options.name || `Workflow-${Date.now()}`;
      console.log(chalk.cyan(`Starting workflow: ${name}`));

      const instance = await integration.workflow.startWorkflow(options.workflowId, {
        name,
        context: options.spec ? { specId: options.spec } : undefined,
      });

      console.log(chalk.green('Workflow started successfully'));
      console.log();
      console.log(chalk.white('ID:') + ' ' + instance.id);
      console.log(chalk.white('Phase:') + ' ' + instance.currentPhase);
      console.log(chalk.white('Status:') + ' ' + instance.status);
      console.log();
      console.log(chalk.gray('Use "speckit workflow:status ' + instance.id + '" to check progress'));
    } catch (error) {
      console.error(chalk.red('Failed to start workflow:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

speckitCommand
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
          console.error(chalk.red(`Workflow '${workflowId}' not found`));
          process.exit(1);
        }
        displayWorkflowInstance(instance);
      } else {
        const instances = integration.workflow.getAllInstances();
        if (instances.length === 0) {
          console.log(chalk.gray('No workflows found'));
          return;
        }

        const table = new Table({
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
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

speckitCommand
  .command('workflow:advance')
  .description('Advance workflow to next phase')
  .argument('<workflow-id>', 'Workflow instance ID')
  .option('-p, --phase <phase>', 'Target phase (auto if omitted)')
  .action(async (workflowId, options) => {
    try {
      const integration = await getIntegration();

      console.log(chalk.cyan(`Advancing workflow: ${workflowId}`));

      const instance = await integration.workflow.advancePhase(
        workflowId,
        options.phase as WorkflowPhase | undefined
      );

      console.log(chalk.green('Workflow advanced'));
      console.log(chalk.white('New Phase:') + ' ' + instance.currentPhase);
    } catch (error) {
      console.error(chalk.red('Failed to advance:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

speckitCommand
  .command('workflow:cancel')
  .description('Cancel a running workflow')
  .argument('<workflow-id>', 'Workflow instance ID')
  .option('-r, --reason <reason>', 'Cancellation reason')
  .action(async (workflowId, options) => {
    try {
      const integration = await getIntegration();

      console.log(chalk.yellow(`Cancelling workflow: ${workflowId}`));

      await integration.workflow.cancelWorkflow(workflowId, options.reason);

      console.log(chalk.green('Workflow cancelled'));
    } catch (error) {
      console.error(chalk.red('Failed to cancel:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// ===== Gate Commands =====

speckitCommand
  .command('gate:check')
  .description('Check a specific gate')
  .argument('<gate-id>', 'Gate ID (e.g., SPEC_APPROVED)')
  .action(async (gateId) => {
    try {
      const integration = await getIntegration();

      console.log(chalk.cyan(`Checking gate: ${gateId}`));

      const result = await integration.gates.checkGate(gateId);

      const statusColor = result.status === 'passed' ? chalk.green : chalk.red;
      console.log();
      console.log(chalk.white('Status:') + ' ' + statusColor(result.status));
      console.log(chalk.white('Score:') + ' ' + result.score.toFixed(1) + '%');
      console.log(chalk.white('Passed:') + ' ' + result.passedRequirements.join(', ') || 'none');
      console.log(chalk.white('Failed:') + ' ' + result.failedRequirements.join(', ') || 'none');

      if (result.error) {
        console.log(chalk.red('Error:') + ' ' + result.error);
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

speckitCommand
  .command('gate:pass')
  .description('Manually pass a gate (override)')
  .argument('<gate-id>', 'Gate ID')
  .option('-b, --by <name>', 'Override approved by', 'cli-user')
  .action(async (gateId, options) => {
    try {
      const integration = await getIntegration();

      integration.gates.passGate(gateId, options.by);

      console.log(chalk.green(`Gate '${gateId}' manually passed`));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// ===== Audit Commands =====

speckitCommand
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
        action: options.action as any,
        severity: options.severity as any,
        agentId: options.agent,
        artifactId: options.artifact,
        success: options.failed ? false : undefined,
        limit: parseInt(options.limit),
      });

      if (options.format === 'json') {
        console.log(JSON.stringify(entries, null, 2));
      } else {
        if (entries.length === 0) {
          console.log(chalk.gray('No audit entries found'));
          return;
        }

        const table = new Table({
          head: ['Time', 'Action', 'Description', 'Status'],
        });

        for (const entry of entries) {
          table.push([
            entry.timestamp.toLocaleString(),
            entry.action,
            entry.description.slice(0, 50),
            entry.success ? chalk.green('[OK]') : chalk.red('[FAIL]'),
          ]);
        }

        console.log(table.toString());
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

speckitCommand
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
        format: options.format as any,
        includeDetails: options.includeDetails,
        includeStates: options.includeStates,
        pretty: true,
      });

      console.log(chalk.green(`Audit trail exported to: ${outputPath}`));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// ===== Helper Functions =====

function displayWorkflowInstance(instance: WorkflowInstance): void {
  console.log(chalk.cyan.bold('Workflow Details'));
  console.log(chalk.gray('─'.repeat(50)));

  const statusColor = getStatusColor(instance.status);

  console.log(chalk.white('ID:') + ' ' + instance.id);
  console.log(chalk.white('Name:') + ' ' + instance.name);
  console.log(chalk.white('Status:') + ' ' + statusColor(instance.status));
  console.log(chalk.white('Current Phase:') + ' ' + instance.currentPhase);
  console.log(chalk.white('Started:') + ' ' + instance.startedAt.toLocaleString());

  if (instance.completedAt) {
    console.log(chalk.white('Completed:') + ' ' + instance.completedAt.toLocaleString());
  }

  if (instance.error) {
    console.log(chalk.red('Error:') + ' ' + instance.error);
  }

  console.log();
  console.log(chalk.cyan.bold('Phase History'));
  console.log(chalk.gray('─'.repeat(50)));

  const table = new Table({
    head: ['Phase', 'Status', 'Entered', 'Duration'],
  });

  for (const entry of instance.phaseHistory) {
    const phaseStatus = entry.status === 'completed' ? chalk.green(entry.status) :
                        entry.status === 'failed' ? chalk.red(entry.status) :
                        chalk.yellow(entry.status);

    table.push([
      entry.phase,
      phaseStatus,
      entry.enteredAt.toLocaleTimeString(),
      entry.duration ? formatDuration(entry.duration) : '-',
    ]);
  }

  console.log(table.toString());
}

function getStatusColor(status: string): (text: string) => string {
  switch (status.toLowerCase()) {
    case 'passed':
    case 'completed':
    case 'running':
    case 'ready':
      return chalk.green;
    case 'pending':
    case 'checking':
    case 'paused':
      return chalk.yellow;
    case 'failed':
    case 'blocked':
    case 'error':
      return chalk.red;
    default:
      return chalk.gray;
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// ===== Registration Function =====

/**
 * Register SpecKit commands with a Commander program
 */
export function registerSpecKitCommands(program: Command): void {
  program.addCommand(speckitCommand);

  // Also register shorthand aliases
  program
    .command('speckit-init')
    .description('Alias for speckit init')
    .action(() => {
      speckitCommand.parse(['node', 'cli', 'init', ...process.argv.slice(3)]);
    });

  program
    .command('speckit-status')
    .description('Alias for speckit status')
    .action(() => {
      speckitCommand.parse(['node', 'cli', 'status', ...process.argv.slice(3)]);
    });
}

export default {
  speckitCommand,
  registerSpecKitCommands,
};
