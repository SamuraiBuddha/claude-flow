/**
 * Cohere Provider Implementation
 * Supports Command, Generate, and other Cohere models
 */
import { BaseProvider } from './base-provider.js';
import { LLMProvider, LLMModel, LLMRequest, LLMResponse, LLMStreamEvent, ModelInfo, ProviderCapabilities, HealthCheckResult } from './types.js';
export declare class CohereProvider extends BaseProvider {
    readonly name: LLMProvider;
    readonly capabilities: ProviderCapabilities;
    private baseUrl;
    private headers;
    protected doInitialize(): Promise<void>;
    protected doComplete(request: LLMRequest): Promise<LLMResponse>;
    private doChatComplete;
    private doGenerateComplete;
    protected doStreamComplete(request: LLMRequest): AsyncIterable<LLMStreamEvent>;
    private streamChatComplete;
    private streamGenerateComplete;
    listModels(): Promise<LLMModel[]>;
    getModelInfo(model: LLMModel): Promise<ModelInfo>;
    protected doHealthCheck(): Promise<HealthCheckResult>;
    private convertMessages;
    private mapToCohereModel;
    private mapFinishReason;
    private getModelDescription;
    private handleErrorResponse;
}
//# sourceMappingURL=cohere-provider.d.ts.map