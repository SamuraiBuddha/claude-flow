export interface PromptConfig {
    sourceDirectories: string[];
    destinationDirectory: string;
    defaultOptions: {
        backup: boolean;
        verify: boolean;
        parallel: boolean;
        maxWorkers: number;
        conflictResolution: 'skip' | 'overwrite' | 'backup' | 'merge';
        includePatterns: string[];
        excludePatterns: string[];
    };
    profiles: Record<string, Partial<PromptConfig['defaultOptions']>>;
}
export declare const DEFAULT_CONFIG: PromptConfig;
export declare class PromptConfigManager {
    private configPath;
    private config;
    constructor(configPath?: string);
    loadConfig(): Promise<PromptConfig>;
    saveConfig(config?: Partial<PromptConfig>): Promise<void>;
    getConfig(): PromptConfig;
    getProfile(profileName: string): PromptConfig['defaultOptions'];
    listProfiles(): string[];
    private mergeConfig;
}
export declare class PromptPathResolver {
    private basePath;
    constructor(basePath?: string);
    resolvePaths(sourceDirectories: string[], destinationDirectory: string): {
        sources: string[];
        destination: string;
    };
    private directoryExists;
    discoverPromptDirectories(): Promise<string[]>;
    private containsPromptFiles;
}
export declare class PromptValidator {
    static validatePromptFile(filePath: string): Promise<{
        valid: boolean;
        issues: string[];
        metadata?: any;
    }>;
    private static parseFrontMatter;
}
export declare function createProgressBar(total: number): {
    update: (current: number) => void;
    complete: () => void;
};
export declare function formatFileSize(bytes: number): string;
export declare function formatDuration(ms: number): string;
//# sourceMappingURL=prompt-utils.d.ts.map