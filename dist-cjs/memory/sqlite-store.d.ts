export const memoryStore: SqliteMemoryStore;
export default SqliteMemoryStore;
export class SqliteMemoryStore {
    constructor(options?: {});
    options: {
        dbName: any;
        directory: any;
    };
    db: any;
    statements: Map<any, any>;
    isInitialized: boolean;
    /**
     * Determine the best directory for memory storage
     * Uses .swarm directory in current working directory (consistent with hive-mind approach)
     */
    _getMemoryDirectory(): string;
    _directoryExists(dir: any): boolean;
    initialize(): Promise<void>;
    _createTables(): void;
    _prepareStatements(): void;
    store(key: any, value: any, options?: {}): Promise<{
        success: boolean;
        id: any;
        size: number;
    }>;
    retrieve(key: any, options?: {}): Promise<any>;
    list(options?: {}): Promise<any>;
    delete(key: any, options?: {}): Promise<boolean>;
    search(pattern: any, options?: {}): Promise<any>;
    cleanup(): Promise<any>;
    _tryParseJson(value: any): any;
    close(): void;
}
//# sourceMappingURL=sqlite-store.d.ts.map