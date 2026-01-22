/**
 * Utility functions for multi-LLM provider system
 */
import { ILogger } from '../core/logger.js';
import { ConfigManager } from '../config/config-manager.js';
import { ProviderManager, ProviderManagerConfig } from './provider-manager.js';
import { LLMProvider, LLMProviderConfig } from './types.js';
/**
 * Create a provider manager with default configuration
 */
export declare function createProviderManager(logger: ILogger, configManager: ConfigManager, customConfig?: Partial<ProviderManagerConfig>): ProviderManager;
/**
 * Get default provider configuration
 */
export declare function getDefaultProviderConfig(): ProviderManagerConfig;
/**
 * Validate provider configuration
 */
export declare function validateProviderConfig(config: LLMProviderConfig): string[];
/**
 * Get model recommendations based on use case
 */
export declare function getModelRecommendations(useCase: string): {
    provider: LLMProvider;
    model: string;
    reasoning: string;
}[];
/**
 * Calculate estimated monthly cost based on usage
 */
export declare function estimateMonthlyCost(provider: LLMProvider, model: string, estimatedRequests: number, avgTokensPerRequest: number): {
    promptCost: number;
    completionCost: number;
    totalCost: number;
    currency: string;
};
//# sourceMappingURL=utils.d.ts.map