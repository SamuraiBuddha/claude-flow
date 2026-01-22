/**
 * Claude Flow v2.0.0 System Integration
 * Comprehensive integration manager for all system components
 */
import type { IntegrationConfig, SystemHealth } from './types.js';
export declare class SystemIntegration {
    private static instance;
    private eventBus;
    private logger;
    private orchestrator;
    private configManager;
    private memoryManager;
    private agentManager;
    private swarmCoordinator;
    private taskEngine;
    private monitor;
    private mcpServer;
    private initialized;
    private componentStatuses;
    private constructor();
    static getInstance(): SystemIntegration;
    /**
     * Initialize all system components in proper order
     */
    initialize(config?: IntegrationConfig): Promise<void>;
    /**
     * Initialize core infrastructure components
     */
    private initializeCore;
    /**
     * Initialize memory and configuration management
     */
    private initializeMemoryAndConfig;
    /**
     * Initialize agents and coordination systems
     */
    private initializeAgentsAndCoordination;
    /**
     * Initialize task management system
     */
    private initializeTaskManagement;
    /**
     * Initialize monitoring and MCP systems
     */
    private initializeMonitoringAndMcp;
    /**
     * Wire all components together for proper communication
     */
    private wireComponents;
    /**
     * Setup event handlers for cross-component communication
     */
    private setupEventHandlers;
    /**
     * Update component status
     */
    private updateComponentStatus;
    /**
     * Get system health status
     */
    getSystemHealth(): Promise<SystemHealth>;
    /**
     * Get specific component
     */
    getComponent<T>(name: string): T | null;
    /**
     * Shutdown all components gracefully
     */
    shutdown(): Promise<void>;
    /**
     * Check if system is ready
     */
    isReady(): boolean;
    /**
     * Get initialization status
     */
    getInitializationStatus(): {
        initialized: boolean;
        components: string[];
        health: SystemHealth | null;
    };
}
export declare const systemIntegration: SystemIntegration;
//# sourceMappingURL=system-integration.d.ts.map