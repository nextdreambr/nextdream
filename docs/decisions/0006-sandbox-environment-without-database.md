# ADR 0006: Sandbox Environment Without Database

## Status

Accepted

## Context

NextDream needs a commercial sandbox that stays functionally aligned with production while avoiding any impact on official data or integrations. Running a second product or a forked codebase would create drift between production and the demo environment.

## Decision

We will run production and sandbox from the same repository and the same application routes, promoting the same commit to both environments.

The runtime switch is environment configuration on the API plus hostname-aware gating on the web:

- `APP_ENV=production` or `APP_ENV=sandbox` on the API
- `VITE_SANDBOX_HOSTNAME=sandbox.nextdream.ong.br` on the web for the shared production bundle
- `VITE_APP_ENV=sandbox` only as a localhost and automated-test fallback for the web

In sandbox mode:

- the API does not boot TypeORM/Postgres
- the health route is served by a sandbox-specific controller
- auth is restricted to demo personas (`paciente`, `apoiador`, `instituicao`)
- sandbox state lives only in memory and is isolated per demo session
- dream, proposal, conversation, notification and institution flows reuse the same controllers and DTOs, but swap production services for in-memory providers
- Sentry/analytics startup hooks are disabled
- the web stores auth in `sessionStorage` instead of durable `localStorage`
- the UI shows a persistent sandbox banner and a public `/sandbox` entry screen

Web sandbox activation follows this precedence:

1. If the current browser hostname matches `VITE_SANDBOX_HOSTNAME`, the UI behaves as sandbox even when `VITE_APP_ENV=production`.
2. Otherwise, the UI only behaves as sandbox when `VITE_APP_ENV=sandbox` and the hostname is local (`localhost`, `127.0.0.1`) or the code is running under automated tests.

Example:

- `VITE_SANDBOX_HOSTNAME=sandbox.nextdream.ong.br`
- `VITE_APP_ENV=production`
- `window.location.hostname=sandbox.nextdream.ong.br`

Result: the same production web bundle activates sandbox-only UI on the sandbox subdomain without affecting `nextdream.ong.br`.

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
