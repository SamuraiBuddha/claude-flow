/**
 * Circular Buffer Implementation
 * Fixed-size buffer that overwrites oldest entries when full
 */
export declare class CircularBuffer<T> {
    private capacity;
    private buffer;
    private writeIndex;
    private size;
    private totalItemsWritten;
    constructor(capacity: number);
    push(item: T): void;
    pushMany(items: T[]): void;
    get(index: number): T | undefined;
    getRecent(count: number): T[];
    getAll(): T[];
    find(predicate: (item: T) => boolean): T | undefined;
    filter(predicate: (item: T) => boolean): T[];
    clear(): void;
    isEmpty(): boolean;
    isFull(): boolean;
    getSize(): number;
    getCapacity(): number;
    getTotalItemsWritten(): number;
    getOverwrittenCount(): number;
    /**
     * Get estimated memory usage of the buffer
     */
    getMemoryUsage(): number;
    /**
     * Create a snapshot of the current buffer state
     */
    snapshot(): {
        items: T[];
        capacity: number;
        size: number;
        totalItemsWritten: number;
        overwrittenCount: number;
        memoryUsage: number;
    };
    /**
     * Resize the buffer (creates a new buffer with the new capacity)
     */
    resize(newCapacity: number): void;
}
//# sourceMappingURL=circular-buffer.d.ts.map