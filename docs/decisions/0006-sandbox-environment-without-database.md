# ADR 0006: Sandbox Environment Without Database

## Status

Accepted

## Context

NextDream needs a commercial sandbox that stays functionally aligned with production while avoiding any impact on official data or integrations. Running a second product or a forked codebase would create drift between production and the demo environment.

## Decision

We will run production and sandbox from the same repository and the same application routes, promoting the same commit to both environments.

The only runtime switch is environment configuration:

- `APP_ENV=production` or `APP_ENV=sandbox` on the API
- `VITE_APP_ENV=production` or `VITE_APP_ENV=sandbox` on the web

In sandbox mode:

- the API does not boot TypeORM/Postgres
- the health route is served by a sandbox-specific controller
- auth is restricted to demo personas (`paciente`, `apoiador`, `instituicao`)
- sandbox state lives only in memory and is isolated per demo session
- dream, proposal, conversation, notification and institution flows reuse the same controllers and DTOs, but swap production services for in-memory providers
- Sentry/analytics startup hooks are disabled
- the web stores auth in `sessionStorage` instead of durable `localStorage`
- the UI shows a persistent sandbox banner and a public `/sandbox` entry screen

## Consequences

### Positive

- production and sandbox keep route-level parity
- no database is required for the sandbox deploy
- demo users can create and mutate realistic data during a session
- no official records or outbound integrations are touched

### Trade-offs

- sandbox data disappears after session expiry or process restart
- sandbox-specific service implementations must stay aligned with production contracts
- cross-session collaboration is intentionally not preserved; each demo login starts from a seeded scenario
