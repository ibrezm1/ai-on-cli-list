#!/usr/bin/env bash
# scripts/safety-check.sh
# Antigravity PreToolUse hook script.
# Receives JSON payload on stdin, outputs JSON decision on stdout.
set -euo pipefail

# Read stdin
input=$(cat)

# Extract CommandLine argument from the toolCall
cmd=$(echo "$input" | jq -r '.toolCall.args.CommandLine // empty')

# Check for dangerous command patterns
if echo "$cmd" | grep -Eq 'rm -rf /|DROP TABLE|terraform destroy|git push .*--force'; then
  cat <<'EOF'
{
  "decision": "deny",
  "reason": "Destructive operations (rm -rf /, DROP TABLE, terraform destroy, force-push) are blocked by safety-gate hook."
}
EOF
else
  cat <<'EOF'
{
  "decision": "allow"
}
EOF
fi
