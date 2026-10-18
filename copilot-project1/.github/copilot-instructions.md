# Copilot Instructions (Shared with Code Review & Coding Agent)

## Repository Context
This project demonstrates GitHub Copilot CLI advanced features: skills, hooks, and MCP servers.

## Coding Standards
- TypeScript strict mode required
- No console.log in production code
- Prefer async/await over promises
- Use Zod for runtime validation

## Testing Requirements
- Unit tests for all public functions
- Integration tests for API routes
- Minimum 80% coverage

## Security
- Never log secrets or tokens
- Validate all external inputs
- Use parameterized queries

## Git Workflow
- Branch naming: `feat/`, `fix/`, `chore/`, `docs/`
- PR title: Conventional Commits format
- Require review + CI pass before merge