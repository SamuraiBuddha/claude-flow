/**
 * Constitution Parser
 *
 * Parses constitution.md files into structured ConstitutionDocument objects
 * with enforceable rules. Handles the spec-kit template format with
 * principles, sections, and governance rules.
 */
import { ConstitutionDocument, ConstitutionPrinciple, ConstitutionRule, RuleCheckType, ParseResult } from '../types.js';
/**
 * Default principles for the 9 Articles (spec-kit standard)
 */
export declare const DEFAULT_PRINCIPLES: Partial<ConstitutionPrinciple>[];
/**
 * Parser for constitution.md files
 */
export declare class ConstitutionParser {
    private errors;
    private warnings;
    /**
     * Parse a constitution.md file content into a ConstitutionDocument
     */
    parse(content: string, filePath: string): ParseResult<ConstitutionDocument>;
    /**
     * Reset parser state
     */
    private reset;
    /**
     * Parse header metadata
     */
    private parseHeader;
    /**
     * Parse principles from sections
     */
    private parsePrinciples;
    /**
     * Parse a single principle from a section
     */
    private parsePrinciple;
    /**
     * Parse rules from principle content
     */
    private parseRules;
    /**
     * Determine enforcement level from name and content
     */
    private determineEnforcementLevel;
    /**
     * Determine check type from rule text
     */
    private determineCheckType;
    /**
     * Create error message for a rule
     */
    private createErrorMessage;
    /**
     * Parse additional sections (not principles)
     */
    private parseAdditionalSections;
    /**
     * Parse governance rules
     */
    private parseGovernance;
    /**
     * Convert a name to Roman numeral (for ID generation)
     */
    private romanize;
    /**
     * Parse markdown into sections
     */
    private parseMarkdownSections;
    /**
     * Find a section by title pattern
     */
    private findSection;
    /**
     * Find all sections matching a pattern
     */
    private findAllSections;
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Generate content hash
     */
    private generateHash;
    /**
     * Validate the parsed constitution
     */
    private validateConstitution;
    /**
     * Get a principle by ID or name
     */
    getPrinciple(constitution: ConstitutionDocument, idOrName: string): ConstitutionPrinciple | undefined;
    /**
     * Get all mandatory principles
     */
    getMandatoryPrinciples(constitution: ConstitutionDocument): ConstitutionPrinciple[];
    /**
     * Get all rules of a specific check type
     */
    getRulesByCheckType(constitution: ConstitutionDocument, checkType: RuleCheckType): Array<{
        principle: ConstitutionPrinciple;
        rule: ConstitutionRule;
    }>;
}
/**
 * Convenience function to parse a constitution file
 */
export declare function parseConstitution(content: string, filePath: string): ParseResult<ConstitutionDocument>;
export default ConstitutionParser;
//# sourceMappingURL=constitution-parser.d.ts.map