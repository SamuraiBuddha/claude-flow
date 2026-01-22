"use strict";
/**
 * MetricsCollector - Production metrics collection for spec-driven development
 *
 * Collects errors, performance data, user feedback, and test results
 * Stores in SQLite with timestamps for trend analysis
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollector = void 0;
const events_1 = require("events");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
/**
 * MetricsCollector class for production metrics collection
 */
class MetricsCollector extends events_1.EventEmitter {
    config;
    db; // SQLite database instance
    buffer = [];
    isInitialized = false;
    collectionTimer;
    flushTimer;
    metricCounts = new Map();
    constructor(config = {}) {
        super();
        this.config = {
            dbPath: config.dbPath || path_1.default.join(process.cwd(), 'data', 'metrics.db'),
            collectionInterval: config.collectionInterval || 60000, // 1 minute
            retentionDays: config.retentionDays || 90,
            batchSize: config.batchSize || 100,
            flushInterval: config.flushInterval || 5000, // 5 seconds
            enableAutoCollection: config.enableAutoCollection ?? true,
            thresholds: {
                errorRate: config.thresholds?.errorRate || 0.05, // 5%
                performanceDegradation: config.thresholds?.performanceDegradation || 0.2, // 20%
                coverageMinimum: config.thresholds?.coverageMinimum || 0.8, // 80%
            },
        };
    }
    /**
     * Initialize the metrics collector
     */
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            // Ensure data directory exists
            const dataDir = path_1.default.dirname(this.config.dbPath);
            await promises_1.default.mkdir(dataDir, { recursive: true });
            // Initialize database (in-memory if SQLite not available)
            await this.initializeDatabase();
            // Start auto-collection if enabled
            if (this.config.enableAutoCollection) {
                this.startAutoCollection();
            }
            // Start flush timer
            this.startFlushTimer();
            this.isInitialized = true;
            this.emit('initialized');
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Initialize the SQLite database
     */
    async initializeDatabase() {
        try {
            // Try to use SQLite
            const sqliteWrapper = await Promise.resolve().then(() => __importStar(require('../../../memory/sqlite-wrapper.js'))).catch(() => null);
            if (sqliteWrapper && await sqliteWrapper.isSQLiteAvailable()) {
                this.db = await sqliteWrapper.createDatabase(this.config.dbPath);
                await this.createTables();
            }
            else {
                // Fallback to in-memory storage
                console.warn('SQLite not available, using in-memory metrics storage');
                this.db = this.createInMemoryStore();
            }
        }
        catch (error) {
            console.warn('Failed to initialize SQLite, using in-memory storage:', error);
            this.db = this.createInMemoryStore();
        }
    }
    /**
     * Create in-memory store as fallback
     */
    createInMemoryStore() {
        const store = [];
        return {
            isInMemory: true,
            metrics: store,
            prepare: (sql) => ({
                run: (...args) => {
                    if (sql.includes('INSERT')) {
                        const metric = args[0];
                        store.push(metric);
                    }
                },
                all: (...args) => {
                    return store.filter(m => {
                        // Basic filtering for in-memory
                        return true;
                    });
                },
                get: (...args) => store.find(m => m.id === args[0])
            }),
            exec: () => { }
        };
    }
    /**
     * Create database tables
     */
    async createTables() {
        const schema = `
      CREATE TABLE IF NOT EXISTS metrics (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        value TEXT NOT NULL,
        unit TEXT,
        tags TEXT,
        metadata TEXT,
        timestamp TEXT NOT NULL,
        spec_id TEXT,
        story_id TEXT,
        task_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_metrics_type ON metrics(type);
      CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_metrics_spec_id ON metrics(spec_id);
      CREATE INDEX IF NOT EXISTS idx_metrics_story_id ON metrics(story_id);

      CREATE TABLE IF NOT EXISTS metric_aggregates (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        period TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        count INTEGER,
        sum REAL,
        avg REAL,
        min REAL,
        max REAL,
        std_dev REAL
      );

      CREATE INDEX IF NOT EXISTS idx_aggregates_period ON metric_aggregates(period, start_time);
    `;
        this.db.exec(schema);
    }
    /**
     * Record a metric
     */
    async recordMetric(type, name, value, options = {}) {
        const metric = {
            id: this.generateId(),
            type,
            name,
            value,
            unit: options.unit,
            tags: options.tags || [],
            metadata: options.metadata || {},
            timestamp: new Date(),
            specId: options.specId,
            storyId: options.storyId,
            taskId: options.taskId,
        };
        // Add to buffer
        this.buffer.push(metric);
        // Track metric counts
        this.metricCounts.set(type, (this.metricCounts.get(type) || 0) + 1);
        // Emit event
        this.emit('metric:recorded', metric);
        // Check thresholds
        await this.checkThresholds(metric);
        // Flush if buffer is full
        if (this.buffer.length >= this.config.batchSize) {
            await this.flush();
        }
        return metric;
    }
    /**
     * Record an error metric
     */
    async recordError(name, error, options = {}) {
        return this.recordMetric('error', name, 1, {
            tags: ['error', options.severity || 'medium'],
            metadata: {
                message: error.message,
                stack: error.stack,
                name: error.name,
                severity: options.severity || 'medium',
            },
            specId: options.specId,
            storyId: options.storyId,
            taskId: options.taskId,
        });
    }
    /**
     * Record a performance metric
     */
    async recordPerformance(name, durationMs, options = {}) {
        return this.recordMetric('performance', name, durationMs, {
            unit: 'ms',
            tags: ['performance', options.operation || 'general'],
            metadata: {
                operation: options.operation,
            },
            specId: options.specId,
            storyId: options.storyId,
            taskId: options.taskId,
        });
    }
    /**
     * Record user feedback
     */
    async recordUserFeedback(name, rating, options = {}) {
        return this.recordMetric('user_feedback', name, rating, {
            unit: 'rating',
            tags: ['feedback', options.category || 'general'],
            metadata: {
                comment: options.comment,
                category: options.category,
            },
            specId: options.specId,
            storyId: options.storyId,
            taskId: options.taskId,
        });
    }
    /**
     * Record test result
     */
    async recordTestResult(name, passed, options = {}) {
        return this.recordMetric('test_result', name, passed ? 1 : 0, {
            unit: 'boolean',
            tags: ['test', options.testSuite || 'default', passed ? 'passed' : 'failed'],
            metadata: {
                durationMs: options.durationMs,
                testSuite: options.testSuite,
                assertions: options.assertions,
                failures: options.failures,
            },
            specId: options.specId,
            storyId: options.storyId,
            taskId: options.taskId,
        });
    }
    /**
     * Get metrics based on query
     */
    async getMetrics(query = {}) {
        await this.flush(); // Ensure all buffered metrics are saved
        if (this.db.isInMemory) {
            return this.queryInMemory(query);
        }
        let sql = 'SELECT * FROM metrics WHERE 1=1';
        const params = [];
        if (query.type) {
            sql += ' AND type = ?';
            params.push(query.type);
        }
        if (query.types && query.types.length > 0) {
            sql += ` AND type IN (${query.types.map(() => '?').join(',')})`;
            params.push(...query.types);
        }
        if (query.specId) {
            sql += ' AND spec_id = ?';
            params.push(query.specId);
        }
        if (query.storyId) {
            sql += ' AND story_id = ?';
            params.push(query.storyId);
        }
        if (query.taskId) {
            sql += ' AND task_id = ?';
            params.push(query.taskId);
        }
        if (query.startTime) {
            sql += ' AND timestamp >= ?';
            params.push(query.startTime.toISOString());
        }
        if (query.endTime) {
            sql += ' AND timestamp <= ?';
            params.push(query.endTime.toISOString());
        }
        sql += ' ORDER BY timestamp DESC';
        if (query.limit) {
            sql += ' LIMIT ?';
            params.push(query.limit);
        }
        if (query.offset) {
            sql += ' OFFSET ?';
            params.push(query.offset);
        }
        const rows = this.db.prepare(sql).all(...params);
        return rows.map(this.rowToMetric);
    }
    /**
     * Query in-memory store
     */
    queryInMemory(query) {
        let results = [...this.db.metrics];
        if (query.type) {
            results = results.filter(m => m.type === query.type);
        }
        if (query.types && query.types.length > 0) {
            results = results.filter(m => query.types.includes(m.type));
        }
        if (query.specId) {
            results = results.filter(m => m.specId === query.specId);
        }
        if (query.storyId) {
            results = results.filter(m => m.storyId === query.storyId);
        }
        if (query.startTime) {
            results = results.filter(m => m.timestamp >= query.startTime);
        }
        if (query.endTime) {
            results = results.filter(m => m.timestamp <= query.endTime);
        }
        // Sort by timestamp descending
        results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        if (query.offset) {
            results = results.slice(query.offset);
        }
        if (query.limit) {
            results = results.slice(0, query.limit);
        }
        return results;
    }
    /**
     * Analyze trends for a specific metric type
     */
    async analyzeTrends(type, name, options = {}) {
        const period = options.period || 'day';
        const lookbackPeriods = options.lookbackPeriods || 7;
        const periodMs = this.getPeriodMs(period);
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - (periodMs * lookbackPeriods));
        const metrics = await this.getMetrics({
            type,
            startTime,
            endTime,
        });
        // Filter by name and extract numeric values
        const relevantMetrics = metrics.filter(m => m.name === name && typeof m.value === 'number');
        const values = relevantMetrics.map(m => m.value);
        if (values.length === 0) {
            return {
                metric: name,
                type,
                period,
                dataPoints: [],
                trend: 'stable',
                changePercent: 0,
                average: 0,
                min: 0,
                max: 0,
                stdDev: 0,
            };
        }
        // Calculate statistics
        const average = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - average, 2), 0) / values.length);
        // Calculate trend
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / (firstHalf.length || 1);
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / (secondHalf.length || 1);
        const changePercent = firstAvg !== 0
            ? ((secondAvg - firstAvg) / firstAvg) * 100
            : 0;
        let trend = 'stable';
        if (Math.abs(changePercent) > 5) {
            // For errors, decreasing is improving
            // For performance (time), decreasing is improving
            // For coverage, increasing is improving
            if (type === 'error' || type === 'performance') {
                trend = changePercent < 0 ? 'improving' : 'degrading';
            }
            else {
                trend = changePercent > 0 ? 'improving' : 'degrading';
            }
        }
        const analysis = {
            metric: name,
            type,
            period,
            dataPoints: relevantMetrics.map(m => ({
                timestamp: m.timestamp,
                value: m.value,
            })),
            trend,
            changePercent,
            average,
            min,
            max,
            stdDev,
        };
        // Emit trend event if significant
        if (Math.abs(changePercent) > 10) {
            this.emit('trend:detected', analysis);
        }
        return analysis;
    }
    /**
     * Get summary statistics
     */
    async getSummary(options = {}) {
        const types = [
            'error', 'performance', 'user_feedback', 'test_result',
            'coverage', 'spec_compliance', 'build_status', 'deployment'
        ];
        const summary = {};
        for (const type of types) {
            const metrics = await this.getMetrics({
                type,
                specId: options.specId,
                startTime: options.startTime,
                endTime: options.endTime,
                limit: 1,
            });
            summary[type] = {
                count: this.metricCounts.get(type) || 0,
                latest: metrics[0] || null,
            };
        }
        return summary;
    }
    /**
     * Flush buffer to database
     */
    async flush() {
        if (this.buffer.length === 0)
            return;
        const metricsToFlush = [...this.buffer];
        this.buffer = [];
        if (this.db.isInMemory) {
            this.db.metrics.push(...metricsToFlush);
        }
        else {
            const stmt = this.db.prepare(`
        INSERT INTO metrics (id, type, name, value, unit, tags, metadata, timestamp, spec_id, story_id, task_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
            for (const metric of metricsToFlush) {
                stmt.run(metric.id, metric.type, metric.name, String(metric.value), metric.unit || null, JSON.stringify(metric.tags), JSON.stringify(metric.metadata), metric.timestamp.toISOString(), metric.specId || null, metric.storyId || null, metric.taskId || null);
            }
        }
        this.emit('metrics:flushed', { count: metricsToFlush.length });
    }
    /**
     * Check thresholds and emit events
     */
    async checkThresholds(metric) {
        if (metric.type === 'error') {
            const errorMetrics = await this.getMetrics({
                type: 'error',
                startTime: new Date(Date.now() - 3600000), // Last hour
            });
            const totalMetrics = await this.getMetrics({
                startTime: new Date(Date.now() - 3600000),
            });
            const errorRate = totalMetrics.length > 0
                ? errorMetrics.length / totalMetrics.length
                : 0;
            if (errorRate > this.config.thresholds.errorRate) {
                this.emit('threshold:exceeded', {
                    type: 'error',
                    threshold: this.config.thresholds.errorRate,
                    current: errorRate,
                });
            }
        }
        if (metric.type === 'coverage' && typeof metric.value === 'number') {
            if (metric.value < this.config.thresholds.coverageMinimum) {
                this.emit('threshold:exceeded', {
                    type: 'coverage',
                    threshold: this.config.thresholds.coverageMinimum,
                    current: metric.value,
                });
            }
        }
    }
    /**
     * Start auto-collection timer
     */
    startAutoCollection() {
        this.collectionTimer = setInterval(async () => {
            try {
                // Collect system metrics
                await this.collectSystemMetrics();
            }
            catch (error) {
                this.emit('error', error);
            }
        }, this.config.collectionInterval);
    }
    /**
     * Start flush timer
     */
    startFlushTimer() {
        this.flushTimer = setInterval(async () => {
            try {
                await this.flush();
            }
            catch (error) {
                this.emit('error', error);
            }
        }, this.config.flushInterval);
    }
    /**
     * Collect system metrics
     */
    async collectSystemMetrics() {
        const memUsage = process.memoryUsage();
        await this.recordMetric('performance', 'memory.heapUsed', memUsage.heapUsed, {
            unit: 'bytes',
            tags: ['system', 'memory'],
        });
        await this.recordMetric('performance', 'memory.rss', memUsage.rss, {
            unit: 'bytes',
            tags: ['system', 'memory'],
        });
    }
    /**
     * Convert database row to MetricEntry
     */
    rowToMetric(row) {
        return {
            id: row.id,
            type: row.type,
            name: row.name,
            value: isNaN(Number(row.value)) ? row.value : Number(row.value),
            unit: row.unit,
            tags: JSON.parse(row.tags || '[]'),
            metadata: JSON.parse(row.metadata || '{}'),
            timestamp: new Date(row.timestamp),
            specId: row.spec_id,
            storyId: row.story_id,
            taskId: row.task_id,
        };
    }
    /**
     * Get period in milliseconds
     */
    getPeriodMs(period) {
        switch (period) {
            case 'hour': return 3600000;
            case 'day': return 86400000;
            case 'week': return 604800000;
            case 'month': return 2592000000;
            default: return 86400000;
        }
    }
    /**
     * Generate unique ID
     */
    generateId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 11);
        return `metric_${timestamp}_${random}`;
    }
    /**
     * Clean up old metrics
     */
    async cleanup() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
        if (this.db.isInMemory) {
            const before = this.db.metrics.length;
            this.db.metrics = this.db.metrics.filter((m) => m.timestamp >= cutoffDate);
            return before - this.db.metrics.length;
        }
        const result = this.db.prepare('DELETE FROM metrics WHERE timestamp < ?').run(cutoffDate.toISOString());
        return result.changes;
    }
    /**
     * Stop the metrics collector
     */
    async stop() {
        if (this.collectionTimer) {
            clearInterval(this.collectionTimer);
        }
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        await this.flush();
        if (this.db && !this.db.isInMemory && this.db.close) {
            this.db.close();
        }
        this.isInitialized = false;
        this.emit('stopped');
    }
}
exports.MetricsCollector = MetricsCollector;
exports.default = MetricsCollector;
//# sourceMappingURL=metrics-collector.js.map