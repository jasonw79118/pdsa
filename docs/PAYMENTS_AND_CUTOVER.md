# Payment processing, two merchant accounts, and season-boundary cutover

**Status:** Product requirements, NOT implemented in static demo. Do not accept payments through GitHub Pages. **Current product direction:** build a standalone PDSA replacement; do not integrate or route families through Crossbar, and do not modify the live PDSA website. Historical payment information is optional and may be imported only from an explicitly authorized source. Preserve paid status and prevent duplicate charges.

## Confirmed decisions

1. PDSA registration, family accounts, and payments in the replacement are PDSA-owned workflows. Do not build Crossbar sign-in, registration, schedule, messaging, or live-sync dependencies into the new product. Launch only after PDSA approval and successful end-to-end tests. Never run duplicate checkout for the same PDSA season/program.
2. Techform operates **its own registration and payment process** within the same family-facing platform. Its independently owned merchant account and bank settlement remain separate from PDSA. Techform controls Techform pricing, refunds and reporting; PDSA controls its own.
3. One verified household login and combined family calendar; **separate organization-scoped registrations, payments, receipts, refunds, financial access and administrator roles**. Shared login is not shared financial permissions.
4. Use processor-hosted checkout (recommended evaluation: two distinct Stripe accounts) and server-created checkout sessions. Do not collect, store, log, or expose raw card data. Fees and provider availability must be confirmed with actual accounts.
5. PDSA determines how historical charges, refunds, disputes, and records are retained outside this project. Never represent an imported legacy payment as a new processor charge.

## Target user experience

- Parent signs in once, sees each child and a choice of PDSA league registration or Techform training enrollment.
- The program is owned by an organization server-side: `program.organization_id` determines merchant account, currency, amount, discount rules and receipt issuer. Client cannot select a merchant ID or price.
- Checkout clearly displays **merchant organization**, line items, discounts, service/processing fees if charged to parents (after legal review), total and waiver/consent status.
- PDSA and Techform checkout experiences are separate transactions even when viewed from one family dashboard. Show both receipts in an organization-labeled payment history.
- On return from hosted checkout, show 'processing' until a **verified signed webhook** confirms payment; redirects/success pages alone cannot mark a registration paid. ACH may remain pending for days.
- Registration record may be created before payment, then progresses through state machine: `draft -> submitted -> payment_pending -> paid | failed | waived | refunded | partially_refunded | disputed`. Exact labels and downstream eligibility policy must be board-approved. Do not drop pending registrants from evaluation tracking; restrict evaluation/team eligibility as policy requires.
- Duplicate click/retry must never create multiple purchases or duplicate roster/evaluation entries. Use idempotency keys, uniqueness constraints, transactional updates and webhook event deduplication.
- Where lawfully authorized historical payment evidence is supplied, show the registration as previously paid with source and reconciliation status. Do **not** solicit repayment.

## Payment service architecture

Recommended starter: two independent Stripe merchant accounts controlled by each organization. Prefer a backend with discrete per-organization Stripe configuration (secrets in managed secret storage) over a platform-wide shared merchant. Consider Stripe Connect only if the organizations approve the extra legal/onboarding/fee model; it is not required for the prototype.

- `organizations`: PDSA, Techform; merchant account reference and activation state stored securely.
- `programs`: owner organization, fee schedule, capacity and season.
- `registrations`: stable ID, guardian, player, program, organization, state, waiver version, source.
- `orders`: immutable server-priced snapshot, total, currency, owning organization, source.
- `payment_attempts`: payment provider, **source merchant**, provider checkout/payment IDs, status, amount, currency, idempotency key, timestamps.
- `payment_events`: unique provider event ID and account, verified event type, processed timestamp, failure reason, audit trail.
- `refunds`: references to **original payment provider/account**, authorization, reason, state, amount.
- `financial_adjustments`: scholarship/waiver/discount approvals and offline payment references.
- `legacy_imports`/`import_mappings`: optional authorized prior-system registration/transaction reference, signed-off reconciliation notes and original source; payment data imported as historical evidence only.

### Stripe integration readiness

`src/stripe-gateway.cjs` is a server-only adapter boundary with injected Stripe clients. Its contract tests use fake clients and make no processor calls. It creates hosted Checkout Sessions from an already-authorized, server-priced order, routes by the order's organization, passes an idempotency key, and verifies webhook signatures against the exact raw request bytes. It is **not** wired to an HTTP server, database, authentication, or a real Stripe account; no payment can be taken by this prototype.

When accounts are available, the implementation sequence is:

1. Confirm the legal merchant and settlement account for PDSA and Techform independently; create separate Stripe accounts and use test mode first.
2. Add the official Stripe server SDK to the backend runtime (not the static browser app). Inject one client per organization from managed server secrets; never accept a secret, account ID, amount, or organization owner from the browser as authority.
3. Add authenticated checkout and webhook endpoints to the selected server runtime. Resolve registration/program ownership and price from Neon in a transaction; create a unique payment attempt before requesting checkout. Validate return URLs against `PUBLIC_APP_ORIGIN`.
4. Configure a distinct webhook endpoint/secret per merchant. Preserve raw request bytes for signature verification; persist unique `(merchant, event_id)` records and apply transitions transactionally. Verify order, organization, amount, currency, and session/payment-intent references before marking paid.
5. Exercise Stripe test cards and asynchronous payment methods, retries, duplicate/out-of-order webhooks, refunds, and organization-denial cases. Reconcile test-mode events to both merchant accounts.
6. Only after board/treasurer approval, security review, production webhook verification, and operational runbooks, provision production keys in a secret manager and deliberately enable live mode. Never put real keys in `.env.example`, repository files, GitHub Pages, or logs.

The `.env.example` lists names only. Use separate managed secret values for each organization. Do not create Stripe accounts or enable a live mode until the account owners provide and approve them.

All payment-related database reads require verified household ownership or specific organization finance permissions. A PDSA treasurer cannot read Techform transaction details; a Techform administrator cannot access PDSA merchant settings. Platform operators have no default permission to initiate refunds. Enforce with DB-level RLS and server-side authorization.

## Hosted checkout workflow

1. Authenticated guardian chooses an eligible PDSA or Techform program; server verifies organization, player relationship, season state, pricing, discounts, consent and capacity.
2. Backend creates/gets a pending order and a hosted checkout session under **that program's merchant account**. Save mapping in the database, using provider-independent internal IDs and idempotency keys.
3. Payment provider receives card/bank info; PDSA/Techform application never does. Confirm merchant label/branding and receipt behavior for both.
4. Payment provider calls authenticated HTTPS webhook. Verify raw-body signature and *merchant context*; handle out-of-order/duplicate events. Update attempt and registration state transactionally; enqueue evaluation sync and confirmation via outbox only when applicable.
5. Refunds/partial refunds/disputes map to original processor; do not create negative duplicate registrations. ACH delayed, failed or returned payment cases require explicit policies.
6. Treasurer sees settlement reconciliation, fees, payouts, offline payments, waivers, audit and CSV reporting **only for their organization**.

## Standalone replacement launch and optional history

**New platform:** Build and test the complete PDSA-owned account, enrollment, schedule, team, communication, and payment workflows as an independent product. The product must not require Crossbar credentials or direct families to a Crossbar workflow. Do not touch the live PDSA website.

**Optional historical import:** only if PDSA supplies a lawful, authorized export and explicitly approves the mapping. Determine field coverage (guardians, players, divisions, payment evidence, waivers, team assignments, active volunteer/coach/referee status); verify file format, field meaning, consent, and retention. Do not presume API availability or automate login/scraping. Test in secure staging, never the GitHub demo. If no authorized export is available, do not import legacy records.

**Reconciliation:** compare unique guardians, players, program registrations, seasons, paid/waived/unpaid counts, refunds, total payment amounts and processor references. Flag missing waivers, unmatched children, ambiguous guardians, outstanding balances and refunds for human review. Re-running imports must be idempotent.

**Trial:** run fictional and permitted test accounts end-to-end (registration -> hosted test payment -> verified webhook -> evaluation roster -> eligibility -> team builder -> schedule -> coach/guardian communications; separately Techform enroll/payment/refund). Include negative cases, retries and data permissions.

**Go-live:** board and treasurer give written go/no-go approval before opening the new PDSA registration season. Set a single source of truth and clear family instructions. Any separately approved import must be reconciled before launch. Rollback must avoid duplicate registrations or charging anyone twice.

**Post launch:** monitor payments, failures, registration reconciliation, support tickets, receipt delivery, refunds, and webhook lag. Retain any legacy record only according to PDSA policy and applicable obligations; this application does not depend on access to the old system.

## Production acceptance tests (must pass)

1. Any approved prior paid registration displays paid / zero due, with legacy provenance; cannot trigger another charge.
2. PDSA test program routes money through PDSA sandbox merchant; Techform test program routes through Techform sandbox merchant; separate receipts and reporting.
3. Attempt to change merchant account or price in request is ignored/rejected server-side.
4. Parent can enroll same child in independent programs; guardian sees both but administrators see only own organization.
5. Duplicate button press, webhook resend, delayed ACH completion or webhook reordering creates exactly one registration/evaluation record and one paid order.
6. Failed checkout, partial refund, full refund, chargeback, scholarship, offline payment and open balance are handled without false 'paid' statuses.
7. If PDSA authorizes a legacy CSV import, importing it twice creates no duplicates; totals/counts are reconciled and mismatches are flagged for board review.
8. Coach cannot see financial account details, other teams, other guardians or their unassigned participants.
9. Cutover checklist confirms no parallel active PDSA checkout for the same season/program and includes a tested rollback process.
10. Techform does not need PDSA board approval to take payment for its own programs, **but** still needs PDSA board approval before publishing promotional content through PDSA communication channels.

## Free demo limitations and decisions needed

The supplied static demo has **no payment checkout, Stripe tokens, authenticated webhooks or secure database**. Agent may build a **fictional payment status/checkout preview** but must never advertise it as functional payment processing. Obtain organizational authorization before accessing merchant accounts, any legacy export, or actual family data. No live Crossbar or current-site access is assumed or requested.

Board decisions needed: exact next opening date, renewal/cancellation requirements, refund owner and policy, guardian/consent rules, payment plans or pay-in-full, waiver and scholarship workflow, merchant legal entities, fees allocation, accounting export requirements, historical retention, and who authorizes processor credentials and production launch.
