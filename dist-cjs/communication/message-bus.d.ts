/**
 * Advanced messaging and communication layer for swarm coordination
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../core/logger.js';
import type { IEventBus } from '../core/event-bus.js';
import type { AgentId, CommunicationStrategy } from '../swarm/types.js';
export interface MessageBusConfig {
    strategy: CommunicationStrategy;
    enablePersistence: boolean;
    enableReliability: boolean;
    enableOrdering: boolean;
    enableFiltering: boolean;
    maxMessageSize: number;
    maxQueueSize: number;
    messageRetention: number;
    acknowledgmentTimeout: number;
    retryAttempts: number;
    backoffMultiplier: number;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
    metricsEnabled: boolean;
    debugMode: boolean;
}
export interface Message {
    id: string;
    type: string;
    sender: AgentId;
    receivers: AgentId[];
    content: any;
    metadata: MessageMetadata;
    timestamp: Date;
    expiresAt?: Date;
    priority: MessagePriority;
    reliability: ReliabilityLevel;
}
export interface MessageMetadata {
    correlationId?: string;
    causationId?: string;
    replyTo?: string;
    ttl?: number;
    compressed: boolean;
    encrypted: boolean;
    size: number;
    contentType: string;
    encoding: string;
    checksum?: string;
    route?: string[];
    deadLetterReason?: string;
    deadLetterTimestamp?: Date;
}
export interface MessageChannel {
    id: string;
    name: string;
    type: ChannelType;
    participants: AgentId[];
    config: ChannelConfig;
    statistics: ChannelStatistics;
    filters: MessageFilter[];
    middleware: ChannelMiddleware[];
}
export interface ChannelConfig {
    persistent: boolean;
    ordered: boolean;
    reliable: boolean;
    maxParticipants: number;
    maxMessageSize: number;
    maxQueueDepth: number;
    retentionPeriod: number;
    accessControl: AccessControlConfig;
}
export interface AccessControlConfig {
    readPermission: 'public' | 'participants' | 'restricted';
    writePermission: 'public' | 'participants' | 'restricted';
    adminPermission: 'creator' | 'administrators' | 'system';
    allowedSenders: AgentId[];
    allowedReceivers: AgentId[];
    bannedAgents: AgentId[];
}
export interface ChannelStatistics {
    messagesTotal: number;
    messagesDelivered: number;
    messagesFailed: number;
    bytesTransferred: number;
    averageLatency: number;
    throughput: number;
    errorRate: number;
    participantCount: number;
    lastActivity: Date;
}
export interface MessageFilter {
    id: string;
    name: string;
    enabled: boolean;
    conditions: FilterCondition[];
    action: 'allow' | 'deny' | 'modify' | 'route';
    priority: number;
}
export interface FilterCondition {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'matches' | 'in';
    value: any;
    caseSensitive?: boolean;
}
export interface ChannelMiddleware {
    id: string;
    name: string;
    enabled: boolean;
    order: number;
    process: (message: Message, context: MiddlewareContext) => Promise<Message | null>;
}
export interface MiddlewareContext {
    channel: MessageChannel;
    direction: 'inbound' | 'outbound';
    agent: AgentId;
    metadata: Record<string, any>;
}
export interface MessageQueue {
    id: string;
    name: string;
    type: QueueType;
    messages: Message[];
    config: QueueConfig;
    subscribers: QueueSubscriber[];
    statistics: QueueStatistics;
}
export interface QueueConfig {
    maxSize: number;
    persistent: boolean;
    ordered: boolean;
    durability: 'memory' | 'disk' | 'distributed';
    deliveryMode: 'at-most-once' | 'at-least-once' | 'exactly-once';
    deadLetterQueue?: string;
    retryPolicy: RetryPolicy;
}
export interface QueueSubscriber {
    id: string;
    agent: AgentId;
    filter?: MessageFilter;
    ackMode: 'auto' | 'manual';
    prefetchCount: number;
    lastActivity: Date;
}
export interface QueueStatistics {
    depth: number;
    enqueueRate: number;
    dequeueRate: number;
    throughput: number;
    averageWaitTime: number;
    subscriberCount: number;
    deadLetterCount: number;
}
export interface RetryPolicy {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    jitter: boolean;
}
export interface TopicSubscription {
    id: string;
    topic: string;
    subscriber: AgentId;
    filter?: MessageFilter;
    ackRequired: boolean;
    qos: QualityOfService;
    createdAt: Date;
    lastMessage?: Date;
}
export interface RoutingRule {
    id: string;
    name: string;
    enabled: boolean;
    priority: number;
    conditions: FilterCondition[];
    actions: RoutingAction[];
}
export interface RoutingAction {
    type: 'forward' | 'duplicate' | 'transform' | 'aggregate' | 'delay';
    target?: string;
    config: Record<string, any>;
}
export type MessagePriority = 'low' | 'normal' | 'high' | 'critical';
export type ReliabilityLevel = 'best-effort' | 'at-least-once' | 'exactly-once';
export type ChannelType = 'direct' | 'broadcast' | 'multicast' | 'topic' | 'queue';
export type QueueType = 'fifo' | 'lifo' | 'priority' | 'delay' | 'round-robin';
export type QualityOfService = 0 | 1 | 2;
/**
 * Advanced message bus with support for multiple communication patterns
 */
export declare class MessageBus extends EventEmitter {
    private logger;
    private eventBus;
    private config;
    private channels;
    private queues;
    private subscriptions;
    private routingRules;
    private messageStore;
    private deliveryReceipts;
    private acknowledgments;
    private router;
    private deliveryManager;
    private retryManager;
    private metrics;
    private metricsInterval?;
    constructor(config: Partial<MessageBusConfig>, logger: ILogger, eventBus: IEventBus);
    private setupEventHandlers;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    sendMessage(type: string, content: any, sender: AgentId, receivers: AgentId | AgentId[], options?: {
        priority?: MessagePriority;
        reliability?: ReliabilityLevel;
        ttl?: number;
        correlationId?: string;
        replyTo?: string;
        channel?: string;
    }): Promise<string>;
    broadcastMessage(type: string, content: any, sender: AgentId, options?: {
        channel?: string;
        filter?: MessageFilter;
        priority?: MessagePriority;
        ttl?: number;
    }): Promise<string>;
    subscribeToTopic(topic: string, subscriber: AgentId, options?: {
        filter?: MessageFilter;
        qos?: QualityOfService;
        ackRequired?: boolean;
    }): Promise<string>;
    unsubscribeFromTopic(subscriptionId: string): Promise<void>;
    acknowledgeMessage(messageId: string, agentId: AgentId): Promise<void>;
    createChannel(name: string, type: ChannelType, config?: Partial<ChannelConfig>): Promise<string>;
    joinChannel(channelId: string, agentId: AgentId): Promise<void>;
    leaveChannel(channelId: string, agentId: AgentId): Promise<void>;
    createQueue(name: string, type: QueueType, config?: Partial<QueueConfig>): Promise<string>;
    enqueueMessage(queueId: string, message: Message): Promise<void>;
    dequeueMessage(queueId: string, subscriberId: string): Promise<Message | null>;
    private routeMessage;
    private deliverMessage;
    private validateMessage;
    private processContent;
    private calculateSize;
    private detectContentType;
    private filterReceivers;
    private canJoinChannel;
    private matchesFilter;
    private getFieldValue;
    private evaluateCondition;
    private insertMessageInQueue;
    private insertByPriority;
    private insertByTimestamp;
    private processQueue;
    private deliverMessageToSubscriber;
    private checkAllAcknowledgments;
    private createDefaultChannels;
    private getDefaultBroadcastChannel;
    private createChannelStatistics;
    private createQueueStatistics;
    private startMetricsCollection;
    private updateMetrics;
    private updateChannelStatistics;
    private updateQueueStatistics;
    private handleAgentConnected;
    private handleAgentDisconnected;
    private handleDeliverySuccess;
    private handleDeliveryFailure;
    private handleRetryExhausted;
    private sendToDeadLetterQueue;
    private compress;
    private encrypt;
    private persistMessages;
    getChannel(channelId: string): MessageChannel | undefined;
    getAllChannels(): MessageChannel[];
    getQueue(queueId: string): MessageQueue | undefined;
    getAllQueues(): MessageQueue[];
    getSubscription(subscriptionId: string): TopicSubscription | undefined;
    getAllSubscriptions(): TopicSubscription[];
    getMetrics(): any;
    getMessage(messageId: string): Message | undefined;
    addChannelFilter(channelId: string, filter: MessageFilter): Promise<void>;
    addChannelMiddleware(channelId: string, middleware: ChannelMiddleware): Promise<void>;
}
//# sourceMappingURL=message-bus.d.ts.map