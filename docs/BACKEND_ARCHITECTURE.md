# Production backend architecture (proposed, not implemented)

## Approach

- Frontend: React + TypeScript + Vite (or similarly maintainable). Keep GitHub Pages only for free public/demo deployment; for authenticated production, use HTTPS hosting and a dedicated backend.
- Database: Neon Postgres (requested). Use reviewed migrations, least-privilege server access, backups/restore, and application authorization. Neon Postgres alone does not provide identity/login.
- Auth: verified adult accounts, guardian links, admin MFA, session revoke, password recovery, scoped service accounts. Never create coach/admin rights by user-chosen dropdown.
- Services: thin REST/RPC APIs with server-side schema validation and authorization, scheduled jobs, notification outbox and source-specific weather adapters.
- Payments: server-only Stripe adapter boundary in `src/stripe-gateway.cjs`; not wired to a runtime or account. Checkout must be authenticated and server-priced, with separate merchant clients and webhook secrets per organization. See [`PAYMENTS_AND_CUTOVER.md`](PAYMENTS_AND_CUTOVER.md).
- Data: IDs are UUIDs, timestamps are UTC `timestamptz`, events display in `America/Chicago`. Mutations record `actor_user_id`, `organization_id`, `event_revision`, `created_at`, `updated_at` and audit events.
- State: server DB is authoritative. Scheduled and asynchronous integrations must be idempotent and retryable with dead-letter queues, dashboards, alerts and a service status page.

Neon Postgres and Managed Auth are now provisioned on the linked PDSA production branch. The login UI uses Neon Auth for adult identities and sessions. This is not a complete or audited backend: household/guardian relationships, authorization APIs, RLS policies, family records, and protected application routes still need implementation and security testing. The static demo is never an authorization boundary.

For the account-first family flow, authenticate the adult first and link multiple player records to that adult's verified guardian account. Each player needs a distinct emergency contact and consent record; keep allergies/safety notes out of ordinary coach/referee roster views. Model games and practices as organization-owned calendar events and referee assignments as specific referee-to-game links. See [`FREE_BACKEND_PLAN.md`](FREE_BACKEND_PLAN.md) for free-tier restrictions and setup status. No hosted backend is provisioned yet.

## Suggested tables and key fields

**Identity and organizations**
- `organizations(id, slug, name, branding, public_social_url, active)`
- `accounts(id, auth_user_id, email, notification_preferences)` — minimize PII
- `organization_memberships(id, organization_id, account_id, role, state, starts_at, ends_at)`
- `permission_grants(id, membership_id, permission_code, scope_type, scope_id, approved_by, expires_at)`
- `guardianship(id, player_id, account_id, verified_at, consent_scope)`

**League, academy, personnel**
- `seasons`, `age_divisions`, `programs`, `teams`, `team_staff_assignments`, `training_session_staff`
- `players` with privately secured data and retention plan
- `registrations(id, organization_id, program_id, season_id, player_id, guardian_id, status, waiver_version, payment_state)`
- `evaluation_roster(id, registration_id UNIQUE, season_id, rubric_version_id, status)`
- `evaluation_entries(id, roster_id, evaluator_id, rubric_item_id, numeric_score, note, created_at)`
- `rubrics`, `rubric_items` (weights and appropriate age division)
- `team_assignments(id, team_id, registration_id, state, effective_from, published_at)`
- `personnel_roles(id, membership_id, kind, team_id, division_id, term_start, term_end)`
- `eligibility_checks(id, membership_id, check_type, status, expires_on, provider_reference)` — avoid raw reports
- `volunteer_shift`, `volunteer_signup`, `volunteer_hours`, `referee_certifications`, `referee_availability`, `referee_assignment`

**Schedules, communications, cross-organization promotions**
- `facilities`, `fields`, `facility_coverage`, `calendar_events` (owner org, time, field, status, privacy, revision)
- `event_participation` (team, cohort or assignment links)
- `announcements(id, owner_organization_id, content_version, visibility, state)`
- `promotion_requests(id, source_org_id, target_org_id, source_announcement_id, content_hash, audience_policy, channels, state, expires_at)`
- `promotion_approvals(id, request_id, approver_id, approved_content_hash, approved_channels, approved_audience, approved_at)`
- `audience_definitions`, `message_templates`, `message_drafts`, `notification_outbox`, `notification_delivery`
- `social_page_connections`, `social_publish_jobs` — encrypted tokens stored in restricted server secrets, not in table dumps

**Weather and governance**
- `weather_sources(id, kind, source_provider, coverage_id, authentication_config_ref, enabled)`
- `weather_observations(id, source_id, issued_at, received_at, payload_hash, severity, valid_until)`
- `field_restrictions(id, coverage_id, type, severity, starts_at, cleared_source_at, authorized_clearance_by, state, policy_version)`
- `event_safety_impacts(id, event_id, restriction_id, state, notified_at)`
- `safety_decisions(id, restriction_id, actor_id, decision, source_ref, rationale, created_at)`
- `policy_versions`, `audit_events`, `integration_jobs`, `integration_failures`

**Payments (separate organization ownership)**
- `merchant_configs(organization_id UNIQUE, provider, account_ref, activation_state, secret_ref)` stores only a non-secret account reference and managed-secret reference; actual credentials exist only in a server secret manager.
- `orders(id, organization_id, program_id, registration_id, amount_minor, currency, price_revision, state, source)` captures a server-priced immutable amount/currency/owner snapshot. `program_id` and `organization_id` must be a consistent FK/constraint.
- `payment_attempts(id, order_id, organization_id, merchant_ref, idempotency_key, provider_session_ref, status)`; unique idempotency key in the relevant merchant/order scope.
- `payment_events(provider, merchant_ref, provider_event_id UNIQUE, event_type, verified_at, processed_at, outcome)` deduplicates verified events and retains an audit trail without card/bank credentials.
- `refunds(id, original_attempt_id, organization_id, amount_minor, state, authorized_by)` always refers to the original merchant/payment. `legacy_payment_evidence` stores permitted Crossbar references as historical evidence, never as a new processor charge.
- Registration/order/payment/refund reads use guardian ownership OR an active, explicit organization finance grant. PDSA finance permissions never imply Techform access, and vice versa; coaching grants confer no financial permissions.

## Key state machines

`registration`: DRAFT → SUBMITTED → VERIFIED/WAITLISTED/REJECTED → EVALUATION_READY → TEAM_ASSIGNED → PUBLISHED → ARCHIVED.

`evaluation`: PENDING → IN_PROGRESS → SUBMITTED → REVIEWED → LOCKED; score correction requires audit/version.

`cross_promotion`: DRAFT → SUBMITTED → PENDING_APPROVAL → APPROVED / CHANGES_REQUESTED / REJECTED → SCHEDULED → PUBLISHED → EXPIRED / REVOKED. Any substantive content mutation after APPROVED returns to PENDING_APPROVAL with new hash.

`restriction`: NO_VERIFIED_RESTRICTION → WARNING → SUSPENDED → HOLD_FOR_VERIFICATION → CLEARED_WITH_AUTHORIZATION. Unknown/stale inputs are `UNVERIFIED`, not `CLEARED`.

## Event-driven transitions

**Registration created**
1. Validate season, age eligibility, program, guardian rights and consent.
2. In a database transaction, insert registration and upsert (`registration_id`, `season_id`, `rubric_version_id`) evaluation roster entry.
3. Append audit event and outbox job for staff notifications. Job retry must not create a duplicate row.
4. If the registration is cancelled, update roster status according to policy without deleting history.

**Message send**
1. Auth check based on actor and stored recipient scope. Determine eligible recipients on server.
2. Save immutable draft revision and approval (if required).
3. Enqueue per-recipient channel jobs with idempotency keys; do not reveal other families' email addresses in headers.
4. Observe subscription/consent, safeguarding rules, delivery errors, retry/backoff, and log minimal delivery metadata.

**Safety restriction**
1. Ingest trusted event + signature/source validation or authenticated human action.
2. Resolve coverage → impacted facilities/fields → intersecting games/practices/Techform sessions.
3. Transactionally create/update restriction + safety impact + urgent outbox messages.
4. Suspend affected sessions promptly, trigger staff review, manage allowed postponement/abandonment according to policy.
5. Do not clear automatically on loss of source, provider retry, or expiry unless official policy and authoritative evidence explicitly support it; retain designated safety officer authorization.

## Authorization implementation

- Do not trust `organization_id`, `team_id` or `role` in HTTP request body as proof of access. Resolve roles from verified session and DB grants.
- RLS should combine verified org membership, specific resource assignment and action permission. Use security-definer functions carefully, with explicit search paths and reviewed ownership.
- Protect exports, file downloads, public profile/search endpoints and background workers as carefully as ordinary CRUD.
- Resolve the program from a verified registration and derive organization, price, currency, and merchant exclusively on the server. Reject client merchant/account/amount overrides. Never let the frontend call a processor with privileged credentials.
- Webhook handlers verify the provider signature against the raw request body and validate the provider account/merchant against the stored attempt before transactional state changes. Persist unique event IDs, tolerate retries/out-of-order events, and enqueue downstream work through a transactional outbox.
- A hosted-checkout redirect is informational only; only a verified webhook can mark an order paid. Pending ACH remains pending until its terminal verified event. Refunds are authorized per organization and routed to the original merchant.
- Crossbar-paid current-cycle registrations are locked historical evidence with zero new balance; checkout creation must refuse them. The new PDSA checkout is feature-gated to the next board-approved registration opening, never dual-enabled for one program/cycle. Techform has its own independent enrollment, merchant, settlement, finance roles, and receipts.
- Include DB unit tests that directly query under simulated JWT/user contexts, plus API integration tests. Negative tests are mandatory. See `ACCESS_MATRIX.md`.
- Platform service accounts get tightly scoped functions, not unlimited client access. Admin MFA and production access logs required.

## Audit examples

Store actor, affected organization, action, resource id, timestamp, before/after version hashes, request id and reason. Log: role grants/removals, consent modifications, registrations, evaluation scoring/corrections, roster publication, schedule edits, messages and audience, approval/withdrawal, safety restrictions and clearance, social publication and integration failures.

## Operations and privacy

- Data retention periods and export/delete procedures approved by board/legal counsel; minimize children's data, photos and medical details.
- Backups plus tested restoration, separate development/staging/prod environments, disaster/incident runbook, dependency vulnerability scans, error alerts.
- HTTPS, secure cookies and CSRF rules if cookie auth, reasonable rate limits, input validation, content security policies, webhook verification, integrity checks.
- Payment processor should tokenize/handle card details: never place card numbers in app DB.
- Crossbar migration only after board authorization, legal export, field mapping, data cleanup, test import and member communications. Plan season-boundary cutover.
