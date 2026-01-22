/**
 * CLI Commands for SpecKit Integration
 * Registers speckit:init, speckit:status, speckit:workflow commands
 */
import { Command } from 'commander';
export declare const speckitCommand: Command;
/**
 * Register SpecKit commands with a Commander program
 */
export declare function registerSpecKitCommands(program: Command): void;
declare const _default: {
    speckitCommand: Command;
    registerSpecKitCommands: typeof registerSpecKitCommands;
};
export default _default;
//# sourceMappingURL=cli-commands.d.ts.map