# Technical architecture / staged plan

## Demo (included)

`index.html` + `styles.css` + `app.js` → runs as static site on GitHub Pages, no dependencies. Fictional data in localStorage. Useful for stakeholder walkthroughs. **No true database, authorization or system integration.**

## Production candidate (proposed, not built)

```
Browsers / Mobile PWA
  │ HTTPS + verified auth
  ▼
React + TypeScript frontend (org-scoped UI)
  │
  ▼
API / backend service + policy checks
   ├── Neon PostgreSQL / reviewed migrations and server-side authorization
  ├── Jobs + durable event outbox + audit trail
  ├── Registration / evaluation / teams / people
  ├── Scheduler / field restrictions / notifications
  └── Integration adapters
         ├── Google Sheets (server-side authorized sync)
         ├── NWS/weather provider (forecast and public alerts)
         ├── City-approved lightning feed (official restriction source)
         ├── Meta Graph API (approved page posts only)
         ├── Email / push / opted-in SMS
         └── Payment processor (hosted checkout + verified webhooks)
```

## Core entities

- `organizations(id, slug, name, governance_settings)` — PDSA, Techform; immutable owner/tenant key on org-owned records.
- `accounts(id, auth_subject)` / `people(id, contact_meta)` / `guardian_links(guardian_id, child_id, verified_at, consent_status)`.
- `org_memberships(account_id, org_id, role, status, start_at, end_at)` with scoped `grants` per capability/team/division/program.
- `seasons`, `divisions`, `programs`, `teams`, `team_coach_assignments`, `team_player_assignments`.
- `registrations` and `registration_requirements`, `waiver_consents`, `payment_status`, `import_mappings`.
- `evaluation_rubrics`, `evaluator_assignments`, `evaluation_scores`, `evaluation_batches`, `team_proposals`, `placement_decisions`.
- `personnel_roles`, `credentials`, `volunteer_shifts`, `referee_availability`, `referee_assignments`.
- `venues`, `fields`, `events`, `event_participants`, `schedule_changes`.
- `message_drafts`, `audience_queries`, `dispatch_jobs`, `notification_delivery_attempts`, `notification_preferences`.
- `promotion_requests`, `promotion_versions`, `approvals`, `published_posts`.
- `forecast_snapshots`, `external_alerts`, `field_restrictions`, `safety_decisions`, `integration_health`.
- `audit_events`, `outbox_events`, `idempotency_keys`.

Use UUIDs, timestamps with timezone, strict FK links, version columns for concurrency, unique constraints for season/program/individual duplicates as policy allows, soft delete/retention only when appropriate. Explicit child data protection and scoped views (e.g., minimal roster for coaches).

## Authorization sketch (must be implemented at DB/API layer)

- Determine `auth.uid()` (verified auth) and current active membership(s) on every request.
- A coach reads a team roster only if an active `team_coach_assignments` record relates them to that **same team** and applicable season.
- Coach sends team communications only if recipient set is computed via *active team registrations + verified guardians*, never by submitting arbitrary email addresses or modifying a team ID.
- Techform-owned data has `org_id = Techform`; PDSA grants do not cross organizations. Platform administrators have narrowly scoped support duties, not unrestricted data read.
- PDSA promotions require a server-created board approval record for exact published revision/audience/channel combination.
- Safety source permissions differ from general publishers. A municipality-authorized restriction wins over local scheduling preferences.

## Reliable event flows

1. `registration.created` → update evaluation eligibility/read model → enqueue optional restricted Google Sheet sync. Retry idempotently by `(registration_id, destination, revision)`; never create duplicate rows.
2. `evaluation.completed` → flag assignment candidate; don't publish team automatically.
3. `event.rescheduled` → determine scoped recipients → enqueue deduplicated messages.
4. `promotion.approved` → queue approved version only → publish and record provider result.
5. `field.restriction.activated` → find intersecting venue/field/time events → hold applicable activities → high-priority notices with source/timestamp.
6. `field.restriction.ended` → pending human safety clearance, no implicit return to play.

## Staged migration

**Phase 0**: Present static demo; agree governance, approval roles, safety authority, exact brands and sponsor needs.
**Phase 1**: Secure identity, org scopes, parent/child verification, people/credential directory, audit log.
**Phase 2**: Season registration + payment provider + evaluations + export and staff dashboards.
**Phase 3**: Rosters/coaches/referees/volunteers, schedules, notifications, board promotion approvals.
**Phase 4**: Provider integrations, safety operations, Facebook publishing, data imports and performance hardening.
**Phase 5**: Controlled PDSA-owned pilot with synthetic/authorized test accounts, security and accessibility review, documented rollback, then a PDSA go-live decision. Do not build a Crossbar integration or require its process as part of the new product.

## Hosting choices

GitHub Pages is perfect for static prototype but **not** enough for real data. Select a supported backend with backups, offsite disaster recovery, access logs and defined monthly cost. Keep production and demo environments completely separate. Never put secret keys in public repositories or browser assets.
