/**
 * ConsensusEngine Class
 *
 * Manages consensus mechanisms, voting, and collective decision-making
 * within the Hive Mind swarm.
 */
import { EventEmitter } from 'events';
import { ConsensusProposal, ConsensusVote, ConsensusResult, ConsensusMetrics } from '../types.js';
export declare class ConsensusEngine extends EventEmitter {
    private threshold;
    private db;
    private mcpWrapper;
    private activeProposals;
    private votingStrategies;
    private metrics;
    private isActive;
    constructor(threshold?: number);
    /**
     * Initialize consensus engine
     */
    initialize(): Promise<void>;
    /**
     * Create a new consensus proposal
     */
    createProposal(proposal: ConsensusProposal): Promise<string>;
    /**
     * Submit a vote for a proposal
     */
    submitVote(vote: ConsensusVote): Promise<void>;
    /**
     * Get proposal status
     */
    getProposalStatus(proposalId: string): Promise<any>;
    /**
     * Get voting recommendation for an agent
     */
    getVotingRecommendation(proposalId: string, agentId: string, agentType: string): Promise<any>;
    /**
     * Force consensus check (for testing or manual intervention)
     */
    forceConsensusCheck(proposalId: string): Promise<ConsensusResult>;
    /**
     * Get consensus metrics
     */
    getMetrics(): ConsensusMetrics;
    /**
     * Initialize voting strategies
     */
    private initializeVotingStrategies;
    /**
     * Initiate voting process
     */
    private initiateVoting;
    /**
     * Validate a vote
     */
    private validateVote;
    /**
     * Check if consensus has been achieved
     */
    private checkConsensus;
    /**
     * Handle consensus achieved
     */
    private handleConsensusAchieved;
    /**
     * Handle consensus failed
     */
    private handleConsensusFailed;
    /**
     * Handle voting deadline
     */
    private handleVotingDeadline;
    /**
     * Select voting strategy
     */
    private selectVotingStrategy;
    /**
     * Update average metrics
     */
    private updateAverageMetrics;
    /**
     * Broadcast consensus result
     */
    private broadcastConsensusResult;
    /**
     * Execute consensus decision
     */
    private executeConsensusDecision;
    /**
     * Start proposal monitor
     */
    private startProposalMonitor;
    /**
     * Start timeout checker
     */
    private startTimeoutChecker;
    /**
     * Start metrics collector
     */
    private startMetricsCollector;
    /**
     * Store consensus metrics
     */
    private storeMetrics;
    /**
     * Database helper methods - these delegate to DatabaseManager methods
     */
    private _getConsensusProposal;
    private _updateConsensusStatus;
    private _getRecentConsensusProposals;
    /**
     * Shutdown consensus engine
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=ConsensusEngine.d.ts.map