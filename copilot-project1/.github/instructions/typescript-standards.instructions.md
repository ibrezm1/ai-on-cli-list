---
applyTo: "src/**/*.ts,tests/**/*.ts"
---
# TypeScript Coding Standards

## General
- Use TypeScript strict mode (`"strict": true` in tsconfig.json)
- Prefer `type` over `interface` for unions, intersections, and primitives
- Use `interface` for object shapes that may be extended
- Avoid `any` — use `unknown` and narrow with type guards
- Enable `noUncheckedIndexedAccess` for safer array/object access

## Naming
- PascalCase for types, interfaces, enums, classes
- camelCase for variables, functions, methods
- UPPER_SNAKE_CASE for constants
- Prefix boolean variables with `is`, `has`, `should`, `can`

## Patterns
- Prefer `const` over `let`; never use `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Prefer `Array.prototype.flatMap` over `map` + `flat`
- Use `Record<K, V>` for dictionaries, not `{ [key: string]: V }`

## Async
- Always `await` promises; avoid `.then()` chains
- Use `Promise.all` for parallel, `Promise.allSettled` for fire-and-forget
- Handle errors with `try/catch` — never leave promises unhandled

## Testing
- Test files: `*.test.ts` alongside source or in `tests/`
- Use `describe`/`it` from Vitest/Jest
- Mock external dependencies; test pure logic directly