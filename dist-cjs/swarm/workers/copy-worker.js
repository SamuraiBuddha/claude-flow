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
const worker_threads_1 = require("worker_threads");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
async function copyFile(file) {
    try {
        // Ensure destination directory exists
        const destDir = path.dirname(file.destPath);
        await fs.mkdir(destDir, { recursive: true });
        // Copy the file
        await fs.copyFile(file.sourcePath, file.destPath);
        // Preserve permissions if requested
        if (file.permissions) {
            await fs.chmod(file.destPath, file.permissions);
        }
        let hash;
        // Calculate hash if verification is requested
        if (file.verify) {
            const content = await fs.readFile(file.destPath);
            hash = (0, crypto_1.createHash)('sha256').update(content).digest('hex');
        }
        return {
            success: true,
            file: file.sourcePath,
            hash,
        };
    }
    catch (error) {
        return {
            success: false,
            file: file.sourcePath,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
async function main() {
    const data = worker_threads_1.workerData;
    if (!worker_threads_1.parentPort) {
        throw new Error('This script must be run as a worker thread');
    }
    for (const file of data.files) {
        const result = await copyFile(file);
        worker_threads_1.parentPort.postMessage(result);
    }
}
// Run the worker
main().catch((error) => {
    if (worker_threads_1.parentPort) {
        worker_threads_1.parentPort.postMessage({
            success: false,
            file: 'worker',
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
//# sourceMappingURL=copy-worker.js.map