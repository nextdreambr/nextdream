# ADR 0007: Sandbox Activation by Subdomain

## Status

Accepted

## Context

ADR 0006 introduced a database-free sandbox that reuses the same routes and commit as production. The original web activation model depended on `VITE_APP_ENV=sandbox`, which made the presentation copy, public `/sandbox` entry, banner and session behavior global to the entire production build.

The new deployment model keeps the same OCI origin and Cloudflare setup, but exposes the commercial sandbox on `sandbox.nextdream.ong.br`. The sandbox experience must appear only on that subdomain, while local development and automated tests still need a simple way to force sandbox behavior.

## Decision

We will activate the web sandbox in production by hostname:

- `window.location.hostname === VITE_SANDBOX_HOSTNAME` enables sandbox on the public subdomain
- `VITE_APP_ENV=sandbox` remains a fallback only for `localhost`, `127.0.0.1` and automated tests
- the production web build must receive `VITE_SANDBOX_HOSTNAME`
- sandbox deploys must omit `AUTH_COOKIE_DOMAIN` so auth cookies stay scoped to the sandbox subdomain
- API/browser allowlists must include `https://sandbox.nextdream.ong.br`

## Consequences

### Positive

- the main public domain keeps production copy and behavior even when the same build also serves the sandbox subdomain
- production and sandbox still share the same repository, routes and release artifact
- sandbox sessions stop leaking across subdomains when the dedicated deploy omits `AUTH_COOKIE_DOMAIN`

### Trade-offs

- deploy configuration now depends on one more web build variable
- hostname-based behavior requires explicit operational validation in Cloudflare, nginx and the origin certificate
