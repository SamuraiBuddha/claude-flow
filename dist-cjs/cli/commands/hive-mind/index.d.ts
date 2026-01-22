#!/usr/bin/env node
/**
 * Hive Mind CLI Commands Index
 *
 * Main entry point for all Hive Mind CLI commands
 */
import { Command } from 'commander';
import { initCommand } from './init.js';
import { spawnCommand } from './spawn.js';
import { statusCommand } from './status.js';
import { taskCommand } from './task.js';
import { wizardCommand } from './wizard.js';
import { stopCommand } from './stop.js';
import { pauseCommand } from './pause.js';
import { resumeCommand } from './resume.js';
import { psCommand } from './ps.js';
export declare const hiveMindCommand: Command;
export { initCommand, spawnCommand, statusCommand, taskCommand, wizardCommand, stopCommand, pauseCommand, resumeCommand, psCommand, };
//# sourceMappingURL=index.d.ts.map