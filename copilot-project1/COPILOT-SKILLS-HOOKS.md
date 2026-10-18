# Copilot CLI Skills & Hooks Setup

## Directory Structure
```
.copilot/
├── mcp-config.json          # MCP server configuration
├── hooks/
│   ├── pre-tool.sh          # Runs BEFORE tool execution (can block)
│   ├── post-tool.sh         # Runs AFTER tool execution
│   └── audit.log            # Tool execution audit trail
└── skills/
    ├── github-issue-creator/
    │   ├── skill.json       # Skill manifest
    │   └── index.js         # Skill entry point
    └── code-quality/
        ├── skill.json
        └── index.js
```

## Hooks

### Pre-tool Hook (`.copilot/hooks/pre-tool.sh`)
Runs **before** every tool call. Exit non-zero to block the tool.

**Use cases:**
- Block dangerous commands (`rm -rf`, `git push --force`)
- Prevent writes to sensitive files (`.env`, SSH keys, `.git/`)
- Audit logging

### Post-tool Hook (`.copilot/hooks/post-tool.sh`)
Runs **after** every tool call. Cannot block, but can:
- Auto-format code (Prettier)
- Run tests after dependency changes
- Send notifications
- Update audit log

## Skills

Skills are reusable command bundles that Copilot can invoke.

### Creating a Skill
1. Create directory: `.copilot/skills/<skill-name>/`
2. Add `skill.json` manifest with commands and args
3. Add `index.js` (or any executable) as entry point
4. Make executable: `chmod +x index.js`

### Skill Manifest (`skill.json`)
```json
{
  "name": "my-skill",
  "description": "What this skill does",
  "version": "1.0.0",
  "entry": "index.js",
  "commands": [
    {
      "name": "command-name",
      "description": "Human-readable description",
      "args": [
        { "name": "arg", "type": "string", "description": "...", "required": true }
      ]
    }
  ]
}
```

### Using Skills
In Copilot CLI session:
```
/skill github-issue-creator scan-todos --path src --dry-run
/skill code-quality check --fix
```

Or from command line:
```bash
copilot --skill github-issue-creator -p "scan for TODOs and create issues"
```

## MCP Servers

Configure in `.copilot/mcp-config.json` or via `/mcp add` in CLI.

### Example Servers
- **github** — GitHub API (issues, PRs, repos)
- **filesystem** — Local file operations
- **sqlite** — Local database
- **postgres** — PostgreSQL
- **redis** — Redis
- **custom** — Your own MCP server

### Using MCP Tools
In CLI session, tools appear as `mcp:<server>.<tool>`:
```
Use mcp:github to list open issues
Use mcp:filesystem to read config files
```

## Quick Start Commands

```bash
# Install skill dependencies
cd .copilot/skills/github-issue-creator && npm install commander glob @octokit/rest
cd .copilot/skills/code-quality && npm install commander execa

# Make hooks executable
chmod +x .copilot/hooks/*.sh

# Test hooks
.copilot/hooks/pre-tool.sh shell "rm -rf /"  # Should block
.copilot/hooks/pre-tool.sh shell "ls -la"    # Should allow

# Test skills
node .copilot/skills/github-issue-creator/index.js scan-todos --dry-run
node .copilot/skills/code-quality/index.js check
```

## Environment Variables
- `GH_TOKEN` / `GITHUB_TOKEN` — GitHub API access
- `GITHUB_REPOSITORY` — owner/repo (auto-set in GitHub Actions)
- `COPILOT_SKILL_ARGS` — Passed to skill entry point