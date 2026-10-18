#!/usr/bin/env bash
# .copilot/hooks/pre-tool.sh — Runs BEFORE any tool execution
# Exit non-zero to block the tool call

set -euo pipefail

TOOL_NAME="${1:-}"
TOOL_ARGS="${2:-}"

# Block dangerous shell commands
if [[ "$TOOL_NAME" == "shell" ]]; then
  case "$TOOL_ARGS" in
    *"rm -rf"*|*"git push --force"*|*"git push -f"*|*":(){ :|:& };:"*|*"dd if="*|*"mkfs"*)
      echo "❌ Blocked dangerous command: $TOOL_ARGS" >&2
      exit 1
      ;;
  esac
fi

# Block writes to protected paths
if [[ "$TOOL_NAME" == "write" || "$TOOL_NAME" == "edit" ]]; then
  case "$TOOL_ARGS" in
    *".env"*|*"id_rsa"*|*"id_ed25519"*|*"/.git/"*|*"package-lock.json"*)
      echo "❌ Blocked write to protected file: $TOOL_ARGS" >&2
      exit 1
      ;;
  esac
fi

# Log all tool calls for audit
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] PRE: $TOOL_NAME" >> .copilot/hooks/audit.log

exit 0