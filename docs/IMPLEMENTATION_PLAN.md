# Phased implementation plan

This plan extends the existing fictional, static demo; it does not replace or make it production-secure. Keep the no-build GitHub Pages demo, its purple light/dark themes, role-switch walkthrough, and all existing simulated interactions available throughout delivery.

## Phase 0 — Baseline and safe prototype (now)

- Preserve `index.html`, `styles.css`, and `app.js`; retain fictional-only localStorage and make no live integrations.
- Record the existing smoke-test baseline and add isolated payment-domain tests using a fake provider.
- Define organization ownership, authorization boundaries, payment states, and season cutover before selecting production vendors.
- Exit: demo smoke suite and mock payment suite pass; no secrets, actual family data, processor account, or real charge.

## Phase 1 — Backend foundation and authorization

- Use the linked Neon Postgres project for synthetic-data development. Neon Managed Auth is enabled and the family login client is wired for adult sign-up/sign-in. See [`FREE_BACKEND_PLAN.md`](FREE_BACKEND_PLAN.md); authentication does not grant access to family/player data until authorization APIs and tests are implemented.
- Preserve account-first registration: verified adult account → guardian profile → multiple linked player records → per-player emergency/consent details → enrollment in an open program.
- Model PDSA games and practices in shared calendar events; model referee availability and game assignments separately with referee-only assignment access.

- Choose and document hosting, database, identity provider, data-controller agreements, and incident/retention responsibilities with both organizations.
- Implement verified adult identity, guardian verification/consent, active organization memberships, capability grants, scoped team/session assignments, MFA for privileged staff, and revocation.
- Build PostgreSQL migrations with immutable organization ownership, restrictive foreign keys, RLS, server-side authorization, audit events, and transactional outbox/idempotency support.
- Add direct database/API negative tests: cross-org access, unrelated guardian/child, unassigned or revoked coach, forged IDs, and finance-role separation.
- Exit: reviewed threat model and authorization tests pass before importing real records.

## Phase 2 — Independent registration and payment foundation

- Add separate PDSA and Techform programs, registrations, server-priced order snapshots, merchant configuration references, payment attempts/events, refunds, and historical-import references.
- Resolve merchant, price, currency, and eligibility from persisted program ownership; reject client-supplied overrides. Store secrets only in server-side managed secret storage.
- Implement hosted-checkout and webhook provider interfaces; begin with deterministic fake adapters and signed-event test fixtures. Keep real credentials/integrations disabled.
- Ensure legacy Crossbar-paid records are historical evidence with zero due and cannot create a new order. Add uniqueness/idempotency constraints and reconciliation reports.
- Exit: payment workflow tests pass, authorization review passes, and mock integration cannot contact a payment provider.

## Phase 3 — Registration/evaluation and organization workflows

- Implement guardian-aware registration, consent, capacity/waitlists, idempotent evaluation-roster creation, controlled scoring, and human-approved team placement.
- Build distinct PDSA league and Techform academy administration. A unified family portal may show each organization's own enrollment/receipt without granting cross-org staff or finance access.
- Add scoped exports and audited, authorized imports only after written approval; no scraping or credential transfer from Crossbar.
- Exit: end-to-end fictional/test-tenant workflows and regression tests pass.

## Phase 4 — Communications, scheduling, and safety

- Implement server-resolved recipient audiences, consent/preferences, durable outbox, delivery state, and safeguarding rules; fake providers only until separately authorized.
- Implement versioned Techform promotion requests; PDSA publishing requires approval for the exact revision, audience, and channel.
- Add scheduling, staff/volunteer/referee scopes, and fail-safe field restrictions; no simulated feed is represented as authoritative.
- Exit: authorization, approval-revision, retry, and outage/fail-closed tests pass.

## Phase 5 — Authorized pilot and season-boundary cutover

- Obtain written governance, legal, privacy, processor, and board/treasurer approvals. Validate production controls, accessibility, backups/restore, security scans, support, and operating costs.
- Deliver the PDSA-owned family account, registration, schedule, team communications, and payment workflows as one replacement experience. Do not build Crossbar sign-in, registration, schedule, or messaging dependencies into it. Preserve paid status and prevent duplicate charges; only consider historical imports from a PDSA-authorized export, with reconciliation and explicit approval.
- Reconcile only approved lawful exports in a protected staging environment. Conduct a rollback rehearsal and obtain explicit go/no-go approval.
- Enable PDSA replacement checkout only at the next approved registration opening, with no concurrent checkout for the same program/cycle. Techform checkout remains independently owned and separately settled.
- Exit: board-approved cutover checklist, reconciliation sign-off, monitoring, and tested rollback; otherwise remain in demo/test mode.

## Decisions and authorization gates

Still required: organization/data-controller agreements; next PDSA opening date; legal merchant entities and separate accounts; fee/refund/ACH/scholarship policies; retention and reconciliation rules; approved production hosting and identity provider; named approvers and credential custodians. No real accounts, exports, child records, messages, or payment acceptance before the relevant written authorization.
