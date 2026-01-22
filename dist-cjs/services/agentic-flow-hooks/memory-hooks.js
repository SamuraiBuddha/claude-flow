"use strict";
/**
 * Memory persistence hooks for agentic-flow
 *
 * Provides cross-provider memory state management with
 * synchronization and persistence capabilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryPersistHook = exports.memorySyncHook = exports.postMemoryRetrieveHook = exports.preMemoryRetrieveHook = exports.postMemoryStoreHook = exports.preMemoryStoreHook = void 0;
exports.registerMemoryHooks = registerMemoryHooks;
const hook_manager_js_1 = require("./hook-manager.js");
// ===== Pre-Memory Store Hook =====
exports.preMemoryStoreHook = {
    id: 'agentic-pre-memory-store',
    type: 'pre-memory-store',
    priority: 100,
    handler: async (payload, context) => {
        const { namespace, key, value, ttl, provider } = payload;
        const sideEffects = [];
        // Validate memory constraints
        const validation = await validateMemoryStore(namespace, key, value, context);
        if (!validation.valid) {
            return {
                continue: false,
                sideEffects: [
                    {
                        type: 'log',
                        action: 'write',
                        data: {
                            level: 'error',
                            message: 'Memory store validation failed',
                            data: validation,
                        },
                    },
                ],
            };
        }
        // Compress large values
        let processedValue = value;
        if (shouldCompress(value)) {
            processedValue = await compressValue(value);
            sideEffects.push({
                type: 'metric',
                action: 'increment',
                data: { name: 'memory.compressions' },
            });
        }
        // Add metadata
        const enrichedValue = {
            data: processedValue,
            metadata: {
                stored: Date.now(),
                provider,
                sessionId: context.sessionId,
                compressed: processedValue !== value,
                size: getValueSize(processedValue),
            },
        };
        // Track memory usage
        sideEffects.push({
            type: 'metric',
            action: 'update',
            data: {
                name: `memory.usage.${namespace}`,
                value: getValueSize(enrichedValue),
            },
        });
        return {
            continue: true,
            modified: true,
            payload: {
                ...payload,
                value: enrichedValue,
            },
            sideEffects,
        };
    },
};
// ===== Post-Memory Store Hook =====
exports.postMemoryStoreHook = {
    id: 'agentic-post-memory-store',
    type: 'post-memory-store',
    priority: 100,
    handler: async (payload, context) => {
        const { namespace, key, value, crossProvider, syncTargets } = payload;
        const sideEffects = [];
        // Cross-provider sync if enabled
        if (crossProvider && syncTargets && syncTargets.length > 0) {
            for (const target of syncTargets) {
                sideEffects.push({
                    type: 'memory',
                    action: 'sync',
                    data: {
                        source: payload.provider,
                        target,
                        namespace,
                        key,
                        value,
                    },
                });
            }
        }
        // Update memory index for search
        if (key) {
            await updateMemoryIndex(namespace, key, value, context);
        }
        // Neural pattern detection
        const patterns = key ? await detectMemoryPatterns(namespace, key, value, context) : [];
        if (patterns.length > 0) {
            sideEffects.push({
                type: 'neural',
                action: 'analyze',
                data: {
                    patterns,
                    context: { namespace, key },
                },
            });
        }
        // Emit memory change event
        sideEffects.push({
            type: 'notification',
            action: 'emit',
            data: {
                event: 'memory:stored',
                data: { namespace, key, size: getValueSize(value) },
            },
        });
        return {
            continue: true,
            sideEffects,
        };
    },
};
// ===== Pre-Memory Retrieve Hook =====
exports.preMemoryRetrieveHook = {
    id: 'agentic-pre-memory-retrieve',
    type: 'pre-memory-retrieve',
    priority: 100,
    handler: async (payload, context) => {
        const { namespace, key } = payload;
        // Check local cache first
        const cached = await checkLocalCache(namespace, key, context);
        if (cached) {
            return {
                continue: false,
                modified: true,
                payload: {
                    ...payload,
                    value: cached,
                },
                sideEffects: [
                    {
                        type: 'metric',
                        action: 'increment',
                        data: { name: 'memory.cache.hits' },
                    },
                ],
            };
        }
        // Pre-fetch related keys
        const relatedKeys = await findRelatedKeys(namespace, key, context);
        if (relatedKeys.length > 0) {
            // Trigger background fetch
            prefetchKeys(namespace, relatedKeys, context);
        }
        return {
            continue: true,
            sideEffects: [
                {
                    type: 'metric',
                    action: 'increment',
                    data: { name: `memory.retrievals.${namespace}` },
                },
            ],
        };
    },
};
// ===== Post-Memory Retrieve Hook =====
exports.postMemoryRetrieveHook = {
    id: 'agentic-post-memory-retrieve',
    type: 'post-memory-retrieve',
    priority: 100,
    handler: async (payload, context) => {
        const { namespace, key, value } = payload;
        if (!value) {
            return { continue: true };
        }
        const sideEffects = [];
        // Decompress if needed
        let processedValue = value;
        if (value.metadata?.compressed) {
            processedValue = await decompressValue(value.data);
            sideEffects.push({
                type: 'metric',
                action: 'increment',
                data: { name: 'memory.decompressions' },
            });
        }
        // Update access patterns
        await updateAccessPattern(namespace, key, context);
        // Cache locally for fast access
        await cacheLocally(namespace, key, processedValue, context);
        // Track retrieval latency
        const latency = Date.now() - context.timestamp;
        sideEffects.push({
            type: 'metric',
            action: 'update',
            data: {
                name: `memory.latency.${namespace}`,
                value: latency,
            },
        });
        return {
            continue: true,
            modified: true,
            payload: {
                ...payload,
                value: processedValue.data || processedValue,
            },
            sideEffects,
        };
    },
};
// ===== Memory Sync Hook =====
exports.memorySyncHook = {
    id: 'agentic-memory-sync',
    type: 'memory-sync',
    priority: 100,
    handler: async (payload, context) => {
        const { operation, namespace, provider, syncTargets } = payload;
        const sideEffects = [];
        switch (operation) {
            case 'sync':
                // Bidirectional sync
                const changes = await detectMemoryChanges(namespace, provider, context);
                if (changes.length > 0) {
                    sideEffects.push({
                        type: 'log',
                        action: 'write',
                        data: {
                            level: 'info',
                            message: `Syncing ${changes.length} memory changes`,
                            data: { namespace, provider, targets: syncTargets },
                        },
                    });
                    // Apply changes
                    for (const change of changes) {
                        await applyMemoryChange(change, syncTargets || [], context);
                    }
                    sideEffects.push({
                        type: 'metric',
                        action: 'update',
                        data: {
                            name: 'memory.sync.changes',
                            value: changes.length,
                        },
                    });
                }
                break;
            case 'persist':
                // Persist to long-term storage
                const snapshot = await createMemorySnapshot(namespace, context);
                sideEffects.push({
                    type: 'memory',
                    action: 'store',
                    data: {
                        key: `snapshot:${namespace}:${Date.now()}`,
                        value: snapshot,
                        ttl: 0, // No expiration
                    },
                });
                sideEffects.push({
                    type: 'notification',
                    action: 'emit',
                    data: {
                        event: 'memory:persisted',
                        data: { namespace, size: snapshot.size },
                    },
                });
                break;
            case 'expire':
                // Clean up expired entries
                const expired = await findExpiredEntries(namespace, context);
                if (expired.length > 0) {
                    for (const key of expired) {
                        await removeMemoryEntry(namespace, key, context);
                    }
                    sideEffects.push({
                        type: 'metric',
                        action: 'update',
                        data: {
                            name: 'memory.expired',
                            value: expired.length,
                        },
                    });
                }
                break;
        }
        return {
            continue: true,
            sideEffects,
        };
    },
};
// ===== Memory Persist Hook =====
exports.memoryPersistHook = {
    id: 'agentic-memory-persist',
    type: 'memory-persist',
    priority: 90,
    handler: async (payload, context) => {
        const { namespace } = payload;
        // Create full memory backup
        const backup = await createFullBackup(namespace, context);
        // Store backup with metadata
        const backupData = {
            timestamp: Date.now(),
            sessionId: context.sessionId,
            namespace,
            entries: backup.entries,
            size: backup.size,
            checksum: calculateChecksum(backup),
        };
        return {
            continue: true,
            sideEffects: [
                {
                    type: 'memory',
                    action: 'store',
                    data: {
                        key: `backup:${namespace}:${context.sessionId}`,
                        value: backupData,
                        ttl: 604800, // 7 days
                    },
                },
                {
                    type: 'notification',
                    action: 'emit',
                    data: {
                        event: 'memory:backup:created',
                        data: {
                            namespace,
                            size: backup.size,
                            entries: backup.entries.length,
                        },
                    },
                },
            ],
        };
    },
};
// ===== Helper Functions =====
async function validateMemoryStore(namespace, key, value, context) {
    // Check size limits
    const size = getValueSize(value);
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (size > maxSize) {
        return {
            valid: false,
            reason: `Value size ${size} exceeds limit ${maxSize}`,
        };
    }
    // Check namespace quota
    const quota = await getNamespaceQuota(namespace, context);
    const usage = await getNamespaceUsage(namespace, context);
    if (usage + size > quota) {
        return {
            valid: false,
            reason: `Namespace quota exceeded: ${usage + size} > ${quota}`,
        };
    }
    // Validate key format
    if (key && !isValidKey(key)) {
        return {
            valid: false,
            reason: `Invalid key format: ${key}`,
        };
    }
    return { valid: true };
}
function shouldCompress(value) {
    const size = getValueSize(value);
    return size > 1024; // Compress if larger than 1KB
}
async function compressValue(value) {
    // Implement compression (placeholder)
    // In real implementation, use zlib or similar
    return {
        compressed: true,
        data: JSON.stringify(value),
    };
}
async function decompressValue(value) {
    // Implement decompression (placeholder)
    if (value.compressed) {
        return JSON.parse(value.data);
    }
    return value;
}
function getValueSize(value) {
    return Buffer.byteLength(JSON.stringify(value), 'utf8');
}
async function updateMemoryIndex(namespace, key, value, context) {
    // Update search index (placeholder)
    // In real implementation, update inverted index for search
}
async function detectMemoryPatterns(namespace, key, value, context) {
    // Detect patterns in memory usage
    const patterns = [];
    // Check for sequential access pattern
    const accessHistory = await getAccessHistory(namespace, context);
    if (isSequentialPattern(accessHistory)) {
        patterns.push({
            type: 'sequential',
            confidence: 0.8,
            suggestion: 'prefetch-next',
        });
    }
    // Check for temporal patterns
    if (isTemporalPattern(accessHistory)) {
        patterns.push({
            type: 'temporal',
            confidence: 0.7,
            suggestion: 'cache-duration',
        });
    }
    return patterns;
}
async function checkLocalCache(namespace, key, context) {
    const cacheKey = `${namespace}:${key}`;
    return context.memory.cache.get(cacheKey);
}
async function findRelatedKeys(namespace, key, context) {
    // Find related keys based on patterns
    // Placeholder implementation
    return [];
}
async function prefetchKeys(namespace, keys, context) {
    // Trigger background prefetch
    // Placeholder implementation
}
async function updateAccessPattern(namespace, key, context) {
    // Track access patterns for optimization
    const patternKey = `pattern:${namespace}:${key}`;
    const pattern = await context.memory.cache.get(patternKey) || {
        accesses: [],
        lastAccess: 0,
    };
    pattern.accesses.push(Date.now());
    pattern.lastAccess = Date.now();
    // Keep last 100 accesses
    if (pattern.accesses.length > 100) {
        pattern.accesses = pattern.accesses.slice(-100);
    }
    await context.memory.cache.set(patternKey, pattern);
}
async function cacheLocally(namespace, key, value, context) {
    const cacheKey = `${namespace}:${key}`;
    context.memory.cache.set(cacheKey, value);
}
async function detectMemoryChanges(namespace, provider, context) {
    // Detect changes for sync
    // Placeholder implementation
    return [];
}
async function applyMemoryChange(change, targets, context) {
    // Apply memory change to targets
    // Placeholder implementation
}
async function createMemorySnapshot(namespace, context) {
    // Create snapshot of namespace
    // Placeholder implementation
    return {
        namespace,
        timestamp: Date.now(),
        entries: [],
        size: 0,
    };
}
async function findExpiredEntries(namespace, context) {
    // Find expired entries
    // Placeholder implementation
    return [];
}
async function removeMemoryEntry(namespace, key, context) {
    // Remove memory entry
    // Placeholder implementation
}
async function createFullBackup(namespace, context) {
    // Create full backup
    // Placeholder implementation
    return {
        entries: [],
        size: 0,
    };
}
function calculateChecksum(data) {
    // Calculate checksum
    // Placeholder implementation
    return 'checksum';
}
async function getNamespaceQuota(namespace, context) {
    // Get namespace quota
    return 100 * 1024 * 1024; // 100MB default
}
async function getNamespaceUsage(namespace, context) {
    // Get current usage
    // Placeholder implementation
    return 0;
}
function isValidKey(key) {
    // Validate key format
    return /^[a-zA-Z0-9:_\-./]+$/.test(key);
}
async function getAccessHistory(namespace, context) {
    // Get access history
    // Placeholder implementation
    return [];
}
function isSequentialPattern(history) {
    // Check for sequential access
    // Placeholder implementation
    return false;
}
function isTemporalPattern(history) {
    // Check for temporal patterns
    // Placeholder implementation
    return false;
}
// ===== Register Hooks =====
function registerMemoryHooks() {
    hook_manager_js_1.agenticHookManager.register(exports.preMemoryStoreHook);
    hook_manager_js_1.agenticHookManager.register(exports.postMemoryStoreHook);
    hook_manager_js_1.agenticHookManager.register(exports.preMemoryRetrieveHook);
    hook_manager_js_1.agenticHookManager.register(exports.postMemoryRetrieveHook);
    hook_manager_js_1.agenticHookManager.register(exports.memorySyncHook);
    hook_manager_js_1.agenticHookManager.register(exports.memoryPersistHook);
}
//# sourceMappingURL=memory-hooks.js.map