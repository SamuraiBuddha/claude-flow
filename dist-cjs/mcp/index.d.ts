/**
 * MCP (Model Context Protocol) Module
 * Export all MCP components for easy integration
 */
import { MCPServer as MCPServerImpl } from './server.js';
import { MCPLifecycleManager as MCPLifecycleManagerImpl } from './lifecycle-manager.js';
import { MCPPerformanceMonitor as MCPPerformanceMonitorImpl } from './performance-monitor.js';
import { MCPProtocolManager as MCPProtocolManagerImpl } from './protocol-manager.js';
import { MCPOrchestrationIntegration as MCPOrchestrationIntegrationImpl, type OrchestrationComponents as OrchestrationComponentsType, type MCPOrchestrationConfig as MCPOrchestrationConfigType } from './orchestration-integration.js';
export { MCPServer, type IMCPServer } from './server.js';
export { MCPLifecycleManager, LifecycleState, type LifecycleEvent, type HealthCheckResult, type LifecycleManagerConfig, } from './lifecycle-manager.js';
export { ToolRegistry, type ToolCapability, type ToolMetrics, type ToolDiscoveryQuery, } from './tools.js';
export { MCPProtocolManager, type ProtocolVersionInfo, type CompatibilityResult, type NegotiationResult, } from './protocol-manager.js';
export { AuthManager, type IAuthManager, type AuthResult, Permissions, } from './auth.js';
export { MCPPerformanceMonitor, type PerformanceMetrics, type RequestMetrics, type AlertRule, type Alert, type OptimizationSuggestion, } from './performance-monitor.js';
export { MCPOrchestrationIntegration, type OrchestrationComponents, type MCPOrchestrationConfig, type IntegrationStatus, } from './orchestration-integration.js';
export { type ITransport } from './transports/base.js';
export { StdioTransport } from './transports/stdio.js';
export { HttpTransport } from './transports/http.js';
export { RequestRouter } from './router.js';
export { SessionManager, type ISessionManager } from './session-manager.js';
export { LoadBalancer, type ILoadBalancer, RequestQueue } from './load-balancer.js';
export { createClaudeFlowTools, type ClaudeFlowToolContext } from './claude-flow-tools.js';
export { createSwarmTools, type SwarmToolContext } from './swarm-tools.js';
/**
 * MCP Integration Factory
 * Provides a simple way to create a complete MCP integration
 */
export declare class MCPIntegrationFactory {
    /**
     * Create a complete MCP integration with all components
     */
    static createIntegration(config: {
        mcpConfig: import('../utils/types.js').MCPConfig;
        orchestrationConfig?: Partial<MCPOrchestrationConfigType>;
        components?: Partial<OrchestrationComponentsType>;
        logger: import('../core/logger.js').ILogger;
    }): Promise<MCPOrchestrationIntegrationImpl>;
    /**
     * Create a standalone MCP server (without orchestration integration)
     */
    static createStandaloneServer(config: {
        mcpConfig: import('../utils/types.js').MCPConfig;
        logger: import('../core/logger.js').ILogger;
        enableLifecycleManagement?: boolean;
        enablePerformanceMonitoring?: boolean;
    }): Promise<{
        server: MCPServerImpl;
        lifecycleManager?: MCPLifecycleManagerImpl;
        performanceMonitor?: MCPPerformanceMonitorImpl;
    }>;
    /**
     * Create a development/testing MCP setup
     */
    static createDevelopmentSetup(logger: import('../core/logger.js').ILogger): Promise<{
        server: MCPServerImpl;
        lifecycleManager: MCPLifecycleManagerImpl;
        performanceMonitor: MCPPerformanceMonitorImpl;
        protocolManager: MCPProtocolManagerImpl;
    }>;
}
/**
 * Default MCP configuration for common use cases
 */
export declare const DefaultMCPConfigs: {
    /**
     * Development configuration with stdio transport
     */
    readonly development: {
        readonly transport: "stdio";
        readonly enableMetrics: true;
        readonly auth: {
            readonly enabled: false;
            readonly method: "token";
        };
    };
    /**
     * Production configuration with HTTP transport and authentication
     */
    readonly production: {
        readonly transport: "http";
        readonly host: "0.0.0.0";
        readonly port: 3000;
        readonly tlsEnabled: true;
        readonly enableMetrics: true;
        readonly auth: {
            readonly enabled: true;
            readonly method: "token";
        };
        readonly loadBalancer: {
            readonly enabled: true;
            readonly maxRequestsPerSecond: 100;
            readonly maxConcurrentRequests: 50;
        };
        readonly sessionTimeout: 3600000;
        readonly maxSessions: 1000;
    };
    /**
     * Testing configuration with minimal features
     */
    readonly testing: {
        readonly transport: "stdio";
        readonly enableMetrics: false;
        readonly auth: {
            readonly enabled: false;
            readonly method: "token";
        };
    };
};
/**
 * MCP Utility Functions
 */
export declare const MCPUtils: {
    /**
     * Validate MCP protocol version
     */
    isValidProtocolVersion(version: import("../utils/types.js").MCPProtocolVersion): boolean;
    /**
     * Compare two protocol versions
     */
    compareVersions(a: import("../utils/types.js").MCPProtocolVersion, b: import("../utils/types.js").MCPProtocolVersion): number;
    /**
     * Format protocol version as string
     */
    formatVersion(version: import("../utils/types.js").MCPProtocolVersion): string;
    /**
     * Parse protocol version from string
     */
    parseVersion(versionString: string): import("../utils/types.js").MCPProtocolVersion;
    /**
     * Generate a random session ID
     */
    generateSessionId(): string;
    /**
     * Generate a random request ID
     */
    generateRequestId(): string;
};
//# sourceMappingURL=index.d.ts.map