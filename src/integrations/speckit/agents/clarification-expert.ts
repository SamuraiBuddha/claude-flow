/**
 * Clarification Expert Agent
 *
 * Performs structured specification refinement (/speckit.clarify).
 * Generates coverage-based questions, records answers, and validates
 * completeness of specifications.
 *
 * @module ClarificationExpertAgent
 */

import { BaseAgent } from '../../../cli/agents/base-agent.js';
import type {
  AgentCapabilities,
  AgentConfig,
  AgentEnvironment,
  TaskDefinition,
} from '../../../swarm/types.js';
import type { ILogger } from '../../../core/logger.js';
import type { IEventBus } from '../../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../../memory/distributed-memory.js';

/**
 * Categories for clarification questions
 */
export type QuestionCategory =
  | 'functional'
  | 'non-functional'
  | 'technical'
  | 'business'
  | 'user-experience'
  | 'integration'
  | 'security'
  | 'scalability'
  | 'edge-case';

/**
 * Clarification question
 */
export interface ClarificationQuestion {
  id: string;
  specId: string;
  section: string;
  question: string;
  category: QuestionCategory;
  priority: 'critical' | 'high' | 'medium' | 'low';
  context: string;
  relatedQuestions: string[];
  status: 'pending' | 'answered' | 'deferred' | 'not-applicable';
  answer?: ClarificationAnswer;
  createdAt: Date;
}

/**
 * Answer to a clarification question
 */
export interface ClarificationAnswer {
  questionId: string;
  answer: string;
  answeredBy: string;
  answeredAt: Date;
  confidence: number;
  source: 'stakeholder' | 'document' | 'assumption' | 'expert';
  notes?: string;
  attachments?: string[];
  requiresFollowUp: boolean;
}

/**
 * Specification coverage analysis
 */
export interface CoverageAnalysis {
  specId: string;
  totalSections: number;
  coveredSections: number;
  gapSections: string[];
  coveragePercentage: number;
  byCategory: Record<QuestionCategory, {
    total: number;
    answered: number;
    coverage: number;
  }>;
  recommendations: string[];
}

/**
 * Clarification session state
 */
export interface ClarificationSession {
  id: string;
  specId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'paused';
  questionsAsked: number;
  questionsAnswered: number;
  participant?: string;
  coverageProgress: number;
}

/**
 * Completeness validation result
 */
export interface CompletenessResult {
  specId: string;
  complete: boolean;
  score: number;
  gaps: CompletenessGap[];
  recommendations: string[];
  readyForImplementation: boolean;
}

/**
 * Gap in specification completeness
 */
export interface CompletenessGap {
  section: string;
  category: QuestionCategory;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  suggestedQuestions: string[];
}

/**
 * Clarification Expert Agent - Structured specification refinement
 */
export class ClarificationExpertAgent extends BaseAgent {
  private questions: Map<string, ClarificationQuestion> = new Map();
  private sessions: Map<string, ClarificationSession> = new Map();
  private questionTemplates: Map<QuestionCategory, string[]> = new Map();

  constructor(
    id: string,
    config: AgentConfig,
    environment: AgentEnvironment,
    logger: ILogger,
    eventBus: IEventBus,
    memory: DistributedMemorySystem,
  ) {
    super(id, 'specialist', config, environment, logger, eventBus, memory);
    this.initializeQuestionTemplates();
  }

  /**
   * Get default capabilities for clarification expertise
   */
  protected getDefaultCapabilities(): AgentCapabilities {
    return {
      codeGeneration: false,
      codeReview: false,
      testing: false,
      documentation: true,
      research: true,
      analysis: true,
      webSearch: false,
      apiIntegration: false,
      fileSystem: true,
      terminalAccess: false,
      languages: [],
      frameworks: [],
      domains: [
        'specification-refinement',
        'requirement-elicitation',
        'gap-analysis',
        'coverage-validation',
        'question-generation',
        'completeness-checking',
      ],
      tools: [
        'generate-questions',
        'record-answers',
        'validate-completeness',
        'analyze-coverage',
        'manage-session',
        'export-clarifications',
      ],
      maxConcurrentTasks: 3,
      maxMemoryUsage: 256 * 1024 * 1024, // 256MB
      maxExecutionTime: 600000, // 10 minutes
      reliability: 0.94,
      speed: 0.88,
      quality: 0.96,
    };
  }

  /**
   * Get default configuration for the agent
   */
  protected getDefaultConfig(): Partial<AgentConfig> {
    return {
      autonomyLevel: 0.75,
      learningEnabled: true,
      adaptationEnabled: true,
      maxTasksPerHour: 50,
      maxConcurrentTasks: 3,
      timeoutThreshold: 600000,
      reportingInterval: 30000,
      heartbeatInterval: 10000,
      permissions: ['file-read', 'file-write', 'memory-access'],
      trustedAgents: [],
      expertise: {
        'requirement-elicitation': 0.95,
        'question-generation': 0.92,
        'gap-analysis': 0.9,
        'completeness-validation': 0.94,
      },
      preferences: {
        prioritizeCritical: true,
        groupRelatedQuestions: true,
        adaptiveQuestioning: true,
        minCoverageThreshold: 0.85,
      },
    };
  }

  /**
   * Execute a clarification task
   */
  override async executeTask(task: TaskDefinition): Promise<any> {
    this.logger.info('Clarification Expert executing task', {
      agentId: this.id,
      taskType: task.type,
      taskId: task.id,
    });

    try {
      switch (task.type) {
        case 'generate-questions':
          return await this.generateQuestions(task);
        case 'record-answers':
          return await this.recordAnswers(task);
        case 'validate-completeness':
          return await this.validateCompleteness(task);
        case 'analyze-coverage':
          return await this.analyzeCoverage(task);
        case 'manage-session':
          return await this.manageSession(task);
        default:
          return await this.performGeneralClarification(task);
      }
    } catch (error) {
      this.logger.error('Clarification task failed', {
        agentId: this.id,
        taskId: task.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Generate clarification questions based on specification
   */
  private async generateQuestions(task: TaskDefinition): Promise<any> {
    const specification = task.input?.specification;
    const specId = specification?.id || task.parameters?.specId || 'unknown';
    const focusCategories = task.parameters?.categories as QuestionCategory[] || [
      'functional',
      'non-functional',
      'technical',
      'business',
    ];
    const maxQuestions = task.parameters?.maxQuestions || 20;

    this.logger.info('Generating clarification questions', {
      specId,
      focusCategories,
      maxQuestions,
    });

    const generatedQuestions: ClarificationQuestion[] = [];

    // Analyze specification structure
    const sections = this.analyzeSpecificationSections(specification);

    for (const section of sections) {
      for (const category of focusCategories) {
        const questions = this.generateSectionQuestions(
          specId,
          section,
          category,
          specification
        );

        for (const q of questions) {
          if (generatedQuestions.length >= maxQuestions) break;

          const question: ClarificationQuestion = {
            id: `q-${Date.now()}-${generatedQuestions.length}`,
            specId,
            section: section.name,
            question: q.question,
            category,
            priority: q.priority,
            context: section.content,
            relatedQuestions: [],
            status: 'pending',
            createdAt: new Date(),
          };

          generatedQuestions.push(question);
          this.questions.set(question.id, question);
        }

        if (generatedQuestions.length >= maxQuestions) break;
      }
    }

    // Link related questions
    this.linkRelatedQuestions(generatedQuestions);

    // Store questions
    await this.memory.store(`questions:${specId}:generated`, {
      specId,
      count: generatedQuestions.length,
      questions: generatedQuestions,
    }, {
      type: 'clarification-questions',
      tags: ['clarification', 'questions', specId],
      partition: 'clarification',
    });

    return {
      generated: generatedQuestions.length,
      questions: generatedQuestions,
      byCategory: this.groupByCategory(generatedQuestions),
      byPriority: this.groupByPriority(generatedQuestions),
      nextSteps: [
        'Review generated questions with stakeholders',
        'Schedule clarification session',
        'Record answers as they are provided',
      ],
    };
  }

  /**
   * Record answers to clarification questions
   */
  private async recordAnswers(task: TaskDefinition): Promise<any> {
    const answers = task.input?.answers as Array<{
      questionId: string;
      answer: string;
      answeredBy?: string;
      confidence?: number;
      source?: ClarificationAnswer['source'];
    }>;

    if (!answers || answers.length === 0) {
      throw new Error('No answers provided');
    }

    this.logger.info('Recording clarification answers', {
      answerCount: answers.length,
    });

    const recorded: ClarificationAnswer[] = [];
    const notFound: string[] = [];

    for (const input of answers) {
      const question = this.questions.get(input.questionId);

      if (!question) {
        notFound.push(input.questionId);
        continue;
      }

      const answer: ClarificationAnswer = {
        questionId: input.questionId,
        answer: input.answer,
        answeredBy: input.answeredBy || 'unknown',
        answeredAt: new Date(),
        confidence: input.confidence || 0.8,
        source: input.source || 'stakeholder',
        requiresFollowUp: this.determineFollowUpNeeded(input.answer, question),
      };

      question.answer = answer;
      question.status = 'answered';
      this.questions.set(input.questionId, question);
      recorded.push(answer);

      // Emit answer recorded event
      this.eventBus.emit('clarification:answer-recorded', {
        questionId: input.questionId,
        specId: question.specId,
        category: question.category,
      });
    }

    await this.memory.store(`answers:${task.id.id}:recorded`, {
      count: recorded.length,
      answers: recorded,
      notFound,
    }, {
      type: 'clarification-answers',
      tags: ['clarification', 'answers'],
      partition: 'clarification',
    });

    return {
      recorded: recorded.length,
      notFound: notFound.length,
      answers: recorded,
      requireFollowUp: recorded.filter(a => a.requiresFollowUp).length,
      notFoundIds: notFound,
    };
  }

  /**
   * Validate specification completeness
   */
  private async validateCompleteness(task: TaskDefinition): Promise<CompletenessResult> {
    const specId = task.input?.specId || task.parameters?.specId;
    const specification = task.input?.specification;
    const strictMode = task.parameters?.strictMode ?? false;

    this.logger.info('Validating specification completeness', { specId });

    const specQuestions = Array.from(this.questions.values())
      .filter(q => q.specId === specId);

    const answered = specQuestions.filter(q => q.status === 'answered');
    const pending = specQuestions.filter(q => q.status === 'pending');

    // Calculate completeness score
    const baseScore = specQuestions.length > 0
      ? (answered.length / specQuestions.length) * 100
      : 0;

    // Identify gaps
    const gaps: CompletenessGap[] = [];

    // Group pending questions by section
    const pendingBySection = new Map<string, ClarificationQuestion[]>();
    for (const q of pending) {
      const existing = pendingBySection.get(q.section) || [];
      existing.push(q);
      pendingBySection.set(q.section, existing);
    }

    for (const [section, questions] of pendingBySection) {
      const criticalCount = questions.filter(q => q.priority === 'critical').length;
      const highCount = questions.filter(q => q.priority === 'high').length;

      let severity: CompletenessGap['severity'] = 'minor';
      if (criticalCount > 0) severity = 'critical';
      else if (highCount > 0) severity = 'major';

      gaps.push({
        section,
        category: questions[0].category,
        description: `${questions.length} unanswered questions in section`,
        severity,
        suggestedQuestions: questions.slice(0, 3).map(q => q.question),
      });
    }

    // Check for category coverage
    const categoryGaps = this.identifyCategoryGaps(specQuestions);
    gaps.push(...categoryGaps);

    // Adjust score based on gaps
    let adjustedScore = baseScore;
    const criticalGaps = gaps.filter(g => g.severity === 'critical');
    const majorGaps = gaps.filter(g => g.severity === 'major');

    adjustedScore -= criticalGaps.length * 10;
    adjustedScore -= majorGaps.length * 5;
    adjustedScore = Math.max(0, adjustedScore);

    const readyForImplementation = strictMode
      ? criticalGaps.length === 0 && adjustedScore >= 90
      : criticalGaps.length === 0 && adjustedScore >= 75;

    const result: CompletenessResult = {
      specId,
      complete: gaps.length === 0,
      score: adjustedScore,
      gaps,
      recommendations: this.generateCompletenessRecommendations(gaps, adjustedScore),
      readyForImplementation,
    };

    await this.memory.store(`completeness:${specId}:result`, result, {
      type: 'completeness-validation',
      tags: ['clarification', 'completeness', specId],
      partition: 'clarification',
    });

    return result;
  }

  /**
   * Analyze coverage of clarifications
   */
  private async analyzeCoverage(task: TaskDefinition): Promise<CoverageAnalysis> {
    const specId = task.input?.specId || task.parameters?.specId;
    const specification = task.input?.specification;

    this.logger.info('Analyzing clarification coverage', { specId });

    const specQuestions = Array.from(this.questions.values())
      .filter(q => q.specId === specId);

    // Analyze by section
    const sections = new Set(specQuestions.map(q => q.section));
    const coveredSections = new Set(
      specQuestions.filter(q => q.status === 'answered').map(q => q.section)
    );

    // Analyze by category
    const byCategory: Record<QuestionCategory, { total: number; answered: number; coverage: number }> = {} as any;

    const categories: QuestionCategory[] = [
      'functional',
      'non-functional',
      'technical',
      'business',
      'user-experience',
      'integration',
      'security',
      'scalability',
      'edge-case',
    ];

    for (const category of categories) {
      const categoryQuestions = specQuestions.filter(q => q.category === category);
      const answeredCount = categoryQuestions.filter(q => q.status === 'answered').length;

      byCategory[category] = {
        total: categoryQuestions.length,
        answered: answeredCount,
        coverage: categoryQuestions.length > 0
          ? (answeredCount / categoryQuestions.length) * 100
          : 100, // No questions means 100% coverage
      };
    }

    // Identify gap sections
    const gapSections = Array.from(sections).filter(s => !coveredSections.has(s));

    const analysis: CoverageAnalysis = {
      specId,
      totalSections: sections.size,
      coveredSections: coveredSections.size,
      gapSections,
      coveragePercentage: sections.size > 0
        ? (coveredSections.size / sections.size) * 100
        : 100,
      byCategory,
      recommendations: this.generateCoverageRecommendations(byCategory, gapSections),
    };

    await this.memory.store(`coverage:${specId}:analysis`, analysis, {
      type: 'coverage-analysis',
      tags: ['clarification', 'coverage', specId],
      partition: 'clarification',
    });

    return analysis;
  }

  /**
   * Manage clarification session
   */
  private async manageSession(task: TaskDefinition): Promise<any> {
    const action = task.parameters?.action || 'status';
    const sessionId = task.input?.sessionId || task.parameters?.sessionId;
    const specId = task.input?.specId;

    this.logger.info('Managing clarification session', { action, sessionId });

    switch (action) {
      case 'start': {
        if (!specId) throw new Error('specId required to start session');

        const session: ClarificationSession = {
          id: `session-${Date.now()}`,
          specId,
          startedAt: new Date(),
          status: 'active',
          questionsAsked: 0,
          questionsAnswered: 0,
          participant: task.input?.participant,
          coverageProgress: 0,
        };

        this.sessions.set(session.id, session);

        return {
          action: 'started',
          session,
          pendingQuestions: Array.from(this.questions.values())
            .filter(q => q.specId === specId && q.status === 'pending')
            .sort((a, b) => this.priorityOrder(a.priority) - this.priorityOrder(b.priority))
            .slice(0, 10),
        };
      }

      case 'pause': {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error(`Session not found: ${sessionId}`);

        session.status = 'paused';
        this.sessions.set(sessionId, session);

        return { action: 'paused', session };
      }

      case 'resume': {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error(`Session not found: ${sessionId}`);

        session.status = 'active';
        this.sessions.set(sessionId, session);

        const pendingQuestions = Array.from(this.questions.values())
          .filter(q => q.specId === session.specId && q.status === 'pending')
          .slice(0, 10);

        return { action: 'resumed', session, pendingQuestions };
      }

      case 'complete': {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error(`Session not found: ${sessionId}`);

        session.status = 'completed';
        session.completedAt = new Date();

        // Calculate final coverage
        const specQuestions = Array.from(this.questions.values())
          .filter(q => q.specId === session.specId);
        session.questionsAsked = specQuestions.length;
        session.questionsAnswered = specQuestions.filter(q => q.status === 'answered').length;
        session.coverageProgress = specQuestions.length > 0
          ? (session.questionsAnswered / session.questionsAsked) * 100
          : 100;

        this.sessions.set(sessionId, session);

        return { action: 'completed', session };
      }

      case 'status':
      default: {
        if (sessionId) {
          const session = this.sessions.get(sessionId);
          if (!session) throw new Error(`Session not found: ${sessionId}`);

          const specQuestions = Array.from(this.questions.values())
            .filter(q => q.specId === session.specId);

          return {
            session,
            statistics: {
              totalQuestions: specQuestions.length,
              answered: specQuestions.filter(q => q.status === 'answered').length,
              pending: specQuestions.filter(q => q.status === 'pending').length,
              deferred: specQuestions.filter(q => q.status === 'deferred').length,
            },
          };
        }

        // Return all sessions
        return {
          sessions: Array.from(this.sessions.values()),
          activeSessions: Array.from(this.sessions.values())
            .filter(s => s.status === 'active').length,
        };
      }
    }
  }

  /**
   * Perform general clarification
   */
  private async performGeneralClarification(task: TaskDefinition): Promise<any> {
    const specification = task.input?.specification;
    const specId = specification?.id || task.parameters?.specId;

    // Generate questions if specification provided
    if (specification) {
      const generated = await this.generateQuestions({
        ...task,
        type: 'generate-questions',
        input: { specification },
      });

      return {
        questions: generated,
        nextAction: 'record-answers',
      };
    }

    // Otherwise, analyze current coverage
    if (specId) {
      const coverage = await this.analyzeCoverage({
        ...task,
        type: 'analyze-coverage',
        input: { specId },
      });

      const completeness = await this.validateCompleteness({
        ...task,
        type: 'validate-completeness',
        input: { specId },
      });

      return {
        coverage,
        completeness,
        recommendations: completeness.recommendations,
      };
    }

    throw new Error('Specification or specId required');
  }

  /**
   * Analyze specification sections
   */
  private analyzeSpecificationSections(specification: any): Array<{
    name: string;
    content: string;
    type: string;
  }> {
    if (!specification) return [];

    const sections: Array<{ name: string; content: string; type: string }> = [];

    // Handle different specification formats
    if (specification.sections) {
      for (const section of specification.sections) {
        sections.push({
          name: section.name || section.title,
          content: JSON.stringify(section.content || section),
          type: section.type || 'general',
        });
      }
    } else {
      // Analyze object structure
      for (const [key, value] of Object.entries(specification)) {
        if (typeof value === 'object' && value !== null) {
          sections.push({
            name: key,
            content: JSON.stringify(value),
            type: this.inferSectionType(key),
          });
        }
      }
    }

    return sections;
  }

  /**
   * Infer section type from name
   */
  private inferSectionType(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('requirement') || lower.includes('feature')) return 'functional';
    if (lower.includes('performance') || lower.includes('scale')) return 'non-functional';
    if (lower.includes('api') || lower.includes('data')) return 'technical';
    if (lower.includes('user') || lower.includes('story')) return 'user-experience';
    return 'general';
  }

  /**
   * Generate questions for a section
   */
  private generateSectionQuestions(
    specId: string,
    section: { name: string; content: string; type: string },
    category: QuestionCategory,
    specification: any
  ): Array<{ question: string; priority: ClarificationQuestion['priority'] }> {
    const templates = this.questionTemplates.get(category) || [];
    const questions: Array<{ question: string; priority: ClarificationQuestion['priority'] }> = [];

    // Use templates
    for (const template of templates) {
      const question = template.replace('{section}', section.name);
      questions.push({
        question,
        priority: this.determineQuestionPriority(question, section, category),
      });
    }

    // Add section-specific questions
    const sectionQuestions = this.generateContextualQuestions(section, category);
    questions.push(...sectionQuestions);

    return questions.slice(0, 5); // Limit per section/category
  }

  /**
   * Generate contextual questions based on content
   */
  private generateContextualQuestions(
    section: { name: string; content: string; type: string },
    category: QuestionCategory
  ): Array<{ question: string; priority: ClarificationQuestion['priority'] }> {
    const questions: Array<{ question: string; priority: ClarificationQuestion['priority'] }> = [];

    // Look for indicators of incompleteness
    if (section.content.includes('TBD') || section.content.includes('TODO')) {
      questions.push({
        question: `What are the specific details for the TBD items in ${section.name}?`,
        priority: 'high',
      });
    }

    if (section.content.includes('?')) {
      questions.push({
        question: `Can you clarify the questions/uncertainties in ${section.name}?`,
        priority: 'medium',
      });
    }

    return questions;
  }

  /**
   * Determine question priority
   */
  private determineQuestionPriority(
    question: string,
    section: { name: string; content: string; type: string },
    category: QuestionCategory
  ): ClarificationQuestion['priority'] {
    // Critical categories
    if (category === 'security' || category === 'scalability') {
      return 'high';
    }

    // Check for critical keywords
    if (question.match(/security|authentication|authorization|encryption/i)) {
      return 'critical';
    }

    if (question.match(/performance|latency|throughput|scale/i)) {
      return 'high';
    }

    if (question.match(/nice to have|optional|future/i)) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * Link related questions
   */
  private linkRelatedQuestions(questions: ClarificationQuestion[]): void {
    for (const q1 of questions) {
      for (const q2 of questions) {
        if (q1.id === q2.id) continue;

        // Same section or category
        if (q1.section === q2.section || q1.category === q2.category) {
          if (!q1.relatedQuestions.includes(q2.id)) {
            q1.relatedQuestions.push(q2.id);
          }
        }
      }
    }
  }

  /**
   * Determine if follow-up is needed
   */
  private determineFollowUpNeeded(answer: string, question: ClarificationQuestion): boolean {
    const indicators = [
      'depends',
      'not sure',
      'maybe',
      'possibly',
      'need to check',
      'will confirm',
      'TBD',
      '?',
    ];

    return indicators.some(i => answer.toLowerCase().includes(i.toLowerCase()));
  }

  /**
   * Group questions by category
   */
  private groupByCategory(questions: ClarificationQuestion[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    for (const q of questions) {
      grouped[q.category] = (grouped[q.category] || 0) + 1;
    }
    return grouped;
  }

  /**
   * Group questions by priority
   */
  private groupByPriority(questions: ClarificationQuestion[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    for (const q of questions) {
      grouped[q.priority] = (grouped[q.priority] || 0) + 1;
    }
    return grouped;
  }

  /**
   * Priority sort order
   */
  private priorityOrder(priority: ClarificationQuestion['priority']): number {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[priority];
  }

  /**
   * Identify category gaps
   */
  private identifyCategoryGaps(questions: ClarificationQuestion[]): CompletenessGap[] {
    const gaps: CompletenessGap[] = [];
    const requiredCategories: QuestionCategory[] = ['functional', 'technical', 'security'];

    for (const category of requiredCategories) {
      const categoryQuestions = questions.filter(q => q.category === category);
      const answered = categoryQuestions.filter(q => q.status === 'answered');

      if (categoryQuestions.length === 0) {
        gaps.push({
          section: 'global',
          category,
          description: `No ${category} questions have been addressed`,
          severity: 'major',
          suggestedQuestions: this.questionTemplates.get(category)?.slice(0, 3) || [],
        });
      } else if (answered.length < categoryQuestions.length * 0.5) {
        gaps.push({
          section: 'global',
          category,
          description: `Less than 50% of ${category} questions answered`,
          severity: 'minor',
          suggestedQuestions: categoryQuestions
            .filter(q => q.status === 'pending')
            .slice(0, 3)
            .map(q => q.question),
        });
      }
    }

    return gaps;
  }

  /**
   * Generate completeness recommendations
   */
  private generateCompletenessRecommendations(
    gaps: CompletenessGap[],
    score: number
  ): string[] {
    const recommendations: string[] = [];

    if (score < 50) {
      recommendations.push('Significant clarification work needed - schedule stakeholder sessions');
    } else if (score < 75) {
      recommendations.push('Moderate clarification needed - focus on high-priority gaps');
    }

    const criticalGaps = gaps.filter(g => g.severity === 'critical');
    if (criticalGaps.length > 0) {
      recommendations.push(
        `Address ${criticalGaps.length} critical gaps before proceeding`
      );
    }

    for (const gap of gaps.slice(0, 3)) {
      recommendations.push(`Fill ${gap.category} gap in ${gap.section}`);
    }

    return recommendations;
  }

  /**
   * Generate coverage recommendations
   */
  private generateCoverageRecommendations(
    byCategory: Record<QuestionCategory, { total: number; answered: number; coverage: number }>,
    gapSections: string[]
  ): string[] {
    const recommendations: string[] = [];

    // Low coverage categories
    for (const [category, data] of Object.entries(byCategory)) {
      if (data.total > 0 && data.coverage < 50) {
        recommendations.push(`Improve ${category} coverage (currently ${data.coverage.toFixed(0)}%)`);
      }
    }

    // Gap sections
    if (gapSections.length > 0) {
      recommendations.push(`Address gaps in sections: ${gapSections.slice(0, 3).join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Initialize question templates
   */
  private initializeQuestionTemplates(): void {
    this.questionTemplates.set('functional', [
      'What are the specific acceptance criteria for {section}?',
      'Are there any edge cases to consider for {section}?',
      'What should happen if {section} fails?',
      'What are the input/output requirements for {section}?',
    ]);

    this.questionTemplates.set('non-functional', [
      'What are the performance requirements for {section}?',
      'What is the expected load/throughput for {section}?',
      'What are the availability requirements for {section}?',
      'What are the response time expectations for {section}?',
    ]);

    this.questionTemplates.set('technical', [
      'What technologies should be used for {section}?',
      'Are there any technical constraints for {section}?',
      'What data formats are required for {section}?',
      'How should {section} integrate with existing systems?',
    ]);

    this.questionTemplates.set('business', [
      'What is the business priority of {section}?',
      'Who are the stakeholders for {section}?',
      'What is the expected ROI for {section}?',
      'Are there compliance requirements for {section}?',
    ]);

    this.questionTemplates.set('security', [
      'What authentication is required for {section}?',
      'What data needs to be protected in {section}?',
      'Are there specific security standards for {section}?',
      'What are the access control requirements for {section}?',
    ]);

    this.questionTemplates.set('user-experience', [
      'Who are the primary users of {section}?',
      'What is the expected user workflow for {section}?',
      'Are there accessibility requirements for {section}?',
      'What feedback should users receive from {section}?',
    ]);

    this.questionTemplates.set('integration', [
      'What external systems does {section} integrate with?',
      'What APIs are needed for {section}?',
      'How should data be synchronized in {section}?',
      'What are the integration protocols for {section}?',
    ]);

    this.questionTemplates.set('scalability', [
      'What is the expected growth for {section}?',
      'How should {section} scale horizontally?',
      'What are the capacity limits for {section}?',
      'How should {section} handle peak loads?',
    ]);

    this.questionTemplates.set('edge-case', [
      'What happens when {section} receives invalid input?',
      'How should {section} handle concurrent access?',
      'What is the behavior of {section} under resource constraints?',
      'How should {section} handle network failures?',
    ]);
  }

  /**
   * Get agent status with clarification-specific information
   */
  override getAgentStatus(): any {
    const questions = Array.from(this.questions.values());
    const sessions = Array.from(this.sessions.values());

    return {
      ...super.getAgentStatus(),
      specialization: 'Clarification Expert',
      totalQuestions: questions.length,
      answeredQuestions: questions.filter(q => q.status === 'answered').length,
      activeSessions: sessions.filter(s => s.status === 'active').length,
      capabilities: [
        'generate-questions',
        'record-answers',
        'validate-completeness',
      ],
    };
  }
}

/**
 * Factory function to create a Clarification Expert Agent
 */
export const createClarificationExpertAgent = (
  id: string,
  config: Partial<AgentConfig>,
  environment: Partial<AgentEnvironment>,
  logger: ILogger,
  eventBus: IEventBus,
  memory: DistributedMemorySystem,
): ClarificationExpertAgent => {
  const defaultConfig: AgentConfig = {
    autonomyLevel: 0.75,
    learningEnabled: true,
    adaptationEnabled: true,
    maxTasksPerHour: 50,
    maxConcurrentTasks: 3,
    timeoutThreshold: 600000,
    reportingInterval: 30000,
    heartbeatInterval: 10000,
    permissions: ['file-read', 'file-write', 'memory-access'],
    trustedAgents: [],
    expertise: {
      'requirement-elicitation': 0.95,
      'question-generation': 0.92,
    },
    preferences: {
      prioritizeCritical: true,
      groupRelatedQuestions: true,
    },
  };

  const defaultEnv: AgentEnvironment = {
    runtime: 'node',
    version: '20.0.0',
    workingDirectory: './agents/clarification-expert',
    tempDirectory: './tmp/clarification-expert',
    logDirectory: './logs/clarification-expert',
    apiEndpoints: {},
    credentials: {},
    availableTools: ['generate-questions', 'record-answers', 'validate-completeness'],
    toolConfigs: {},
  };

  return new ClarificationExpertAgent(
    id,
    { ...defaultConfig, ...config } as AgentConfig,
    { ...defaultEnv, ...environment } as AgentEnvironment,
    logger,
    eventBus,
    memory,
  );
};
