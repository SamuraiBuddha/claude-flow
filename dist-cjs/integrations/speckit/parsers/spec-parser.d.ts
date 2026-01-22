/**
 * Specification Parser
 *
 * Parses spec.md files into structured SpecificationDocument objects.
 * Handles the spec-kit template format with user stories, requirements,
 * success criteria, and edge cases.
 */
import { SpecificationDocument, ParseResult } from '../types.js';
/**
 * Parser for spec.md specification files
 */
export declare class SpecParser {
    private errors;
    private warnings;
    private lines;
    private currentLine;
    /**
     * Parse a spec.md file content into a SpecificationDocument
     */
    parse(content: string, filePath: string): ParseResult<SpecificationDocument>;
    /**
     * Reset parser state
     */
    private reset;
    /**
     * Parse header metadata from the spec document
     */
    private parseHeader;
    /**
     * Parse markdown into a hierarchical section structure
     */
    private parseMarkdownSections;
    /**
     * Find a section by title (case-insensitive, partial match)
     */
    private findSection;
    /**
     * Find all sections matching a pattern
     */
    private findAllSections;
    /**
     * Parse user stories from the document
     */
    private parseUserStories;
    /**
     * Parse a single user story from a section
     */
    private parseUserStory;
    /**
     * Parse acceptance scenarios from content
     */
    private parseAcceptanceScenarios;
    /**
     * Parse requirements from the document
     */
    private parseRequirements;
    /**
     * Parse a list of requirements from content
     */
    private parseRequirementsList;
    /**
     * Parse success criteria from the document
     */
    private parseSuccessCriteria;
    /**
     * Parse edge cases from the document
     */
    private parseEdgeCases;
    /**
     * Parse entities from the document
     */
    private parseEntities;
    /**
     * Generate a unique ID for the specification
     */
    private generateId;
    /**
     * Generate a hash of the content for change detection
     */
    private generateHash;
    /**
     * Validate the parsed document and add warnings
     */
    private validateDocument;
}
/**
 * Convenience function to parse a spec file
 */
export declare function parseSpec(content: string, filePath: string): ParseResult<SpecificationDocument>;
export default SpecParser;
//# sourceMappingURL=spec-parser.d.ts.map