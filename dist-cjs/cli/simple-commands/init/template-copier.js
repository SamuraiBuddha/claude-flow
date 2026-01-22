"use strict";
// template-copier.js - Copy template files instead of generating them dynamically
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
exports.copyTemplates = copyTemplates;
const node_compat_js_1 = require("../../node-compat.js");
const fs_1 = require("fs");
const path_1 = require("path");
const url_1 = require("url");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = (0, path_1.dirname)(__filename);
/**
 * Copy template files from the templates directory to the target directory
 * @param {string} targetDir - The directory to copy templates to
 * @param {Object} options - Options for template copying
 * @param {boolean} options.sparc - Whether to include SPARC templates
 * @param {boolean} options.enhanced - Whether to use enhanced templates
 * @param {boolean} options.minimal - Whether to use minimal templates
 * @param {boolean} options.optimized - Whether to use optimized templates
 * @param {boolean} options.dryRun - Whether to perform a dry run
 * @param {boolean} options.force - Whether to overwrite existing files
 * @param {string[]} options.selectedModes - Selected SPARC modes to copy
 * @returns {Promise<{success: boolean, copiedFiles: string[], errors: string[]}>}
 */
async function copyTemplates(targetDir, options = {}) {
    const results = {
        success: true,
        copiedFiles: [],
        errors: [],
    };
    try {
        const templatesDir = (0, path_1.join)(__dirname, 'templates');
        // Determine which template variants to use
        const templateVariant = options.optimized ? 'optimized' :
            options.enhanced ? 'enhanced' :
                options.minimal ? 'minimal' :
                    options.sparc ? 'sparc' : 'full';
        // Core files to copy
        const coreFiles = [
            {
                source: 'CLAUDE.md',
                destination: 'CLAUDE.md',
                useVariant: true
            },
            {
                source: 'memory-bank.md',
                destination: 'memory-bank.md',
                useVariant: true
            },
            {
                source: 'coordination.md',
                destination: 'coordination.md',
                useVariant: true
            },
        ];
        // Copy core files
        for (const file of coreFiles) {
            const sourceFile = file.useVariant && (0, node_compat_js_1.existsSync)((0, path_1.join)(templatesDir, `${file.source}.${templateVariant}`))
                ? `${file.source}.${templateVariant}`
                : file.source;
            const sourcePath = (0, path_1.join)(templatesDir, sourceFile);
            const destPath = (0, path_1.join)(targetDir, file.destination);
            if (await copyFile(sourcePath, destPath, options)) {
                results.copiedFiles.push(file.destination);
            }
            else if (!options.dryRun) {
                results.errors.push(`Failed to copy ${file.destination}`);
            }
        }
        // Copy .claude directory structure
        if (options.enhanced || !options.minimal) {
            const claudeDir = (0, path_1.join)(targetDir, '.claude');
            // Copy settings.json
            const settingsSource = options.enhanced ? 'settings.json.enhanced' : 'settings.json';
            const settingsPath = (0, path_1.join)(templatesDir, settingsSource);
            const settingsDest = (0, path_1.join)(claudeDir, 'settings.json');
            if (!options.dryRun) {
                await fs_1.promises.mkdir(claudeDir, { recursive: true });
            }
            if (await copyFile(settingsPath, settingsDest, options)) {
                results.copiedFiles.push('.claude/settings.json');
            }
            // Copy command templates
            if (options.sparc || options.enhanced) {
                await copyCommandTemplates(templatesDir, targetDir, options, results);
            }
            // Copy helper scripts (enhanced mode only)
            if (options.enhanced) {
                await copyHelperScripts(templatesDir, targetDir, options, results);
            }
        }
        // Copy SPARC-specific files
        if (options.sparc) {
            await copySparcTemplates(templatesDir, targetDir, options, results);
        }
        // Copy wrapper scripts
        await copyWrapperScripts(templatesDir, targetDir, options, results);
        // Create directory structure
        await createDirectoryStructure(targetDir, options);
        // Create README files for memory directories
        await createMemoryReadmeFiles(targetDir, options, results);
    }
    catch (err) {
        results.success = false;
        results.errors.push(`Template copy failed: ${err.message}`);
    }
    return results;
}
/**
 * Copy a single file with options
 */
async function copyFile(source, destination, options) {
    try {
        // Check if source exists
        if (!(0, node_compat_js_1.existsSync)(source)) {
            // Try reading from templates directory as fallback
            const templateContent = await getTemplateContent(source);
            if (templateContent) {
                if (!options.dryRun) {
                    await fs_1.promises.writeFile(destination, templateContent);
                }
                console.log(`  ${options.dryRun ? '[DRY RUN] Would create' : '✓ Created'} ${(0, path_1.relative)(process.cwd(), destination)}`);
                return true;
            }
            console.log(`  ⚠️  Template not found: ${(0, path_1.relative)(process.cwd(), source)}`);
            return false;
        }
        // Check if destination exists and handle force flag
        if ((0, node_compat_js_1.existsSync)(destination) && !options.force) {
            console.log(`  ⚠️  File already exists: ${(0, path_1.relative)(process.cwd(), destination)} (use --force to overwrite)`);
            return false;
        }
        if (!options.dryRun) {
            // Ensure destination directory exists
            await fs_1.promises.mkdir((0, path_1.dirname)(destination), { recursive: true });
            // Copy the file
            const content = await fs_1.promises.readFile(source, 'utf8');
            await fs_1.promises.writeFile(destination, content);
            // Preserve file permissions for executable scripts
            if (source.endsWith('.sh') || source.includes('claude-flow')) {
                await fs_1.promises.chmod(destination, 0o755);
            }
        }
        console.log(`  ${options.dryRun ? '[DRY RUN] Would copy' : '✓ Copied'} ${(0, path_1.relative)(process.cwd(), destination)}`);
        return true;
    }
    catch (err) {
        console.log(`  ❌ Failed to copy ${(0, path_1.relative)(process.cwd(), destination)}: ${err.message}`);
        return false;
    }
}
/**
 * Copy command templates
 */
async function copyCommandTemplates(templatesDir, targetDir, options, results) {
    const commandsSourceDir = (0, path_1.join)(templatesDir, 'commands');
    const commandsDestDir = (0, path_1.join)(targetDir, '.claude', 'commands');
    if (!(0, node_compat_js_1.existsSync)(commandsSourceDir)) {
        // Use generated command templates as fallback
        return await generateCommandTemplates(targetDir, options, results);
    }
    try {
        if (!options.dryRun) {
            await fs_1.promises.mkdir(commandsDestDir, { recursive: true });
        }
        // Copy command categories
        const categories = await fs_1.promises.readdir(commandsSourceDir);
        for (const category of categories) {
            const categoryPath = (0, path_1.join)(commandsSourceDir, category);
            const stat = await fs_1.promises.stat(categoryPath);
            if (stat.isDirectory()) {
                const destCategoryPath = (0, path_1.join)(commandsDestDir, category);
                if (!options.dryRun) {
                    await fs_1.promises.mkdir(destCategoryPath, { recursive: true });
                }
                // Copy files in category
                const files = await fs_1.promises.readdir(categoryPath);
                for (const file of files) {
                    const sourcePath = (0, path_1.join)(categoryPath, file);
                    const destPath = (0, path_1.join)(destCategoryPath, file);
                    if (await copyFile(sourcePath, destPath, options)) {
                        results.copiedFiles.push((0, path_1.join)('.claude', 'commands', category, file));
                    }
                }
            }
        }
    }
    catch (err) {
        results.errors.push(`Failed to copy command templates: ${err.message}`);
    }
}
/**
 * Copy SPARC templates
 */
async function copySparcTemplates(templatesDir, targetDir, options, results) {
    const sparcDir = (0, path_1.join)(targetDir, '.claude', 'commands', 'sparc');
    try {
        if (!options.dryRun) {
            await fs_1.promises.mkdir(sparcDir, { recursive: true });
        }
        // Get SPARC mode templates
        const { createSparcModeTemplates, createSparcModesOverview } = await Promise.resolve().then(() => __importStar(require('./templates/sparc-modes.js')));
        const sparcTemplates = createSparcModeTemplates();
        // Filter templates if selectedModes is specified
        const templatesToCreate = options.selectedModes
            ? Object.entries(sparcTemplates).filter(([filename]) => {
                const mode = filename.replace('.md', '');
                return options.selectedModes.includes(mode);
            })
            : Object.entries(sparcTemplates);
        // Write SPARC mode files
        for (const [filename, content] of templatesToCreate) {
            const destPath = (0, path_1.join)(sparcDir, filename);
            if (!options.dryRun) {
                await fs_1.promises.writeFile(destPath, content);
            }
            console.log(`  ${options.dryRun ? '[DRY RUN] Would create' : '✓ Created'} .claude/commands/sparc/${filename}`);
            results.copiedFiles.push((0, path_1.join)('.claude', 'commands', 'sparc', filename));
        }
        // Create sparc-modes.md overview
        const overviewPath = (0, path_1.join)(sparcDir, 'sparc-modes.md');
        if (!options.dryRun) {
            await fs_1.promises.writeFile(overviewPath, createSparcModesOverview());
        }
        console.log(`  ${options.dryRun ? '[DRY RUN] Would create' : '✓ Created'} .claude/commands/sparc/sparc-modes.md`);
        results.copiedFiles.push('.claude/commands/sparc/sparc-modes.md');
        // Copy swarm templates
        await copySwarmTemplates(templatesDir, targetDir, options, results);
    }
    catch (err) {
        results.errors.push(`Failed to copy SPARC templates: ${err.message}`);
    }
}
/**
 * Copy swarm strategy templates
 */
async function copySwarmTemplates(templatesDir, targetDir, options, results) {
    const swarmDir = (0, path_1.join)(targetDir, '.claude', 'commands', 'swarm');
    try {
        if (!options.dryRun) {
            await fs_1.promises.mkdir(swarmDir, { recursive: true });
        }
        // Get swarm strategy templates
        const { createSwarmStrategyTemplates } = await Promise.resolve().then(() => __importStar(require('./templates/sparc-modes.js')));
        const swarmTemplates = createSwarmStrategyTemplates();
        // Write swarm strategy files
        for (const [filename, content] of Object.entries(swarmTemplates)) {
            const destPath = (0, path_1.join)(swarmDir, filename);
            if (!options.dryRun) {
                await fs_1.promises.writeFile(destPath, content);
            }
            console.log(`  ${options.dryRun ? '[DRY RUN] Would create' : '✓ Created'} .claude/commands/swarm/${filename}`);
            results.copiedFiles.push((0, path_1.join)('.claude', 'commands', 'swarm', filename));
        }
    }
    catch (err) {
        results.errors.push(`Failed to copy swarm templates: ${err.message}`);
    }
}
/**
 * Copy helper scripts (enhanced mode)
 */
async function copyHelperScripts(templatesDir, targetDir, options, results) {
    const helpersDir = (0, path_1.join)(targetDir, '.claude', 'helpers');
    try {
        if (!options.dryRun) {
            await fs_1.promises.mkdir(helpersDir, { recursive: true });
        }
        const helpers = ['setup-mcp.sh', 'quick-start.sh', 'github-setup.sh'];
        const { createHelperScript } = await Promise.resolve().then(() => __importStar(require('./templates/enhanced-templates.js')));
        for (const helper of helpers) {
            const content = createHelperScript(helper);
            if (content) {
                const destPath = (0, path_1.join)(helpersDir, helper);
                if (!options.dryRun) {
                    await fs_1.promises.writeFile(destPath, content);
                    await fs_1.promises.chmod(destPath, 0o755);
                }
                console.log(`  ${options.dryRun ? '[DRY RUN] Would create' : '✓ Created'} .claude/helpers/${helper}`);
                results.copiedFiles.push((0, path_1.join)('.claude', 'helpers', helper));
            }
        }
    }
    catch (err) {
        results.errors.push(`Failed to copy helper scripts: ${err.message}`);
    }
}
/**
 * Copy wrapper scripts
 */
async function copyWrapperScripts(templatesDir, targetDir, options, results) {
    try {
        // Unix wrapper
        const unixWrapperPath = (0, path_1.join)(targetDir, 'claude-flow');
        const unixWrapperSource = (0, path_1.join)(templatesDir, 'claude-flow-universal');
        if (await copyFile(unixWrapperSource, unixWrapperPath, options)) {
            if (!options.dryRun) {
                await fs_1.promises.chmod(unixWrapperPath, 0o755);
            }
            results.copiedFiles.push('claude-flow');
        }
        // Windows batch wrapper
        const batchWrapperPath = (0, path_1.join)(targetDir, 'claude-flow.bat');
        const batchWrapperSource = (0, path_1.join)(templatesDir, 'claude-flow.bat');
        if (await copyFile(batchWrapperSource, batchWrapperPath, options)) {
            results.copiedFiles.push('claude-flow.bat');
        }
        // PowerShell wrapper
        const psWrapperPath = (0, path_1.join)(targetDir, 'claude-flow.ps1');
        const psWrapperSource = (0, path_1.join)(templatesDir, 'claude-flow.ps1');
        if (await copyFile(psWrapperSource, psWrapperPath, options)) {
            results.copiedFiles.push('claude-flow.ps1');
        }
    }
    catch (err) {
        results.errors.push(`Failed to copy wrapper scripts: ${err.message}`);
    }
}
/**
 * Create directory structure
 */
async function createDirectoryStructure(targetDir, options) {
    const directories = [
        'memory',
        'memory/agents',
        'memory/sessions',
        'coordination',
        'coordination/memory_bank',
        'coordination/subtasks',
        'coordination/orchestration',
        '.claude',
        '.claude/commands',
        '.claude/logs',
        '.swarm', // For memory persistence
    ];
    if (options.sparc) {
        directories.push('.claude/commands/sparc', '.claude/commands/swarm');
    }
    for (const dir of directories) {
        const dirPath = (0, path_1.join)(targetDir, dir);
        try {
            if (!options.dryRun) {
                await fs_1.promises.mkdir(dirPath, { recursive: true });
            }
            console.log(`  ${options.dryRun ? '[DRY RUN] Would create' : '✓ Created'} ${dir}/ directory`);
        }
        catch (err) {
            if (err.code !== 'EEXIST') {
                console.log(`  ❌ Failed to create ${dir}/: ${err.message}`);
            }
        }
    }
}
/**
 * Create README files for memory directories
 */
async function createMemoryReadmeFiles(targetDir, options, results) {
    const { createAgentsReadme, createSessionsReadme } = await Promise.resolve().then(() => __importStar(require('./templates/readme-files.js')));
    const readmeFiles = [
        { path: 'memory/agents/README.md', content: createAgentsReadme() },
        { path: 'memory/sessions/README.md', content: createSessionsReadme() },
    ];
    for (const { path, content } of readmeFiles) {
        const fullPath = (0, path_1.join)(targetDir, path);
        try {
            if (!options.dryRun) {
                await fs_1.promises.mkdir((0, path_1.dirname)(fullPath), { recursive: true });
                await fs_1.promises.writeFile(fullPath, content);
            }
            console.log(`  ${options.dryRun ? '[DRY RUN] Would create' : '✓ Created'} ${path}`);
            results.copiedFiles.push(path);
        }
        catch (err) {
            results.errors.push(`Failed to create ${path}: ${err.message}`);
        }
    }
    // Initialize persistence database
    const dbPath = (0, path_1.join)(targetDir, 'memory', 'claude-flow-data.json');
    const initialData = {
        agents: [],
        tasks: [],
        lastUpdated: Date.now(),
    };
    try {
        if (!options.dryRun) {
            await fs_1.promises.writeFile(dbPath, JSON.stringify(initialData, null, 2));
        }
        console.log(`  ${options.dryRun ? '[DRY RUN] Would create' : '✓ Created'} memory/claude-flow-data.json (persistence database)`);
        results.copiedFiles.push('memory/claude-flow-data.json');
    }
    catch (err) {
        results.errors.push(`Failed to create persistence database: ${err.message}`);
    }
}
/**
 * Get template content as fallback (for backwards compatibility)
 */
async function getTemplateContent(templatePath) {
    const filename = templatePath.split('/').pop();
    // Map template files to their generator functions
    const templateGenerators = {
        'CLAUDE.md': async () => {
            const { createFullClaudeMd } = await Promise.resolve().then(() => __importStar(require('./templates/claude-md.js')));
            return createFullClaudeMd();
        },
        'CLAUDE.md.sparc': async () => {
            const { createSparcClaudeMd } = await Promise.resolve().then(() => __importStar(require('./templates/claude-md.js')));
            return createSparcClaudeMd();
        },
        'CLAUDE.md.minimal': async () => {
            const { createMinimalClaudeMd } = await Promise.resolve().then(() => __importStar(require('./templates/claude-md.js')));
            return createMinimalClaudeMd();
        },
        'CLAUDE.md.optimized': async () => {
            const { createOptimizedSparcClaudeMd } = await Promise.resolve().then(() => __importStar(require('./templates/claude-md.js')));
            return createOptimizedSparcClaudeMd();
        },
        'CLAUDE.md.enhanced': async () => {
            const { createEnhancedClaudeMd } = await Promise.resolve().then(() => __importStar(require('./templates/enhanced-templates.js')));
            return createEnhancedClaudeMd();
        },
        'memory-bank.md': async () => {
            const { createFullMemoryBankMd } = await Promise.resolve().then(() => __importStar(require('./templates/memory-bank-md.js')));
            return createFullMemoryBankMd();
        },
        'memory-bank.md.minimal': async () => {
            const { createMinimalMemoryBankMd } = await Promise.resolve().then(() => __importStar(require('./templates/memory-bank-md.js')));
            return createMinimalMemoryBankMd();
        },
        'memory-bank.md.optimized': async () => {
            const { createOptimizedMemoryBankMd } = await Promise.resolve().then(() => __importStar(require('./templates/memory-bank-md.js')));
            return createOptimizedMemoryBankMd();
        },
        'coordination.md': async () => {
            const { createFullCoordinationMd } = await Promise.resolve().then(() => __importStar(require('./templates/coordination-md.js')));
            return createFullCoordinationMd();
        },
        'coordination.md.minimal': async () => {
            const { createMinimalCoordinationMd } = await Promise.resolve().then(() => __importStar(require('./templates/coordination-md.js')));
            return createMinimalCoordinationMd();
        },
        'coordination.md.optimized': async () => {
            const { createOptimizedCoordinationMd } = await Promise.resolve().then(() => __importStar(require('./templates/coordination-md.js')));
            return createOptimizedCoordinationMd();
        },
        'settings.json': async () => {
            return await fs_1.promises.readFile((0, path_1.join)(__dirname, 'templates', 'settings.json'), 'utf8');
        },
        'settings.json.enhanced': async () => {
            const { createEnhancedSettingsJson } = await Promise.resolve().then(() => __importStar(require('./templates/enhanced-templates.js')));
            return createEnhancedSettingsJson();
        },
        'claude-flow-universal': async () => {
            return await fs_1.promises.readFile((0, path_1.join)(__dirname, 'templates', 'claude-flow-universal'), 'utf8');
        },
        'claude-flow.bat': async () => {
            return await fs_1.promises.readFile((0, path_1.join)(__dirname, 'templates', 'claude-flow.bat'), 'utf8');
        },
        'claude-flow.ps1': async () => {
            return await fs_1.promises.readFile((0, path_1.join)(__dirname, 'templates', 'claude-flow.ps1'), 'utf8');
        },
    };
    const generator = templateGenerators[filename] || templateGenerators[filename.replace(/\.(sparc|minimal|optimized|enhanced)$/, '')];
    if (generator) {
        try {
            return await generator();
        }
        catch (err) {
            console.log(`  ⚠️  Failed to generate template content for ${filename}: ${err.message}`);
            return null;
        }
    }
    return null;
}
/**
 * Generate command templates as fallback
 */
async function generateCommandTemplates(targetDir, options, results) {
    const { COMMAND_STRUCTURE, createCommandDoc } = await Promise.resolve().then(() => __importStar(require('./templates/enhanced-templates.js')));
    for (const [category, commands] of Object.entries(COMMAND_STRUCTURE)) {
        const categoryDir = (0, path_1.join)(targetDir, '.claude', 'commands', category);
        try {
            if (!options.dryRun) {
                await fs_1.promises.mkdir(categoryDir, { recursive: true });
                // Create category README
                const categoryReadme = `# ${category.charAt(0).toUpperCase() + category.slice(1)} Commands

Commands for ${category} operations in Claude Flow.

## Available Commands

${commands.map(cmd => `- [${cmd}](./${cmd}.md)`).join('\n')}
`;
                await fs_1.promises.writeFile((0, path_1.join)(categoryDir, 'README.md'), categoryReadme);
            }
            // Create individual command docs
            for (const command of commands) {
                const doc = createCommandDoc(category, command);
                if (doc) {
                    const docPath = (0, path_1.join)(categoryDir, `${command}.md`);
                    if (!options.dryRun) {
                        await fs_1.promises.writeFile(docPath, doc);
                    }
                    results.copiedFiles.push((0, path_1.join)('.claude', 'commands', category, `${command}.md`));
                }
            }
            console.log(`  ${options.dryRun ? '[DRY RUN] Would create' : '✓ Created'} ${commands.length} ${category} command docs`);
        }
        catch (err) {
            results.errors.push(`Failed to generate ${category} command templates: ${err.message}`);
        }
    }
}
//# sourceMappingURL=template-copier.js.map