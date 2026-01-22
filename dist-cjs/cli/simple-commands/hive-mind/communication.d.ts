/**
 * SwarmCommunication class
 */
export class SwarmCommunication extends EventEmitter<[never]> {
    constructor(config?: {});
    config: {
        swarmId: any;
        encryption: any;
        maxRetries: any;
        timeout: any;
        bufferSize: any;
        gossipFanout: any;
        consensusQuorum: any;
    };
    state: {
        agents: Map<any, any>;
        channels: Map<any, any>;
        messageBuffer: never[];
        messageHistory: Map<any, any>;
        metrics: {
            sent: number;
            received: number;
            failed: number;
            encrypted: number;
            latency: never[];
        };
    };
    encryptionKey: Buffer<ArrayBufferLike> | null;
    /**
     * Initialize communication system
     */
    _initialize(): void;
    messageProcessor: NodeJS.Timeout | undefined;
    heartbeatTimer: NodeJS.Timeout | undefined;
    /**
     * Register agent in communication network
     */
    registerAgent(agentId: any, metadata?: {}): {
        id: any;
        status: string;
        lastSeen: number;
        metadata: {};
        messageCount: number;
        channel: EventEmitter<[never]>;
    };
    /**
     * Unregister agent from network
     */
    unregisterAgent(agentId: any): void;
    /**
     * Send direct message to agent
     */
    send(toAgentId: any, message: any, type?: string): Promise<any>;
    /**
     * Broadcast message to all agents
     */
    broadcast(message: any, type?: string): {
        messageId: string;
        recipients: number;
    };
    /**
     * Multicast message to specific agents
     */
    multicast(agentIds: any, message: any, type?: string): {
        messageId: string;
        recipients: any;
    };
    /**
     * Gossip protocol for epidemic spread
     */
    gossip(message: any, type?: string): {
        messageId: string;
        initialTargets: any[];
    };
    /**
     * Byzantine consensus protocol
     */
    consensus(proposal: any, validators?: any[]): Promise<{
        consensusId: string;
        proposal: any;
        validators: number;
        votes: any;
        voteCount: {};
        winner: string | null;
        consensusReached: boolean;
        quorum: any;
        timestamp: number;
    }>;
    /**
     * Handle incoming message
     */
    handleMessage(envelope: any): void;
    /**
     * Handle direct message
     */
    _handleDirectMessage(envelope: any): void;
    /**
     * Handle broadcast message
     */
    _handleBroadcastMessage(envelope: any): void;
    /**
     * Handle multicast message
     */
    _handleMulticastMessage(envelope: any): void;
    /**
     * Handle gossip message
     */
    _handleGossipMessage(envelope: any): void;
    /**
     * Handle consensus message
     */
    _handleConsensusMessage(envelope: any): void;
    /**
     * Send acknowledgment
     */
    _sendAck(messageId: any, toAgent: any): void;
    /**
     * Create communication channel
     */
    _createChannel(agentId: any): EventEmitter<[never]>;
    /**
     * Add message to buffer
     */
    _addToBuffer(envelope: any): void;
    /**
     * Process message buffer
     */
    _processMessageBuffer(): void;
    /**
     * Send heartbeats to all agents
     */
    _sendHeartbeats(): void;
    /**
     * Select random agents
     */
    _selectRandomAgents(agents: any, count: any): any[];
    /**
     * Generate unique message ID
     */
    _generateMessageId(): string;
    /**
     * Encrypt message
     */
    _encrypt(data: any): any;
    /**
     * Decrypt message
     */
    _decrypt(encrypted: any): any;
    /**
     * Get communication statistics
     */
    getStatistics(): {
        agents: {
            total: number;
            online: number;
            offline: number;
        };
        messages: {
            sent: number;
            received: number;
            failed: number;
            encrypted: number;
            buffered: number;
        };
        performance: {
            avgLatency: string;
            successRate: string | number;
        };
    };
    /**
     * Close communication system
     */
    close(): void;
}
import EventEmitter from 'events';
//# sourceMappingURL=communication.d.ts.map