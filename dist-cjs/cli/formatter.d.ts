/**
 * Output formatting utilities for CLI
 */
import type { AgentProfile, Task, MemoryEntry, HealthStatus } from '../utils/types.js';
/**
 * Formats an error for display
 */
export declare function formatError(error: unknown): string;
/**
 * Formats an agent profile for display
 */
export declare function formatAgent(agent: AgentProfile): string;
/**
 * Formats a task for display
 */
export declare function formatTask(task: Task): string;
/**
 * Formats a memory entry for display
 */
export declare function formatMemoryEntry(entry: MemoryEntry): string;
/**
 * Formats health status for display
 */
export declare function formatHealthStatus(health: HealthStatus): string;
/**
 * Creates a table for agent listing
 */
export declare function createAgentTable(agents: AgentProfile[]): any;
/**
 * Creates a table for task listing
 */
export declare function createTaskTable(tasks: Task[]): any;
/**
 * Formats duration in human-readable form
 */
export declare function formatDuration(ms: number): string;
/**
 * Displays the Claude-Flow banner
 */
export declare function displayBanner(version: string): void;
/**
 * Displays detailed version information
 */
export declare function displayVersion(version: string, buildDate: string): void;
/**
 * Formats a progress bar
 */
export declare function formatProgressBar(current: number, total: number, width?: number, label?: string): string;
/**
 * Creates a status indicator
 */
export declare function formatStatusIndicator(status: string): string;
/**
 * Formats a success message
 */
export declare function formatSuccess(message: string): string;
/**
 * Formats an info message
 */
export declare function formatInfo(message: string): string;
/**
 * Formats a warning message
 */
export declare function formatWarning(message: string): string;
/**
 * Formats a spinner with message
 */
export declare function formatSpinner(message: string, frame?: number): string;
//# sourceMappingURL=formatter.d.ts.map