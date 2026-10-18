---
description: Review changes for correctness and quality
---

# /project:review

Reviews the current diff or specified target for:
- Correctness bugs
- Security issues
- Performance problems
- Code reuse opportunities
- Simplification opportunities

## Usage

```bash
/project:review              # Review current working tree changes
/project:review HEAD~3       # Review last 3 commits
/project:review main...feat  # Review PR diff
/project:review --fix        # Apply safe fixes automatically
/project:review --comment    # Post as PR comments (if in GitHub)
```

## Options

| Flag | Description |
|------|-------------|
| `--level <low|medium|high|xhigh|max>` | Review depth (default: medium) |
| `--fix` | Apply verified fixes automatically |
| `--comment` | Post findings as inline PR comments |
| `--max-findings <n>` | Limit findings reported |

## Output

Findings are categorized by severity:
- **Critical** - Security vulns, data loss, crashes
- **High** - Logic bugs, significant perf issues
- **Medium** - Style, maintainability, minor bugs
- **Low** - Nitpicks, suggestions