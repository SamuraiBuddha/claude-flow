/**
 * Communication Class
 *
 * Manages inter-agent messaging, broadcasts, and communication protocols
 * within the Hive Mind swarm.
 */
import { EventEmitter } from 'events';
import { Agent } from './Agent.js';
import { Message, MessageType, MessagePriority, CommunicationStats } from '../types.js';
export declare class Communication extends EventEmitter {
    private swarmId;
    private db;
    private agents;
    private channels;
    private messageQueue;
    private stats;
    private isActive;
    constructor(swarmId: string);
    /**
     * Initialize communication system
     */
    initialize(): Promise<void>;
    /**
     * Add an agent to the communication network
     */
    addAgent(agent: Agent): void;
    /**
     * Remove an agent from the communication network
     */
    removeAgent(agentId: string): void;
    /**
     * Send a message
     */
    sendMessage(message: Message): Promise<void>;
    /**
     * Broadcast a message to all agents
     */
    broadcast(fromAgentId: string, type: MessageType, content: any, priority?: MessagePriority): Promise<void>;
    /**
     * Send a message to a specific channel
     */
    sendToChannel(channelName: string, fromAgentId: string, content: any, priority?: MessagePriority): Promise<void>;
    /**
     * Request response from an agent
     */
    requestResponse(fromAgentId: string, toAgentId: string, query: any, timeout?: number): Promise<any>;
    /**
     * Create a new communication channel
     */
    createChannel(name: string, description: string, type?: 'public' | 'private'): void;
    /**
     * Subscribe an agent to a channel
     */
    subscribeToChannel(agentId: string, channelName: string): void;
    /**
     * Unsubscribe an agent from a channel
     */
    unsubscribeFromChannel(agentId: string, channelName: string): void;
    /**
     * Get communication statistics
     */
    getStats(): Promise<CommunicationStats>;
    /**
     * Get pending messages for an agent
     */
    getPendingMessages(agentId: string): Promise<Message[]>;
    /**
     * Mark message as delivered
     */
    markDelivered(messageId: string): Promise<void>;
    /**
     * Mark message as read
     */
    markRead(messageId: string): Promise<void>;
    /**
     * Setup default communication channels
     */
    private setupDefaultChannels;
    /**
     * Create channels for a specific agent
     */
    private createAgentChannels;
    /**
     * Subscribe agent to relevant channels
     */
    private subscribeAgentToChannels;
    /**
     * Start message processor
     */
    private startMessageProcessor;
    /**
     * Process a single message
     */
    private processMessage;
    /**
     * Update latency statistics
     */
    private updateLatencyStats;
    /**
     * Start latency monitor
     */
    private startLatencyMonitor;
    /**
     * Start statistics collector
     */
    private startStatsCollector;
    /**
     * Generate unique message ID
     */
    private generateMessageId;
    /**
     * Shutdown communication system
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=Communication.d.ts.map