"use strict";
/**
 * SpecAnalyzer - Analyze metrics against specification expectations
 *
 * Detects performance bottlenecks, error patterns, and coverage gaps
 * Outputs structured improvement suggestions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecAnalyzer = void 0;
const events_1 = require("events");
/**
 * SpecAnalyzer class for analyzing metrics against specifications
 */
class SpecAnalyzer extends events_1.EventEmitter {
    config;
    metricsCollector;
    expectations = new Map();
    analysisHistory = [];
    analysisTimer;
    isRunning = false;
    constructor(metricsCollector, config = {}) {
        super();
        this.metricsCollector = metricsCollector;
        this.config = {
            defaultExpectations: config.defaultExpectations || this.getDefaultExpectations(),
            analysisInterval: config.analysisInterval || 300000, // 5 minutes
            bottleneckThreshold: config.bottleneckThreshold || 20, // 20% above expected
            errorPatternMinOccurrences: config.errorPatternMinOccurrences || 3,
            coverageMinimum: config.coverageMinimum || 80,
            trendLookbackDays: config.trendLookbackDays || 7,
        };
        // Load default expectations
        for (const expectation of this.config.defaultExpectations) {
            this.expectations.set(expectation.id, expectation);
        }
    }
    /**
     * Get default expectations
     */
    getDefaultExpectations() {
        return [
            {
                id: 'default-error-rate',
                specId: 'default',
                type: 'reliability',
                metric: 'error_rate',
                operator: 'lt',
                value: 5, // Less than 5%
                unit: 'percent',
                priority: 'high',
                description: 'Error rate should be below 5%',
            },
            {
                id: 'default-response-time',
                specId: 'default',
                type: 'performance',
                metric: 'response_time',
                operator: 'lt',
                value: 1000, // Less than 1000ms
                unit: 'ms',
                priority: 'medium',
                description: 'Response time should be below 1 second',
            },
            {
                id: 'default-test-coverage',
                specId: 'default',
                type: 'coverage',
                metric: 'test_coverage',
                operator: 'gte',
                value: 80, // At least 80%
                unit: 'percent',
                priority: 'medium',
                description: 'Test coverage should be at least 80%',
            },
            {
                id: 'default-test-pass-rate',
                specId: 'default',
                type: 'quality',
                metric: 'test_pass_rate',
                operator: 'gte',
                value: 100, // 100% tests passing
                unit: 'percent',
                priority: 'critical',
                description: 'All tests should pass',
            },
        ];
    }
    /**
     * Add a spec expectation
     */
    addExpectation(expectation) {
        this.expectations.set(expectation.id, expectation);
    }
    /**
     * Remove a spec expectation
     */
    removeExpectation(expectationId) {
        return this.expectations.delete(expectationId);
    }
    /**
     * Get all expectations for a spec
     */
    getExpectations(specId) {
        const all = Array.from(this.expectations.values());
        if (!specId)
            return all;
        return all.filter(e => e.specId === specId || e.specId === 'default');
    }
    /**
     * Start continuous analysis
     */
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.analysisTimer = setInterval(async () => {
            try {
                await this.analyze();
            }
            catch (error) {
                this.emit('error', error);
            }
        }, this.config.analysisInterval);
    }
    /**
     * Stop continuous analysis
     */
    stop() {
        if (this.analysisTimer) {
            clearInterval(this.analysisTimer);
        }
        this.isRunning = false;
    }
    /**
     * Perform analysis
     */
    async analyze(specId) {
        this.emit('analysis:started', { specId });
        const result = {
            id: this.generateId(),
            timestamp: new Date(),
            specId,
            expectations: [],
            bottlenecks: [],
            errorPatterns: [],
            coverageGaps: [],
            overallScore: 100,
            status: 'passing',
        };
        // Analyze expectations
        const expectations = this.getExpectations(specId);
        for (const expectation of expectations) {
            const expResult = await this.evaluateExpectation(expectation);
            result.expectations.push(expResult);
            if (!expResult.passed) {
                result.overallScore -= this.getPriorityWeight(expectation.priority);
            }
        }
        // Detect bottlenecks
        result.bottlenecks = await this.detectBottlenecks(specId);
        for (const bottleneck of result.bottlenecks) {
            this.emit('bottleneck:detected', bottleneck);
            result.overallScore -= this.getSeverityWeight(bottleneck.severity);
        }
        // Detect error patterns
        result.errorPatterns = await this.detectErrorPatterns(specId);
        for (const pattern of result.errorPatterns) {
            this.emit('error_pattern:detected', pattern);
            result.overallScore -= this.getSeverityWeight(pattern.severity);
        }
        // Detect coverage gaps
        result.coverageGaps = await this.detectCoverageGaps(specId);
        for (const gap of result.coverageGaps) {
            this.emit('coverage_gap:detected', gap);
            result.overallScore -= this.getPriorityWeight(gap.priority);
        }
        // Ensure score is between 0 and 100
        result.overallScore = Math.max(0, Math.min(100, result.overallScore));
        // Determine overall status
        if (result.overallScore >= 90) {
            result.status = 'passing';
        }
        else if (result.overallScore >= 70) {
            result.status = 'warning';
        }
        else {
            result.status = 'failing';
        }
        // Store in history
        this.analysisHistory.push(result);
        if (this.analysisHistory.length > 100) {
            this.analysisHistory.shift();
        }
        this.emit('analysis:completed', result);
        return result;
    }
    /**
     * Evaluate a single expectation
     */
    async evaluateExpectation(expectation) {
        const metrics = await this.metricsCollector.getMetrics({
            specId: expectation.specId !== 'default' ? expectation.specId : undefined,
            storyId: expectation.storyId,
            limit: 100,
        });
        // Find relevant metrics
        const relevantMetrics = metrics.filter(m => m.name.includes(expectation.metric) && typeof m.value === 'number');
        // Calculate actual value (average of recent metrics)
        const values = relevantMetrics.map(m => m.value);
        const actual = values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : 0;
        // Evaluate against expectation
        const passed = this.evaluateOperator(actual, expectation.operator, expectation.value, expectation.maxValue);
        // Calculate deviation
        let deviation = 0;
        if (expectation.value !== 0) {
            deviation = ((actual - expectation.value) / expectation.value) * 100;
        }
        // Get trend analysis
        let trend;
        try {
            const metricType = this.getMetricType(expectation.type);
            trend = await this.metricsCollector.analyzeTrends(metricType, expectation.metric, { period: 'day', lookbackPeriods: this.config.trendLookbackDays });
        }
        catch (e) {
            // Trend analysis may fail if not enough data
        }
        return {
            expectation,
            actual,
            passed,
            deviation,
            trend,
        };
    }
    /**
     * Evaluate operator condition
     */
    evaluateOperator(actual, operator, expected, maxValue) {
        switch (operator) {
            case 'lt': return actual < expected;
            case 'lte': return actual <= expected;
            case 'gt': return actual > expected;
            case 'gte': return actual >= expected;
            case 'eq': return actual === expected;
            case 'between':
                return actual >= expected && actual <= (maxValue || expected);
            default: return false;
        }
    }
    /**
     * Detect performance bottlenecks
     */
    async detectBottlenecks(specId) {
        const bottlenecks = [];
        const performanceMetrics = await this.metricsCollector.getMetrics({
            type: 'performance',
            specId,
            startTime: new Date(Date.now() - 86400000), // Last 24 hours
        });
        // Group by metric name
        const grouped = new Map();
        for (const metric of performanceMetrics) {
            const existing = grouped.get(metric.name) || [];
            existing.push(metric);
            grouped.set(metric.name, existing);
        }
        // Analyze each metric group
        for (const [name, metrics] of grouped) {
            const values = metrics
                .filter(m => typeof m.value === 'number')
                .map(m => m.value);
            if (values.length < 5)
                continue;
            const average = values.reduce((a, b) => a + b, 0) / values.length;
            const p95 = this.percentile(values, 95);
            const p99 = this.percentile(values, 99);
            // Check for high variance (potential bottleneck)
            const variance = values.reduce((sum, v) => sum + Math.pow(v - average, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            const cv = stdDev / average; // Coefficient of variation
            if (cv > 0.5 || p99 > average * 2) {
                bottlenecks.push({
                    id: this.generateId(),
                    type: 'performance',
                    location: name,
                    severity: p99 > average * 3 ? 'critical' : p99 > average * 2 ? 'high' : 'medium',
                    metric: name,
                    currentValue: p95,
                    expectedValue: average,
                    impact: `High variance in ${name}: p95=${p95.toFixed(2)}, p99=${p99.toFixed(2)}, avg=${average.toFixed(2)}`,
                    suggestedFix: this.suggestPerformanceFix(name, cv),
                });
            }
        }
        return bottlenecks;
    }
    /**
     * Detect error patterns
     */
    async detectErrorPatterns(specId) {
        const patterns = [];
        const errorMetrics = await this.metricsCollector.getMetrics({
            type: 'error',
            specId,
            startTime: new Date(Date.now() - 604800000), // Last 7 days
        });
        // Group errors by message pattern
        const errorGroups = new Map();
        for (const error of errorMetrics) {
            const message = String(error.metadata?.message || error.name || 'unknown');
            const pattern = this.normalizeErrorMessage(message);
            const existing = errorGroups.get(pattern) || [];
            existing.push(error);
            errorGroups.set(pattern, existing);
        }
        // Identify significant patterns
        for (const [pattern, errors] of errorGroups) {
            if (errors.length < this.config.errorPatternMinOccurrences)
                continue;
            const sortedByTime = errors.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            const affectedSpecs = [...new Set(errors.filter(e => e.specId).map(e => e.specId))];
            const affectedStories = [...new Set(errors.filter(e => e.storyId).map(e => e.storyId))];
            patterns.push({
                id: this.generateId(),
                pattern,
                frequency: errors.length,
                firstOccurrence: sortedByTime[0].timestamp,
                lastOccurrence: sortedByTime[sortedByTime.length - 1].timestamp,
                affectedSpecs,
                affectedStories,
                severity: this.determineErrorSeverity(errors),
                rootCause: this.inferRootCause(pattern, errors),
                suggestedFix: this.suggestErrorFix(pattern),
            });
        }
        return patterns.sort((a, b) => b.frequency - a.frequency);
    }
    /**
     * Detect coverage gaps
     */
    async detectCoverageGaps(specId) {
        const gaps = [];
        const testResults = await this.metricsCollector.getMetrics({
            type: 'test_result',
            specId,
            startTime: new Date(Date.now() - 604800000), // Last 7 days
        });
        const coverageMetrics = await this.metricsCollector.getMetrics({
            type: 'coverage',
            specId,
            limit: 10,
        });
        // Check overall coverage
        if (coverageMetrics.length > 0) {
            const latestCoverage = coverageMetrics[0];
            const coverage = typeof latestCoverage.value === 'number'
                ? latestCoverage.value
                : 0;
            if (coverage < this.config.coverageMinimum) {
                gaps.push({
                    id: this.generateId(),
                    specId: specId || 'all',
                    type: 'test',
                    description: `Test coverage (${coverage.toFixed(1)}%) is below minimum (${this.config.coverageMinimum}%)`,
                    priority: coverage < 50 ? 'critical' : coverage < 70 ? 'high' : 'medium',
                    suggestedTests: [
                        'Add unit tests for uncovered functions',
                        'Add integration tests for critical paths',
                        'Add edge case tests',
                    ],
                });
            }
        }
        // Check for untested specs/stories
        const specsWithTests = new Set(testResults.filter(t => t.specId).map(t => t.specId));
        const allSpecs = new Set((await this.metricsCollector.getMetrics({ limit: 1000 }))
            .filter(m => m.specId)
            .map(m => m.specId));
        for (const spec of allSpecs) {
            if (!specsWithTests.has(spec)) {
                gaps.push({
                    id: this.generateId(),
                    specId: spec,
                    type: 'test',
                    description: `Spec "${spec}" has no test coverage`,
                    priority: 'high',
                    suggestedTests: [
                        `Create test suite for spec ${spec}`,
                        'Add acceptance tests for all user stories',
                    ],
                });
            }
        }
        // Check for failed tests indicating missing edge cases
        const failedTests = testResults.filter(t => t.tags?.includes('failed') || t.value === 0);
        const failedBySpec = new Map();
        for (const test of failedTests) {
            const spec = test.specId || 'unknown';
            const existing = failedBySpec.get(spec) || [];
            existing.push(test);
            failedBySpec.set(spec, existing);
        }
        for (const [spec, failures] of failedBySpec) {
            if (failures.length >= 3) {
                gaps.push({
                    id: this.generateId(),
                    specId: spec,
                    type: 'edge_case',
                    description: `Multiple test failures (${failures.length}) in spec "${spec}" suggest missing edge case handling`,
                    priority: 'medium',
                    suggestedTests: failures.map(f => `Review and fix: ${f.name}`).slice(0, 5),
                });
            }
        }
        return gaps;
    }
    /**
     * Generate recommendations based on analysis
     */
    async generateRecommendations(analysis) {
        const result = analysis || await this.analyze();
        const recommendations = [];
        // Generate recommendations from failed expectations
        for (const expResult of result.expectations) {
            if (!expResult.passed) {
                recommendations.push(this.createExpectationRecommendation(expResult));
            }
        }
        // Generate recommendations from bottlenecks
        for (const bottleneck of result.bottlenecks) {
            recommendations.push(this.createBottleneckRecommendation(bottleneck));
        }
        // Generate recommendations from error patterns
        for (const pattern of result.errorPatterns) {
            recommendations.push(this.createErrorPatternRecommendation(pattern));
        }
        // Generate recommendations from coverage gaps
        for (const gap of result.coverageGaps) {
            recommendations.push(this.createCoverageGapRecommendation(gap));
        }
        // Emit recommendations
        for (const rec of recommendations) {
            this.emit('recommendation:generated', rec);
        }
        return recommendations.sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));
    }
    /**
     * Prioritize changes based on recommendations
     */
    async prioritizeChanges(recommendations) {
        const recs = recommendations || await this.generateRecommendations();
        const changes = [];
        for (const rec of recs) {
            const score = this.calculateChangeScore(rec);
            changes.push({
                id: this.generateId(),
                recommendation: rec,
                score,
                dependencies: this.identifyDependencies(rec, recs),
                blockedBy: [],
            });
        }
        // Identify blocking relationships
        for (const change of changes) {
            for (const dep of change.dependencies) {
                const blocker = changes.find(c => c.recommendation.id === dep);
                if (blocker) {
                    change.blockedBy.push(blocker.id);
                }
            }
        }
        // Sort by score (highest first), respecting dependencies
        return this.topologicalSort(changes);
    }
    /**
     * Get analysis history
     */
    getHistory(limit = 10) {
        return this.analysisHistory.slice(-limit);
    }
    /**
     * Get latest analysis
     */
    getLatestAnalysis() {
        return this.analysisHistory[this.analysisHistory.length - 1] || null;
    }
    // Helper methods
    normalizeErrorMessage(message) {
        // Remove variable parts like IDs, timestamps, etc.
        return message
            .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<UUID>')
            .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '<TIMESTAMP>')
            .replace(/\d+/g, '<NUMBER>')
            .substring(0, 100);
    }
    determineErrorSeverity(errors) {
        const hasCritical = errors.some(e => e.metadata?.severity === 'critical');
        if (hasCritical)
            return 'critical';
        const frequency = errors.length;
        if (frequency > 100)
            return 'critical';
        if (frequency > 50)
            return 'high';
        if (frequency > 10)
            return 'medium';
        return 'low';
    }
    inferRootCause(pattern, errors) {
        if (pattern.includes('timeout') || pattern.includes('ETIMEDOUT')) {
            return 'Network or resource timeout - check external service availability';
        }
        if (pattern.includes('null') || pattern.includes('undefined')) {
            return 'Null reference - missing null checks or data validation';
        }
        if (pattern.includes('permission') || pattern.includes('EACCES')) {
            return 'Permission issue - check file/resource permissions';
        }
        if (pattern.includes('memory') || pattern.includes('heap')) {
            return 'Memory issue - possible memory leak or large data processing';
        }
        return undefined;
    }
    suggestErrorFix(pattern) {
        if (pattern.includes('timeout')) {
            return 'Implement retry logic with exponential backoff, add circuit breaker';
        }
        if (pattern.includes('null')) {
            return 'Add input validation, implement Optional/Maybe patterns';
        }
        if (pattern.includes('permission')) {
            return 'Review and update file/resource permissions';
        }
        return 'Review error handling and add appropriate recovery logic';
    }
    suggestPerformanceFix(metric, cv) {
        if (cv > 1) {
            return 'High variance suggests inconsistent performance. Consider caching, connection pooling, or async processing.';
        }
        if (metric.includes('database') || metric.includes('db')) {
            return 'Optimize database queries, add indexes, consider query caching.';
        }
        if (metric.includes('api') || metric.includes('request')) {
            return 'Implement request batching, caching, or connection pooling.';
        }
        return 'Profile the operation to identify specific bottlenecks.';
    }
    getMetricType(expectationType) {
        switch (expectationType) {
            case 'performance': return 'performance';
            case 'reliability': return 'error';
            case 'coverage': return 'coverage';
            case 'quality': return 'test_result';
            default: return 'performance';
        }
    }
    getPriorityWeight(priority) {
        switch (priority) {
            case 'critical': return 25;
            case 'high': return 15;
            case 'medium': return 8;
            case 'low': return 3;
            default: return 5;
        }
    }
    getSeverityWeight(severity) {
        return this.getPriorityWeight(severity);
    }
    percentile(values, p) {
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil((p / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }
    createExpectationRecommendation(expResult) {
        const exp = expResult.expectation;
        return {
            id: this.generateId(),
            type: exp.type === 'performance' ? 'performance' : exp.type === 'reliability' ? 'reliability' : 'quality',
            priority: exp.priority,
            title: `Fix failing expectation: ${exp.metric}`,
            description: `${exp.description || exp.metric} is not meeting expectations. Current: ${expResult.actual.toFixed(2)}, Expected: ${exp.operator} ${exp.value}`,
            impact: `${Math.abs(expResult.deviation).toFixed(1)}% deviation from expected value`,
            effort: Math.abs(expResult.deviation) > 50 ? 'high' : Math.abs(expResult.deviation) > 20 ? 'medium' : 'low',
            affectedSpecs: exp.specId !== 'default' ? [exp.specId] : [],
            suggestedActions: [
                `Review ${exp.metric} implementation`,
                `Add monitoring for ${exp.metric}`,
                `Set up alerts for threshold violations`,
            ],
            estimatedImprovement: Math.abs(expResult.deviation),
        };
    }
    createBottleneckRecommendation(bottleneck) {
        return {
            id: this.generateId(),
            type: 'performance',
            priority: bottleneck.severity,
            title: `Resolve bottleneck in ${bottleneck.location}`,
            description: bottleneck.impact,
            impact: `${((bottleneck.currentValue / bottleneck.expectedValue - 1) * 100).toFixed(1)}% above expected`,
            effort: bottleneck.severity === 'critical' ? 'high' : 'medium',
            affectedSpecs: [],
            suggestedActions: bottleneck.suggestedFix
                ? [bottleneck.suggestedFix]
                : ['Profile and optimize the identified bottleneck'],
        };
    }
    createErrorPatternRecommendation(pattern) {
        return {
            id: this.generateId(),
            type: 'reliability',
            priority: pattern.severity,
            title: `Fix recurring error pattern: ${pattern.pattern.substring(0, 50)}...`,
            description: `Error occurred ${pattern.frequency} times. ${pattern.rootCause || ''}`,
            impact: `Affects ${pattern.affectedSpecs.length} specs and ${pattern.affectedStories.length} stories`,
            effort: pattern.frequency > 50 ? 'high' : 'medium',
            affectedSpecs: pattern.affectedSpecs,
            suggestedActions: pattern.suggestedFix
                ? [pattern.suggestedFix, 'Add error handling tests']
                : ['Investigate root cause', 'Add error handling tests'],
        };
    }
    createCoverageGapRecommendation(gap) {
        return {
            id: this.generateId(),
            type: 'coverage',
            priority: gap.priority,
            title: `Address coverage gap: ${gap.description.substring(0, 50)}...`,
            description: gap.description,
            impact: `Missing ${gap.type} coverage for spec ${gap.specId}`,
            effort: gap.suggestedTests && gap.suggestedTests.length > 3 ? 'high' : 'medium',
            affectedSpecs: [gap.specId],
            suggestedActions: gap.suggestedTests || ['Add missing tests'],
        };
    }
    calculateChangeScore(rec) {
        const priorityScore = this.getPriorityWeight(rec.priority);
        const effortMultiplier = rec.effort === 'low' ? 1.5 : rec.effort === 'medium' ? 1.0 : 0.7;
        const improvementBonus = rec.estimatedImprovement ? rec.estimatedImprovement / 10 : 0;
        return (priorityScore * effortMultiplier) + improvementBonus;
    }
    identifyDependencies(rec, allRecs) {
        const deps = [];
        // Performance fixes might depend on reliability fixes
        if (rec.type === 'performance') {
            const reliabilityRecs = allRecs.filter(r => r.type === 'reliability' &&
                r.affectedSpecs.some(s => rec.affectedSpecs.includes(s)));
            deps.push(...reliabilityRecs.map(r => r.id));
        }
        // Coverage fixes might depend on quality fixes
        if (rec.type === 'coverage') {
            const qualityRecs = allRecs.filter(r => r.type === 'quality' &&
                r.priority === 'critical');
            deps.push(...qualityRecs.map(r => r.id));
        }
        return deps;
    }
    topologicalSort(changes) {
        const sorted = [];
        const visited = new Set();
        const temp = new Set();
        const visit = (change) => {
            if (temp.has(change.id))
                return; // Cycle detected, skip
            if (visited.has(change.id))
                return;
            temp.add(change.id);
            for (const depId of change.blockedBy) {
                const dep = changes.find(c => c.id === depId);
                if (dep)
                    visit(dep);
            }
            temp.delete(change.id);
            visited.add(change.id);
            sorted.push(change);
        };
        // Sort by score first, then topologically
        const byScore = [...changes].sort((a, b) => b.score - a.score);
        for (const change of byScore) {
            visit(change);
        }
        return sorted;
    }
    generateId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 11);
        return `analysis_${timestamp}_${random}`;
    }
}
exports.SpecAnalyzer = SpecAnalyzer;
exports.default = SpecAnalyzer;
//# sourceMappingURL=spec-analyzer.js.map