# Registration → Evaluation Worksheet → Team Placement

## Goal

PDSA administrators register/verify a player once. An evaluation worksheet roster is automatically populated for the corresponding season and age division. Evaluators score players via an authorized frontend; a spreadsheet is an optional output, not the master source. Teams are suggested and reviewed, not assigned invisibly.

## Required workflow

1. Adult guardian authenticates and links to their child via verified relationship policy.
2. Select organization, season, appropriate age division, program; complete terms, waiver, age eligibility, and payment if applicable.
3. Backend saves `registration` with idempotency key; transactional trigger/service creates `evaluation_roster` tied to same registration and rubric version.
4. Evaluators see only assigned division/evaluation sessions, with only necessary fields. No unneeded household contact, payment or medical data.
5. Evaluator scores by rubric; multiple assessments are stored separately with evaluator ID and timestamp.
6. Dashboard calculates weighted averages and completeness; score changes are logged and potentially require approval after lock.
7. League admin reviews balance and authorized requests, publishes teams, then guardian/team notifications become eligible for sending.
8. Exports: approved CSV/Excel and/or Google Sheets API; limit exported fields and use scoped permissions. Exports may be snapshot/versioned or scheduled sync, with clear last-updated metadata.

## Fictional CSV columns in the current demo

`registration_id, fictional_player, division, status, team, ball_control, passing, awareness, average`

CSV is generated client-side **from fictional localStorage records only**. The files intentionally exclude guardian contacts, birthdates, health information or actual identity data.

## Production rubric suggestion (requires PDSA vote)

- Configurable by season/division (U6–U18) and possible recreational/competitive track.
- Criteria: ball control, passing, field awareness, shooting, defending, effort, coachability. These are proposals, not confirmed league policy.
- Each rubric item includes: numeric scale, weight, instructions, version and applicability range.
- Composite score computed with `sum(score * weight) / sum(weights)`; handle missing inputs as incomplete, not 0.
- Multiple evaluators may have independent weights/aggregation policies; record inter-evaluator disagreements and bias review rather than making team placement fully automatic.
- Younger age groups may not require skill ranking; PDSA should determine fairness and age-appropriate assessment policies.

## Required data constraints

- Unique: `(registration_id, evaluation_program_id, season_id)` for roster creation, unless the league explicitly permits multiple assessment sessions.
- No silent deletion of past scores. Use versioning, audit history, reviewed locks, admin corrections with reasons.
- No participant appears in other organizations' worksheets just because of a shared login. Consent is organization/program-specific.
- No cross-division private export for a coach who lacks authorization.
- The app must never allow arbitrary edits of shared Google Sheets to overwrite the core database without an authenticated reconciliation policy.

## Acceptance tests

- Same registration event delivered twice → exactly one evaluation roster row.
- Update division after verification → roster correctly reclassified with audit and no duplicate.
- Pending score values → average shown as incomplete; complete rubric → stable weighted average.
- Unauthorized Techform admin/coach → cannot read PDSA evaluation/export endpoint.
- Registration cancelled → evaluation status handled by published policy.
- CSV escapes values and is only available to approved staff; no sensitive fields exported.
- Team suggestion is reproducible and can be overridden, logged and explicitly published by authorized league admin.
