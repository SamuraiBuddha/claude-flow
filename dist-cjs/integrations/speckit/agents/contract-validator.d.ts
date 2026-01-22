/**
 * Contract Validator Agent
 *
 * Ensures API contracts are complete and implementable. Generates contract
 * tests and validates contracts against data models.
 *
 * @module ContractValidatorAgent
 */
import { BaseAgent } from '../../../cli/agents/base-agent.js';
import type { AgentCapabilities, AgentConfig, AgentEnvironment, TaskDefinition } from '../../../swarm/types.js';
import type { ILogger } from '../../../core/logger.js';
import type { IEventBus } from '../../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../../memory/distributed-memory.js';
/**
 * API contract definition
 */
export interface APIContract {
    id: string;
    name: string;
    version: string;
    basePath: string;
    endpoints: ContractEndpoint[];
    schemas: Record<string, ContractSchema>;
    securitySchemes: Record<string, SecurityScheme>;
    metadata: Record<string, any>;
}
/**
 * Contract endpoint definition
 */
export interface ContractEndpoint {
    id: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    summary: string;
    description?: string;
    operationId: string;
    tags: string[];
    parameters: ContractParameter[];
    requestBody?: ContractRequestBody;
    responses: Record<string, ContractResponse>;
    security?: SecurityRequirement[];
    deprecated?: boolean;
}
/**
 * Contract parameter
 */
export interface ContractParameter {
    name: string;
    in: 'path' | 'query' | 'header' | 'cookie';
    description?: string;
    required: boolean;
    schema: ContractSchema;
    example?: any;
}
/**
 * Contract request body
 */
export interface ContractRequestBody {
    description?: string;
    required: boolean;
    content: Record<string, {
        schema: ContractSchema;
        examples?: Record<string, any>;
    }>;
}
/**
 * Contract response
 */
export interface ContractResponse {
    description: string;
    content?: Record<string, {
        schema: ContractSchema;
        examples?: Record<string, any>;
    }>;
    headers?: Record<string, {
        schema: ContractSchema;
        description?: string;
    }>;
}
/**
 * Contract schema (simplified JSON Schema)
 */
export interface ContractSchema {
    type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null';
    format?: string;
    description?: string;
    required?: string[];
    properties?: Record<string, ContractSchema>;
    items?: ContractSchema;
    enum?: any[];
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    nullable?: boolean;
    $ref?: string;
}
/**
 * Security scheme
 */
export interface SecurityScheme {
    type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
    description?: string;
    name?: string;
    in?: 'query' | 'header' | 'cookie';
    scheme?: string;
    bearerFormat?: string;
    flows?: Record<string, any>;
}
/**
 * Security requirement
 */
export interface SecurityRequirement {
    [schemeName: string]: string[];
}
/**
 * Data model for validation
 */
export interface DataModel {
    id: string;
    name: string;
    entities: DataEntity[];
    relationships: DataRelationship[];
}
/**
 * Data entity
 */
export interface DataEntity {
    name: string;
    fields: DataField[];
    primaryKey: string[];
    indexes?: string[][];
}
/**
 * Data field
 */
export interface DataField {
    name: string;
    type: string;
    required: boolean;
    unique?: boolean;
    default?: any;
    constraints?: Record<string, any>;
}
/**
 * Data relationship
 */
export interface DataRelationship {
    from: string;
    to: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    foreignKey: string;
}
/**
 * Contract validation result
 */
export interface ContractValidationResult {
    contractId: string;
    valid: boolean;
    errors: ContractError[];
    warnings: ContractWarning[];
    coverage: ContractCoverage;
    implementability: ImplementabilityAssessment;
}
/**
 * Contract error
 */
export interface ContractError {
    code: string;
    message: string;
    location: string;
    severity: 'error' | 'critical';
}
/**
 * Contract warning
 */
export interface ContractWarning {
    code: string;
    message: string;
    location: string;
    recommendation: string;
}
/**
 * Contract coverage analysis
 */
export interface ContractCoverage {
    endpointsCovered: number;
    schemasCovered: number;
    totalEndpoints: number;
    totalSchemas: number;
    coveragePercentage: number;
    uncoveredEndpoints: string[];
}
/**
 * Implementability assessment
 */
export interface ImplementabilityAssessment {
    implementable: boolean;
    score: number;
    blockers: string[];
    recommendations: string[];
    estimatedEffort: 'low' | 'medium' | 'high';
}
/**
 * Generated contract test
 */
export interface ContractTest {
    id: string;
    name: string;
    description: string;
    endpoint: string;
    method: string;
    testCases: ContractTestCase[];
    setup?: string;
    teardown?: string;
}
/**
 * Contract test case
 */
export interface ContractTestCase {
    name: string;
    description: string;
    input: {
        parameters?: Record<string, any>;
        body?: any;
        headers?: Record<string, string>;
    };
    expectedResponse: {
        status: number;
        body?: any;
        headers?: Record<string, string>;
    };
    assertions: string[];
}
/**
 * Contract Validator Agent - Ensures API contract completeness
 */
export declare class ContractValidatorAgent extends BaseAgent {
    private contracts;
    private dataModels;
    private generatedTests;
    constructor(id: string, config: AgentConfig, environment: AgentEnvironment, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem);
    /**
     * Get default capabilities for contract validation
     */
    protected getDefaultCapabilities(): AgentCapabilities;
    /**
     * Get default configuration for the agent
     */
    protected getDefaultConfig(): Partial<AgentConfig>;
    /**
     * Execute a contract validation task
     */
    executeTask(task: TaskDefinition): Promise<any>;
    /**
     * Parse and validate API contracts
     */
    private parseContracts;
    /**
     * Generate contract tests
     */
    private generateTests;
    /**
     * Validate contracts against data models
     */
    private validateModels;
    /**
     * Check contract completeness
     */
    private checkCompleteness;
    /**
     * Analyze breaking changes between contract versions
     */
    private analyzeBreakingChanges;
    /**
     * Perform general validation
     */
    private performGeneralValidation;
    /**
     * Parse OpenAPI contract
     */
    private parseOpenAPIContract;
    /**
     * Parse Swagger contract
     */
    private parseSwaggerContract;
    /**
     * Parse generic contract
     */
    private parseGenericContract;
    /**
     * Validate contract structure
     */
    private validateContractStructure;
    /**
     * Generate tests for an endpoint
     */
    private generateEndpointTests;
    /**
     * Generate test input
     */
    private generateTestInput;
    /**
     * Generate error input
     */
    private generateErrorInput;
    /**
     * Generate input without a specific parameter
     */
    private generateInputWithoutParam;
    /**
     * Generate sample value for schema
     */
    private generateSampleValue;
    /**
     * Generate sample object from schema
     */
    private generateSampleObject;
    /**
     * Generate test code
     */
    private generateTestCode;
    /**
     * Validate endpoint
     */
    private validateEndpoint;
    /**
     * Validate schema
     */
    private validateSchema;
    /**
     * Validate security definitions
     */
    private validateSecurity;
    /**
     * Validate type match between schema and data model
     */
    private validateTypeMatch;
    /**
     * Calculate coverage
     */
    private calculateCoverage;
    /**
     * Assess implementability
     */
    private assessImplementability;
    /**
     * Generate implementability recommendations
     */
    private generateImplementabilityRecommendations;
    /**
     * Generate compatibility recommendations
     */
    private generateCompatibilityRecommendations;
    /**
     * Get agent status with contract-specific information
     */
    getAgentStatus(): any;
}
/**
 * Factory function to create a Contract Validator Agent
 */
export declare const createContractValidatorAgent: (id: string, config: Partial<AgentConfig>, environment: Partial<AgentEnvironment>, logger: ILogger, eventBus: IEventBus, memory: DistributedMemorySystem) => ContractValidatorAgent;
//# sourceMappingURL=contract-validator.d.ts.map