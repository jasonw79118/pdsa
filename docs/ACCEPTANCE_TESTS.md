# Demo acceptance checklist / production verification cases

## Static demo (perform in browser)

- [ ] Homepage loads with PDSA purple design; nav links work on desktop and phone width.
- [ ] Light/dark toggle works and persists across page refresh in this browser.
- [ ] Public calendar filters PDSA vs Techform and event types.
- [ ] `Operations Studio` role switch exposes distinct demonstration menus: PDSA admin vs board vs Techform vs coach vs referee vs guardian.
- [ ] PDSA admin adds fictional registration; evaluation grid increases by one without separate entry.
- [ ] Changing demo scores updates averages; CSV file is downloadable and clearly fictional.
- [ ] Team Builder labels proposals as suggestions and doesn't publish a roster.
- [ ] Personnel page shows coaches/referees/board/volunteers; fictional volunteer can be added.
- [ ] Coach view shows only the demo assigned team, with messaging audience restricted to that team.
- [ ] Techform admin can create a demo training event independently.
- [ ] Techform admin can submit a PDSA promotion; before approval it does NOT appear as approved PDSA news.
- [ ] PDSA approver can approve or request changes; approved content appears on public PDSA news.
- [ ] Communication composer saves a fictional outbox message, does not actually send.
- [ ] Weather controls simulate normal, advisory, suspension and manual-clearance hold; City/weather connection visibly labelled unavailable.
- [ ] Reload persists only in localStorage; no network-bound secrets, no real registration data.

## Production mandatory integration/authorization tests

- [ ] API/DB blocks cross-team roster and unauthorized guardian messaging even with forged IDs.
- [ ] API/DB blocks Techform reading PDSA family, evaluation and screening data.
- [ ] PDSA approval applied to exact immutable Techform revision, channels and targeting; modification requires re-review.
- [ ] Every new registration is idempotently reflected in evaluation views and restricted spreadsheet sync; retries do not duplicate entries.
- [ ] Multiple evaluators' scores aggregate per approved rubric; history and scorer scope retained.
- [ ] Only approved team placements publish; no exposed roster before approval.
- [ ] Revoking coach/board/Techform grants immediately prevents applicable operations.
- [ ] Official field restrictions target only affected events/facilities; forecast warnings are advisory only.
- [ ] City signal loss/staleness **never** leads to auto 'ALL CLEAR'; explicit authenticated release is required.
- [ ] Notification targeting, opt-in/out, emergency authorization, delivery statuses and immutable audit logs are tested.
- [ ] Automated accessibility, mobile viewport, backup/restore, and security scanning checks pass.

## Payment and Crossbar transition acceptance

The current browser demo does not execute actual payments. See `PAYMENTS_AND_CUTOVER.md` for ten **future production** acceptance tests: PDSA and Techform independent merchant routing, no second charge for Crossbar-paid families, signed/idempotent webhooks, refund/ACH flows, historical reconciliation, treasurer scope, and board-approved next-registration cutover. These are NOT marked passed by the existing `npm test` demo smoke suite.
