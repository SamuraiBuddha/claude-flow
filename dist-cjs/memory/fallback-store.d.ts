export const memoryStore: FallbackMemoryStore;
export default FallbackMemoryStore;
export class FallbackMemoryStore {
    constructor(options?: {});
    options: {};
    primaryStore: SqliteMemoryStore | null;
    fallbackStore: InMemoryStore | null;
    useFallback: boolean;
    initializationAttempted: boolean;
    initialize(): Promise<void>;
    _logFallbackUsage(): void;
    get activeStore(): SqliteMemoryStore | InMemoryStore | null;
    store(key: any, value: any, options?: {}): Promise<{
        success: boolean;
        id: any;
        size: number;
    }>;
    retrieve(key: any, options?: {}): Promise<any>;
    list(options?: {}): Promise<any>;
    delete(key: any, options?: {}): Promise<any>;
    search(pattern: any, options?: {}): Promise<any>;
    cleanup(): Promise<any>;
    close(): void;
    isUsingFallback(): boolean;
}
import { SqliteMemoryStore } from './sqlite-store.js';
import { InMemoryStore } from './in-memory-store.js';
//# sourceMappingURL=fallback-store.d.ts.map