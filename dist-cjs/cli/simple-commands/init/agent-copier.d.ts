/**
 * Copy all agent files from the installed package to project directory
 */
export function copyAgentFiles(targetDir: any, options?: {}): Promise<{
    success: boolean;
    error: string;
    copiedFiles?: undefined;
    errors?: undefined;
    totalAgents?: undefined;
} | {
    success: boolean;
    copiedFiles: any[];
    errors: any[];
    totalAgents: number;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    copiedFiles: never[];
    errors: any[];
    totalAgents?: undefined;
}>;
/**
 * Create agent directories structure
 */
export function createAgentDirectories(targetDir: any, dryRun?: boolean): Promise<void>;
/**
 * Validate agent system after copying
 */
export function validateAgentSystem(targetDir: any): Promise<{
    valid: boolean;
    categories: number;
    totalAgents: number;
    categoryNames: string[];
    error?: undefined;
} | {
    valid: boolean;
    error: any;
    categories?: undefined;
    totalAgents?: undefined;
    categoryNames?: undefined;
}>;
//# sourceMappingURL=agent-copier.d.ts.map