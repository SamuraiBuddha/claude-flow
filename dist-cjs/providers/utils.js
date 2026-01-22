"use strict";
/**
 * Utility functions for multi-LLM provider system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProviderManager = createProviderManager;
exports.getDefaultProviderConfig = getDefaultProviderConfig;
exports.validateProviderConfig = validateProviderConfig;
exports.getModelRecommendations = getModelRecommendations;
exports.estimateMonthlyCost = estimateMonthlyCost;
const provider_manager_js_1 = require("./provider-manager.js");
/**
 * Create a provider manager with default configuration
 */
function createProviderManager(logger, configManager, customConfig) {
    const defaultConfig = getDefaultProviderConfig();
    const config = { ...defaultConfig, ...customConfig };
    // Load provider configs from environment
    config.providers = loadProviderConfigs(config.providers);
    return new provider_manager_js_1.ProviderManager(logger, configManager, config);
}
/**
 * Get default provider configuration
 */
function getDefaultProviderConfig() {
    const defaultProvider = process.env.DEFAULT_LLM_PROVIDER || 'anthropic';
    return {
        defaultProvider,
        providers: {
            anthropic: {
                provider: 'anthropic',
                apiKey: process.env.ANTHROPIC_API_KEY,
                model: 'claude-3-sonnet-20240229',
                temperature: 0.7,
                maxTokens: 4096,
                enableStreaming: true,
                enableCaching: true,
                timeout: 60000,
                retryAttempts: 3,
            },
            openai: {
                provider: 'openai',
                apiKey: process.env.OPENAI_API_KEY,
                model: 'gpt-4-turbo-preview',
                temperature: 0.7,
                maxTokens: 4096,
                enableStreaming: true,
                enableCaching: true,
                timeout: 60000,
                retryAttempts: 3,
            },
            google: {
                provider: 'google',
                apiKey: process.env.GOOGLE_AI_API_KEY,
                model: 'gemini-pro',
                temperature: 0.7,
                maxTokens: 2048,
                enableStreaming: true,
                enableCaching: true,
                timeout: 60000,
                retryAttempts: 3,
            },
            cohere: {
                provider: 'cohere',
                apiKey: process.env.COHERE_API_KEY,
                model: 'command',
                temperature: 0.7,
                maxTokens: 4096,
                enableStreaming: true,
                enableCaching: true,
                timeout: 60000,
                retryAttempts: 3,
            },
            ollama: {
                provider: 'ollama',
                apiUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434',
                model: 'llama-2-7b',
                temperature: 0.7,
                maxTokens: 2048,
                enableStreaming: true,
                enableCaching: false,
                timeout: 120000, // Longer timeout for local models
                retryAttempts: 2,
            },
            'llama-cpp': {
                provider: 'llama-cpp',
                apiUrl: process.env.LLAMA_CPP_API_URL || 'http://localhost:8080',
                model: 'llama-2-7b',
                temperature: 0.7,
                maxTokens: 2048,
                enableStreaming: true,
                enableCaching: false,
                timeout: 120000,
                retryAttempts: 2,
            },
            custom: {
                provider: 'custom',
                apiUrl: process.env.CUSTOM_LLM_API_URL,
                model: 'custom-model',
                temperature: 0.7,
                maxTokens: 4096,
                enableStreaming: true,
                enableCaching: true,
                timeout: 60000,
                retryAttempts: 3,
            },
        },
        fallbackStrategy: getDefaultFallbackStrategy(),
        loadBalancing: {
            enabled: false,
            strategy: 'round-robin',
        },
        costOptimization: {
            enabled: true,
            maxCostPerRequest: 1.0, // $1 max per request
            preferredProviders: ['anthropic', 'openai'],
        },
        caching: {
            enabled: true,
            ttl: 3600, // 1 hour
            maxSize: 100, // 100MB
            strategy: 'lru',
        },
        monitoring: {
            enabled: true,
            metricsInterval: 60000, // 1 minute
        },
    };
}
/**
 * Get default fallback strategy
 */
function getDefaultFallbackStrategy() {
    return {
        name: 'default',
        enabled: true,
        maxAttempts: 3,
        rules: [
            {
                condition: 'rate_limit',
                fallbackProviders: ['openai', 'google', 'cohere', 'ollama'],
                retryOriginal: true,
                retryDelay: 60000, // 1 minute
            },
            {
                condition: 'unavailable',
                fallbackProviders: ['openai', 'google', 'anthropic', 'cohere'],
                retryOriginal: true,
                retryDelay: 30000, // 30 seconds
            },
            {
                condition: 'timeout',
                fallbackProviders: ['anthropic', 'openai', 'cohere'],
                retryOriginal: false,
            },
            {
                condition: 'cost',
                fallbackProviders: ['ollama', 'cohere', 'google'],
                retryOriginal: false,
            },
            {
                condition: 'error',
                errorCodes: ['AUTHENTICATION', 'MODEL_NOT_FOUND'],
                fallbackProviders: [],
                retryOriginal: false, // Don't retry auth errors
            },
        ],
    };
}
/**
 * Load provider configurations from environment variables
 */
function loadProviderConfigs(configs) {
    const loaded = { ...configs };
    // Override with environment variables if present
    for (const [provider, config] of Object.entries(loaded)) {
        const envPrefix = `${provider.toUpperCase()}_`;
        // Check for provider-specific overrides
        if (process.env[`${envPrefix}MODEL`]) {
            config.model = process.env[`${envPrefix}MODEL`];
        }
        if (process.env[`${envPrefix}TEMPERATURE`]) {
            config.temperature = parseFloat(process.env[`${envPrefix}TEMPERATURE`]);
        }
        if (process.env[`${envPrefix}MAX_TOKENS`]) {
            config.maxTokens = parseInt(process.env[`${envPrefix}MAX_TOKENS`], 10);
        }
        if (process.env[`${envPrefix}API_URL`]) {
            config.apiUrl = process.env[`${envPrefix}API_URL`];
        }
    }
    return loaded;
}
/**
 * Validate provider configuration
 */
function validateProviderConfig(config) {
    const errors = [];
    if (!config.provider) {
        errors.push('Provider name is required');
    }
    if (!config.model) {
        errors.push('Model is required');
    }
    if (config.temperature !== undefined) {
        if (config.temperature < 0 || config.temperature > 2) {
            errors.push('Temperature must be between 0 and 2');
        }
    }
    if (config.maxTokens !== undefined) {
        if (config.maxTokens < 1 || config.maxTokens > 100000) {
            errors.push('Max tokens must be between 1 and 100000');
        }
    }
    if (config.topP !== undefined) {
        if (config.topP < 0 || config.topP > 1) {
            errors.push('Top-p must be between 0 and 1');
        }
    }
    if (config.timeout !== undefined) {
        if (config.timeout < 1000 || config.timeout > 600000) {
            errors.push('Timeout must be between 1000ms and 600000ms');
        }
    }
    return errors;
}
/**
 * Get model recommendations based on use case
 */
function getModelRecommendations(useCase) {
    const recommendations = {
        'code-generation': [
            {
                provider: 'anthropic',
                model: 'claude-3-opus-20240229',
                reasoning: 'Best for complex code generation with high accuracy',
            },
            {
                provider: 'openai',
                model: 'gpt-4-turbo-preview',
                reasoning: 'Excellent code generation with function calling support',
            },
        ],
        'chat': [
            {
                provider: 'anthropic',
                model: 'claude-3-sonnet-20240229',
                reasoning: 'Balanced performance for conversational AI',
            },
            {
                provider: 'openai',
                model: 'gpt-3.5-turbo',
                reasoning: 'Fast and cost-effective for chat applications',
            },
        ],
        'analysis': [
            {
                provider: 'anthropic',
                model: 'claude-3-opus-20240229',
                reasoning: 'Excellent for deep analysis and reasoning',
            },
            {
                provider: 'google',
                model: 'gemini-pro',
                reasoning: 'Good for data analysis with multimodal support',
            },
        ],
        'local': [
            {
                provider: 'ollama',
                model: 'llama-2-13b',
                reasoning: 'Good balance of performance and resource usage for local deployment',
            },
            {
                provider: 'ollama',
                model: 'mistral-7b',
                reasoning: 'Fast local model with good performance',
            },
        ],
        'budget': [
            {
                provider: 'ollama',
                model: 'llama-2-7b',
                reasoning: 'Free local model with no API costs',
            },
            {
                provider: 'google',
                model: 'gemini-pro',
                reasoning: 'Very cost-effective cloud model',
            },
        ],
    };
    return recommendations[useCase] || recommendations['chat'];
}
/**
 * Calculate estimated monthly cost based on usage
 */
function estimateMonthlyCost(provider, model, estimatedRequests, avgTokensPerRequest) {
    // Get pricing from provider capabilities
    // This is a simplified calculation
    const pricing = getPricing(provider, model);
    if (!pricing) {
        return {
            promptCost: 0,
            completionCost: 0,
            totalCost: 0,
            currency: 'USD',
        };
    }
    const promptTokens = avgTokensPerRequest * 0.7; // Assume 70% prompt
    const completionTokens = avgTokensPerRequest * 0.3; // Assume 30% completion
    const promptCost = (promptTokens * estimatedRequests / 1000) * pricing.promptCostPer1k;
    const completionCost = (completionTokens * estimatedRequests / 1000) * pricing.completionCostPer1k;
    return {
        promptCost,
        completionCost,
        totalCost: promptCost + completionCost,
        currency: pricing.currency,
    };
}
/**
 * Get pricing for a specific provider and model
 */
function getPricing(provider, model) {
    // This would typically come from provider capabilities
    // Simplified for example
    const pricingData = {
        'anthropic:claude-3-opus-20240229': {
            promptCostPer1k: 0.015,
            completionCostPer1k: 0.075,
            currency: 'USD',
        },
        'openai:gpt-4-turbo-preview': {
            promptCostPer1k: 0.01,
            completionCostPer1k: 0.03,
            currency: 'USD',
        },
        'google:gemini-pro': {
            promptCostPer1k: 0.00025,
            completionCostPer1k: 0.0005,
            currency: 'USD',
        },
        'ollama:llama-2-7b': {
            promptCostPer1k: 0,
            completionCostPer1k: 0,
            currency: 'USD',
        },
    };
    return pricingData[`${provider}:${model}`] || null;
}
//# sourceMappingURL=utils.js.map