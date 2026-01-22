"use strict";
// copy-revised-templates.js - Copy the revised template files from repository
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyRevisedTemplates = copyRevisedTemplates;
exports.copyRevisedTemplatesByCategory = copyRevisedTemplatesByCategory;
exports.validateTemplatesExist = validateTemplatesExist;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
// Source directory for revised templates (repository root .claude/commands)
const REPO_TEMPLATES_DIR = path_1.default.join(__dirname, '../../../../.claude/commands');
/**
 * Copy revised template files from repository to target project
 */
async function copyRevisedTemplates(targetDir, options = {}) {
    const results = {
        success: true,
        copiedFiles: [],
        skippedFiles: [],
        errors: []
    };
    const targetCommandsDir = path_1.default.join(targetDir, '.claude/commands');
    try {
        // Ensure target directory exists
        await fs_1.default.promises.mkdir(targetCommandsDir, { recursive: true });
        // Copy all template files recursively
        await copyDirectoryRecursive(REPO_TEMPLATES_DIR, targetCommandsDir, options, results);
        // Copy additional .claude files if they exist
        const additionalFiles = [
            { source: '../config.json', target: '.claude/config.json' },
            { source: '../settings.json', target: '.claude/settings.json' }
        ];
        for (const file of additionalFiles) {
            const sourcePath = path_1.default.join(REPO_TEMPLATES_DIR, file.source);
            const targetPath = path_1.default.join(targetDir, file.target);
            if (fs_1.default.existsSync(sourcePath)) {
                try {
                    const targetDirPath = path_1.default.dirname(targetPath);
                    await fs_1.default.promises.mkdir(targetDirPath, { recursive: true });
                    if (!fs_1.default.existsSync(targetPath) || options.force) {
                        await fs_1.default.promises.copyFile(sourcePath, targetPath);
                        results.copiedFiles.push(file.target);
                        if (!options.dryRun) {
                            console.log(`  ✓ Copied ${file.target}`);
                        }
                    }
                    else {
                        results.skippedFiles.push(file.target);
                        if (!options.dryRun) {
                            console.log(`  ⏭️  Skipped ${file.target} (already exists)`);
                        }
                    }
                }
                catch (err) {
                    results.errors.push(`Failed to copy ${file.target}: ${err.message}`);
                }
            }
        }
        results.success = results.errors.length === 0;
    }
    catch (err) {
        results.success = false;
        results.errors.push(`Failed to copy revised templates: ${err.message}`);
    }
    return results;
}
/**
 * Recursively copy directory contents
 */
async function copyDirectoryRecursive(sourceDir, targetDir, options, results) {
    try {
        const entries = await fs_1.default.promises.readdir(sourceDir, { withFileTypes: true });
        for (const entry of entries) {
            const sourcePath = path_1.default.join(sourceDir, entry.name);
            const targetPath = path_1.default.join(targetDir, entry.name);
            if (entry.isDirectory()) {
                // Create directory and recurse
                await fs_1.default.promises.mkdir(targetPath, { recursive: true });
                await copyDirectoryRecursive(sourcePath, targetPath, options, results);
            }
            else if (entry.isFile() && entry.name.endsWith('.md')) {
                // Copy markdown files
                try {
                    if (!fs_1.default.existsSync(targetPath) || options.force) {
                        if (!options.dryRun) {
                            await fs_1.default.promises.copyFile(sourcePath, targetPath);
                        }
                        const relativePath = path_1.default.relative(targetDir, targetPath);
                        results.copiedFiles.push(relativePath);
                        if (!options.dryRun && options.verbose) {
                            console.log(`  ✓ Copied ${relativePath}`);
                        }
                    }
                    else {
                        const relativePath = path_1.default.relative(targetDir, targetPath);
                        results.skippedFiles.push(relativePath);
                        if (!options.dryRun && options.verbose) {
                            console.log(`  ⏭️  Skipped ${relativePath} (already exists)`);
                        }
                    }
                }
                catch (err) {
                    results.errors.push(`Failed to copy ${entry.name}: ${err.message}`);
                }
            }
        }
    }
    catch (err) {
        results.errors.push(`Failed to read directory ${sourceDir}: ${err.message}`);
    }
}
/**
 * Copy only specific categories
 */
async function copyRevisedTemplatesByCategory(targetDir, categories, options = {}) {
    const results = {
        success: true,
        copiedFiles: [],
        skippedFiles: [],
        errors: []
    };
    for (const category of categories) {
        const sourceCategoryDir = path_1.default.join(REPO_TEMPLATES_DIR, category);
        const targetCategoryDir = path_1.default.join(targetDir, '.claude/commands', category);
        if (fs_1.default.existsSync(sourceCategoryDir)) {
            await fs_1.default.promises.mkdir(targetCategoryDir, { recursive: true });
            await copyDirectoryRecursive(sourceCategoryDir, targetCategoryDir, options, results);
        }
        else {
            results.errors.push(`Category '${category}' not found in templates`);
        }
    }
    results.success = results.errors.length === 0;
    return results;
}
/**
 * Validate that source templates exist
 */
function validateTemplatesExist() {
    if (!fs_1.default.existsSync(REPO_TEMPLATES_DIR)) {
        return {
            valid: false,
            error: `Template directory not found: ${REPO_TEMPLATES_DIR}`
        };
    }
    const requiredCategories = ['analysis', 'github', 'sparc', 'coordination'];
    const missingCategories = [];
    for (const category of requiredCategories) {
        const categoryPath = path_1.default.join(REPO_TEMPLATES_DIR, category);
        if (!fs_1.default.existsSync(categoryPath)) {
            missingCategories.push(category);
        }
    }
    if (missingCategories.length > 0) {
        return {
            valid: false,
            error: `Missing required template categories: ${missingCategories.join(', ')}`
        };
    }
    return { valid: true };
}
//# sourceMappingURL=copy-revised-templates.js.map