# Integration checklist (no live services connected)

## City of Canyon lightning / Brown Road Soccer Complex

**Unknown until verified**: equipment brand/model, supported feed/API/webhook, data license, authentication, coverage radius, status semantics, official priority, delay/outage behavior. Contact the responsible City of Canyon department and equipment vendor for written authorization and technical spec. Do not scrape an unofficial page or infer an alert from general weather.

Proposed adapter methods: `getCurrentOfficialRestriction(facilityId)`, `receiveSignedOfficialEvent(payload)`, `getProviderHealth()` and a manual authoritative override workflow for authorized safety officials. Store source, observed time, received time, effective time, fields/coverage, severity, restriction ID, superseding notices, operator identity and audit trail. Distinguish warning/expired feed/operator confirmation. Have immediate official stop-play and explicit authorized return-to-play control; never automatically resume based solely on a 30-minute countdown. City/PDSA procedures must be confirmed and coded as configurable policy, not hard-coded folklore.

## Weather forecast provider

Suggested first evaluation: US National Weather Service forecast/alerts APIs (`https://www.weather.gov/documentation/services-web-api`). Forecast checks at 48h, 24h, 3h and 1h per scheduled event, plus relevant provider alert delivery as available. If WBGT thresholds apply, use suitable measured/approved WBGT sources; temperature or heat index alone cannot substitute for WBGT. Cache responsibly, identify forecast provenance/staleness, do not claim safety clearance from forecast data. Verify quotas and use provider-compliant headers.

## Facebook / Meta

PDSA Facebook Page and Techform Facebook Page identities must be confirmed by their respective Page administrators. Use supported Meta Graph API permissions and review processes (may change). Keep Page access tokens server-side, rotate/revoke them, manage per-organization permissions and recording of who initiated post. Techform may post to its own Page under its policy. Posting to PDSA Page requires PDSA board-approved revision/audience/CTA and authorized Page access; failed sends need retry and manual fallback. Never assume arbitrary Facebook Group content can be read or posted through public APIs. Public website may show manually curated link cards when APIs are unavailable.

## Spreadsheet sync

Use the platform DB as source of truth. PDSA admin may download authorized `.csv`/`.xlsx`, or enable restricted Google Sheets API sync under an organization-owned service account/consent. Data fields: stable registration ID, season, division, evaluation status, rubric score columns, average/aggregation, placement status and evaluator audit info with PII minimized. Implement idempotency, sync checkpoints, conflict policy, retry logs, row reconciliation and spreadsheet access checks. Changes to a sheet must not silently alter the authoritative DB. The current demo only downloads a fictional CSV.

## Legacy records (optional; no Crossbar integration)

The replacement is designed as an independent PDSA product. Do not implement Crossbar sign-in, API/scraping, live synchronization, or a workflow that requires families to use the old app/site. No current PDSA website is modified by this project. Historical records may be considered only if PDSA supplies a lawful, authorized export and explicitly approves data mapping; preserve paid status and never duplicate a charge. If no authorized data is available, start the new enrollment lifecycle cleanly at a board-approved season opening.

## Emails, push and SMS

Server-side queue with recipient verification and event-specific audience scope; transactional vs marketing categorization; opt-ins, consent and opt-outs; bounce/retry/delivery receipts; templates in English and optionally Spanish; suppression and quiet-hour policy except properly categorized urgent safety warnings. Direct adult-to-minor communications need safeguarding policy enforcement. Notify PDSA officials, guardians of affected players, assigned coaches/referees, and Techform staff/participants only when their facility and event are impacted.

## Payment integration (separate organizations)

**See `PAYMENTS_AND_CUTOVER.md` for the controlling product requirements.** The replacement uses its own account, registration, and approved hosted-checkout workflow; do not require or route through the legacy platform. PDSA and Techform merchant ownership remains separate. Evaluate distinct merchant accounts with server-selected routing and hosted checkout; store only provider references and signature-verified webhook status, never card numbers. Use separate scoped financial permissions, receipts, refund handling, and reconciliation. Historical payment references are optional and require PDSA authorization.
