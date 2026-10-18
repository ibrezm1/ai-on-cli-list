#!/usr/bin/env bash
# .copilot/hooks/post-tool.sh — Runs AFTER tool execution
# Use for notifications, auto-formatting, validation, etc.

set -euo pipefail

TOOL_NAME="${1:-}"
TOOL_ARGS="${2:-}"
TOOL_RESULT="${3:-}"
EXIT_CODE="${4:-0}"

# Auto-format TypeScript files after write/edit
if [[ "$TOOL_NAME" == "write" || "$TOOL_NAME" == "edit" ]]; then
  case "$TOOL_ARGS" in
    *".ts"|*".tsx")
      if command -v npx >/dev/null 2>&1; then
        npx prettier --write "$TOOL_ARGS" 2>/dev/null || true
      fi
      ;;
  esac
fi

# Run tests after shell commands that might affect code
if [[ "$TOOL_NAME" == "shell" && "$EXIT_CODE" -eq 0 ]]; then
  case "$TOOL_ARGS" in
    *"npm install"*|*"pnpm install"*|*"yarn install"*)
      echo "📦 Dependencies changed — consider running tests"
      ;;
    *"git checkout"*|*"git merge"*|*"git rebase"*)
      echo "🔀 Branch changed — run tests to verify"
      ;;
  esac
fi

# Log completion
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] POST: $TOOL_NAME (exit=$EXIT_CODE)" >> .copilot/hooks/audit.log

exit 0