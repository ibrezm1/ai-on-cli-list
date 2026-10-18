---
name: deploy-staging
description: Deploys the current branch to the staging environment and executes verification smoke tests. Use when the user asks to deploy, release, or verify staging.
---

# Deploy to Staging Workflow

This skill guides the agent through preparing, deploying, and verifying changes on the staging environment. In the Antigravity CLI, this skill is also callable as `/deploy-staging`.

## Workflow Steps

### 1. Preflight Verification
Before triggering deployment, verify workspace state and test pass rates:
1. Ensure the git working tree is clean:
   ```bash
   git status --porcelain
   ```
2. Run preflight checks:
   ```bash
   ./scripts/preflight.sh
   ```
   *If preflight checks fail, halt immediately and report the errors to the user.*

### 2. Trigger Staging Deployment
Deploy the current branch or commit SHA to staging:
```bash
./scripts/deploy.sh staging
```

### 3. Run Automated Smoke Tests
Once the deployment finishes, run the post-deploy verification suite:
```bash
./scripts/smoke.sh
```

### 4. Report Deployment Summary
Provide a clean summary report containing:
- **Environment:** Staging
- **Commit SHA:** `$(git rev-parse --short HEAD)`
- **Smoke Test Result:** Passed / Failed
- **Staging URL:** `https://staging.example.com`
