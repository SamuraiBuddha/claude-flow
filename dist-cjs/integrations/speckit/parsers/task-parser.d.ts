/**
 * Task Parser
 *
 * Parses tasks.md files into structured TaskList objects with dependencies.
 * Handles the spec-kit template format with phases, user stories, and parallel markers.
 */
import { TaskList, Task, ParseResult } from '../types.js';
/**
 * Parser for tasks.md task list files
 */
export declare class TaskParser {
    private errors;
    private warnings;
    private taskIdMap;
    /**
     * Parse a tasks.md file content into a TaskList
     */
    parse(content: string, filePath: string): ParseResult<TaskList>;
    /**
     * Reset parser state
     */
    private reset;
    /**
     * Parse header metadata from tasks file
     */
    private parseHeader;
    /**
     * Parse task phases from sections
     */
    private parsePhases;
    /**
     * Parse a single phase section
     */
    private parsePhase;
    /**
     * Create a default phase from all tasks in document
     */
    private createDefaultPhase;
    /**
     * Parse tasks from markdown content
     */
    private parseTasksFromContent;
    /**
     * Parse a single task line
     * Format: "- [ ] T001 [P] [US1] Description in src/path/file.ts"
     */
    private parseTaskLine;
    /**
     * Infer task type from description and file path
     */
    private inferTaskType;
    /**
     * Build dependency graph from tasks
     */
    private buildDependencyGraph;
    /**
     * Parse dependency section content
     */
    private parseDependencySection;
    /**
     * Infer dependencies based on phase structure
     */
    private inferPhaseDependencies;
    /**
     * Parse execution strategy from sections
     */
    private parseExecutionStrategy;
    /**
     * Determine MVP scope based on tasks and phases
     */
    private determineMvpScope;
    /**
     * Parse markdown into sections
     */
    private parseMarkdownSections;
    /**
     * Find a section by title pattern
     */
    private findSection;
    /**
     * Find all sections matching a pattern
     */
    private findAllSections;
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Generate content hash
     */
    private generateHash;
    /**
     * Validate the parsed task list
     */
    private validateTaskList;
    /**
     * Get tasks in topological order (respecting dependencies)
     */
    getTopologicalOrder(taskList: TaskList): Task[];
    /**
     * Get tasks that can be executed in parallel
     */
    getParallelGroups(taskList: TaskList): Task[][];
}
/**
 * Convenience function to parse a tasks file
 */
export declare function parseTasks(content: string, filePath: string): ParseResult<TaskList>;
export default TaskParser;
//# sourceMappingURL=task-parser.d.ts.map