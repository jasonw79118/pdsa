# Communications, Approval Queue and Facebook Integration

## Independent organizational ownership

- PDSA can communicate to role- or event-scoped PDSA guardians, coaches, referees, volunteers and board/committees.
- Techform can communicate directly to Techform's own registered participants, staff and assigned coaches.
- Coaches get messages addressed **only to guardians of their assigned team(s)**, with child-safety policies and authorized monitoring/retention. They cannot broadcast to other PDSA teams, Techform classes or the whole league.
- Referee and volunteer users can message only their assigned coordinators or bounded assignment groups.
- Public visitors never see private messages, rosters, participant lists or direct contact details.

## Message categories + default routing

| Message type | Authorized writer | Intended recipients | Approval |
|---|---|---|---|
| League registration / key season dates | PDSA admin | PDSA eligible audiences/public | PDSA governance policy |
| Game update / cancellation | PDSA game/league scheduler | Assigned team guardians/coaches/referees | Official event permission |
| Team practice change | Assigned team coach | **Their own** team guardians only | Team policy and safeguarded channels |
| Coach certification/training | PDSA authorized role | Assigned PDSA coaches | Administrative policy |
| Referee training or assignment | Referee coordinator | Assigned/eligible referees | Administrative policy |
| Volunteer need | Volunteer coordinator | Opted-in volunteers / approved public opportunity | Administrative policy |
| Techform participant training | Techform administrator | Techform participants | Techform policy |
| Techform to PDSA promotion | Techform submits | Selected PDSA families / public / Facebook Page | **PDSA board approver MUST approve** |
| Lightning/field safety restriction | Verified alert service / safety officer | All affected participants/staff/officials | Emergency safety policy; bypass *promotional* queue |
| Return-to-play | Authorized safety officer after verified clearance | Affected event population | Separate safety clearance approval |

## Required message composer

1. Select `organization`, typed `message_category`, `event_id` or `team_id`/`division_id`/`cohort_id`, and authorized channel.
2. Server resolves audience from validated membership and event relationships; no client-provided address list as authoritative.
3. Preview estimated recipient count and privacy-safe sample, required consent state, language variants and channels.
4. For bulk PDSA marketing/partner posts: check board approval version/hash and allowed audience/channel/window.
5. Submit idempotent outbox; dispatchers deliver with rate limiting, retries, backoff, bounce handling, audit and delivery status.
6. Notifications link to the canonical event/announcement; do not duplicate schedule databases.

## PDSA approval of Techform promotion

**Techform flow:** create academy event/news → submit explicit PDSA promotion request with exact content/media, target divisions/guardians, audience scope, channel(s) and date range → await PDSA.

**PDSA approver flow:** review; approve or request changes/reject; log reviewer and immutable content hash. Publishing processor checks that content hash, audience and channels still match an active approval. Revocation immediately cancels pending jobs and unpublishes where supported.

Do NOT allow Techform to indirectly send to PDSA via a freely editable "to" field or general-purpose notification API. Do not treat a PDSA calendar listing as blanket permission to send email or post on Facebook.

## Facebook: phased implementation

### Phase A: simple manual workflow (no API access)

- Each organization configures its official public Facebook **Page** URL in an authorized settings screen, after link verification.
- Build a preview and **Copy post text / Open Facebook Page** interface. This doesn't auto-post; users publish manually through their own approved account.
- PDSA board must approve Techform copy before it may be marked ready for sharing via PDSA-owned channels.

### Phase B: authorized API publishing (requires Meta and organization approval)

- Each organization connects a Page with supported Meta login authorization; scope to relevant Page only.
- Confirm current Meta platform capabilities, business verification/app review requirements, permissions, rate limits and content policies using official developer documentation.
- Keep access tokens encrypted **server-side only**; implement renewal/revocation and provider error visibility. Do not put Page access tokens in GitHub Pages JS, repository, localStorage or browser logs.
- Create publish jobs bound to immutable announcement + approval version. Enforce approved targets and org-specific Page destination server-side.
- Audit who approved, who published, Page/account, content version, provider post ID, status and retry history.
- Do not attempt scraping personal Facebook profiles, private Groups, or bypassing Meta policy. Never auto-repost children’s photos without guardian permission and board-approved policy.

### Phase C: sharing/engagement

- Offer shareable public event links, prefilled text where supported, click tracking with consent, sponsorship posts and link back to canonical signup page.
- If permitted by Meta, retrieve approved Page-level engagement data; optional and non-blocking.

## Communication safety and deliverability

- Parents can set notification preferences with appropriate critical-alert policy (check legality of SMS/emergency opt-in language with counsel).
- Avoid public recipient exposure, blind-copy issues and disclosing private contact lists to coaches.
- Emergency notifications clearly identify trusted source and are never sent by unverified/public roles.
- Establish data retention, abuse reporting, administrator moderation and safeguarding rules for adult/minor conversations.

## Dependencies needing user/org action

- Verify the **actual** Techform Canyon Facebook Page URL and permitted usage; no URL is hardcoded in this prototype.
- Obtain Page administration access from each organization for production integration.
- Select email/SMS providers, domain ownership/DNS, branding rights, and platform privacy policy.
