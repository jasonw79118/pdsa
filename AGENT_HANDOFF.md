# COPY/PASTE: VS Code coding agent handoff (updated)

You are working in the repository for an **unofficial, fictional, GitHub Pages-ready board demo** of the Palo Duro Soccer Association (PDSA) + Techform Canyon unified soccer platform.

**Read in order:** `AGENTS.md`, `README.md`, `docs/PAYMENTS_AND_CUTOVER.md`, `docs/SECURITY.md`, `docs/ACCESS_MATRIX.md`, `docs/ARCHITECTURE.md`, `docs/AGENT_START_PROMPT.md`, then other `docs/` files.

## Required outcome

Keep the existing free browser prototype usable for demonstrations while designing a secure, scalable production replacement for Crossbar. Preserve both purple light and dark themes. One family login must support two separately administered organizations: PDSA (league/board/coaches/volunteers/referees) and Techform (academy/training/coaches/staff).

**Critical NEW business decisions:**
- **Finish the current PDSA registration and payment cycle entirely in Crossbar.** The new PDSA checkout starts only at the **next registration opening**, after board sign-off. Existing Crossbar-paid families must not register or pay a second time. Do not run duplicate PDSA checkout for the same program and cycle.
- **Techform handles its own money independently.** Design a separate Techform registration and hosted checkout linked to Techform's own merchant account and bank, plus a separate PDSA account and treasurer dashboard. A parent can see both in one family portal without cross-organization financial visibility. Evaluate two independent Stripe accounts first; Stripe Connect is optional, not a prerequisite.
- One unified underlying database with proper organization scoping; a **server-authorized program owner** determines which merchant account receives payments. Secure processor webhooks, payment idempotency, refund/ACH status, reconciliation and role-scoped reporting are required before production. No card data or secrets in frontend.
- Techform administers its own training and payment processing, **but Techform content advertised to PDSA audiences requires PDSA board approval** (including revisions and recorded approver/version).
- Assigned coaches can access **only their own teams' necessary records** and send messages only to guardians of those assigned players; this must be enforced in backend/RLS, not a visual-only filter. Track board members, coaches, volunteers and referees; scheduling, certification and targeted communications.
- Registration populates an evaluation roster automatically via idempotent event processing; human-controlled team placement; CSV/Sheets reporting; include weather forecasts and a **simulated-only** Canyon lightning safety dashboard until an authorized municipal feed is verified. Never auto-clear lightning holds on missing data.

## Start here

1. Inspect and run the shipped static demo and `npm test`; report what already works vs what is mocked and any failures. Do not discard its GitHub Pages path.
2. Draft the database/permissions design (org scoping, guardian relationships, team assignments, audit logs), then the payments/cutover design in `docs/PAYMENTS_AND_CUTOVER.md`. Explicitly differentiate PDSA and Techform merchants.
3. Implement in small stages with unit/integration tests. Set up a **mock payment provider first**; use Stripe test mode only with authorized sandbox credentials in server-side secret storage. Never process real money or add real children to the demo.
4. Test: two merchant routing paths; legacy Crossbar paid => no new charge; duplicate webhook/idempotency; refund/ACH states; team-only coach scope; Techform promotions approval; outage-safe field restriction behavior; permitted CSV migration reconciliation.
5. Provide a board-facing demo, run/deploy commands, test results, production-blocker list, authorized credential checklist, rollout/rollback plan and no-surprises operating cost estimate.

**Do not claim live registration, payments, Meta publishing, city lightning, notifications or secure authentication work in the current static demo.** Request explicit organization approvals before attaching any real services. The project docs are product requirements, not evidence of working integrations.
