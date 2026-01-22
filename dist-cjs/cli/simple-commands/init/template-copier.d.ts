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
export function copyTemplates(targetDir: string, options?: {
    sparc: boolean;
    enhanced: boolean;
    minimal: boolean;
    optimized: boolean;
    dryRun: boolean;
    force: boolean;
    selectedModes: string[];
}): Promise<{
    success: boolean;
    copiedFiles: string[];
    errors: string[];
}>;
//# sourceMappingURL=template-copier.d.ts.map