"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printSuccess = printSuccess;
exports.printError = printError;
exports.printWarning = printWarning;
exports.printInfo = printInfo;
// init/utils.ts - Utility functions for init module
function printSuccess(message) {
    console.log(`\x1b[32m✅ ${message}\x1b[0m`);
}
function printError(message) {
    console.log(`\x1b[31m❌ ${message}\x1b[0m`);
}
function printWarning(message) {
    console.log(`\x1b[33m⚠️  ${message}\x1b[0m`);
}
function printInfo(message) {
    console.log(`\x1b[36mℹ️  ${message}\x1b[0m`);
}
//# sourceMappingURL=utils.js.map