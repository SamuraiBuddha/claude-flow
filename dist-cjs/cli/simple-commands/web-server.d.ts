/**
 * Start web server command
 */
export function startWebServer(port?: number): Promise<ClaudeCodeWebServer>;
export class ClaudeCodeWebServer {
    constructor(port?: number);
    port: number;
    server: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | null;
    wss: import("ws").Server<typeof import("ws"), typeof import("http").IncomingMessage> | null;
    connections: Set<any>;
    uiPath: string;
    isRunning: boolean;
    createAPIRoutes(): Promise<import("express-serve-static-core").Router>;
    /**
     * Start the web server
     */
    start(): Promise<void>;
    /**
     * Stop the web server
     */
    stop(): Promise<void>;
    /**
     * Handle HTTP requests
     */
    handleRequest(req: any, res: any): void;
    /**
     * Serve the console HTML with corrected paths
     */
    serveConsoleHTML(res: any): void;
    /**
     * Serve a specific file from the UI directory
     */
    serveFile(res: any, filename: any, contentType: any): void;
    /**
     * Serve static files (CSS, JS, etc.)
     */
    serveStaticFile(res: any, requestPath: any): void;
    /**
     * Get content type based on file extension
     */
    getContentType(filePath: any): any;
    /**
     * Handle health check endpoint
     */
    handleHealthCheck(res: any): void;
    /**
     * Handle status API endpoint
     */
    handleStatusAPI(res: any): void;
    /**
     * Handle favicon request
     */
    handleFavicon(res: any): void;
    /**
     * Handle 403 Forbidden
     */
    handle403(res: any): void;
    /**
     * Handle 404 Not Found
     */
    handle404(res: any): void;
    /**
     * Handle 500 Internal Server Error
     */
    handle500(res: any, error: any): void;
    /**
     * Setup WebSocket server
     */
    setupWebSocketServer(): void;
    /**
     * Handle new WebSocket connection
     */
    handleWebSocketConnection(ws: any, req: any): void;
    /**
     * Handle incoming WebSocket messages
     */
    handleWebSocketMessage(ws: any, data: any): void;
    /**
     * Handle initialize request
     */
    handleInitialize(ws: any, message: any): void;
    /**
     * Handle ping request
     */
    handlePing(ws: any, message: any): void;
    /**
     * Handle tool call request
     */
    handleToolCall(ws: any, message: any, ...args: any[]): void;
    /**
     * Handle tools list request
     */
    handleToolsList(ws: any, message: any): void;
    /**
     * Handle unknown method
     */
    handleUnknownMethod(ws: any, message: any): void;
    /**
     * Execute mock tool for demonstration
     */
    executeMockTool(name: any, args: any): string;
    /**
     * Execute Claude Flow command simulation
     */
    executeClaudeFlowCommand(command: any, args?: {}): string;
    /**
     * Execute swarm command simulation
     */
    executeSwarmCommand(action?: string, args?: any[]): string;
    /**
     * Execute memory command simulation
     */
    executeMemoryCommand(operation: any, key: any, value: any): string;
    /**
     * Execute agents command simulation
     */
    executeAgentsCommand(action: any, agentType: any, agentId: any): string;
    /**
     * Execute SPARC command simulation
     */
    executeSPARCCommand(mode: any, task: any, options?: {}): string;
    /**
     * Execute benchmark command simulation
     */
    executeBenchmarkCommand(suite?: string, iterations?: number): string;
    /**
     * Send message to WebSocket client
     */
    sendMessage(ws: any, message: any): void;
    /**
     * Send error response
     */
    sendError(ws: any, id: any, errorMessage: any): void;
    /**
     * Broadcast message to all connected clients
     */
    broadcast(message: any): void;
    /**
     * Start heartbeat to check connection health
     */
    startHeartbeat(): void;
    /**
     * Get server status
     */
    getStatus(): {
        running: boolean;
        port: number;
        connections: number;
        uiPath: string;
    };
}
//# sourceMappingURL=web-server.d.ts.map