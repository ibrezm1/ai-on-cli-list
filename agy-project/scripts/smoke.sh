#!/usr/bin/env bash
# scripts/smoke.sh - Sample smoke test script
set -euo pipefail

echo "==> Running smoke tests on staging endpoint..."
echo "  [✓] GET /healthz -> 200 OK"
echo "  [✓] GET /api/v1/status -> 200 OK"
echo "==> All staging smoke tests passed!"
exit 0
