/**
 * Constitution Parser
 *
 * Parses constitution.md files into structured ConstitutionDocument objects
 * with enforceable rules. Handles the spec-kit template format with
 * principles, sections, and governance rules.
 */

import * as crypto from 'crypto';
import {
  ConstitutionDocument,
  ConstitutionPrinciple,
  ConstitutionRule,
  ConstitutionSection,
  GovernanceRules,
  EnforcementLevel,
  RuleCheckType,
  ParseResult,
  ParseError,
  ParseWarning,
  MarkdownSection,
} from '../types.js';

/**
 * Default principles for the 9 Articles (spec-kit standard)
 */
export const DEFAULT_PRINCIPLES: Partial<ConstitutionPrinciple>[] = [
  {
    id: 'I',
    name: 'Library-First',
    enforcementLevel: 'mandatory',
  },
  {
    id: 'II',
    name: 'CLI Interface',
    enforcementLevel: 'mandatory',
  },
  {
    id: 'III',
    name: 'Test-First',
    enforcementLevel: 'mandatory',
  },
  {
    id: 'IV',
    name: 'Integration Testing',
    enforcementLevel: 'recommended',
  },
  {
    id: 'V',
    name: 'Observability',
    enforcementLevel: 'recommended',
  },
  {
    id: 'VI',
    name: 'Versioning',
    enforcementLevel: 'recommended',
  },
  {
    id: 'VII',
    name: 'Simplicity',
    enforcementLevel: 'mandatory',
  },
  {
    id: 'VIII',
    name: 'Documentation',
    enforcementLevel: 'recommended',
  },
  {
    id: 'IX',
    name: 'Security',
    enforcementLevel: 'mandatory',
  },
];

/**
 * Parser for constitution.md files
 */
export class ConstitutionParser {
  private errors: ParseError[] = [];
  private warnings: ParseWarning[] = [];

  /**
   * Parse a constitution.md file content into a ConstitutionDocument
   */
  public parse(content: string, filePath: string): ParseResult<ConstitutionDocument> {
    this.reset();

    try {
      const sections = this.parseMarkdownSections(content);
      const metadata = this.parseHeader(content);

      // Parse principles
      const principles = this.parsePrinciples(sections);

      // Parse additional sections
      const additionalSections = this.parseAdditionalSections(sections, principles);

      // Parse governance rules
      const governance = this.parseGovernance(sections);

      // Generate ID and hash
      const id = this.generateId(filePath, metadata.projectName);
      const hash = this.generateHash(content);

      const constitution: ConstitutionDocument = {
        id,
        type: 'constitution',
        path: filePath,
        name: `Constitution: ${metadata.projectName}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        hash,
        metadata: {},
        projectName: metadata.projectName,
        version: metadata.version,
        ratifiedDate: metadata.ratifiedDate,
        lastAmendedDate: metadata.lastAmendedDate,
        principles,
        additionalSections,
        governance,
      };

      this.validateConstitution(constitution);

      return {
        success: this.errors.length === 0,
        data: constitution,
        errors: this.errors,
        warnings: this.warnings,
      };
    } catch (error) {
      this.errors.push({
        message: `Failed to parse constitution: ${error instanceof Error ? error.message : String(error)}`,
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
  }

  /**
   * Parse header metadata
   */
  private parseHeader(content: string): {
    projectName: string;
    version: string;
    ratifiedDate?: Date;
    lastAmendedDate?: Date;
  } {
    let projectName = 'Unknown Project';
    let version = '1.0.0';
    let ratifiedDate: Date | undefined;
    let lastAmendedDate: Date | undefined;

    const lines = content.split('\n');

    // Title line: "# [PROJECT_NAME] Constitution"
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i];

      const titleMatch = line.match(/^#\s+(?:\[?([^\]]+)\]?)?\s*Constitution/i);
      if (titleMatch && titleMatch[1]) {
        projectName = titleMatch[1].replace(/[[\]]/g, '').trim();
        if (projectName === 'PROJECT_NAME') {
          projectName = 'Unknown Project';
        }
      }
    }

    // Version line: "**Version**: 2.1.1 | **Ratified**: 2025-06-13 | **Last Amended**: 2025-07-16"
    const versionMatch = content.match(/\*\*Version\*\*:\s*([^\s|]+)/i);
    if (versionMatch) {
      version = versionMatch[1].trim();
      if (version.startsWith('[')) {
        version = '1.0.0';
      }
    }

    const ratifiedMatch = content.match(/\*\*Ratified\*\*:\s*([^\s|]+)/i);
    if (ratifiedMatch) {
      const dateStr = ratifiedMatch[1].trim();
      if (!dateStr.startsWith('[')) {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          ratifiedDate = parsed;
        }
      }
    }

    const amendedMatch = content.match(/\*\*Last Amended\*\*:\s*([^\s|]+)/i);
    if (amendedMatch) {
      const dateStr = amendedMatch[1].trim();
      if (!dateStr.startsWith('[')) {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          lastAmendedDate = parsed;
        }
      }
    }

    return { projectName, version, ratifiedDate, lastAmendedDate };
  }

  /**
   * Parse principles from sections
   */
  private parsePrinciples(sections: MarkdownSection[]): ConstitutionPrinciple[] {
    const principles: ConstitutionPrinciple[] = [];

    // Find Core Principles section
    const coreSection = this.findSection(sections, /Core Principles/i);
    if (!coreSection) {
      this.warnings.push({
        message: 'No "Core Principles" section found',
        suggestion: 'Add a "## Core Principles" section with your project principles',
      });
      return principles;
    }

    // Find all principle subsections
    const principleSections = this.findAllSections([coreSection], /^(#{2,3})\s*([\[IVXLCDM\]]+\.?\s*)?(.+)/i);

    for (const section of principleSections) {
      const principle = this.parsePrinciple(section);
      if (principle) {
        principles.push(principle);
      }
    }

    // If template placeholders found, use defaults
    if (principles.length === 0 || principles.every((p) => p.name.includes('[PRINCIPLE'))) {
      this.warnings.push({
        message: 'Constitution appears to use template placeholders',
        suggestion: 'Replace [PRINCIPLE_X_NAME] placeholders with actual principle names',
      });
    }

    return principles;
  }

  /**
   * Parse a single principle from a section
   */
  private parsePrinciple(section: MarkdownSection): ConstitutionPrinciple | null {
    // Extract ID and name from title
    // Formats: "### I. Library-First", "### [PRINCIPLE_1_NAME]"
    const titleMatch = section.title.match(/^([IVXLCDM]+\.?\s*)?(.+)/i);
    if (!titleMatch) return null;

    const romanNumeral = titleMatch[1]?.replace('.', '').trim() || '';
    let name = titleMatch[2].trim();

    // Handle template placeholders
    if (name.includes('[') && name.includes(']')) {
      const placeholderMatch = name.match(/\[([^\]]+)\]/);
      if (placeholderMatch) {
        name = placeholderMatch[1];
      }
    }

    // Generate ID
    const id = romanNumeral || this.romanize(name);

    // Determine enforcement level
    const enforcementLevel = this.determineEnforcementLevel(name, section.content);

    // Parse rules from description
    const rules = this.parseRules(section.content, id);

    // Get description (content before rules)
    let description = section.content;
    const rulesStart = description.indexOf('- ');
    if (rulesStart > 0) {
      description = description.substring(0, rulesStart).trim();
    }

    // Clean up placeholder text
    if (description.includes('[PRINCIPLE') || description.includes('<!-- ')) {
      description = description.replace(/<!--[\s\S]*?-->/g, '').trim();
      description = description.replace(/\[[^\]]+\]/g, '').trim();
    }

    return {
      id,
      name,
      description,
      rules,
      enforcementLevel,
    };
  }

  /**
   * Parse rules from principle content
   */
  private parseRules(content: string, principleId: string): ConstitutionRule[] {
    const rules: ConstitutionRule[] = [];

    // Parse bullet points as rules
    const bulletPattern = /-\s+(.+?)(?=\n-|\n\n|$)/gis;
    let match;
    let index = 1;

    while ((match = bulletPattern.exec(content)) !== null) {
      let ruleText = match[1].trim();

      // Skip HTML comments
      if (ruleText.startsWith('<!--')) continue;

      // Clean up example placeholders
      if (ruleText.includes('Example:')) {
        ruleText = ruleText.replace(/Example:\s*/, '');
      }

      // Determine check type
      const checkType = this.determineCheckType(ruleText);

      // Create error message
      const errorMessage = this.createErrorMessage(ruleText, principleId);

      rules.push({
        id: `${principleId}-R${index++}`,
        description: ruleText,
        checkType,
        errorMessage,
      });
    }

    return rules;
  }

  /**
   * Determine enforcement level from name and content
   */
  private determineEnforcementLevel(name: string, content: string): EnforcementLevel {
    const lowerName = name.toLowerCase();
    const lowerContent = content.toLowerCase();

    // Non-negotiable = mandatory
    if (lowerContent.includes('non-negotiable') || lowerContent.includes('must')) {
      return 'mandatory';
    }

    // Certain principles are typically mandatory
    if (
      lowerName.includes('test') ||
      lowerName.includes('security') ||
      lowerName.includes('library') ||
      lowerName.includes('simplicity')
    ) {
      return 'mandatory';
    }

    // Should = recommended
    if (lowerContent.includes('should') || lowerContent.includes('recommended')) {
      return 'recommended';
    }

    return 'recommended';
  }

  /**
   * Determine check type from rule text
   */
  private determineCheckType(ruleText: string): RuleCheckType {
    const lower = ruleText.toLowerCase();

    if (lower.includes('before') || lower.includes('first') || lower.includes('prior')) {
      return 'pre-implementation';
    }

    if (lower.includes('after') || lower.includes('complete') || lower.includes('verify')) {
      return 'post-implementation';
    }

    if (lower.includes('gate') || lower.includes('checkpoint') || lower.includes('block')) {
      return 'gate';
    }

    return 'continuous';
  }

  /**
   * Create error message for a rule
   */
  private createErrorMessage(ruleText: string, principleId: string): string {
    // Convert rule to error message
    const cleaned = ruleText
      .replace(/must\s+/gi, '')
      .replace(/should\s+/gi, '')
      .replace(/shall\s+/gi, '')
      .trim();

    return `Violation of ${principleId}: ${cleaned}`;
  }

  /**
   * Parse additional sections (not principles)
   */
  private parseAdditionalSections(
    sections: MarkdownSection[],
    principles: ConstitutionPrinciple[]
  ): ConstitutionSection[] {
    const additionalSections: ConstitutionSection[] = [];
    const principleNames = new Set(principles.map((p) => p.name.toLowerCase()));

    for (const section of sections) {
      // Skip Core Principles and Governance sections
      if (
        section.title.toLowerCase().includes('core principles') ||
        section.title.toLowerCase().includes('governance')
      ) {
        continue;
      }

      // Skip sections that are principles
      if (principleNames.has(section.title.toLowerCase())) {
        continue;
      }

      // Skip title and comments sections
      if (section.level === 1) continue;

      // Clean content
      let content = section.content;
      content = content.replace(/<!--[\s\S]*?-->/g, '').trim();

      if (content && !content.includes('[SECTION')) {
        additionalSections.push({
          name: section.title,
          content,
        });
      }
    }

    return additionalSections;
  }

  /**
   * Parse governance rules
   */
  private parseGovernance(sections: MarkdownSection[]): GovernanceRules {
    const governance: GovernanceRules = {
      constitutionSupersedes: true,
      amendmentRequirements: [],
      reviewProcess: '',
    };

    const govSection = this.findSection(sections, /Governance/i);
    if (!govSection) {
      return governance;
    }

    const content = govSection.content;

    // Check for supersedes rule
    if (content.toLowerCase().includes('supersedes')) {
      governance.constitutionSupersedes = true;
    }

    // Extract amendment requirements
    const amendmentMatch = content.match(/amendments?\s+require[s]?\s+(.+?)(?=\n\n|$)/i);
    if (amendmentMatch) {
      const requirements = amendmentMatch[1].match(/[a-zA-Z][^,;.]+/g);
      if (requirements) {
        governance.amendmentRequirements = requirements.map((r) => r.trim());
      }
    }

    // Extract review process
    const reviewMatch = content.match(/(?:PR|review|approval)[s]?\s+must\s+(.+?)(?=\n\n|$)/i);
    if (reviewMatch) {
      governance.reviewProcess = reviewMatch[1].trim();
    }

    // Parse bullet points as requirements
    const bulletPattern = /-\s+(.+?)(?=\n-|\n\n|$)/gis;
    let match;
    while ((match = bulletPattern.exec(content)) !== null) {
      const text = match[1].trim();
      if (!text.includes('[') && text.length > 10) {
        if (text.toLowerCase().includes('amendment')) {
          governance.amendmentRequirements.push(text);
        } else {
          governance.reviewProcess += (governance.reviewProcess ? '; ' : '') + text;
        }
      }
    }

    return governance;
  }

  /**
   * Convert a name to Roman numeral (for ID generation)
   */
  private romanize(name: string): string {
    // Simple hash-based ID
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `P${hash % 100}`;
  }

  /**
   * Parse markdown into sections
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

        let endLine = lines.length - 1;
        for (let j = i + 1; j < lines.length; j++) {
          const nextHeaderMatch = lines[j].match(/^(#{1,6})\s+/);
          if (nextHeaderMatch && nextHeaderMatch[1].length <= level) {
            endLine = j - 1;
            break;
          }
        }

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
   * Find a section by title pattern
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
   * Generate unique ID
   */
  private generateId(filePath: string, projectName: string): string {
    const base = projectName || filePath;
    const hash = crypto.createHash('md5').update(base).digest('hex').substring(0, 8);
    return `constitution-${hash}`;
  }

  /**
   * Generate content hash
   */
  private generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Validate the parsed constitution
   */
  private validateConstitution(constitution: ConstitutionDocument): void {
    // Check for empty principles
    if (constitution.principles.length === 0) {
      this.warnings.push({
        message: 'Constitution has no principles defined',
        suggestion: 'Add principles under "## Core Principles" section',
      });
    }

    // Check for principles without rules
    for (const principle of constitution.principles) {
      if (principle.rules.length === 0) {
        this.warnings.push({
          message: `Principle "${principle.name}" has no enforceable rules`,
          suggestion: 'Add specific rules as bullet points under the principle',
        });
      }
    }

    // Check for template placeholders
    for (const principle of constitution.principles) {
      if (principle.name.includes('[') || principle.description.includes('[PRINCIPLE')) {
        this.warnings.push({
          message: `Principle "${principle.name}" contains template placeholders`,
          suggestion: 'Replace placeholders with actual content',
        });
      }
    }
  }

  /**
   * Get a principle by ID or name
   */
  public getPrinciple(
    constitution: ConstitutionDocument,
    idOrName: string
  ): ConstitutionPrinciple | undefined {
    return constitution.principles.find(
      (p) =>
        p.id.toLowerCase() === idOrName.toLowerCase() ||
        p.name.toLowerCase() === idOrName.toLowerCase()
    );
  }

  /**
   * Get all mandatory principles
   */
  public getMandatoryPrinciples(constitution: ConstitutionDocument): ConstitutionPrinciple[] {
    return constitution.principles.filter((p) => p.enforcementLevel === 'mandatory');
  }

  /**
   * Get all rules of a specific check type
   */
  public getRulesByCheckType(
    constitution: ConstitutionDocument,
    checkType: RuleCheckType
  ): Array<{ principle: ConstitutionPrinciple; rule: ConstitutionRule }> {
    const results: Array<{ principle: ConstitutionPrinciple; rule: ConstitutionRule }> = [];

    for (const principle of constitution.principles) {
      for (const rule of principle.rules) {
        if (rule.checkType === checkType) {
          results.push({ principle, rule });
        }
      }
    }

    return results;
  }
}

/**
 * Convenience function to parse a constitution file
 */
export function parseConstitution(content: string, filePath: string): ParseResult<ConstitutionDocument> {
  const parser = new ConstitutionParser();
  return parser.parse(content, filePath);
}

export default ConstitutionParser;
