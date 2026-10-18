**Contents** [Mental model](#model) [Folder layout](#tree) [CLAUDE.md](#claudemd) [settings.json](#settings) [Custom commands](#commands) [Subagents](#agents) [Skills](#skills) [Hooks](#hooks) [MCP servers](#mcp) [Power features](#power) [Built-in commands](#builtin) [Practice lab](#lab)

Claude Code field guide

# Setting up Claude Code like a power user

What goes in `CLAUDE.md`, `settings.json` and `.claude/`, when to use each, and the features most people never find. Use your test folder as the lab.

Claude Code ships fast. Treat key names and flags below as a solid baseline, and confirm against `/help`, `/doctor` and the official docs when something doesn’t behave.

## 1. Mental model: who decides what

Everything is a layer that controls one thing:

| Mechanism | Controls | Nature |
| --- | --- | --- |
| `CLAUDE.md` | What Claude *knows*: conventions, commands, architecture | Advisory. Loaded into context every session |
| `settings.json` | What Claude *may do*: permissions, env, model, hooks | Enforced by the harness |
| Hooks | What *always happens*: format, lint, block | Deterministic shell commands |
| Slash commands | Reusable prompts you trigger by hand | You invoke |
| Subagents | Isolated specialists with their own context and tools | Claude delegates or you ask |
| Skills | Packaged instructions plus scripts, loaded on demand | Claude invokes when relevant |
| MCP servers | Access to external systems (DB, Jira, browser) | Tools |

Rule of thumb: if it must **never fail**, use a hook or a permission rule. If it’s **guidance**, put it in CLAUDE.md. If it’s a **workflow you repeat**, make a command or skill.

### Settings precedence (highest first)

Enterprise managed policy, then CLI flags, then `.claude/settings.local.json` (yours, git-ignored), then `.claude/settings.json` (team, committed), then `~/.claude/settings.json` (all your projects). Deny rules win over allow rules at any level.

## 2. Folder layout to aim for

```
my-project/
├── CLAUDE.md                  # team memory, committed
├── CLAUDE.local.md            # personal notes, git-ignored
├── .mcp.json                  # project MCP servers, committed
└── .claude/
    ├── settings.json          # shared permissions, hooks, env
    ├── settings.local.json    # personal overrides, git-ignored
    ├── commands/              # /project:name  (one .md per command)
    │   ├── review.md
    │   └── fix-issue.md
    ├── agents/                # subagents (one .md each)
    │   └── security-reviewer.md
    └── skills/                # on-demand skills (folder + SKILL.md)
        └── release-notes/SKILL.md

~/.claude/                     # user scope, applies everywhere
├── CLAUDE.md                  # your global preferences
├── settings.json
├── commands/   agents/   skills/
```

Add to `.gitignore`: `CLAUDE.local.md` and `.claude/settings.local.json`.

## 3. CLAUDE.md

Claude reads it at the start of every session, and also picks up nested `CLAUDE.md` files in subdirectories when it works there (useful in monorepos). Run `/init` to generate a first draft from your codebase, then prune it hard.

### What belongs in it

Exact build, test and lint commands; architecture in a few lines; code style that a linter can’t enforce; repo etiquette (branch names, commit format); known gotchas. **Leave out** anything obvious from the code, long tutorials, and secrets. Every line costs context on every turn, and bloated files get ignored. Aim for under 200 lines.

CLAUDE.md

```
# Project: payments-api

## Commands
- Test one file: `npm test -- path/to/file.test.ts`
- Full check before commit: `npm run lint && npm run typecheck && npm test`
- Local DB: `docker compose up -d db` (port 5433, not 5432)

## Architecture
- `src/domain` pure logic, no I/O. `src/adapters` DB/HTTP. Never import adapters into domain.
- All money is integer cents. Never use floats.

## Conventions
- TypeScript strict. Prefer `type` over `interface`. No default exports.
- Errors: throw `AppError` subclasses, never raw `Error`.
- Commits: conventional commits (`feat:`, `fix:`). Branches: `feature/<ticket>-slug`.

## Gotchas
- Migrations are in `db/migrations`; never edit an applied one, add a new file.
- IMPORTANT: do not touch `src/legacy/**` without asking me first.

## Imports
@docs/architecture.md
@~/.claude/my-personal-style.md
```

`@path` imports pull other files in. Emphasis words like **IMPORTANT** or **YOU MUST** measurably improve adherence for critical rules. During a session, start a message with `#` to append a note to memory, and use `/memory` to open the files in your editor.

## 4. settings.json

This is the control panel. Commit `.claude/settings.json` for the team; keep personal tweaks in `settings.local.json`.

.claude/settings.json

```
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "model": "sonnet",
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test:*)",
      "Bash(git diff:*)",
      "Bash(git status)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Bash(rm -rf:*)",
      "Bash(curl:*)"
    ],
    "ask": ["Bash(git push:*)"]
  },
  "env": { "NODE_ENV": "development" },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{
          "type": "command",
          "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
        }]
      }
    ]
  }
}
```

### Things worth knowing

**Rule syntax:** `Tool(specifier)`. `Bash(npm run test:*)` is a prefix match; `Read(src/**)` uses gitignore-style globs. **Modes:** `default` (asks), `acceptEdits`, `plan` (read-only), `bypassPermissions` (only inside a throwaway container or VM). Cycle modes in a session with **Shift+Tab**. Manage rules interactively with `/permissions`.

Deny rules on `.env` and secrets are your real safety net. A CLAUDE.md line saying “don’t read .env” is only a request.

### Personal global settings

Put things like theme, editor preferences and your own allow-list in `~/.claude/settings.json`. You can also set a custom status line there that runs a script and shows branch, model or cost in the prompt footer (`/statusline` helps generate one).

## 5. Custom slash commands

A command is a Markdown file whose body becomes the prompt. File `.claude/commands/review.md` becomes `/project:review`; files in `~/.claude/commands/` become `/user:name`. Subfolders create namespaces. Use them for anything you type more than twice.

.claude/commands/fix-issue.md

```
---
description: Fix a GitHub issue end to end
argument-hint: [issue-number]
allowed-tools: Bash(gh issue view:*), Bash(git:*), Bash(npm test:*)
---
Current branch: !`git branch --show-current`
Recent commits: !`git log --oneline -5`

Fix GitHub issue #$ARGUMENTS:
1. Read it with `gh issue view $ARGUMENTS`.
2. Find the root cause. Write a failing test first.
3. Implement the fix, run the full test suite.
4. Summarize the change. Do not commit.
```

`$ARGUMENTS` injects what you type after the command; `` !`cmd` `` runs a shell command and inlines its output before Claude sees the prompt; `@file` inlines a file. Run it as `/project:fix-issue 482`.

**Good first commands:** `review` (review the current diff against team rules), `pr` (write PR description from branch diff), `explain` (walk through a module), `test-gap` (find untested paths).

## 6. Subagents

A subagent runs in its own context window with its own tools and system prompt, then returns only a summary. That keeps your main conversation clean and lets you restrict tools. Create with `/agents` or drop a file in `.claude/agents/`.

.claude/agents/security-reviewer.md

```
---
name: security-reviewer
description: Reviews code changes for security issues. Use proactively after edits to auth, input handling, SQL or crypto code.
tools: Read, Grep, Glob, Bash(git diff:*)
model: opus
---
You are a senior application security reviewer.
Check for injection, authn/authz gaps, secrets in code, unsafe deserialization.
Report findings as: severity, file:line, exploit scenario, minimal fix.
Never modify files.
```

The `description` is what Claude uses to decide when to delegate, so write it like a trigger condition. You can also force it: “use the security-reviewer agent on this diff”. Ask Claude to run several in parallel for independent research tasks.

## 7. Skills

A skill is a folder with `SKILL.md` (name and description in frontmatter) plus optional scripts and reference files. Unlike CLAUDE.md, only the short description is loaded up front; the body loads when the task matches. Use skills for procedures with supporting assets: release process, report templates, data-migration playbooks.

.claude/skills/release-notes/SKILL.md

```
---
name: release-notes
description: Generate release notes from merged PRs since the last git tag. Use when asked for a changelog or release notes.
---
1. Run `scripts/collect.sh` to list PRs since the last tag.
2. Group by feat / fix / chore using the template in `template.md`.
3. Flag breaking changes at the top.
```

**Command vs skill:** a command is something *you* trigger explicitly; a skill is something Claude pulls in when the request matches. If you’d never remember to type it, make it a skill.

## 8. Hooks

Hooks are shell commands the harness runs at lifecycle events, with event data as JSON on stdin. They’re deterministic, so use them for what must always happen. Events include `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Notification`, `Stop`, `SubagentStop` and `SessionStart`. Exit code **2** from a `PreToolUse` hook blocks the call and feeds stderr back to Claude.

.claude/hooks/guard.sh (referenced from a PreToolUse hook with matcher "Bash")

```
#!/usr/bin/env bash
cmd=$(jq -r '.tool_input.command')
if echo "$cmd" | grep -Eq 'terraform (apply|destroy)|DROP TABLE'; then
  echo "Blocked: run infra/destructive SQL changes manually." >&2
  exit 2
fi
```

Other uses: run the linter after every edit, desktop notification when Claude finishes (`Stop`), inject the current ticket into context (`UserPromptSubmit`), log every command for audit. Inspect with `/hooks`.

## 9. MCP servers

MCP connects Claude to outside systems. Add from the CLI, or commit a `.mcp.json` so the team shares them.

```
# add a server (scope: local | project | user)
claude mcp add --scope project github -- npx -y @modelcontextprotocol/server-github
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
claude mcp list
# inside a session
/mcp
```

.mcp.json

```
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "${DATABASE_URL}"]
    }
  }
}
```

Each server’s tools consume context, so enable only what the project needs. Point database servers at a read-only replica. MCP tools appear as `mcp__server__tool` in permission rules.

## 10. Power features

### Explore, plan, code, commit

Start complex work in **plan mode** (Shift+Tab twice, or `claude --permission-mode plan`). Claude researches read-only and proposes a plan. Edit the plan, approve, then let it implement. Ask for tests first, then implementation, and have it iterate until tests pass.

### Parallel sessions with git worktrees

```
git worktree add ../app-feature-a -b feature-a
cd ../app-feature-a && claude      # separate checkout, separate session
```

Run one Claude per worktree so they never collide on files. Pair with a notification hook so you know when each finishes.

### Think harder

Words like “think”, “think hard” and “ultrathink” in a prompt raise the reasoning budget for tough design or debugging questions.

### Keep the context window healthy

`/clear` between unrelated tasks. `/compact focus on the auth refactor` summarizes while keeping what matters. `/context` shows what is eating tokens. `/cost` shows spend.

### Undo and resume

**Esc** interrupts. **Esc Esc** (or `/rewind`) lets you jump back to an earlier point in the conversation and restore code state. `claude --continue` resumes the latest session; `claude --resume` picks from a list. Name sessions so you can find them.

### Point at things precisely

`@src/auth/` references files or folders with autocomplete. Paste or drag screenshots for UI work. Pipe data in: `cat error.log | claude -p "find the root cause"`.

### Headless mode in scripts and CI

```
claude -p "list TODOs older than 90 days" --output-format json
claude -p "fix lint errors" --allowedTools "Edit,Bash(npm run lint)"
git diff main | claude -p "review for bugs" > review.md
```

Use `--output-format stream-json` for programmatic parsing and `--max-turns` to cap runaway loops.

### GitHub integration

`/install-github-app` sets up a workflow so you can mention `@claude` on issues and PRs and get implementations or reviews back as PRs.

### Build your own agents

The same engine is available as the Claude Agent SDK (TypeScript and Python) if you want to embed it in your own tooling.

### Extra customization

`--append-system-prompt` for per-run instructions, `/output-style` to change response style, `/model` to switch models mid-session, and `/terminal-setup` for newline keybindings.

| Key | Action |
| --- | --- |
| Shift+Tab | Cycle permission modes (normal, auto-accept edits, plan) |
| Esc / Esc Esc | Interrupt / rewind to earlier point |
| `#` at start | Save the line to memory (CLAUDE.md) |
| `!` at start | Run a shell command directly, output joins context |
| `@` | Reference file or folder |
| Ctrl+R | Search prompt history |
| Ctrl+C / Ctrl+D | Cancel / exit |

## 11. Built-in commands to learn first

| Command | Use |
| --- | --- |
| `/init` | Generate CLAUDE.md from the repo |
| `/memory` | Edit memory files |
| `/permissions` | View and edit allow, ask, deny rules |
| `/config` | Settings UI |
| `/agents`, `/hooks`, `/mcp` | Manage subagents, hooks, servers |
| `/compact`, `/clear`, `/context` | Manage the context window |
| `/resume`, `/rewind` | Session and conversation history |
| `/model`, `/cost` | Switch model, see usage |
| `/review`, `/security-review` | Review code changes |
| `/doctor`, `/help` | Diagnose install, list everything available |

## 12. Practice lab for your test folder

Do these in order. Each one teaches one layer.

1. **Memory.** Add a tiny project (even a Node or Python script), run `claude`, then `/init`. Trim the result to the essentials. Start a prompt with `#` to add one rule and see it saved.
2. **Permissions.** Create `.claude/settings.json` with one allow rule and a deny on `.env`. Create a fake `.env` and ask Claude to read it. Watch it get refused.
3. **Hook.** Add the Prettier or `black` PostToolUse hook, ask for a messy edit, confirm it gets formatted automatically.
4. **Command.** Write `/project:review` that uses `` !`git diff` ``. Make a change and run it.
5. **Subagent.** Create the reviewer agent, then say “have the reviewer agent check my last change”.
6. **Plan mode.** Ask for a non-trivial feature in plan mode. Edit the plan before approving.
7. **Headless.** Run `claude -p "summarize this repo" --output-format json` and parse it with `jq`.
8. **MCP.** Add one server (filesystem or GitHub) and use it from a prompt.

Habit that pays off most: when Claude makes the same mistake twice, fix it at the right layer. Preference goes in CLAUDE.md, a hard rule goes in a hook or deny rule, a repeated workflow becomes a command or skill.