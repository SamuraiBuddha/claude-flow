"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDirectoryStructure = createDirectoryStructure;
// init/directory-structure.ts - Directory structure creation
async function createDirectoryStructure() {
    const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
    const path = await Promise.resolve().then(() => __importStar(require('path')));
    // Define directory structure
    const directories = [
        '.claude',
        '.claude/commands',
        '.claude/commands/swarm',
        '.claude/commands/sparc',
        '.claude/logs',
        '.claude/memory',
        '.claude/configs',
        'memory',
        'memory/agents',
        'memory/sessions',
        'coordination',
        'coordination/memory_bank',
        'coordination/subtasks',
        'coordination/orchestration',
        'reports',
    ];
    // Create directories
    for (const dir of directories) {
        try {
            await fs.mkdir(dir, { recursive: true });
            console.log(`  ✅ Created ${dir}/ directory`);
        }
        catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }
    // Create README files for key directories
    const readmeFiles = {
        'memory/agents/README.md': createAgentsReadme(),
        'memory/sessions/README.md': createSessionsReadme(),
        'coordination/README.md': createCoordinationReadme(),
        'reports/README.md': createReportsReadme(),
    };
    for (const [filePath, content] of Object.entries(readmeFiles)) {
        await fs.writeFile(filePath, content);
        console.log(`  ✅ Created ${filePath}`);
    }
    // Create initial persistence database
    const initialData = {
        agents: [],
        tasks: [],
        swarms: [],
        lastUpdated: Date.now(),
        version: '1.0.71',
    };
    await fs.writeFile('memory/claude-flow-data.json', JSON.stringify(initialData, null, 2));
    console.log('  ✅ Created memory/claude-flow-data.json (persistence database)');
}
function createAgentsReadme() {
    return `# Agents Directory

This directory stores persistent information about AI agents created and managed by Claude-Flow.

## Structure
- Each agent gets its own JSON file named by agent ID
- Agent files contain configuration, state, and memory
- Shared agent data is stored in agent-registry.json

## Usage
Agents are automatically managed by the Claude-Flow orchestration system. You can:
- View agent status with \`claude-flow agent list\`
- Create new agents with \`claude-flow agent spawn <type>\`
- Configure agents with \`claude-flow agent configure <id>\`

## Files
- \`agent-registry.json\`: Central agent registry
- \`agent-<id>.json\`: Individual agent data files
- \`templates/\`: Agent configuration templates
`;
}
function createSessionsReadme() {
    return `# Sessions Directory

This directory stores information about Claude-Flow orchestration sessions.

## Structure
- Each session gets its own subdirectory
- Session data includes tasks, coordination state, and results
- Session logs are automatically rotated

## Usage
Sessions are managed automatically during orchestration:
- Start sessions with \`claude-flow start\`
- Monitor sessions with \`claude-flow status\`
- Review session history with \`claude-flow session list\`

## Files
- \`session-<id>/\`: Individual session directories
- \`active-sessions.json\`: Currently active sessions
- \`session-history.json\`: Historical session data
`;
}
function createCoordinationReadme() {
    return `# Coordination Directory

This directory manages task coordination and orchestration data.

## Subdirectories
- \`memory_bank/\`: Shared memory for agent coordination
- \`subtasks/\`: Task breakdown and assignment data
- \`orchestration/\`: High-level orchestration patterns

## Usage
Coordination data is used for:
- Multi-agent task distribution
- Progress tracking and monitoring
- Resource allocation and balancing
- Error recovery and failover

Access coordination data through the Claude-Flow API or CLI commands.
`;
}
function createReportsReadme() {
    return `# Reports Directory

This directory stores output reports from swarm operations and orchestration tasks.

## Structure
- Swarm reports are stored by operation ID
- Reports include execution logs, results, and metrics
- Multiple output formats supported (JSON, SQLite, CSV, HTML)

## Usage
Reports are generated automatically by swarm operations:
- View recent reports with \`claude-flow swarm list\`
- Check specific reports with \`claude-flow swarm status <id>\`
- Export reports in different formats using \`--output\` flags

## File Types
- \`*.json\`: Structured operation data
- \`*.sqlite\`: Database format for complex queries
- \`*.csv\`: Tabular data for analysis
- \`*.html\`: Human-readable reports
`;
}
//# sourceMappingURL=directory-structure.js.map