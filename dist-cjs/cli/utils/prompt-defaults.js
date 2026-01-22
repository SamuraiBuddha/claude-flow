"use strict";
/**
 * Prompt Defaults System for Non-Interactive Mode
 *
 * This module provides a system for supplying default values
 * to prompts when running in non-interactive mode.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptDefaultsManager = void 0;
exports.getPromptDefaultsManager = getPromptDefaultsManager;
exports.getPromptDefault = getPromptDefault;
exports.applyNonInteractiveDefaults = applyNonInteractiveDefaults;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const node_os_1 = require("node:os");
class PromptDefaultsManager {
    config = {};
    configPath;
    environmentDefaults = new Map();
    constructor(configPath) {
        this.configPath = configPath || (0, node_path_1.join)((0, node_os_1.homedir)(), '.claude-flow', 'prompt-defaults.json');
        this.loadConfig();
        this.loadEnvironmentDefaults();
    }
    /**
     * Load configuration from file
     */
    loadConfig() {
        try {
            if ((0, node_fs_1.existsSync)(this.configPath)) {
                const content = (0, node_fs_1.readFileSync)(this.configPath, 'utf-8');
                this.config = JSON.parse(content);
            }
        }
        catch (error) {
            // Silently fail, use empty config
            this.config = {};
        }
    }
    /**
     * Save configuration to file
     */
    saveConfig() {
        try {
            const dir = (0, node_path_1.join)(this.configPath, '..');
            if (!(0, node_fs_1.existsSync)(dir)) {
                require('fs').mkdirSync(dir, { recursive: true });
            }
            (0, node_fs_1.writeFileSync)(this.configPath, JSON.stringify(this.config, null, 2));
        }
        catch (error) {
            // Silently fail
        }
    }
    /**
     * Load defaults from environment variables
     */
    loadEnvironmentDefaults() {
        const env = process.env;
        // Common defaults from environment
        if (env.CLAUDE_AUTO_APPROVE === '1' || env.CLAUDE_AUTO_APPROVE === 'true') {
            this.environmentDefaults.set('confirm:*', true);
        }
        if (env.CLAUDE_DEFAULT_MODEL) {
            this.environmentDefaults.set('select:model', env.CLAUDE_DEFAULT_MODEL);
        }
        if (env.CLAUDE_DEFAULT_REGION) {
            this.environmentDefaults.set('select:region', env.CLAUDE_DEFAULT_REGION);
        }
        // Parse CLAUDE_PROMPT_DEFAULTS if set
        if (env.CLAUDE_PROMPT_DEFAULTS) {
            try {
                const defaults = JSON.parse(env.CLAUDE_PROMPT_DEFAULTS);
                Object.entries(defaults).forEach(([key, value]) => {
                    this.environmentDefaults.set(key, value);
                });
            }
            catch (error) {
                // Invalid JSON, ignore
            }
        }
    }
    /**
     * Get default value for a prompt
     */
    getDefault(promptId, command, promptType) {
        // Check environment defaults first (highest priority)
        const envKey = `${promptType || 'text'}:${promptId}`;
        if (this.environmentDefaults.has(envKey)) {
            return this.environmentDefaults.get(envKey);
        }
        // Check wildcard environment defaults
        const wildcardKey = `${promptType || 'text'}:*`;
        if (this.environmentDefaults.has(wildcardKey)) {
            return this.environmentDefaults.get(wildcardKey);
        }
        // Check command-specific defaults
        if (command && this.config.command?.[command]) {
            const commandDefault = this.config.command[command].find((d) => d.id === promptId || (d.pattern && this.matchPattern(promptId, d.pattern)));
            if (commandDefault) {
                return commandDefault.defaultValue;
            }
        }
        // Check environment-specific defaults
        const currentEnv = process.env.NODE_ENV || 'development';
        if (this.config.environment?.[currentEnv]) {
            const envDefault = this.config.environment[currentEnv].find((d) => d.id === promptId || (d.pattern && this.matchPattern(promptId, d.pattern)));
            if (envDefault) {
                return envDefault.defaultValue;
            }
        }
        // Check global defaults
        if (this.config.global) {
            const globalDefault = this.config.global.find((d) => d.id === promptId || (d.pattern && this.matchPattern(promptId, d.pattern)));
            if (globalDefault) {
                return globalDefault.defaultValue;
            }
        }
        // Return undefined if no default found
        return undefined;
    }
    /**
     * Set a default value
     */
    setDefault(promptId, defaultValue, options = {}) {
        const defaultEntry = {
            id: promptId,
            type: options.type || 'text',
            defaultValue,
            description: options.description,
            pattern: options.pattern,
        };
        const scope = options.scope || 'global';
        if (scope === 'command' && options.command) {
            if (!this.config.command) {
                this.config.command = {};
            }
            if (!this.config.command[options.command]) {
                this.config.command[options.command] = [];
            }
            this.config.command[options.command].push(defaultEntry);
        }
        else if (scope === 'environment') {
            const currentEnv = process.env.NODE_ENV || 'development';
            if (!this.config.environment) {
                this.config.environment = {};
            }
            if (!this.config.environment[currentEnv]) {
                this.config.environment[currentEnv] = [];
            }
            this.config.environment[currentEnv].push(defaultEntry);
        }
        else {
            if (!this.config.global) {
                this.config.global = [];
            }
            this.config.global.push(defaultEntry);
        }
        this.saveConfig();
    }
    /**
     * Get common defaults for non-interactive mode
     */
    getNonInteractiveDefaults() {
        return {
            // Confirmation prompts
            'confirm:continue': true,
            'confirm:overwrite': true,
            'confirm:delete': false, // Safety: don't auto-confirm deletes
            'confirm:deploy': false, // Safety: don't auto-confirm deploys
            // Selection prompts
            'select:model': 'claude-3-opus-20240229',
            'select:region': 'us-east-1',
            'select:topology': 'hierarchical',
            'select:strategy': 'auto',
            // Text prompts
            'text:projectName': 'claude-flow-project',
            'text:description': 'Claude Flow AI Project',
            // Number prompts
            'number:maxAgents': 4,
            'number:timeout': 30000,
            'number:port': 3000,
        };
    }
    /**
     * Apply non-interactive defaults if needed
     */
    applyNonInteractiveDefaults(isNonInteractive) {
        if (!isNonInteractive)
            return;
        const defaults = this.getNonInteractiveDefaults();
        Object.entries(defaults).forEach(([key, value]) => {
            if (!this.environmentDefaults.has(key)) {
                this.environmentDefaults.set(key, value);
            }
        });
    }
    /**
     * Match a pattern against a prompt ID
     */
    matchPattern(promptId, pattern) {
        if (typeof pattern === 'string') {
            // Simple wildcard matching
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(promptId);
        }
        else {
            return pattern.test(promptId);
        }
    }
    /**
     * Export current configuration
     */
    exportConfig() {
        return JSON.parse(JSON.stringify(this.config));
    }
    /**
     * Import configuration
     */
    importConfig(config) {
        this.config = JSON.parse(JSON.stringify(config));
        this.saveConfig();
    }
    /**
     * Clear all defaults
     */
    clearDefaults(scope, target) {
        if (scope === 'command' && target && this.config.command) {
            delete this.config.command[target];
        }
        else if (scope === 'environment' && target && this.config.environment) {
            delete this.config.environment[target];
        }
        else if (scope === 'global' || !scope) {
            this.config.global = [];
        }
        this.saveConfig();
    }
}
exports.PromptDefaultsManager = PromptDefaultsManager;
// Singleton instance
let instance = null;
function getPromptDefaultsManager(configPath) {
    if (!instance) {
        instance = new PromptDefaultsManager(configPath);
    }
    return instance;
}
// Convenience function for getting defaults
function getPromptDefault(promptId, command, promptType) {
    return getPromptDefaultsManager().getDefault(promptId, command, promptType);
}
// Apply non-interactive defaults based on environment
function applyNonInteractiveDefaults(flags) {
    const manager = getPromptDefaultsManager();
    const isNonInteractive = flags.nonInteractive || flags['non-interactive'] || flags.ci || !process.stdout.isTTY;
    manager.applyNonInteractiveDefaults(isNonInteractive);
}
//# sourceMappingURL=prompt-defaults.js.map