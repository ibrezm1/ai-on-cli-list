#!/usr/bin/env bash
# scripts/post-tool-check.sh
# Antigravity PostToolUse hook script.
# Receives JSON payload on stdin, outputs empty JSON object {} on stdout.
set -euo pipefail

# Consume stdin
input=$(cat)

# PostToolUse contract expects an empty JSON object on stdout
echo "{}"
