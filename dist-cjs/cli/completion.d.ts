/**
 * Shell completion generator for Claude-Flow CLI
 */
export declare class CompletionGenerator {
    private commands;
    private subcommands;
    generate(shell: string, install?: boolean): Promise<void>;
    private detectShell;
    private generateBashCompletion;
    private generateZshCompletion;
    private generateFishCompletion;
    private getBashCompletionScript;
    private getZshCompletionScript;
    private getFishCompletionScript;
    private installBashCompletion;
    private installZshCompletion;
    private installFishCompletion;
}
//# sourceMappingURL=completion.d.ts.map