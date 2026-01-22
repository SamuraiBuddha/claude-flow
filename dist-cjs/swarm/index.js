"use strict";
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOptimizedSwarmStack = exports.OptimizedExecutor = exports.TTLMap = exports.CircularBuffer = exports.AsyncFileManager = exports.ClaudeConnectionPool = void 0;
exports.getSwarmComponents = getSwarmComponents;
// Main exports for the swarm system
__exportStar(require("./coordinator.js"), exports);
__exportStar(require("./executor.js"), exports);
__exportStar(require("./types.js"), exports);
__exportStar(require("./strategies/base.js"), exports);
__exportStar(require("./strategies/auto.js"), exports);
__exportStar(require("./strategies/research.js"), exports);
__exportStar(require("./memory.js"), exports);
// Prompt copying system exports
__exportStar(require("./prompt-copier.js"), exports);
__exportStar(require("./prompt-copier-enhanced.js"), exports);
__exportStar(require("./prompt-utils.js"), exports);
__exportStar(require("./prompt-manager.js"), exports);
__exportStar(require("./prompt-cli.js"), exports);
// Optimizations - explicit exports to avoid naming conflicts with executor.js
var index_js_1 = require("./optimizations/index.js");
Object.defineProperty(exports, "ClaudeConnectionPool", { enumerable: true, get: function () { return index_js_1.ClaudeConnectionPool; } });
Object.defineProperty(exports, "AsyncFileManager", { enumerable: true, get: function () { return index_js_1.AsyncFileManager; } });
Object.defineProperty(exports, "CircularBuffer", { enumerable: true, get: function () { return index_js_1.CircularBuffer; } });
Object.defineProperty(exports, "TTLMap", { enumerable: true, get: function () { return index_js_1.TTLMap; } });
Object.defineProperty(exports, "OptimizedExecutor", { enumerable: true, get: function () { return index_js_1.OptimizedExecutor; } });
Object.defineProperty(exports, "createOptimizedSwarmStack", { enumerable: true, get: function () { return index_js_1.createOptimizedSwarmStack; } });
// Utility function to get all exports
function getSwarmComponents() {
    return {
        // Core components
        coordinator: () => Promise.resolve().then(() => __importStar(require('./coordinator.js'))),
        executor: () => Promise.resolve().then(() => __importStar(require('./executor.js'))),
        types: () => Promise.resolve().then(() => __importStar(require('./types.js'))),
        // Strategies
        strategies: {
            base: () => Promise.resolve().then(() => __importStar(require('./strategies/base.js'))),
            auto: () => Promise.resolve().then(() => __importStar(require('./strategies/auto.js'))),
            research: () => Promise.resolve().then(() => __importStar(require('./strategies/research.js'))),
        },
        // Memory
        memory: () => Promise.resolve().then(() => __importStar(require('./memory.js'))),
        // Prompt system
        promptCopier: () => Promise.resolve().then(() => __importStar(require('./prompt-copier.js'))),
        promptCopierEnhanced: () => Promise.resolve().then(() => __importStar(require('./prompt-copier-enhanced.js'))),
        promptUtils: () => Promise.resolve().then(() => __importStar(require('./prompt-utils.js'))),
        promptManager: () => Promise.resolve().then(() => __importStar(require('./prompt-manager.js'))),
        promptCli: () => Promise.resolve().then(() => __importStar(require('./prompt-cli.js'))),
        // Optimizations
        optimizations: () => Promise.resolve().then(() => __importStar(require('./optimizations/index.js'))),
    };
}
//# sourceMappingURL=index.js.map