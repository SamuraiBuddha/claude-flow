/**
 * Cliffy Node.js Adapter
 *
 * This adapter provides Node.js-compatible implementations of Cliffy modules
 * by wrapping existing Node.js packages to match the Cliffy API.
 */
import chalk from 'chalk';
import Table from 'cli-table3';
export declare const colors: {
    green: chalk.Chalk;
    red: chalk.Chalk;
    yellow: chalk.Chalk;
    blue: chalk.Chalk;
    gray: chalk.Chalk;
    cyan: chalk.Chalk;
    magenta: chalk.Chalk;
    white: chalk.Chalk;
    black: chalk.Chalk;
    bold: chalk.Chalk;
    dim: chalk.Chalk;
    italic: chalk.Chalk;
    underline: chalk.Chalk;
    bgRed: chalk.Chalk;
    bgGreen: chalk.Chalk;
    bgYellow: chalk.Chalk;
    bgBlue: chalk.Chalk;
};
export declare const Input: (options: {
    message: string;
    default?: string;
}) => Promise<any>;
export declare const Confirm: (options: {
    message: string;
    default?: boolean;
}) => Promise<any>;
export declare const Select: <T>(options: {
    message: string;
    options: Array<{
        name: string;
        value: T;
    }>;
    default?: T;
}) => Promise<T>;
export { Table };
//# sourceMappingURL=cliffy-node.d.ts.map