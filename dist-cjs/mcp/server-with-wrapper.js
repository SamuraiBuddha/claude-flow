#!/usr/bin/env node
"use strict";
/**
 * MCP Server entry point that uses the wrapper by default
 */
Object.defineProperty(exports, "__esModule", { value: true });
const claude_code_wrapper_js_1 = require("./claude-code-wrapper.js");
const server_js_1 = require("./server.js");
const event_bus_js_1 = require("../core/event-bus.js");
const logger_js_1 = require("../core/logger.js");
// Check if we should use the legacy server
const useLegacy = process.env.CLAUDE_FLOW_LEGACY_MCP === 'true' || process.argv.includes('--legacy');
async function main() {
    if (useLegacy) {
        console.error('Starting Claude-Flow MCP in legacy mode...');
        // Create required dependencies for MCPServer
        const logger = new logger_js_1.Logger({ level: 'info', format: 'text', destination: 'console' });
        const eventBus = event_bus_js_1.EventBus.getInstance();
        const mcpServer = new server_js_1.MCPServer({ transport: 'stdio' }, eventBus, logger);
        await mcpServer.start();
    }
    else {
        console.error('Starting Claude-Flow MCP with Claude Code wrapper...');
        const wrapper = new claude_code_wrapper_js_1.ClaudeCodeMCPWrapper();
        await wrapper.run();
    }
}
// Run the server
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=server-with-wrapper.js.map