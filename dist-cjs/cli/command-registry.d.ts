export function registerCoreCommands(): void;
export function registerCommand(name: any, command: any): void;
export function getCommand(name: any): any;
export function listCommands(includeHidden?: boolean): any[];
export function hasCommand(name: any): boolean;
export function executeCommand(name: any, subArgs: any, flags: any): Promise<void>;
export function showCommandHelp(name: any): void;
export function showAllCommands(): void;
export const commandRegistry: Map<any, any>;
//# sourceMappingURL=command-registry.d.ts.map