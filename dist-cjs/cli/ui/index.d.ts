/**
 * Claude-Flow UI Module
 * Provides compatible UI solutions for different terminal environments
 */
export { CompatibleUI, createCompatibleUI, isRawModeSupported, launchUI, type UIProcess, type UISystemStats, } from './compatible-ui.js';
export { handleRawModeError, withRawModeFallback, checkUISupport, showUISupport, type FallbackOptions, } from './fallback-handler.js';
/**
 * Main UI launcher that automatically selects the best available UI
 */
export declare function launchBestUI(): Promise<void>;
//# sourceMappingURL=index.d.ts.map