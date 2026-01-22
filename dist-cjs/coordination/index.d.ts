/**
 * Coordination system exports
 */
export { CoordinationManager, type ICoordinationManager } from './manager.js';
export { TaskScheduler } from './scheduler.js';
export { ResourceManager } from './resources.js';
export { MessageRouter } from './messaging.js';
export { AdvancedTaskScheduler, type SchedulingStrategy, type SchedulingContext, CapabilitySchedulingStrategy, RoundRobinSchedulingStrategy, LeastLoadedSchedulingStrategy, AffinitySchedulingStrategy, } from './advanced-scheduler.js';
export { WorkStealingCoordinator, type WorkStealingConfig, type AgentWorkload, } from './work-stealing.js';
export { DependencyGraph, type DependencyNode, type DependencyPath } from './dependency-graph.js';
export { CircuitBreaker, CircuitBreakerManager, CircuitState, type CircuitBreakerConfig, type CircuitBreakerMetrics, } from './circuit-breaker.js';
export { ConflictResolver, PriorityResolutionStrategy, TimestampResolutionStrategy, VotingResolutionStrategy, OptimisticLockManager, type ResourceConflict, type TaskConflict, type ConflictResolution, type ConflictResolutionStrategy, } from './conflict-resolution.js';
export { CoordinationMetricsCollector, type CoordinationMetrics, type MetricsSample, } from './metrics.js';
//# sourceMappingURL=index.d.ts.map