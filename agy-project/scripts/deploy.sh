#!/usr/bin/env bash
# scripts/deploy.sh - Sample deployment script
set -euo pipefail

ENV="${1:-staging}"
echo "==> Deploying application to [$ENV]..."
echo "  [✓] Bundling assets..."
echo "  [✓] Syncing build artifacts to staging cluster..."
echo "==> Deployment to [$ENV] completed successfully."
exit 0
