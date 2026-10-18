# GitHub Copilot CLI — Power User Notes

> Agentic terminal assistant from GitHub. Runs a full read/edit/execute loop on your
> machine: it reads files, runs shell commands, patches code, and can push branches and
> open PRs. This is *not* the old `gh copilot suggest` extension — that one only printed
> command suggestions and is superseded by the standalone `copilot` binary below.

**Version discipline:** the CLI is in rapid preview. Flags and slash commands churn between
releases. Treat this document as a mental model, and run `copilot --help` plus `/help`
inside a session as the authoritative reference for your installed version.

---

## 1. Install and authenticate

```bash
node --version                 # needs a modern Node (22+)
npm install -g @github/copilot
copilot --version
```

```bash
copilot                        # first run: /login, opens a device-code flow
# or, headless/CI:
export GH_TOKEN=ghp_xxx        # classic PAT or fine-grained token with "Copilot Requests"
```

Auth notes worth knowing:

- Copilot CLI does **not** read your `gh auth` session in all versions — authenticate the CLI itself.
- For CI, `GH_TOKEN` / `GITHUB_TOKEN` is the clean path; no interactive device flow.
- Your Copilot subscription (Individual / Business / Enterprise) governs access. Enterprise
  policy can disable the CLI entirely, in which case auth succeeds but requests 403.

---

## 2. Mental model: the loop, the tools, the permissions

Every request becomes an agent loop: **plan → call tool → observe → repeat → answer**.
The tools are roughly:

| Tool class | What it does | Typical approval |
|---|---|---|
| `read` | read file contents, list dirs | auto in trusted dir |
| `edit` / `write` | create and patch files | per-file prompt |
| `shell` | run arbitrary commands (`git`, `npm`, `pytest`, `gh`…) | per-command prompt |
| `web` | fetch URLs / search | prompt |
| `mcp:<server>` | tools from attached MCP servers | prompt or configured |

The permission layer is the whole game. Master it and the CLI stops being annoying.

---

## 3. Interactive essentials

Launch, then work in natural language. Special input syntax inside the prompt:

| Syntax | Effect |
|---|---|
| `@path/to/file` | fuzzy-attach a file to context |
| `!command` | run a shell command yourself, bypassing the model |
| *paste a GitHub URL* | pull issue / PR / repo into context |
| `Ctrl+C` | cancel the current turn (not the session) |
| `Ctrl+D` / `/exit` | quit |

High-value slash commands:

```
/help                 list everything your version supports
/login /logout        switch accounts
/model                pick the model for this session
/context              show what's actually in the context window
/compact              summarize history to reclaim tokens
/clear                wipe conversation, keep the session
/cwd                  show working directory
/add-dir <path>       extend the trusted roots (monorepos, sibling repos)
/list-dirs            show trusted roots
/diff                 review uncommitted changes the agent made
/review               run a code review over your changes
/pr                   create a pull request from the branch
/init                 bootstrap project instructions (AGENTS.md)
/agent                inspect or switch agent configuration
/mcp                  add, list, remove MCP servers
/allow-all            enable all tools for the session
/reset-allowed-tools  revoke saved approvals
/session /resume      list and reattach to earlier sessions
/delegate             hand the task to Copilot's cloud coding agent
/usage                token/credit consumption
/terminal-setup       shell keybinding integration
```

---

## 4. Permissions: the part that separates power users from everyone else

Interactive prompts are the default. For real throughput, pre-scope approvals instead of
clicking "yes" forty times.

```bash
# Approve an entire tool family for this invocation
copilot --allow-tool 'shell(git:*)' --allow-tool 'shell(npm:*)'

# Pre-approve broad reads/edits but keep shell gated
copilot --allow-all-tools --deny-tool 'shell(git push)'

# Non-interactive "just do it" (only in a throwaway container or clean branch)
copilot --allow-all-tools --allow-all-paths -p "run the test suite and fix failures"
```

Rules of thumb:

- **Deny beats allow.** Use `--deny-tool` as the seatbelt: block `git push`, `rm`, `curl`,
  anything irreversible, then allow generously above it.
- `--allow-all-paths` widens the filesystem sandbox. Without it, the agent is confined to
  the working directory and directories added with `/add-dir`.
- Approved commands are remembered per session (sometimes per project). `/reset-allowed-tools`
  clears them when you've been too generous.
- The genuinely dangerous pattern is unattended `--allow-all-tools` on a repo with push
  rights. Use a branch, a worktree, or a container.

---

## 5. Models

`/model` switches mid-session; `--model` sets it per invocation. Families available depend on
your plan — generally a fast/cheap tier and a stronger reasoning tier. Practical split:

- large refactors, architecture, gnarly debugging → strongest model available
- renames, test scaffolding, boilerplate, commit messages → fast model
- if a session gets sloppy after long context, `/model` up rather than arguing with it

---

## 6. Context engineering

Three layers feed the agent, in increasing specificity:

1. **Repository instructions** — `AGENTS.md` at the repo root (and nested copies in
   subdirectories for monorepos). The agent reads these automatically. `/init` generates a
   first draft from your codebase; then edit it hard. This is the single highest-leverage
   file in the whole setup: build commands, test commands, lint rules, style conventions,
   "never touch `generated/`", "use pnpm not npm".
2. **`.github/copilot-instructions.md`** — the GitHub-wide convention, shared with Copilot
   code review and the coding agent. Keep the two files consistent rather than duplicating.
3. **MCP servers** — external tools, configured in `~/.copilot/mcp-config.json` (user scope)
   or via `/mcp add`. Wire up your issue tracker, DB schema introspection, docs search, or an
   internal API. Every server you attach costs context; attach lazily.

Context hygiene:

- `/context` before blaming the model for a bad answer — usually the reason is visible there.
- `/compact` past ~60–70% utilization; long sessions degrade before they break.
- Start a fresh session for a new task rather than carrying a stale plan forward.
- Attach files with `@` deliberately; don't let it re-read the world every turn.

---

## 7. Headless and scripted use

This is where the CLI earns its place in a toolchain.

```bash
# one-shot, no TUI
copilot -p "summarize the changes in src/ since the last tag"

# pipe stdin in
git diff main...HEAD | copilot -p "write a conventional-commit message for this diff"

# scoped automation
copilot --allow-tool 'shell(git:*)' --allow-all-paths \
  -p "find TODO comments older than 90 days and open one issue per file"

# resume the previous conversation without the TUI
copilot --continue -p "now do the same for the tests directory"
```

CI pattern that stays sane:

```bash
copilot --allow-tool 'shell(npm test:*)' --deny-tool 'shell(git push)' \
  -p "run the suite, fix only failures caused by the diff on this branch" \
  && git diff --stat
```

Guardrails for automation: pin the CLI version, run in a container, keep `--allow-all-tools`
off, and always leave a human in the loop before anything merges.

---

## 8. Sessions, diffing, shipping

- Sessions persist. `--continue` picks up the last one; `--resume` (and `/resume`) lets you
  choose from history. Cheap way to keep long-running work coherent across days.
- `/diff` before every commit. The agent writes plausible code faster than you can review it,
  and the diff is where you catch the plausible-but-wrong parts.
- `/review` runs an adversarial pass over your own changes — genuinely useful before opening
  a PR, and it's a different reviewer than the model that wrote the code.
- `/pr` creates the PR with a generated title and body, using `gh` under the hood.

---

## 9. Delegation to the cloud coding agent

`/delegate` hands the task to Copilot's asynchronous coding agent, which works on a branch in
GitHub and opens a PR. Good split of labour:

| Local CLI | Delegated agent |
|---|---|
| interactive exploration, tight feedback loops | well-scoped, mechanical, many-file changes |
| needs your machine's state, secrets, local DB | runs on GitHub's runners |
| you want to watch it work | you want to go do something else |

Write the delegation brief like a ticket: target files, acceptance criteria, test command,
and what *not* to touch. Vague briefs produce PRs you'll rewrite.

---

## 10. Gotchas

- **Trust prompt on first run.** The working directory must be trusted before any tool runs.
  `--add-dir` is how you widen it; `--allow-all-paths` is how you remove the fence.
- **It will run commands.** That's the feature. Review shell approvals the way you'd review a
  `sudo` prompt: read the whole command, not the first word.
- **Large repos.** Attach selectively and keep `AGENTS.md` short — a 400-line instruction file
  eats context every turn and gets partially ignored.
- **Stale instructions outperform no instructions at failure.** If `AGENTS.md` names a
  command that no longer exists, the agent will confidently run it and then flail. Audit it
  when your build changes.
- **Preview churn.** A recipe from a blog post six weeks old may not run. `copilot --help`
  first, debugging second.
- **Don't `--allow-all-tools` on your main checkout.** Branch or worktree, every time.

---

## 11. Cheat sheet

```bash
# setup
npm install -g @github/copilot
copilot --version && copilot --help
copilot                                  # /login on first run

# interactive
copilot --model <name> --add-dir ../shared-lib
#   @file  !cmd  /diff  /review  /pr  /compact  /context  /delegate

# scoped automation
copilot --allow-tool 'shell(git:*)' --deny-tool 'shell(git push)' -p "…"
copilot --continue -p "…"
echo "$DIFF" | copilot -p "review this diff for security issues"

# config
~/.copilot/mcp-config.json               # MCP servers
./AGENTS.md                              # repo instructions (highest leverage)
./.github/copilot-instructions.md        # shared with code review + coding agent
```

The 20% that matters: a tight `AGENTS.md`, deny-listed destructive commands, `/diff` before
every commit, and `/compact` before the context rots.