# Neon backend setup and safe deployment plan

## Recommendation

Use **Neon Postgres** for the PDSA backend, as requested. Start with the supplied production branch for the requested Neon project, but use only synthetic test data until schema, authorization, account security, retention, and recovery are reviewed. Confirm current Neon plan limits and data-processing terms before putting real family/player information or live league operations on any free tier.

Neon Postgres is not itself a login system. Neon Managed Auth (Better Auth) has since been enabled on the PDSA production branch. The family UI uses the Neon Auth client; do not implement password storage in application tables. A free database plan is not a substitute for incident response, tested restore, access review, and retention controls; budget for production support if the chosen tier does not meet PDSA's requirements.

## Account-first family flow

1. An adult creates and verifies a guardian account through a PDSA-approved identity provider. Credentials are never stored in application tables or the static website.
2. The signed-in adult creates a guardian profile linked to their immutable auth user ID.
3. Only that verified guardian can add multiple player profiles to their family. Each player has separate emergency contacts, consent records, and safety notes. Store the minimum health information needed and give it narrower access than ordinary roster data.
4. The guardian enrolls each player in a currently open PDSA program. Closed enrollment must reject writes on the server, not just hide the form.
5. The same backend serves the web and mobile clients. Team rosters, games, practices, and referee assignments are scoped by verified guardian, current team/referee assignment, organization, and season.

This project is a replacement prototype and must not send families through Crossbar account or registration flows. Do not migrate current participant/registration records or process live payment until PDSA authorizes a secure, tested transition. Any already-paid registration must remain paid and must never be charged twice.

## Information domains to model

- Families: auth identity, guardian profile, verified guardian-player links, per-player emergency contacts, allergies/safety notes, consent versions, and retention state.
- League: seasons, enrollment windows/programs, divisions, registrations, teams, player/coach assignments, and roster publication state.
- Calendar: games and practices as events with owning organization, team, venue/field, start/end, status, timezone, and revision/audit history.
- Referees: adult/referee profiles, qualifications/availability, and assignments to specific games; referees see their assignments, not player rosters.
- Governance: scoped staff grants, immutable audit events, and transactional outbox for future notifications/integrations.

## Security gates before real data

- Apply migrations in an isolated project and enable RLS on every exposed table; default deny. Add positive and negative tests for guardian-to-own-player access, unrelated families, coaches limited to assigned teams, referees limited to assigned games, and revoked grants.
- Keep health notes in a separately authorized path. Coach roster views must omit detailed medical notes; only a designated safety role gets access when policy permits.
- Verify adult identity and guardian authority; define a safe process for disputes, alternate guardians, account recovery, and deletion requests.
- Require MFA for administrators, audited role grants, rate limits, secure backups/restore drills, incident response, and a documented retention schedule.
- No real PII in GitHub Pages, browser localStorage, demo fixtures, analytics, or logs. No service-role key in the browser.
- Run a security review and obtain PDSA governance/privacy approval before real-data pilot. A free tier is not a substitute for these controls.

## Setup status

Neon CLI `8.13.0` is installed and authenticated. The PDSA project `delicate-cell-03366516` is linked at branch `production`; Postgres was already provisioned and Managed Auth was declared in `neon.ts` and deployed. Neon variables were pulled into ignored `.env.local`; the public `VITE_NEON_AUTH_URL` alias is present there for local development. Next implementation steps: reviewed SQL migrations, guardian/account schema, application-side authorization, automated permission tests, and synthetic test accounts. No live PDSA website or family/player records were accessed.
