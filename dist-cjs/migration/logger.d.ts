export interface LogEntry {
    timestamp: Date;
    level: 'info' | 'warn' | 'error' | 'success' | 'debug';
    message: string;
    context?: any;
    stack?: string;
}
export declare class MigrationLogger {
    private logFile?;
    private entries;
    constructor(logFile?: string);
    info(message: string, context?: any): void;
    warn(message: string, context?: any): void;
    error(message: string, error?: Error | any, context?: any): void;
    success(message: string, context?: any): void;
    debug(message: string, context?: any): void;
    private log;
    private writeToFile;
    saveToFile(filePath: string): Promise<void>;
    getEntries(): LogEntry[];
    getEntriesByLevel(level: LogEntry['level']): LogEntry[];
    clear(): void;
    printSummary(): void;
}
export declare const logger: MigrationLogger;
//# sourceMappingURL=logger.d.ts.map