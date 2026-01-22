/**
 * Memory management commands
 */
import { Command } from 'commander';
interface MemoryEntry {
    key: string;
    value: string;
    namespace: string;
    timestamp: number;
}
export declare class SimpleMemoryManager {
    private filePath;
    private data;
    load(): Promise<void>;
    save(): Promise<void>;
    store(key: string, value: string, namespace?: string): Promise<void>;
    query(search: string, namespace?: string): Promise<MemoryEntry[]>;
    getStats(): Promise<{
        totalEntries: number;
        namespaces: number;
        namespaceStats: Record<string, number>;
        sizeBytes: number;
    }>;
    exportData(filePath: string): Promise<void>;
    importData(filePath: string): Promise<void>;
    cleanup(daysOld?: number): Promise<number>;
}
export declare const memoryCommand: Command;
export {};
//# sourceMappingURL=memory.d.ts.map