#!/usr/bin/env node
/**
 * Simple MCP server starter for Windows
 * Bypasses the ESM main module check
 */

import('./mcp-server.js').then(module => {
  // The mcp-server.js exports the class but also runs startMCPServer() when main
  // Force start the server by creating instance and handling stdio
  const { ClaudeFlowMCPServer } = module;

  const server = new ClaudeFlowMCPServer();

  console.error(
    `[${new Date().toISOString()}] INFO [claude-flow-mcp] (${server.sessionId}) Claude-Flow MCP server starting in stdio mode (Windows wrapper)`,
  );

  // Send server capabilities
  console.log(
    JSON.stringify({
      jsonrpc: '2.0',
      method: 'server.initialized',
      params: {
        serverInfo: {
          name: 'claude-flow',
          version: server.version,
          capabilities: server.capabilities,
        },
      },
    }),
  );

  // Handle stdin messages
  let buffer = '';

  process.stdin.on('data', async (chunk) => {
    buffer += chunk.toString();

    // Process complete JSON messages
    let lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          const message = JSON.parse(line);
          const response = await server.handleMessage(message);
          if (response) {
            console.log(JSON.stringify(response));
          }
        } catch (error) {
          console.error(
            `[${new Date().toISOString()}] ERROR [claude-flow-mcp] Failed to parse message:`,
            error.message,
          );
        }
      }
    }
  });

  process.stdin.on('end', () => {
    console.error(
      `[${new Date().toISOString()}] INFO [claude-flow-mcp] MCP: stdin closed, shutting down...`,
    );
    process.exit(0);
  });

  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}).catch(console.error);
