---
applyTo: "src/api/**/*.ts,src/routes/**/*.ts"
---
# API Design Standards

## REST Conventions
- Use plural nouns: `/users`, `/posts`, `/comments`
- HTTP verbs: GET (list/read), POST (create), PATCH (partial update), PUT (replace), DELETE
- Nested resources: `/users/:userId/posts`
- Version in URL: `/api/v1/users`

## Request/Response
- Request bodies: camelCase JSON
- Response bodies: camelCase JSON with consistent envelope
```json
{ "data": {}, "meta": {}, "errors": [] }
```
- Use RFC 7807 Problem Details for errors

## Validation
- Validate all inputs with Zod schemas
- Reject unknown properties (`strict()`)
- Return 400 with field-level errors

## Auth & Security
- Require auth on all endpoints except public health/check
- Use JWT in Authorization header: `Bearer <token>`
- Rate limit: 100 req/min per IP, 1000 req/min per user
- Sanitize outputs; prevent XSS/Injection

## Pagination
- Cursor-based: `?cursor=abc&limit=20`
- Return `nextCursor` in meta
- Max limit: 100

## Documentation
- OpenAPI 3.1 spec in `docs/openapi.yaml`
- Generate from code with `@anatine/zod-openapi`