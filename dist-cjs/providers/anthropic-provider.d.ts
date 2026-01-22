/**
 * Anthropic (Claude) Provider Implementation
 * Extends the existing Claude client with unified provider interface
 */
import { BaseProvider } from './base-provider.js';
import { LLMProvider, LLMModel, LLMRequest, LLMResponse, LLMStreamEvent, ModelInfo, ProviderCapabilities, HealthCheckResult } from './types.js';
export declare class AnthropicProvider extends BaseProvider {
    readonly name: LLMProvider;
    readonly capabilities: ProviderCapabilities;
    private claudeClient;
    protected doInitialize(): Promise<void>;
    protected doComplete(request: LLMRequest): Promise<LLMResponse>;
    protected doStreamComplete(request: LLMRequest): AsyncIterable<LLMStreamEvent>;
    listModels(): Promise<LLMModel[]>;
    getModelInfo(model: LLMModel): Promise<ModelInfo>;
    protected doHealthCheck(): Promise<HealthCheckResult>;
    /**
     * Map unified model to Anthropic model
     */
    private mapToAnthropicModel;
    /**
     * Map Anthropic model to unified model
     */
    private mapFromAnthropicModel;
    destroy(): void;
}
//# sourceMappingURL=anthropic-provider.d.ts.map