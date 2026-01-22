/**
 * Agent Capabilities System - Defines and manages agent skills and selection algorithms
 */
import type { AgentType, AgentCapabilities, TaskDefinition } from '../../swarm/types.js';
import type { AgentState } from './base-agent.js';
export interface CapabilityMatch {
    agent: AgentState;
    score: number;
    matchedCapabilities: string[];
    missingCapabilities: string[];
    confidence: number;
    reason: string;
}
export interface TaskRequirements {
    type: string;
    requiredCapabilities: string[];
    preferredCapabilities: string[];
    languages?: string[];
    frameworks?: string[];
    domains?: string[];
    tools?: string[];
    complexity: 'low' | 'medium' | 'high' | 'critical';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    estimatedDuration: number;
    dependencies: string[];
}
export interface CapabilityRegistry {
    [capability: string]: {
        description: string;
        category: 'technical' | 'domain' | 'soft' | 'system';
        prerequisites: string[];
        relatedCapabilities: string[];
        complexity: number;
        importance: number;
    };
}
/**
 * Agent Capability System
 */
export declare class AgentCapabilitySystem {
    private capabilityRegistry;
    private agentCapabilities;
    private taskTypeRequirements;
    constructor();
    /**
     * Get agent capabilities by agent ID
     */
    getAgentCapabilities(agentId: string): AgentCapabilities | undefined;
    /**
     * Register agent capabilities
     */
    registerAgentCapabilities(agentId: string, capabilities: AgentCapabilities): void;
    /**
     * Find best matching agents for a task
     */
    findBestAgents(task: TaskDefinition, availableAgents: AgentState[], maxResults?: number): CapabilityMatch[];
    /**
     * Get capability requirements for a task type
     */
    getTaskRequirements(task: TaskDefinition): TaskRequirements;
    /**
     * Evaluate how well an agent matches task requirements
     */
    private evaluateAgentMatch;
    /**
     * Check if agent has a specific capability
     */
    private agentHasCapability;
    /**
     * Check for semantic capability matches
     */
    private checkSemanticCapabilityMatch;
    /**
     * Evaluate complexity matching
     */
    private evaluateComplexityMatch;
    /**
     * Calculate agent's complexity handling level
     */
    private calculateAgentComplexityLevel;
    /**
     * Calculate confidence in the match
     */
    private calculateConfidence;
    /**
     * Generate human-readable match reason
     */
    private generateMatchReason;
    /**
     * Infer task requirements from task description and parameters
     */
    private inferTaskRequirements;
    /**
     * Initialize capability registry
     */
    private initializeCapabilityRegistry;
    /**
     * Initialize task type requirements
     */
    private initializeTaskRequirements;
    /**
     * Get agent type capabilities
     */
    static getAgentTypeCapabilities(agentType: AgentType): AgentCapabilities;
}
//# sourceMappingURL=capabilities.d.ts.map