# Antigravity (`agy`) Starter Kit

A starter template and reference project demonstrating how to configure **Google Antigravity** (and the `agy` CLI). This repository showcases all core Antigravity customization patterns: always-on project memory, directory-scoped rules, conditional rules, workflow skills, custom subagents, lifecycle hooks, and MCP servers.

---

## 📂 Repository Layout

```text
.
├── AGENTS.md                    # Always-on project memory (injected every turn)
├── src/billing/
│   ├── AGENTS.md                # Directory-scoped rules (loaded when working in src/billing/)
│   └── index.ts                 # Sample TypeScript module demonstrating domain rules
├── .agents/
│   ├── rules/                   # Flat directory of modular rules (*.md with YAML frontmatter)
│   │   ├── migrations.md        # trigger: model_decision (on-demand by agent)
│   │   └── coding-style.md      # trigger: glob (triggers on *.ts, *.js files)
│   ├── skills/
│   │   └── deploy-staging/
│   │       └── SKILL.md         # Custom workflow (auto-mapped to /deploy-staging)
│   ├── agents/
│   │   └── code-auditor.md      # Custom read-only security auditor subagent
│   ├── hooks.json               # PreToolUse / PostToolUse lifecycle hook handlers
│   ├── mcp_config.json          # MCP tool integrations (stdio & streamable HTTP)
│   └── rules.json               # Optional: inherit/share rules across repos
└── scripts/
    ├── safety-check.sh          # Hook script: blocks dangerous commands (rm -rf, DROP TABLE)
    ├── post-tool-check.sh       # Hook script: post-execution handler
    ├── preflight.sh             # Skill helper: pre-deployment verifications
    ├── deploy.sh                # Skill helper: staging deploy runner
    └── smoke.sh                 # Skill helper: automated smoke tests
```

---

## 🧠 Core Antigravity Concepts

### 1. Always-on Project Memory (`AGENTS.md`)
- **File:** [AGENTS.md](file:///Users/ibrezmm/Documents/Projects/claude-test/first-start/agy-project/AGENTS.md)
- **Role:** High-priority, always-active instructions injected into the agent's context on every turn.
- **Key Rules:**
  - Needs **no YAML frontmatter**.
  - Keep it concise (budgeted under 20,000 tokens across all active rules).
  - Use `@[label](path)` to automatically inline external files.
  - Use `@path` to provide clean pointer references.

### 2. Directory-Scoped Rules (`src/billing/AGENTS.md`)
- **File:** [src/billing/AGENTS.md](file:///Users/ibrezmm/Documents/Projects/claude-test/first-start/agy-project/src/billing/AGENTS.md)
- **Role:** Hierarchical rules that activate only when the agent inspects, modifies, or creates files within that specific directory tree.
- **Example Invariant:** All currency amounts in `src/billing/` must be integer cents (never floats).

### 3. Conditional Rules (`.agents/rules/*.md`)
Rule files in `.agents/rules/` must be flat (no nested subfolders) and require a YAML frontmatter block.

| Rule File | Trigger Type | How It Works |
| :--- | :--- | :--- |
| [migrations.md](file:///Users/ibrezmm/Documents/Projects/claude-test/first-start/agy-project/.agents/rules/migrations.md) | `trigger: model_decision` | The model reads the description upfront and only pulls in the full instructions when writing SQL or database schema changes. |
| [coding-style.md](file:///Users/ibrezmm/Documents/Projects/claude-test/first-start/agy-project/.agents/rules/coding-style.md) | `trigger: glob` | Automatically loads whenever files matching `*.ts, *.tsx, *.js, *.jsx` are read or modified. |

> [!WARNING]
> Frontmatter triggers must be lowercase (`always_on`, `model_decision`, `glob`, `manual`). CamelCase names like `alwaysOn` or invalid frontmatter will cause the rule to be **silently discarded**.

### 4. Custom Skills & Slash Commands (`.agents/skills/`)
- **File:** [deploy-staging/SKILL.md](file:///Users/ibrezmm/Documents/Projects/claude-test/first-start/agy-project/.agents/skills/deploy-staging/SKILL.md)
- **Role:** Multi-step runbooks for repetitive workflows.
- **Automatic Slash Command:** In the Antigravity CLI, every skill folder automatically becomes a slash command. For example, `skills/deploy-staging/` becomes `/deploy-staging`.
- **Usage:**
  - Type `/skills` in the CLI to browse active skills.
  - Type `/deploy-staging` to run the deployment workflow directly.

### 5. Custom Subagents (`.agents/agents/`)
- **File:** [code-auditor.md](file:///Users/ibrezmm/Documents/Projects/claude-test/first-start/agy-project/.agents/agents/code-auditor.md)
- **Role:** Spawns specialized background agents with isolated context and restricted toolsets.
- **Example:** The `code-auditor` subagent is strictly sandboxed with read-only tools (`view_file`, `grep_search`, `run_command`) to audit code for security issues and vulnerabilities without altering files.
- **Inspect:** Run `/agents` in the CLI to see active subagents.

### 6. Lifecycle Hooks (`.agents/hooks.json`)
- **File:** [.agents/hooks.json](file:///Users/ibrezmm/Documents/Projects/claude-test/first-start/agy-project/.agents/hooks.json)
- **Contract:** Hook scripts receive context as a JSON object on **stdin** and output a JSON decision on **stdout** (using camelCase keys).
- **Safety Gate Example:** [scripts/safety-check.sh](file:///Users/ibrezmm/Documents/Projects/claude-test/first-start/agy-project/scripts/safety-check.sh) intercepts `PreToolUse` for `run_command` and blocks destructive commands (`rm -rf /`, `DROP TABLE`, `git push --force`):
  ```json
  {
    "decision": "deny",
    "reason": "Destructive operations are blocked by safety-gate hook."
  }
  ```

### 7. MCP Servers (`.agents/mcp_config.json`)
- **File:** [.agents/mcp_config.json](file:///Users/ibrezmm/Documents/Projects/claude-test/first-start/agy-project/.agents/mcp_config.json)
- **Role:** Exposes Model Context Protocol (MCP) servers and tools to Antigravity.
- **Supported Transports:**
  - **Stdio (Local):** Executes a local binary/script (`"command"`, `"args"`, `"env"`).
  - **Streamable HTTP (Remote):** Connects to a remote endpoint (`"serverUrl"`).
- **Inspect:** Run `/mcp` in the CLI to view connection status, tool lists, and reload servers.

### 8. Rules Inheritance (`.agents/rules.json`)
- **File:** [.agents/rules.json](file:///Users/ibrezmm/Documents/Projects/claude-test/first-start/agy-project/.agents/rules.json)
- **Role:** Allows sharing and inheriting rule sets across team repositories or from global user configurations (`~/.gemini/config/rules.json`).

---

## 🚀 Quickstart Tutorial

### 1. Launch Antigravity CLI
Open your terminal inside this directory:
```bash
agy
```

### 2. Verify Customizations
Run these slash commands inside `agy`:
```text
/skills    # View available skills (including deploy-staging)
/agents    # View subagent definitions (including code-auditor)
/hooks     # View configured lifecycle hooks
/mcp       # View active MCP servers
```

### 3. Test Scoped Rules in Action
Ask the agent:
> *"Write a new refund function in src/billing/index.ts"*

Notice how the agent automatically respects the integer-cents invariant and idempotency requirements from [src/billing/AGENTS.md](file:///Users/ibrezmm/Documents/Projects/claude-test/first-start/agy-project/src/billing/AGENTS.md).

### 4. Trigger the Custom Subagent
Ask the agent:
> *"Run the code-auditor agent to review src/billing/index.ts for security risks"*

The agent will spawn `code-auditor` as a dedicated subagent with read-only tools and report structured findings.

### 5. Test the Safety Hook
You can verify the safety hook standalone in your terminal:
```bash
# Safe command returns allow:
echo '{"toolCall":{"args":{"CommandLine":"npm test"}}}' | ./scripts/safety-check.sh
# -> {"decision":"allow"}

# Destructive command returns deny:
echo '{"toolCall":{"args":{"CommandLine":"rm -rf /"}}}' | ./scripts/safety-check.sh
# -> {"decision":"deny","reason":"Destructive operations (...) are blocked by safety-gate hook."}
```

---

## ⌨️ Antigravity CLI Cheatsheet

| Command / Shortcut | Description |
| :--- | :--- |
| `Shift + Tab` | Cycle execution modes: `default` (diff review), `accept-edits` (auto-apply), `plan` (read-only) |
| `/goal <prompt>` | Runs autonomously to completion without pausing for interactive confirmation |
| `/plan <prompt>` | Outline and analyze steps before modifying any code |
| `/grill-me` | Interactive interview mode to clarify requirements before implementing |
| `/deploy-staging` | Invokes the custom deploy skill |
| `Alt + J` / `Ctrl + K` | Jump to pending subagent approval / Approve inline |
| `Ctrl + R` / `Tab` | Open artifact review / inspect diffs |
| `/rewind` or `/undo` | Roll back to an earlier checkpoint |
