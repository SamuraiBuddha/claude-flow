# Specify-Flow: Claude-Flow + Spec-Kit Integration

## Overview

**Specify-Flow** is the bidirectional integration between Claude-Flow's AI orchestration platform and Spec-Kit's Specification-Driven Development (SDD) framework. This integration enables spec-driven workflows to leverage Claude-Flow's swarm intelligence for execution, while allowing Claude-Flow to understand and track SDD artifacts in its memory system.

## Architecture

```
                    SPECIFY-FLOW INTEGRATION

    ┌──────────────────────────────────────────────────────┐
    │                    Spec-Kit CLI                       │
    │         (specify flow <command>)                     │
    ├──────────────────────────────────────────────────────┤
    │              ClaudeFlowAdapter                       │
    │    Maps SDD commands to Claude-Flow strategies       │
    └────────────────────────┬─────────────────────────────┘
                             │
                             ▼
    ┌──────────────────────────────────────────────────────┐
    │                 Claude-Flow CLI                       │
    │         (swarm / hive-mind execution)                │
    ├──────────────────────────────────────────────────────┤
    │          SpecKit Integration Module                  │
    │    - SpecKitMemoryBridge (artifact storage)          │
    │    - SpecVersionTracker (version management)         │
    │    - Constitutional Compliance                       │
    │    - Workflow Engine & Process Gates                 │
    └──────────────────────────────────────────────────────┘
```

## Command Mapping

The Specify-Flow integration maps SDD workflow stages to Claude-Flow execution strategies:

| SDD Command | Claude-Flow Strategy | Execution Mode | Description |
|-------------|---------------------|----------------|-------------|
| `/speckit.specify` | `researcher` | Swarm | Requirements analysis and spec generation |
| `/speckit.plan` | `architect` | Swarm | Technical architecture and implementation planning |
| `/speckit.tasks` | `development` | Swarm | Task breakdown with dependency analysis |
| `/speckit.implement` | `hive-mind` | Parallel Hive | Coordinated parallel implementation |

## Usage

### From Spec-Kit (Initiating Claude-Flow Swarms)

```bash
# Check if Claude-Flow is available
specify flow status

# Generate specification using researcher swarm
specify flow specify "Build a REST API for user management"

# Generate implementation plan using architect swarm
specify flow plan

# Generate task breakdown using development swarm
specify flow tasks

# Execute implementation using hive-mind parallel execution
specify flow implement --workers 4
```

### From Claude-Flow (Working with SDD Artifacts)

```bash
# Initialize SpecKit integration
npx claude-flow@alpha speckit init

# Parse and store a specification
npx claude-flow@alpha speckit parse ./specs/001-feature/spec.md

# Track version changes
npx claude-flow@alpha speckit versions --spec-id spec_001_feature

# Check constitutional compliance
npx claude-flow@alpha speckit compliance --check

# View spec status dashboard
npx claude-flow@alpha speckit dashboard
```

## Integration Components

### 1. ClaudeFlowAdapter (Spec-Kit Side)

Located at: `spec-kit/src/specify_cli/claude_flow_adapter.py`

**Key Classes:**
- `SwarmStrategy`: Enum mapping SDD phases to swarm strategies
- `ExecutionMode`: Swarm, Hive, or Sequential execution
- `SDDContext`: Context data passed to Claude-Flow (feature description, file paths, constitution)
- `SwarmConfig`: Complete configuration for a swarm execution
- `ClaudeFlowAdapter`: Main adapter class with mapping methods

**Adapter Methods:**
```python
adapter = ClaudeFlowAdapter(project_root)

# Check availability
available, message = adapter.check_availability()

# Map SDD commands to swarm configurations
config = adapter.map_specify(feature_description)  # researcher
config = adapter.map_plan()                         # architect
config = adapter.map_tasks()                        # development
config = adapter.map_implement()                    # hive-mind

# Execute swarm
success, output = adapter.execute_swarm(config, dry_run=False)

# Process output back to SDD workflow
result = adapter.handle_swarm_output(output, config)
```

### 2. SpecKit Integration Module (Claude-Flow Side)

Located at: `claude-flow/src/integrations/speckit/`

**Core Components:**

| Component | Purpose |
|-----------|---------|
| `SpecKitMemoryBridge` | Parses markdown artifacts, stores in SQLite |
| `SpecVersionTracker` | Tracks spec versions, detects cascade changes |
| `StatusDashboard` | Visual status of all specs, plans, tasks |
| `AuditTrail` | Complete history of all spec-related operations |
| `ProcessGates` | Constitutional compliance gates |
| `WorkflowEngine` | Multi-phase workflow orchestration |

**Usage in Code:**
```typescript
import { createSpecKitIntegration, createFullIntegration } from './integrations/speckit';

// Basic integration
const integration = await createSpecKitIntegration({
  dbPath: './.speckit/speckit.db',
  specsDirectory: './specs',
}, logger);

// When spec is generated
const { specId } = await integration.bridge.onSpecGenerated(
  './specs/001-feature/spec.md',
  'researcher-agent'
);

// When plan is generated
const { planId } = await integration.bridge.onPlanGenerated(
  './specs/001-feature/plan.md',
  specId,
  'architect-agent'
);

// Track version changes
const cascadeResult = await integration.versionTracker.detectCascade(specId);

// Cleanup
await integration.shutdown();
```

## Constitutional Compliance

The integration respects Spec-Kit's constitutional principles:

| Gate | Description |
|------|-------------|
| `simplicity_gate` | Solutions must be straightforward |
| `anti_abstraction_gate` | Avoid premature abstractions |
| `integration_gate` | New code integrates with existing |
| `library_first` | Prefer existing libraries |
| `cli_interface` | CLI-first design |
| `test_first` | TDD approach required |

Constitutional compliance is checked at each phase transition and stored in the audit trail.

## Workflow

### Complete SDD Workflow with Claude-Flow

```
1. User runs: specify flow specify "Feature description"
   ├─ ClaudeFlowAdapter maps to researcher strategy
   ├─ Claude-Flow spawns researcher swarm agents
   ├─ Agents analyze requirements, research patterns
   ├─ Output: spec.md
   └─ SpecKitMemoryBridge stores spec in SQLite

2. User runs: specify flow plan
   ├─ ClaudeFlowAdapter maps to architect strategy
   ├─ Claude-Flow spawns architect swarm agents
   ├─ Agents design architecture, data models, contracts
   ├─ Output: plan.md, data-model.md, contracts/
   └─ SpecKitMemoryBridge stores plan with spec lineage

3. User runs: specify flow tasks
   ├─ ClaudeFlowAdapter maps to development strategy
   ├─ Claude-Flow spawns development swarm agents
   ├─ Agents create ordered, parallelizable task list
   ├─ Output: tasks.md
   └─ SpecKitMemoryBridge stores tasks with plan lineage

4. User runs: specify flow implement --workers 4
   ├─ ClaudeFlowAdapter maps to hive-mind mode
   ├─ Claude-Flow spawns Queen + Worker agents
   ├─ Parallel execution respecting dependencies
   ├─ Progress tracked, tasks marked complete
   └─ AuditTrail records all implementation actions
```

## Configuration

### Spec-Kit Configuration

The adapter auto-detects Claude-Flow via:
1. Direct `claude-flow` command in PATH
2. Via `npx @claude-flow/cli@latest`

### Claude-Flow Configuration

Add to `.claude-flow/config.yaml`:
```yaml
integrations:
  speckit:
    enabled: true
    dbPath: ./.speckit/speckit.db
    specsDirectory: ./specs
    autoTrackLineage: true
    constitutionalEnforcement: strict
```

## Benefits

1. **Intelligent Orchestration**: Swarm agents bring specialized expertise to each SDD phase
2. **Memory Persistence**: All artifacts stored in SQLite for cross-session learning
3. **Version Tracking**: Automatic cascade detection when specs change
4. **Constitutional Enforcement**: Automated compliance checking at phase gates
5. **Parallel Execution**: Hive-mind enables concurrent task implementation
6. **Audit Trail**: Complete history of every spec-related operation

## See Also

- [Claude-Flow README](./README.md) - Full Claude-Flow documentation
- [Spec-Kit Repository](https://github.com/github/spec-kit) - SDD framework
- [SDD Methodology](https://github.com/github/spec-kit/blob/main/spec-driven.md) - Complete SDD guide
