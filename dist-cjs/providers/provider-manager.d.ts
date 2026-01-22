/**
 * Provider Manager - Central orchestration for multi-LLM providers
 * Handles provider selection, fallback, load balancing, and cost optimization
 */
import { EventEmitter } from 'events';
import { ILogger } from '../core/logger.js';
import { ConfigManager } from '../config/config-manager.js';
import { ILLMProvider, LLMProvider, LLMProviderConfig, LLMRequest, LLMResponse, LLMStreamEvent, FallbackStrategy, CacheConfig } from './types.js';
export interface ProviderManagerConfig {
    providers: Record<LLMProvider, LLMProviderConfig>;
    defaultProvider: LLMProvider;
    fallbackStrategy?: FallbackStrategy;
    loadBalancing?: {
        enabled: boolean;
        strategy: 'round-robin' | 'least-loaded' | 'latency-based' | 'cost-based';
    };
    costOptimization?: {
        enabled: boolean;
        maxCostPerRequest?: number;
        preferredProviders?: LLMProvider[];
    };
    caching?: CacheConfig;
    monitoring?: {
        enabled: boolean;
        metricsInterval: number;
    };
}
export declare class ProviderManager extends EventEmitter {
    private providers;
    private logger;
    private config;
    private requestCount;
    private lastUsed;
    private providerMetrics;
    private cache;
    private currentProviderIndex;
    constructor(logger: ILogger, configManager: ConfigManager, config: ProviderManagerConfig);
    /**
     * Initialize all configured providers
     */
    private initializeProviders;
    /**
     * Create a provider instance
     */
    private createProvider;
    /**
     * Complete a request using the appropriate provider
     */
    complete(request: LLMRequest): Promise<LLMResponse>;
    /**
     * Stream complete a request
     */
    streamComplete(request: LLMRequest): AsyncIterable<LLMStreamEvent>;
    /**
     * Select the best provider for a request
     */
    private selectProvider;
    /**
     * Select provider based on cost optimization
     */
    private selectOptimalProvider;
    /**
     * Select provider using load balancing
     */
    private selectLoadBalancedProvider;
    /**
     * Round-robin provider selection
     */
    private roundRobinSelect;
    /**
     * Select least loaded provider
     */
    private leastLoadedSelect;
    /**
     * Select provider with lowest latency
     */
    private latencyBasedSelect;
    /**
     * Select provider with lowest cost
     */
    private costBasedSelect;
    /**
     * Check if provider is available
     */
    private isProviderAvailable;
    /**
     * Handle request error with fallback
     */
    private handleRequestError;
    /**
     * Get fallback provider based on error
     */
    private getFallbackProvider;
    /**
     * Determine error condition for fallback
     */
    private getErrorCondition;
    /**
     * Cache management
     */
    private checkCache;
    private cacheResponse;
    private generateCacheKey;
    /**
     * Update provider metrics
     */
    private updateProviderMetrics;
    /**
     * Event handlers
     */
    private handleProviderResponse;
    private handleProviderError;
    private handleHealthCheck;
    /**
     * Start monitoring
     */
    private startMonitoring;
    /**
     * Emit aggregated metrics
     */
    private emitMetrics;
    /**
     * Get available providers
     */
    getAvailableProviders(): LLMProvider[];
    /**
     * Get provider by name
     */
    getProvider(name: LLMProvider): ILLMProvider | undefined;
    /**
     * Get all providers
     */
    getAllProviders(): Map<LLMProvider, ILLMProvider>;
    /**
     * Clean up resources
     */
    destroy(): void;
}
//# sourceMappingURL=provider-manager.d.ts.map