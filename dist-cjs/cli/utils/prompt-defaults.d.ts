/**
 * Prompt Defaults System for Non-Interactive Mode
 *
 * This module provides a system for supplying default values
 * to prompts when running in non-interactive mode.
 */
export interface PromptDefault {
    id: string;
    type: 'text' | 'confirm' | 'select' | 'multiselect' | 'number';
    pattern?: RegExp | string;
    defaultValue: any;
    description?: string;
}
export interface PromptDefaultsConfig {
    global?: PromptDefault[];
    command?: {
        [command: string]: PromptDefault[];
    };
    environment?: {
        [env: string]: PromptDefault[];
    };
}
export declare class PromptDefaultsManager {
    private config;
    private configPath;
    private environmentDefaults;
    constructor(configPath?: string);
    /**
     * Load configuration from file
     */
    private loadConfig;
    /**
     * Save configuration to file
     */
    private saveConfig;
    /**
     * Load defaults from environment variables
     */
    private loadEnvironmentDefaults;
    /**
     * Get default value for a prompt
     */
    getDefault(promptId: string, command?: string, promptType?: string): any;
    /**
     * Set a default value
     */
    setDefault(promptId: string, defaultValue: any, options?: {
        command?: string;
        type?: string;
        pattern?: string | RegExp;
        description?: string;
        scope?: 'global' | 'command' | 'environment';
    }): void;
    /**
     * Get common defaults for non-interactive mode
     */
    getNonInteractiveDefaults(): Record<string, any>;
    /**
     * Apply non-interactive defaults if needed
     */
    applyNonInteractiveDefaults(isNonInteractive: boolean): void;
    /**
     * Match a pattern against a prompt ID
     */
    private matchPattern;
    /**
     * Export current configuration
     */
    exportConfig(): PromptDefaultsConfig;
    /**
     * Import configuration
     */
    importConfig(config: PromptDefaultsConfig): void;
    /**
     * Clear all defaults
     */
    clearDefaults(scope?: 'global' | 'command' | 'environment', target?: string): void;
}
export declare function getPromptDefaultsManager(configPath?: string): PromptDefaultsManager;
export declare function getPromptDefault(promptId: string, command?: string, promptType?: string): any;
export declare function applyNonInteractiveDefaults(flags: any): void;
//# sourceMappingURL=prompt-defaults.d.ts.map