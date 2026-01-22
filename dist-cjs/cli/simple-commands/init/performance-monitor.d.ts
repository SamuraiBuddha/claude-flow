export class PerformanceMonitor {
    constructor(options?: {});
    enabled: boolean;
    logLevel: any;
    memoryCheckInterval: any;
    maxMemoryMB: any;
    metrics: {
        startTime: null;
        endTime: null;
        peakMemoryMB: number;
        averageMemoryMB: number;
        operationCount: number;
        memoryReadings: never[];
        errors: never[];
        warnings: never[];
    };
    memoryMonitor: NodeJS.Timeout | null;
    start(): void;
    stop(): void;
    startMemoryMonitoring(): void;
    stopMemoryMonitoring(): void;
    calculateAverages(): void;
    recordOperation(operationType: any, details?: {}): void;
    recordError(error: any, context?: {}): void;
    recordWarning(message: any, context?: {}): void;
    getMetrics(): {
        duration: number;
        operationsPerSecond: number;
        memoryEfficiency: string;
        startTime: null;
        endTime: null;
        peakMemoryMB: number;
        averageMemoryMB: number;
        operationCount: number;
        memoryReadings: never[];
        errors: never[];
        warnings: never[];
    };
    generateReport(): string;
    displayRealTimeStats(): void;
}
export class ResourceThresholdMonitor {
    static createDefaultCallbacks(): {
        onMemoryWarning: (current: any, max: any) => void;
        onMemoryError: (current: any, max: any) => void;
        onCPUWarning: (percent: any) => void;
    };
    constructor(options?: {});
    maxMemoryMB: any;
    maxCPUPercent: any;
    checkInterval: any;
    isMonitoring: boolean;
    monitorInterval: NodeJS.Timeout | null;
    callbacks: {
        memoryWarning: any;
        memoryError: any;
        cpuWarning: any;
    };
    start(): void;
    stop(): void;
    checkResources(): void;
}
export class BatchOptimizer {
    static calculateOptimalConcurrency(projectCount: any, systemSpecs?: {}): number;
    static estimateCompletionTime(projectCount: any, options?: {}): {
        sequential: number;
        parallel: number;
        savings: number;
        savingsPercent: string;
    };
    static generateRecommendations(projectCount: any, options?: {}): string[];
}
//# sourceMappingURL=performance-monitor.d.ts.map