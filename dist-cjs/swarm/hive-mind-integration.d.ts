/**
 * Hive-Mind System Integration Interface
 *
 * This module provides seamless integration with the existing hive-mind system,
 * enabling swarms to leverage collective intelligence, shared memory, and
 * distributed coordination capabilities while maintaining compatibility
 * with the current claude-flow architecture.
 */
import { EventEmitter } from 'node:events';
import { MemoryManager } from '../memory/manager.js';
import type { AdvancedSwarmOrchestrator } from './advanced-orchestrator.js';
import { SwarmAgent } from './types.js';
export interface HiveMindConfig {
    enableSharedIntelligence: boolean;
    enableCollectiveMemory: boolean;
    enableDistributedLearning: boolean;
    enableKnowledgeSharing: boolean;
    hiveMindEndpoint?: string;
    syncInterval: number;
    maxSharedMemorySize: number;
    intelligencePoolSize: number;
    learningRate: number;
    knowledgeRetentionPeriod: number;
}
export interface HiveMindSession {
    id: string;
    swarmId: string;
    participants: string[];
    sharedMemory: Map<string, any>;
    collectiveIntelligence: CollectiveIntelligence;
    knowledgeBase: KnowledgeBase;
    distributedLearning: DistributedLearning;
    status: 'active' | 'paused' | 'terminated';
    startTime: Date;
    lastSync: Date;
}
export interface CollectiveIntelligence {
    patterns: Map<string, Pattern>;
    insights: Map<string, Insight>;
    decisions: Map<string, CollectiveDecision>;
    predictions: Map<string, Prediction>;
}
export interface Pattern {
    id: string;
    type: 'behavioral' | 'performance' | 'error' | 'success';
    description: string;
    frequency: number;
    confidence: number;
    contexts: string[];
    impact: 'low' | 'medium' | 'high';
    discoveredBy: string[];
    lastSeen: Date;
}
export interface Insight {
    id: string;
    category: 'optimization' | 'coordination' | 'quality' | 'efficiency';
    title: string;
    description: string;
    evidence: any[];
    confidence: number;
    applicability: string[];
    contributingAgents: string[];
    timestamp: Date;
}
export interface CollectiveDecision {
    id: string;
    question: string;
    options: DecisionOption[];
    votingResults: Map<string, string>;
    consensus: string;
    confidence: number;
    reasoning: string;
    participants: string[];
    timestamp: Date;
}
export interface DecisionOption {
    id: string;
    description: string;
    pros: string[];
    cons: string[];
    risk: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    expectedOutcome: string;
}
export interface Prediction {
    id: string;
    target: string;
    predicted_value: any;
    confidence: number;
    timeframe: string;
    methodology: string;
    factors: string[];
    accuracy?: number;
    createdBy: string[];
    timestamp: Date;
}
export interface KnowledgeBase {
    facts: Map<string, Fact>;
    procedures: Map<string, Procedure>;
    bestPractices: Map<string, BestPractice>;
    lessons: Map<string, Lesson>;
}
export interface Fact {
    id: string;
    statement: string;
    category: string;
    confidence: number;
    sources: string[];
    validatedBy: string[];
    contexts: string[];
    timestamp: Date;
}
export interface Procedure {
    id: string;
    name: string;
    description: string;
    steps: ProcedureStep[];
    preconditions: string[];
    postconditions: string[];
    successRate: number;
    contexts: string[];
    lastUsed: Date;
}
export interface ProcedureStep {
    order: number;
    action: string;
    parameters: Record<string, any>;
    expectedResult: string;
    alternatives: string[];
}
export interface BestPractice {
    id: string;
    domain: string;
    practice: string;
    rationale: string;
    benefits: string[];
    applicableContexts: string[];
    effectiveness: number;
    adoptionRate: number;
    validatedBy: string[];
    timestamp: Date;
}
export interface Lesson {
    id: string;
    title: string;
    situation: string;
    actions: string[];
    outcome: string;
    learning: string;
    applicability: string[];
    importance: 'low' | 'medium' | 'high' | 'critical';
    learnedBy: string[];
    timestamp: Date;
}
export interface DistributedLearning {
    models: Map<string, LearningModel>;
    experiences: Map<string, Experience>;
    adaptations: Map<string, Adaptation>;
    performance: PerformanceTrends;
}
export interface LearningModel {
    id: string;
    type: 'neural' | 'statistical' | 'heuristic' | 'ensemble';
    purpose: string;
    parameters: Record<string, any>;
    performance: ModelPerformance;
    trainingData: string[];
    lastUpdated: Date;
    version: string;
}
export interface ModelPerformance {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    validationResults: any[];
    benchmarkResults: any[];
}
export interface Experience {
    id: string;
    context: string;
    situation: string;
    actions: string[];
    results: any[];
    feedback: number;
    tags: string[];
    agentId: string;
    timestamp: Date;
}
export interface Adaptation {
    id: string;
    trigger: string;
    change: string;
    reason: string;
    effectiveness: number;
    rollbackPlan: string;
    approvedBy: string[];
    implementedAt: Date;
}
export interface PerformanceTrends {
    metrics: Map<string, number[]>;
    improvements: string[];
    degradations: string[];
    stability: number;
    trends: TrendAnalysis[];
}
export interface TrendAnalysis {
    metric: string;
    direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    magnitude: number;
    confidence: number;
    timeframe: string;
    factors: string[];
}
export declare class HiveMindIntegration extends EventEmitter {
    private logger;
    private config;
    private memoryManager;
    private activeSessions;
    private globalKnowledgeBase;
    private globalIntelligence;
    private syncInterval?;
    private isInitialized;
    constructor(config: Partial<HiveMindConfig> | undefined, memoryManager: MemoryManager);
    /**
     * Initialize the hive-mind integration
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the integration gracefully
     */
    shutdown(): Promise<void>;
    /**
     * Create a new hive-mind session for a swarm
     */
    createSession(swarmId: string, orchestrator: AdvancedSwarmOrchestrator): Promise<string>;
    /**
     * Add an agent to a hive-mind session
     */
    addAgentToSession(sessionId: string, agentId: string, agent: SwarmAgent): Promise<void>;
    /**
     * Remove an agent from a hive-mind session
     */
    removeAgentFromSession(sessionId: string, agentId: string): Promise<void>;
    /**
     * Share knowledge or experience with the hive-mind
     */
    shareWithHive(sessionId: string, agentId: string, type: 'knowledge' | 'experience' | 'insight' | 'pattern', data: any): Promise<void>;
    /**
     * Request collective decision making
     */
    requestCollectiveDecision(sessionId: string, question: string, options: DecisionOption[], requesterAgentId: string): Promise<string>;
    /**
     * Get collective decision result
     */
    getCollectiveDecision(sessionId: string, decisionId: string): CollectiveDecision | null;
    /**
     * Query the hive-mind knowledge base
     */
    queryKnowledge(sessionId: string, query: {
        type: 'fact' | 'procedure' | 'bestPractice' | 'lesson';
        keywords?: string[];
        context?: string;
        category?: string;
    }): Promise<any[]>;
    /**
     * Get collective insights for a swarm
     */
    getCollectiveInsights(sessionId: string): Insight[];
    /**
     * Get identified patterns
     */
    getIdentifiedPatterns(sessionId: string): Pattern[];
    /**
     * Get performance predictions
     */
    getPerformancePredictions(sessionId: string): Prediction[];
    /**
     * Terminate a hive-mind session
     */
    terminateSession(sessionId: string): Promise<void>;
    /**
     * Get hive-mind session status
     */
    getSessionStatus(sessionId: string): HiveMindSession | null;
    /**
     * Get integration metrics
     */
    getIntegrationMetrics(): {
        activeSessions: number;
        totalParticipants: number;
        knowledgeItems: number;
        insights: number;
        patterns: number;
        decisions: number;
        predictions: number;
        learningModels: number;
    };
    private loadKnowledgeBase;
    private loadCollectiveIntelligence;
    private saveKnowledgeBase;
    private saveCollectiveIntelligence;
    private startPeriodicSync;
    private performPeriodicSync;
    private initializeSessionWithGlobalKnowledge;
    private shareKnowledgeWithAgent;
    private getRelevantKnowledge;
    private addKnowledge;
    private addExperience;
    private addInsight;
    private addPattern;
    private initiateVoting;
    private processVotingResults;
    private queryFacts;
    private queryProcedures;
    private queryBestPractices;
    private queryLessons;
    private consolidateSessionKnowledge;
    private syncSessionKnowledge;
    private loadKnowledgeData;
    private loadIntelligenceData;
    private countKnowledgeItems;
    private initializeKnowledgeBase;
    private initializeCollectiveIntelligence;
    private initializeDistributedLearning;
    private createDefaultConfig;
    private setupEventHandlers;
}
export default HiveMindIntegration;
//# sourceMappingURL=hive-mind-integration.d.ts.map