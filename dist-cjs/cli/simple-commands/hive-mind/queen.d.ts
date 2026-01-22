/**
 * QueenCoordinator class
 */
export class QueenCoordinator extends EventEmitter<[never]> {
    constructor(config?: {});
    config: any;
    state: {
        status: string;
        decisionsCount: number;
        strategiesExecuted: number;
        learningData: Map<any, any>;
        currentStrategy: null;
        taskQueue: never[];
        workerAssignments: Map<any, any>;
    };
    strategies: {
        divide_and_conquer: (analysis: any, workers: any) => Promise<{
            strategy: string;
            phases: {
                name: string;
                tasks: string[];
                workers: any;
                parallel: boolean;
            }[];
            estimatedDuration: number;
            parallelism: string;
        }>;
        parallel_execution: (analysis: any, workers: any) => Promise<{
            strategy: string;
            phases: {
                name: string;
                tasks: string[];
                workers: any;
                parallel: boolean;
                workerAssignment: {};
            }[];
            estimatedDuration: number;
            parallelism: string;
        }>;
        sequential_refinement: (analysis: any, workers: any) => Promise<{
            strategy: string;
            phases: {
                name: string;
                tasks: string[];
                workers: any;
                parallel: boolean;
                requiresConsensus: boolean;
            }[];
            estimatedDuration: number;
            parallelism: string;
            iterative: boolean;
        }>;
        consensus_driven: (analysis: any, workers: any) => Promise<{
            strategy: string;
            phases: any[];
            estimatedDuration: number;
            parallelism: string;
            consensusRequired: boolean;
        }>;
        adaptive_learning: (analysis: any, workers: any) => Promise<{
            strategy: string;
            phases: ({
                name: string;
                tasks: string[];
                workers: any;
                parallel: boolean;
                learning: boolean;
                applyLearning?: undefined;
            } | {
                name: string;
                tasks: string[];
                workers: any;
                parallel: boolean;
                applyLearning: boolean;
                learning?: undefined;
            })[];
            estimatedDuration: number;
            parallelism: string;
            learningEnabled: boolean;
        }>;
    };
    /**
     * Initialize queen coordinator
     */
    _initialize(): void;
    /**
     * Analyze objective and create strategic plan
     */
    analyzeObjective(objective: any): Promise<{
        objective: any;
        complexity: string;
        requiredCapabilities: any[];
        estimatedTasks: number;
        recommendedStrategy: string;
        resourceRequirements: {
            minWorkers: number;
            optimalWorkers: number;
            estimatedTime: number;
            memoryRequirement: string;
        };
    }>;
    /**
     * Assess complexity of objective
     */
    _assessComplexity(objective: any): "low" | "medium" | "high" | "very_high";
    /**
     * Count complexity keywords
     */
    _countComplexityKeywords(text: any): number;
    /**
     * Identify components in objective
     */
    _identifyComponents(objective: any): any[];
    /**
     * Identify required capabilities
     */
    _identifyRequiredCapabilities(objective: any): any[];
    /**
     * Estimate number of tasks
     */
    _estimateTaskCount(objective: any): number;
    /**
     * Select optimal strategy
     */
    _selectStrategy(objective: any): "parallel_execution" | "divide_and_conquer" | "sequential_refinement" | "consensus_driven" | "adaptive_learning";
    /**
     * Estimate resource requirements
     */
    _estimateResources(objective: any): {
        minWorkers: number;
        optimalWorkers: number;
        estimatedTime: number;
        memoryRequirement: string;
    };
    /**
     * Create execution plan
     */
    createExecutionPlan(analysis: any, workers: any): Promise<any>;
    /**
     * Divide and conquer strategy
     */
    _divideAndConquerStrategy(analysis: any, workers: any): Promise<{
        strategy: string;
        phases: {
            name: string;
            tasks: string[];
            workers: any;
            parallel: boolean;
        }[];
        estimatedDuration: number;
        parallelism: string;
    }>;
    /**
     * Parallel execution strategy
     */
    _parallelExecutionStrategy(analysis: any, workers: any): Promise<{
        strategy: string;
        phases: {
            name: string;
            tasks: string[];
            workers: any;
            parallel: boolean;
            workerAssignment: {};
        }[];
        estimatedDuration: number;
        parallelism: string;
    }>;
    /**
     * Sequential refinement strategy
     */
    _sequentialRefinementStrategy(analysis: any, workers: any): Promise<{
        strategy: string;
        phases: {
            name: string;
            tasks: string[];
            workers: any;
            parallel: boolean;
            requiresConsensus: boolean;
        }[];
        estimatedDuration: number;
        parallelism: string;
        iterative: boolean;
    }>;
    /**
     * Consensus-driven strategy
     */
    _consensusDrivenStrategy(analysis: any, workers: any): Promise<{
        strategy: string;
        phases: any[];
        estimatedDuration: number;
        parallelism: string;
        consensusRequired: boolean;
    }>;
    /**
     * Adaptive learning strategy
     */
    _adaptiveLearningStrategy(analysis: any, workers: any): Promise<{
        strategy: string;
        phases: ({
            name: string;
            tasks: string[];
            workers: any;
            parallel: boolean;
            learning: boolean;
            applyLearning?: undefined;
        } | {
            name: string;
            tasks: string[];
            workers: any;
            parallel: boolean;
            applyLearning: boolean;
            learning?: undefined;
        })[];
        estimatedDuration: number;
        parallelism: string;
        learningEnabled: boolean;
    }>;
    /**
     * Generate component-specific tasks
     */
    _generateComponentTasks(component: any): any;
    /**
     * Generate all tasks based on analysis
     */
    _generateAllTasks(analysis: any): string[];
    /**
     * Group workers by type
     */
    _groupWorkersByType(workers: any): {};
    /**
     * Optimize worker assignment for tasks
     */
    _optimizeWorkerAssignment(tasks: any, workerGroups: any): {};
    /**
     * Find best worker type for task
     */
    _findBestWorkerType(task: any): "researcher" | "coder" | "architect" | "tester" | "optimizer" | "documenter";
    /**
     * Identify decision points in objective
     */
    _identifyDecisionPoints(analysis: any): string[];
    /**
     * Make strategic decision
     */
    makeDecision(topic: any, options: any, workerVotes?: {}): Promise<{
        topic: any;
        options: any;
        workerVotes: {};
        queenVote: any;
        timestamp: number;
    }>;
    /**
     * Calculate queen's vote
     */
    _calculateQueenVote(topic: any, options: any, workerVotes: any): any;
    /**
     * Strategic voting logic
     */
    _strategicVote(topic: any, options: any): any;
    /**
     * Tactical voting logic
     */
    _tacticalVote(topic: any, options: any, workerVotes: any): any;
    /**
     * Adaptive voting logic
     */
    _adaptiveVote(topic: any, options: any, workerVotes: any): any;
    /**
     * Calculate final decision with weighted votes
     */
    _calculateFinalDecision(decision: any): string;
    /**
     * Learn from decision outcomes
     */
    _learnFromDecision(decision: any): void;
    /**
     * Update decision outcome
     */
    updateDecisionOutcome(decisionId: any, success: any, metrics?: {}): void;
    /**
     * Get queen status
     */
    getStatus(): {
        type: any;
        name: any;
        status: string;
        decisionsCount: number;
        strategiesExecuted: number;
        currentStrategy: null;
        learningDataSize: number;
    };
}
import EventEmitter from 'events';
//# sourceMappingURL=queen.d.ts.map