"use strict";
/**
 * CLI Parameter Validation Helper
 * Provides standardized error messages for invalid parameters
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
exports.ValidationHelper = void 0;
const help_formatter_js_1 = require("./help-formatter.js");
class ValidationHelper {
    /**
     * Validate enum parameter
     */
    static validateEnum(value, paramName, validOptions, commandPath) {
        if (!validOptions.includes(value)) {
            console.error(help_formatter_js_1.HelpFormatter.formatValidationError(value, paramName, validOptions, commandPath));
            process.exit(1);
        }
    }
    /**
     * Validate numeric parameter
     */
    static validateNumber(value, paramName, min, max, commandPath) {
        const num = parseInt(value, 10);
        if (isNaN(num)) {
            console.error(help_formatter_js_1.HelpFormatter.formatError(`'${value}' is not a valid number for ${paramName}.`, commandPath || 'claude-flow'));
            process.exit(1);
        }
        if (min !== undefined && num < min) {
            console.error(help_formatter_js_1.HelpFormatter.formatError(`${paramName} must be at least ${min}. Got: ${num}`, commandPath || 'claude-flow'));
            process.exit(1);
        }
        if (max !== undefined && num > max) {
            console.error(help_formatter_js_1.HelpFormatter.formatError(`${paramName} must be at most ${max}. Got: ${num}`, commandPath || 'claude-flow'));
            process.exit(1);
        }
        return num;
    }
    /**
     * Validate required parameter
     */
    static validateRequired(value, paramName, commandPath) {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            console.error(help_formatter_js_1.HelpFormatter.formatError(`Missing required parameter: ${paramName}`, commandPath || 'claude-flow'));
            process.exit(1);
        }
    }
    /**
     * Validate file path exists
     */
    static async validateFilePath(path, paramName, commandPath) {
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            await fs.access(path);
        }
        catch (error) {
            console.error(help_formatter_js_1.HelpFormatter.formatError(`File not found for ${paramName}: ${path}`, commandPath || 'claude-flow'));
            process.exit(1);
        }
    }
    /**
     * Validate boolean flag
     */
    static validateBoolean(value, paramName, commandPath) {
        const lowerValue = value.toLowerCase();
        if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
            return true;
        }
        if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
            return false;
        }
        console.error(help_formatter_js_1.HelpFormatter.formatError(`'${value}' is not a valid boolean for ${paramName}. Use: true, false, yes, no, 1, or 0.`, commandPath || 'claude-flow'));
        process.exit(1);
    }
}
exports.ValidationHelper = ValidationHelper;
//# sourceMappingURL=validation-helper.js.map