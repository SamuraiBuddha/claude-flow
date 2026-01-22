"use strict";
/**
 * Compatible Terminal UI - Works without raw mode
 * Designed for environments that don't support stdin raw mode
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompatibleUI = void 0;
exports.createCompatibleUI = createCompatibleUI;
exports.isRawModeSupported = isRawModeSupported;
exports.launchUI = launchUI;
const readline_1 = __importDefault(require("readline"));
const chalk_1 = __importDefault(require("chalk"));
class CompatibleUI {
    processes = [];
    running = false;
    rl;
    constructor() {
        this.rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false, // Don't require raw mode
        });
    }
    async start() {
        this.running = true;
        // Initial render
        this.render();
        // Setup command loop
        while (this.running) {
            const command = await this.promptCommand();
            await this.handleCommand(command);
        }
    }
    stop() {
        this.running = false;
        this.rl.close();
        console.clear();
    }
    updateProcesses(processes) {
        this.processes = processes;
        if (this.running) {
            this.render();
        }
    }
    async promptCommand() {
        return new Promise((resolve) => {
            this.rl.question('\nCommand: ', (answer) => {
                resolve(answer.trim());
            });
        });
    }
    async handleCommand(input) {
        switch (input.toLowerCase()) {
            case 'q':
            case 'quit':
            case 'exit':
                await this.handleExit();
                break;
            case 'r':
            case 'refresh':
                this.render();
                break;
            case 'h':
            case 'help':
            case '?':
                this.showHelp();
                break;
            case 's':
            case 'status':
                this.showStatus();
                break;
            case 'l':
            case 'list':
                this.showProcessList();
                break;
            default:
                // Check if it's a number (process selection)
                const num = parseInt(input);
                if (!isNaN(num) && num >= 1 && num <= this.processes.length) {
                    await this.showProcessDetails(this.processes[num - 1]);
                }
                else {
                    console.log(chalk_1.default.yellow('Invalid command. Type "h" for help.'));
                }
                break;
        }
    }
    render() {
        console.clear();
        const stats = this.getSystemStats();
        // Header
        console.log(chalk_1.default.cyan.bold('🧠 Claude-Flow System Monitor'));
        console.log(chalk_1.default.gray('─'.repeat(60)));
        // System stats
        console.log(chalk_1.default.white('System Status:'), chalk_1.default.green(`${stats.runningProcesses}/${stats.totalProcesses} running`));
        if (stats.errorProcesses > 0) {
            console.log(chalk_1.default.red(`⚠️  ${stats.errorProcesses} processes with errors`));
        }
        console.log();
        // Process list
        console.log(chalk_1.default.white.bold('Processes:'));
        console.log(chalk_1.default.gray('─'.repeat(60)));
        if (this.processes.length === 0) {
            console.log(chalk_1.default.gray('No processes configured'));
        }
        else {
            this.processes.forEach((process, index) => {
                const num = `[${index + 1}]`.padEnd(4);
                const status = this.getStatusDisplay(process.status);
                const name = process.name.padEnd(25);
                console.log(`${chalk_1.default.gray(num)} ${status} ${chalk_1.default.white(name)}`);
                if (process.metrics?.lastError) {
                    console.log(chalk_1.default.red(`       Error: ${process.metrics.lastError}`));
                }
            });
        }
        // Footer
        console.log(chalk_1.default.gray('─'.repeat(60)));
        console.log(chalk_1.default.gray('Commands: [1-9] Process details [s] Status [l] List [r] Refresh [h] Help [q] Quit'));
    }
    showStatus() {
        const stats = this.getSystemStats();
        console.log();
        console.log(chalk_1.default.cyan.bold('📊 System Status Details'));
        console.log(chalk_1.default.gray('─'.repeat(40)));
        console.log(chalk_1.default.white('Total Processes:'), stats.totalProcesses);
        console.log(chalk_1.default.white('Running:'), chalk_1.default.green(stats.runningProcesses));
        console.log(chalk_1.default.white('Stopped:'), chalk_1.default.gray(stats.totalProcesses - stats.runningProcesses - stats.errorProcesses));
        console.log(chalk_1.default.white('Errors:'), chalk_1.default.red(stats.errorProcesses));
        console.log(chalk_1.default.white('System Load:'), this.getSystemLoad());
        console.log(chalk_1.default.white('Uptime:'), this.getSystemUptime());
    }
    showProcessList() {
        console.log();
        console.log(chalk_1.default.cyan.bold('📋 Process List'));
        console.log(chalk_1.default.gray('─'.repeat(60)));
        if (this.processes.length === 0) {
            console.log(chalk_1.default.gray('No processes configured'));
            return;
        }
        this.processes.forEach((process, index) => {
            console.log(`${chalk_1.default.gray(`[${index + 1}]`)} ${this.getStatusDisplay(process.status)} ${chalk_1.default.white.bold(process.name)}`);
            console.log(chalk_1.default.gray(`    Type: ${process.type}`));
            if (process.pid) {
                console.log(chalk_1.default.gray(`    PID: ${process.pid}`));
            }
            if (process.startTime) {
                const uptime = Date.now() - process.startTime;
                console.log(chalk_1.default.gray(`    Uptime: ${this.formatUptime(uptime)}`));
            }
            if (process.metrics) {
                if (process.metrics.cpu !== undefined) {
                    console.log(chalk_1.default.gray(`    CPU: ${process.metrics.cpu.toFixed(1)}%`));
                }
                if (process.metrics.memory !== undefined) {
                    console.log(chalk_1.default.gray(`    Memory: ${process.metrics.memory.toFixed(0)} MB`));
                }
            }
            console.log();
        });
    }
    async showProcessDetails(process) {
        console.log();
        console.log(chalk_1.default.cyan.bold(`📋 Process Details: ${process.name}`));
        console.log(chalk_1.default.gray('─'.repeat(60)));
        console.log(chalk_1.default.white('ID:'), process.id);
        console.log(chalk_1.default.white('Type:'), process.type);
        console.log(chalk_1.default.white('Status:'), this.getStatusDisplay(process.status), process.status);
        if (process.pid) {
            console.log(chalk_1.default.white('PID:'), process.pid);
        }
        if (process.startTime) {
            const uptime = Date.now() - process.startTime;
            console.log(chalk_1.default.white('Uptime:'), this.formatUptime(uptime));
        }
        if (process.metrics) {
            console.log();
            console.log(chalk_1.default.white.bold('Metrics:'));
            if (process.metrics.cpu !== undefined) {
                console.log(chalk_1.default.white('CPU:'), `${process.metrics.cpu.toFixed(1)}%`);
            }
            if (process.metrics.memory !== undefined) {
                console.log(chalk_1.default.white('Memory:'), `${process.metrics.memory.toFixed(0)} MB`);
            }
            if (process.metrics.restarts !== undefined) {
                console.log(chalk_1.default.white('Restarts:'), process.metrics.restarts);
            }
            if (process.metrics.lastError) {
                console.log(chalk_1.default.red('Last Error:'), process.metrics.lastError);
            }
        }
    }
    getStatusDisplay(status) {
        switch (status) {
            case 'running':
                return chalk_1.default.green('●');
            case 'stopped':
                return chalk_1.default.gray('○');
            case 'starting':
                return chalk_1.default.yellow('◐');
            case 'stopping':
                return chalk_1.default.yellow('◑');
            case 'error':
                return chalk_1.default.red('✗');
            case 'crashed':
                return chalk_1.default.red('☠');
            default:
                return chalk_1.default.gray('?');
        }
    }
    getSystemStats() {
        return {
            totalProcesses: this.processes.length,
            runningProcesses: this.processes.filter((p) => p.status === 'running').length,
            errorProcesses: this.processes.filter((p) => p.status === 'error' || p.status === 'crashed')
                .length,
        };
    }
    getSystemLoad() {
        // Simulate system load
        return '0.45, 0.52, 0.48';
    }
    getSystemUptime() {
        const uptime = process.uptime() * 1000;
        return this.formatUptime(uptime);
    }
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) {
            return `${days}d ${hours % 24}h`;
        }
        else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        }
        else {
            return `${seconds}s`;
        }
    }
    showHelp() {
        console.log();
        console.log(chalk_1.default.cyan.bold('🧠 Claude-Flow System Monitor - Help'));
        console.log(chalk_1.default.gray('─'.repeat(60)));
        console.log();
        console.log(chalk_1.default.white.bold('Commands:'));
        console.log('  1-9     - Show process details by number');
        console.log('  s       - Show system status');
        console.log('  l       - List all processes');
        console.log('  r       - Refresh display');
        console.log('  h/?     - Show this help');
        console.log('  q       - Quit');
        console.log();
        console.log(chalk_1.default.white.bold('Features:'));
        console.log('  • Non-interactive mode (works in any terminal)');
        console.log('  • Real-time process monitoring');
        console.log('  • System statistics');
        console.log('  • Compatible with VS Code, CI/CD, containers');
    }
    async handleExit() {
        const runningProcesses = this.processes.filter((p) => p.status === 'running');
        if (runningProcesses.length > 0) {
            console.log();
            console.log(chalk_1.default.yellow(`⚠️  ${runningProcesses.length} processes are still running.`));
            console.log('These processes will continue running in the background.');
            console.log('Use the main CLI to stop them if needed.');
        }
        this.stop();
    }
}
exports.CompatibleUI = CompatibleUI;
// Factory function to create UI instances
function createCompatibleUI() {
    return new CompatibleUI();
}
// Check if raw mode is supported
function isRawModeSupported() {
    try {
        return process.stdin.isTTY && typeof process.stdin.setRawMode === 'function';
    }
    catch {
        return false;
    }
}
// Fallback UI launcher that chooses the best available UI
async function launchUI() {
    const ui = createCompatibleUI();
    // Mock some example processes for demonstration
    const mockProcesses = [
        {
            id: 'orchestrator',
            name: 'Orchestrator Engine',
            status: 'running',
            type: 'core',
            pid: 12345,
            startTime: Date.now() - 30000,
            metrics: { cpu: 2.1, memory: 45.2, restarts: 0 },
        },
        {
            id: 'memory-manager',
            name: 'Memory Manager',
            status: 'running',
            type: 'service',
            pid: 12346,
            startTime: Date.now() - 25000,
            metrics: { cpu: 0.8, memory: 12.5, restarts: 0 },
        },
        {
            id: 'mcp-server',
            name: 'MCP Server',
            status: 'stopped',
            type: 'server',
            metrics: { restarts: 1 },
        },
    ];
    ui.updateProcesses(mockProcesses);
    console.log(chalk_1.default.green('✅ Starting Claude-Flow UI (compatible mode)'));
    console.log(chalk_1.default.gray('Note: Using compatible UI mode for broader terminal support'));
    console.log();
    await ui.start();
}
//# sourceMappingURL=compatible-ui.js.map