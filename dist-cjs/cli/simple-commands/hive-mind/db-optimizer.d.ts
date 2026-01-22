/**
 * Optimize existing hive mind database with backward compatibility
 */
export function optimizeHiveMindDatabase(dbPath: any, options?: {}): Promise<{
    success: boolean;
    optimizations: string[];
    error?: undefined;
} | {
    success: boolean;
    error: any;
    optimizations?: undefined;
}>;
/**
 * Database maintenance utilities
 */
export function performMaintenance(dbPath: any, options?: {}): Promise<void>;
/**
 * Generate optimization report
 */
export function generateOptimizationReport(dbPath: any): Promise<{
    schemaVersion: any;
    tables: {};
    indexes: never[];
    performance: {};
} | null>;
declare namespace _default {
    export { optimizeHiveMindDatabase };
    export { performMaintenance };
    export { generateOptimizationReport };
}
export default _default;
//# sourceMappingURL=db-optimizer.d.ts.map