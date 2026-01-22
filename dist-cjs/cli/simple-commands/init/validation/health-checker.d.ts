export class HealthChecker {
    constructor(workingDir: any);
    workingDir: any;
    /**
     * Check SPARC mode availability
     */
    checkModeAvailability(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        modes: {
            total: number;
            available: number;
            unavailable: never[];
        };
    }>;
    /**
     * Check template integrity
     */
    checkTemplateIntegrity(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        templates: {
            found: never[];
            missing: never[];
            corrupted: never[];
        };
    }>;
    /**
     * Check configuration consistency
     */
    checkConfigConsistency(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        consistency: {};
    }>;
    /**
     * Check system resources
     */
    checkSystemResources(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        resources: {};
    }>;
    /**
     * Run comprehensive health diagnostics
     */
    runDiagnostics(): Promise<{
        success: boolean;
        errors: never[];
        warnings: never[];
        diagnostics: {};
        timestamp: string;
    }>;
    checkSingleModeAvailability(mode: any): Promise<boolean>;
    checkTemplateDirectory(dirPath: any): Promise<{
        found: never[];
        missing: never[];
        corrupted: never[];
    }>;
    checkRoomodesConsistency(): Promise<{
        consistent: boolean;
        issues: never[];
    }>;
    checkClaudeConfigConsistency(): Promise<{
        consistent: boolean;
        issues: never[];
    }>;
    checkMemoryConsistency(): Promise<{
        consistent: boolean;
        issues: never[];
    }>;
    checkDiskSpace(): Promise<{
        adequate: boolean;
        available: number;
        used: number;
    }>;
    checkMemoryUsage(): Promise<{
        adequate: boolean;
        available: number;
        used: number;
    }>;
    checkFileDescriptors(): Promise<{
        adequate: boolean;
        open: number;
        limit: number;
    }>;
    checkProcessLimits(): Promise<{
        adequate: boolean;
        limits: {};
    }>;
    checkFileSystemHealth(): Promise<{
        healthy: boolean;
        errors: never[];
        readWrite: boolean;
        permissions: boolean;
    }>;
    checkProcessHealth(): Promise<{
        healthy: boolean;
        warnings: never[];
        processes: never[];
    }>;
    checkNetworkHealth(): Promise<{
        healthy: boolean;
        warnings: never[];
        connectivity: boolean;
    }>;
    checkIntegrationHealth(): Promise<{
        healthy: boolean;
        warnings: never[];
        integrations: {};
    }>;
}
//# sourceMappingURL=health-checker.d.ts.map