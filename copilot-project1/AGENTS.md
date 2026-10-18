# AGENTS.md — Project Instructions for Copilot CLI

## Project Overview
This is a sample project demonstrating Copilot CLI skills, hooks, and MCP server configuration.

## Build & Test Commands
```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint
npm run lint

# Build
npm run build
```

## Code Style
- Use TypeScript with strict mode
- ESLint + Prettier for formatting
- Conventional commits (feat:, fix:, chore:, etc.)
- No `any` types unless explicitly justified

## Project-Specific Rules
- **Never** commit directly to `main` — use feature branches and PRs
- **Never** modify `generated/` or `dist/` directories
- **Always** run tests before committing
- Use `pnpm` (not npm/yarn) if lockfile exists

## File Patterns
- Source: `src/**/*.ts`
- Tests: `tests/**/*.test.ts`
- Config: `*.config.*`, `*.rc.*`

## MCP Servers Available
- `github` — GitHub API access (issues, PRs, repos)
- `filesystem` — Local file operations
- `sqlite` — Local database queries

## Hooks
See `.copilot/hooks/` for pre/post tool execution hooks.