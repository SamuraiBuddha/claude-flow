/**
 * Get metrics from both swarm systems and provide unified view
 */
export function getUnifiedSwarmMetrics(): Promise<{
    hiveMind: {
        available: boolean;
        reason: string;
        type?: undefined;
        overall?: undefined;
        swarms?: undefined;
    } | {
        available: boolean;
        type: string;
        overall: unknown;
        swarms: unknown[];
        reason?: undefined;
    };
    ruvSwarm: {
        available: boolean;
        reason: string;
        type?: undefined;
        overall?: undefined;
        swarms?: undefined;
    } | {
        available: boolean;
        type: string;
        overall: unknown;
        swarms: unknown[];
        reason?: undefined;
    };
    integrated: null;
}>;
/**
 * Display unified metrics with clear system breakdown
 */
export function showUnifiedMetrics(): Promise<{
    hiveMind: {
        available: boolean;
        reason: string;
        type?: undefined;
        overall?: undefined;
        swarms?: undefined;
    } | {
        available: boolean;
        type: string;
        overall: unknown;
        swarms: unknown[];
        reason?: undefined;
    };
    ruvSwarm: {
        available: boolean;
        reason: string;
        type?: undefined;
        overall?: undefined;
        swarms?: undefined;
    } | {
        available: boolean;
        type: string;
        overall: unknown;
        swarms: unknown[];
        reason?: undefined;
    };
    integrated: null;
}>;
/**
 * Fix task attribution issues by synchronizing systems
 */
export function fixTaskAttribution(): Promise<void>;
//# sourceMappingURL=swarm-metrics-integration.d.ts.map