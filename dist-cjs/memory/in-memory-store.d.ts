export default InMemoryStore;
/**
 * In-memory store for environments where SQLite is not available
 * Provides the same API as SQLite store but data is not persistent
 */
export class InMemoryStore {
    constructor(options?: {});
    options: {};
    data: Map<any, any>;
    isInitialized: boolean;
    cleanupInterval: NodeJS.Timeout | null;
    initialize(): Promise<void>;
    _getNamespaceMap(namespace: any): any;
    store(key: any, value: any, options?: {}): Promise<{
        success: boolean;
        id: string;
        size: number;
    }>;
    retrieve(key: any, options?: {}): Promise<any>;
    list(options?: {}): Promise<{
        key: any;
        value: any;
        namespace: any;
        metadata: any;
        createdAt: Date;
        updatedAt: Date;
        accessCount: any;
    }[]>;
    delete(key: any, options?: {}): Promise<any>;
    search(pattern: any, options?: {}): Promise<{
        key: any;
        value: any;
        namespace: any;
        score: any;
        updatedAt: Date;
    }[]>;
    cleanup(): Promise<number>;
    _tryParseJson(value: any): any;
    close(): void;
}
//# sourceMappingURL=in-memory-store.d.ts.map