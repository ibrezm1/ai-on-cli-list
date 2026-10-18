---
trigger: model_decision
description: "Apply when writing, reviewing, or modifying database migrations, table schemas, or SQL queries."
---

# Database Migration Guidelines

When writing or modifying database migrations and schemas, adhere to the following rules:

1. **Zero-Downtime Rule (Expand & Contract):**
   - Never drop or rename a table column in a single migration.
   - Use the two-phase expand-and-contract pattern:
     1. Add the new column/table (`expand`).
     2. Update the application to dual-write or read from the new structure.
     3. Remove the obsolete column in a subsequent release (`contract`).

2. **Index Creation:**
   - On PostgreSQL, always use `CREATE INDEX CONCURRENTLY` to avoid table locking in production.
   - On MySQL, verify online DDL algorithm (`ALGORITHM=INPLACE, LOCK=NONE`).

3. **Reversibility:**
   - Every migration script must include a verified `down` (rollback) step that restores the previous schema state without data loss.

4. **Default Values on Large Tables:**
   - Avoid adding non-null columns with non-constant defaults on massive tables without backfilling in batches.
