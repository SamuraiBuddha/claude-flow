/**
 * Specification Parser
 *
 * Parses spec.md files into structured SpecificationDocument objects.
 * Handles the spec-kit template format with user stories, requirements,
 * success criteria, and edge cases.
 */

import * as crypto from 'crypto';
import {
  SpecificationDocument,
  UserStory,
  AcceptanceCriterion,
  Requirement,
  SuccessCriterion,
  EdgeCase,
  Entity,
  ParseResult,
  ParseError,
  ParseWarning,
  Priority,
  SpecStatus,
  MarkdownSection,
} from '../types.js';

/**
 * Parser for spec.md specification files
 */
export class SpecParser {
  private errors: ParseError[] = [];
  private warnings: ParseWarning[] = [];
  private lines: string[] = [];
  private currentLine = 0;

  /**
   * Parse a spec.md file content into a SpecificationDocument
   */
  public parse(content: string, filePath: string): ParseResult<SpecificationDocument> {
    this.reset();
    this.lines = content.split('\n');

    try {
      // Extract header metadata
      const metadata = this.parseHeader();

      // Parse sections
      const sections = this.parseMarkdownSections(content);

      // Extract user stories
      const userStories = this.parseUserStories(sections);

      // Extract requirements
      const { functional, nonFunctional } = this.parseRequirements(sections);

      // Extract success criteria
      const successCriteria = this.parseSuccessCriteria(sections);

      // Extract edge cases
      const edgeCases = this.parseEdgeCases(sections);

      // Extract entities if present
      const entities = this.parseEntities(sections);

      // Generate ID and hash
      const id = this.generateId(filePath, metadata.featureName);
      const hash = this.generateHash(content);

      const document: SpecificationDocument = {
        id,
        type: 'specification',
        path: filePath,
        name: metadata.featureName || 'Unknown Feature',
        createdAt: metadata.createdAt || new Date(),
        updatedAt: new Date(),
        hash,
        metadata: {},
        specId: id,
        featureName: metadata.featureName || 'Unknown Feature',
        featureBranch: metadata.featureBranch || '',
        version: '1.0.0',
        branchName: metadata.featureBranch || '',
        status: metadata.status || 'draft',
        userStories,
        functionalRequirements: functional,
        nonFunctionalRequirements: nonFunctional,
        requirements: [...functional, ...nonFunctional],
        successCriteria,
        edgeCases,
        entities,
        clarifications: [],
      };

      // Validation warnings
      this.validateDocument(document);

      return {
        success: this.errors.length === 0,
        data: document,
        errors: this.errors,
        warnings: this.warnings,
      };
    } catch (error) {
      this.errors.push({
        message: `Failed to parse specification: ${error instanceof Error ? error.message : String(error)}`,
        code: 'PARSE_FAILED',
      });
      return {
        success: false,
        errors: this.errors,
        warnings: this.warnings,
      };
    }
  }

  /**
   * Reset parser state
   */
  private reset(): void {
    this.errors = [];
    this.warnings = [];
    this.lines = [];
    this.currentLine = 0;
  }

  /**
   * Parse header metadata from the spec document
   */
  private parseHeader(): {
    featureName: string;
    featureBranch: string;
    createdAt: Date | null;
    status: SpecStatus;
  } {
    let featureName = '';
    let featureBranch = '';
    let createdAt: Date | null = null;
    let status: SpecStatus = 'draft';

    // Look for the title and header metadata
    for (let i = 0; i < Math.min(this.lines.length, 20); i++) {
      const line = this.lines[i];

      // Feature name from title
      const titleMatch = line.match(/^#\s+Feature Specification:\s*(.+)/i);
      if (titleMatch) {
        featureName = titleMatch[1].trim();
      }

      // Alternative title format
      const altTitleMatch = line.match(/^#\s+(.+)/);
      if (altTitleMatch && !featureName && !line.includes('User Scenarios')) {
        featureName = altTitleMatch[1].replace(/Feature Specification:\s*/i, '').trim();
      }

      // Feature branch
      const branchMatch = line.match(/\*\*Feature Branch\*\*:\s*`?([^`\s]+)`?/i);
      if (branchMatch) {
        featureBranch = branchMatch[1].trim();
      }

      // Created date
      const dateMatch = line.match(/\*\*Created\*\*:\s*(.+)/i);
      if (dateMatch) {
        const dateStr = dateMatch[1].trim();
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          createdAt = parsedDate;
        }
      }

      // Status
      const statusMatch = line.match(/\*\*Status\*\*:\s*(\w+)/i);
      if (statusMatch) {
        const statusStr = statusMatch[1].toLowerCase();
        if (['draft', 'review', 'approved', 'implemented', 'deprecated'].includes(statusStr)) {
          status = statusStr as SpecStatus;
        }
      }
    }

    if (!featureName) {
      this.warnings.push({
        message: 'Could not extract feature name from specification',
        suggestion: 'Ensure the spec has a title like "# Feature Specification: [NAME]"',
      });
    }

    return { featureName, featureBranch, createdAt, status };
  }

  /**
   * Parse markdown into a hierarchical section structure
   */
  private parseMarkdownSections(content: string): MarkdownSection[] {
    const sections: MarkdownSection[] = [];
    const lines = content.split('\n');
    const stack: MarkdownSection[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^(#{1,6})\s+(.+)/);

      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();

        // Find where this section ends (next header of same or higher level, or EOF)
        let endLine = lines.length - 1;
        for (let j = i + 1; j < lines.length; j++) {
          const nextHeaderMatch = lines[j].match(/^(#{1,6})\s+/);
          if (nextHeaderMatch && nextHeaderMatch[1].length <= level) {
            endLine = j - 1;
            break;
          }
        }

        // Extract content between this header and the end
        const contentLines = lines.slice(i + 1, endLine + 1);
        const sectionContent = contentLines.join('\n').trim();

        const section: MarkdownSection = {
          level,
          title,
          content: sectionContent,
          children: [],
          lineStart: i,
          lineEnd: endLine,
        };

        // Find parent and add to tree
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          sections.push(section);
        } else {
          stack[stack.length - 1].children.push(section);
        }

        stack.push(section);
      }
    }

    return sections;
  }

  /**
   * Find a section by title (case-insensitive, partial match)
   */
  private findSection(sections: MarkdownSection[], titlePattern: string | RegExp): MarkdownSection | null {
    const pattern = typeof titlePattern === 'string'
      ? new RegExp(titlePattern, 'i')
      : titlePattern;

    for (const section of sections) {
      if (pattern.test(section.title)) {
        return section;
      }
      const found = this.findSection(section.children, pattern);
      if (found) return found;
    }
    return null;
  }

  /**
   * Find all sections matching a pattern
   */
  private findAllSections(sections: MarkdownSection[], titlePattern: string | RegExp): MarkdownSection[] {
    const pattern = typeof titlePattern === 'string'
      ? new RegExp(titlePattern, 'i')
      : titlePattern;
    const results: MarkdownSection[] = [];

    for (const section of sections) {
      if (pattern.test(section.title)) {
        results.push(section);
      }
      results.push(...this.findAllSections(section.children, pattern));
    }
    return results;
  }

  /**
   * Parse user stories from the document
   */
  private parseUserStories(sections: MarkdownSection[]): UserStory[] {
    const userStories: UserStory[] = [];

    // Find user story sections (e.g., "User Story 1", "User Story 2")
    const storySections = this.findAllSections(sections, /User Story\s*\d+/i);

    for (const section of storySections) {
      const story = this.parseUserStory(section);
      if (story) {
        userStories.push(story);
      }
    }

    if (userStories.length === 0) {
      this.warnings.push({
        message: 'No user stories found in specification',
        suggestion: 'Add user stories using the format "### User Story 1 - [Title] (Priority: P1)"',
      });
    }

    return userStories;
  }

  /**
   * Parse a single user story from a section
   */
  private parseUserStory(section: MarkdownSection): UserStory | null {
    // Extract ID from title (e.g., "User Story 1")
    const idMatch = section.title.match(/User Story\s*(\d+)/i);
    const id = idMatch ? `US${idMatch[1]}` : `US${Date.now()}`;

    // Extract title and priority from header
    // Format: "User Story 1 - [Title] (Priority: P1)"
    const titleMatch = section.title.match(/User Story\s*\d+\s*-\s*([^(]+)/i);
    const title = titleMatch ? titleMatch[1].trim() : section.title;

    const priorityMatch = section.title.match(/\(Priority:\s*(P[1-5])\)/i);
    const priority: Priority = priorityMatch
      ? (priorityMatch[1].toUpperCase() as Priority)
      : 'P3';

    // Extract description (first paragraph of content)
    const contentLines = section.content.split('\n');
    let description = '';
    for (const line of contentLines) {
      if (line.startsWith('**') || line.startsWith('###') || line.trim() === '') {
        if (description) break;
        continue;
      }
      description += (description ? ' ' : '') + line.trim();
    }

    // Extract priority justification
    const justificationMatch = section.content.match(/\*\*Why this priority\*\*:\s*(.+?)(?=\n\*\*|\n###|$)/is);
    const priorityJustification = justificationMatch
      ? justificationMatch[1].trim()
      : '';

    // Extract independent test
    const independentTestMatch = section.content.match(/\*\*Independent Test\*\*:\s*(.+?)(?=\n\*\*|\n###|$)/is);
    const independentTest = independentTestMatch
      ? independentTestMatch[1].trim()
      : '';

    // Parse acceptance scenarios
    const acceptanceCriteria = this.parseAcceptanceScenarios(section.content);

    return {
      id,
      title,
      priority,
      description,
      priorityJustification,
      independentTest,
      acceptanceCriteria,
      acceptanceScenarios: acceptanceCriteria,
      edgeCases: [],
    };
  }

  /**
   * Parse acceptance scenarios from content
   */
  private parseAcceptanceScenarios(content: string): AcceptanceCriterion[] {
    const scenarios: AcceptanceCriterion[] = [];

    // Match Given/When/Then patterns
    // Format: "**Given** [state], **When** [action], **Then** [outcome]"
    const gwtPattern = /\*\*Given\*\*\s+([^,*]+),?\s*\*\*When\*\*\s+([^,*]+),?\s*\*\*Then\*\*\s+([^\n*]+)/gi;
    let match;
    let index = 1;

    while ((match = gwtPattern.exec(content)) !== null) {
      scenarios.push({
        id: `AC${index++}`,
        given: match[1].trim(),
        when: match[2].trim(),
        then: match[3].trim(),
      });
    }

    // Also try numbered list format
    // Format: "1. **Given** [state], **When** [action], **Then** [outcome]"
    const numberedPattern = /\d+\.\s*\*\*Given\*\*\s+([^,*]+),?\s*\*\*When\*\*\s+([^,*]+),?\s*\*\*Then\*\*\s+([^\n*]+)/gi;
    while ((match = numberedPattern.exec(content)) !== null) {
      // Check if we already have this scenario
      const exists = scenarios.some(
        (s) => s.given === match![1].trim() && s.when === match![2].trim()
      );
      if (!exists) {
        scenarios.push({
          id: `AC${index++}`,
          given: match[1].trim(),
          when: match[2].trim(),
          then: match[3].trim(),
        });
      }
    }

    return scenarios;
  }

  /**
   * Parse requirements from the document
   */
  private parseRequirements(sections: MarkdownSection[]): {
    functional: Requirement[];
    nonFunctional: Requirement[];
  } {
    const functional: Requirement[] = [];
    const nonFunctional: Requirement[] = [];

    // Find requirements section
    const reqSection = this.findSection(sections, /Requirements/i);
    if (!reqSection) {
      this.warnings.push({
        message: 'No requirements section found',
        suggestion: 'Add a "## Requirements" section with functional requirements',
      });
      return { functional, nonFunctional };
    }

    // Find functional requirements subsection
    const funcSection = this.findSection([reqSection], /Functional Requirements/i);
    if (funcSection) {
      functional.push(...this.parseRequirementsList(funcSection.content, 'functional'));
    }

    // Find non-functional requirements subsection
    const nfSection = this.findSection([reqSection], /Non-?Functional Requirements/i);
    if (nfSection) {
      nonFunctional.push(...this.parseRequirementsList(nfSection.content, 'non-functional'));
    }

    // If no subsections, parse from main requirements section
    if (functional.length === 0 && nonFunctional.length === 0) {
      const reqs = this.parseRequirementsList(reqSection.content, 'functional');
      // Separate by ID prefix (FR- vs NFR-)
      for (const req of reqs) {
        if (req.id.startsWith('NFR-')) {
          req.type = 'non-functional';
          nonFunctional.push(req);
        } else {
          functional.push(req);
        }
      }
    }

    return { functional, nonFunctional };
  }

  /**
   * Parse a list of requirements from content
   */
  private parseRequirementsList(content: string, type: 'functional' | 'non-functional'): Requirement[] {
    const requirements: Requirement[] = [];

    // Match requirement patterns
    // Format: "- **FR-001**: System MUST [capability]"
    // or: "- **NFR-001**: System MUST [capability]"
    const reqPattern = /-\s*\*\*([A-Z]+-\d+)\*\*:\s*(.+?)(?=\n-|\n\n|$)/gis;
    let match;

    while ((match = reqPattern.exec(content)) !== null) {
      const id = match[1].trim();
      let description = match[2].trim();

      // Check for clarification needed
      const needsClarification = description.includes('[NEEDS CLARIFICATION');
      let clarificationNote: string | undefined;

      if (needsClarification) {
        const clarificationMatch = description.match(/\[NEEDS CLARIFICATION:\s*([^\]]+)\]/i);
        if (clarificationMatch) {
          clarificationNote = clarificationMatch[1].trim();
          description = description.replace(/\[NEEDS CLARIFICATION:[^\]]+\]/i, '').trim();
        }
      }

      requirements.push({
        id,
        type: id.startsWith('NFR-') ? 'non-functional' : type,
        description,
        needsClarification,
        clarificationNote,
      });
    }

    return requirements;
  }

  /**
   * Parse success criteria from the document
   */
  private parseSuccessCriteria(sections: MarkdownSection[]): SuccessCriterion[] {
    const criteria: SuccessCriterion[] = [];

    const scSection = this.findSection(sections, /Success Criteria/i);
    if (!scSection) {
      this.warnings.push({
        message: 'No success criteria section found',
        suggestion: 'Add a "## Success Criteria" section with measurable outcomes',
      });
      return criteria;
    }

    // Match success criteria patterns
    // Format: "- **SC-001**: [Measurable metric]"
    const scPattern = /-\s*\*\*([A-Z]+-\d+)\*\*:\s*(.+?)(?=\n-|\n\n|$)/gis;
    let match;

    while ((match = scPattern.exec(scSection.content)) !== null) {
      const id = match[1].trim();
      const description = match[2].trim();

      // Determine if measurable (contains numbers, percentages, time units)
      const measurable = /\d+|%|seconds?|minutes?|hours?|days?|ms|users?/.test(description);

      criteria.push({
        id,
        description,
        measurable,
        metric: measurable ? description : undefined,
      });
    }

    return criteria;
  }

  /**
   * Parse edge cases from the document
   */
  private parseEdgeCases(sections: MarkdownSection[]): EdgeCase[] {
    const edgeCases: EdgeCase[] = [];

    const ecSection = this.findSection(sections, /Edge Cases/i);
    if (!ecSection) {
      return edgeCases;
    }

    // Match edge case patterns
    // Format: "- What happens when [condition]?"
    const lines = ecSection.content.split('\n');
    let index = 1;

    for (const line of lines) {
      const match = line.match(/^-\s*(.+)/);
      if (match) {
        const text = match[1].trim();
        edgeCases.push({
          id: `EC${index++}`,
          description: text,
          scenario: text,
        });
      }
    }

    return edgeCases;
  }

  /**
   * Parse entities from the document
   */
  private parseEntities(sections: MarkdownSection[]): Entity[] {
    const entities: Entity[] = [];

    const entSection = this.findSection(sections, /Key Entities/i);
    if (!entSection) {
      return entities;
    }

    // Match entity patterns
    // Format: "- **[Entity]**: [Description]"
    const entityPattern = /-\s*\*\*([^*]+)\*\*:\s*(.+?)(?=\n-|\n\n|$)/gis;
    let match;

    while ((match = entityPattern.exec(entSection.content)) !== null) {
      const name = match[1].trim();
      const description = match[2].trim();

      entities.push({
        name,
        description,
        attributes: [],
        relationships: [],
      });
    }

    return entities;
  }

  /**
   * Generate a unique ID for the specification
   */
  private generateId(filePath: string, featureName: string): string {
    const base = featureName || filePath;
    const hash = crypto.createHash('md5').update(base).digest('hex').substring(0, 8);
    return `spec-${hash}`;
  }

  /**
   * Generate a hash of the content for change detection
   */
  private generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Validate the parsed document and add warnings
   */
  private validateDocument(doc: SpecificationDocument): void {
    // Check for empty user stories
    if (doc.userStories.length === 0) {
      this.warnings.push({
        message: 'Specification has no user stories',
        suggestion: 'Add at least one user story with acceptance criteria',
      });
    }

    // Check for user stories without acceptance criteria
    for (const story of doc.userStories) {
      if (story.acceptanceCriteria.length === 0) {
        this.warnings.push({
          line: undefined,
          message: `User story "${story.title}" has no acceptance criteria`,
          suggestion: 'Add Given/When/Then scenarios for each user story',
        });
      }
    }

    // Check for requirements needing clarification
    const needsClarification = [
      ...doc.functionalRequirements,
      ...doc.nonFunctionalRequirements,
    ].filter((r) => r.needsClarification);

    if (needsClarification.length > 0) {
      this.warnings.push({
        message: `${needsClarification.length} requirement(s) need clarification`,
        suggestion: 'Resolve clarification items before proceeding to planning',
      });
    }

    // Check for non-measurable success criteria
    const nonMeasurable = doc.successCriteria.filter(
      (sc) => typeof sc === 'object' && !sc.measurable
    );
    if (nonMeasurable.length > 0) {
      this.warnings.push({
        message: `${nonMeasurable.length} success criteria are not measurable`,
        suggestion: 'Add specific metrics to success criteria (numbers, percentages, time units)',
      });
    }
  }
}

/**
 * Convenience function to parse a spec file
 */
export function parseSpec(content: string, filePath: string): ParseResult<SpecificationDocument> {
  const parser = new SpecParser();
  return parser.parse(content, filePath);
}

export default SpecParser;
