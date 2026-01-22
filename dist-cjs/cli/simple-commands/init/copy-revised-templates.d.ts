/**
 * Copy revised template files from repository to target project
 */
export function copyRevisedTemplates(targetDir: any, options?: {}): Promise<{
    success: boolean;
    copiedFiles: never[];
    skippedFiles: never[];
    errors: never[];
}>;
/**
 * Copy only specific categories
 */
export function copyRevisedTemplatesByCategory(targetDir: any, categories: any, options?: {}): Promise<{
    success: boolean;
    copiedFiles: never[];
    skippedFiles: never[];
    errors: never[];
}>;
/**
 * Validate that source templates exist
 */
export function validateTemplatesExist(): {
    valid: boolean;
    error: string;
} | {
    valid: boolean;
    error?: undefined;
};
//# sourceMappingURL=copy-revised-templates.d.ts.map