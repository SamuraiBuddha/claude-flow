import { PromptCopier } from './prompt-copier.js';
import type { CopyOptions, CopyResult } from './prompt-copier.js';
export declare class EnhancedPromptCopier extends PromptCopier {
    private workerPool?;
    private workerResults;
    constructor(options: CopyOptions);
    protected copyFilesParallel(): Promise<void>;
    private initializeWorkerPool;
    private processWithWorkerPool;
    private processChunkWithWorker;
    private processChunkResults;
    private handleWorkerResult;
    private terminateWorkers;
    protected verifyFiles(): Promise<void>;
}
export declare function copyPromptsEnhanced(options: CopyOptions): Promise<CopyResult>;
//# sourceMappingURL=prompt-copier-enhanced.d.ts.map