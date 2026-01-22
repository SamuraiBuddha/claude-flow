"use strict";
/**
 * Claude-Flow UI Module
 * Provides compatible UI solutions for different terminal environments
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.showUISupport = exports.checkUISupport = exports.withRawModeFallback = exports.handleRawModeError = exports.launchUI = exports.isRawModeSupported = exports.createCompatibleUI = exports.CompatibleUI = void 0;
exports.launchBestUI = launchBestUI;
var compatible_ui_js_1 = require("./compatible-ui.js");
Object.defineProperty(exports, "CompatibleUI", { enumerable: true, get: function () { return compatible_ui_js_1.CompatibleUI; } });
Object.defineProperty(exports, "createCompatibleUI", { enumerable: true, get: function () { return compatible_ui_js_1.createCompatibleUI; } });
Object.defineProperty(exports, "isRawModeSupported", { enumerable: true, get: function () { return compatible_ui_js_1.isRawModeSupported; } });
Object.defineProperty(exports, "launchUI", { enumerable: true, get: function () { return compatible_ui_js_1.launchUI; } });
var fallback_handler_js_1 = require("./fallback-handler.js");
Object.defineProperty(exports, "handleRawModeError", { enumerable: true, get: function () { return fallback_handler_js_1.handleRawModeError; } });
Object.defineProperty(exports, "withRawModeFallback", { enumerable: true, get: function () { return fallback_handler_js_1.withRawModeFallback; } });
Object.defineProperty(exports, "checkUISupport", { enumerable: true, get: function () { return fallback_handler_js_1.checkUISupport; } });
Object.defineProperty(exports, "showUISupport", { enumerable: true, get: function () { return fallback_handler_js_1.showUISupport; } });
/**
 * Main UI launcher that automatically selects the best available UI
 */
async function launchBestUI() {
    const fallbackHandler = await Promise.resolve().then(() => __importStar(require('./fallback-handler.js')));
    const { checkUISupport, handleRawModeError } = fallbackHandler;
    const launchUI = fallbackHandler.launchUI;
    const support = checkUISupport();
    if (support.supported) {
        try {
            await launchUI();
        }
        catch (error) {
            if (error instanceof Error) {
                await handleRawModeError(error, {
                    enableUI: true,
                    fallbackMessage: 'Falling back to compatible UI mode',
                    showHelp: true,
                });
            }
        }
    }
    else {
        const { launchUI: launchCompatibleUI } = await Promise.resolve().then(() => __importStar(require('./compatible-ui.js')));
        console.log('🔄 Using compatible UI mode for this environment');
        await launchCompatibleUI();
    }
}
//# sourceMappingURL=index.js.map