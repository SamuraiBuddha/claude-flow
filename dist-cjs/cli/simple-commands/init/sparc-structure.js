"use strict";
// sparc-structure.js - Create SPARC development structure
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSparcStructureManually = createSparcStructureManually;
const roomodes_config_js_1 = require("./sparc/roomodes-config.js");
const workflows_js_1 = require("./sparc/workflows.js");
const roo_readme_js_1 = require("./sparc/roo-readme.js");
const slash_commands_js_1 = require("./claude-commands/slash-commands.js");
const node_compat_js_1 = require("../../node-compat.js");
const process_1 = __importDefault(require("process"));
// Helper function to create SPARC structure manually
async function createSparcStructureManually() {
    try {
        // Ensure we're in the working directory
        const workingDir = process_1.default.env.PWD || (0, node_compat_js_1.cwd)();
        // Create .roo directory structure in working directory (legacy support)
        const rooDirectories = [
            `${workingDir}/.roo`,
            `${workingDir}/.roo/templates`,
            `${workingDir}/.roo/workflows`,
            `${workingDir}/.roo/modes`,
            `${workingDir}/.roo/configs`,
        ];
        for (const dir of rooDirectories) {
            try {
                await node_compat_js_1.Deno.mkdir(dir, { recursive: true });
                console.log(`  ✓ Created ${dir}/`);
            }
            catch (err) {
                if (!(err instanceof node_compat_js_1.Deno.errors.AlreadyExists)) {
                    throw err;
                }
            }
        }
        // Create .roomodes file (copy from existing if available, or create basic version)
        let roomodesContent;
        try {
            // Check if .roomodes already exists and read it
            roomodesContent = await node_compat_js_1.Deno.readTextFile(`${workingDir}/.roomodes`);
            console.log('  ✓ Using existing .roomodes configuration');
        }
        catch {
            // Create basic .roomodes configuration
            roomodesContent = (0, roomodes_config_js_1.createBasicRoomodesConfig)();
            await node_compat_js_1.Deno.writeTextFile(`${workingDir}/.roomodes`, roomodesContent);
            console.log('  ✓ Created .roomodes configuration');
        }
        // Create basic workflow templates
        const basicWorkflow = (0, workflows_js_1.createBasicSparcWorkflow)();
        await node_compat_js_1.Deno.writeTextFile(`${workingDir}/.roo/workflows/basic-tdd.json`, basicWorkflow);
        console.log('  ✓ Created .roo/workflows/basic-tdd.json');
        // Create README for .roo directory
        const rooReadme = (0, roo_readme_js_1.createRooReadme)();
        await node_compat_js_1.Deno.writeTextFile(`${workingDir}/.roo/README.md`, rooReadme);
        console.log('  ✓ Created .roo/README.md');
        // Create Claude Code slash commands for SPARC modes
        await (0, slash_commands_js_1.createClaudeSlashCommands)(workingDir);
        console.log('  ✅ Basic SPARC structure created successfully');
    }
    catch (err) {
        console.log(`  ❌ Failed to create SPARC structure: ${err.message}`);
    }
}
//# sourceMappingURL=sparc-structure.js.map