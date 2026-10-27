# Authorization: deny by default, grant only on scope

This file describes REQUIRED production controls, not security provided by the static prototype.

| Role | PDSA private registration | Team private roster | Direct messages | PDSA personnel | Techform private data | PDSA promotional approvals | Safety actions |
|---|---|---|---|---|---|---|---|
| Public | Never | Never | None | Public-facing biographies only | Public sessions only | Never | Read public status |
| Guardian | Own linked children | Own linked children's team data, minimized | Own linked teams / approved coordinators | Never | Own enrolled program only | Never | Read public status |
| PDSA coach | Only if league grants minimal details | **Assigned team only** | **Guardian contacts for assigned team only** | Own eligibility/training only | Never without separate Techform role | Never | Report observations; not official clearance |
| PDSA division coordinator | Assigned division as needed | Assigned division only | Assigned division as delegated | Assigned coaches/referees as needed | Never by default | Never unless board explicitly delegates | Read / limited policy-authorized actions |
| Referee | No | No | Own ref coordinator/assignment conversations | Own referee profile | Never | Never | Receive urgent match restriction |
| Ref coordinator | Minimal match/official data | No player details required | Referee groups, game-specific | Referees only | Never | Never | Limited to delegated safety role |
| PDSA volunteer | No | No | Assigned shifts/coordinator | Own profile | Never | Never | Receive targeted notices |
| PDSA league admin | PDSA only | All authorized PDSA teams | PDSA role/team/league audiences | PDSA only | Never by default | Only if assigned approval role | Only if assigned safety role |
| PDSA board approver | Only as needed, not automatically all children | Only as needed | Governance / delegated audiences | Governance only | Read public Techform promotion packet | **Approve / revoke** | Only if assigned safety role |
| Techform admin | No | No | Techform participants and staff only | No | All authorized Techform records | Submit requests only | Restrict own training at covered facility; official city clearance stays with safety authority |
| Techform coach | No | No | Guardian contacts for assigned sessions only | No | **Assigned sessions only** | No | Receive official restrictions |
| Technical platform operator | No by default | No by default | Service operations only | No by default | No by default | No business approval | Monitor service, no safety clearance |

## Required database authorization invariants

1. Every private business record has `organization_id` and the current user must have an **active verified membership** in that exact organization with a permission covering the action.
2. Team roster access requires `team_staff` membership for the specific `team_id` and date range, OR specifically authorized PDSA administrative permission. A claimed `team_id` or `organization_id` from the browser must never grant access by itself.
3. Guardian access requires verified player-guardian link, active consent and data-minimization. Other families' contacts remain private.
4. Techform cannot use PDSA marketing audiences or PDSA Page through its own organization membership. Only approved `cross_promotions` plus a server-side authorized publishing job may enable it.
5. A Techform coach sees ONLY own Techform sessions (analogous to PDSA team scoping). No cross-org browsing merely because the same family attends both programs.
6. Role changes and coach assignments require an authenticated authorized administrator, validity windows, logging, and deprovisioning when season or assignment ends.
7. A person holding two roles has the union of legitimately assigned permissions, **not** an automatic path to combine organizations' protected data in a shared broadcast.
8. Referees/volunteers require their own narrow resource-scope policies. No generic staff = admin shortcut.
9. Safety overrides are held by separately scoped `safety_authority` permissions and are independently audited. Approval of promotional content never grants safety clearance power.
10. Notifications must resolve recipients server-side using scope + subscription + safeguarding policies; never send to addresses submitted by an arbitrary client as the recipient list.

## Required negative tests

- Coach A attempts `/api/teams/another-team/roster` → 403/0 rows, even if URL or submitted team ID is manipulated.
- Removed coach attempts formerly assigned roster → denied immediately after removal.
- Techform admin attempts PDSA registration CSV endpoint → denied.
- Techform admin submits a PDSA announcement directly without approved record → denied.
- PDSA board approver tries to read Techform's private academy attendee records → denied.
- Parent A attempts Parent B child or contact record → denied.
- Referee A tries to edit Referee B availability or assignment → denied.
- Unknown/unassigned account attempts any write → denied.
- Content edited after promotion approval triggers re-review before publishing.
- Automatic weather feed returns stale/outage → system does not emit an “all clear.”
