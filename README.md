# PDSA family experience preview

A responsive prototype for the Palo Duro Soccer Association, retaining the association's purple visual language. The public-information pages and family sign-in are a standalone project and do not replace or modify the existing PDSA website.

## Family account status

- Adult sign-up/sign-in uses Neon Managed Auth. Authentication is not authorization to access another family's records.
- The **My children** form currently saves only to a temporary, isolated Neon development branch. Use fictional test details only; this test branch expires Nov 3, 2026. Do not enter real youth information.
- Child records are served through an authenticated API and guardian-scoped Postgres row-level security. They are not stored in GitHub Pages, frontend storage, or logs.
- Registration, payment, roster, team, and schedule workflows are not connected. No real charges or messages are sent.
- `board-demo.html` remains a fictional, browser-only demonstration and is not an operational service.

## Local development

1. Install dependencies with `npm ci`.
2. Create ignored `.env.local` from `.env.example` and configure the public Auth/API URLs for the intended environment.
3. Run `npm run dev` and open the Vite URL (normally `http://localhost:5173`). Do not use `file://`.
4. Run `npm test` and `npm run build`. The isolated database boundary test is `npm run test:family-rls:dev` and must only run against `family-child-dev`.

Never put database credentials, service-role keys, or payment secrets in frontend variables. `VITE_*` values are public and end up in the browser bundle.

## GitHub Pages preview

The `main` branch builds with Vite and deploys `dist/` to `https://jasonw79118.github.io/pdsa/`. The child-profile API configured for this preview is temporary and test-only; do not treat this deployment as approved for real registrations or family data. Production use requires a durable approved backend, reviewed retention/deletion and incident procedures, PDSA authorization, and successful production security review.
