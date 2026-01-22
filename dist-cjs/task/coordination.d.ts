/**
 * Task Coordination Layer - Integrates with TodoWrite/TodoRead and Memory for orchestration
 * Provides seamless coordination between task management and Claude Code batch tools
 */
import { EventEmitter } from 'events';
import type { TaskEngine } from './engine.js';
import type { TodoItem, MemoryEntry, CoordinationContext } from './types.js';
export declare class TaskCoordinator extends EventEmitter {
    private taskEngine;
    private memoryManager?;
    private todoItems;
    private memoryStore;
    private coordinationSessions;
    private batchOperations;
    private agentCoordination;
    constructor(taskEngine: TaskEngine, memoryManager?: any | undefined);
    private setupCoordinationHandlers;
    /**
     * Create TodoWrite-style task breakdown for complex operations
     */
    createTaskTodos(objective: string, context: CoordinationContext, options?: {
        strategy?: 'research' | 'development' | 'analysis' | 'testing' | 'optimization' | 'maintenance';
        maxTasks?: number;
        batchOptimized?: boolean;
        parallelExecution?: boolean;
        memoryCoordination?: boolean;
    }): Promise<TodoItem[]>;
    /**
     * Update TodoRead-style progress tracking
     */
    updateTodoProgress(todoId: string, status: 'pending' | 'in_progress' | 'completed', metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Read all todos for coordination (TodoRead equivalent)
     */
    readTodos(sessionId?: string, filter?: {
        status?: TodoItem['status'][];
        priority?: TodoItem['priority'][];
        assignedAgent?: string;
        tags?: string[];
        batchOptimized?: boolean;
    }): Promise<TodoItem[]>;
    /**
     * Store data in Memory for cross-agent coordination
     */
    storeInMemory(key: string, value: any, options?: {
        namespace?: string;
        tags?: string[];
        expiresAt?: Date;
    }): Promise<void>;
    /**
     * Retrieve data from Memory for coordination
     */
    retrieveFromMemory(key: string, namespace?: string): Promise<any | null>;
    /**
     * Query Memory with filters for coordination
     */
    queryMemory(query: {
        namespace?: string;
        tags?: string[];
        keyPattern?: string;
        since?: Date;
        limit?: number;
    }): Promise<MemoryEntry[]>;
    /**
     * Launch parallel agents using Task tool pattern
     */
    launchParallelAgents(tasks: Array<{
        agentType: string;
        objective: string;
        mode?: string;
        configuration?: Record<string, unknown>;
        memoryKey?: string;
        batchOptimized?: boolean;
    }>, coordinationContext: CoordinationContext): Promise<string[]>;
    /**
     * Coordinate batch operations for maximum efficiency
     */
    coordinateBatchOperations(operations: Array<{
        type: 'read' | 'write' | 'edit' | 'search' | 'analyze';
        targets: string[];
        configuration?: Record<string, unknown>;
    }>, context: CoordinationContext): Promise<Map<string, any>>;
    /**
     * Swarm coordination patterns based on mode
     */
    coordinateSwarm(objective: string, context: CoordinationContext, agents: Array<{
        type: string;
        role: string;
        capabilities: string[];
    }>): Promise<void>;
    private generateTaskBreakdown;
    private createTaskFromTodo;
    private priorityToNumber;
    private launchAgent;
    private executeBatchOperationType;
    private simulateBatchOperation;
    private coordinateCentralizedSwarm;
    private coordinateDistributedSwarm;
    private coordinateHierarchicalSwarm;
    private coordinateMeshSwarm;
    private coordinateHybridSwarm;
    private getSessionTodos;
    private handleTaskCreated;
    private handleTaskStarted;
    private handleTaskCompleted;
    private handleTaskFailed;
    private handleTaskCancelled;
}
//# sourceMappingURL=coordination.d.ts.map