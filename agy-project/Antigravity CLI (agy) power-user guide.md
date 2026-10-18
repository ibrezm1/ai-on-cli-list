**Contents** [Claude Code mapping](#map)[Install and auth](#start)[Folder layout](#tree)[AGENTS.md and rules](#rules)[settings.json](#settings)[Permissions](#perms)[Modes and sandbox](#modes)[Skills](#skills)[Subagents](#agents)[Hooks](#hooks)[MCP](#mcp)[Plugins](#plugins)[Power commands](#power)[Headless and CI](#headless)[Shortcuts](#keys)[Practice lab](#lab)

Field guide, built from the official docs

# Antigravity CLI (`agy`) for developers

Google’s terminal agent, the successor to Gemini CLI. Same ideas as Claude Code (memory files, permissions, hooks, subagents, MCP, headless), with different file names and a few unique features like `/goal`, `/boost` and a built-in terminal sandbox.

Two Google doc sets disagree on where global config lives (`~/.gemini/antigravity-cli/` in the Antigravity docs, `~/.antigravity/` in the Flutter docs). I use the Antigravity docs. Run `/config` and `/mcp` in your install to confirm the real paths.

## 1. If you know Claude Code

| Concept | Claude Code | Antigravity CLI |
| --- | --- | --- |
| Project memory | `CLAUDE.md` | `AGENTS.md` (or `GEMINI.md`), plus `.agents/rules/*.md` |
| Settings | `.claude/settings.json` | `~/.gemini/antigravity-cli/settings.json` (user level) |
| Config folder | `.claude/` | `.agents/` |
| Custom commands | `.claude/commands/*.md` | Skills: every skill becomes a `/skill-name` command |
| Subagents | `.claude/agents/*.md` | `.agents/agents/*.md` |
| Hooks | in settings.json | `.agents/hooks.json` |
| MCP | `.mcp.json` | `.agents/mcp_config.json` |
| Headless | `claude -p` | `agy -p` |
| Mode cycling | Shift+Tab | Shift+Tab: default, accept-edits, plan |
| Rewind | `/rewind` | `/rewind` or `/undo`, plus `/fork` |

## 2. Install and sign in

```
# macOS / Linux
curl -fsSL https://antigravity.google/cli/install.sh | bash
# Windows PowerShell
irm https://antigravity.google/cli/install.ps1 | iex

agy --version     # binary lands in ~/.local/bin/agy
cd my-project && agy
```

First launch asks for color scheme, **Alt-Screen vs Inline** rendering, and workspace trust. Auth uses Google sign-in (browser locally, printed URL over SSH). The `auth.type` setting supports `oauth-personal`, `oauth-business` (Gemini Enterprise), `gemini-api-key` and `agent-platform`. Coming from Gemini CLI, the first run migrates your old config, and a legacy `GEMINI.md` still works though `AGENTS.md` is recommended.

## 3. Folder layout to aim for

```
my-project/
├── AGENTS.md                    # always-on project memory
├── src/billing/AGENTS.md        # directory-scoped rules, loaded when working there
└── .agents/
    ├── rules/                   # *.md, each needs frontmatter (flat, no subfolders)
    ├── skills/deploy-staging/SKILL.md
    ├── agents/code-auditor.md   # custom subagents
    ├── hooks.json
    ├── mcp_config.json
    └── rules.json               # optional: share/inherit rules

~/.gemini/
├── AGENTS.md                    # global memory
├── config/{rules,skills,agents}/  hooks.json  mcp_config.json
└── antigravity-cli/
    ├── settings.json            # CLI settings + permissions
    ├── keybindings.json
    ├── skills/  rules/
    └── plugins/<name>/
```

## 4. AGENTS.md and rules

Rules are cumulative: global, workspace and directory rules are all merged, and the more specific directory rule wins on conflict. Antigravity walks up from the file it is touching to the repo root loading `AGENTS.md`, `GEMINI.md` and `.agents/rules/*.md` at each level. `AGENTS.md` needs no frontmatter and is always on. Rules versus skills: a rule is a constraint or invariant, a skill is a multi-step workflow.

AGENTS.md

```
# payments-api
- Test one file: `npm test -- path/to/file.test.ts`
- Before commit: `npm run lint && npm run typecheck && npm test`
- Money is integer cents. Never floats.
- Domain code never imports from `src/adapters`.
Shared API standards: @[API Design Standards](docs/api-standards.md)
Check @src/db/schema.ts before changing models.
```

`@[label](path)` inlines the file; plain `@path` only gives the agent an unambiguous reference.

.agents/rules/migrations.md

```
---
trigger: model_decision    # always_on | model_decision | glob | manual
description: "Apply when writing or reviewing database migrations or SQL schema changes."
---
1. Never drop or rename a column in one deploy; use expand and contract.
2. Use CREATE INDEX CONCURRENTLY on existing PostgreSQL tables.
```

**Triggers:** `always_on` injects every turn; `model_decision` loads only the description and fetches the body on demand; `glob` activates on matching files (`globs: "*.proto, **/*.pb.go"`); `manual` loads only when you `@`-mention it. A rule file with missing frontmatter or an invalid trigger (camelCase like `alwaysOn`) is **silently discarded**. Limits: 24 KB per file and a 20,000-token budget across always-on rules; the biggest files get demoted to pointers.

## 5. settings.json

Location: `~/.gemini/antigravity-cli/settings.json`. Edit by hand or use `/config` (`/settings`). CLI flags like `--sandbox` override settings for that session, and the panel shows what overrode what. The docs show these keys:

\~/.gemini/antigravity-cli/settings.json

```
{
  "agentMode": "accept-edits",
  "enableTerminalSandbox": true,
  "permissions": {
    "allow": ["command(git)", "command(regex:npm run (build|lint|test))", "write_file(src/)"],
    "deny":  ["command(rm -rf)", "command(sudo)", "write_file(.git/)", "read_file(.env)"],
    "ask":   ["command(git push)", "mcp(sql/execute_mutation)"]
  }
}
```

Other things configured here or via commands: model (`/model`), reasoning effort (`/effort`), tool-output verbosity (set to low to cut noise), custom **status line** and **window title** scripts (they receive a JSON payload with cwd, model, token usage and state on stdin; set up with `/statusline` and `/title`), keybindings in `keybindings.json` (`/keybindings`), and a Vim editor mode.

## 6. Permissions

Every sensitive action is a resource written `action(target)`, evaluated against three lists. Precedence is strict: **deny, then ask, then allow**. So `command(*)` in ask beats `command(git)` in allow.

| Action | Target | Default |
| --- | --- | --- |
| `read_file`, `write_file` | path or dir, recursive. Write implies read; deny read implies deny write | Allowed inside workspace, ask outside |
| `command` | token prefix, `regex:…`, or `*` | Ask |
| `unsandboxed` | same, for running outside the sandbox | Ask |
| `read_url`, `execute_url` | domain (covers subdomains) | Ask |
| `mcp` | `server/tool`, `server/*`, `*` | Ask |

Gotcha: commands containing `$(…)`, backticks, brace expansion, or flags like `git -c core.pager=…` disable prefix matching, so they need a character-for-character rule or they prompt. Normal pipes and `&&` chains still prefix-match. In an Ask prompt you can edit the target to widen the grant (for example a file to its folder), though not for commands. Manage interactively with `/permissions`, which also offers autonomy levels `request-review`, `always-proceed` and `strict`.

## 7. Execution modes and the sandbox

Press **Shift+Tab** to cycle `default` (diff review before every write) to `accept-edits` (auto-approve file changes, subagents inherit it) to `plan` (read-only analysis and outline first). Start in one with `agy --mode=plan`. Mode only governs file edits; shell commands still follow your permission rules. In default mode press `y`, `n`, `f` (full-screen diff) or `Ctrl+G` (edit in `$EDITOR`), or type instructions to reject and redirect.

The **terminal sandbox** (`enableTerminalSandbox`, or `agy --sandbox`) uses native OS isolation, with no VM: nsjail on Linux, sandbox-exec on macOS, AppContainer on Windows. Granted `read_file`, `write_file` and `read_url` rules feed the sandbox’s filesystem and network allowlists. Approval prompts then offer “run without sandbox” for a single trusted command.

## 8. Skills (your custom commands)

A skill is a folder with `SKILL.md`; only name and description are loaded up front, and the body loads when relevant (progressive disclosure). In the CLI **every skill is also auto-converted to a slash command**, so a skill named `deploy-staging` gives you `/deploy-staging`. Locations: `.agents/skills/` (workspace), `~/.gemini/antigravity-cli/skills/` (global), and inside plugins. Browse with `/skills`.

.agents/skills/deploy-staging/SKILL.md

```
---
name: deploy-staging
description: Deploys the current branch to staging and runs smoke tests. Use when asked to deploy or verify staging.
---
1. Run `scripts/preflight.sh --help` first, then run it.
2. If preflight fails, stop and report. Do not deploy.
3. Run `scripts/deploy.sh staging`, then `scripts/smoke.sh`.
4. Report URL, commit SHA and smoke results.
```

Tips from the docs: keep each skill focused, write the description in third person with trigger keywords, tell the agent to run scripts with `--help` rather than reading source, and add a decision tree for complex ones. Old IDE “workflows” migrate to skills.

## 9. Subagents

The main agent spawns concurrent background subagents for research, builds and verification. Each gets a clean context and inherits your allowed commands, directory scopes and sandbox. Built-ins: `research`, `browser` (only via `/browser`) and `self` (a clone). Nesting is capped at 10 levels. Monitor with `/agents`, and use `/tasks` for plain background processes.

.agents/agents/code-auditor.md

```
---
name: code-auditor
description: Security audits and static analysis. Use after changes to auth, input handling or crypto.
tools:
  - view_file
  - grep_search
  - run_command
subagent: true
mainAgent: false
model: pro                    # inherit | flash | pro
commandExecutionPolicy: sandbox   # off | auto | eager | sandbox
skills:
  - skills/security-checklist
---
# System Prompt
You are a security reviewer. Never modify files. Report severity, file:line, fix.
```

Known issue in the docs: a misspelled or unmapped name in `tools` can make the subagent hang. Use exact tool names (`view_file`, `grep_search`, `run_command`, `replace_file_content`).

Approvals from subagents bubble up. **Alt+J** jumps to the next subagent awaiting approval, **Ctrl+K** approves the pending request inline. A subagent can also get its own worktree. Set `mainAgent: true` to pick the agent as your primary one in the `/agents` panel.

## 10. Hooks

Defined in `.agents/hooks.json` (workspace), `~/.gemini/config/hooks.json` or settings.json (global), or a plugin. Inspect with `/hooks`. Hooks get JSON on stdin and return JSON on stdout, camelCase fields, default timeout 30 s.

| Event | Use |
| --- | --- |
| `SessionStart` | Inject setup context via `injectSteps` |
| `PreToolUse` | Return a `decision`: `allow`, `auto_approve`, `deny`, `ask`, `force_ask`, `deny_unless_prior_grant`. Can rewrite args with `overwrite` |
| `PostToolUse` | Lint or format after edits (output `{}`) |
| `PreInvocation` / `PostInvocation` | Inject reminders before the model call; force continue or terminate after |
| `Stop` | Return `{"decision":"continue"}` to make the agent keep going (for example until tests pass) |

.agents/hooks.json

```
{
  "safety-gate": {
    "PreToolUse": [{
      "matcher": "run_command",
      "hooks": [{ "command": "./scripts/safety-check.sh", "timeout": 10 }]
    }]
  },
  "format": {
    "PostToolUse": [{
      "matcher": "write_to_file|replace_file_content|multi_replace_file_content",
      "hooks": [{ "command": "./scripts/format.sh" }]
    }]
  }
}
```

scripts/safety-check.sh

```
#!/usr/bin/env bash
cmd=$(jq -r '.toolCall.args.CommandLine')
if echo "$cmd" | grep -Eq 'terraform (apply|destroy)|DROP TABLE'; then
  echo '{"decision":"deny","reason":"Run infra and destructive SQL manually."}'
else
  echo '{"decision":"allow"}'
fi
```

Matchers are regexes on tool names (`run_command|view_file`, `browser_.*`). Set `"enabled": false` on a hook entry to park it. Unlike Claude Code, blocking is done with a JSON decision, not an exit code.

## 11. MCP

Run `/mcp` for the manager (status rings, reload, connection logs). Global config `~/.gemini/config/mcp_config.json`, workspace config `.agents/mcp_config.json`. Remote servers must use `serverUrl`; legacy `url` and `httpUrl` are not supported.

```
{
  "mcpServers": {
    "sqlite": { "command": "node", "args": ["/usr/local/bin/sqlite-mcp.js"],
                "env": { "SQLITE_DB_PATH": "/var/data/app.db" } },
    "internal-api": { "serverUrl": "https://api.example.com/mcp/",
                      "headers": { "Authorization": "Bearer TOKEN" },
                      "disabledTools": ["delete_record"] },
    "gcp": { "serverUrl": "https://example.googleapis.com/mcp/",
             "authProviderType": "google_credentials" }
  }
}
```

Also supported: `cwd`, `oauth` (clientId and clientSecret when the server lacks dynamic registration), `disabled`. Permissions use `mcp(server/tool)`, and MCP defaults to Ask. The store lists GitHub, Linear, Atlassian, Supabase, Neon, Figma, Chrome DevTools, Stripe, Notion, Sentry-style observability tools and more.

## 12. Plugins and marketplace

A plugin bundles skills, agents, rules, MCP servers and hooks into one installable unit, staged under `~/.gemini/antigravity-cli/plugins/<name>/` (with a required `plugin.json`).

```
/plugin                                   # interactive: Tab switches Discover / Installed
/plugin install firebase@antigravity-plugins-official

agy plugin install <name>                 # official marketplace
agy plugin install https://github.com/<owner>/<repo>
agy plugin install ./my-plugin
agy plugin list --json
agy plugin enable|disable|uninstall <name>
```

This is the way to share your team’s rules, skills and hooks as one package.

## 13. Power commands

| Command | What it does |
| --- | --- |
| `/goal` | Runs the task autonomously to completion without pausing for input |
| `/grill-me` | Agent interviews you about requirements before implementing |
| `/plan` | Analyze and outline before editing |
| `/schedule` | One-time delayed or recurring cron tasks |
| `/boost <task>` | Multi-agent deep reasoning with independent verification for hard bugs, races, algorithms (Pro, Ultra, Enterprise) |
| `/teamwork-preview <task>` | Agent teams for long projects with milestones and verification (paid plans) |
| `/btw <question>` | Side question in the background without derailing the main thread |
| `/fork` | Branch the conversation from an earlier point into a separate workspace |
| `/rewind`, `/undo` | Roll back to a checkpoint |
| `/diff` | Interactive diff viewer to review and steer |
| `/context` | Context window breakdown and checkpoints |
| `/codesearch` | Code search |
| `/browser` | Chrome debugging and research through the browser subagent |
| `/effort`, `/model` | Reasoning effort and default model |
| `/usage`, `/credits` | Quotas and AI credits |
| `/remote-control` | Drive this terminal session from a browser |
| `/resume`, `/rename`, `/clear` | Session management. On exit the CLI prints the exact resume command |
| `/voice`, `/learn`, `/changelog`, `/open <path>` | Dictation, learning mode, release notes, open file in editor |

Review flow: when plans or diffs are ready press **Ctrl+R** for Artifact Review, **Tab** to inspect diffs inline, **Y** to approve.

## 14. Headless and CI

```
agy -p "Summarize this repo"                          # stdout = answer, stderr = diagnostics
agy -p "..." --output-format json | jq -r .response   # envelope: status, response, usage, conversation_id
agy -p "..." --output-format stream-json              # NDJSON: init, step_update, result
agy -p "Parse v2.14.3 into major/minor/patch" --output-format json \
    --json-schema '{"type":"object","properties":{"major":{"type":"integer"}},"required":["major"]}' \
  | jq .structured_output

agy -p "Now fix it" --continue                        # or --conversation <id>
agy -p "Review diff" --model gemini-3.8-flash-medium --effort high --agent code-auditor
agy models; agy agents                                # list slugs and agents
git diff main | agy -p "review for bugs" --print-timeout 10m
agy -p "Run tests" --dangerously-skip-permissions    # only in throwaway environments
```

Without a prompt, tools needing approval are **soft-denied** (exit 0 and a stderr notice), so pre-grant them under `permissions.allow`. Authenticate once interactively first, otherwise CI exits with `authentication required`. For multi-turn scripting use `--input-format stream-json --output-format stream-json` and write `{"event":"user","message":{"content":"…"}}` lines to stdin; you get one `result` per turn. Statuses: SUCCESS, ERROR, CANCELED, INTERRUPTED, INVALID, WAITING. Default timeout is 5 minutes. There is also a Python **Antigravity SDK** (`pip install google-antigravity`) with declarative policies for building your own agents.

## 15. Shortcuts

| Key | Action |
| --- | --- |
| `@` / `!` / `?` | Path autocomplete / run shell command / help and command list |
| Shift+Tab | Cycle execution modes |
| Esc Esc | Clear prompt (when not streaming) |
| Ctrl+R, Tab | Artifact review, inspect diffs |
| Ctrl+G | Edit prompt in `$EDITOR` |
| Ctrl+O | Expand or collapse tool execution |
| Alt+J / Ctrl+K | Jump to subagent awaiting approval / approve it inline |
| Alt+Enter, Ctrl+J, Shift+Enter | Newline in prompt |
| Ctrl+C / Ctrl+D / Ctrl+Z | Interrupt / exit / suspend |

## 16. Practice lab for your test folder

1. Create `AGENTS.md` with build and test commands and one invariant. Ask the agent to run the tests and watch it follow them.
2. Add a `glob` rule for `*.py` and a `model_decision` rule. Confirm both trigger, then break one frontmatter key to see the silent discard.
3. Write deny rules for `read_file(.env)` and `command(rm -rf)` in settings.json. Create a fake `.env` and test it.
4. Cycle Shift+Tab through all three modes on the same task and compare.
5. Turn on `enableTerminalSandbox` and try a `curl`; observe the prompt, then allow with `read_url(example.com)`.
6. Make a `deploy-staging` skill and run it as `/deploy-staging`.
7. Add the `code-auditor` subagent, ask for a review, and use `/agents` and Alt+J.
8. Add a PreToolUse safety hook and a PostToolUse formatter, then verify with `/hooks`.
9. Run `/goal` on a small refactor, then `/rewind` to undo it.
10. Script a headless call with `--json-schema` and parse it with `jq`.

Sources: antigravity.google/docs (getting started, CLI features, settings, modes, headless, permissions, rules, skills, subagents, hooks, MCP).