/**
 * NFR Specialist Agent
 *
 * Specializes in Non-Functional Requirements (performance, security, scalability).
 * Extracts NFRs from specifications, validates that plans address them, and
 * creates appropriate tests.
 *
 * @module NFRSpecialistAgent
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
 * Categories of non-functional requirements
 */
export type NFRCategory =
  | 'performance'
  | 'security'
  | 'scalability'
  | 'reliability'
  | 'availability'
  | 'maintainability'
  | 'usability'
  | 'compliance'
  | 'interoperability'
  | 'portability';

/**
 * Non-functional requirement definition
 */
export interface NFR {
  id: string;
  category: NFRCategory;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  metrics: NFRMetric[];
  acceptanceCriteria: string[];
  source: string;
  status: 'extracted' | 'validated' | 'addressed' | 'tested' | 'verified';
  relatedRequirements: string[];
  testIds: string[];
  extractedAt: Date;
}

/**
 * Metric for measuring NFR compliance
 */
export interface NFRMetric {
  name: string;
  description: string;
  unit: string;
  targetValue: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  measurementMethod: string;
}

/**
 * NFR validation result
 */
export interface NFRValidationResult {
  nfrId: string;
  addressed: boolean;
  coverage: number;
  gaps: NFRGap[];
  recommendations: string[];
  planReferences: string[];
}

/**
 * Gap in NFR coverage
 */
export interface NFRGap {
  nfrId: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  impact: string;
  suggestedAction: string;
}

/**
 * NFR test definition
 */
export interface NFRTest {
  id: string;
  nfrId: string;
  name: string;
  description: string;
  type: NFRTestType;
  setup: string;
  steps: NFRTestStep[];
  expectedResults: ExpectedResult[];
  metrics: NFRMetric[];
  tools: string[];
  duration: number;
}

/**
 * Types of NFR tests
 */
export type NFRTestType =
  | 'load-test'
  | 'stress-test'
  | 'endurance-test'
  | 'spike-test'
  | 'security-scan'
  | 'penetration-test'
  | 'failover-test'
  | 'recovery-test'
  | 'scalability-test'
  | 'compliance-audit';

/**
 * Test step
 */
export interface NFRTestStep {
  order: number;
  action: string;
  parameters: Record<string, any>;
  expectedOutcome: string;
  timeout?: number;
}

/**
 * Expected test result
 */
export interface ExpectedResult {
  metric: string;
  condition: 'lessThan' | 'greaterThan' | 'equals' | 'between' | 'exists';
  value: number | string | [number, number];
  tolerance?: number;
}

/**
 * NFR analysis report
 */
export interface NFRAnalysisReport {
  specId: string;
  totalNFRs: number;
  byCategory: Record<NFRCategory, number>;
  byPriority: Record<string, number>;
  coverage: {
    addressed: number;
    tested: number;
    verified: number;
    percentage: number;
  };
  gaps: NFRGap[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  generatedAt: Date;
}

/**
 * NFR Specialist Agent - Non-Functional Requirements expert
 */
export class NFRSpecialistAgent extends BaseAgent {
  private nfrs: Map<string, NFR> = new Map();
  private tests: Map<string, NFRTest> = new Map();
  private validationResults: Map<string, NFRValidationResult> = new Map();

  constructor(
    id: string,
    config: AgentConfig,
    environment: AgentEnvironment,
    logger: ILogger,
    eventBus: IEventBus,
    memory: DistributedMemorySystem,
  ) {
    super(id, 'specialist', config, environment, logger, eventBus, memory);
    this.initializeNFRPatterns();
  }

  /**
   * Get default capabilities for NFR specialization
   */
  protected getDefaultCapabilities(): AgentCapabilities {
    return {
      codeGeneration: true,
      codeReview: true,
      testing: true,
      documentation: true,
      research: true,
      analysis: true,
      webSearch: false,
      apiIntegration: true,
      fileSystem: true,
      terminalAccess: true,
      languages: ['typescript', 'javascript', 'yaml', 'json'],
      frameworks: ['k6', 'artillery', 'jmeter', 'locust', 'owasp-zap'],
      domains: [
        'performance-engineering',
        'security-assessment',
        'scalability-analysis',
        'reliability-engineering',
        'compliance-auditing',
        'capacity-planning',
      ],
      tools: [
        'extract-nfrs',
        'validate-plan',
        'create-tests',
        'analyze-metrics',
        'assess-risks',
        'generate-report',
      ],
      maxConcurrentTasks: 4,
      maxMemoryUsage: 512 * 1024 * 1024, // 512MB
      maxExecutionTime: 900000, // 15 minutes
      reliability: 0.94,
      speed: 0.85,
      quality: 0.96,
    };
  }

  /**
   * Get default configuration for the agent
   */
  protected getDefaultConfig(): Partial<AgentConfig> {
    return {
      autonomyLevel: 0.8,
      learningEnabled: true,
      adaptationEnabled: true,
      maxTasksPerHour: 30,
      maxConcurrentTasks: 4,
      timeoutThreshold: 900000,
      reportingInterval: 30000,
      heartbeatInterval: 10000,
      permissions: ['file-read', 'file-write', 'memory-access', 'terminal-execute'],
      trustedAgents: [],
      expertise: {
        'performance-engineering': 0.95,
        'security-assessment': 0.92,
        'scalability-analysis': 0.9,
        'reliability-engineering': 0.88,
      },
      preferences: {
        strictCompliance: true,
        comprehensiveTests: true,
        riskBasedPrioritization: true,
        automatedVerification: true,
      },
    };
  }

  /**
   * Execute an NFR task
   */
  override async executeTask(task: TaskDefinition): Promise<any> {
    this.logger.info('NFR Specialist executing task', {
      agentId: this.id,
      taskType: task.type,
      taskId: task.id,
    });

    try {
      switch (task.type) {
        case 'extract-nfrs':
          return await this.extractNFRs(task);
        case 'validate-plan':
          return await this.validatePlan(task);
        case 'create-tests':
          return await this.createTests(task);
        case 'analyze-metrics':
          return await this.analyzeMetrics(task);
        case 'assess-risks':
          return await this.assessRisks(task);
        default:
          return await this.performGeneralAnalysis(task);
      }
    } catch (error) {
      this.logger.error('NFR task failed', {
        agentId: this.id,
        taskId: task.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Extract NFRs from specification
   */
  private async extractNFRs(task: TaskDefinition): Promise<any> {
    const specification = task.input?.specification;
    const source = task.input?.source || 'specification';
    const categories = task.parameters?.categories as NFRCategory[] || [
      'performance',
      'security',
      'scalability',
      'reliability',
      'availability',
    ];

    this.logger.info('Extracting NFRs', { source, categories });

    const extracted: NFR[] = [];

    // Extract from structured specification
    if (specification) {
      // Check for explicit NFR section
      if (specification.nfr || specification.nonFunctionalRequirements) {
        const nfrSection = specification.nfr || specification.nonFunctionalRequirements;
        extracted.push(...this.parseNFRSection(nfrSection, source));
      }

      // Extract from content using patterns
      const contentNFRs = this.extractNFRsFromContent(
        JSON.stringify(specification),
        categories,
        source
      );
      extracted.push(...contentNFRs);

      // Extract from specific sections
      if (specification.performance) {
        extracted.push(...this.extractPerformanceNFRs(specification.performance, source));
      }
      if (specification.security) {
        extracted.push(...this.extractSecurityNFRs(specification.security, source));
      }
      if (specification.scalability) {
        extracted.push(...this.extractScalabilityNFRs(specification.scalability, source));
      }
    }

    // Deduplicate and store
    const uniqueNFRs = this.deduplicateNFRs(extracted);
    for (const nfr of uniqueNFRs) {
      this.nfrs.set(nfr.id, nfr);
    }

    await this.memory.store(`nfrs:${task.id.id}:extracted`, {
      source,
      count: uniqueNFRs.length,
      nfrs: uniqueNFRs,
    }, {
      type: 'extracted-nfrs',
      tags: ['nfr', 'extraction'],
      partition: 'nfr',
    });

    return {
      extracted: uniqueNFRs.length,
      nfrs: uniqueNFRs,
      byCategory: this.groupByCategory(uniqueNFRs),
      byPriority: this.groupByPriority(uniqueNFRs),
      critical: uniqueNFRs.filter(n => n.priority === 'critical').length,
    };
  }

  /**
   * Validate that a plan addresses NFRs
   */
  private async validatePlan(task: TaskDefinition): Promise<any> {
    const plan = task.input?.plan;
    const nfrIds = task.input?.nfrIds || Array.from(this.nfrs.keys());

    this.logger.info('Validating plan against NFRs', {
      nfrCount: nfrIds.length,
    });

    const results: NFRValidationResult[] = [];
    const allGaps: NFRGap[] = [];

    for (const nfrId of nfrIds) {
      const nfr = this.nfrs.get(nfrId);
      if (!nfr) continue;

      const result = this.validateNFRAgainstPlan(nfr, plan);
      results.push(result);
      this.validationResults.set(nfrId, result);

      if (!result.addressed) {
        allGaps.push(...result.gaps);
      }

      // Update NFR status
      if (result.addressed) {
        nfr.status = 'addressed';
        this.nfrs.set(nfrId, nfr);
      }
    }

    const addressed = results.filter(r => r.addressed).length;
    const total = results.length;
    const overallCoverage = total > 0 ? (addressed / total) * 100 : 0;

    await this.memory.store(`validation:${task.id.id}:results`, {
      results,
      gaps: allGaps,
      coverage: overallCoverage,
    }, {
      type: 'nfr-validation',
      tags: ['nfr', 'validation'],
      partition: 'nfr',
    });

    return {
      validated: total,
      addressed,
      notAddressed: total - addressed,
      coverage: overallCoverage,
      results,
      gaps: allGaps,
      criticalGaps: allGaps.filter(g => g.severity === 'critical'),
      recommendations: this.generatePlanRecommendations(allGaps),
    };
  }

  /**
   * Create NFR tests
   */
  private async createTests(task: TaskDefinition): Promise<any> {
    const nfrIds = task.input?.nfrIds || Array.from(this.nfrs.keys());
    const testTypes = task.parameters?.testTypes || ['all'];

    this.logger.info('Creating NFR tests', {
      nfrCount: nfrIds.length,
      testTypes,
    });

    const createdTests: NFRTest[] = [];

    for (const nfrId of nfrIds) {
      const nfr = this.nfrs.get(nfrId);
      if (!nfr) continue;

      const tests = this.generateTestsForNFR(nfr, testTypes);
      for (const test of tests) {
        createdTests.push(test);
        this.tests.set(test.id, test);

        // Update NFR with test reference
        nfr.testIds.push(test.id);
        nfr.status = 'tested';
        this.nfrs.set(nfrId, nfr);
      }
    }

    // Generate test code
    const testCode = this.generateTestCode(createdTests);

    await this.memory.store(`tests:${task.id.id}:created`, {
      count: createdTests.length,
      tests: createdTests,
      testCode,
    }, {
      type: 'nfr-tests',
      tags: ['nfr', 'tests'],
      partition: 'nfr',
    });

    return {
      created: createdTests.length,
      tests: createdTests,
      testCode,
      byType: this.groupTestsByType(createdTests),
      estimatedDuration: createdTests.reduce((sum, t) => sum + t.duration, 0),
    };
  }

  /**
   * Analyze NFR metrics
   */
  private async analyzeMetrics(task: TaskDefinition): Promise<any> {
    const metrics = task.input?.metrics || [];
    const nfrIds = task.input?.nfrIds || Array.from(this.nfrs.keys());

    this.logger.info('Analyzing NFR metrics', {
      metricCount: metrics.length,
      nfrCount: nfrIds.length,
    });

    const analysis: Array<{
      nfrId: string;
      nfrName: string;
      metricResults: Array<{
        metric: string;
        target: number;
        actual: number;
        passed: boolean;
        variance: number;
      }>;
      passed: boolean;
      recommendations: string[];
    }> = [];

    for (const nfrId of nfrIds) {
      const nfr = this.nfrs.get(nfrId);
      if (!nfr) continue;

      const nfrMetrics = metrics.filter(
        (m: any) => nfr.metrics.some(nm => nm.name === m.name)
      );

      const metricResults: Array<{
        metric: string;
        target: number;
        actual: number;
        passed: boolean;
        variance: number;
      }> = [];

      for (const metric of nfr.metrics) {
        const actual = nfrMetrics.find((m: any) => m.name === metric.name);
        if (actual) {
          const passed = this.evaluateMetric(metric, actual.value);
          const variance = ((actual.value - metric.targetValue) / metric.targetValue) * 100;

          metricResults.push({
            metric: metric.name,
            target: metric.targetValue,
            actual: actual.value,
            passed,
            variance,
          });
        }
      }

      const passed = metricResults.every(r => r.passed);

      analysis.push({
        nfrId,
        nfrName: nfr.name,
        metricResults,
        passed,
        recommendations: passed ? [] : this.generateMetricRecommendations(metricResults),
      });

      // Update NFR status if all metrics pass
      if (passed) {
        nfr.status = 'verified';
        this.nfrs.set(nfrId, nfr);
      }
    }

    const passedCount = analysis.filter(a => a.passed).length;

    return {
      analyzed: analysis.length,
      passed: passedCount,
      failed: analysis.length - passedCount,
      passRate: analysis.length > 0 ? (passedCount / analysis.length) * 100 : 0,
      analysis,
      overallRecommendations: this.generateOverallRecommendations(analysis),
    };
  }

  /**
   * Assess NFR risks
   */
  private async assessRisks(task: TaskDefinition): Promise<any> {
    const nfrIds = task.input?.nfrIds || Array.from(this.nfrs.keys());

    this.logger.info('Assessing NFR risks', { nfrCount: nfrIds.length });

    const risks: Array<{
      nfrId: string;
      nfrName: string;
      category: NFRCategory;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      factors: string[];
      mitigations: string[];
    }> = [];

    for (const nfrId of nfrIds) {
      const nfr = this.nfrs.get(nfrId);
      if (!nfr) continue;

      const validationResult = this.validationResults.get(nfrId);
      const riskAssessment = this.assessNFRRisk(nfr, validationResult);
      risks.push({
        nfrId,
        nfrName: nfr.name,
        category: nfr.category,
        ...riskAssessment,
      });
    }

    // Calculate overall risk level
    const criticalRisks = risks.filter(r => r.riskLevel === 'critical').length;
    const highRisks = risks.filter(r => r.riskLevel === 'high').length;

    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalRisks > 0) overallRisk = 'critical';
    else if (highRisks > 2) overallRisk = 'high';
    else if (highRisks > 0) overallRisk = 'medium';

    return {
      assessed: risks.length,
      overallRiskLevel: overallRisk,
      byRiskLevel: {
        critical: criticalRisks,
        high: highRisks,
        medium: risks.filter(r => r.riskLevel === 'medium').length,
        low: risks.filter(r => r.riskLevel === 'low').length,
      },
      risks,
      topRisks: risks
        .filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high')
        .slice(0, 5),
      mitigationPlan: this.generateMitigationPlan(risks),
    };
  }

  /**
   * Perform general NFR analysis
   */
  private async performGeneralAnalysis(task: TaskDefinition): Promise<NFRAnalysisReport> {
    const specId = task.input?.specId || 'unknown';

    // Extract if specification provided
    if (task.input?.specification) {
      await this.extractNFRs({
        ...task,
        type: 'extract-nfrs',
      });
    }

    const nfrs = Array.from(this.nfrs.values());

    // Calculate statistics
    const byCategory: Record<NFRCategory, number> = {} as any;
    const byPriority: Record<string, number> = {};

    for (const nfr of nfrs) {
      byCategory[nfr.category] = (byCategory[nfr.category] || 0) + 1;
      byPriority[nfr.priority] = (byPriority[nfr.priority] || 0) + 1;
    }

    const addressed = nfrs.filter(n =>
      ['addressed', 'tested', 'verified'].includes(n.status)
    ).length;
    const tested = nfrs.filter(n =>
      ['tested', 'verified'].includes(n.status)
    ).length;
    const verified = nfrs.filter(n => n.status === 'verified').length;

    // Identify gaps
    const gaps: NFRGap[] = [];
    for (const nfr of nfrs) {
      if (nfr.status === 'extracted') {
        gaps.push({
          nfrId: nfr.id,
          description: `${nfr.name} has not been addressed`,
          severity: nfr.priority === 'critical' ? 'critical' : 'major',
          impact: `${nfr.category} requirements may not be met`,
          suggestedAction: `Review and address ${nfr.name}`,
        });
      }
    }

    // Calculate risk level
    const criticalUnaddressed = nfrs.filter(
      n => n.priority === 'critical' && n.status === 'extracted'
    ).length;

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalUnaddressed > 0) riskLevel = 'critical';
    else if (gaps.length > nfrs.length * 0.3) riskLevel = 'high';
    else if (gaps.length > nfrs.length * 0.1) riskLevel = 'medium';

    const report: NFRAnalysisReport = {
      specId,
      totalNFRs: nfrs.length,
      byCategory,
      byPriority,
      coverage: {
        addressed,
        tested,
        verified,
        percentage: nfrs.length > 0 ? (addressed / nfrs.length) * 100 : 0,
      },
      gaps,
      recommendations: this.generateAnalysisRecommendations(nfrs, gaps),
      riskLevel,
      generatedAt: new Date(),
    };

    await this.memory.store(`analysis:${specId}:report`, report, {
      type: 'nfr-analysis',
      tags: ['nfr', 'analysis', specId],
      partition: 'nfr',
    });

    return report;
  }

  /**
   * Parse NFR section from specification
   */
  private parseNFRSection(section: any, source: string): NFR[] {
    const nfrs: NFR[] = [];

    if (Array.isArray(section)) {
      for (const item of section) {
        nfrs.push(this.createNFR(item, source));
      }
    } else if (typeof section === 'object') {
      for (const [category, items] of Object.entries(section)) {
        if (Array.isArray(items)) {
          for (const item of items) {
            nfrs.push(this.createNFR({ ...item, category }, source));
          }
        }
      }
    }

    return nfrs;
  }

  /**
   * Create NFR from input
   */
  private createNFR(input: any, source: string): NFR {
    return {
      id: input.id || `nfr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: this.normalizeCategory(input.category),
      name: input.name || input.title || 'Unnamed NFR',
      description: input.description || '',
      priority: input.priority || 'medium',
      metrics: input.metrics || [],
      acceptanceCriteria: input.acceptanceCriteria || [],
      source,
      status: 'extracted',
      relatedRequirements: input.relatedRequirements || [],
      testIds: [],
      extractedAt: new Date(),
    };
  }

  /**
   * Normalize category string to NFRCategory
   */
  private normalizeCategory(category: string): NFRCategory {
    const normalized = category?.toLowerCase().replace(/[\s-_]/g, '');
    const mapping: Record<string, NFRCategory> = {
      performance: 'performance',
      perf: 'performance',
      security: 'security',
      sec: 'security',
      scalability: 'scalability',
      scale: 'scalability',
      reliability: 'reliability',
      availability: 'availability',
      maintainability: 'maintainability',
      usability: 'usability',
      compliance: 'compliance',
      interoperability: 'interoperability',
      portability: 'portability',
    };
    return mapping[normalized] || 'performance';
  }

  /**
   * Extract NFRs from content using patterns
   */
  private extractNFRsFromContent(
    content: string,
    categories: NFRCategory[],
    source: string
  ): NFR[] {
    const nfrs: NFR[] = [];

    // Performance patterns
    if (categories.includes('performance')) {
      const perfPatterns = [
        /response\s*time[^.]*?(\d+)\s*(ms|milliseconds|seconds?)/gi,
        /latency[^.]*?(\d+)\s*(ms|milliseconds|seconds?)/gi,
        /throughput[^.]*?(\d+)\s*(req|requests?|tps)/gi,
      ];

      for (const pattern of perfPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          nfrs.push({
            id: `nfr-perf-${nfrs.length}`,
            category: 'performance',
            name: `Performance: ${match[0].substring(0, 50)}`,
            description: match[0],
            priority: 'high',
            metrics: [{
              name: match[0].includes('response') ? 'response_time' : 'throughput',
              description: `Target: ${match[1]} ${match[2]}`,
              unit: match[2],
              targetValue: parseFloat(match[1]),
              measurementMethod: 'load_test',
            }],
            acceptanceCriteria: [match[0]],
            source,
            status: 'extracted',
            relatedRequirements: [],
            testIds: [],
            extractedAt: new Date(),
          });
        }
      }
    }

    // Security patterns
    if (categories.includes('security')) {
      const secPatterns = [
        /authentication[^.]*required/gi,
        /encryption[^.]*required/gi,
        /must\s+be\s+secure[d]?/gi,
        /compliance\s+with\s+(\w+)/gi,
      ];

      for (const pattern of secPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          nfrs.push({
            id: `nfr-sec-${nfrs.length}`,
            category: 'security',
            name: `Security: ${match[0].substring(0, 50)}`,
            description: match[0],
            priority: 'critical',
            metrics: [],
            acceptanceCriteria: [match[0]],
            source,
            status: 'extracted',
            relatedRequirements: [],
            testIds: [],
            extractedAt: new Date(),
          });
        }
      }
    }

    // Scalability patterns
    if (categories.includes('scalability')) {
      const scalePatterns = [
        /support[^.]*?(\d+)[^.]*?(users?|connections?|requests?)/gi,
        /scale\s+to[^.]*?(\d+)/gi,
        /handle[^.]*?(\d+)[^.]*?(concurrent|simultaneous)/gi,
      ];

      for (const pattern of scalePatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          nfrs.push({
            id: `nfr-scale-${nfrs.length}`,
            category: 'scalability',
            name: `Scalability: ${match[0].substring(0, 50)}`,
            description: match[0],
            priority: 'high',
            metrics: [{
              name: 'concurrent_capacity',
              description: `Target: ${match[1]} ${match[2] || 'units'}`,
              unit: match[2] || 'units',
              targetValue: parseFloat(match[1]),
              measurementMethod: 'load_test',
            }],
            acceptanceCriteria: [match[0]],
            source,
            status: 'extracted',
            relatedRequirements: [],
            testIds: [],
            extractedAt: new Date(),
          });
        }
      }
    }

    return nfrs;
  }

  /**
   * Extract performance NFRs
   */
  private extractPerformanceNFRs(section: any, source: string): NFR[] {
    const nfrs: NFR[] = [];

    if (section.responseTime) {
      nfrs.push(this.createNFR({
        category: 'performance',
        name: 'Response Time',
        description: `Response time requirement: ${section.responseTime}`,
        priority: 'high',
        metrics: [{
          name: 'response_time_p95',
          description: '95th percentile response time',
          unit: 'ms',
          targetValue: parseInt(section.responseTime) || 200,
          warningThreshold: parseInt(section.responseTime) * 1.5,
          criticalThreshold: parseInt(section.responseTime) * 2,
          measurementMethod: 'load_test',
        }],
      }, source));
    }

    if (section.throughput) {
      nfrs.push(this.createNFR({
        category: 'performance',
        name: 'Throughput',
        description: `Throughput requirement: ${section.throughput}`,
        priority: 'high',
        metrics: [{
          name: 'requests_per_second',
          description: 'Requests per second',
          unit: 'rps',
          targetValue: parseInt(section.throughput) || 1000,
          measurementMethod: 'load_test',
        }],
      }, source));
    }

    return nfrs;
  }

  /**
   * Extract security NFRs
   */
  private extractSecurityNFRs(section: any, source: string): NFR[] {
    const nfrs: NFR[] = [];

    if (section.authentication) {
      nfrs.push(this.createNFR({
        category: 'security',
        name: 'Authentication',
        description: `Authentication: ${section.authentication}`,
        priority: 'critical',
        acceptanceCriteria: [
          'All endpoints require authentication',
          'Token validation on every request',
        ],
      }, source));
    }

    if (section.encryption) {
      nfrs.push(this.createNFR({
        category: 'security',
        name: 'Data Encryption',
        description: `Encryption: ${section.encryption}`,
        priority: 'critical',
        acceptanceCriteria: [
          'Data encrypted at rest',
          'Data encrypted in transit (TLS)',
        ],
      }, source));
    }

    return nfrs;
  }

  /**
   * Extract scalability NFRs
   */
  private extractScalabilityNFRs(section: any, source: string): NFR[] {
    const nfrs: NFR[] = [];

    if (section.users) {
      nfrs.push(this.createNFR({
        category: 'scalability',
        name: 'User Capacity',
        description: `Support ${section.users} concurrent users`,
        priority: 'high',
        metrics: [{
          name: 'concurrent_users',
          description: 'Maximum concurrent users',
          unit: 'users',
          targetValue: parseInt(section.users) || 10000,
          measurementMethod: 'load_test',
        }],
      }, source));
    }

    return nfrs;
  }

  /**
   * Deduplicate NFRs
   */
  private deduplicateNFRs(nfrs: NFR[]): NFR[] {
    const seen = new Set<string>();
    return nfrs.filter(nfr => {
      const key = `${nfr.category}-${nfr.name}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Group NFRs by category
   */
  private groupByCategory(nfrs: NFR[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    for (const nfr of nfrs) {
      grouped[nfr.category] = (grouped[nfr.category] || 0) + 1;
    }
    return grouped;
  }

  /**
   * Group NFRs by priority
   */
  private groupByPriority(nfrs: NFR[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    for (const nfr of nfrs) {
      grouped[nfr.priority] = (grouped[nfr.priority] || 0) + 1;
    }
    return grouped;
  }

  /**
   * Validate NFR against plan
   */
  private validateNFRAgainstPlan(nfr: NFR, plan: any): NFRValidationResult {
    const gaps: NFRGap[] = [];
    const planReferences: string[] = [];
    let coverage = 0;

    // Search plan for NFR-related content
    const planStr = JSON.stringify(plan || {}).toLowerCase();
    const nfrKeywords = [
      nfr.name.toLowerCase(),
      nfr.category,
      ...nfr.acceptanceCriteria.map(ac => ac.toLowerCase()),
    ];

    let keywordsFound = 0;
    for (const keyword of nfrKeywords) {
      if (planStr.includes(keyword)) {
        keywordsFound++;
        planReferences.push(keyword);
      }
    }

    coverage = nfrKeywords.length > 0 ? (keywordsFound / nfrKeywords.length) * 100 : 0;

    // Identify gaps
    if (coverage < 50) {
      gaps.push({
        nfrId: nfr.id,
        description: `${nfr.name} is not adequately addressed in the plan`,
        severity: nfr.priority === 'critical' ? 'critical' : 'major',
        impact: `${nfr.category} requirements may not be met`,
        suggestedAction: `Add explicit plan items for ${nfr.name}`,
      });
    }

    for (const metric of nfr.metrics) {
      if (!planStr.includes(metric.name.toLowerCase())) {
        gaps.push({
          nfrId: nfr.id,
          description: `Metric ${metric.name} not mentioned in plan`,
          severity: 'minor',
          impact: 'Metric may not be tracked or measured',
          suggestedAction: `Include ${metric.name} measurement in plan`,
        });
      }
    }

    return {
      nfrId: nfr.id,
      addressed: coverage >= 50 && gaps.filter(g => g.severity !== 'minor').length === 0,
      coverage,
      gaps,
      recommendations: gaps.map(g => g.suggestedAction),
      planReferences,
    };
  }

  /**
   * Generate tests for NFR
   */
  private generateTestsForNFR(nfr: NFR, testTypes: string[]): NFRTest[] {
    const tests: NFRTest[] = [];

    const categoryTests: Record<NFRCategory, NFRTestType[]> = {
      performance: ['load-test', 'stress-test'],
      security: ['security-scan', 'penetration-test'],
      scalability: ['scalability-test', 'spike-test'],
      reliability: ['failover-test', 'recovery-test'],
      availability: ['endurance-test', 'failover-test'],
      maintainability: [],
      usability: [],
      compliance: ['compliance-audit'],
      interoperability: [],
      portability: [],
    };

    const applicableTypes = categoryTests[nfr.category] || [];
    const typesToGenerate = testTypes.includes('all')
      ? applicableTypes
      : applicableTypes.filter(t => testTypes.includes(t));

    for (const testType of typesToGenerate) {
      const test = this.generateTest(nfr, testType);
      tests.push(test);
    }

    return tests;
  }

  /**
   * Generate a single test
   */
  private generateTest(nfr: NFR, testType: NFRTestType): NFRTest {
    const testTemplates: Record<NFRTestType, Partial<NFRTest>> = {
      'load-test': {
        setup: 'Initialize load testing tool (k6/artillery)',
        steps: [
          { order: 1, action: 'Configure virtual users', parameters: { users: 100 }, expectedOutcome: 'Users configured', timeout: 5000 },
          { order: 2, action: 'Run load test', parameters: { duration: '5m' }, expectedOutcome: 'Test completed', timeout: 300000 },
          { order: 3, action: 'Collect metrics', parameters: {}, expectedOutcome: 'Metrics recorded', timeout: 10000 },
        ],
        tools: ['k6', 'artillery'],
        duration: 300000,
      },
      'stress-test': {
        setup: 'Configure stress testing scenario',
        steps: [
          { order: 1, action: 'Ramp up load', parameters: { maxUsers: 500 }, expectedOutcome: 'Load ramped', timeout: 60000 },
          { order: 2, action: 'Sustain maximum load', parameters: { duration: '10m' }, expectedOutcome: 'Load sustained', timeout: 600000 },
          { order: 3, action: 'Record breaking point', parameters: {}, expectedOutcome: 'Breaking point identified', timeout: 10000 },
        ],
        tools: ['k6', 'locust'],
        duration: 700000,
      },
      'security-scan': {
        setup: 'Configure OWASP ZAP scanner',
        steps: [
          { order: 1, action: 'Spider application', parameters: {}, expectedOutcome: 'Application mapped', timeout: 60000 },
          { order: 2, action: 'Active scan', parameters: {}, expectedOutcome: 'Scan completed', timeout: 300000 },
          { order: 3, action: 'Generate report', parameters: {}, expectedOutcome: 'Report generated', timeout: 10000 },
        ],
        tools: ['owasp-zap', 'nikto'],
        duration: 400000,
      },
      'penetration-test': {
        setup: 'Configure penetration testing environment',
        steps: [
          { order: 1, action: 'Reconnaissance', parameters: {}, expectedOutcome: 'Target mapped', timeout: 60000 },
          { order: 2, action: 'Vulnerability scanning', parameters: {}, expectedOutcome: 'Vulnerabilities identified', timeout: 180000 },
          { order: 3, action: 'Exploitation attempt', parameters: {}, expectedOutcome: 'Exploits tested', timeout: 300000 },
        ],
        tools: ['burp-suite', 'metasploit'],
        duration: 600000,
      },
      'failover-test': {
        setup: 'Configure failover scenario',
        steps: [
          { order: 1, action: 'Simulate primary failure', parameters: {}, expectedOutcome: 'Primary down', timeout: 30000 },
          { order: 2, action: 'Verify failover', parameters: {}, expectedOutcome: 'Failover successful', timeout: 60000 },
          { order: 3, action: 'Restore primary', parameters: {}, expectedOutcome: 'Primary restored', timeout: 60000 },
        ],
        tools: ['chaos-monkey', 'custom-scripts'],
        duration: 200000,
      },
      'recovery-test': {
        setup: 'Configure recovery test scenario',
        steps: [
          { order: 1, action: 'Create failure condition', parameters: {}, expectedOutcome: 'Failure induced', timeout: 30000 },
          { order: 2, action: 'Trigger recovery', parameters: {}, expectedOutcome: 'Recovery initiated', timeout: 10000 },
          { order: 3, action: 'Measure recovery time', parameters: {}, expectedOutcome: 'Recovery time recorded', timeout: 300000 },
        ],
        tools: ['custom-scripts'],
        duration: 400000,
      },
      'endurance-test': {
        setup: 'Configure endurance test',
        steps: [
          { order: 1, action: 'Start continuous load', parameters: { duration: '24h' }, expectedOutcome: 'Load started', timeout: 10000 },
          { order: 2, action: 'Monitor resources', parameters: {}, expectedOutcome: 'Monitoring active', timeout: 86400000 },
          { order: 3, action: 'Analyze results', parameters: {}, expectedOutcome: 'Results analyzed', timeout: 60000 },
        ],
        tools: ['k6', 'prometheus', 'grafana'],
        duration: 86500000,
      },
      'spike-test': {
        setup: 'Configure spike test scenario',
        steps: [
          { order: 1, action: 'Generate traffic spike', parameters: { users: 1000 }, expectedOutcome: 'Spike generated', timeout: 30000 },
          { order: 2, action: 'Monitor response', parameters: {}, expectedOutcome: 'Response recorded', timeout: 60000 },
          { order: 3, action: 'Verify recovery', parameters: {}, expectedOutcome: 'System recovered', timeout: 120000 },
        ],
        tools: ['k6', 'gatling'],
        duration: 250000,
      },
      'scalability-test': {
        setup: 'Configure scalability test',
        steps: [
          { order: 1, action: 'Test horizontal scaling', parameters: { instances: [1, 2, 4, 8] }, expectedOutcome: 'Scaling tested', timeout: 600000 },
          { order: 2, action: 'Measure linear scaling', parameters: {}, expectedOutcome: 'Scaling metrics recorded', timeout: 60000 },
          { order: 3, action: 'Identify bottlenecks', parameters: {}, expectedOutcome: 'Bottlenecks identified', timeout: 30000 },
        ],
        tools: ['k6', 'kubernetes'],
        duration: 700000,
      },
      'compliance-audit': {
        setup: 'Configure compliance audit',
        steps: [
          { order: 1, action: 'Gather evidence', parameters: {}, expectedOutcome: 'Evidence collected', timeout: 300000 },
          { order: 2, action: 'Verify controls', parameters: {}, expectedOutcome: 'Controls verified', timeout: 600000 },
          { order: 3, action: 'Generate report', parameters: {}, expectedOutcome: 'Audit report generated', timeout: 60000 },
        ],
        tools: ['compliance-tools', 'audit-scripts'],
        duration: 1000000,
      },
    };

    const template = testTemplates[testType] || {};

    return {
      id: `test-${nfr.id}-${testType}`,
      nfrId: nfr.id,
      name: `${testType} for ${nfr.name}`,
      description: `${testType} to verify ${nfr.description}`,
      type: testType,
      setup: template.setup || 'Configure test environment',
      steps: template.steps || [],
      expectedResults: nfr.metrics.map(m => ({
        metric: m.name,
        condition: 'lessThan',
        value: m.criticalThreshold || m.targetValue * 1.5,
        tolerance: 0.1,
      })),
      metrics: nfr.metrics,
      tools: template.tools || [],
      duration: template.duration || 300000,
    };
  }

  /**
   * Generate test code
   */
  private generateTestCode(tests: NFRTest[]): string {
    const lines: string[] = [
      '// Generated NFR Tests',
      `// Generated at: ${new Date().toISOString()}`,
      '',
    ];

    for (const test of tests) {
      lines.push(`// Test: ${test.name}`);
      lines.push(`// Type: ${test.type}`);
      lines.push(`// NFR: ${test.nfrId}`);
      lines.push('');

      if (test.type.includes('load') || test.type.includes('stress') || test.type.includes('spike')) {
        // K6 format
        lines.push(`import http from 'k6/http';`);
        lines.push(`import { check, sleep } from 'k6';`);
        lines.push('');
        lines.push('export const options = {');
        lines.push(`  vus: 100,`);
        lines.push(`  duration: '5m',`);
        lines.push('};');
        lines.push('');
        lines.push('export default function () {');
        lines.push('  const res = http.get(TARGET_URL);');
        lines.push('  check(res, {');
        for (const expected of test.expectedResults) {
          lines.push(`    '${expected.metric} < ${expected.value}': (r) => r.timings.duration < ${expected.value},`);
        }
        lines.push('  });');
        lines.push('  sleep(1);');
        lines.push('}');
      } else {
        // Generic test format
        lines.push(`describe('${test.name}', () => {`);
        for (const step of test.steps) {
          lines.push(`  it('${step.action}', async () => {`);
          lines.push(`    // ${step.expectedOutcome}`);
          lines.push('  });');
        }
        lines.push('});');
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Group tests by type
   */
  private groupTestsByType(tests: NFRTest[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    for (const test of tests) {
      grouped[test.type] = (grouped[test.type] || 0) + 1;
    }
    return grouped;
  }

  /**
   * Evaluate metric against target
   */
  private evaluateMetric(metric: NFRMetric, actual: number): boolean {
    // For metrics like response time, lower is better
    if (metric.name.includes('time') || metric.name.includes('latency')) {
      return actual <= metric.targetValue;
    }
    // For metrics like throughput, higher is better
    if (metric.name.includes('throughput') || metric.name.includes('capacity')) {
      return actual >= metric.targetValue;
    }
    // Default: actual should be at or below target
    return actual <= metric.targetValue;
  }

  /**
   * Generate metric recommendations
   */
  private generateMetricRecommendations(
    results: Array<{ metric: string; passed: boolean; variance: number }>
  ): string[] {
    const recommendations: string[] = [];

    for (const result of results) {
      if (!result.passed) {
        if (result.variance > 50) {
          recommendations.push(
            `Critical: ${result.metric} is ${result.variance.toFixed(1)}% off target - requires immediate attention`
          );
        } else {
          recommendations.push(
            `${result.metric} is ${result.variance.toFixed(1)}% off target - optimization needed`
          );
        }
      }
    }

    return recommendations;
  }

  /**
   * Generate overall recommendations
   */
  private generateOverallRecommendations(
    analysis: Array<{ passed: boolean; metricResults: any[] }>
  ): string[] {
    const recommendations: string[] = [];
    const failedCount = analysis.filter(a => !a.passed).length;

    if (failedCount > 0) {
      recommendations.push(`${failedCount} NFRs did not meet their targets`);
    }

    return recommendations;
  }

  /**
   * Assess NFR risk
   */
  private assessNFRRisk(
    nfr: NFR,
    validationResult?: NFRValidationResult
  ): {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    mitigations: string[];
  } {
    const factors: string[] = [];
    const mitigations: string[] = [];
    let riskScore = 0;

    // Priority factor
    if (nfr.priority === 'critical') {
      riskScore += 3;
      factors.push('Critical priority NFR');
    } else if (nfr.priority === 'high') {
      riskScore += 2;
      factors.push('High priority NFR');
    }

    // Status factor
    if (nfr.status === 'extracted') {
      riskScore += 2;
      factors.push('NFR not yet addressed');
      mitigations.push('Address NFR in implementation plan');
    }

    // Coverage factor
    if (validationResult && validationResult.coverage < 50) {
      riskScore += 2;
      factors.push('Low plan coverage');
      mitigations.push('Improve plan coverage for this NFR');
    }

    // Test factor
    if (nfr.testIds.length === 0) {
      riskScore += 1;
      factors.push('No tests defined');
      mitigations.push('Create tests for this NFR');
    }

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (riskScore >= 6) riskLevel = 'critical';
    else if (riskScore >= 4) riskLevel = 'high';
    else if (riskScore >= 2) riskLevel = 'medium';

    return { riskLevel, factors, mitigations };
  }

  /**
   * Generate plan recommendations
   */
  private generatePlanRecommendations(gaps: NFRGap[]): string[] {
    const recommendations: string[] = [];

    const criticalGaps = gaps.filter(g => g.severity === 'critical');
    if (criticalGaps.length > 0) {
      recommendations.push(`Address ${criticalGaps.length} critical NFR gaps immediately`);
    }

    const categorizedGaps = new Map<string, number>();
    for (const gap of gaps) {
      const nfr = this.nfrs.get(gap.nfrId);
      if (nfr) {
        categorizedGaps.set(nfr.category, (categorizedGaps.get(nfr.category) || 0) + 1);
      }
    }

    for (const [category, count] of categorizedGaps) {
      if (count > 1) {
        recommendations.push(`Review ${category} section - ${count} gaps identified`);
      }
    }

    return recommendations;
  }

  /**
   * Generate mitigation plan
   */
  private generateMitigationPlan(
    risks: Array<{ nfrName: string; riskLevel: string; mitigations: string[] }>
  ): string[] {
    const plan: string[] = [];

    const criticalRisks = risks.filter(r => r.riskLevel === 'critical');
    if (criticalRisks.length > 0) {
      plan.push('IMMEDIATE ACTIONS:');
      for (const risk of criticalRisks) {
        plan.push(`- ${risk.nfrName}: ${risk.mitigations.join(', ')}`);
      }
    }

    const highRisks = risks.filter(r => r.riskLevel === 'high');
    if (highRisks.length > 0) {
      plan.push('SHORT-TERM ACTIONS:');
      for (const risk of highRisks) {
        plan.push(`- ${risk.nfrName}: ${risk.mitigations.join(', ')}`);
      }
    }

    return plan;
  }

  /**
   * Generate analysis recommendations
   */
  private generateAnalysisRecommendations(nfrs: NFR[], gaps: NFRGap[]): string[] {
    const recommendations: string[] = [];

    if (gaps.length > 0) {
      recommendations.push(`Address ${gaps.length} NFR gaps`);
    }

    const untestedNFRs = nfrs.filter(n => n.testIds.length === 0);
    if (untestedNFRs.length > 0) {
      recommendations.push(`Create tests for ${untestedNFRs.length} untested NFRs`);
    }

    const criticalNFRs = nfrs.filter(n => n.priority === 'critical' && n.status === 'extracted');
    if (criticalNFRs.length > 0) {
      recommendations.push(`Prioritize ${criticalNFRs.length} critical NFRs`);
    }

    return recommendations;
  }

  /**
   * Initialize NFR patterns
   */
  private initializeNFRPatterns(): void {
    // Initialization logic for NFR extraction patterns
    this.logger.debug('NFR patterns initialized');
  }

  /**
   * Get agent status with NFR-specific information
   */
  override getAgentStatus(): any {
    const nfrs = Array.from(this.nfrs.values());

    return {
      ...super.getAgentStatus(),
      specialization: 'NFR Specialist',
      totalNFRs: nfrs.length,
      addressedNFRs: nfrs.filter(n => n.status !== 'extracted').length,
      testsGenerated: this.tests.size,
      capabilities: [
        'extract-nfrs',
        'validate-plan',
        'create-tests',
      ],
    };
  }
}

/**
 * Factory function to create an NFR Specialist Agent
 */
export const createNFRSpecialistAgent = (
  id: string,
  config: Partial<AgentConfig>,
  environment: Partial<AgentEnvironment>,
  logger: ILogger,
  eventBus: IEventBus,
  memory: DistributedMemorySystem,
): NFRSpecialistAgent => {
  const defaultConfig: AgentConfig = {
    autonomyLevel: 0.8,
    learningEnabled: true,
    adaptationEnabled: true,
    maxTasksPerHour: 30,
    maxConcurrentTasks: 4,
    timeoutThreshold: 900000,
    reportingInterval: 30000,
    heartbeatInterval: 10000,
    permissions: ['file-read', 'file-write', 'memory-access', 'terminal-execute'],
    trustedAgents: [],
    expertise: {
      'performance-engineering': 0.95,
      'security-assessment': 0.92,
    },
    preferences: {
      strictCompliance: true,
      comprehensiveTests: true,
    },
  };

  const defaultEnv: AgentEnvironment = {
    runtime: 'node',
    version: '20.0.0',
    workingDirectory: './agents/nfr-specialist',
    tempDirectory: './tmp/nfr-specialist',
    logDirectory: './logs/nfr-specialist',
    apiEndpoints: {},
    credentials: {},
    availableTools: ['extract-nfrs', 'validate-plan', 'create-tests'],
    toolConfigs: {},
  };

  return new NFRSpecialistAgent(
    id,
    { ...defaultConfig, ...config } as AgentConfig,
    { ...defaultEnv, ...environment } as AgentEnvironment,
    logger,
    eventBus,
    memory,
  );
};
