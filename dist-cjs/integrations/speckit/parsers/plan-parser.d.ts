/**
 * Plan Parser
 *
 * Parses plan.md, research.md, and data-model.md files into structured objects.
 * Handles the spec-kit template format for implementation planning documents.
 */
import { ImplementationPlan, ResearchDocument, DataModelDocument, ParseResult } from '../types.js';
/**
 * Parser for plan.md implementation plan files
 */
export declare class PlanParser {
    private errors;
    private warnings;
    /**
     * Parse a plan.md file content into an ImplementationPlan
     */
    parsePlan(content: string, filePath: string): ParseResult<ImplementationPlan>;
    /**
     * Parse a research.md file content into a ResearchDocument
     */
    parseResearch(content: string, filePath: string): ParseResult<ResearchDocument>;
    /**
     * Parse a data-model.md file content into a DataModelDocument
     */
    parseDataModel(content: string, filePath: string): ParseResult<DataModelDocument>;
    /**
     * Reset parser state
     */
    private reset;
    /**
     * Parse plan header metadata
     */
    private parsePlanHeader;
    /**
     * Parse technical context section
     */
    private parseTechnicalContext;
    /**
     * Parse constitution check section
     */
    private parseConstitutionCheck;
    /**
     * Parse project structure section
     */
    private parseProjectStructure;
    /**
     * Parse complexity tracking table
     */
    private parseComplexityTracking;
    /**
     * Parse research findings from sections
     */
    private parseResearchFindings;
    /**
     * Parse recommendations from content
     */
    private parseRecommendations;
    /**
     * Parse data entities from sections
     */
    private parseDataEntities;
    /**
     * Parse data attributes from content
     */
    private parseDataAttributes;
    /**
     * Parse data relationships from sections
     */
    private parseDataRelationships;
    /**
     * Parse cardinality string
     */
    private parseCardinality;
    /**
     * Extract mermaid diagram blocks
     */
    private extractMermaidDiagrams;
    /**
     * Parse implementation phases
     */
    private parsePhases;
    /**
     * Convert TechnicalContext to TechStack
     */
    private convertToTechStack;
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
     * Parse a markdown table
     */
    private parseTable;
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Generate content hash
     */
    private generateHash;
    /**
     * Validate the parsed plan
     */
    private validatePlan;
}
/**
 * Convenience functions
 */
export declare function parsePlan(content: string, filePath: string): ParseResult<ImplementationPlan>;
export declare function parseResearch(content: string, filePath: string): ParseResult<ResearchDocument>;
export declare function parseDataModel(content: string, filePath: string): ParseResult<DataModelDocument>;
export default PlanParser;
//# sourceMappingURL=plan-parser.d.ts.map