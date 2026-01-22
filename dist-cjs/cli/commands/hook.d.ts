import type { HookCommandOptions } from './hook-types.js';
export declare const hookCommand: {
    name: string;
    description: string;
    action: ({ args }: HookCommandOptions) => Promise<void>;
};
export declare const hookSubcommands: string[];
//# sourceMappingURL=hook.d.ts.map