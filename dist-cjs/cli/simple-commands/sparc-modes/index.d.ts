/**
 * Get orchestration template for a specific mode
 * @param {string} modeSlug - The mode slug identifier
 * @param {string} taskDescription - The task description
 * @param {string} memoryNamespace - The memory namespace
 * @returns {string} The orchestration template
 */
export function getModeOrchestration(modeSlug: string, taskDescription: string, memoryNamespace: string): string;
/**
 * Get the base SPARC prompt template
 * @param {Object} mode - The mode configuration
 * @param {string} taskDescription - The task description
 * @param {string} memoryNamespace - The memory namespace
 * @returns {string} The complete SPARC prompt
 */
export function createSparcPrompt(mode: Object, taskDescription: string, memoryNamespace: string): string;
//# sourceMappingURL=index.d.ts.map