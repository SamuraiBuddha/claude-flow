"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyGraph = void 0;
const node_events_1 = require("node:events");
// ===== DEPENDENCY GRAPH CLASS =====
class DependencyGraph extends node_events_1.EventEmitter {
    nodes = new Map();
    edges = new Map(); // outgoing edges
    reverseEdges = new Map(); // incoming edges
    dirty = true; // marks if cached computations are stale
    cachedOrder = null;
    cachedBatches = null;
    constructor() {
        super();
    }
    // ===== NODE OPERATIONS =====
    /**
     * Add a task node to the graph
     */
    addTask(id, name, options = {}) {
        if (this.nodes.has(id)) {
            throw new Error(`Task with id '${id}' already exists`);
        }
        const node = {
            id,
            name,
            description: options.description,
            priority: options.priority ?? 'P2',
            estimatedDuration: options.estimatedDuration ?? 30,
            tags: options.tags ?? [],
            parallelizable: options.parallelizable ?? false,
            metadata: options.metadata ?? {},
        };
        this.nodes.set(id, node);
        this.edges.set(id, []);
        this.reverseEdges.set(id, []);
        this.invalidateCache();
        this.emit('node:added', { node });
    }
    /**
     * Remove a task node and all its edges
     */
    removeTask(id) {
        if (!this.nodes.has(id)) {
            return false;
        }
        // Remove all edges involving this node
        for (const edge of this.edges.get(id) ?? []) {
            const reverseList = this.reverseEdges.get(edge.to);
            if (reverseList) {
                const idx = reverseList.findIndex(e => e.from === id);
                if (idx !== -1)
                    reverseList.splice(idx, 1);
            }
        }
        for (const edge of this.reverseEdges.get(id) ?? []) {
            const edgeList = this.edges.get(edge.from);
            if (edgeList) {
                const idx = edgeList.findIndex(e => e.to === id);
                if (idx !== -1)
                    edgeList.splice(idx, 1);
            }
        }
        this.nodes.delete(id);
        this.edges.delete(id);
        this.reverseEdges.delete(id);
        this.invalidateCache();
        this.emit('node:removed', { id });
        return true;
    }
    /**
     * Get a task node by ID
     */
    getTask(id) {
        return this.nodes.get(id);
    }
    /**
     * Get all task nodes
     */
    getAllTasks() {
        return Array.from(this.nodes.values());
    }
    /**
     * Update task properties
     */
    updateTask(id, updates) {
        const node = this.nodes.get(id);
        if (!node)
            return false;
        Object.assign(node, updates);
        this.invalidateCache();
        this.emit('node:updated', { node });
        return true;
    }
    // ===== EDGE OPERATIONS =====
    /**
     * Add a dependency edge between two tasks
     * @param from - The blocking task (must complete first)
     * @param to - The dependent task (waits for 'from')
     * @param type - Type of dependency
     */
    addDependency(from, to, type = 'blocks') {
        if (!this.nodes.has(from)) {
            throw new Error(`Source task '${from}' does not exist`);
        }
        if (!this.nodes.has(to)) {
            throw new Error(`Target task '${to}' does not exist`);
        }
        if (from === to) {
            throw new Error('Cannot add self-dependency');
        }
        // Check if edge already exists
        const existingEdges = this.edges.get(from) ?? [];
        if (existingEdges.some(e => e.to === to)) {
            return; // Edge already exists
        }
        const edge = { from, to, type };
        existingEdges.push(edge);
        this.edges.set(from, existingEdges);
        const reverseList = this.reverseEdges.get(to) ?? [];
        reverseList.push(edge);
        this.reverseEdges.set(to, reverseList);
        // Check for cycles after adding the edge
        const cycle = this.detectCycleFromNode(to);
        if (cycle) {
            // Roll back the edge
            existingEdges.pop();
            reverseList.pop();
            throw new Error(`Adding dependency would create a cycle: ${cycle.path.join(' -> ')}`);
        }
        this.invalidateCache();
        this.emit('edge:added', { edge });
    }
    /**
     * Remove a dependency edge
     */
    removeDependency(from, to) {
        const edgeList = this.edges.get(from);
        if (!edgeList)
            return false;
        const idx = edgeList.findIndex(e => e.to === to);
        if (idx === -1)
            return false;
        edgeList.splice(idx, 1);
        const reverseList = this.reverseEdges.get(to);
        if (reverseList) {
            const revIdx = reverseList.findIndex(e => e.from === from);
            if (revIdx !== -1)
                reverseList.splice(revIdx, 1);
        }
        this.invalidateCache();
        this.emit('edge:removed', { from, to });
        return true;
    }
    /**
     * Get all dependencies of a task (tasks that must complete before it)
     */
    getDependencies(taskId) {
        return (this.reverseEdges.get(taskId) ?? []).map(e => e.from);
    }
    /**
     * Get all dependents of a task (tasks that wait for it)
     */
    getDependents(taskId) {
        return (this.edges.get(taskId) ?? []).map(e => e.to);
    }
    // ===== CYCLE DETECTION =====
    /**
     * Detect if the graph contains any cycles
     */
    detectCycle() {
        const visited = new Set();
        const recursionStack = new Set();
        const path = [];
        const dfs = (nodeId) => {
            visited.add(nodeId);
            recursionStack.add(nodeId);
            path.push(nodeId);
            for (const edge of this.edges.get(nodeId) ?? []) {
                if (!visited.has(edge.to)) {
                    const cycle = dfs(edge.to);
                    if (cycle)
                        return cycle;
                }
                else if (recursionStack.has(edge.to)) {
                    // Found a cycle
                    const cycleStart = path.indexOf(edge.to);
                    const cyclePath = [...path.slice(cycleStart), edge.to];
                    return {
                        nodes: [...new Set(cyclePath)],
                        path: cyclePath,
                    };
                }
            }
            path.pop();
            recursionStack.delete(nodeId);
            return null;
        };
        for (const nodeId of this.nodes.keys()) {
            if (!visited.has(nodeId)) {
                const cycle = dfs(nodeId);
                if (cycle)
                    return cycle;
            }
        }
        return null;
    }
    /**
     * Detect cycle starting from a specific node (used after adding edges)
     */
    detectCycleFromNode(startId) {
        const visited = new Set();
        const path = [];
        const dfs = (nodeId) => {
            if (visited.has(nodeId)) {
                if (path.includes(nodeId)) {
                    const cycleStart = path.indexOf(nodeId);
                    const cyclePath = [...path.slice(cycleStart), nodeId];
                    return {
                        nodes: [...new Set(cyclePath)],
                        path: cyclePath,
                    };
                }
                return null;
            }
            visited.add(nodeId);
            path.push(nodeId);
            for (const edge of this.edges.get(nodeId) ?? []) {
                const cycle = dfs(edge.to);
                if (cycle)
                    return cycle;
            }
            path.pop();
            return null;
        };
        return dfs(startId);
    }
    // ===== TOPOLOGICAL SORT =====
    /**
     * Get tasks in execution order (topological sort using Kahn's algorithm)
     */
    getExecutionOrder() {
        if (!this.dirty && this.cachedOrder) {
            return [...this.cachedOrder];
        }
        // Calculate in-degrees
        const inDegree = new Map();
        for (const nodeId of this.nodes.keys()) {
            inDegree.set(nodeId, (this.reverseEdges.get(nodeId) ?? []).length);
        }
        // Start with nodes that have no dependencies
        const queue = [];
        for (const [nodeId, degree] of inDegree) {
            if (degree === 0) {
                queue.push(nodeId);
            }
        }
        // Sort queue by priority (P1 > P2 > P3)
        const priorityOrder = { P1: 0, P2: 1, P3: 2 };
        queue.sort((a, b) => {
            const nodeA = this.nodes.get(a);
            const nodeB = this.nodes.get(b);
            return priorityOrder[nodeA.priority] - priorityOrder[nodeB.priority];
        });
        const result = [];
        while (queue.length > 0) {
            const nodeId = queue.shift();
            result.push(nodeId);
            for (const edge of this.edges.get(nodeId) ?? []) {
                const newDegree = (inDegree.get(edge.to) ?? 1) - 1;
                inDegree.set(edge.to, newDegree);
                if (newDegree === 0) {
                    queue.push(edge.to);
                    // Re-sort by priority
                    queue.sort((a, b) => {
                        const nodeA = this.nodes.get(a);
                        const nodeB = this.nodes.get(b);
                        return priorityOrder[nodeA.priority] - priorityOrder[nodeB.priority];
                    });
                }
            }
        }
        // Check if all nodes were processed (no cycle)
        if (result.length !== this.nodes.size) {
            throw new Error('Graph contains a cycle - topological sort not possible');
        }
        this.cachedOrder = result;
        return [...result];
    }
    // ===== PARALLEL BATCHES =====
    /**
     * Get tasks grouped into parallel execution batches
     * Tasks in the same batch can run concurrently
     */
    getParallelBatches() {
        if (!this.dirty && this.cachedBatches) {
            return this.cachedBatches.map(b => ({ ...b, tasks: [...b.tasks] }));
        }
        const levels = new Map();
        const inDegree = new Map();
        // Initialize
        for (const nodeId of this.nodes.keys()) {
            inDegree.set(nodeId, (this.reverseEdges.get(nodeId) ?? []).length);
            levels.set(nodeId, 0);
        }
        // Calculate level for each node (longest path from any root)
        const processed = new Set();
        const queue = [];
        // Start with root nodes
        for (const [nodeId, degree] of inDegree) {
            if (degree === 0) {
                queue.push(nodeId);
                processed.add(nodeId);
            }
        }
        while (queue.length > 0) {
            const nodeId = queue.shift();
            const currentLevel = levels.get(nodeId) ?? 0;
            for (const edge of this.edges.get(nodeId) ?? []) {
                const childLevel = Math.max(levels.get(edge.to) ?? 0, currentLevel + 1);
                levels.set(edge.to, childLevel);
                const newDegree = (inDegree.get(edge.to) ?? 1) - 1;
                inDegree.set(edge.to, newDegree);
                if (newDegree === 0 && !processed.has(edge.to)) {
                    queue.push(edge.to);
                    processed.add(edge.to);
                }
            }
        }
        // Group tasks by level
        const batchMap = new Map();
        for (const [nodeId, level] of levels) {
            const batch = batchMap.get(level) ?? [];
            batch.push(nodeId);
            batchMap.set(level, batch);
        }
        // Convert to array and calculate durations
        const batches = [];
        const sortedLevels = Array.from(batchMap.keys()).sort((a, b) => a - b);
        for (const level of sortedLevels) {
            const tasks = batchMap.get(level) ?? [];
            // Sort tasks within batch by priority
            const priorityOrder = { P1: 0, P2: 1, P3: 2 };
            tasks.sort((a, b) => {
                const nodeA = this.nodes.get(a);
                const nodeB = this.nodes.get(b);
                return priorityOrder[nodeA.priority] - priorityOrder[nodeB.priority];
            });
            // Duration is max of all task durations in batch (parallel execution)
            const estimatedDuration = Math.max(...tasks.map(t => this.nodes.get(t)?.estimatedDuration ?? 0));
            batches.push({
                level,
                tasks,
                estimatedDuration,
            });
        }
        this.cachedBatches = batches;
        this.dirty = false;
        return batches.map(b => ({ ...b, tasks: [...b.tasks] }));
    }
    /**
     * Get only parallelizable tasks (marked with [P])
     */
    getParallelizableTasks() {
        return Array.from(this.nodes.values()).filter(n => n.parallelizable);
    }
    /**
     * Get tasks that can run immediately (no unmet dependencies)
     */
    getReadyTasks(completedTasks = new Set()) {
        const ready = [];
        for (const node of this.nodes.values()) {
            if (completedTasks.has(node.id))
                continue;
            const dependencies = this.getDependencies(node.id);
            const allDepsComplete = dependencies.every(d => completedTasks.has(d));
            if (allDepsComplete) {
                ready.push(node);
            }
        }
        // Sort by priority
        const priorityOrder = { P1: 0, P2: 1, P3: 2 };
        ready.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        return ready;
    }
    // ===== CRITICAL PATH =====
    /**
     * Find the critical path (longest path through the graph)
     */
    getCriticalPath() {
        const distances = new Map();
        const predecessors = new Map();
        // Initialize
        for (const nodeId of this.nodes.keys()) {
            distances.set(nodeId, 0);
            predecessors.set(nodeId, null);
        }
        // Process nodes in topological order
        const order = this.getExecutionOrder();
        for (const nodeId of order) {
            const node = this.nodes.get(nodeId);
            const currentDist = distances.get(nodeId) ?? 0;
            for (const edge of this.edges.get(nodeId) ?? []) {
                const childNode = this.nodes.get(edge.to);
                const newDist = currentDist + node.estimatedDuration;
                if (newDist > (distances.get(edge.to) ?? 0)) {
                    distances.set(edge.to, newDist);
                    predecessors.set(edge.to, nodeId);
                }
            }
        }
        // Find the node with maximum distance (end of critical path)
        let maxDist = 0;
        let endNode = null;
        for (const [nodeId, dist] of distances) {
            const node = this.nodes.get(nodeId);
            const totalDist = dist + node.estimatedDuration;
            if (totalDist > maxDist) {
                maxDist = totalDist;
                endNode = nodeId;
            }
        }
        // Reconstruct path
        const path = [];
        let current = endNode;
        while (current) {
            path.unshift(current);
            current = predecessors.get(current) ?? null;
        }
        // Identify bottlenecks (tasks on critical path with high duration)
        const avgDuration = this.getAverageDuration();
        const bottlenecks = path.filter(nodeId => {
            const node = this.nodes.get(nodeId);
            return node.estimatedDuration > avgDuration * 1.5;
        });
        return {
            path,
            totalDuration: maxDist,
            bottlenecks,
        };
    }
    /**
     * Get bottleneck tasks (tasks that block the most other tasks)
     */
    getBottlenecks() {
        const bottlenecks = [];
        for (const nodeId of this.nodes.keys()) {
            const blockedCount = this.countAllDependents(nodeId);
            const node = this.nodes.get(nodeId);
            const impact = blockedCount * node.estimatedDuration;
            bottlenecks.push({
                taskId: nodeId,
                blockedCount,
                impact,
            });
        }
        return bottlenecks.sort((a, b) => b.impact - a.impact);
    }
    /**
     * Count all tasks that depend on a given task (transitively)
     */
    countAllDependents(taskId) {
        const visited = new Set();
        const queue = [taskId];
        while (queue.length > 0) {
            const current = queue.shift();
            for (const edge of this.edges.get(current) ?? []) {
                if (!visited.has(edge.to)) {
                    visited.add(edge.to);
                    queue.push(edge.to);
                }
            }
        }
        return visited.size;
    }
    // ===== VISUALIZATION =====
    /**
     * Generate Mermaid diagram syntax for the dependency graph
     */
    toMermaid() {
        const lines = ['graph TD'];
        // Add node definitions
        for (const node of this.nodes.values()) {
            const shape = node.parallelizable ? '([' : '[';
            const closeShape = node.parallelizable ? '])' : ']';
            const label = `${node.name}`;
            const priorityBadge = `<br/>${node.priority}`;
            lines.push(`    ${node.id}${shape}"${label}${priorityBadge}"${closeShape}`);
        }
        lines.push('');
        // Add edges
        for (const [from, edges] of this.edges) {
            for (const edge of edges) {
                const arrowStyle = edge.type === 'soft-depends' ? '-.->' : '-->';
                lines.push(`    ${from} ${arrowStyle} ${edge.to}`);
            }
        }
        // Add styling based on priority
        lines.push('');
        lines.push('    %% Priority-based styling');
        const p1Tasks = Array.from(this.nodes.values())
            .filter(n => n.priority === 'P1')
            .map(n => n.id);
        const p2Tasks = Array.from(this.nodes.values())
            .filter(n => n.priority === 'P2')
            .map(n => n.id);
        const p3Tasks = Array.from(this.nodes.values())
            .filter(n => n.priority === 'P3')
            .map(n => n.id);
        if (p1Tasks.length > 0) {
            lines.push(`    classDef critical fill:#ff6b6b,stroke:#c92a2a`);
            lines.push(`    class ${p1Tasks.join(',')} critical`);
        }
        if (p2Tasks.length > 0) {
            lines.push(`    classDef normal fill:#4dabf7,stroke:#1971c2`);
            lines.push(`    class ${p2Tasks.join(',')} normal`);
        }
        if (p3Tasks.length > 0) {
            lines.push(`    classDef low fill:#69db7c,stroke:#2f9e44`);
            lines.push(`    class ${p3Tasks.join(',')} low`);
        }
        return lines.join('\n');
    }
    // ===== UTILITIES =====
    /**
     * Get graph statistics
     */
    getStats() {
        const batches = this.getParallelBatches();
        const criticalPath = this.getCriticalPath();
        return {
            nodeCount: this.nodes.size,
            edgeCount: Array.from(this.edges.values()).reduce((sum, e) => sum + e.length, 0),
            maxDepth: batches.length,
            parallelizableCount: this.getParallelizableTasks().length,
            criticalPathLength: criticalPath.path.length,
        };
    }
    /**
     * Get average task duration
     */
    getAverageDuration() {
        if (this.nodes.size === 0)
            return 0;
        let total = 0;
        for (const node of this.nodes.values()) {
            total += node.estimatedDuration;
        }
        return total / this.nodes.size;
    }
    /**
     * Invalidate cached computations
     */
    invalidateCache() {
        this.dirty = true;
        this.cachedOrder = null;
        this.cachedBatches = null;
    }
    /**
     * Clear all nodes and edges
     */
    clear() {
        this.nodes.clear();
        this.edges.clear();
        this.reverseEdges.clear();
        this.invalidateCache();
        this.emit('graph:cleared', {});
    }
    /**
     * Clone the graph
     */
    clone() {
        const newGraph = new DependencyGraph();
        for (const node of this.nodes.values()) {
            newGraph.addTask(node.id, node.name, {
                description: node.description,
                priority: node.priority,
                estimatedDuration: node.estimatedDuration,
                tags: [...node.tags],
                parallelizable: node.parallelizable,
                metadata: { ...node.metadata },
            });
        }
        for (const [from, edges] of this.edges) {
            for (const edge of edges) {
                newGraph.addDependency(from, edge.to, edge.type);
            }
        }
        return newGraph;
    }
}
exports.DependencyGraph = DependencyGraph;
exports.default = DependencyGraph;
//# sourceMappingURL=dependency-graph.js.map