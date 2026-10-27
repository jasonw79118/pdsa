# Smoke tests — current free static prototype

All names and records are fabricated. These checks are for UX demonstration only; server security must be separately tested once implemented.

## User interactions

- [ ] Open `index.html` directly or through localhost. Home shows purple design and visible unofficial demonstration notice.
- [ ] Toggle theme light→dark→light; reload, verify last choice persists.
- [ ] At 375px and 1280px widths, nav and content are usable, no unexpected side-scrolling aside from deliberately scrollable tables.
- [ ] Keyboard tab navigation reaches menu, tabs, controls, forms and links; labels and focus remain clear.
- [ ] Home and Calendar visibly label fake events/organizations; calendar filtering by org and type works.
- [ ] PDSA admin → Registration → “Add fictional registration”; new record added.
- [ ] PDSA admin → Evaluations → same record exists, empty scores; enter all 3 demo scores, see average and Complete status.
- [ ] Download CSV; inspect escaped header/data; no parent/guardian contact information.
- [ ] PDSA admin → Team Builder; show suggested groups, no publicly published private roster.
- [ ] PDSA admin → Personnel; filter by Coach/Referee/Volunteer/Board and add sample volunteer.
- [ ] PDSA admin → Communications; save fictional message to authorized outbox; verify no message is actually sent.
- [ ] Coach role → My Team shows Purple Hawks only, not other team private rosters; Communications audience exclusively “Assigned team: Purple Hawks”.
- [ ] Referee role → only own assigned match and coordinator messaging; no registrar or private rosters.
- [ ] Volunteer role → only personal shift and coordinator messaging; no complete private personnel directory.
- [ ] Techform admin → Training → add demo training; see it in public Calendar and Techform Training page.
- [ ] Techform admin → PDSA Promotion → submit sample notice. Before approval it does not appear as approved content on PDSA public Home.
- [ ] PDSA board approver → Approvals → approve notice. Home now shows it with Techform attribution.
- [ ] PDSA board approver → Approvals → request changes on another notice; ensure it stays off PDSA public Home.
- [ ] Safety page says NOT connected. PDSA admin → Safety Controls → simulate lightning: warning is shown; Weather page lists Brown Road activities as examples.
- [ ] Move simulated lightning state to “hold”: it remains restricted. Click demo authorized clearance, verify confirmation dialog and status changes only after confirmation.
- [ ] PDSA admin Overview → Reset all fictional demo data; all sample changes reset without erasing current theme preference.

## Production-required authorization tests (not possible on static demo)

- [ ] Change client-side role claims or direct API URL to another team; request denied by server/RLS.
- [ ] Coach removed from team; immediately loses private roster/message access.
- [ ] Techform admin attempts to modify/read PDSA private records; denied.
- [ ] Guardian attempts another family's records; denied.
- [ ] Techform PDSA publication without correct approved content hash/audience/channels; denied.
- [ ] Repeated registration webhook creates only one roster entry.
- [ ] Out-of-order safety events / City feed outage never issues automatic all-clear.
- [ ] Source-specific lightning event impacts only facility coverage; urgent notices target appropriate orgs/roles.
- [ ] Facebook credentials never reach frontend or public GitHub repository.
