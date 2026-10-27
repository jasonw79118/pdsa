# Weather & Lightning Safety — Integration Specification

**Safety-critical warning:** The current prototype uses SIMULATED states. It has no live weather feed and NO link to City of Canyon equipment. Never present a green demonstration banner as real permission to play.

## Inputs and source priority

1. **Verified City of Canyon lightning-warning system** at Brown Road complex (and only other coverage areas explicitly confirmed by the city) — potential authoritative restriction source, *after city/vendor confirmation*.
2. Authorized PDSA/facility safety official — may enter or verify official action under published procedures.
3. Official NWS forecast and alert API (`https://www.weather.gov/documentation/services-web-api`) — forecast/advisory source, **not** a substitute for localized lightning detection or mandatory shelter instructions.
4. Optional licensed lightning/heat/WBGT provider — only if contracted and verified; not currently selected.

### City discovery checklist (do not guess or invent feed)

- Confirm actual name of facility, warning device manufacturer/model, exact warning coverage/map, operator/maintainer and source-of-truth contact.
- Ask whether the city/vendor provides a documented API, signed webhook, data feed, public display page or text/email notice; determine permitted caching/redistribution, service reliability and fees.
- Obtain written permission to ingest/redistribute alerts and an incident escalation contact.
- Determine whether the pole's siren/strobe states can be read digitally and which state means warning active vs cleared.
- Verify how warnings propagate when city feed is unavailable, whether there is a heartbeat and how stale data is identified.
- Establish official field opening, evacuation, lightning countdown/restart and return-to-play authority, plus policies for school fields and off-site Techform locations.

## Proposed forecast processing

- For each event, store location and timezone and check official forecast at scheduled checkpoints (48h, 24h, 3h, 1h) and as needed. Actual rate subject to provider terms.
- Present forecast risk with timestamp/source; not a cancellation unless authorized restrictions or league policy demand action.
- Handle sustained winds, gusts, heat and WBGT as separate values; do not approximate WBGT from air temperature and call it official. Maintain editable/board-approved rules. PDSA rules from prior review indicated 10-mile lightning proximity, 30-minute reset, high wind thresholds and heat/WBGT protocol; **verify the current signed league and city policy before encoding numeric thresholds in production**.

## Restriction and clearance state machine

`NORMAL_VERIFIED` → `WATCH` → `RESTRICTION_ACTIVE` → `WAITING_FOR_VERIFIED_CLEARANCE` → `AUTHORIZED_REOPEN`.

Independent `SOURCE_UNVERIFIED` state indicates device/offline/missing heartbeat and cannot be interpreted as clear.

On authoritative restriction:
1. Record exact source ID, raw status mapping, received/issued time and affected coverage.
2. Query all active/upcoming games/practices/evaluations/Techform training at intersecting locations/times.
3. Switch only those events to safety hold (or official cancellation status) and create notification outbox jobs to corresponding guardians, coaches, refs, staff, and coordinators.
4. Send immediate safety notice via policy-approved urgent channel; bypass *marketing* approval queues but restrict ability to authorized safety service/operators.
5. Record warning repeats and any timer reset according to approved official rules; displayed countdown is informative only.
6. Require official clearing evidence + board-designated safety official authorization before return-to-play. Do not reactivate merely because the timer elapsed, latest observation disappeared or connection failed.
7. Record who approved the clearance, when, which source, any overriding facility closure, and affected event revisions.

## Notification detail

Notices must include facility/fields, time, event IDs, current status, approved shelter instructions, source type and last verified timestamp. Avoid exposing minors or household contacts. Deliver to affected PDSA teams, Techform session guardians/staff, referees and volunteer coordinators. Keep acknowledgement states where appropriate.

## Production integration tests

- City warning on Brown Road impacts PDSA game and Techform class **at Brown Road**, but does not block an off-site Techform venue without confirmed shared coverage.
- NWS thunderstorm risk without verified lightning warning is labeled **forecast advisory**, not active city stop-play.
- Two lightning strikes reset authorized hold according to rule; delayed/out-of-order input does not shorten hold.
- Missing heartbeat or city API 500 does **not** issue all-clear.
- A regular PDSA content editor cannot dismiss a safety restriction without safety permission.
- Approved PDSA board marketing reviewer does not automatically have field clearance authority.
- Duplicate webhook delivers one restriction change/notification set (idempotency).
- Alerts generated in UTC are displayed with America/Chicago local time and tested at DST transitions.

## Pending external verification

There is **no verified machine-readable integration endpoint** in this deliverable. The city/vendor equipment and APIs must be discovered before implementation. Do not scrape a visual alarm dashboard for operational safety decisions without official authorization and validation.
