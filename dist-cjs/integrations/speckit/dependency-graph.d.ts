/**
 * Dependency Graph - DAG-based task dependency management with topological sort
 *
 * Provides directed acyclic graph operations for task orchestration including:
 * - Cycle detection
 * - Topological sorting
 * - Parallel batch extraction
 * - Critical path analysis
 * - Mermaid visualization
 */
import { EventEmitter } from 'node:events';
export interface GraphNode {
    id: string;
    name: string;
    description?: string;
    priority: TaskPriority;
    estimatedDuration: number;
    tags: string[];
    parallelizable: boolean;
    metadata: Record<string, unknown>;
}
export type TaskPriority = 'P1' | 'P2' | 'P3';
export interface GraphEdge {
    from: string;
    to: string;
    type: EdgeType;
}
export type EdgeType = 'blocks' | 'soft-depends' | 'data-flow';
export interface CycleInfo {
    nodes: string[];
    path: string[];
}
export interface CriticalPathResult {
    path: string[];
    totalDuration: number;
    bottlenecks: string[];
}
export interface ParallelBatch {
    level: number;
    tasks: string[];
    estimatedDuration: number;
}
export interface GraphStats {
    nodeCount: number;
    edgeCount: number;
    maxDepth: number;
    parallelizableCount: number;
    criticalPathLength: number;
}
export declare class DependencyGraph extends EventEmitter {
    private nodes;
    private edges;
    private reverseEdges;
    private dirty;
    private cachedOrder;
    private cachedBatches;
    constructor();
    /**
     * Add a task node to the graph
     */
    addTask(id: string, name: string, options?: {
        description?: string;
        priority?: TaskPriority;
        estimatedDuration?: number;
        tags?: string[];
        parallelizable?: boolean;
        metadata?: Record<string, unknown>;
    }): void;
    /**
     * Remove a task node and all its edges
     */
    removeTask(id: string): boolean;
    /**
     * Get a task node by ID
     */
    getTask(id: string): GraphNode | undefined;
    /**
     * Get all task nodes
     */
    getAllTasks(): GraphNode[];
    /**
     * Update task properties
     */
    updateTask(id: string, updates: Partial<Omit<GraphNode, 'id'>>): boolean;
    /**
     * Add a dependency edge between two tasks
     * @param from - The blocking task (must complete first)
     * @param to - The dependent task (waits for 'from')
     * @param type - Type of dependency
     */
    addDependency(from: string, to: string, type?: EdgeType): void;
    /**
     * Remove a dependency edge
     */
    removeDependency(from: string, to: string): boolean;
    /**
     * Get all dependencies of a task (tasks that must complete before it)
     */
    getDependencies(taskId: string): string[];
    /**
     * Get all dependents of a task (tasks that wait for it)
     */
    getDependents(taskId: string): string[];
    /**
     * Detect if the graph contains any cycles
     */
    detectCycle(): CycleInfo | null;
    /**
     * Detect cycle starting from a specific node (used after adding edges)
     */
    private detectCycleFromNode;
    /**
     * Get tasks in execution order (topological sort using Kahn's algorithm)
     */
    getExecutionOrder(): string[];
    /**
     * Get tasks grouped into parallel execution batches
     * Tasks in the same batch can run concurrently
     */
    getParallelBatches(): ParallelBatch[];
    /**
     * Get only parallelizable tasks (marked with [P])
     */
    getParallelizableTasks(): GraphNode[];
    /**
     * Get tasks that can run immediately (no unmet dependencies)
     */
    getReadyTasks(completedTasks?: Set<string>): GraphNode[];
    /**
     * Find the critical path (longest path through the graph)
     */
    getCriticalPath(): CriticalPathResult;
    /**
     * Get bottleneck tasks (tasks that block the most other tasks)
     */
    getBottlenecks(): {
        taskId: string;
        blockedCount: number;
        impact: number;
    }[];
    /**
     * Count all tasks that depend on a given task (transitively)
     */
    private countAllDependents;
    /**
     * Generate Mermaid diagram syntax for the dependency graph
     */
    toMermaid(): string;
    /**
     * Get graph statistics
     */
    getStats(): GraphStats;
    /**
     * Get average task duration
     */
    private getAverageDuration;
    /**
     * Invalidate cached computations
     */
    private invalidateCache;
    /**
     * Clear all nodes and edges
     */
    clear(): void;
    /**
     * Clone the graph
     */
    clone(): DependencyGraph;
}
export default DependencyGraph;
//# sourceMappingURL=dependency-graph.d.ts.map