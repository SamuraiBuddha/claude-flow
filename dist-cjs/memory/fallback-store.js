"use strict";
/**
 * Fallback memory store that tries SQLite first, then falls back to in-memory storage
 * Designed to handle npx environments where native modules may fail to load
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FallbackMemoryStore = exports.memoryStore = void 0;
const sqlite_store_js_1 = require("./sqlite-store.js");
const in_memory_store_js_1 = require("./in-memory-store.js");
const sqlite_wrapper_js_1 = require("./sqlite-wrapper.js");
class FallbackMemoryStore {
    constructor(options = {}) {
        this.options = options;
        this.primaryStore = null;
        this.fallbackStore = null;
        this.useFallback = false;
        this.initializationAttempted = false;
    }
    async initialize() {
        if (this.initializationAttempted)
            return;
        this.initializationAttempted = true;
        // Check if SQLite is available before attempting initialization
        const sqliteAvailable = await (0, sqlite_wrapper_js_1.isSQLiteAvailable)();
        if (!sqliteAvailable) {
            // Skip SQLite initialization if module can't be loaded
            const loadError = (0, sqlite_wrapper_js_1.getLoadError)();
            console.error(`[${new Date().toISOString()}] WARN [fallback-store] SQLite module not available:`, loadError?.message || 'Unknown error');
            // Use in-memory store directly
            this.fallbackStore = new in_memory_store_js_1.InMemoryStore(this.options);
            await this.fallbackStore.initialize();
            this.useFallback = true;
            this._logFallbackUsage();
            return;
        }
        // Try to initialize SQLite store
        try {
            this.primaryStore = new sqlite_store_js_1.SqliteMemoryStore(this.options);
            await this.primaryStore.initialize();
            console.error(`[${new Date().toISOString()}] INFO [fallback-store] Successfully initialized SQLite store`);
            this.useFallback = false;
        }
        catch (error) {
            console.error(`[${new Date().toISOString()}] WARN [fallback-store] SQLite initialization failed:`, error.message);
            // Fall back to in-memory store
            this.fallbackStore = new in_memory_store_js_1.InMemoryStore(this.options);
            await this.fallbackStore.initialize();
            this.useFallback = true;
            this._logFallbackUsage();
        }
    }
    _logFallbackUsage() {
        console.error(`[${new Date().toISOString()}] INFO [fallback-store] Using in-memory store (data will not persist across sessions)`);
        if ((0, sqlite_wrapper_js_1.isWindows)()) {
            console.error(`[${new Date().toISOString()}] INFO [fallback-store] Windows detected. For persistent storage options, see: https://github.com/ruvnet/claude-code-flow/docs/windows-installation.md`);
        }
        else {
            console.error(`[${new Date().toISOString()}] INFO [fallback-store] To enable persistent storage, install the package locally: npm install claude-flow@alpha`);
        }
    }
    get activeStore() {
        return this.useFallback ? this.fallbackStore : this.primaryStore;
    }
    async store(key, value, options = {}) {
        await this.initialize();
        return this.activeStore.store(key, value, options);
    }
    async retrieve(key, options = {}) {
        await this.initialize();
        return this.activeStore.retrieve(key, options);
    }
    async list(options = {}) {
        await this.initialize();
        return this.activeStore.list(options);
    }
    async delete(key, options = {}) {
        await this.initialize();
        return this.activeStore.delete(key, options);
    }
    async search(pattern, options = {}) {
        await this.initialize();
        return this.activeStore.search(pattern, options);
    }
    async cleanup() {
        await this.initialize();
        return this.activeStore.cleanup();
    }
    close() {
        if (this.primaryStore) {
            this.primaryStore.close();
        }
        if (this.fallbackStore) {
            this.fallbackStore.close();
        }
    }
    isUsingFallback() {
        return this.useFallback;
    }
}
exports.FallbackMemoryStore = FallbackMemoryStore;
// Export a singleton instance for MCP server
exports.memoryStore = new FallbackMemoryStore();
exports.default = FallbackMemoryStore;
//# sourceMappingURL=fallback-store.js.map