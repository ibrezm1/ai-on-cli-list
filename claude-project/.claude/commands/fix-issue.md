---
description: Fix a specific issue or bug
---

# /project:fix-issue

Investigates and fixes a specific issue, bug, or task.

## Usage

```bash
/project:fix-issue "Login fails with 500 error"
/project:fix-issue "#123"                    # Fix GitHub issue #123
/project:fix-issue "TypeError in utils.ts"   # Fix specific error
```

## Process

1. **Understand** - Reproduce the issue, examine relevant code
2. **Diagnose** - Identify root cause
3. **Plan** - Propose fix approach (may ask for approval)
4. **Implement** - Apply the fix with tests
5. **Verify** - Confirm fix works, no regressions

## Options

| Flag | Description |
|------|-------------|
| `--dry-run` | Show plan without implementing |
| `--test` | Run tests after fix |
| `--commit` | Auto-commit with conventional message |

## Notes

- For complex issues, may enter plan mode for approval
- Always runs related tests after fix
- Creates minimal, focused changes