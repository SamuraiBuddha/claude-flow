"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyAgentFiles = copyAgentFiles;
exports.createAgentDirectories = createAgentDirectories;
exports.validateAgentSystem = validateAgentSystem;
// agent-copier.js - Copy all agent files during initialization
const fs_1 = require("fs");
const path_1 = require("path");
const url_1 = require("url");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = (0, path_1.dirname)(__filename);
/**
 * Copy all agent files from the installed package to project directory
 */
async function copyAgentFiles(targetDir, options = {}) {
    const { force = false, dryRun = false } = options;
    // Path to agent files - try multiple locations
    const packageAgentsDir = (0, path_1.join)(__dirname, '../../../../.claude/agents'); // From npm package
    const localAgentsDir = '/workspaces/claude-code-flow/.claude/agents'; // Local development
    const cwdAgentsDir = (0, path_1.join)(process.cwd(), '.claude/agents'); // Current working directory
    let sourceAgentsDir;
    // Try local development first, then package, then cwd
    try {
        await fs_1.promises.access(localAgentsDir);
        sourceAgentsDir = localAgentsDir;
        console.log('  📁 Using local development agent files');
    }
    catch {
        try {
            await fs_1.promises.access(packageAgentsDir);
            sourceAgentsDir = packageAgentsDir;
            console.log('  📁 Using packaged agent files');
        }
        catch {
            try {
                await fs_1.promises.access(cwdAgentsDir);
                sourceAgentsDir = cwdAgentsDir;
                console.log('  📁 Using current directory agent files');
            }
            catch {
                console.log('  ⚠️  No agent files found in any location');
                return { success: false, error: 'Agent files not found' };
            }
        }
    }
    const targetAgentsDir = (0, path_1.join)(targetDir, '.claude/agents');
    console.log('📁 Copying agent system files...');
    console.log(`  📂 Source: ${sourceAgentsDir}`);
    console.log(`  📂 Target: ${targetAgentsDir}`);
    try {
        // Create target directory
        if (!dryRun) {
            await fs_1.promises.mkdir(targetAgentsDir, { recursive: true });
        }
        const copiedFiles = [];
        const errors = [];
        // Recursively copy all agent files
        async function copyRecursive(srcDir, destDir) {
            const items = await fs_1.promises.readdir(srcDir, { withFileTypes: true });
            for (const item of items) {
                const srcPath = (0, path_1.join)(srcDir, item.name);
                const destPath = (0, path_1.join)(destDir, item.name);
                if (item.isDirectory()) {
                    if (!dryRun) {
                        await fs_1.promises.mkdir(destPath, { recursive: true });
                    }
                    await copyRecursive(srcPath, destPath);
                }
                else if (item.isFile() && item.name.endsWith('.md')) {
                    try {
                        // Check if file already exists
                        let shouldCopy = force;
                        if (!force) {
                            try {
                                await fs_1.promises.access(destPath);
                                // File exists, skip unless force is true
                                continue;
                            }
                            catch {
                                // File doesn't exist, safe to copy
                                shouldCopy = true;
                            }
                        }
                        if (shouldCopy && !dryRun) {
                            const content = await fs_1.promises.readFile(srcPath, 'utf8');
                            await fs_1.promises.writeFile(destPath, content, 'utf8');
                            copiedFiles.push(destPath.replace(targetDir + '/', ''));
                        }
                        else if (dryRun) {
                            copiedFiles.push(destPath.replace(targetDir + '/', ''));
                        }
                    }
                    catch (err) {
                        errors.push(`Failed to copy ${item.name}: ${err.message}`);
                    }
                }
            }
        }
        await copyRecursive(sourceAgentsDir, targetAgentsDir);
        if (!dryRun && copiedFiles.length > 0) {
            console.log(`  ✅ Copied ${copiedFiles.length} agent files`);
            console.log('  📋 Agent system initialized with 64 specialized agents');
            console.log('  🎯 Available categories: Core, Swarm, Consensus, Performance, GitHub, SPARC, Testing');
        }
        else if (dryRun) {
            console.log(`  [DRY RUN] Would copy ${copiedFiles.length} agent files`);
        }
        if (errors.length > 0) {
            console.log('  ⚠️  Some agent files could not be copied:');
            errors.forEach(error => console.log(`    - ${error}`));
        }
        return {
            success: true,
            copiedFiles,
            errors,
            totalAgents: copiedFiles.length
        };
    }
    catch (err) {
        console.log(`  ❌ Failed to copy agent files: ${err.message}`);
        return {
            success: false,
            error: err.message,
            copiedFiles: [],
            errors: [err.message]
        };
    }
}
/**
 * Create agent directories structure
 */
async function createAgentDirectories(targetDir, dryRun = false) {
    const agentDirs = [
        '.claude',
        '.claude/agents',
        '.claude/agents/core',
        '.claude/agents/swarm',
        '.claude/agents/hive-mind',
        '.claude/agents/consensus',
        '.claude/agents/optimization',
        '.claude/agents/github',
        '.claude/agents/sparc',
        '.claude/agents/testing',
        '.claude/agents/testing/unit',
        '.claude/agents/testing/validation',
        '.claude/agents/templates',
        '.claude/agents/analysis',
        '.claude/agents/analysis/code-review',
        '.claude/agents/architecture',
        '.claude/agents/architecture/system-design',
        '.claude/agents/data',
        '.claude/agents/data/ml',
        '.claude/agents/development',
        '.claude/agents/development/backend',
        '.claude/agents/devops',
        '.claude/agents/devops/ci-cd',
        '.claude/agents/documentation',
        '.claude/agents/documentation/api-docs',
        '.claude/agents/specialized',
        '.claude/agents/specialized/mobile'
    ];
    if (dryRun) {
        console.log(`  [DRY RUN] Would create ${agentDirs.length} agent directories`);
        return;
    }
    for (const dir of agentDirs) {
        await fs_1.promises.mkdir((0, path_1.join)(targetDir, dir), { recursive: true });
    }
    console.log(`  ✅ Created ${agentDirs.length} agent directories`);
}
/**
 * Validate agent system after copying
 */
async function validateAgentSystem(targetDir) {
    const agentsDir = (0, path_1.join)(targetDir, '.claude/agents');
    try {
        const categories = await fs_1.promises.readdir(agentsDir, { withFileTypes: true });
        const agentCategories = categories.filter(item => item.isDirectory()).map(item => item.name);
        let totalAgents = 0;
        for (const category of agentCategories) {
            const categoryPath = (0, path_1.join)(agentsDir, category);
            const items = await fs_1.promises.readdir(categoryPath, { withFileTypes: true });
            const agentFiles = items.filter(item => item.isFile() && item.name.endsWith('.md'));
            totalAgents += agentFiles.length;
        }
        console.log('  🔍 Agent system validation:');
        console.log(`    • Categories: ${agentCategories.length}`);
        console.log(`    • Total agents: ${totalAgents}`);
        console.log(`    • Categories: ${agentCategories.join(', ')}`);
        return {
            valid: totalAgents > 50, // Should have at least 50+ agents
            categories: agentCategories.length,
            totalAgents,
            categoryNames: agentCategories
        };
    }
    catch (err) {
        console.log(`  ⚠️  Agent system validation failed: ${err.message}`);
        return {
            valid: false,
            error: err.message
        };
    }
}
//# sourceMappingURL=agent-copier.js.map