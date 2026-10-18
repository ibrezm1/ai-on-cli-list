---
applyTo: "**"
---
# Git Workflow

## Branching
- `main` — protected, deployable, no direct pushes
- Feature branches: `feat/<short-description>`
- Fix branches: `fix/<short-description>`
- Chore branches: `chore/<short-description>`
- Docs branches: `docs/<short-description>`

## Commits
- Conventional Commits: `type(scope): description`
- Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`
- Scope: optional, lowercase (e.g., `feat(auth): add login`)
- Body: explain *why*, not *what*
- Footer: `Closes #123` for linked issues

## Pull Requests
- Title = commit subject (or squash merge subject)
- Description: summary, testing done, screenshots if UI
- Require: CI pass, 1 approval, up-to-date with main
- Squash merge; delete branch after merge

## Releases
- Tag: `v<major>.<minor>.<patch>` (semver)
- Changelog: auto-generated from conventional commits
- Deploy on tag push to main