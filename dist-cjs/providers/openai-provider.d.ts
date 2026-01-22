/**
 * OpenAI Provider Implementation
 * Supports GPT-4, GPT-3.5, and other OpenAI models
 */
import { BaseProvider } from './base-provider.js';
import { LLMProvider, LLMModel, LLMRequest, LLMResponse, LLMStreamEvent, ModelInfo, ProviderCapabilities, HealthCheckResult } from './types.js';
export declare class OpenAIProvider extends BaseProvider {
    readonly name: LLMProvider;
    readonly capabilities: ProviderCapabilities;
    private baseUrl;
    private headers;
    protected doInitialize(): Promise<void>;
    protected doComplete(request: LLMRequest): Promise<LLMResponse>;
    protected doStreamComplete(request: LLMRequest): AsyncIterable<LLMStreamEvent>;
    listModels(): Promise<LLMModel[]>;
    getModelInfo(model: LLMModel): Promise<ModelInfo>;
    protected doHealthCheck(): Promise<HealthCheckResult>;
    private mapToOpenAIModel;
    private mapFromOpenAIModel;
    private getModelDescription;
    private handleErrorResponse;
}
//# sourceMappingURL=openai-provider.d.ts.map