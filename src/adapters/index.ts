/**
 * Adapters Index
 *
 * Cross-platform adapters for Claude Flow
 */

// Cliffy Node.js adapter for CLI compatibility
export * from './cliffy-node.js';

// Windows Shell Adapter for Unix → PowerShell command translation
export { WindowsShellAdapter } from './WindowsShellAdapter.js';
