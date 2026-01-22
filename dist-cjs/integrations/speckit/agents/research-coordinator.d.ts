/**
 * Research Coordinator Agent
 *
 * Extracts [NEEDS CLARIFICATION] items from specifications, spawns research
 * tasks to gather information, and consolidates findings into research.md
 * documentation.
 *
 * @module ResearchCoordinatorAgent
 */
import { BaseAgent } from '../../../cli/agents/base-agent.js';
import type { AgentCapabilities, AgentConfig, AgentEnvironment, TaskDefinition } from '../../../swarm/types.js';
import type { ILogger } from '../../../core/logger.js';
import type { IEventBus } from '../../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../../memory/distributed-memory.js';
/**
 * Unknown item that needs research
 */
export interface UnknownItem {
    id: string;
    source: string;
    sourceLocation: string;
    question: string;
    context: string;
    priority: 'high' | 'medium' | 'low';
    category: 'technical' | 'business' | 'domain' | 'process' | 'other';
    extractedAt: Date;
    status: 'pending' | 'researching' | 'completed' | 'unresolved';
}
/**
 * Research task spawned for an unknown item
 */
export interface ResearchTask {
    id: string;
    unknownItemId: string;
    question: string;
    searchTerms: string[];
    sources: string[];
    assignedAgent?: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    createdAt: Date;
    completedAt?: Date;
    findings?: ResearchFinding[];
}
/**
 * Finding from research
 */
export interface ResearchFinding {
    source: string;
    sourceType: 'documentation' | 'web' | 'expert' | 'codebase' | 'internal';
    content: string;
    confidence: number;
    relevance: number;
    timestamp: Date;
    metadata: Record<string, any>;
}
/**
 * Consolidated research result
 */
export interface ResearchResult {
    unknownItemId: string;
    question: string;
    answer: string;
    confidence: number;
    findings: ResearchFinding[];
    sources: string[];
    recommendations: string[];
    unresolved: boolean;
    researchedAt: Date;
}
/**
 * Research document structure
 */
export interface ResearchDocument {
    title: string;
    generatedAt: Date;
    summary: string;
    items: ResearchResult[];
    statistics: {
        total: number;
        resolved: number;
        unresolved: number;
        byCategory: Record<string, number>;
        averageConfidence: number;
    };
}
/**
 * Research Coordinator Agent - Manages research tasks and consolidation
 */
export declare class ResearchCoordinatorAgent extends BaseAgent {
    private unknownItems;
    private researchTasks;
    private results;
    constructor(id: string, config: AgentConfig, environment: AgentEnvironment, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem);
    /**
     * Get default capabilities for research coordination
     */
    protected getDefaultCapabilities(): AgentCapabilities;
    /**
     * Get default configuration for the agent
     */
    protected getDefaultConfig(): Partial<AgentConfig>;
    /**
     * Execute a research coordination task
     */
    executeTask(task: TaskDefinition): Promise<any>;
    /**
     * Extract unknown items from specification content
     */
    private extractUnknowns;
    /**
     * Spawn research tasks for unknown items
     */
    private spawnResearch;
    /**
     * Consolidate findings from research tasks
     */
    private consolidateFindings;
    /**
     * Generate research documentation
     */
    private generateDocument;
    /**
     * Track research progress
     */
    private trackResearch;
    /**
     * Perform general research coordination
     */
    private performGeneralCoordination;
    /**
     * Extract question from line and context
     */
    private extractQuestion;
    /**
     * Determine priority of unknown item
     */
    private determinePriority;
    /**
     * Categorize unknown item
     */
    private categorizeUnknown;
    /**
     * Group items by category
     */
    private groupByCategory;
    /**
     * Generate search terms for research
     */
    private generateSearchTerms;
    /**
     * Determine sources to search
     */
    private determineSources;
    /**
     * Synthesize answer from findings
     */
    private synthesizeAnswer;
    /**
     * Generate recommendations from research
     */
    private generateRecommendations;
    /**
     * Generate summary for document
     */
    private generateSummary;
    /**
     * Generate markdown document
     */
    private generateMarkdown;
    /**
     * Setup research-specific events
     */
    private setupResearchEvents;
    /**
     * Get agent status with research-specific information
     */
    getAgentStatus(): any;
}
/**
 * Factory function to create a Research Coordinator Agent
 */
export declare const createResearchCoordinatorAgent: (id: string, config: Partial<AgentConfig>, environment: Partial<AgentEnvironment>, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem) => ResearchCoordinatorAgent;
//# sourceMappingURL=research-coordinator.d.ts.map