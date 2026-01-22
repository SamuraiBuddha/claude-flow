"use strict";
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
exports.initCommand = initCommand;
// init/index.ts - Main init command orchestrator
const utils_js_1 = require("../utils.js");
const directory_structure_js_1 = require("./directory-structure.js");
const swarm_commands_js_1 = require("./swarm-commands.js");
const sparc_environment_js_1 = require("./sparc-environment.js");
const claude_config_js_1 = require("./claude-config.js");
const batch_tools_js_1 = require("./batch-tools.js");
async function initCommand(options = {}) {
    try {
        const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
        const path = await Promise.resolve().then(() => __importStar(require('path')));
        (0, utils_js_1.printSuccess)('Initializing Claude-Flow project...');
        // Phase 1: Create directory structure
        console.log('\n📁 Phase 1: Creating directory structure...');
        await (0, directory_structure_js_1.createDirectoryStructure)();
        // Phase 2: Create base configuration
        console.log('\n⚙️  Phase 2: Creating configuration...');
        await (0, claude_config_js_1.createClaudeConfig)(options);
        // Phase 3: Create swarm commands and documentation
        console.log('\n🤖 Phase 3: Creating swarm commands...');
        await (0, swarm_commands_js_1.createSwarmCommands)();
        // Phase 4: Create batch tools guides
        console.log('\n🔧 Phase 4: Creating batch tools guides...');
        await (0, batch_tools_js_1.createBatchToolsGuide)();
        // Phase 5: SPARC environment (if requested)
        if (options.sparc) {
            console.log('\n🚀 Phase 5: Creating SPARC environment...');
            await (0, sparc_environment_js_1.createSparcEnvironment)();
        }
        // Success summary
        console.log('\n🎉 Project initialized successfully!');
        console.log('   📁 Created .claude/ directory structure');
        console.log('   📋 Created comprehensive swarm command documentation');
        console.log('   🔧 Created batch tools coordination guides');
        console.log('   📖 Created detailed usage examples with orchestration');
        console.log('\n   Next steps:');
        console.log('   1. Run "claude-flow swarm --help" to see swarm options');
        console.log('   2. Check .claude/commands/swarm/ for detailed documentation');
        console.log('   3. Review batch tools guide for orchestration patterns');
        console.log('   4. Run "claude-flow help" for all available commands');
        if (options.sparc) {
            console.log('   5. Run "claude-flow sparc modes" to see available SPARC modes');
            console.log('   6. Use TodoWrite/TodoRead for task coordination');
            console.log('   7. Use Task tool for parallel agent execution');
        }
    }
    catch (error) {
        (0, utils_js_1.printError)(`Failed to initialize project: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
}
//# sourceMappingURL=index.js.map