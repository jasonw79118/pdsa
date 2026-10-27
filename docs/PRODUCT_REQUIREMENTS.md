# Product Requirements — PDSA × Techform Unified Soccer Platform

Status: **concept / board review**. All actual operations require board authorization, real policies and production controls.

## Product vision

One website and family login with two independently managed organizational spaces. PDSA owns recreational soccer operations, youth league logistics and approved public community content. Techform independently owns player-development sessions and its own staff/participant records. Organizations may cross-promote through a **recorded PDSA board approval gate**. Both appear in one combined, user-filterable family calendar.

## Personas

1. Platform operations owner — deployment, identity recovery and technical monitoring, minimum access to actual member content.
2. PDSA board approver — promotional approvals, governance, sanctioned league-wide messaging and safety role delegation.
3. PDSA league administrator — seasons, divisions, registration, payments, evaluations, team assignment, coaches, volunteers, referees, rosters, schedule, field status and messages.
4. Division coordinator — their divisions only.
5. Team coach/assistant — assigned teams only, team messages to guardians and approved practices.
6. Referee coordinator — referee eligibility, availability, matches, approvals, referee communication, limited roster visibility when required (normally none).
7. Referee — only own scheduling, availability, training and assigned match details.
8. Volunteer coordinator — event positions, signups, tracking hours, training, check-in.
9. Volunteer — own duties, statuses, events and notifications.
10. Techform administrator — own programs, staff, enrollment, academy communication, submissions for PDSA promotion.
11. Techform coach — own assigned sessions and authorized participants only.
12. Parent/guardian — family account linked to verified dependents and chosen programs.
13. Older player — limited age-appropriate view subject to guardian/safeguarding policy.
14. Public visitor — only approved public information.

## Core requirements (MVP target)

### Website and family experience
- Responsive (mobile first), purple/white identity and a saved switch between light and dark designs.
- Public home, league information, registration, teams & division overview, combined calendar, directions and field map, weather status, volunteer information, Techform training, sponsor pages.
- Registration and login from one public entry point with organization-specific terms and consent.
- Public calls to action for PDSA registration and Techform opportunities; never imply the programs share private records by default.
- Accessibility: WCAG 2.2 AA target, keyboard/screen-reader, reduced-motion, legible mobile schedule.

### PDSA registration and evaluation
- Configurable seasons, age brackets, eligibility cutoffs, waiver versions, fees/discounts, registrant waitlists, and registration availability.
- Guardian account contains only linked children; birthdates and contact info are private and minimized.
- Every created eligible player registration automatically receives **one evaluation roster entry per applicable season/program** (upsert keyed by registration/season; never duplicate rows when updated/retried).
- Evaluation rubric may vary by division/season: ball control, passing, awareness, shooting, defending, effort, coachability, other approved categories; configurable scoring scale and weights.
- Authorized evaluators enter scores; preserve individual evaluator entries and rubric versions; provide review dashboard and average/weighted aggregation.
- Evaluation roster filter by division, session, evaluated/pending, registration standing; authorized Excel/CSV export or Google Sheets sync.
- Spreadsheet is downstream reporting, not the system of record. Protect access; do not export contact/medical/private fields by default.
- Team building: suggest balanced roster assignments; support constraints (age, capacity, assistant/coach child, approved requests, conflict rules), commissioner review, final board/league authority to publish.
- Team assignment notifications only after published and authorized; version and audit changes.

### Personnel and volunteer operations
- Directory with role memberships across seasons; one person may hold multiple roles.
- PDSA tracks volunteer availability, shifts, check-in/out, hours, training and service history.
- PDSA tracks coaches, assistants, team assignment, approved training modules, safeguarding/background clearance **status** (not raw reports), expiration and reminders.
- Board: current members, office/committee, terms, onboarding, authorized approvals, versioned policy documents, board-only tasks and notices.
- Referee system: certification and eligibility status, training, preferred divisions, availability, offers/accept/decline, match assignments, field/time, report completion, optional compensation bookkeeping.
- Staff/volunteer data is org-scoped and must not be leaked in public directories without express permission.

### Scheduling and event management
- Unified calendar for PDSA games, team practices, Techform development, coach training, referee training, evaluations and volunteer events.
- Every event has owner organization, location/field, start/end, timezone America/Chicago, audience, publication visibility, status, source, last changed by, and revision version.
- Field conflict detection, blackout/maintenance periods, duplicate match prevention, rescheduling change notifications, calendar subscriptions per team/family/role.
- Referee assignment workflow and referee eligibility match rules; game coverage exceptions visible to coordinator.
- A coach cannot change league official fixtures unless delegated; can manage team practices where allowed.

### Targeted communications
- Compose messages by event/game/team/division/role/training cohort/parent relationship; determine audience on server from actual authorized memberships.
- Types: game notices, schedule change, practice change, field safety, coach training, referee training, volunteer needs, PDSA general updates, Techform player training and academy participant notices.
- Channels: website/in-app inbox, email, optional push, optional SMS where approved. Delivery states, opt-in/opt-out rules, time-sensitive overrides per policy, bounce/unsubscribe handling, audit history.
- Coach may message **guardians of assigned team(s) only**. For youth safeguarding, avoid direct unobserved adult-to-minor messages; keep guardian visibility and approved retention/access policies.
- Techform communicates directly with its own enrolled participants and staff, but not PDSA population by default.
- Staff group message policies differ from public announcements. No broad list export by coaches.

### Techform-to-PDSA approvals
- Techform creates and updates its own programs without PDSA intervention.
- Techform can propose PDSA homepage event promotion, public feed item, PDSA mailing/push audience, or PDSA-controlled Page publication.
- Workflow: Draft → Submitted → Pending board approver → Approved / Changes requested / Rejected → Scheduled / Published / Revoked / Expired.
- Approver assigned by PDSA; approve **content hash/version + channels + audience + publication window**, not blanket permission. Major edits require resubmission.
- Show submitter, exact copy/assets, target dates, target group, who approved, time, status, revision history, ability to withdraw/revoke. If event details change significantly, invalidate previous approval.
- A Techform admin must never acquire the ability to broadcast to PDSA lists simply by changing a URL or request body.

### Weather & facility safety
- NWS forecasts/warnings tied to every scheduled event location and time; forecast checks 48h/24h/3h/1h prior as proposed defaults, adjustable by PDSA policy.
- City of Canyon lightning detector connection planned **only once feed model, authorization, equipment coverage, vendor and semantics are confirmed**. Input may be webhook, API, poll, or no feed (authorized manual entry).
- Official lightning restriction/stop-play takes priority over forecasts. Restrictions apply to covered fields and event times, including Techform use of those fields.
- Policy thresholds and waiting periods are versioned and verified against current PDSA + City documents by an authorized safety official.
- Life-safety behavior: record source/timestamp; fail closed/degraded on stale or missing status; block game/practice; send targeted urgent notices. Countdown alone is not clearance. Return to play requires reliable clearance evidence and authorized approval.
- Event change audit/notification; only designated official roles may issue safety notices or approve return-to-play.

### Facebook and community reach
- Official Facebook Page link and manually prepared share text as initial approach.
- Later: organization-specific approved Meta Page authorizations and backend publishing jobs; no browser-held Page tokens.
- PDSA-controlled Facebook publication of Techform content must use the PDSA approval workflow.
- Do not assume personal-profile posts, closed groups or arbitrary feeds can be programmatically synced. Confirm allowed Meta capabilities and permissions.
- Track public sponsor shoutouts, community events, recruitment and shareable messages by owner organization.

## Outside the free static prototype

- Real data collection; login/authentication; real team data; real payment processing; emails/SMS; coach personal contacts; push notifications; Facebook Page posting; live weather; lightning equipment integration; actual PDSA/Tecform logos. All require dedicated backend/services/permissions.

## Unresolved governance decisions

- Named PDSA data controller/admin and explicit board roles able to approve Techform promotions.
- Registration fields, division cutoffs, age-specific rubrics, team formation policy, safeguarding/communication requirements and annual data-retention schedule.
- Accurate City of Canyon lightning device and live read-only feed availability; site coverage and official stop/play authority.
- How Techform branding, registration fees, and cross-program messaging consent should work.
- Access to legally export Crossbar records and whether migration is permitted/desired.
