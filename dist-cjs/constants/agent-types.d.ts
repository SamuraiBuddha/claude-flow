/**
 * Central source of truth for agent types
 * This file ensures consistency across TypeScript types and runtime validation
 */
export declare const AGENT_TYPES: {
    readonly COORDINATOR: "coordinator";
    readonly RESEARCHER: "researcher";
    readonly CODER: "coder";
    readonly ANALYST: "analyst";
    readonly ARCHITECT: "architect";
    readonly TESTER: "tester";
    readonly REVIEWER: "reviewer";
    readonly OPTIMIZER: "optimizer";
    readonly DOCUMENTER: "documenter";
    readonly MONITOR: "monitor";
    readonly SPECIALIST: "specialist";
};
export type AgentType = (typeof AGENT_TYPES)[keyof typeof AGENT_TYPES];
export declare const VALID_AGENT_TYPES: ("coordinator" | "researcher" | "analyst" | "coder" | "architect" | "tester" | "reviewer" | "optimizer" | "documenter" | "monitor" | "specialist")[];
export declare const AGENT_TYPE_SCHEMA: {
    type: string;
    enum: ("coordinator" | "researcher" | "analyst" | "coder" | "architect" | "tester" | "reviewer" | "optimizer" | "documenter" | "monitor" | "specialist")[];
    description: string;
};
export declare function isValidAgentType(type: string): type is AgentType;
export declare const SWARM_STRATEGIES: {
    readonly AUTO: "auto";
    readonly RESEARCH: "research";
    readonly DEVELOPMENT: "development";
    readonly ANALYSIS: "analysis";
    readonly TESTING: "testing";
    readonly OPTIMIZATION: "optimization";
    readonly MAINTENANCE: "maintenance";
    readonly CUSTOM: "custom";
};
export type SwarmStrategy = (typeof SWARM_STRATEGIES)[keyof typeof SWARM_STRATEGIES];
export declare const VALID_SWARM_STRATEGIES: ("custom" | "auto" | "research" | "analysis" | "testing" | "maintenance" | "optimization" | "development")[];
export declare const ORCHESTRATION_STRATEGIES: {
    readonly PARALLEL: "parallel";
    readonly SEQUENTIAL: "sequential";
    readonly ADAPTIVE: "adaptive";
    readonly BALANCED: "balanced";
};
export type OrchestrationStrategy = (typeof ORCHESTRATION_STRATEGIES)[keyof typeof ORCHESTRATION_STRATEGIES];
export declare const VALID_ORCHESTRATION_STRATEGIES: ("adaptive" | "balanced" | "parallel" | "sequential")[];
//# sourceMappingURL=agent-types.d.ts.map