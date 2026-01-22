"use strict";
/**
 * Agentic Flow Hook System
 *
 * Main entry point for the hook system integration with agentic-flow.
 * Provides initialization, registration, and management of all hook types.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agenticHookManager = void 0;
exports.initializeAgenticFlowHooks = initializeAgenticFlowHooks;
exports.shutdownAgenticFlowHooks = shutdownAgenticFlowHooks;
exports.getHookSystemStatus = getHookSystemStatus;
exports.createHookContext = createHookContext;
const hook_manager_js_1 = require("./hook-manager.js");
const llm_hooks_js_1 = require("./llm-hooks.js");
const memory_hooks_js_1 = require("./memory-hooks.js");
const neural_hooks_js_1 = require("./neural-hooks.js");
const performance_hooks_js_1 = require("./performance-hooks.js");
const workflow_hooks_js_1 = require("./workflow-hooks.js");
const logger_js_1 = require("../../core/logger.js");
__exportStar(require("./types.js"), exports);
var hook_manager_js_2 = require("./hook-manager.js");
Object.defineProperty(exports, "agenticHookManager", { enumerable: true, get: function () { return hook_manager_js_2.agenticHookManager; } });
__exportStar(require("./llm-hooks.js"), exports);
__exportStar(require("./memory-hooks.js"), exports);
__exportStar(require("./neural-hooks.js"), exports);
__exportStar(require("./performance-hooks.js"), exports);
__exportStar(require("./workflow-hooks.js"), exports);
const logger = new logger_js_1.Logger({
    level: 'info',
    format: 'text',
    destination: 'console'
}, { prefix: 'AgenticFlowHooks' });
/**
 * Initialize the agentic-flow hook system
 */
async function initializeAgenticFlowHooks() {
    logger.info('Initializing agentic-flow hook system...');
    try {
        // Register all hook types
        (0, llm_hooks_js_1.registerLLMHooks)();
        logger.debug('LLM hooks registered');
        (0, memory_hooks_js_1.registerMemoryHooks)();
        logger.debug('Memory hooks registered');
        (0, neural_hooks_js_1.registerNeuralHooks)();
        logger.debug('Neural hooks registered');
        (0, performance_hooks_js_1.registerPerformanceHooks)();
        logger.debug('Performance hooks registered');
        (0, workflow_hooks_js_1.registerWorkflowHooks)();
        logger.debug('Workflow hooks registered');
        // Set up default pipelines
        await setupDefaultPipelines();
        // Initialize metrics collection
        startMetricsCollection();
        logger.info('Agentic-flow hook system initialized successfully');
    }
    catch (error) {
        logger.error('Failed to initialize agentic-flow hooks:', error);
        throw error;
    }
}
/**
 * Set up default hook pipelines
 */
async function setupDefaultPipelines() {
    // LLM Call Pipeline
    hook_manager_js_1.agenticHookManager.createPipeline({
        id: 'llm-call-pipeline',
        name: 'LLM Call Pipeline',
        stages: [
            {
                name: 'pre-call',
                hooks: hook_manager_js_1.agenticHookManager.getHooks('pre-llm-call'),
                parallel: false,
            },
            {
                name: 'call-execution',
                hooks: [], // Actual LLM call happens here
                parallel: false,
            },
            {
                name: 'post-call',
                hooks: hook_manager_js_1.agenticHookManager.getHooks('post-llm-call'),
                parallel: true,
            },
        ],
        errorStrategy: 'continue',
    });
    // Memory Operation Pipeline
    hook_manager_js_1.agenticHookManager.createPipeline({
        id: 'memory-operation-pipeline',
        name: 'Memory Operation Pipeline',
        stages: [
            {
                name: 'validation',
                hooks: hook_manager_js_1.agenticHookManager.getHooks('pre-memory-store'),
                parallel: false,
            },
            {
                name: 'storage',
                hooks: hook_manager_js_1.agenticHookManager.getHooks('post-memory-store'),
                parallel: true,
            },
            {
                name: 'sync',
                hooks: hook_manager_js_1.agenticHookManager.getHooks('memory-sync'),
                parallel: true,
                condition: (ctx) => ctx.metadata.crossProvider === true,
            },
        ],
        errorStrategy: 'rollback',
    });
    // Workflow Execution Pipeline
    hook_manager_js_1.agenticHookManager.createPipeline({
        id: 'workflow-execution-pipeline',
        name: 'Workflow Execution Pipeline',
        stages: [
            {
                name: 'initialization',
                hooks: hook_manager_js_1.agenticHookManager.getHooks('workflow-start'),
                parallel: false,
            },
            {
                name: 'execution',
                hooks: [
                    ...hook_manager_js_1.agenticHookManager.getHooks('workflow-step'),
                    ...hook_manager_js_1.agenticHookManager.getHooks('workflow-decision'),
                ],
                parallel: false,
            },
            {
                name: 'completion',
                hooks: hook_manager_js_1.agenticHookManager.getHooks('workflow-complete'),
                parallel: true,
            },
        ],
        errorStrategy: 'fail-fast',
    });
}
/**
 * Start background metrics collection
 */
function startMetricsCollection() {
    // Collect metrics every 30 seconds
    setInterval(() => {
        const metrics = hook_manager_js_1.agenticHookManager.getMetrics();
        // Log high-level metrics
        logger.debug('Hook system metrics:', {
            totalHooks: metrics['hooks.count'],
            totalExecutions: metrics['hooks.executions'],
            errorRate: metrics['hooks.errors'] / metrics['hooks.executions'] || 0,
            cacheHitRate: metrics['hooks.cacheHits'] / metrics['hooks.executions'] || 0,
        });
        // Emit metrics event
        hook_manager_js_1.agenticHookManager.emit('metrics:collected', metrics);
    }, 30000);
}
/**
 * Shutdown the hook system gracefully
 */
async function shutdownAgenticFlowHooks() {
    logger.info('Shutting down agentic-flow hook system...');
    try {
        // Wait for active executions to complete
        const maxWaitTime = 10000; // 10 seconds
        const startTime = Date.now();
        while (hook_manager_js_1.agenticHookManager.getMetrics()['executions.active'] > 0) {
            if (Date.now() - startTime > maxWaitTime) {
                logger.warn('Timeout waiting for active executions to complete');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        // Remove all listeners
        hook_manager_js_1.agenticHookManager.removeAllListeners();
        logger.info('Agentic-flow hook system shut down successfully');
    }
    catch (error) {
        logger.error('Error during hook system shutdown:', error);
        throw error;
    }
}
/**
 * Get hook system status
 */
function getHookSystemStatus() {
    const metrics = hook_manager_js_1.agenticHookManager.getMetrics();
    return {
        initialized: metrics['hooks.count'] > 0,
        metrics,
        pipelines: [
            'llm-call-pipeline',
            'memory-operation-pipeline',
            'workflow-execution-pipeline',
        ],
        activeExecutions: metrics['executions.active'] || 0,
    };
}
/**
 * Create a context builder for hook execution
 */
function createHookContext() {
    class ContextBuilder {
        context = {
            timestamp: Date.now(),
            correlationId: this.generateCorrelationId(),
            metadata: {},
        };
        withSession(sessionId) {
            this.context.sessionId = sessionId;
            return this;
        }
        withMemory(namespace, provider) {
            this.context.memory = {
                namespace,
                provider,
                cache: new Map(),
            };
            return this;
        }
        withNeural(modelId) {
            this.context.neural = {
                modelId,
                patterns: this.createPatternStore(),
                training: {
                    epoch: 0,
                    loss: 0,
                    accuracy: 0,
                    learningRate: 0.001,
                    optimizer: 'adam',
                    checkpoints: [],
                },
            };
            return this;
        }
        withPerformance(metrics) {
            const metricsMap = new Map();
            metrics.forEach(m => metricsMap.set(m.name, m));
            this.context.performance = {
                metrics: metricsMap,
                bottlenecks: [],
                optimizations: [],
            };
            return this;
        }
        withMetadata(metadata) {
            this.context.metadata = { ...this.context.metadata, ...metadata };
            return this;
        }
        build() {
            if (!this.context.sessionId) {
                this.context.sessionId = this.generateSessionId();
            }
            if (!this.context.memory) {
                this.context.memory = {
                    namespace: 'default',
                    provider: 'memory',
                    cache: new Map(),
                };
            }
            if (!this.context.neural) {
                this.context.neural = {
                    modelId: 'default',
                    patterns: this.createPatternStore(),
                    training: {
                        epoch: 0,
                        loss: 0,
                        accuracy: 0,
                        learningRate: 0.001,
                        optimizer: 'adam',
                        checkpoints: [],
                    },
                };
            }
            if (!this.context.performance) {
                this.context.performance = {
                    metrics: new Map(),
                    bottlenecks: [],
                    optimizations: [],
                };
            }
            return this.context;
        }
        generateCorrelationId() {
            return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        generateSessionId() {
            return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        createPatternStore() {
            const patterns = new Map();
            return {
                add(pattern) {
                    patterns.set(pattern.id, pattern);
                },
                get(id) {
                    return patterns.get(id);
                },
                findSimilar(pattern, threshold) {
                    const results = [];
                    for (const p of patterns.values()) {
                        // Simple similarity check
                        if (p.type === pattern.type && p.confidence >= threshold) {
                            results.push(p);
                        }
                    }
                    return results;
                },
                getByType(type) {
                    return Array.from(patterns.values()).filter(p => p.type === type);
                },
                prune(maxAge) {
                    const cutoff = Date.now() - maxAge;
                    for (const [id, pattern] of patterns) {
                        if (pattern.context.timestamp < cutoff) {
                            patterns.delete(id);
                        }
                    }
                },
                export() {
                    return Array.from(patterns.values());
                },
                import(newPatterns) {
                    for (const pattern of newPatterns) {
                        patterns.set(pattern.id, pattern);
                    }
                },
            };
        }
    }
    return new ContextBuilder();
}
//# sourceMappingURL=index.js.map