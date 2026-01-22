/**
 * Standardized CLI Help Formatter
 * Follows Unix/Linux conventions for help output
 */
export interface CommandInfo {
    name: string;
    description: string;
    usage?: string;
    commands?: CommandItem[];
    options?: OptionItem[];
    examples?: string[];
    globalOptions?: OptionItem[];
}
export interface CommandItem {
    name: string;
    description: string;
    aliases?: string[];
}
export interface OptionItem {
    flags: string;
    description: string;
    defaultValue?: string;
    validValues?: string[];
}
export declare class HelpFormatter {
    private static readonly INDENT;
    private static readonly COLUMN_GAP;
    private static readonly MIN_DESCRIPTION_COLUMN;
    /**
     * Format main command help
     */
    static formatHelp(info: CommandInfo): string;
    /**
     * Format error message with usage hint
     */
    static formatError(error: string, command: string, usage?: string): string;
    /**
     * Format validation error with valid options
     */
    static formatValidationError(value: string, paramName: string, validOptions: string[], command: string): string;
    private static formatSection;
    private static formatCommands;
    private static formatOptions;
    /**
     * Strip ANSI color codes and emojis from text
     */
    static stripFormatting(text: string): string;
}
//# sourceMappingURL=help-formatter.d.ts.map