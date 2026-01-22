/**
 * Clarification Expert Agent
 *
 * Performs structured specification refinement (/speckit.clarify).
 * Generates coverage-based questions, records answers, and validates
 * completeness of specifications.
 *
 * @module ClarificationExpertAgent
 */
import { BaseAgent } from '../../../cli/agents/base-agent.js';
import type { AgentCapabilities, AgentConfig, AgentEnvironment, TaskDefinition } from '../../../swarm/types.js';
import type { ILogger } from '../../../core/logger.js';
import type { IEventBus } from '../../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../../memory/distributed-memory.js';
/**
 * Categories for clarification questions
 */
export type QuestionCategory = 'functional' | 'non-functional' | 'technical' | 'business' | 'user-experience' | 'integration' | 'security' | 'scalability' | 'edge-case';
/**
 * Clarification question
 */
export interface ClarificationQuestion {
    id: string;
    specId: string;
    section: string;
    question: string;
    category: QuestionCategory;
    priority: 'critical' | 'high' | 'medium' | 'low';
    context: string;
    relatedQuestions: string[];
    status: 'pending' | 'answered' | 'deferred' | 'not-applicable';
    answer?: ClarificationAnswer;
    createdAt: Date;
}
/**
 * Answer to a clarification question
 */
export interface ClarificationAnswer {
    questionId: string;
    answer: string;
    answeredBy: string;
    answeredAt: Date;
    confidence: number;
    source: 'stakeholder' | 'document' | 'assumption' | 'expert';
    notes?: string;
    attachments?: string[];
    requiresFollowUp: boolean;
}
/**
 * Specification coverage analysis
 */
export interface CoverageAnalysis {
    specId: string;
    totalSections: number;
    coveredSections: number;
    gapSections: string[];
    coveragePercentage: number;
    byCategory: Record<QuestionCategory, {
        total: number;
        answered: number;
        coverage: number;
    }>;
    recommendations: string[];
}
/**
 * Clarification session state
 */
export interface ClarificationSession {
    id: string;
    specId: string;
    startedAt: Date;
    completedAt?: Date;
    status: 'active' | 'completed' | 'paused';
    questionsAsked: number;
    questionsAnswered: number;
    participant?: string;
    coverageProgress: number;
}
/**
 * Completeness validation result
 */
export interface CompletenessResult {
    specId: string;
    complete: boolean;
    score: number;
    gaps: CompletenessGap[];
    recommendations: string[];
    readyForImplementation: boolean;
}
/**
 * Gap in specification completeness
 */
export interface CompletenessGap {
    section: string;
    category: QuestionCategory;
    description: string;
    severity: 'critical' | 'major' | 'minor';
    suggestedQuestions: string[];
}
/**
 * Clarification Expert Agent - Structured specification refinement
 */
export declare class ClarificationExpertAgent extends BaseAgent {
    private questions;
    private sessions;
    private questionTemplates;
    constructor(id: string, config: AgentConfig, environment: AgentEnvironment, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem);
    /**
     * Get default capabilities for clarification expertise
     */
    protected getDefaultCapabilities(): AgentCapabilities;
    /**
     * Get default configuration for the agent
     */
    protected getDefaultConfig(): Partial<AgentConfig>;
    /**
     * Execute a clarification task
     */
    executeTask(task: TaskDefinition): Promise<any>;
    /**
     * Generate clarification questions based on specification
     */
    private generateQuestions;
    /**
     * Record answers to clarification questions
     */
    private recordAnswers;
    /**
     * Validate specification completeness
     */
    private validateCompleteness;
    /**
     * Analyze coverage of clarifications
     */
    private analyzeCoverage;
    /**
     * Manage clarification session
     */
    private manageSession;
    /**
     * Perform general clarification
     */
    private performGeneralClarification;
    /**
     * Analyze specification sections
     */
    private analyzeSpecificationSections;
    /**
     * Infer section type from name
     */
    private inferSectionType;
    /**
     * Generate questions for a section
     */
    private generateSectionQuestions;
    /**
     * Generate contextual questions based on content
     */
    private generateContextualQuestions;
    /**
     * Determine question priority
     */
    private determineQuestionPriority;
    /**
     * Link related questions
     */
    private linkRelatedQuestions;
    /**
     * Determine if follow-up is needed
     */
    private determineFollowUpNeeded;
    /**
     * Group questions by category
     */
    private groupByCategory;
    /**
     * Group questions by priority
     */
    private groupByPriority;
    /**
     * Priority sort order
     */
    private priorityOrder;
    /**
     * Identify category gaps
     */
    private identifyCategoryGaps;
    /**
     * Generate completeness recommendations
     */
    private generateCompletenessRecommendations;
    /**
     * Generate coverage recommendations
     */
    private generateCoverageRecommendations;
    /**
     * Initialize question templates
     */
    private initializeQuestionTemplates;
    /**
     * Get agent status with clarification-specific information
     */
    getAgentStatus(): any;
}
/**
 * Factory function to create a Clarification Expert Agent
 */
export declare const createClarificationExpertAgent: (id: string, config: Partial<AgentConfig>, environment: Partial<AgentEnvironment>, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem) => ClarificationExpertAgent;
//# sourceMappingURL=clarification-expert.d.ts.map