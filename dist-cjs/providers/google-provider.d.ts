/**
 * Google AI Provider Implementation
 * Supports Gemini Pro, PaLM, and other Google models
 */
import { BaseProvider } from './base-provider.js';
import { LLMProvider, LLMModel, LLMRequest, LLMResponse, LLMStreamEvent, ModelInfo, ProviderCapabilities, HealthCheckResult } from './types.js';
export declare class GoogleProvider extends BaseProvider {
    readonly name: LLMProvider;
    readonly capabilities: ProviderCapabilities;
    private baseUrl;
    protected doInitialize(): Promise<void>;
    protected doComplete(request: LLMRequest): Promise<LLMResponse>;
    protected doStreamComplete(request: LLMRequest): AsyncIterable<LLMStreamEvent>;
    listModels(): Promise<LLMModel[]>;
    getModelInfo(model: LLMModel): Promise<ModelInfo>;
    protected doHealthCheck(): Promise<HealthCheckResult>;
    private buildGoogleRequest;
    private mapToGoogleModel;
    private mapFinishReason;
    private getModelDescription;
    private handleErrorResponse;
}
//# sourceMappingURL=google-provider.d.ts.map