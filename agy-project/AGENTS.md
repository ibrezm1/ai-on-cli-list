# Project Memory: AGENTS.md

Welcome to the project! This file serves as the **always-on memory** for Antigravity (and `agy` CLI).
It is automatically loaded into the agent's context on every turn.

---

## 🛠️ Build, Lint & Test Commands

- **Install dependencies:** `npm install`
- **Run dev server:** `npm run dev`
- **Run all tests:** `npm test`
- **Run single test:** `npm test -- path/to/test-file.test.ts`
- **Typecheck & Lint:** `npm run typecheck && npm run lint`

---

## 📐 Architecture Invariants & Rules

1. **Monetary Values:** All currency and balance amounts must be represented as **integer cents** (e.g., `$10.00` -> `1000`), never floating-point numbers.
2. **Layering:** Domain logic in `src/core/` must never import directly from `src/adapters/` or `src/billing/`.
3. **Error Handling:** Always return structured error objects with an error code and a safe user-facing message. Never leak stack traces to client responses.
4. **Testing Invariant:** Every new endpoint or bugfix requires a corresponding unit or integration test before marking the task complete.

---

## 🔗 Context Inclusions & References

- Check schema references before editing DB queries: `@src/db/schema.ts`
- API design guidelines: `@[API Guidelines](docs/api-standards.md)` *(the `@[label](path)` syntax inlines file contents automatically)*

---

## 💡 Quick Tips for Beginners

- **Always Active:** `AGENTS.md` files at the project root apply to the entire repository and require no YAML frontmatter.
- **Directory Scoping:** Subdirectories can have their own `AGENTS.md` (e.g., `src/billing/AGENTS.md`), which are automatically loaded when the agent works in that directory.
- **Budgeting:** Antigravity provides a 20,000-token aggregate rules budget. Keep root memory concise and focused on project-wide invariants.
