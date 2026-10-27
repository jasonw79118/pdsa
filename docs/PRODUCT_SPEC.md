# Product specification — PDSA × Techform soccer platform

## Product outcomes

- Replace disconnected league website/app experiences with a unified, family-friendly platform.
- Maintain separate organization ownership and administrative independence.
- Eliminate duplicated registration data entry and create dependable evaluation and team assignment workflows.
- Track PDSA board members, volunteers, coaches, assistants and referees through assignment, credential and training cycles.
- Deliver targeted, consent-aware communications and advertise Techform opportunities to PDSA only after board approval.
- Enforce field restrictions and notify affected groups based on authorized safety information, not guesswork.
- Support growth to new seasons, teams, facilities, training sessions and possibly other partner organizations.

## Public experience

Navigation: Home | Games & Calendar | Teams (public only) | Techform Training | Field Safety | Resources | Volunteer | Sign in. Prominent current registration status, contact, Brown Road field guide, and applicable news. Responsive light/dark mode (purple/white vs deep purple/black), system-preference fallback and persistent per-user theme once authenticated. Use accessible color contrast. Techform section can display its own logos/colors, with org-scoped content ownership.

## Roles and authorization

| Actor | Authorized capabilities (scope) | Forbidden without additional grant |
|---|---|---|
| Platform operator | Platform settings/organization onboarding, limited operational diagnostics; sensitive record access only via audited emergency path | Routine unrestricted youth record viewing |
| PDSA board approver | Review/publish PDSA channel submissions, board workflow within delegated committee authority | All player records by virtue of board title |
| PDSA registrar | PDSA enrollment, eligibility, payments status, season imports, evaluations administration as delegated | Techform private records |
| PDSA scheduler/safety officer | PDSA fields, schedules, official restrictions and safety notices per scope | Arbitrary access to player evaluations |
| PDSA referee coordinator | Referee qualifications/availability/assignments and targeted referee communications | Unrelated team contact lists |
| PDSA coach/assistant | Assigned teams' practice/game times, authorized roster fields and guardian communications | Other teams, other guardians, league-wide broadcast, detailed medical data by default |
| PDSA volunteer | Own upcoming duties/training and coordinator messages | Private rosters or full personnel directory |
| Referee | Own assignments/contacts for scheduling, training and availability | League rosters/other referee private details |
| Techform admin | Techform training, staff, program enrollment, own recipients; submit PDSA promotion | PDSA roster, evaluation data, contacts, direct PDSA-wide sends |
| Techform coach | Assigned Techform class participant subset as required for duties and approved guardian communication | PDSA team rosters or unrelated Techform participants |
| Parent/guardian | Verified linked children, their invoices/registrations, related schedules and message preferences | Unrelated minors' data |
| Public visitor | Published pages, open programs, approved announcements, public schedules only | Private personal records |

One person may have multiple roles. Role is always scoped to organization and optionally season, team, activity or training class. Revocation should take effect immediately and be logged.

## Registration → automatic evaluation → team formation

1. Guardian authenticates; confirms verified link to child, consents/waivers, season, eligible division and program. Handle incomplete/duplicate submissions before taking payment.
2. Server writes `registration` once and emits `registration.created` event with stable idempotency key. PDSA evaluation roster is a **database view or workflow table** automatically populated from registrations eligible for evaluation (specific statuses governed by league rules).
3. Evaluators assigned by season/division submit rubric scores, notes and identity/time attribution. Configure U6–U18 rubrics and whether evaluations apply to recreational vs competitive groups. Report multiple evaluators independently and aggregate according to board-approved policy. Restrict sensitive commentary.
4. Admin receives statuses: Submitted → Verification Needed → Eligible → Evaluation Scheduled → Evaluating → Ready for Team Assignment → Proposed → Approved → Notified. Payment eligibility may be a parallel workflow, not an implicit guarantee.
5. Spreadsheet: export to CSV/Excel; optional live Google Sheet as restricted admin-facing read model. Source of truth = server DB. Use idempotent sync, safe field escaping, schema versioning and reconciliation report. Never publish private sheets.
6. Balancing assistant creates **suggestions only**, honoring age/league policies, roster sizes, experience, conflicts and requests where applicable. Human approves and publishes only after review. Preserve placement explanations and override log.
7. Team membership, coach assignments and approved guardian relationship determine subsequent access to team information and communications.

## People/operations directory

Profiles include person ID, org-specific roles, designated assignments, onboarding state, verified volunteer/coaching/referee training, certificate dates/expiry, season history, shift/game hours and contact preferences. Sensitive screening: store eligibility/status and expiry metadata when permitted; do not unnecessarily store reports, scans, government IDs, or medical details. Board members have term/committee/delegation records; volunteers can sign up for shifts; referees track credentials, availability, assignments, accept/decline, coverage and completed games.

## Targeted communication

Audience is computed server-side using current authorized scope. Common messages: scheduled games, practices, changes, field closures, evaluations, league news, coach training, referee training, volunteer staffing and Techform player development. Channels: in-app/feed, email, push, optional opt-in SMS; approved public channels may optionally integrate Meta Pages. Separate message drafts, approvals, release time, delivery attempts, delivery receipt/error, cancellation and archive. Parents should receive minor-related team messaging as guardians; avoid unsupervised adult-to-minor private communication. Consent, quiet hours, opt-outs and emergency exceptions must follow approved policy and applicable law.

Coach restriction: team coach can choose **only assigned team guardian audiences**; team assignment must be active. Coordinator roles have delegated scope. A 'send to all' dropdown must not be a bypass.

## Techform → PDSA promotion approval workflow

- Techform creates its own program and publishes to Techform participants under Techform policy.
- Separate **PDSA promotion request** contains proposed content + CTA + audiences + channels + schedule + linked training event + version hash.
- Initial state `draft`; after submit `pending_board_review`; PDSA designated board reviewer can `approve`, `reject`, or `request_changes` with reasons.
- Approval applies only to the exact immutable version and specified channels, audiences and dates. Changes invalidate previous approval; expiration stops future posts.
- Approved item goes into PDSA publishing queue; dispatch writes auditable result. Techform cannot invoke PDSA delivery endpoints.
- Authorized immediate safety notices can bypass *promotional* approval when initiated by designated safety authority; not a route for advertising.

## Unified calendar

Each event has owning org, required team/class or public visibility, venue, field identifier, type (game, practice, referee clinic, coach training, Techform class, volunteer shift), start/end, cancellation/postponement status, source authority and notification preferences. Family view aggregates only records linked through verified relationship and optional public events; do not expose private rosters. Changes trigger deduplicated targeted notices.

## Safety workflow

Forecast checks can flag risk at suggested 48h, 24h, 3h, 1h marks. Verified lightning/field restrictions are separate authoritative events with source/timestamps, location/coverage, restriction severity, supersession, explicit release conditions. A restriction places affected events on hold; automatic targeted urgent messages do not require marketing approval. An authorized official must verify closure/clearance and honor city/PDSA policies. No auto 'ALL CLEAR' based on missing data or elapsed time alone. Apply restrictions per facility, never assume a Brown Road sensor covers other fields.

## Explicit non-goals for prototype

Real player registration, payment capture, live weather and lightning monitoring, Facebook posting, emails/SMS, real family profiles or operational safety clearances. Static demo stores fictional data locally only.
