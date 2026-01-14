/**
 * Plan Parser
 *
 * Parses plan.md, research.md, and data-model.md files into structured objects.
 * Handles the spec-kit template format for implementation planning documents.
 */

import * as crypto from 'crypto';
import {
  ImplementationPlan,
  ResearchDocument,
  DataModelDocument,
  TechStack,
  TechnicalContext,
  ArchitectureDecision,
  DataModel,
  DataField,
  Relationship,
  APIContract,
  Endpoint,
  ResearchFinding,
  ResearchSection,
  ConstitutionGate,
  ProjectStructure,
  ComplexityViolation,
  ImplementationPhase,
  DataEntity,
  DataAttribute,
  DataRelationship,
  ParseResult,
  ParseError,
  ParseWarning,
  MarkdownSection,
  MarkdownTable,
} from '../types.js';

/**
 * Parser for plan.md implementation plan files
 */
export class PlanParser {
  private errors: ParseError[] = [];
  private warnings: ParseWarning[] = [];

  /**
   * Parse a plan.md file content into an ImplementationPlan
   */
  public parsePlan(content: string, filePath: string): ParseResult<ImplementationPlan> {
    this.reset();

    try {
      const sections = this.parseMarkdownSections(content);
      const metadata = this.parsePlanHeader(content);

      // Parse technical context
      const techContext = this.parseTechnicalContext(sections);

      // Parse constitution check
      const constitutionGates = this.parseConstitutionCheck(sections);

      // Parse project structure
      const projectStructure = this.parseProjectStructure(sections);

      // Parse complexity tracking
      const complexityTracking = this.parseComplexityTracking(sections);

      // Parse research findings if embedded
      const researchFindings = this.parseResearchFindings(sections);

      // Generate ID and hash
      const id = this.generateId(filePath, metadata.featureName);
      const hash = this.generateHash(content);

      const plan: ImplementationPlan = {
        id,
        type: 'plan',
        path: filePath,
        name: `Plan: ${metadata.featureName}`,
        createdAt: metadata.createdAt || new Date(),
        updatedAt: new Date(),
        hash,
        metadata: {},
        planId: id,
        specId: metadata.specPath ? this.generateId(metadata.specPath, '') : '',
        featureName: metadata.featureName,
        featureBranch: metadata.featureBranch,
        specPath: metadata.specPath,
        version: '1.0.0',
        summary: metadata.summary,
        techStack: this.convertToTechStack(techContext),
        technicalContext: techContext,
        architectureDecisions: [],
        dataModels: [],
        apiContracts: [],
        researchFindings,
        constitutionGates,
        constitutionCheck: {
          passed: constitutionGates.every((g) => g.status !== 'fail' && g.status !== 'failed'),
          gates: constitutionGates,
          violations: constitutionGates
            .filter((g) => g.status === 'fail' || g.status === 'failed')
            .map((g) => ({
              articleId: g.articleId,
              articleName: g.articleName,
              description: g.notes || 'Failed gate check',
              approved: false,
            })),
        },
        projectStructure,
        complexityTracking,
        phases: this.parsePhases(sections),
      };

      this.validatePlan(plan);

      return {
        success: this.errors.length === 0,
        data: plan,
        errors: this.errors,
        warnings: this.warnings,
      };
    } catch (error) {
      this.errors.push({
        message: `Failed to parse plan: ${error instanceof Error ? error.message : String(error)}`,
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
   * Parse a research.md file content into a ResearchDocument
   */
  public parseResearch(content: string, filePath: string): ParseResult<ResearchDocument> {
    this.reset();

    try {
      const sections = this.parseMarkdownSections(content);

      // Extract feature name from title
      let featureName = 'Unknown Feature';
      const titleMatch = content.match(/^#\s+Research:\s*(.+)/m);
      if (titleMatch) {
        featureName = titleMatch[1].trim();
      }

      // Parse sections into ResearchSections
      const researchSections: ResearchSection[] = [];
      for (const section of sections) {
        if (section.level >= 2) {
          researchSections.push({
            title: section.title,
            content: section.content,
          });
        }
      }

      // Parse findings
      const findings = this.parseResearchFindings(sections);

      // Parse recommendations
      const recommendations = this.parseRecommendations(sections);

      const id = this.generateId(filePath, featureName);
      const hash = this.generateHash(content);

      const research: ResearchDocument = {
        id,
        type: 'research',
        path: filePath,
        name: `Research: ${featureName}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        hash,
        metadata: {},
        featureName,
        sections: researchSections,
        findings,
        recommendations,
      };

      return {
        success: this.errors.length === 0,
        data: research,
        errors: this.errors,
        warnings: this.warnings,
      };
    } catch (error) {
      this.errors.push({
        message: `Failed to parse research: ${error instanceof Error ? error.message : String(error)}`,
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
   * Parse a data-model.md file content into a DataModelDocument
   */
  public parseDataModel(content: string, filePath: string): ParseResult<DataModelDocument> {
    this.reset();

    try {
      const sections = this.parseMarkdownSections(content);

      // Extract feature name from title
      let featureName = 'Unknown Feature';
      const titleMatch = content.match(/^#\s+Data Model:\s*(.+)/m);
      if (titleMatch) {
        featureName = titleMatch[1].trim();
      }

      // Parse entities
      const entities = this.parseDataEntities(sections);

      // Parse relationships
      const relationships = this.parseDataRelationships(sections);

      // Extract diagrams (mermaid blocks)
      const diagrams = this.extractMermaidDiagrams(content);

      const id = this.generateId(filePath, featureName);
      const hash = this.generateHash(content);

      const dataModel: DataModelDocument = {
        id,
        type: 'data-model',
        path: filePath,
        name: `Data Model: ${featureName}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        hash,
        metadata: {},
        featureName,
        entities,
        relationships,
        diagrams,
      };

      return {
        success: this.errors.length === 0,
        data: dataModel,
        errors: this.errors,
        warnings: this.warnings,
      };
    } catch (error) {
      this.errors.push({
        message: `Failed to parse data model: ${error instanceof Error ? error.message : String(error)}`,
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
   * Parse plan header metadata
   */
  private parsePlanHeader(content: string): {
    featureName: string;
    featureBranch: string;
    specPath: string;
    createdAt: Date | null;
    summary: string;
  } {
    let featureName = '';
    let featureBranch = '';
    let specPath = '';
    let createdAt: Date | null = null;
    let summary = '';

    const lines = content.split('\n');

    for (let i = 0; i < Math.min(lines.length, 30); i++) {
      const line = lines[i];

      // Feature name from title
      const titleMatch = line.match(/^#\s+Implementation Plan:\s*(.+)/i);
      if (titleMatch) {
        featureName = titleMatch[1].trim();
      }

      // Branch
      const branchMatch = line.match(/\*\*Branch\*\*:\s*`?([^`|\s]+)`?/i);
      if (branchMatch) {
        featureBranch = branchMatch[1].trim();
      }

      // Date
      const dateMatch = line.match(/\*\*Date\*\*:\s*(.+?)(?:\s*\||$)/i);
      if (dateMatch) {
        const parsedDate = new Date(dateMatch[1].trim());
        if (!isNaN(parsedDate.getTime())) {
          createdAt = parsedDate;
        }
      }

      // Spec path
      const specMatch = line.match(/\*\*Spec\*\*:\s*(.+?)(?:\s*\||$)/i);
      if (specMatch) {
        specPath = specMatch[1].trim();
      }

      // Input spec path
      const inputMatch = line.match(/\*\*Input\*\*:\s*.*?`([^`]+)`/i);
      if (inputMatch && !specPath) {
        specPath = inputMatch[1].trim();
      }
    }

    // Extract summary from Summary section
    const summaryMatch = content.match(/##\s*Summary\s*\n+([\s\S]*?)(?=\n##|\n$)/i);
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
    }

    return { featureName, featureBranch, specPath, createdAt, summary };
  }

  /**
   * Parse technical context section
   */
  private parseTechnicalContext(sections: MarkdownSection[]): TechnicalContext {
    const techSection = this.findSection(sections, /Technical Context/i);
    const needsClarification: string[] = [];

    const context: TechnicalContext = {
      language: 'Unknown',
      primaryDependencies: [],
      testing: 'Unknown',
      targetPlatform: 'Unknown',
      projectType: 'single',
      needsClarification,
    };

    if (!techSection) {
      this.warnings.push({
        message: 'No Technical Context section found',
        suggestion: 'Add a "## Technical Context" section with language, dependencies, etc.',
      });
      return context;
    }

    const content = techSection.content;

    // Parse key-value pairs
    const patterns: Array<{ key: keyof TechnicalContext; pattern: RegExp }> = [
      { key: 'language', pattern: /\*\*Language\/Version\*\*:\s*(.+?)(?=\n|$)/i },
      { key: 'primaryDependencies', pattern: /\*\*Primary Dependencies\*\*:\s*(.+?)(?=\n|$)/i },
      { key: 'storage', pattern: /\*\*Storage\*\*:\s*(.+?)(?=\n|$)/i },
      { key: 'testing', pattern: /\*\*Testing\*\*:\s*(.+?)(?=\n|$)/i },
      { key: 'targetPlatform', pattern: /\*\*Target Platform\*\*:\s*(.+?)(?=\n|$)/i },
      { key: 'projectType', pattern: /\*\*Project Type\*\*:\s*(.+?)(?=\n|$)/i },
      { key: 'performanceGoals', pattern: /\*\*Performance Goals\*\*:\s*(.+?)(?=\n|$)/i },
      { key: 'constraints', pattern: /\*\*Constraints\*\*:\s*(.+?)(?=\n|$)/i },
      { key: 'scaleScope', pattern: /\*\*Scale\/Scope\*\*:\s*(.+?)(?=\n|$)/i },
    ];

    for (const { key, pattern } of patterns) {
      const match = content.match(pattern);
      if (match) {
        let value = match[1].trim();

        // Check for NEEDS CLARIFICATION
        if (value.includes('NEEDS CLARIFICATION') || value === 'N/A' || value === '[') {
          needsClarification.push(key);
          continue;
        }

        // Handle special cases
        if (key === 'primaryDependencies') {
          context.primaryDependencies = value.split(',').map((d) => d.trim());
        } else if (key === 'projectType') {
          const projectTypes = ['single', 'web', 'mobile', 'monorepo'];
          const normalizedValue = value.toLowerCase();
          if (projectTypes.includes(normalizedValue)) {
            context.projectType = normalizedValue as TechnicalContext['projectType'];
          }
        } else if (key === 'language') {
          // Extract version if present
          const langMatch = value.match(/(.+?)\s*(\d+\.?\d*\.?\d*)?/);
          if (langMatch) {
            context.language = langMatch[1].trim();
            if (langMatch[2]) {
              context.version = langMatch[2].trim();
            }
          }
        } else {
          (context as unknown as Record<string, unknown>)[key] = value;
        }
      }
    }

    context.needsClarification = needsClarification;
    return context;
  }

  /**
   * Parse constitution check section
   */
  private parseConstitutionCheck(sections: MarkdownSection[]): ConstitutionGate[] {
    const gates: ConstitutionGate[] = [];
    const checkSection = this.findSection(sections, /Constitution Check/i);

    if (!checkSection) {
      return gates;
    }

    // Look for gate entries
    // Format: "- [x] I. Library-First: Description" or "- [ ] II. CLI Interface: Failed"
    const gatePattern = /-\s*\[([xX ])\]\s*([IVX]+\.?\s*)?([^:]+):\s*(.+?)(?=\n-|\n\n|$)/gis;
    let match;

    while ((match = gatePattern.exec(checkSection.content)) !== null) {
      const checked = match[1].toLowerCase() === 'x';
      const articleId = match[2] ? match[2].trim().replace('.', '') : '';
      const articleName = match[3].trim();
      const notes = match[4].trim();

      gates.push({
        articleId: articleId || articleName.substring(0, 10),
        articleName,
        status: checked ? 'passed' : 'failed',
        notes,
      });
    }

    // Also try parsing table format
    const table = this.parseTable(checkSection.content);
    if (table && gates.length === 0) {
      for (const row of table.rows) {
        if (row.cells.length >= 2) {
          gates.push({
            articleId: row.cells[0] || '',
            articleName: row.cells[1] || '',
            status: row.cells[2]?.toLowerCase().includes('pass') ? 'passed' : 'failed',
            notes: row.cells[3] || '',
          });
        }
      }
    }

    return gates;
  }

  /**
   * Parse project structure section
   */
  private parseProjectStructure(sections: MarkdownSection[]): ProjectStructure {
    const structure: ProjectStructure = {
      documentationPaths: [],
      sourceCodePaths: [],
      testPaths: [],
      structureDecision: '',
    };

    const structSection = this.findSection(sections, /Project Structure/i);
    if (!structSection) {
      return structure;
    }

    // Parse code blocks for paths
    const codeBlocks = structSection.content.match(/```[\s\S]*?```/g) || [];
    for (const block of codeBlocks) {
      const paths = block.match(/[a-zA-Z_\/\-\.]+\/[a-zA-Z_\/\-\.]*/g) || [];
      for (const path of paths) {
        if (path.includes('spec') || path.includes('doc') || path.includes('plan')) {
          structure.documentationPaths.push(path);
        } else if (path.includes('test') || path.includes('spec.')) {
          structure.testPaths.push(path);
        } else if (path.includes('src') || path.includes('lib')) {
          structure.sourceCodePaths.push(path);
        }
      }
    }

    // Parse structure decision
    const decisionMatch = structSection.content.match(/\*\*Structure Decision\*\*:\s*(.+?)(?=\n\n|$)/is);
    if (decisionMatch) {
      structure.structureDecision = decisionMatch[1].trim();
    }

    return structure;
  }

  /**
   * Parse complexity tracking table
   */
  private parseComplexityTracking(sections: MarkdownSection[]): ComplexityViolation[] {
    const violations: ComplexityViolation[] = [];
    const compSection = this.findSection(sections, /Complexity Tracking/i);

    if (!compSection) {
      return violations;
    }

    const table = this.parseTable(compSection.content);
    if (table) {
      for (const row of table.rows) {
        if (row.cells.length >= 3) {
          violations.push({
            violation: row.cells[0] || '',
            whyNeeded: row.cells[1] || '',
            simplerAlternativeRejected: row.cells[2] || '',
          });
        }
      }
    }

    return violations;
  }

  /**
   * Parse research findings from sections
   */
  private parseResearchFindings(sections: MarkdownSection[]): ResearchFinding[] {
    const findings: ResearchFinding[] = [];
    const researchSection = this.findSection(sections, /Research|Findings/i);

    if (!researchSection) {
      return findings;
    }

    // Parse findings subsections or bullet points
    let index = 1;
    const findingPattern = /###?\s*(.+?)\n([\s\S]*?)(?=\n###?|\n##|$)/gi;
    let match;

    while ((match = findingPattern.exec(researchSection.content)) !== null) {
      const topic = match[1].trim();
      const content = match[2].trim();

      // Extract recommendation if present
      const recMatch = content.match(/\*\*Recommendation\*\*:\s*(.+?)(?=\n|$)/i);
      const recommendation = recMatch ? recMatch[1].trim() : '';

      // Extract sources
      const sources: string[] = [];
      const sourceMatches = content.match(/https?:\/\/[^\s\)]+/g);
      if (sourceMatches) {
        sources.push(...sourceMatches);
      }

      findings.push({
        id: `RF${index++}`,
        topic,
        findings: content,
        summary: content.substring(0, 200),
        sources,
        recommendation,
        confidence: 'medium',
      });
    }

    return findings;
  }

  /**
   * Parse recommendations from content
   */
  private parseRecommendations(sections: MarkdownSection[]): string[] {
    const recommendations: string[] = [];
    const recSection = this.findSection(sections, /Recommendations/i);

    if (!recSection) {
      return recommendations;
    }

    // Parse bullet points
    const bulletPattern = /-\s*(.+?)(?=\n-|\n\n|$)/gis;
    let match;

    while ((match = bulletPattern.exec(recSection.content)) !== null) {
      recommendations.push(match[1].trim());
    }

    return recommendations;
  }

  /**
   * Parse data entities from sections
   */
  private parseDataEntities(sections: MarkdownSection[]): DataEntity[] {
    const entities: DataEntity[] = [];
    const entitySections = this.findAllSections(sections, /Entity|Model|Table/i);

    for (const section of entitySections) {
      // Extract entity name from title
      const name = section.title.replace(/Entity|Model|Table/gi, '').trim() || section.title;

      // Extract description (first paragraph)
      const descMatch = section.content.match(/^([^|\n#]+)/);
      const description = descMatch ? descMatch[1].trim() : '';

      // Parse attributes from table or list
      const attributes = this.parseDataAttributes(section.content);

      entities.push({
        name,
        description,
        attributes,
        primaryKey: attributes.find((a) => a.name.toLowerCase().includes('id'))?.name,
      });
    }

    return entities;
  }

  /**
   * Parse data attributes from content
   */
  private parseDataAttributes(content: string): DataAttribute[] {
    const attributes: DataAttribute[] = [];

    // Try table format first
    const table = this.parseTable(content);
    if (table && table.headers.some((h) => h.toLowerCase().includes('field') || h.toLowerCase().includes('name'))) {
      for (const row of table.rows) {
        if (row.cells.length >= 2) {
          attributes.push({
            name: row.cells[0] || '',
            type: row.cells[1] || 'string',
            required: row.cells[2]?.toLowerCase().includes('yes') ?? false,
            description: row.cells[3] || '',
          });
        }
      }
      return attributes;
    }

    // Try list format
    // Format: "- **field_name** (type): description"
    const attrPattern = /-\s*\*\*([^*]+)\*\*\s*(?:\(([^)]+)\))?:?\s*(.+?)(?=\n-|\n\n|$)/gis;
    let match;

    while ((match = attrPattern.exec(content)) !== null) {
      attributes.push({
        name: match[1].trim(),
        type: match[2]?.trim() || 'string',
        required: match[3]?.toLowerCase().includes('required') ?? false,
        description: match[3]?.trim() || '',
      });
    }

    return attributes;
  }

  /**
   * Parse data relationships from sections
   */
  private parseDataRelationships(sections: MarkdownSection[]): DataRelationship[] {
    const relationships: DataRelationship[] = [];
    const relSection = this.findSection(sections, /Relationships?/i);

    if (!relSection) {
      return relationships;
    }

    // Parse relationship entries
    // Format: "- Entity1 -> Entity2 (one-to-many): description"
    const relPattern = /-\s*(\w+)\s*(?:->|→|has|belongs)\s*(\w+)\s*(?:\(([^)]+)\))?:?\s*(.+)?/gi;
    let match;
    let index = 1;

    while ((match = relPattern.exec(relSection.content)) !== null) {
      const cardinality = this.parseCardinality(match[3] || '');
      relationships.push({
        name: `rel${index++}`,
        from: match[1].trim(),
        to: match[2].trim(),
        cardinality,
        description: match[4]?.trim() || '',
      });
    }

    return relationships;
  }

  /**
   * Parse cardinality string
   */
  private parseCardinality(text: string): 'one-to-one' | 'one-to-many' | 'many-to-many' {
    const lower = text.toLowerCase();
    if (lower.includes('many-to-many') || lower.includes('m:n')) {
      return 'many-to-many';
    }
    if (lower.includes('one-to-many') || lower.includes('1:n') || lower.includes('1:m')) {
      return 'one-to-many';
    }
    return 'one-to-one';
  }

  /**
   * Extract mermaid diagram blocks
   */
  private extractMermaidDiagrams(content: string): string[] {
    const diagrams: string[] = [];
    const mermaidPattern = /```mermaid\n([\s\S]*?)```/gi;
    let match;

    while ((match = mermaidPattern.exec(content)) !== null) {
      diagrams.push(match[1].trim());
    }

    return diagrams;
  }

  /**
   * Parse implementation phases
   */
  private parsePhases(sections: MarkdownSection[]): ImplementationPhase[] {
    const phases: ImplementationPhase[] = [];
    const phaseSections = this.findAllSections(sections, /Phase\s*\d+/i);

    for (let i = 0; i < phaseSections.length; i++) {
      const section = phaseSections[i];
      const phaseNumMatch = section.title.match(/Phase\s*(\d+)/i);
      const phaseNum = phaseNumMatch ? parseInt(phaseNumMatch[1]) : i + 1;

      // Extract name (after "Phase X:")
      const nameMatch = section.title.match(/Phase\s*\d+[:\s]+(.+)/i);
      const name = nameMatch ? nameMatch[1].trim() : section.title;

      // Extract deliverables from bullets
      const deliverables: string[] = [];
      const bulletPattern = /-\s*(.+?)(?=\n-|\n\n|$)/gis;
      let match;
      while ((match = bulletPattern.exec(section.content)) !== null) {
        deliverables.push(match[1].trim());
      }

      phases.push({
        phaseId: `phase-${phaseNum}`,
        name,
        description: section.content.split('\n')[0] || '',
        deliverables,
        estimatedTasks: deliverables.length,
      });
    }

    return phases;
  }

  /**
   * Convert TechnicalContext to TechStack
   */
  private convertToTechStack(context: TechnicalContext): TechStack {
    return {
      language: context.language,
      version: context.version,
      framework: context.primaryDependencies[0] || 'Unknown',
      database: context.storage,
      testingFramework: context.testing,
      additionalTools: context.primaryDependencies.slice(1),
    };
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
   * Parse a markdown table
   */
  private parseTable(content: string): MarkdownTable | null {
    const lines = content.split('\n');
    let headerLine = -1;
    let separatorLine = -1;

    // Find header and separator
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('|') && lines[i].trim().startsWith('|')) {
        if (headerLine === -1) {
          headerLine = i;
        } else if (lines[i].match(/^\|[\s\-:|]+\|$/)) {
          separatorLine = i;
          break;
        }
      }
    }

    if (headerLine === -1 || separatorLine === -1) {
      return null;
    }

    // Parse headers
    const headers = lines[headerLine]
      .split('|')
      .filter((h) => h.trim())
      .map((h) => h.trim());

    // Parse rows
    const rows: { cells: string[] }[] = [];
    for (let i = separatorLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.startsWith('|')) break;

      const cells = line
        .split('|')
        .filter((c) => c.trim() !== '')
        .map((c) => c.trim());

      if (cells.length > 0) {
        rows.push({ cells });
      }
    }

    return { headers, rows };
  }

  /**
   * Generate unique ID
   */
  private generateId(filePath: string, featureName: string): string {
    const base = featureName || filePath;
    const hash = crypto.createHash('md5').update(base).digest('hex').substring(0, 8);
    return `plan-${hash}`;
  }

  /**
   * Generate content hash
   */
  private generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Validate the parsed plan
   */
  private validatePlan(plan: ImplementationPlan): void {
    if (plan.technicalContext?.needsClarification && plan.technicalContext.needsClarification.length > 0) {
      this.warnings.push({
        message: `${plan.technicalContext.needsClarification.length} technical context field(s) need clarification`,
        suggestion: 'Resolve: ' + plan.technicalContext.needsClarification.join(', '),
      });
    }

    if (plan.constitutionCheck && !plan.constitutionCheck.passed) {
      this.errors.push({
        message: 'Constitution check failed',
        code: 'CONSTITUTION_FAILED',
        context: plan.constitutionCheck.violations.map((v) => v.articleName).join(', '),
      });
    }
  }
}

/**
 * Convenience functions
 */
export function parsePlan(content: string, filePath: string): ParseResult<ImplementationPlan> {
  const parser = new PlanParser();
  return parser.parsePlan(content, filePath);
}

export function parseResearch(content: string, filePath: string): ParseResult<ResearchDocument> {
  const parser = new PlanParser();
  return parser.parseResearch(content, filePath);
}

export function parseDataModel(content: string, filePath: string): ParseResult<DataModelDocument> {
  const parser = new PlanParser();
  return parser.parseDataModel(content, filePath);
}

export default PlanParser;
