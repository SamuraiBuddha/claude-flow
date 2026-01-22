/**
 * Update or create .gitignore with Claude Flow entries
 * @param {string} workingDir - The working directory
 * @param {boolean} force - Whether to force update even if entries exist
 * @param {boolean} dryRun - Whether to run in dry-run mode
 * @returns {Promise<{success: boolean, message: string}>}
 */
export function updateGitignore(workingDir: string, force?: boolean, dryRun?: boolean): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Check if gitignore needs updating
 * @param {string} workingDir - The working directory
 * @returns {Promise<boolean>}
 */
export function needsGitignoreUpdate(workingDir: string): Promise<boolean>;
/**
 * Get list of files that should be gitignored
 * @returns {string[]}
 */
export function getGitignorePatterns(): string[];
//# sourceMappingURL=gitignore-updater.d.ts.map