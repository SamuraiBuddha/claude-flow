"use strict";
/**
 * Custom error types for Claude-Flow
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShutdownError = exports.InitializationError = exports.SystemError = exports.TaskDependencyError = exports.TaskTimeoutError = exports.TaskError = exports.ValidationError = exports.ConfigError = exports.MCPMethodNotFoundError = exports.MCPTransportError = exports.MCPError = exports.ResourceLockError = exports.DeadlockError = exports.CoordinationError = exports.MemoryConflictError = exports.MemoryBackendError = exports.MemoryError = exports.TerminalCommandError = exports.TerminalSpawnError = exports.TerminalError = exports.ClaudeFlowError = void 0;
exports.isClaudeFlowError = isClaudeFlowError;
exports.formatError = formatError;
exports.getErrorDetails = getErrorDetails;
/**
 * Base error class for all Claude-Flow errors
 */
class ClaudeFlowError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ClaudeFlowError';
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
            stack: this.stack,
        };
    }
}
exports.ClaudeFlowError = ClaudeFlowError;
/**
 * Terminal-related errors
 */
class TerminalError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'TERMINAL_ERROR', details);
        this.name = 'TerminalError';
    }
}
exports.TerminalError = TerminalError;
class TerminalSpawnError extends TerminalError {
    code = 'TERMINAL_SPAWN_ERROR';
    constructor(message, details) {
        super(message, details);
    }
}
exports.TerminalSpawnError = TerminalSpawnError;
class TerminalCommandError extends TerminalError {
    code = 'TERMINAL_COMMAND_ERROR';
    constructor(message, details) {
        super(message, details);
    }
}
exports.TerminalCommandError = TerminalCommandError;
/**
 * Memory-related errors
 */
class MemoryError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'MEMORY_ERROR', details);
        this.name = 'MemoryError';
    }
}
exports.MemoryError = MemoryError;
class MemoryBackendError extends MemoryError {
    code = 'MEMORY_BACKEND_ERROR';
    constructor(message, details) {
        super(message, details);
    }
}
exports.MemoryBackendError = MemoryBackendError;
class MemoryConflictError extends MemoryError {
    code = 'MEMORY_CONFLICT_ERROR';
    constructor(message, details) {
        super(message, details);
    }
}
exports.MemoryConflictError = MemoryConflictError;
/**
 * Coordination-related errors
 */
class CoordinationError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'COORDINATION_ERROR', details);
        this.name = 'CoordinationError';
    }
}
exports.CoordinationError = CoordinationError;
class DeadlockError extends CoordinationError {
    agents;
    resources;
    code = 'DEADLOCK_ERROR';
    constructor(message, agents, resources) {
        super(message, { agents, resources });
        this.agents = agents;
        this.resources = resources;
    }
}
exports.DeadlockError = DeadlockError;
class ResourceLockError extends CoordinationError {
    code = 'RESOURCE_LOCK_ERROR';
    constructor(message, details) {
        super(message, details);
    }
}
exports.ResourceLockError = ResourceLockError;
/**
 * MCP-related errors
 */
class MCPError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'MCP_ERROR', details);
        this.name = 'MCPError';
    }
}
exports.MCPError = MCPError;
class MCPTransportError extends MCPError {
    code = 'MCP_TRANSPORT_ERROR';
    constructor(message, details) {
        super(message, details);
    }
}
exports.MCPTransportError = MCPTransportError;
class MCPMethodNotFoundError extends MCPError {
    code = 'MCP_METHOD_NOT_FOUND';
    constructor(method) {
        super(`Method not found: ${method}`, { method });
    }
}
exports.MCPMethodNotFoundError = MCPMethodNotFoundError;
/**
 * Configuration errors
 */
class ConfigError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'CONFIG_ERROR', details);
        this.name = 'ConfigError';
    }
}
exports.ConfigError = ConfigError;
class ValidationError extends ConfigError {
    code = 'VALIDATION_ERROR';
    constructor(message, details) {
        super(message, details);
    }
}
exports.ValidationError = ValidationError;
/**
 * Task-related errors
 */
class TaskError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'TASK_ERROR', details);
        this.name = 'TaskError';
    }
}
exports.TaskError = TaskError;
class TaskTimeoutError extends TaskError {
    code = 'TASK_TIMEOUT_ERROR';
    constructor(taskId, timeout) {
        super(`Task ${taskId} timed out after ${timeout}ms`, { taskId, timeout });
    }
}
exports.TaskTimeoutError = TaskTimeoutError;
class TaskDependencyError extends TaskError {
    code = 'TASK_DEPENDENCY_ERROR';
    constructor(taskId, dependencies) {
        super(`Task ${taskId} has unmet dependencies`, { taskId, dependencies });
    }
}
exports.TaskDependencyError = TaskDependencyError;
/**
 * System errors
 */
class SystemError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'SYSTEM_ERROR', details);
        this.name = 'SystemError';
    }
}
exports.SystemError = SystemError;
class InitializationError extends SystemError {
    code = 'INITIALIZATION_ERROR';
    constructor(componentOrMessage, details) {
        // If the message already contains the word "initialize", use it as-is
        const message = componentOrMessage.includes('initialize')
            ? componentOrMessage
            : `Failed to initialize ${componentOrMessage}`;
        super(message, details ? { component: componentOrMessage, ...details } : { component: componentOrMessage });
    }
}
exports.InitializationError = InitializationError;
class ShutdownError extends SystemError {
    code = 'SHUTDOWN_ERROR';
    constructor(message, details) {
        super(message, details);
    }
}
exports.ShutdownError = ShutdownError;
/**
 * Error utilities
 */
function isClaudeFlowError(error) {
    return error instanceof ClaudeFlowError;
}
function formatError(error) {
    if (error instanceof Error) {
        return `${error.name}: ${error.message}`;
    }
    return String(error);
}
function getErrorDetails(error) {
    if (isClaudeFlowError(error)) {
        return error.details;
    }
    return undefined;
}
//# sourceMappingURL=errors.js.map