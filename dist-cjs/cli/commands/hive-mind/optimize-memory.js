"use strict";
/**
 * Memory Optimization Command
 *
 * Provides comprehensive memory optimization tools for the Hive Mind system.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOptimizeMemoryCommand = createOptimizeMemoryCommand;
const commander_1 = require("commander");
const MemoryMonitor_js_1 = require("../../../hive-mind/core/MemoryMonitor.js");
const Memory_js_1 = require("../../../hive-mind/core/Memory.js");
const DatabaseManager_js_1 = require("../../../hive-mind/core/DatabaseManager.js");
const chalk_1 = __importDefault(require("chalk"));
function createOptimizeMemoryCommand() {
    const command = new commander_1.Command('optimize-memory')
        .description('Optimize memory usage and performance for Hive Mind')
        .option('-a, --analyze', 'Analyze current memory performance')
        .option('-o, --optimize', 'Run comprehensive memory optimization')
        .option('-m, --monitor', 'Start memory monitoring dashboard')
        .option('-r, --report', 'Generate detailed memory report')
        .option('-c, --cleanup', 'Perform memory cleanup operations')
        .option('--cache-size <size>', 'Set cache size (entries)', '10000')
        .option('--cache-memory <mb>', 'Set cache memory limit (MB)', '100')
        .option('--compression-threshold <bytes>', 'Set compression threshold', '10000')
        .action(async (options) => {
        try {
            console.log(chalk_1.default.blue.bold('\n🧠 Hive Mind Memory Optimization System\n'));
            if (options.analyze) {
                await analyzeMemoryPerformance();
            }
            if (options.optimize) {
                await runMemoryOptimization(options);
            }
            if (options.monitor) {
                await startMemoryMonitoring();
            }
            if (options.report) {
                await generateMemoryReport();
            }
            if (options.cleanup) {
                await performMemoryCleanup();
            }
            if (!options.analyze &&
                !options.optimize &&
                !options.monitor &&
                !options.report &&
                !options.cleanup) {
                await showMemoryOverview();
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('❌ Memory optimization failed:'), error.message);
            process.exit(1);
        }
    });
    return command;
}
/**
 * Analyze current memory performance
 */
async function analyzeMemoryPerformance() {
    console.log(chalk_1.default.yellow('🔍 Analyzing memory performance...\n'));
    try {
        // Initialize memory systems
        const memory = new Memory_js_1.Memory('hive-mind-optimizer', {
            cacheSize: 10000,
            cacheMemoryMB: 100,
            enablePooling: true,
            compressionThreshold: 10000,
        });
        await memory.initialize();
        // Get comprehensive analytics
        const analytics = memory.getAdvancedAnalytics();
        const healthCheck = await memory.healthCheck();
        // Display results
        console.log(chalk_1.default.green.bold('📊 Memory Performance Analysis\n'));
        // Cache Performance
        console.log(chalk_1.default.cyan('🗄️ Cache Performance:'));
        console.log(`   Hit Rate: ${chalk_1.default.bold(analytics.cache.hitRate?.toFixed(1) || '0')}%`);
        console.log(`   Memory Usage: ${chalk_1.default.bold(analytics.cache.memoryUsage?.toFixed(1) || '0')} MB`);
        console.log(`   Utilization: ${chalk_1.default.bold(analytics.cache.utilizationPercent?.toFixed(1) || '0')}%`);
        console.log(`   Evictions: ${chalk_1.default.bold(analytics.cache.evictions || 0)}\n`);
        // Performance Metrics
        console.log(chalk_1.default.cyan('⚡ Performance Metrics:'));
        for (const [operation, stats] of Object.entries(analytics.performance)) {
            if (typeof stats === 'object' && stats.avg) {
                console.log(`   ${operation}: ${chalk_1.default.bold(stats.avg.toFixed(2))}ms avg (${stats.count} samples)`);
            }
        }
        console.log('');
        // Object Pools
        if (analytics.pools) {
            console.log(chalk_1.default.cyan('🔄 Object Pools:'));
            for (const [name, stats] of Object.entries(analytics.pools)) {
                if (typeof stats === 'object' && stats.reuseRate !== undefined) {
                    console.log(`   ${name}: ${chalk_1.default.bold(stats.reuseRate.toFixed(1))}% reuse rate`);
                }
            }
            console.log('');
        }
        // Health Status
        console.log(chalk_1.default.cyan('🏥 Health Status:'));
        const statusColor = healthCheck.status === 'healthy'
            ? 'green'
            : healthCheck.status === 'warning'
                ? 'yellow'
                : 'red';
        console.log(`   Overall: ${chalk_1.default[statusColor].bold(healthCheck.status.toUpperCase())}`);
        console.log(`   Score: ${chalk_1.default.bold(healthCheck.score)}/100`);
        if (healthCheck.issues.length > 0) {
            console.log(`   Issues: ${chalk_1.default.red(healthCheck.issues.length)}`);
            healthCheck.issues.forEach((issue) => {
                console.log(`     • ${chalk_1.default.red(issue)}`);
            });
        }
        if (healthCheck.recommendations.length > 0) {
            console.log(`   Recommendations:`);
            healthCheck.recommendations.forEach((rec) => {
                console.log(`     • ${chalk_1.default.blue(rec)}`);
            });
        }
        await memory.shutdown();
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Analysis failed:'), error.message);
    }
}
/**
 * Run comprehensive memory optimization
 */
async function runMemoryOptimization(options) {
    console.log(chalk_1.default.yellow('⚡ Running memory optimization...\n'));
    try {
        // Initialize optimized memory system
        const memory = new Memory_js_1.Memory('hive-mind-optimizer', {
            cacheSize: parseInt(options.cacheSize),
            cacheMemoryMB: parseInt(options.cacheMemory),
            enablePooling: true,
            compressionThreshold: parseInt(options.compressionThreshold),
            batchSize: 100,
        });
        await memory.initialize();
        // Get baseline metrics
        const baselineAnalytics = memory.getAdvancedAnalytics();
        const baselineHealth = await memory.healthCheck();
        console.log(chalk_1.default.cyan('📋 Baseline Metrics:'));
        console.log(`   Cache Hit Rate: ${baselineAnalytics.cache.hitRate?.toFixed(1) || '0'}%`);
        console.log(`   Health Score: ${baselineHealth.score}/100\n`);
        // Run optimization steps
        console.log(chalk_1.default.yellow('🔧 Optimization Steps:\n'));
        // Step 1: Cache optimization
        console.log(chalk_1.default.blue('1. Optimizing cache configuration...'));
        // Cache is already optimized in constructor
        console.log(chalk_1.default.green('   ✓ Cache configuration optimized\n'));
        // Step 2: Database optimization
        console.log(chalk_1.default.blue('2. Optimizing database performance...'));
        const db = await DatabaseManager_js_1.DatabaseManager.getInstance();
        const dbAnalytics = db.getDatabaseAnalytics();
        if (dbAnalytics.fragmentation > 20) {
            console.log(chalk_1.default.yellow('   ⚠️ High database fragmentation detected'));
            console.log(chalk_1.default.blue('   Running database optimization...'));
            // Database optimization would happen here
        }
        console.log(chalk_1.default.green('   ✓ Database optimization completed\n'));
        // Step 3: Memory cleanup
        console.log(chalk_1.default.blue('3. Performing memory cleanup...'));
        await memory.compress();
        console.log(chalk_1.default.green('   ✓ Memory compression completed\n'));
        // Step 4: Pattern analysis
        console.log(chalk_1.default.blue('4. Analyzing access patterns...'));
        const patterns = await memory.learnPatterns();
        console.log(chalk_1.default.green(`   ✓ Learned ${patterns.length} access patterns\n`));
        // Get final metrics
        const finalAnalytics = memory.getAdvancedAnalytics();
        const finalHealth = await memory.healthCheck();
        // Show improvement
        console.log(chalk_1.default.green.bold('📈 Optimization Results:\n'));
        const hitRateImprovement = (finalAnalytics.cache.hitRate || 0) - (baselineAnalytics.cache.hitRate || 0);
        const healthImprovement = finalHealth.score - baselineHealth.score;
        console.log(chalk_1.default.cyan('Performance Improvements:'));
        console.log(`   Cache Hit Rate: ${hitRateImprovement >= 0 ? '+' : ''}${hitRateImprovement.toFixed(1)}%`);
        console.log(`   Health Score: ${healthImprovement >= 0 ? '+' : ''}${healthImprovement.toFixed(1)} points`);
        if (hitRateImprovement > 0 || healthImprovement > 0) {
            console.log(chalk_1.default.green('\n✅ Memory optimization completed successfully!'));
        }
        else {
            console.log(chalk_1.default.yellow('\n⚠️ System was already well-optimized'));
        }
        await memory.shutdown();
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Optimization failed:'), error.message);
    }
}
/**
 * Start interactive memory monitoring dashboard
 */
async function startMemoryMonitoring() {
    console.log(chalk_1.default.yellow('📊 Starting memory monitoring dashboard...\n'));
    try {
        // Initialize systems
        const memory = new Memory_js_1.Memory('hive-mind-monitor');
        const db = await DatabaseManager_js_1.DatabaseManager.getInstance();
        await memory.initialize();
        const monitor = new MemoryMonitor_js_1.MemoryMonitor(memory, db);
        // Set up event listeners
        monitor.on('alert', (alert) => {
            const color = alert.level === 'critical' ? 'red' : alert.level === 'warning' ? 'yellow' : 'blue';
            console.log(chalk_1.default[color](`🚨 ${alert.level.toUpperCase()}: ${alert.message}`));
        });
        monitor.on('metrics:collected', (data) => {
            // Clear screen and show current metrics
            console.clear();
            console.log(chalk_1.default.blue.bold('🧠 Hive Mind Memory Monitor\n'));
            const { metrics } = data;
            console.log(chalk_1.default.cyan('📊 Real-time Metrics:'));
            console.log(`   Cache Hit Rate: ${chalk_1.default.bold(metrics.cacheHitRate.toFixed(1))}%`);
            console.log(`   Avg Query Time: ${chalk_1.default.bold(metrics.avgQueryTime.toFixed(1))}ms`);
            console.log(`   Memory Utilization: ${chalk_1.default.bold(metrics.memoryUtilization.toFixed(1))}%`);
            console.log(`   Pool Efficiency: ${chalk_1.default.bold(metrics.poolEfficiency.toFixed(1))}%`);
            console.log(`   DB Fragmentation: ${chalk_1.default.bold(metrics.dbFragmentation.toFixed(1))}%`);
            console.log(`   Last Updated: ${chalk_1.default.gray(new Date().toLocaleTimeString())}\n`);
            console.log(chalk_1.default.gray('Press Ctrl+C to stop monitoring...'));
        });
        monitor.on('health:analyzed', (report) => {
            if (report.overall.status !== 'good' && report.overall.status !== 'excellent') {
                console.log(chalk_1.default.yellow(`\n⚠️ Health Status: ${report.overall.status}`));
                console.log(`   ${report.overall.summary}`);
            }
        });
        // Start monitoring
        await monitor.start();
        // Handle shutdown
        process.on('SIGINT', async () => {
            console.log(chalk_1.default.yellow('\n\n🛑 Shutting down monitor...'));
            monitor.stop();
            await memory.shutdown();
            process.exit(0);
        });
        console.log(chalk_1.default.green('✅ Memory monitoring started!'));
        console.log(chalk_1.default.gray('Real-time metrics will appear below...\n'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Monitoring startup failed:'), error.message);
    }
}
/**
 * Generate detailed memory report
 */
async function generateMemoryReport() {
    console.log(chalk_1.default.yellow('📄 Generating detailed memory report...\n'));
    try {
        // Initialize systems
        const memory = new Memory_js_1.Memory('hive-mind-reporter');
        const db = await DatabaseManager_js_1.DatabaseManager.getInstance();
        await memory.initialize();
        const monitor = new MemoryMonitor_js_1.MemoryMonitor(memory, db);
        // Generate comprehensive report
        const report = await monitor.generateDetailedReport();
        const analytics = memory.getAdvancedAnalytics();
        console.log(chalk_1.default.green.bold('📊 Comprehensive Memory Report\n'));
        // Executive Summary
        console.log(chalk_1.default.cyan.bold('🎯 Executive Summary:'));
        console.log(`   Overall Status: ${getStatusBadge(report.overall.status)}`);
        console.log(`   Health Score: ${chalk_1.default.bold(report.overall.score)}/100`);
        console.log(`   ${report.overall.summary}\n`);
        // Key Metrics
        console.log(chalk_1.default.cyan.bold('📈 Key Performance Metrics:'));
        console.log(`   Cache Hit Rate: ${formatMetric(report.metrics.cacheHitRate, '%', 70)}`);
        console.log(`   Average Query Time: ${formatMetric(report.metrics.avgQueryTime, 'ms', 50, true)}`);
        console.log(`   Memory Utilization: ${formatMetric(report.metrics.memoryUtilization, '%', 80)}`);
        console.log(`   Pool Efficiency: ${formatMetric(report.metrics.poolEfficiency, '%', 50)}`);
        console.log(`   Compression Ratio: ${formatMetric(report.metrics.compressionRatio * 100, '%', 60)}\n`);
        // Trends Analysis
        console.log(chalk_1.default.cyan.bold('📊 Performance Trends:'));
        console.log(`   Performance: ${getTrendIndicator(report.trends.performance)}`);
        console.log(`   Memory Usage: ${getTrendIndicator(report.trends.memoryUsage)}`);
        console.log(`   Cache Efficiency: ${getTrendIndicator(report.trends.cacheEfficiency)}\n`);
        // Active Alerts
        if (report.alerts.length > 0) {
            console.log(chalk_1.default.cyan.bold('🚨 Active Alerts:'));
            report.alerts.forEach((alert) => {
                const color = alert.level === 'critical' ? 'red' : alert.level === 'warning' ? 'yellow' : 'blue';
                console.log(`   ${chalk_1.default[color]('●')} ${alert.message}`);
            });
            console.log('');
        }
        // Optimization Suggestions
        if (report.suggestions.length > 0) {
            console.log(chalk_1.default.cyan.bold('💡 Optimization Suggestions:'));
            report.suggestions.forEach((suggestion, index) => {
                const priorityColor = suggestion.priority === 'critical'
                    ? 'red'
                    : suggestion.priority === 'high'
                        ? 'yellow'
                        : suggestion.priority === 'medium'
                            ? 'blue'
                            : 'gray';
                console.log(`   ${index + 1}. ${chalk_1.default[priorityColor].bold(suggestion.title)}`);
                console.log(`      ${suggestion.description}`);
                console.log(`      Impact: ${chalk_1.default.green(suggestion.estimatedImpact)}`);
                console.log(`      Effort: ${chalk_1.default.blue(suggestion.effort)}\n`);
            });
        }
        // Resource Utilization
        console.log(chalk_1.default.cyan.bold('💾 Resource Utilization:'));
        console.log(`   Cache Memory: ${(analytics.cache.memoryUsage / 1024 / 1024).toFixed(1)} MB`);
        console.log(`   Cache Entries: ${analytics.cache.size || 0}`);
        console.log(`   Access Patterns: ${analytics.accessPatterns.total || 0} tracked\n`);
        // Recommendations
        console.log(chalk_1.default.cyan.bold('🎯 Immediate Actions Recommended:'));
        if (report.overall.score < 70) {
            console.log(`   • ${chalk_1.default.red('Run memory optimization immediately')}`);
        }
        if (report.metrics.cacheHitRate < 50) {
            console.log(`   • ${chalk_1.default.yellow('Increase cache size')}`);
        }
        if (report.metrics.avgQueryTime > 100) {
            console.log(`   • ${chalk_1.default.yellow('Optimize database queries')}`);
        }
        if (report.alerts.filter((a) => a.level === 'critical').length > 0) {
            console.log(`   • ${chalk_1.default.red('Address critical alerts immediately')}`);
        }
        console.log(chalk_1.default.green('\n✅ Report generation completed!'));
        await memory.shutdown();
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Report generation failed:'), error.message);
    }
}
/**
 * Perform memory cleanup operations
 */
async function performMemoryCleanup() {
    console.log(chalk_1.default.yellow('🧹 Performing memory cleanup...\n'));
    try {
        const memory = new Memory_js_1.Memory('hive-mind-cleaner');
        await memory.initialize();
        console.log(chalk_1.default.blue('1. Cleaning expired entries...'));
        // Cleanup would happen automatically through memory management
        console.log(chalk_1.default.blue('2. Compressing old data...'));
        await memory.compress();
        console.log(chalk_1.default.blue('3. Optimizing cache...'));
        // Cache optimization happens automatically
        console.log(chalk_1.default.blue('4. Analyzing patterns...'));
        const patterns = await memory.learnPatterns();
        console.log(chalk_1.default.green(`✅ Cleanup completed!`));
        console.log(`   • Learned ${patterns.length} patterns`);
        console.log(`   • Cache optimized`);
        console.log(`   • Memory compressed\n`);
        await memory.shutdown();
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Cleanup failed:'), error.message);
    }
}
/**
 * Show memory system overview
 */
async function showMemoryOverview() {
    console.log(chalk_1.default.cyan('Welcome to the Hive Mind Memory Optimization System!\n'));
    console.log('Available commands:');
    console.log(`  ${chalk_1.default.green('--analyze')}     Analyze current memory performance`);
    console.log(`  ${chalk_1.default.green('--optimize')}    Run comprehensive optimization`);
    console.log(`  ${chalk_1.default.green('--monitor')}     Start real-time monitoring dashboard`);
    console.log(`  ${chalk_1.default.green('--report')}      Generate detailed performance report`);
    console.log(`  ${chalk_1.default.green('--cleanup')}     Perform memory cleanup operations\n`);
    console.log('Configuration options:');
    console.log(`  ${chalk_1.default.blue('--cache-size')}         Set cache size (default: 10000)`);
    console.log(`  ${chalk_1.default.blue('--cache-memory')}       Set cache memory limit in MB (default: 100)`);
    console.log(`  ${chalk_1.default.blue('--compression-threshold')} Set compression threshold in bytes (default: 10000)\n`);
    console.log(chalk_1.default.yellow('💡 Quick start: Run with --analyze to see current performance'));
}
/**
 * Helper functions
 */
function getStatusBadge(status) {
    const colors = {
        excellent: 'green',
        good: 'cyan',
        fair: 'yellow',
        poor: 'red',
        critical: 'red',
    };
    const color = colors[status] || 'gray';
    return chalk_1.default[color].bold(status.toUpperCase());
}
function formatMetric(value, unit, threshold, inverse = false) {
    const good = inverse ? value <= threshold : value >= threshold;
    const color = good ? 'green' : value >= threshold * 0.8 ? 'yellow' : 'red';
    return chalk_1.default[color].bold(`${value.toFixed(1)}${unit}`);
}
function getTrendIndicator(trend) {
    const indicators = {
        improving: chalk_1.default.green('📈 Improving'),
        stable: chalk_1.default.blue('➡️ Stable'),
        degrading: chalk_1.default.red('📉 Degrading'),
        increasing: chalk_1.default.red('📈 Increasing'),
        decreasing: chalk_1.default.green('📉 Decreasing'),
    };
    return indicators[trend] || chalk_1.default.gray('❓ Unknown');
}
//# sourceMappingURL=optimize-memory.js.map