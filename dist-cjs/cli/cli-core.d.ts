#!/usr/bin/env node
/**
 * Claude-Flow CLI - Core implementation using Node.js
 */
export declare const VERSION = "1.0.45";
interface CommandContext {
    args: string[];
    flags: Record<string, unknown>;
    config?: Record<string, unknown> | undefined;
}
interface Command {
    name: string;
    description: string;
    aliases?: string[];
    subcommands?: Command[];
    action?: (ctx: CommandContext) => Promise<void> | void;
    options?: Option[];
}
interface Option {
    name: string;
    short?: string;
    description: string;
    type?: 'string' | 'boolean' | 'number';
    default?: unknown;
    required?: boolean;
}
declare class CLI {
    private name;
    private description;
    private commands;
    private globalOptions;
    constructor(name: string, description: string);
    command(cmd: Command): this;
    run(args?: string[]): Promise<void>;
    private parseArgs;
    private loadConfig;
    private getBooleanFlags;
    private getStringFlags;
    private getAliases;
    private getDefaults;
    private getAllOptions;
    private showHelp;
    private formatCommands;
    private formatOptions;
}
declare function success(message: string): void;
declare function error(message: string): void;
declare function warning(message: string): void;
declare function info(message: string): void;
export { CLI, success, error, warning, info };
export type { Command, CommandContext, Option };
//# sourceMappingURL=cli-core.d.ts.map