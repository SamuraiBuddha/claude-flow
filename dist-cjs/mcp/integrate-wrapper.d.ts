#!/usr/bin/env node
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { ClaudeCodeMCPWrapper } from './claude-code-wrapper.js';
/**
 * Integration script that connects the Claude-Flow MCP wrapper
 * to the Claude Code MCP server
 */
export declare class MCPIntegration {
    private claudeCodeClient?;
    private wrapper;
    constructor();
    connectToClaudeCode(): Promise<void>;
    start(): Promise<void>;
}
export declare function injectClaudeCodeClient(wrapper: ClaudeCodeMCPWrapper, client: Client): void;
//# sourceMappingURL=integrate-wrapper.d.ts.map