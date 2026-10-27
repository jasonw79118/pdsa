# VS Code agent: implementation handoff

You are extending a **fictional, GitHub Pages-hostable soccer association prototype** into a well-structured production candidate. Read `README.md`, `docs/PAYMENTS_AND_CUTOVER.md`, `docs/PRODUCT_SPEC.md`, `docs/SECURITY.md`, `docs/ARCHITECTURE.md`, `docs/INTEGRATIONS.md` and `docs/ACCEPTANCE_TESTS.md` FIRST.

## Project purpose and priorities

Build a **single platform** serving two administratively independent organizations:
- **Palo Duro Soccer Association (PDSA)**: league, board, volunteer, coach, referee, team, game, practice, registration, evaluation, player assignment and safety operations.
- **Techform Canyon**: independently manages academy staff, participants, programs, training and its own internal messaging; proposed promotion into PDSA channels always needs an authorized PDSA board approval.
- **Families**: one account/dashboard, consent-aware communications and a unified events calendar; never grant cross-organization roster access merely because the user has one account.

Build **secure authorization first**, then registration/evaluation, then messaging and safety integrations. Avoid building flashy features on top of an insecure shared database.

## Immediate assignment suggested to coding agent

1. Run the existing static demo and verify it works. Do not remove the board-demo mode.
2. Refactor into a maintainable React + TypeScript + Vite + Tailwind app **only when requested**, preserving the demo's visual language, routes, usability, light/dark switch and existing interaction scenarios. Current no-build HTML/CSS/JS exists intentionally so a board can view it immediately.
3. Create a backend (suggest Supabase/Postgres with RLS + server-side services) with distinct tenant ownership, verified identity, server-authorized scopes, workflow audit log and integration workers. The supplied files are a specification, **not** a completed production backend.
4. Write schema migrations + automated tests for row-level permission boundaries before importing any real information.
5. Implement opt-in, guardian-aware messaging and approvals, with safety emergency exceptions governed by verified source and approved safety policies.
6. Add an administrative CSV import/export transition plan for Crossbar only if permitted, with duplicate detection and field mapping. Never scrape credentials, rosters or children from Crossbar.


## Signed-off business direction: payments and season transition

- Do **not** migrate or re-charge current PDSA Crossbar registrations. Finish the current registration/payment cycle in Crossbar and cut over to the new PDSA checkout at the **next registration opening**, only after a board/treasurer go-live decision. Preserve legacy paid status and audit references. Never operate both providers as concurrent checkout for the same PDSA registration program.
- Techform manages an **independent merchant account and bank settlement** (initial proposed path: two separate Stripe accounts). Shared family login does not imply shared revenue or financial-access rights. Server chooses merchant according to the program's organization ownership.
- Use hosted checkout, server-side pricing, verified signed webhooks, idempotent payments and refunds, payout reconciliation and proper handling for delayed ACH. Test the Crossbar CSV import and rollback process. Read **`docs/PAYMENTS_AND_CUTOVER.md`** for workflows, threat model and acceptance tests.
- No real payment integrations are present in the static demo; agent must never insert client-side Stripe secret keys or advertise simulated checkout as live.

## Hard constraints

- Do NOT claim demo role switching is secure authentication.
- Do NOT put private youth data or contact lists in GitHub Pages, static JS, localStorage, frontend logs, or public analytics.
- A coach can access **only** teams with a current verified assignment and can message **only** their linked guardian recipients. This must be enforced in database policies and APIs, not just by frontend filters.
- Techform must not access PDSA private rosters or contact parents via PDSA channels without explicit PDSA authorization and board-approved publication.
- Team placement decisions and publish actions are human-approved; evaluation scores are access-controlled.
- Unapproved, revised or expired Techform promotions cannot publish. Retain immutable submitted versions and audit records.
- Weather forecast != lightning detection. Never auto-resume play because an API stopped responding or a timer elapsed. Honor official field closure and manual verified clearance rules; fail safe.
- Never send real text/email/push/Meta posts from prototype controls. Use fake provider interfaces/tests.
- No hard-coded personal credentials, passwords, Facebook Page tokens, weather-provider secrets, or Supabase service role keys in frontend.
- Treat PDSA public colors as purple + white; exact brand values are **proposed**, verify with board. Techform brand identity is configurable.
- Use accessible inputs, responsive layouts and keyboard/screen reader labels, with high contrast in both themes.

## Architectural strategy

Prefer modular domain packages: identities/organizations, league/teams, registration, evaluations, staff/credentials, scheduling, approvals, notifications, safety, integrations, audit. One account can hold multiple organization-specific roles; each API operation resolves the scoped actor + organizational affiliation + specific team assignment. Support event outbox/idempotency keys for sends/sheet updates to avoid duplicates. See diagrams, entities, permissions and sample event names in the docs.

## Definition of done for production-phase work

- Verified identities and guardian relationships; tests for unauthorized coach-to-other-team access, unauthorized Techform access to league families, unauthorized board-member scope and revoked credentials.
- Working registrations without duplicates, evaluations with authorized scorers, Google Sheets export/sync by approved service account only, and audit history.
- Sender eligibility checks for each message; guardian consent/preferences, safety urgency classification and delivery logs.
- External integrations behind server adapters; clear unavailable/stale states; City of Canyon data access verified in writing before enabling.
- RLS/policy tests, secrets scanning, data retention and incident response procedures, accessibility review, deployment/rollback plan.

## Starter demo specific notes

`index.html`, `styles.css`, and `app.js` are intentionally dependency-free and fully static. Interactive state is browser-only `localStorage`. Reference artwork is in `assets/`. There is no actual connection to any third party. GitHub Pages works with no build step. Use the sample dataset only for screenshots/demos. Do not misrepresent it as actual PDSA counts, certification statuses, weather, or live registrations.
