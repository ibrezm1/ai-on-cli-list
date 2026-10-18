# Directory Memory: src/billing/AGENTS.md

> [!NOTE]
> This file contains **directory-scoped rules**. Antigravity automatically detects and loads these rules whenever the agent reads, creates, or edits files inside `src/billing/` or its subdirectories.

---

## 💳 Billing Domain Invariants

1. **Integer Cents Only:**
   - All balance, charge, refund, and fee calculations **MUST** use integer cents (`amountInCents: number`).
   - Never perform floating-point arithmetic on currency values.

2. **Idempotency Keys:**
   - All payment mutations and charges must accept and validate an `Idempotency-Key` HTTP header.
   - Repeated requests with identical keys must return the cached transaction response without re-charging.

3. **PCI-DSS & Sensitive Data Redaction:**
   - **NEVER** log raw Credit Card numbers (PAN), CVV/CVC codes, or banking PINs.
   - Only truncated card numbers (last 4 digits) and card brand tokens may be stored or logged.

4. **Audit Trail:**
   - Every ledger entry must be append-only.
   - Never update or delete rows in the `ledger_transactions` table; issue reversal entries instead.

---

## 🧪 Testing Commands for Billing

- Run billing test suite: `npm test -- src/billing`
- Run Stripe webhook mock test: `npm test -- src/billing/webhook.test.ts`
