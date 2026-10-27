# Prioritized Build Plan & Acceptance Criteria

## Phase 0 — Board prototype (this ZIP)

**Already present:** responsive purple design/light-dark switch, role-specific demo dashboards, fictional registration/evaluations/CSV, tentative team builder, personnel, communications outbox, Techform approval, combined calendar, simulated weather status and reset.

**Agent next steps:** test interactions, resolve mobile/a11y issues, add modular components/tests, refine visual identity with PDSA-authorized assets, publish an explicitly labeled demo via GitHub Pages.

**Done when:** Board members can follow `README.md` walkthrough without developer assistance; no real data or secrets; no false live status; demo tested on laptop/phone; theme persists.

## Phase 1 — Backend foundation, auth and permissions

- Introduce organization model, auth, role grants, team links, verified guardian links, audit events.
- Implement all negative permission tests from `ACCESS_MATRIX.md` and automatic revocation for removed coaches.
- Add event/program/season schema and row-level security before importing any private data.
- Invite-only staff provisioning, MFA for admins, backups, logging and environment separation.

**Done when:** A Techform admin cannot access PDSA private records even via API/direct SQL, a coach cannot access a non-assigned team's roster by ID change, and board roles cannot bypass private data protections.

## Phase 2 — Real league workflows

- PDSA seasons, age division/rubrics; guardian consent; registration/eligibility/waitlist/payment status.
- Transactional registration→evaluation upsert with duplicate protection; scoring history and reviewer roles; authorized spreadsheet export.
- Team suggestion/approval/publish; team practice/calendar subscriptions.
- Personnel directory for board/coaches/assistant coaches/referees/volunteers, training and certification status.
- Techform programs, session staff assignments, separate program enrollment and communication.

**Done when:** All player records are protected, evaluation duplication tests pass, family portal shows only linked records, and no team placement or private report is unintentionally public.

## Phase 3 — Messaging, events, ref/volunteer operations

- Per-organization message composer, audience targeting, outbox, delivery/audit and preferences.
- Coach/team guardian-only communication with safeguarding policy.
- PDSA approval state machine and immutable content approvals for Techform cross-promotion.
- Referee availability/assignment workflows, volunteer shift signups and training notices, scheduling conflict detection.

**Done when:** Coach A's send cannot reach Coach B's team, Techform can't publish to PDSA without active approval, delivery retries don't duplicate messages.

## Phase 4 — Weather safety integration (external dependency)

- Connect NWS forecasts, alerts, provider timestamps, per-event location and forecast checkpoints.
- Contact City of Canyon to verify lightning detection hardware, read-only source, coverage/contract and warning semantics.
- Implement restriction state machine, affected-event matching, urgent targeted notices, source failure handling, official clearance authority and audit.

**Done when:** Simulated city alert at Brown Road correctly restricts only covered events and notifications, feed outage does not create all-clear, production is not switched live without city/board safety signoff.

## Phase 5 — Public Facebook, migration, scale/reliability

- First-party public posts, manual Facebook sharing. Later organization-specific approved Meta OAuth/API integration as allowed.
- Crossbar data export/map/validation and consent/contract review; pilot in parallel at season boundary only.
- CI, error observability, security testing, accessibility/performance audits, restore drills and load tests with realistic volume.
- Actual payment integration only after board approval and processor review.

**Done when:** Approved PDSA audiences/Pages cannot receive unapproved Techform content; no secrets in frontend; migration reconciles records and keeps rollback path.

## Priority queue for the coding agent

**P0**: auth/RLS/organization isolation, coach team-only access, child/guardian consent, audit, safety fail-closed behavior.

**P1**: registration-to-evaluation, scoring and CSV, personnel directory, targeted notification outbox, board-approved Techform promotions.

**P2**: referee/volunteer assignment tooling, multi-location calendar conflict checks, consented Facebook Page integration, advanced team-builder and comprehensive forecasting.

**P3**: advanced analytics, sponsor CMS, multilingual support, PWA/offline capability and optional provider integrations.

## Cost reminder

The static GitHub Pages prototype is free. Production hosting, email/SMS, payment transactions, some weather/lightning data, Meta review and maintenance can incur fees. Verify up-to-date vendor terms and available nonprofit pricing before making board promises.
