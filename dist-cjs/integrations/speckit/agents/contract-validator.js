"use strict";
/**
 * Contract Validator Agent
 *
 * Ensures API contracts are complete and implementable. Generates contract
 * tests and validates contracts against data models.
 *
 * @module ContractValidatorAgent
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContractValidatorAgent = exports.ContractValidatorAgent = void 0;
const base_agent_js_1 = require("../../../cli/agents/base-agent.js");
/**
 * Contract Validator Agent - Ensures API contract completeness
 */
class ContractValidatorAgent extends base_agent_js_1.BaseAgent {
    contracts = new Map();
    dataModels = new Map();
    generatedTests = new Map();
    constructor(id, config, environment, logger, eventBus, memory) {
        super(id, 'reviewer', config, environment, logger, eventBus, memory);
    }
    /**
     * Get default capabilities for contract validation
     */
    getDefaultCapabilities() {
        return {
            codeGeneration: true,
            codeReview: true,
            testing: true,
            documentation: true,
            research: false,
            analysis: true,
            webSearch: false,
            apiIntegration: true,
            fileSystem: true,
            terminalAccess: false,
            languages: ['typescript', 'javascript', 'json', 'yaml'],
            frameworks: ['openapi', 'swagger', 'json-schema'],
            domains: [
                'api-contracts',
                'contract-testing',
                'schema-validation',
                'data-modeling',
                'api-design',
                'test-generation',
            ],
            tools: [
                'parse-contracts',
                'generate-tests',
                'validate-models',
                'check-completeness',
                'analyze-breaking-changes',
                'generate-mocks',
            ],
            maxConcurrentTasks: 4,
            maxMemoryUsage: 512 * 1024 * 1024, // 512MB
            maxExecutionTime: 600000, // 10 minutes
            reliability: 0.95,
            speed: 0.88,
            quality: 0.96,
        };
    }
    /**
     * Get default configuration for the agent
     */
    getDefaultConfig() {
        return {
            autonomyLevel: 0.85,
            learningEnabled: true,
            adaptationEnabled: true,
            maxTasksPerHour: 40,
            maxConcurrentTasks: 4,
            timeoutThreshold: 600000,
            reportingInterval: 30000,
            heartbeatInterval: 10000,
            permissions: ['file-read', 'file-write', 'memory-access'],
            trustedAgents: [],
            expertise: {
                'contract-validation': 0.95,
                'test-generation': 0.92,
                'schema-analysis': 0.94,
                'api-design': 0.9,
            },
            preferences: {
                strictValidation: true,
                generateComprehensiveTests: true,
                checkBackwardsCompatibility: true,
                validateSecurity: true,
            },
        };
    }
    /**
     * Execute a contract validation task
     */
    async executeTask(task) {
        this.logger.info('Contract Validator executing task', {
            agentId: this.id,
            taskType: task.type,
            taskId: task.id,
        });
        try {
            switch (task.type) {
                case 'parse-contracts':
                    return await this.parseContracts(task);
                case 'generate-tests':
                    return await this.generateTests(task);
                case 'validate-models':
                    return await this.validateModels(task);
                case 'check-completeness':
                    return await this.checkCompleteness(task);
                case 'analyze-breaking-changes':
                    return await this.analyzeBreakingChanges(task);
                default:
                    return await this.performGeneralValidation(task);
            }
        }
        catch (error) {
            this.logger.error('Contract validation task failed', {
                agentId: this.id,
                taskId: task.id,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    /**
     * Parse and validate API contracts
     */
    async parseContracts(task) {
        const contractSource = task.input?.contract;
        const format = task.parameters?.format || 'openapi';
        this.logger.info('Parsing API contract', { format });
        let contract;
        try {
            if (format === 'openapi') {
                contract = this.parseOpenAPIContract(contractSource);
            }
            else if (format === 'swagger') {
                contract = this.parseSwaggerContract(contractSource);
            }
            else {
                contract = this.parseGenericContract(contractSource);
            }
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to parse contract: ${error}`,
                suggestions: [
                    'Ensure contract follows the specified format',
                    'Check for syntax errors in JSON/YAML',
                    'Validate against the OpenAPI specification',
                ],
            };
        }
        this.contracts.set(contract.id, contract);
        // Perform initial validation
        const validationResult = this.validateContractStructure(contract);
        await this.memory.store(`contract:${contract.id}:parsed`, {
            contract,
            validation: validationResult,
        }, {
            type: 'parsed-contract',
            tags: ['contract', contract.id],
            partition: 'contracts',
        });
        return {
            success: true,
            contract: {
                id: contract.id,
                name: contract.name,
                version: contract.version,
                endpointCount: contract.endpoints.length,
                schemaCount: Object.keys(contract.schemas).length,
            },
            validation: validationResult,
        };
    }
    /**
     * Generate contract tests
     */
    async generateTests(task) {
        const contractId = task.input?.contractId || task.parameters?.contractId;
        const testTypes = task.parameters?.testTypes || ['happy-path', 'error', 'validation'];
        const contract = this.contracts.get(contractId);
        if (!contract) {
            throw new Error(`Contract not found: ${contractId}`);
        }
        this.logger.info('Generating contract tests', {
            contractId,
            endpointCount: contract.endpoints.length,
            testTypes,
        });
        const tests = [];
        for (const endpoint of contract.endpoints) {
            const endpointTests = this.generateEndpointTests(endpoint, contract, testTypes);
            tests.push(...endpointTests);
        }
        this.generatedTests.set(contractId, tests);
        // Generate test code
        const testCode = this.generateTestCode(tests, contract);
        await this.memory.store(`tests:${contractId}:generated`, {
            contractId,
            testCount: tests.length,
            tests,
            testCode,
        }, {
            type: 'generated-tests',
            tags: ['contract', 'tests', contractId],
            partition: 'contracts',
        });
        return {
            generated: tests.length,
            tests,
            testCode,
            coverage: {
                endpoints: contract.endpoints.length,
                testCases: tests.reduce((sum, t) => sum + t.testCases.length, 0),
                types: testTypes,
            },
        };
    }
    /**
     * Validate contracts against data models
     */
    async validateModels(task) {
        const contractId = task.input?.contractId;
        const dataModel = task.input?.dataModel;
        const contract = this.contracts.get(contractId);
        if (!contract) {
            throw new Error(`Contract not found: ${contractId}`);
        }
        if (dataModel) {
            this.dataModels.set(dataModel.id, dataModel);
        }
        this.logger.info('Validating contract against data model', {
            contractId,
            dataModelId: dataModel?.id,
        });
        const errors = [];
        const warnings = [];
        // Validate schemas against data model entities
        for (const [schemaName, schema] of Object.entries(contract.schemas)) {
            const entity = dataModel?.entities.find(e => e.name.toLowerCase() === schemaName.toLowerCase());
            if (!entity) {
                warnings.push({
                    code: 'SCHEMA_NO_ENTITY',
                    message: `Schema ${schemaName} has no corresponding data model entity`,
                    location: `schemas.${schemaName}`,
                    recommendation: 'Add corresponding entity to data model or remove schema',
                });
                continue;
            }
            // Validate fields match
            const schemaFields = schema.properties ? Object.keys(schema.properties) : [];
            const entityFields = entity.fields.map(f => f.name);
            for (const field of schemaFields) {
                if (!entityFields.includes(field)) {
                    warnings.push({
                        code: 'FIELD_NOT_IN_MODEL',
                        message: `Schema field ${schemaName}.${field} not found in data model`,
                        location: `schemas.${schemaName}.properties.${field}`,
                        recommendation: 'Align schema with data model or add field to model',
                    });
                }
            }
            // Check required fields
            const requiredFields = entity.fields.filter(f => f.required).map(f => f.name);
            const schemaRequired = schema.required || [];
            for (const required of requiredFields) {
                if (!schemaRequired.includes(required)) {
                    errors.push({
                        code: 'REQUIRED_FIELD_MISSING',
                        message: `Required field ${required} not marked as required in schema ${schemaName}`,
                        location: `schemas.${schemaName}.required`,
                        severity: 'error',
                    });
                }
            }
            // Validate types
            if (schema.properties) {
                for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
                    const entityField = entity.fields.find(f => f.name === fieldName);
                    if (entityField) {
                        const typeMatch = this.validateTypeMatch(fieldSchema, entityField);
                        if (!typeMatch.valid) {
                            errors.push({
                                code: 'TYPE_MISMATCH',
                                message: typeMatch.message,
                                location: `schemas.${schemaName}.properties.${fieldName}`,
                                severity: 'error',
                            });
                        }
                    }
                }
            }
        }
        const validationResult = {
            contractId,
            dataModelId: dataModel?.id,
            valid: errors.length === 0,
            errors,
            warnings,
            schemasCovered: Object.keys(contract.schemas).length,
            entitiesMatched: dataModel?.entities.filter(e => Object.keys(contract.schemas).some(s => s.toLowerCase() === e.name.toLowerCase())).length || 0,
        };
        await this.memory.store(`validation:${contractId}:model`, validationResult, {
            type: 'model-validation',
            tags: ['contract', 'validation', contractId],
            partition: 'contracts',
        });
        return validationResult;
    }
    /**
     * Check contract completeness
     */
    async checkCompleteness(task) {
        const contractId = task.input?.contractId;
        const contract = this.contracts.get(contractId);
        if (!contract) {
            throw new Error(`Contract not found: ${contractId}`);
        }
        this.logger.info('Checking contract completeness', { contractId });
        const errors = [];
        const warnings = [];
        // Check each endpoint
        for (const endpoint of contract.endpoints) {
            const endpointErrors = this.validateEndpoint(endpoint, contract);
            errors.push(...endpointErrors.errors);
            warnings.push(...endpointErrors.warnings);
        }
        // Check schemas
        for (const [name, schema] of Object.entries(contract.schemas)) {
            const schemaErrors = this.validateSchema(name, schema);
            errors.push(...schemaErrors.errors);
            warnings.push(...schemaErrors.warnings);
        }
        // Check security
        const securityErrors = this.validateSecurity(contract);
        errors.push(...securityErrors.errors);
        warnings.push(...securityErrors.warnings);
        // Calculate coverage
        const coverage = this.calculateCoverage(contract);
        // Assess implementability
        const implementability = this.assessImplementability(contract, errors, warnings);
        const result = {
            contractId,
            valid: errors.filter(e => e.severity === 'critical').length === 0,
            errors,
            warnings,
            coverage,
            implementability,
        };
        await this.memory.store(`completeness:${contractId}:result`, result, {
            type: 'completeness-check',
            tags: ['contract', 'completeness', contractId],
            partition: 'contracts',
        });
        return result;
    }
    /**
     * Analyze breaking changes between contract versions
     */
    async analyzeBreakingChanges(task) {
        const oldContractId = task.input?.oldContractId;
        const newContractId = task.input?.newContractId;
        const oldContract = this.contracts.get(oldContractId);
        const newContract = this.contracts.get(newContractId);
        if (!oldContract)
            throw new Error(`Old contract not found: ${oldContractId}`);
        if (!newContract)
            throw new Error(`New contract not found: ${newContractId}`);
        this.logger.info('Analyzing breaking changes', {
            oldVersion: oldContract.version,
            newVersion: newContract.version,
        });
        const breakingChanges = [];
        // Check for removed endpoints
        for (const oldEndpoint of oldContract.endpoints) {
            const exists = newContract.endpoints.find(e => e.path === oldEndpoint.path && e.method === oldEndpoint.method);
            if (!exists) {
                breakingChanges.push({
                    type: 'endpoint-removed',
                    location: `${oldEndpoint.method} ${oldEndpoint.path}`,
                    description: `Endpoint removed in new version`,
                    severity: 'breaking',
                });
            }
        }
        // Check for changed endpoints
        for (const newEndpoint of newContract.endpoints) {
            const oldEndpoint = oldContract.endpoints.find(e => e.path === newEndpoint.path && e.method === newEndpoint.method);
            if (oldEndpoint) {
                // Check for new required parameters
                for (const param of newEndpoint.parameters) {
                    const oldParam = oldEndpoint.parameters.find(p => p.name === param.name);
                    if (!oldParam && param.required) {
                        breakingChanges.push({
                            type: 'required-parameter-added',
                            location: `${newEndpoint.method} ${newEndpoint.path}.parameters.${param.name}`,
                            description: `New required parameter added`,
                            severity: 'breaking',
                        });
                    }
                }
                // Check for request body changes
                if (newEndpoint.requestBody?.required && !oldEndpoint.requestBody?.required) {
                    breakingChanges.push({
                        type: 'request-body-required',
                        location: `${newEndpoint.method} ${newEndpoint.path}.requestBody`,
                        description: `Request body became required`,
                        severity: 'breaking',
                    });
                }
            }
        }
        // Check for removed schemas
        for (const schemaName of Object.keys(oldContract.schemas)) {
            if (!newContract.schemas[schemaName]) {
                breakingChanges.push({
                    type: 'schema-removed',
                    location: `schemas.${schemaName}`,
                    description: `Schema removed in new version`,
                    severity: 'potentially-breaking',
                });
            }
        }
        const analysis = {
            oldVersion: oldContract.version,
            newVersion: newContract.version,
            breakingChangesCount: breakingChanges.filter(c => c.severity === 'breaking').length,
            totalChanges: breakingChanges.length,
            changes: breakingChanges,
            backwardsCompatible: breakingChanges.filter(c => c.severity === 'breaking').length === 0,
            recommendations: this.generateCompatibilityRecommendations(breakingChanges),
        };
        return analysis;
    }
    /**
     * Perform general validation
     */
    async performGeneralValidation(task) {
        const contract = task.input?.contract;
        // Parse if needed
        if (contract && !this.contracts.has(contract.id)) {
            await this.parseContracts({
                ...task,
                type: 'parse-contracts',
                input: { contract },
            });
        }
        const contractId = contract?.id || task.parameters?.contractId;
        // Run completeness check
        const completeness = await this.checkCompleteness({
            ...task,
            type: 'check-completeness',
            input: { contractId },
        });
        // Generate tests
        const tests = await this.generateTests({
            ...task,
            type: 'generate-tests',
            input: { contractId },
        });
        return {
            completeness,
            tests: {
                generated: tests.generated,
                coverage: tests.coverage,
            },
            summary: {
                valid: completeness.valid,
                implementable: completeness.implementability.implementable,
                testCases: tests.generated,
            },
        };
    }
    /**
     * Parse OpenAPI contract
     */
    parseOpenAPIContract(source) {
        const contract = {
            id: source.info?.title?.toLowerCase().replace(/\s+/g, '-') || `contract-${Date.now()}`,
            name: source.info?.title || 'Unnamed API',
            version: source.info?.version || '1.0.0',
            basePath: source.servers?.[0]?.url || '/',
            endpoints: [],
            schemas: source.components?.schemas || {},
            securitySchemes: source.components?.securitySchemes || {},
            metadata: source.info || {},
        };
        // Parse paths into endpoints
        if (source.paths) {
            for (const [path, methods] of Object.entries(source.paths)) {
                for (const [method, operation] of Object.entries(methods)) {
                    if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) {
                        contract.endpoints.push({
                            id: `${method}-${path}`.replace(/[^a-zA-Z0-9]/g, '-'),
                            path,
                            method: method.toUpperCase(),
                            summary: operation.summary || '',
                            description: operation.description,
                            operationId: operation.operationId || `${method}${path}`,
                            tags: operation.tags || [],
                            parameters: operation.parameters || [],
                            requestBody: operation.requestBody,
                            responses: operation.responses || {},
                            security: operation.security,
                            deprecated: operation.deprecated,
                        });
                    }
                }
            }
        }
        return contract;
    }
    /**
     * Parse Swagger contract
     */
    parseSwaggerContract(source) {
        // Similar to OpenAPI with Swagger-specific handling
        return this.parseOpenAPIContract(source);
    }
    /**
     * Parse generic contract
     */
    parseGenericContract(source) {
        return {
            id: source.id || `contract-${Date.now()}`,
            name: source.name || 'Generic API',
            version: source.version || '1.0.0',
            basePath: source.basePath || '/',
            endpoints: source.endpoints || [],
            schemas: source.schemas || {},
            securitySchemes: source.securitySchemes || {},
            metadata: source.metadata || {},
        };
    }
    /**
     * Validate contract structure
     */
    validateContractStructure(contract) {
        const errors = [];
        const warnings = [];
        if (!contract.name)
            errors.push('Contract name is required');
        if (!contract.version)
            warnings.push('Contract version is recommended');
        if (contract.endpoints.length === 0)
            warnings.push('Contract has no endpoints defined');
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Generate tests for an endpoint
     */
    generateEndpointTests(endpoint, contract, testTypes) {
        const tests = [];
        const test = {
            id: `test-${endpoint.id}`,
            name: `Tests for ${endpoint.method} ${endpoint.path}`,
            description: endpoint.summary || `Test ${endpoint.operationId}`,
            endpoint: endpoint.path,
            method: endpoint.method,
            testCases: [],
        };
        // Happy path tests
        if (testTypes.includes('happy-path')) {
            const successResponses = Object.entries(endpoint.responses)
                .filter(([code]) => code.startsWith('2'));
            for (const [code, response] of successResponses) {
                test.testCases.push({
                    name: `Should return ${code}`,
                    description: `Happy path test for successful response`,
                    input: this.generateTestInput(endpoint, contract),
                    expectedResponse: {
                        status: parseInt(code),
                        body: response.content?.['application/json']?.examples,
                    },
                    assertions: [
                        `Response status should be ${code}`,
                        'Response should match schema',
                    ],
                });
            }
        }
        // Error tests
        if (testTypes.includes('error')) {
            const errorResponses = Object.entries(endpoint.responses)
                .filter(([code]) => code.startsWith('4') || code.startsWith('5'));
            for (const [code, response] of errorResponses) {
                test.testCases.push({
                    name: `Should return ${code} on error`,
                    description: response.description,
                    input: this.generateErrorInput(endpoint, code),
                    expectedResponse: {
                        status: parseInt(code),
                    },
                    assertions: [
                        `Response status should be ${code}`,
                        'Response should contain error message',
                    ],
                });
            }
        }
        // Validation tests
        if (testTypes.includes('validation')) {
            for (const param of endpoint.parameters.filter(p => p.required)) {
                test.testCases.push({
                    name: `Should validate required parameter: ${param.name}`,
                    description: `Validation test for missing ${param.name}`,
                    input: this.generateInputWithoutParam(endpoint, param.name),
                    expectedResponse: {
                        status: 400,
                    },
                    assertions: [
                        'Response status should be 400',
                        `Error message should mention ${param.name}`,
                    ],
                });
            }
        }
        tests.push(test);
        return tests;
    }
    /**
     * Generate test input
     */
    generateTestInput(endpoint, contract) {
        const input = {};
        // Generate parameters
        if (endpoint.parameters.length > 0) {
            input.parameters = {};
            for (const param of endpoint.parameters) {
                input.parameters[param.name] = this.generateSampleValue(param.schema);
            }
        }
        // Generate request body
        if (endpoint.requestBody) {
            const jsonContent = endpoint.requestBody.content?.['application/json'];
            if (jsonContent?.schema) {
                input.body = this.generateSampleObject(jsonContent.schema, contract.schemas);
            }
        }
        return input;
    }
    /**
     * Generate error input
     */
    generateErrorInput(endpoint, errorCode) {
        // Generate input that would cause the specific error
        if (errorCode === '401' || errorCode === '403') {
            return { headers: {} }; // Missing auth header
        }
        if (errorCode === '404') {
            return { parameters: { id: 'non-existent-id' } };
        }
        return {};
    }
    /**
     * Generate input without a specific parameter
     */
    generateInputWithoutParam(endpoint, paramName) {
        const input = { parameters: {} };
        for (const param of endpoint.parameters) {
            if (param.name !== paramName) {
                input.parameters[param.name] = this.generateSampleValue(param.schema);
            }
        }
        return input;
    }
    /**
     * Generate sample value for schema
     */
    generateSampleValue(schema) {
        switch (schema.type) {
            case 'string':
                if (schema.enum)
                    return schema.enum[0];
                if (schema.format === 'email')
                    return 'test@example.com';
                if (schema.format === 'date')
                    return '2024-01-01';
                if (schema.format === 'date-time')
                    return '2024-01-01T00:00:00Z';
                if (schema.format === 'uuid')
                    return '123e4567-e89b-12d3-a456-426614174000';
                return 'test-string';
            case 'number':
            case 'integer':
                return schema.minimum || 1;
            case 'boolean':
                return true;
            case 'array':
                return schema.items ? [this.generateSampleValue(schema.items)] : [];
            case 'object':
                return {};
            default:
                return null;
        }
    }
    /**
     * Generate sample object from schema
     */
    generateSampleObject(schema, schemas) {
        if (schema.$ref) {
            const refName = schema.$ref.split('/').pop();
            if (refName && schemas[refName]) {
                return this.generateSampleObject(schemas[refName], schemas);
            }
        }
        if (schema.type !== 'object' || !schema.properties) {
            return this.generateSampleValue(schema);
        }
        const obj = {};
        for (const [name, propSchema] of Object.entries(schema.properties)) {
            obj[name] = this.generateSampleValue(propSchema);
        }
        return obj;
    }
    /**
     * Generate test code
     */
    generateTestCode(tests, contract) {
        const lines = [
            `// Generated Contract Tests for ${contract.name} v${contract.version}`,
            `// Generated at: ${new Date().toISOString()}`,
            '',
            `import { describe, it, expect } from 'vitest';`,
            `import { request } from 'supertest';`,
            '',
            `const BASE_URL = '${contract.basePath}';`,
            '',
        ];
        for (const test of tests) {
            lines.push(`describe('${test.name}', () => {`);
            for (const testCase of test.testCases) {
                lines.push(`  it('${testCase.name}', async () => {`);
                lines.push(`    // ${testCase.description}`);
                lines.push(`    const response = await request(BASE_URL)`);
                lines.push(`      .${test.method.toLowerCase()}('${test.endpoint}')`);
                if (testCase.input.body) {
                    lines.push(`      .send(${JSON.stringify(testCase.input.body)})`);
                }
                lines.push(`      .expect(${testCase.expectedResponse.status});`);
                lines.push('');
                for (const assertion of testCase.assertions) {
                    lines.push(`    // ${assertion}`);
                }
                lines.push('  });');
                lines.push('');
            }
            lines.push('});');
            lines.push('');
        }
        return lines.join('\n');
    }
    /**
     * Validate endpoint
     */
    validateEndpoint(endpoint, contract) {
        const errors = [];
        const warnings = [];
        // Check for description
        if (!endpoint.description) {
            warnings.push({
                code: 'MISSING_DESCRIPTION',
                message: `Endpoint ${endpoint.method} ${endpoint.path} has no description`,
                location: `${endpoint.method} ${endpoint.path}`,
                recommendation: 'Add a description for better documentation',
            });
        }
        // Check for response definitions
        if (!endpoint.responses['200'] && !endpoint.responses['201'] && !endpoint.responses['204']) {
            warnings.push({
                code: 'NO_SUCCESS_RESPONSE',
                message: `Endpoint ${endpoint.method} ${endpoint.path} has no success response defined`,
                location: `${endpoint.method} ${endpoint.path}.responses`,
                recommendation: 'Define at least one success response',
            });
        }
        // Check for error responses
        if (!endpoint.responses['400'] && !endpoint.responses['500']) {
            warnings.push({
                code: 'NO_ERROR_RESPONSES',
                message: `Endpoint ${endpoint.method} ${endpoint.path} has no error responses defined`,
                location: `${endpoint.method} ${endpoint.path}.responses`,
                recommendation: 'Define error responses for better error handling',
            });
        }
        // Check parameters
        for (const param of endpoint.parameters) {
            if (!param.description) {
                warnings.push({
                    code: 'PARAM_NO_DESCRIPTION',
                    message: `Parameter ${param.name} has no description`,
                    location: `${endpoint.method} ${endpoint.path}.parameters.${param.name}`,
                    recommendation: 'Add description for clarity',
                });
            }
        }
        return { errors, warnings };
    }
    /**
     * Validate schema
     */
    validateSchema(name, schema) {
        const errors = [];
        const warnings = [];
        if (!schema.type && !schema.$ref) {
            errors.push({
                code: 'SCHEMA_NO_TYPE',
                message: `Schema ${name} has no type defined`,
                location: `schemas.${name}`,
                severity: 'error',
            });
        }
        if (schema.type === 'object' && !schema.properties) {
            warnings.push({
                code: 'OBJECT_NO_PROPERTIES',
                message: `Object schema ${name} has no properties defined`,
                location: `schemas.${name}`,
                recommendation: 'Define properties for object schemas',
            });
        }
        return { errors, warnings };
    }
    /**
     * Validate security definitions
     */
    validateSecurity(contract) {
        const errors = [];
        const warnings = [];
        // Check if endpoints use security
        const securedEndpoints = contract.endpoints.filter(e => e.security && e.security.length > 0);
        const unsecuredEndpoints = contract.endpoints.filter(e => !e.security || e.security.length === 0);
        if (unsecuredEndpoints.length > 0 && securedEndpoints.length > 0) {
            warnings.push({
                code: 'MIXED_SECURITY',
                message: `${unsecuredEndpoints.length} endpoints lack security definitions`,
                location: 'endpoints',
                recommendation: 'Consider adding security to all endpoints or document why some are public',
            });
        }
        // Check for undefined security schemes
        for (const endpoint of contract.endpoints) {
            if (endpoint.security) {
                for (const req of endpoint.security) {
                    for (const schemeName of Object.keys(req)) {
                        if (!contract.securitySchemes[schemeName]) {
                            errors.push({
                                code: 'UNDEFINED_SECURITY_SCHEME',
                                message: `Endpoint uses undefined security scheme: ${schemeName}`,
                                location: `${endpoint.method} ${endpoint.path}.security`,
                                severity: 'error',
                            });
                        }
                    }
                }
            }
        }
        return { errors, warnings };
    }
    /**
     * Validate type match between schema and data model
     */
    validateTypeMatch(schema, field) {
        const typeMap = {
            string: ['string', 'varchar', 'text', 'char'],
            number: ['number', 'float', 'double', 'decimal'],
            integer: ['int', 'integer', 'bigint', 'smallint'],
            boolean: ['boolean', 'bool'],
            array: ['array', 'list'],
            object: ['object', 'json', 'jsonb'],
        };
        const schemaTypes = typeMap[schema.type] || [schema.type];
        if (!schemaTypes.some(t => field.type.toLowerCase().includes(t))) {
            return {
                valid: false,
                message: `Type mismatch: schema has ${schema.type}, model has ${field.type}`,
            };
        }
        return { valid: true, message: 'Types match' };
    }
    /**
     * Calculate coverage
     */
    calculateCoverage(contract) {
        const endpoints = contract.endpoints;
        const documented = endpoints.filter(e => e.description && e.description.length > 0);
        const withResponses = endpoints.filter(e => Object.keys(e.responses).length > 0);
        return {
            endpointsCovered: withResponses.length,
            schemasCovered: Object.keys(contract.schemas).length,
            totalEndpoints: endpoints.length,
            totalSchemas: Object.keys(contract.schemas).length,
            coveragePercentage: endpoints.length > 0
                ? (withResponses.length / endpoints.length) * 100
                : 0,
            uncoveredEndpoints: endpoints
                .filter(e => !e.description || Object.keys(e.responses).length === 0)
                .map(e => `${e.method} ${e.path}`),
        };
    }
    /**
     * Assess implementability
     */
    assessImplementability(contract, errors, warnings) {
        const criticalErrors = errors.filter(e => e.severity === 'critical');
        const blockers = criticalErrors.map(e => e.message);
        let score = 100;
        score -= criticalErrors.length * 20;
        score -= errors.filter(e => e.severity === 'error').length * 10;
        score -= warnings.length * 2;
        score = Math.max(0, score);
        let effort = 'low';
        if (contract.endpoints.length > 20)
            effort = 'medium';
        if (contract.endpoints.length > 50 || Object.keys(contract.schemas).length > 20)
            effort = 'high';
        return {
            implementable: blockers.length === 0 && score >= 60,
            score,
            blockers,
            recommendations: this.generateImplementabilityRecommendations(errors, warnings, score),
            estimatedEffort: effort,
        };
    }
    /**
     * Generate implementability recommendations
     */
    generateImplementabilityRecommendations(errors, warnings, score) {
        const recommendations = [];
        if (errors.length > 0) {
            recommendations.push(`Fix ${errors.length} errors before implementation`);
        }
        if (score < 80) {
            recommendations.push('Improve contract documentation for better clarity');
        }
        if (warnings.length > 10) {
            recommendations.push('Address warnings to improve contract quality');
        }
        return recommendations;
    }
    /**
     * Generate compatibility recommendations
     */
    generateCompatibilityRecommendations(changes) {
        const recommendations = [];
        const breakingCount = changes.filter(c => c.severity === 'breaking').length;
        if (breakingCount > 0) {
            recommendations.push(`${breakingCount} breaking changes detected - consider major version bump`);
            recommendations.push('Provide migration guide for consumers');
            recommendations.push('Consider deprecation period before removal');
        }
        return recommendations;
    }
    /**
     * Get agent status with contract-specific information
     */
    getAgentStatus() {
        return {
            ...super.getAgentStatus(),
            specialization: 'Contract Validation',
            contractsLoaded: this.contracts.size,
            dataModelsLoaded: this.dataModels.size,
            testsGenerated: Array.from(this.generatedTests.values())
                .reduce((sum, tests) => sum + tests.length, 0),
            capabilities: [
                'parse-contracts',
                'generate-tests',
                'validate-models',
            ],
        };
    }
}
exports.ContractValidatorAgent = ContractValidatorAgent;
/**
 * Factory function to create a Contract Validator Agent
 */
const createContractValidatorAgent = (id, config, environment, logger, eventBus, memory) => {
    const defaultConfig = {
        autonomyLevel: 0.85,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 40,
        maxConcurrentTasks: 4,
        timeoutThreshold: 600000,
        reportingInterval: 30000,
        heartbeatInterval: 10000,
        permissions: ['file-read', 'file-write', 'memory-access'],
        trustedAgents: [],
        expertise: {
            'contract-validation': 0.95,
            'test-generation': 0.92,
        },
        preferences: {
            strictValidation: true,
            generateComprehensiveTests: true,
        },
    };
    const defaultEnv = {
        runtime: 'node',
        version: '20.0.0',
        workingDirectory: './agents/contract-validator',
        tempDirectory: './tmp/contract-validator',
        logDirectory: './logs/contract-validator',
        apiEndpoints: {},
        credentials: {},
        availableTools: ['parse-contracts', 'generate-tests', 'validate-models'],
        toolConfigs: {},
    };
    return new ContractValidatorAgent(id, { ...defaultConfig, ...config }, { ...defaultEnv, ...environment }, logger, eventBus, memory);
};
exports.createContractValidatorAgent = createContractValidatorAgent;
//# sourceMappingURL=contract-validator.js.map