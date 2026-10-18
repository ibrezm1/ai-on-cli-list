---
trigger: glob
globs: "*.ts, *.tsx, *.js, *.jsx"
description: "TypeScript and JavaScript coding conventions and lint rules."
---

# TypeScript & JavaScript Conventions

Apply these standards when writing or modifying code in matching files:

1. **Explicit Typing:**
   - Always declare explicit return types on exported functions and public API methods.
   - Avoid `any`. Use `unknown` with type narrowing or generic parameters instead.

2. **Immutable Data Operations:**
   - Prefer `const` over `let`. Never use `var`.
   - Prefer pure functions and spread operators or immutable updates over direct object mutations.

3. **Async / Await:**
   - Use `async` / `await` syntax over nested `.then()` promise chains.
   - Always wrap external network or I/O calls in `try...catch` blocks with meaningful error propagation.

4. **Imports:**
   - Group imports in order: Standard library -> Third-party packages -> Internal modules -> Relative paths.
