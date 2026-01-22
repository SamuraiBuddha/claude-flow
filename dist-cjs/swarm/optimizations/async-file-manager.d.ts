/**
 * Async File Manager
 * Handles non-blocking file operations with queuing
 */
export interface FileOperationResult {
    path: string;
    operation: 'read' | 'write' | 'delete' | 'mkdir';
    success: boolean;
    duration: number;
    size?: number;
    error?: Error;
}
export declare class AsyncFileManager {
    private concurrency;
    private writeQueue;
    private readQueue;
    private logger;
    private metrics;
    constructor(concurrency?: {
        write: number;
        read: number;
    });
    writeFile(path: string, data: string | Buffer): Promise<FileOperationResult>;
    readFile(path: string): Promise<FileOperationResult & {
        data?: string;
    }>;
    writeJSON(path: string, data: any, pretty?: boolean): Promise<FileOperationResult>;
    readJSON(path: string): Promise<FileOperationResult & {
        data?: any;
    }>;
    deleteFile(path: string): Promise<FileOperationResult>;
    ensureDirectory(path: string): Promise<FileOperationResult>;
    ensureDirectories(paths: string[]): Promise<FileOperationResult[]>;
    private streamWrite;
    streamRead(path: string): Promise<NodeJS.ReadableStream>;
    copyFile(source: string, destination: string): Promise<FileOperationResult>;
    moveFile(source: string, destination: string): Promise<FileOperationResult>;
    private trackOperation;
    getMetrics(): {
        operations: {
            [k: string]: number;
        };
        totalBytes: number;
        errors: number;
        writeQueueSize: number;
        readQueueSize: number;
        writeQueuePending: number;
        readQueuePending: number;
    };
    waitForPendingOperations(): Promise<void>;
    clearQueues(): void;
}
//# sourceMappingURL=async-file-manager.d.ts.map