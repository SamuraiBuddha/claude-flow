"use strict";
/**
 * Configuration integration commands for ruv-swarm
 *
 * These commands provide enhanced configuration management
 * specifically for ruv-swarm integration with Claude Code.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.configIntegrationAction = configIntegrationAction;
const cli_core_js_1 = require("../cli-core.js");
const config_manager_js_1 = require("../../config/config-manager.js");
const ruv_swarm_integration_js_1 = require("../../config/ruv-swarm-integration.js");
/**
 * Enhanced configuration command with ruv-swarm integration
 */
async function configIntegrationAction(ctx) {
    if (ctx.flags.help || ctx.flags.h || ctx.args.length === 0) {
        showConfigIntegrationHelp();
        return;
    }
    const subcommand = ctx.args[0];
    const subArgs = ctx.args.slice(1);
    try {
        switch (subcommand) {
            case 'setup':
                await handleSetup(ctx);
                break;
            case 'sync':
                await handleSync(ctx);
                break;
            case 'status':
                await handleStatus(ctx);
                break;
            case 'validate':
                await handleValidate(ctx);
                break;
            case 'preset':
                await handlePreset(ctx);
                break;
            case 'export':
                await handleExport(ctx);
                break;
            case 'import':
                await handleImport(ctx);
                break;
            default:
                (0, cli_core_js_1.error)(`Unknown config-integration subcommand: ${subcommand}`);
                showConfigIntegrationHelp();
                break;
        }
    }
    catch (err) {
        (0, cli_core_js_1.error)(`Configuration integration command failed: ${err.message}`);
    }
}
/**
 * Show configuration integration help
 */
function showConfigIntegrationHelp() {
    console.log('config-integration - Enhanced configuration management with ruv-swarm\\n');
    console.log('Usage:');
    console.log('  claude-flow config-integration <command> [options]\\n');
    console.log('Commands:');
    console.log('  setup                      Initialize ruv-swarm integration');
    console.log('  sync                       Synchronize configurations');
    console.log('  status                     Show integration status');
    console.log('  validate                   Validate all configurations');
    console.log('  preset <type>              Apply configuration preset');
    console.log('  export <file>              Export unified configuration');
    console.log('  import <file>              Import and apply configuration\\n');
    console.log('Presets:');
    console.log('  development                Optimized for development workflows');
    console.log('  research                   Optimized for research and analysis');
    console.log('  production                 Optimized for production environments\\n');
    console.log('Examples:');
    console.log('  claude-flow config-integration setup --enable-ruv-swarm');
    console.log('  claude-flow config-integration preset development');
    console.log('  claude-flow config-integration sync --force');
    console.log('  claude-flow config-integration export my-config.json');
    console.log('  claude-flow config-integration status --verbose');
}
/**
 * Handle setup command
 */
async function handleSetup(ctx) {
    const enableRuvSwarm = ctx.flags.enableRuvSwarm || ctx.flags['enable-ruv-swarm'] || true;
    const force = ctx.flags.force || ctx.flags.f;
    (0, cli_core_js_1.info)('Setting up ruv-swarm integration...');
    try {
        // Enable ruv-swarm in main config if requested
        if (enableRuvSwarm) {
            config_manager_js_1.configManager.setRuvSwarmConfig({ enabled: true });
            await config_manager_js_1.configManager.save();
            (0, cli_core_js_1.success)('ruv-swarm enabled in main configuration');
        }
        // Initialize integration
        const result = await (0, ruv_swarm_integration_js_1.initializeRuvSwarmIntegration)();
        if (result.success) {
            (0, cli_core_js_1.success)('ruv-swarm integration setup completed successfully!');
            console.log(`✅ ${result.message}`);
            // Show quick status
            const integration = (0, ruv_swarm_integration_js_1.getRuvSwarmIntegration)();
            const status = integration.getStatus();
            console.log('\\n📋 Integration Status:');
            console.log(`  Enabled: ${status.enabled ? '✅' : '❌'}`);
            console.log(`  Synchronized: ${status.synchronized ? '✅' : '⚠️'}`);
            console.log(`  Topology: ${status.mainConfig.defaultTopology}`);
            console.log(`  Max Agents: ${status.mainConfig.maxAgents}`);
            console.log(`  Strategy: ${status.mainConfig.defaultStrategy}`);
        }
        else {
            (0, cli_core_js_1.error)('ruv-swarm integration setup failed');
            console.log(`❌ ${result.message}`);
            if (force) {
                (0, cli_core_js_1.warning)('Continuing despite errors due to --force flag');
            }
        }
    }
    catch (err) {
        (0, cli_core_js_1.error)(`Setup failed: ${err.message}`);
    }
}
/**
 * Handle sync command
 */
async function handleSync(ctx) {
    const force = ctx.flags.force || ctx.flags.f;
    (0, cli_core_js_1.info)('Synchronizing configurations...');
    try {
        const integration = (0, ruv_swarm_integration_js_1.getRuvSwarmIntegration)();
        // Check current sync status
        const statusBefore = integration.getStatus();
        if (statusBefore.synchronized && !force) {
            (0, cli_core_js_1.success)('Configurations are already synchronized');
            return;
        }
        // Perform sync
        integration.syncConfiguration();
        // Verify sync
        const statusAfter = integration.getStatus();
        if (statusAfter.synchronized) {
            (0, cli_core_js_1.success)('Configuration synchronization completed');
            console.log('✅ Main config and ruv-swarm config are now synchronized');
        }
        else {
            (0, cli_core_js_1.warning)('Synchronization completed but configurations may still differ');
            console.log('⚠️  Manual review recommended');
        }
    }
    catch (err) {
        (0, cli_core_js_1.error)(`Synchronization failed: ${err.message}`);
    }
}
/**
 * Handle status command
 */
async function handleStatus(ctx) {
    const verbose = ctx.flags.verbose || ctx.flags.v;
    const json = ctx.flags.json;
    try {
        const integration = (0, ruv_swarm_integration_js_1.getRuvSwarmIntegration)();
        const status = integration.getStatus();
        if (json) {
            console.log(JSON.stringify(status, null, 2));
            return;
        }
        console.log('🔧 Configuration Integration Status\\n');
        // Main status
        console.log('📊 Overview:');
        console.log(`  ruv-swarm Enabled: ${status.enabled ? '✅ Yes' : '❌ No'}`);
        console.log(`  Configurations Synchronized: ${status.synchronized ? '✅ Yes' : '⚠️  No'}`);
        // Main configuration
        console.log('\\n⚙️  Main Configuration:');
        console.log(`  Default Topology: ${status.mainConfig.defaultTopology}`);
        console.log(`  Max Agents: ${status.mainConfig.maxAgents}`);
        console.log(`  Default Strategy: ${status.mainConfig.defaultStrategy}`);
        console.log(`  Auto Init: ${status.mainConfig.autoInit ? '✅' : '❌'}`);
        console.log(`  Hooks Enabled: ${status.mainConfig.enableHooks ? '✅' : '❌'}`);
        console.log(`  Persistence Enabled: ${status.mainConfig.enablePersistence ? '✅' : '❌'}`);
        console.log(`  Neural Training: ${status.mainConfig.enableNeuralTraining ? '✅' : '❌'}`);
        if (verbose) {
            console.log('\\n🧠 ruv-swarm Configuration:');
            console.log(`  Swarm Max Agents: ${status.ruvSwarmConfig.swarm.maxAgents}`);
            console.log(`  Memory Persistence: ${status.ruvSwarmConfig.memory.enablePersistence ? '✅' : '❌'}`);
            console.log(`  Neural Training: ${status.ruvSwarmConfig.neural.enableTraining ? '✅' : '❌'}`);
            console.log(`  MCP Tools: ${status.ruvSwarmConfig.integration.enableMCPTools ? '✅' : '❌'}`);
            console.log(`  CLI Commands: ${status.ruvSwarmConfig.integration.enableCLICommands ? '✅' : '❌'}`);
            console.log('\\n📈 Monitoring:');
            console.log(`  Metrics Enabled: ${status.ruvSwarmConfig.monitoring.enableMetrics ? '✅' : '❌'}`);
            console.log(`  Alerts Enabled: ${status.ruvSwarmConfig.monitoring.enableAlerts ? '✅' : '❌'}`);
            console.log(`  CPU Threshold: ${status.ruvSwarmConfig.monitoring.alertThresholds.cpu}%`);
            console.log(`  Memory Threshold: ${status.ruvSwarmConfig.monitoring.alertThresholds.memory}%`);
        }
    }
    catch (err) {
        (0, cli_core_js_1.error)(`Failed to get status: ${err.message}`);
    }
}
/**
 * Handle validate command
 */
async function handleValidate(ctx) {
    const fix = ctx.flags.fix || ctx.flags.f;
    (0, cli_core_js_1.info)('Validating configurations...');
    try {
        const integration = (0, ruv_swarm_integration_js_1.getRuvSwarmIntegration)();
        // Validate main config
        console.log('🔍 Validating main configuration...');
        try {
            const mainConfig = config_manager_js_1.configManager.show();
            config_manager_js_1.configManager.validate(mainConfig);
            (0, cli_core_js_1.success)('Main configuration is valid');
        }
        catch (err) {
            (0, cli_core_js_1.error)(`Main configuration validation failed: ${err.message}`);
            if (fix) {
                (0, cli_core_js_1.warning)('Auto-fix for main configuration not implemented');
            }
            return;
        }
        // Validate ruv-swarm config
        console.log('🔍 Validating ruv-swarm configuration...');
        const ruvSwarmManager = integration['ruvSwarmManager'];
        const ruvSwarmValidation = ruvSwarmManager.validateConfig();
        if (ruvSwarmValidation.valid) {
            (0, cli_core_js_1.success)('ruv-swarm configuration is valid');
        }
        else {
            (0, cli_core_js_1.error)('ruv-swarm configuration validation failed:');
            ruvSwarmValidation.errors.forEach((err) => console.log(`  - ${err}`));
            if (fix) {
                (0, cli_core_js_1.warning)('Auto-fix for ruv-swarm configuration not implemented');
            }
            return;
        }
        // Check synchronization
        console.log('🔍 Checking synchronization...');
        const status = integration.getStatus();
        if (status.synchronized) {
            (0, cli_core_js_1.success)('Configurations are synchronized');
        }
        else {
            (0, cli_core_js_1.warning)('Configurations are not synchronized');
            if (fix) {
                (0, cli_core_js_1.info)('Attempting to synchronize...');
                integration.syncConfiguration();
                (0, cli_core_js_1.success)('Synchronization completed');
            }
        }
        (0, cli_core_js_1.success)('All validations passed');
    }
    catch (err) {
        (0, cli_core_js_1.error)(`Validation failed: ${err.message}`);
    }
}
/**
 * Handle preset command
 */
async function handlePreset(ctx) {
    if (ctx.args.length < 2) {
        (0, cli_core_js_1.error)('Preset type is required');
        console.log('Available presets: development, research, production');
        return;
    }
    const presetType = ctx.args[1];
    const dryRun = ctx.flags.dryRun || ctx.flags['dry-run'];
    if (!['development', 'research', 'production'].includes(presetType)) {
        (0, cli_core_js_1.error)('Invalid preset type');
        console.log('Available presets: development, research, production');
        return;
    }
    try {
        if (dryRun) {
            (0, cli_core_js_1.info)(`Showing ${presetType} preset configuration (dry run):`);
            const config = ruv_swarm_integration_js_1.RuvSwarmConfigHelpers.getConfigForUseCase(presetType);
            console.log(JSON.stringify(config, null, 2));
            return;
        }
        (0, cli_core_js_1.info)(`Applying ${presetType} preset...`);
        switch (presetType) {
            case 'development':
                ruv_swarm_integration_js_1.RuvSwarmConfigHelpers.setupDevelopmentConfig();
                break;
            case 'research':
                ruv_swarm_integration_js_1.RuvSwarmConfigHelpers.setupResearchConfig();
                break;
            case 'production':
                ruv_swarm_integration_js_1.RuvSwarmConfigHelpers.setupProductionConfig();
                break;
        }
        // Save configuration
        await config_manager_js_1.configManager.save();
        (0, cli_core_js_1.success)(`${presetType} preset applied successfully`);
        // Show applied configuration
        const integration = (0, ruv_swarm_integration_js_1.getRuvSwarmIntegration)();
        const status = integration.getStatus();
        console.log('\\n📋 Applied Configuration:');
        console.log(`  Topology: ${status.mainConfig.defaultTopology}`);
        console.log(`  Max Agents: ${status.mainConfig.maxAgents}`);
        console.log(`  Strategy: ${status.mainConfig.defaultStrategy}`);
        console.log(`  Features: ${Object.entries(status.mainConfig)
            .filter(([key, value]) => key.startsWith('enable') && value)
            .map(([key]) => key.replace('enable', '').toLowerCase())
            .join(', ')}`);
    }
    catch (err) {
        (0, cli_core_js_1.error)(`Failed to apply preset: ${err.message}`);
    }
}
/**
 * Handle export command
 */
async function handleExport(ctx) {
    if (ctx.args.length < 2) {
        (0, cli_core_js_1.error)('Export file path is required');
        console.log('Usage: config-integration export <file>');
        return;
    }
    const filePath = ctx.args[1];
    const format = ctx.flags.format || 'json';
    try {
        const integration = (0, ruv_swarm_integration_js_1.getRuvSwarmIntegration)();
        const status = integration.getStatus();
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            main: status.mainConfig,
            ruvSwarm: status.ruvSwarmConfig,
            unified: integration.getUnifiedCommandArgs(),
        };
        const { writeFile } = await Promise.resolve().then(() => __importStar(require('fs/promises')));
        if (format === 'yaml') {
            // Simple YAML export (basic implementation)
            const yamlContent = `# Claude-Flow Configuration Export
# Generated: ${exportData.timestamp}

main:
${JSON.stringify(exportData.main, null, 2)
                .split('\\n')
                .map((line) => '  ' + line)
                .join('\\n')}

ruvSwarm:
${JSON.stringify(exportData.ruvSwarm, null, 2)
                .split('\\n')
                .map((line) => '  ' + line)
                .join('\\n')}

unified:
${JSON.stringify(exportData.unified, null, 2)
                .split('\\n')
                .map((line) => '  ' + line)
                .join('\\n')}
`;
            await writeFile(filePath, yamlContent, 'utf8');
        }
        else {
            await writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf8');
        }
        (0, cli_core_js_1.success)(`Configuration exported to: ${filePath}`);
        console.log(`📄 Format: ${format}`);
        console.log(`📊 Size: ${JSON.stringify(exportData).length} bytes`);
    }
    catch (err) {
        (0, cli_core_js_1.error)(`Export failed: ${err.message}`);
    }
}
/**
 * Handle import command
 */
async function handleImport(ctx) {
    if (ctx.args.length < 2) {
        (0, cli_core_js_1.error)('Import file path is required');
        console.log('Usage: config-integration import <file>');
        return;
    }
    const filePath = ctx.args[1];
    const dryRun = ctx.flags.dryRun || ctx.flags['dry-run'];
    const force = ctx.flags.force || ctx.flags.f;
    try {
        const { readFile } = await Promise.resolve().then(() => __importStar(require('fs/promises')));
        const content = await readFile(filePath, 'utf8');
        let importData;
        try {
            importData = JSON.parse(content);
        }
        catch {
            (0, cli_core_js_1.error)('Invalid JSON format in import file');
            return;
        }
        if (!importData.main || !importData.ruvSwarm) {
            (0, cli_core_js_1.error)('Import file does not contain required configuration sections');
            return;
        }
        if (dryRun) {
            (0, cli_core_js_1.info)('Import preview (dry run):');
            console.log('\\n📋 Main Configuration Changes:');
            console.log(JSON.stringify(importData.main, null, 2));
            console.log('\\n🧠 ruv-swarm Configuration Changes:');
            console.log(JSON.stringify(importData.ruvSwarm, null, 2));
            return;
        }
        if (!force) {
            (0, cli_core_js_1.warning)('This will overwrite current configuration');
            console.log('Use --force to proceed or --dry-run to preview changes');
            return;
        }
        (0, cli_core_js_1.info)('Importing configuration...');
        const integration = (0, ruv_swarm_integration_js_1.getRuvSwarmIntegration)();
        // Update configurations
        integration.updateConfiguration({
            main: importData.main,
            ruvSwarm: importData.ruvSwarm,
        });
        // Save changes
        await config_manager_js_1.configManager.save();
        (0, cli_core_js_1.success)('Configuration imported successfully');
        console.log(`📄 Source: ${filePath}`);
        console.log(`📅 Imported: ${importData.timestamp || 'Unknown timestamp'}`);
    }
    catch (err) {
        (0, cli_core_js_1.error)(`Import failed: ${err.message}`);
    }
}
exports.default = {
    configIntegrationAction,
};
//# sourceMappingURL=config-integration.js.map