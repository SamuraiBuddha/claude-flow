#!/usr/bin/env node
"use strict";
/**
 * Claude-Flow MCP Server - Wrapper Mode
 *
 * This version uses the Claude Code MCP wrapper approach instead of templates.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const claude_code_wrapper_js_1 = require("./claude-code-wrapper.js");
const server_js_1 = require("./server.js");
const event_bus_js_1 = require("../core/event-bus.js");
const logger_js_1 = require("../core/logger.js");
// Check if running as wrapper mode
const isWrapperMode = process.env.CLAUDE_FLOW_WRAPPER_MODE === 'true' || process.argv.includes('--wrapper');
async function main() {
    if (isWrapperMode) {
        console.error('Starting Claude-Flow MCP in wrapper mode...');
        const wrapper = new claude_code_wrapper_js_1.ClaudeCodeMCPWrapper();
        await wrapper.run();
    }
    else {
        // Fall back to original server
        console.error('Starting Claude-Flow MCP in direct mode...');
        // Create required dependencies for MCPServer
        const logger = new logger_js_1.Logger({ level: 'info', format: 'text', destination: 'console' });
        const eventBus = event_bus_js_1.EventBus.getInstance();
        const mcpServer = new server_js_1.MCPServer({ transport: 'stdio' }, eventBus, logger);
        await mcpServer.start();
    }
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=server-wrapper-mode.js.map