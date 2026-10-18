The Medium link you provided returns a 403 error and cannot be accessed directly. However, based on the other valid links, I have reorganized a Markdown document for you, adding official command references and supplementary materials for each tool.

---

# AI Coding CLI Tools Configuration Guide

This document compiles configuration methods, model access, and command references for several mainstream AI coding command-line tools.

## 1. GitHub Copilot CLI

### Core Configuration
Copilot CLI controls its scope of access through trusted directories, tool permissions, and path/URL permissions.

- **Trusted Directories**: When launched for the first time, it prompts whether to trust the current directory. This can be edited in `~/.copilot/config.json` (or Windows `$HOME\.copilot\config.json`), or the location can be changed via the `COPILOT_HOME` environment variable.
- **Tool Permissions**: Defaults to requiring approval for operations such as `touch`, `chmod`, `node`, `sed`, etc. Granular control is possible through command-line flags:
  - `--allow-all-tools`: Allows all tools (use with caution).
  - `--deny-tool='shell(git push)'`: Denies specific commands.
  - `--allow-tool='write'`: Allows file modification tools.
- **Path and URL**: By default, it only accesses the current working directory and temporary directory. `--allow-all-paths` and `--allow-all-urls` can disable restrictions. `--allow-all` (or `--yolo`) combines all permissions.

### Bring Your Own Key (BYOK) Models
Supports connecting to OpenAI-compatible endpoints, Azure OpenAI, and Anthropic. Core environment variables include:

- `COPILOT_PROVIDER_BASE_URL` (required)
- `COPILOT_PROVIDER_TYPE` (`openai` / `azure` / `anthropic`)
- `COPILOT_PROVIDER_API_KEY`
- `COPILOT_MODEL` (required)

**Ollama Local Example**:
```bash
export COPILOT_PROVIDER_BASE_URL=http://localhost:11434
export COPILOT_MODEL=llama3.2
copilot
```

**Offline Mode**: Set `COPILOT_OFFLINE=true` to prevent contact with GitHub servers (but if the provider is remote, prompts will still be sent to that provider).

### Supplementary Links
- [Copilot CLI Command Reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference) (includes `/fleet`, `/sandbox`, `/review`, etc.)
- [Ollama Integration Documentation](https://docs.ollama.com/integrations/copilot-cli)

---

## 2. Claude Code

### Overview and Installation
Claude Code is an agentic coding tool available in terminal, IDE, desktop app, and web versions. Terminal version installation (macOS/Linux/WSL):
```bash
curl -fsSL https://claude.ai/install.sh | bash
```
Windows PowerShell:
```powershell
irm https://claude.ai/install.ps1 | iex
```
It can also be installed via Homebrew (`brew install --cask claude-code`) or WinGet.

### Key Capabilities
- **CLAUDE.md**: Project-level instruction file that is automatically read at the start of each session.
- **MCP Support**: Connects to external tools such as Google Drive, Jira, and Slack.
- **Multi-Agent Parallelism**: Supports running multiple agents simultaneously, coordinated by a lead agent.
- **CI Integration**: Can be used for automated review in GitHub Actions or GitLab CI/CD.

### Supplementary Links
- [Claude Code CLI Reference](https://code.claude.com/docs/en/cli-reference) (complete command and flag list, such as `--add-dir`, `--agents`, `--allowedTools`, etc.)

---

## 3. Google Antigravity

### Installation and Startup
**Desktop/IDE**: Download the installer from the official website, or install the extension from the VS Code Marketplace.

**CLI (`agy`)**:
```bash
curl -fsSL https://antigravity.google/cli/install.sh | bash
```
After installation, run `agy` to start the TUI. On first launch, it will guide you through color scheme selection, rendering mode, and workspace trust confirmation.

### Configuration and Commands
- **Configuration File**: `~/.gemini/antigravity-cli/settings.json`
- **Common Slash Commands**: `/goal` (autonomous completion of tasks), `/schedule` (scheduled tasks), `/browser` (browser debugging), `/plugin` (plugins), `/artifact` (artifact review).
- **Permissions**: Controlled via `/permissions` or `/config`, default is `request-review` mode.

### Supplementary Links
- [Antigravity CLI Command Reference](https://antigravity.google/docs/cli/reference/) (complete TUI command and shortcut list)
- [Hands-on Codelab](https://codelabs.developers.google.com/antigravity-cli-hands-on) (includes tool permission mode details and configuration examples)

---

## 4. OpenAI Codex

### Installation and Getting Started
**macOS/Linux**:
```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```
**npm**: `npm install -g @openai/codex`
**Homebrew**: `brew install --cask codex`

After installation, run `codex` in a project directory and sign in with a ChatGPT account or API key.

### Core Features
- **Local Repository Operations**: Read files, modify code, and execute local tools.
- **Approval Modes**: `suggest` (default, requires approval for all writes), `auto-edit` (automatic file writes, command approval required), `full-auto` (sandboxed fully autonomous).
- **`codex exec`**: Suitable for scripts and CI non-interactive execution.

### Supplementary Links
- [Codex CLI Documentation](https://learn.chatgpt.com/docs/codex/cli) (installation, authentication, basic workflow)
- [Codex Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide) (tool invocation and prompt design)
- [Long-Running Task Experiment Record](https://developers.openai.com/blog/run-long-horizon-tasks-with-codex) (25-hour continuous run case)

---

## Additional Notes

**Regarding the Medium article**: The link `https://medium.com/@luongnv89/run-claude-code-on-local-cloud-models-in-5-minutes-ollama-openrouter-llama-cpp-6dfeaee03cda` returns HTTP 403 (access denied), and the content cannot be obtained. It is recommended to directly refer to the BYOK section in the GitHub Copilot CLI official documentation, or search for the article title on Medium to find mirrored versions or alternative sources.


I have added OpenCode, Kilo CLI, and Goose to your document. Below is the updated content for the new sections, which you can append directly after the existing tools.

---

## 5. OpenCode

### Overview and Installation
OpenCode is an open-source (MIT) terminal AI coding agent known for its strong model flexibility and scriptability. Installation is done via npm:
```bash
npm install -g opencode-ai
```
After installation, run `opencode` in a project directory to launch the TUI, or use `opencode run "prompt"` for non-interactive execution.

### Core Features
- **Multi-Provider Support**: Supports Anthropic, OpenAI, Google, and local Ollama models via a unified `provider/model` format (e.g., `ollama/llama3.3`).
- **Non-Interactive `run` Command**: Designed for scripting and automation. It supports `--format json` for structured NDJSON output, making it easy to integrate into CI or evaluation pipelines.
- **MCP Management**: Built-in `opencode mcp` commands to add, list, and authenticate MCP servers.
- **Session and Cost Tracking**: `opencode stats` shows token usage and cost; `opencode session list` manages conversation history.

### Key Commands
| Command | Purpose |
|---------|---------|
| `opencode` | Launch interactive TUI |
| `opencode run "task"` | Non-interactive execution for automation |
| `opencode models --refresh` | Refresh available model list |
| `opencode mcp add` | Add an MCP server |
| `opencode auth login` | Configure provider API keys |

### Supplementary Links
- [OpenCode CLI Documentation](https://opencode.ai/docs/en/cli/) (full command and flag reference)

---

## 6. Kilo Code CLI

### Overview and Installation
Kilo Code CLI is an open-source coding agent built on the OpenCode foundation. It emphasizes **zero markup** on model access (BYOK or Kilo credits) and supports 500+ models. Install via npm:
```bash
npm install -g @kilocode/cli
```
Run `kilo` in any directory to start.

### Core Features
- **Built on OpenCode**: Inherits OpenCode's speed and extensibility, with Kilo-specific integrations and upstream contributions.
- **Sandboxed Auto Mode**: Use `/sandbox` to confine agent tool execution, keeping writes inside the workspace while `.git` remains read-only.
- **Parallel Agents**: Start multiple specialized agents from one terminal and monitor progress side by side.
- **Permission System**: Granular `allow` / `ask` / `deny` rules configurable globally or per-project via `tui.json` / `tui.jsonc`.
- **Checkpoints**: `/checkpoint list` and `/checkpoint restore <hash>` allow rolling back conversation state.

### Key Commands
| Command | Purpose |
|---------|---------|
| `kilo` | Launch interactive TUI |
| `kilo run "<task>"` | One-off task execution |
| `kilo models` | List available models |
| `kilo mcp` | Manage MCP servers |
| `kilo session list` | List past sessions |

### Supplementary Links
- [Kilo CLI Official Page](https://kilo.ai/cli)
- [Kilo CLI Configuration & Slash Commands](https://kilo.ai/docs/code-with-ai/platforms/cli)

---

## 7. Goose

### Overview and Installation
Goose is an open-source (Apache 2.0) on-machine AI agent from Block, designed to autonomously execute complex engineering tasks—editing files, running commands, and interacting with external APIs. Install via script:
```bash
curl -fsSL https://getgoose.ai/install.sh | bash
```
Alternatively, use Homebrew (`brew install --cask block-goose`) or Cargo. Run `goose configure` for initial provider setup.

### Core Features
- **MCP-Native Architecture**: Nearly all capabilities beyond the built-in Developer extension (shell, file edit, etc.) are added as MCP servers called "extensions." It also performs safety scanning before activating external extensions.
- **Recipe System**: Reusable, parameterized workflows (Jinja2 templating) that can be validated, shared, and scheduled (`goose schedule add`).
- **Session Management**: Full lifecycle support—`session list`, `session resume`, `session export` (JSON/YAML/Markdown), and `session diagnostics` for debugging.
- **30+ LLM Providers**: Includes OpenAI, Anthropic, Ollama, Databricks, and more. Switch providers via `goose configure` or `GOOSE_PROVIDER` environment variable.

### Key Commands
| Command | Purpose |
|---------|---------|
| `goose configure` | Set up provider, API keys, extensions |
| `goose session start` | Launch interactive agent session |
| `goose run --recipe <name>` | Execute a reusable recipe |
| `goose session export <id>` | Export session to JSON/YAML/Markdown |
| `goose schedule add` | Schedule a recipe for recurring execution |

### Supplementary Links
- [Goose CLI Usage Guide](https://mintlify.wiki/block/goose/guides/cli-usage) (detailed session, recipe, and configuration commands)
- [Goose Introduction & Architecture](https://mintlify.wiki/block/goose/introduction)

---

**Note on OpenCode vs. Kilo CLI**: Kilo CLI is built on OpenCode's MIT-licensed foundation, so their core TUI behavior and many flags are similar. The key distinction is Kilo's zero-markup model marketplace, sandbox mode, and deeper integration with the Kilo platform—while OpenCode remains the leaner, purely open-source option with its own provider/agent ecosystem.


Based on Reddit discussions, power users are no longer "choosing one ultimate tool," but rather **building toolchains or orchestrating multiple agents**. The core philosophy is: use the most suitable model for reasoning, use the most cost-effective tool for execution, and use MCP/skills to fill capability gaps.

### The Most Widespread "Hacking" Method: Claude Code Plans, Codex Executes

This is the most frequently mentioned hybrid pattern on Reddit. Users have found that Claude Code has stronger reasoning and architectural judgment when facing ambiguous requirements or complex refactoring, but it hits rate limits quickly and its $200 plan gets used up fast. Codex (OpenAI) has more generous quotas, with reports that a $20 plan can handle workloads comparable to Claude's $200 plan, but its edits occasionally lack "idiomatic" style or tend to over-refactor.

The specific workflow typically looks like this:
1. **Claude Code produces the plan**: Feed it the refactoring requirements, let it output a detailed step-by-step plan (including specific files to modify).
2. **Codex executes**: Paste the plan into Codex for execution, or use `git worktree` to open multiple Codex instances to process independent subtasks in parallel.
3. **Cross-review**: Some users have Claude Code review Codex's generated diffs, or vice versa, using one tool's strength to cover the other's blind spots.

A high-scoring Reddit comment summarizes the cost logic succinctly: "*$20 OpenAI = $200 Claude*".

### OpenCode's "Modular Hacking": Skills + MCP + Replacement Shells

In the OpenCode community, power users are building it into something resembling "LEGO blocks." The most typical practices include:

- **Leveraging Claude Skills ecosystem**: OpenCode is compatible with over 45,000 public Claude Skills. Users directly mount these skills (such as code review templates, deployment scripts) into OpenCode, saving the effort of reinventing the wheel.
- **Skills with MCP**: The community consensus is "not either-or, but combined." Skills provide domain-specific instructions, MCP provides access to external data and tools, and together they form a complete agent capability.
- **Replacing default TUI**: Many users find OpenCode's native terminal interface not user-friendly enough, so **CodeNomad** has become the community's preferred frontend. Some users commented it "feels like Cursor with a sidebar," and the developer themselves use it as their daily driver.

### Self-Hosted "Sovereign AI" Stack: Fully Localized for Compliance

In security-sensitive scenarios (such as penetration testing), Reddit users are building fully self-hosted agent workstations. The core concern is: sending client vulnerability data to cloud models is a **contract compliance issue**, not a matter of performance. The solution is to use **local LLM + MCP** as the foundation, with **Claude Code or OpenCode as the operational framework**, ensuring data never leaves the firewall. This practice spread from r/Pentesting to the broader self-hosted AI community, reflecting a trend: for regulated industries, "where the agent runs" matters more than "how smart it is."

### Directly Modifying "Sessions" and "Memory"

Advanced users are not satisfied with having the agent passively wait for instructions. Some are using **Claude Code's hook mechanism** to embed custom scripts at specific lifecycle points (such as session start, before tool calls), achieving automated governance. For example, a local MCP server called `raysense` detects "which callers will break" before file edits, solving the pain point where "the diff looks fine but unrelated places explode after merging". Others directly crack open session storage, manually editing or migrating conversation contexts to achieve cross-project "memory" reuse—which sounds hacky, but reflects the community's strong demand for agent state controllability.

### A Reality Check from Power Users

Despite all the fancy combinations, Reddit veterans repeatedly emphasize one point: **Neither tool can achieve "set it and forget it" on large codebases**. Whether Claude Code or Codex, multi-hour sessions require human supervision, periodically re-anchoring context and correcting accumulated errors. Those "hacking workflows" that look impressive are essentially **deliberately decomposing tasks and designing handoff points** to reduce the probability of agent失控 in long sessions.

If you plan to write these Reddit practices into your documentation, I suggest adding a "Multi-Tool Orchestration Patterns" section to the Codex or Claude Code chapters, focusing on the "Plan → Execute → Review" handoff logic, which will be more practical for readers than a simple tool list.