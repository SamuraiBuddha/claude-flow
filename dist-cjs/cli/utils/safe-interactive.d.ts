/**
 * Wraps an interactive function with safety checks
 * @param {Function} interactiveFn - The interactive function to wrap
 * @param {Function} fallbackFn - The non-interactive fallback function
 * @param {Object} options - Options for the wrapper
 * @returns {Function} The wrapped function
 */
export function safeInteractive(interactiveFn: Function, fallbackFn: Function, options?: Object): Function;
/**
 * Create a non-interactive version of a prompt
 * @param {string} message - The prompt message
 * @param {*} defaultValue - The default value to use
 * @returns {*} The default value
 */
export function nonInteractivePrompt(message: string, defaultValue: any): any;
/**
 * Create a non-interactive version of a selection
 * @param {string} message - The selection message
 * @param {Array} choices - The available choices
 * @param {*} defaultChoice - The default choice
 * @returns {*} The default choice
 */
export function nonInteractiveSelect(message: string, choices: any[], defaultChoice: any): any;
/**
 * Show a non-interactive progress indicator
 * @param {string} message - The progress message
 * @returns {Object} Progress control object
 */
export function nonInteractiveProgress(message: string): Object;
//# sourceMappingURL=safe-interactive.d.ts.map