"use strict";
/**
 * Self-improving workflow hooks for agentic-flow
 *
 * Enables adaptive workflows with provider selection
 * and continuous improvement based on outcomes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowErrorHook = exports.workflowCompleteHook = exports.workflowDecisionHook = exports.workflowStepHook = exports.workflowStartHook = void 0;
exports.registerWorkflowHooks = registerWorkflowHooks;
const hook_manager_js_1 = require("./hook-manager.js");
// ===== Workflow Start Hook =====
exports.workflowStartHook = {
    id: 'agentic-workflow-start',
    type: 'workflow-start',
    priority: 100,
    handler: async (payload, context) => {
        const { workflowId, state } = payload;
        const sideEffects = [];
        // Load workflow history and learnings
        const history = await loadWorkflowHistory(workflowId, context);
        const learnings = await loadWorkflowLearnings(workflowId, context);
        // Select optimal provider based on history
        const provider = await selectOptimalProvider(workflowId, state, history, context);
        // Initialize workflow state
        const enhancedState = {
            ...state,
            startTime: Date.now(),
            provider,
            learnings: learnings.slice(-10), // Last 10 learnings
            predictions: await generateWorkflowPredictions(workflowId, state, context),
        };
        // Store workflow session
        sideEffects.push({
            type: 'memory',
            action: 'store',
            data: {
                key: `workflow:session:${workflowId}:${context.sessionId}`,
                value: enhancedState,
                ttl: 86400, // 24 hours
            },
        });
        // Track workflow start
        sideEffects.push({
            type: 'metric',
            action: 'increment',
            data: { name: `workflow.starts.${workflowId}` },
        });
        return {
            continue: true,
            modified: true,
            payload: {
                ...payload,
                state: enhancedState,
            },
            sideEffects,
        };
    },
};
// ===== Workflow Step Hook =====
exports.workflowStepHook = {
    id: 'agentic-workflow-step',
    type: 'workflow-step',
    priority: 100,
    handler: async (payload, context) => {
        const { workflowId, step, state } = payload;
        if (!step) {
            return { continue: true };
        }
        const sideEffects = [];
        // Measure step performance
        const stepStart = Date.now();
        // Check for step optimizations
        const optimizations = await getStepOptimizations(workflowId, step, context);
        if (optimizations.length > 0) {
            // Apply step optimizations
            const optimizedState = applyStepOptimizations(state, optimizations);
            sideEffects.push({
                type: 'log',
                action: 'write',
                data: {
                    level: 'info',
                    message: `Applied ${optimizations.length} optimizations to step ${step}`,
                    data: { optimizations },
                },
            });
            return {
                continue: true,
                modified: true,
                payload: {
                    ...payload,
                    state: optimizedState,
                },
                sideEffects,
            };
        }
        // Track step execution
        sideEffects.push({
            type: 'memory',
            action: 'store',
            data: {
                key: `workflow:step:${workflowId}:${step}:${Date.now()}`,
                value: {
                    step,
                    state: summarizeState(state),
                    timestamp: Date.now(),
                },
                ttl: 86400,
            },
        });
        return {
            continue: true,
            sideEffects,
        };
    },
};
// ===== Workflow Decision Hook =====
exports.workflowDecisionHook = {
    id: 'agentic-workflow-decision',
    type: 'workflow-decision',
    priority: 90,
    handler: async (payload, context) => {
        const { workflowId, decision, state } = payload;
        if (!decision) {
            return { continue: true };
        }
        const sideEffects = [];
        // Enhance decision with historical data
        const historicalOutcomes = await getDecisionOutcomes(workflowId, decision.point, context);
        // Calculate confidence adjustments
        const adjustedDecision = adjustDecisionConfidence(decision, historicalOutcomes);
        // Generate alternative paths
        const alternatives = await generateAlternativeDecisions(workflowId, decision, state, context);
        if (alternatives.length > 0) {
            // Check if better alternative exists
            const bestAlternative = alternatives.find(alt => alt.confidence > adjustedDecision.confidence * 1.2);
            if (bestAlternative) {
                sideEffects.push({
                    type: 'notification',
                    action: 'emit',
                    data: {
                        event: 'workflow:decision:alternative',
                        data: {
                            original: adjustedDecision,
                            suggested: bestAlternative,
                        },
                    },
                });
                // Override with better decision
                adjustedDecision.selected = bestAlternative.selected;
                adjustedDecision.confidence = bestAlternative.confidence;
                adjustedDecision.reasoning = `${adjustedDecision.reasoning} (AI-optimized)`;
            }
        }
        // Store decision for learning
        sideEffects.push({
            type: 'memory',
            action: 'store',
            data: {
                key: `decision:${workflowId}:${decision.point}:${Date.now()}`,
                value: {
                    ...adjustedDecision,
                    alternatives,
                    state: summarizeState(state),
                },
                ttl: 604800, // 7 days
            },
        });
        // Track decision metrics
        sideEffects.push({
            type: 'metric',
            action: 'update',
            data: {
                name: `workflow.decisions.confidence.${workflowId}`,
                value: adjustedDecision.confidence,
            },
        });
        return {
            continue: true,
            modified: true,
            payload: {
                ...payload,
                decision: adjustedDecision,
            },
            sideEffects,
        };
    },
};
// ===== Workflow Complete Hook =====
exports.workflowCompleteHook = {
    id: 'agentic-workflow-complete',
    type: 'workflow-complete',
    priority: 100,
    handler: async (payload, context) => {
        const { workflowId, state, metrics } = payload;
        const sideEffects = [];
        // Calculate workflow performance
        const performance = calculateWorkflowPerformance(state, metrics);
        // Extract learnings from this execution
        const learnings = await extractWorkflowLearnings(workflowId, state, performance, context);
        // Store learnings
        for (const learning of learnings) {
            sideEffects.push({
                type: 'memory',
                action: 'store',
                data: {
                    key: `learning:${workflowId}:${learning.type}:${Date.now()}`,
                    value: learning,
                    ttl: 0, // Permanent
                },
            });
        }
        // Update workflow success patterns
        if (performance.success) {
            const pattern = {
                id: `workflow_success_${Date.now()}`,
                type: 'success',
                confidence: performance.score,
                occurrences: 1,
                context: {
                    workflowId,
                    provider: state.provider,
                    duration: metrics?.duration || 0,
                    decisions: countDecisions(state),
                },
            };
            context.neural.patterns.add(pattern);
            sideEffects.push({
                type: 'neural',
                action: 'train',
                data: {
                    patterns: [pattern],
                    modelId: `workflow-optimizer-${workflowId}`,
                },
            });
        }
        // Generate improvement suggestions
        const improvements = await generateImprovementSuggestions(workflowId, state, performance, learnings, context);
        if (improvements.length > 0) {
            sideEffects.push({
                type: 'notification',
                action: 'emit',
                data: {
                    event: 'workflow:improvements:suggested',
                    data: {
                        workflowId,
                        improvements,
                        performance,
                    },
                },
            });
        }
        // Update workflow metrics
        sideEffects.push({
            type: 'metric',
            action: 'update',
            data: {
                name: `workflow.completion.rate.${workflowId}`,
                value: performance.success ? 1 : 0,
            },
        }, {
            type: 'metric',
            action: 'update',
            data: {
                name: `workflow.performance.score.${workflowId}`,
                value: performance.score,
            },
        });
        return {
            continue: true,
            sideEffects,
        };
    },
};
// ===== Workflow Error Hook =====
exports.workflowErrorHook = {
    id: 'agentic-workflow-error',
    type: 'workflow-error',
    priority: 95,
    handler: async (payload, context) => {
        const { workflowId, error, state } = payload;
        if (!error) {
            return { continue: true };
        }
        const sideEffects = [];
        // Analyze error pattern
        const errorPattern = await analyzeErrorPattern(workflowId, error, state, context);
        // Store error for learning
        sideEffects.push({
            type: 'memory',
            action: 'store',
            data: {
                key: `error:${workflowId}:${Date.now()}`,
                value: {
                    error: {
                        message: error.message,
                        stack: error.stack,
                        type: error.name,
                    },
                    pattern: errorPattern,
                    state: summarizeState(state),
                    timestamp: Date.now(),
                },
                ttl: 604800, // 7 days
            },
        });
        // Check for recovery strategies
        const recovery = await findRecoveryStrategy(workflowId, error, errorPattern, context);
        if (recovery) {
            sideEffects.push({
                type: 'log',
                action: 'write',
                data: {
                    level: 'info',
                    message: 'Recovery strategy found',
                    data: recovery,
                },
            });
            // Apply recovery
            const recoveredState = applyRecoveryStrategy(state, recovery);
            return {
                continue: true,
                modified: true,
                payload: {
                    ...payload,
                    state: recoveredState,
                    error: undefined, // Clear error after recovery
                },
                sideEffects,
            };
        }
        // Learn from failure
        const failureLearning = {
            type: 'failure',
            context: `Error in workflow ${workflowId}: ${error.message}`,
            value: {
                errorType: error.name,
                state: summarizeState(state),
                pattern: errorPattern,
            },
            applicability: errorPattern.confidence,
        };
        sideEffects.push({
            type: 'memory',
            action: 'store',
            data: {
                key: `learning:failure:${workflowId}:${Date.now()}`,
                value: failureLearning,
                ttl: 0, // Permanent
            },
        });
        return {
            continue: true,
            sideEffects,
        };
    },
};
// ===== Helper Functions =====
async function loadWorkflowHistory(workflowId, context) {
    const historyKey = `workflow:history:${workflowId}`;
    return await context.memory.cache.get(historyKey) || [];
}
async function loadWorkflowLearnings(workflowId, context) {
    const learningsKey = `workflow:learnings:${workflowId}`;
    return await context.memory.cache.get(learningsKey) || [];
}
async function selectOptimalProvider(workflowId, state, history, context) {
    // Analyze historical performance by provider
    const providerStats = new Map();
    for (const execution of history) {
        const provider = execution.provider;
        if (!provider)
            continue;
        const stats = providerStats.get(provider) || { success: 0, total: 0 };
        stats.total++;
        if (execution.success)
            stats.success++;
        providerStats.set(provider, stats);
    }
    // Calculate success rates
    let bestProvider = 'openai'; // Default
    let bestRate = 0;
    for (const [provider, stats] of providerStats) {
        const rate = stats.success / stats.total;
        if (rate > bestRate && stats.total >= 5) {
            bestRate = rate;
            bestProvider = provider;
        }
    }
    // Check current provider health
    const healthKey = `provider:health:${bestProvider}`;
    const health = await context.memory.cache.get(healthKey);
    if (health && health.score < 0.5) {
        // Provider unhealthy, select alternative
        return selectAlternativeProvider(bestProvider, providerStats);
    }
    return bestProvider;
}
async function generateWorkflowPredictions(workflowId, state, context) {
    // Generate predictions for workflow execution
    const predictions = {
        estimatedDuration: 0,
        successProbability: 0.7,
        likelyBottlenecks: [],
        recommendedOptimizations: [],
    };
    // Load historical durations
    const history = await loadWorkflowHistory(workflowId, context);
    if (history.length > 0) {
        const durations = history
            .filter(h => h.duration)
            .map(h => h.duration);
        if (durations.length > 0) {
            predictions.estimatedDuration =
                durations.reduce((a, b) => a + b, 0) / durations.length;
        }
        const successes = history.filter(h => h.success).length;
        predictions.successProbability = successes / history.length;
    }
    return predictions;
}
async function getStepOptimizations(workflowId, step, context) {
    // Get optimizations for specific step
    const optKey = `optimizations:${workflowId}:${step}`;
    return await context.memory.cache.get(optKey) || [];
}
function applyStepOptimizations(state, optimizations) {
    let optimizedState = { ...state };
    for (const opt of optimizations) {
        switch (opt.type) {
            case 'skip':
                if (opt.condition && opt.condition(state)) {
                    optimizedState.skipSteps = [
                        ...(optimizedState.skipSteps || []),
                        opt.target,
                    ];
                }
                break;
            case 'parallel':
                optimizedState.parallelSteps = [
                    ...(optimizedState.parallelSteps || []),
                    ...opt.steps,
                ];
                break;
            case 'cache':
                optimizedState.useCache = true;
                optimizedState.cacheKeys = [
                    ...(optimizedState.cacheKeys || []),
                    opt.key,
                ];
                break;
        }
    }
    return optimizedState;
}
function summarizeState(state) {
    // Create summary of state for storage
    return {
        keys: Object.keys(state),
        size: JSON.stringify(state).length,
        hasError: !!state.error,
        provider: state.provider,
        timestamp: Date.now(),
    };
}
async function getDecisionOutcomes(workflowId, decisionPoint, context) {
    // Get historical outcomes for decision point
    const outcomeKey = `outcomes:${workflowId}:${decisionPoint}`;
    return await context.memory.cache.get(outcomeKey) || [];
}
function adjustDecisionConfidence(decision, historicalOutcomes) {
    if (historicalOutcomes.length === 0) {
        return decision;
    }
    // Calculate success rate for selected option
    const relevantOutcomes = historicalOutcomes.filter(o => o.selected === decision.selected);
    if (relevantOutcomes.length === 0) {
        return decision;
    }
    const successRate = relevantOutcomes.filter(o => o.success).length /
        relevantOutcomes.length;
    // Adjust confidence based on historical success
    const adjustedConfidence = decision.confidence * 0.7 + successRate * 0.3;
    return {
        ...decision,
        confidence: adjustedConfidence,
        learnings: [
            ...decision.learnings,
            {
                type: 'success',
                context: `Historical success rate: ${(successRate * 100).toFixed(1)}%`,
                value: successRate,
                applicability: Math.min(relevantOutcomes.length / 10, 1),
            },
        ],
    };
}
async function generateAlternativeDecisions(workflowId, decision, state, context) {
    // Generate alternative decision paths
    const alternatives = [];
    // Check each option not selected
    for (const option of decision.options) {
        if (option === decision.selected)
            continue;
        // Calculate alternative confidence
        const altConfidence = await calculateAlternativeConfidence(workflowId, decision.point, option, state, context);
        if (altConfidence > 0.5) {
            alternatives.push({
                ...decision,
                selected: option,
                confidence: altConfidence,
                reasoning: `Alternative path based on historical analysis`,
            });
        }
    }
    return alternatives;
}
function calculateWorkflowPerformance(state, metrics) {
    const performance = {
        success: !state.error,
        score: 0,
        duration: metrics?.duration || 0,
        efficiency: 0,
        reliability: 0,
    };
    // Calculate performance score
    if (performance.success) {
        performance.score = 0.7; // Base success score
        // Adjust for duration
        if (metrics?.duration && state.predictions?.estimatedDuration) {
            const durationRatio = state.predictions.estimatedDuration / metrics.duration;
            performance.efficiency = Math.min(durationRatio, 1);
            performance.score += performance.efficiency * 0.2;
        }
        // Adjust for error rate
        if (metrics?.errorRate !== undefined) {
            performance.reliability = 1 - metrics.errorRate;
            performance.score += performance.reliability * 0.1;
        }
    }
    return performance;
}
async function extractWorkflowLearnings(workflowId, state, performance, context) {
    const learnings = [];
    // Learn from successful execution
    if (performance.success) {
        learnings.push({
            type: 'success',
            context: `Successful workflow execution with score ${performance.score}`,
            value: {
                provider: state.provider,
                duration: performance.duration,
                decisions: extractDecisions(state),
            },
            applicability: performance.score,
        });
    }
    // Learn from optimizations
    if (state.appliedOptimizations) {
        for (const opt of state.appliedOptimizations) {
            learnings.push({
                type: 'optimization',
                context: `Applied ${opt.type} optimization at ${opt.step}`,
                value: opt,
                applicability: 0.8,
            });
        }
    }
    return learnings;
}
function countDecisions(state) {
    // Count decisions made during workflow
    return state.decisions?.length || 0;
}
async function generateImprovementSuggestions(workflowId, state, performance, learnings, context) {
    const suggestions = [];
    // Suggest caching if repeated operations
    if (performance.duration > 5000) {
        suggestions.push({
            type: 'cache',
            target: 'frequent_operations',
            reason: 'Long execution time detected',
            expectedImprovement: '30-50% reduction in duration',
        });
    }
    // Suggest parallelization
    if (state.sequentialSteps?.length > 3) {
        suggestions.push({
            type: 'parallel',
            target: 'independent_steps',
            reason: 'Multiple sequential steps detected',
            expectedImprovement: '40-60% reduction in duration',
        });
    }
    // Suggest provider switch based on learnings
    const providerLearnings = learnings.filter(l => l.type === 'success' && l.value.provider);
    if (providerLearnings.length > 0) {
        const providerScores = new Map();
        for (const learning of providerLearnings) {
            const provider = learning.value.provider;
            const score = providerScores.get(provider) || 0;
            providerScores.set(provider, score + learning.applicability);
        }
        const currentScore = providerScores.get(state.provider) || 0;
        for (const [provider, score] of providerScores) {
            if (score > currentScore * 1.2) {
                suggestions.push({
                    type: 'provider',
                    target: provider,
                    reason: `${provider} shows better historical performance`,
                    expectedImprovement: `${((score / currentScore - 1) * 100).toFixed(0)}% better reliability`,
                });
            }
        }
    }
    return suggestions;
}
async function analyzeErrorPattern(workflowId, error, state, context) {
    // Analyze error to find patterns
    const pattern = {
        type: classifyError(error),
        confidence: 0.7,
        context: {
            step: state.currentStep,
            provider: state.provider,
            errorMessage: error.message,
        },
    };
    // Check for similar errors
    const errorHistory = await context.memory.cache.get(`errors:${workflowId}:${pattern.type}`) || [];
    if (errorHistory.length > 5) {
        pattern.confidence = 0.9;
        pattern.context.recurring = true;
        pattern.context.occurrences = errorHistory.length;
    }
    return pattern;
}
async function findRecoveryStrategy(workflowId, error, errorPattern, context) {
    // Find recovery strategy for error
    if (errorPattern.type === 'timeout') {
        return {
            type: 'retry',
            params: {
                maxRetries: 3,
                backoff: 'exponential',
                timeout: 30000,
            },
        };
    }
    if (errorPattern.type === 'rate_limit') {
        return {
            type: 'throttle',
            params: {
                delay: 1000,
                maxConcurrent: 1,
            },
        };
    }
    if (errorPattern.type === 'validation') {
        return {
            type: 'transform',
            params: {
                sanitize: true,
                validate: true,
            },
        };
    }
    return null;
}
function applyRecoveryStrategy(state, recovery) {
    const recoveredState = { ...state };
    switch (recovery.type) {
        case 'retry':
            recoveredState.retryConfig = recovery.params;
            recoveredState.shouldRetry = true;
            break;
        case 'throttle':
            recoveredState.throttleConfig = recovery.params;
            recoveredState.throttled = true;
            break;
        case 'transform':
            recoveredState.transformConfig = recovery.params;
            recoveredState.needsTransform = true;
            break;
    }
    recoveredState.recoveryApplied = recovery;
    delete recoveredState.error; // Clear error state
    return recoveredState;
}
function selectAlternativeProvider(currentProvider, providerStats) {
    // Select alternative provider based on stats
    let bestAlternative = 'anthropic'; // Default fallback
    let bestRate = 0;
    for (const [provider, stats] of providerStats) {
        if (provider === currentProvider)
            continue;
        const rate = stats.success / stats.total;
        if (rate > bestRate && stats.total >= 3) {
            bestRate = rate;
            bestAlternative = provider;
        }
    }
    return bestAlternative;
}
async function calculateAlternativeConfidence(workflowId, decisionPoint, option, state, context) {
    // Calculate confidence for alternative option
    const outcomeKey = `outcomes:${workflowId}:${decisionPoint}:${option}`;
    const outcomes = await context.memory.cache.get(outcomeKey) || [];
    if (outcomes.length === 0) {
        return 0.5; // Default confidence
    }
    const successRate = outcomes.filter((o) => o.success).length /
        outcomes.length;
    // Adjust for recency
    const recentOutcomes = outcomes.slice(-10);
    const recentSuccessRate = recentOutcomes.filter((o) => o.success).length /
        recentOutcomes.length;
    return successRate * 0.7 + recentSuccessRate * 0.3;
}
function extractDecisions(state) {
    // Extract decisions from state
    return state.decisions || [];
}
function classifyError(error) {
    const message = error.message.toLowerCase();
    if (message.includes('timeout'))
        return 'timeout';
    if (message.includes('rate limit'))
        return 'rate_limit';
    if (message.includes('validation'))
        return 'validation';
    if (message.includes('network'))
        return 'network';
    if (message.includes('auth'))
        return 'authentication';
    return 'unknown';
}
// ===== Register Hooks =====
function registerWorkflowHooks() {
    hook_manager_js_1.agenticHookManager.register(exports.workflowStartHook);
    hook_manager_js_1.agenticHookManager.register(exports.workflowStepHook);
    hook_manager_js_1.agenticHookManager.register(exports.workflowDecisionHook);
    hook_manager_js_1.agenticHookManager.register(exports.workflowCompleteHook);
    hook_manager_js_1.agenticHookManager.register(exports.workflowErrorHook);
}
//# sourceMappingURL=workflow-hooks.js.map