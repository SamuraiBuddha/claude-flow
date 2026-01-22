/**
 * Hive Mind Communication Protocol
 * Defines how agents communicate, vote, and share knowledge
 */
import { EventEmitter } from 'events';
export interface HiveMessage {
    id: string;
    from: string;
    to: string | 'broadcast';
    type: HiveMessageType;
    payload: any;
    timestamp: number;
    priority: 'urgent' | 'high' | 'normal' | 'low';
    requiresResponse?: boolean;
    inReplyTo?: string;
}
export type HiveMessageType = 'task_proposal' | 'vote_request' | 'vote_response' | 'status_update' | 'knowledge_share' | 'help_request' | 'consensus_check' | 'quality_report' | 'coordination_sync';
export interface HiveChannel {
    id: string;
    name: string;
    type: 'broadcast' | 'consensus' | 'coordination' | 'knowledge';
    members: Set<string>;
    messages: HiveMessage[];
}
export declare class HiveCommunicationProtocol extends EventEmitter {
    private channels;
    private messageQueue;
    private knowledgeBase;
    private consensusThreshold;
    constructor(options?: {
        consensusThreshold?: number;
    });
    /**
     * Initialize default communication channels
     */
    private initializeChannels;
    /**
     * Create a new communication channel
     */
    createChannel(name: string, type: HiveChannel['type'], description: string): HiveChannel;
    /**
     * Join an agent to a channel
     */
    joinChannel(channelId: string, agentId: string): void;
    /**
     * Send a message through the protocol
     */
    sendMessage(message: Omit<HiveMessage, 'id' | 'timestamp'>): HiveMessage;
    /**
     * Route message based on type
     */
    private routeMessage;
    /**
     * Get channel type for message type
     */
    private getChannelTypeForMessage;
    /**
     * Queue message for agent
     */
    private queueMessage;
    /**
     * Retrieve messages for agent
     */
    getMessages(agentId: string): HiveMessage[];
    /**
     * Handle vote request
     */
    private handleVoteRequest;
    /**
     * Submit a vote response
     */
    submitVote(requestId: string, agentId: string, vote: boolean, confidence?: number): HiveMessage;
    /**
     * Generate reasoning for vote
     */
    private generateVoteReasoning;
    /**
     * Collect and evaluate votes
     */
    private collectVotes;
    /**
     * Calculate consensus from votes
     */
    private calculateConsensus;
    /**
     * Handle knowledge sharing
     */
    private handleKnowledgeShare;
    /**
     * Query knowledge base
     */
    queryKnowledge(pattern: string): any[];
    /**
     * Handle consensus check
     */
    private handleConsensusCheck;
    /**
     * Handle quality report
     */
    private handleQualityReport;
    /**
     * Get communication statistics
     */
    getStatistics(): {
        totalMessages: number;
        messagesByType: Map<HiveMessageType, number>;
        messagesByPriority: Map<string, number>;
        activeChannels: number;
        knowledgeEntries: number;
        avgResponseTime: number;
    };
    /**
     * Export communication log
     */
    exportLog(): any;
}
//# sourceMappingURL=hive-protocol.d.ts.map