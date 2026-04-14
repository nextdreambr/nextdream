# Security Policy

## Reporting a Vulnerability

Please do not open public issues for security vulnerabilities.

Report vulnerabilities privately to:

- `security@nextdream.ong.br` (temporary contact)

When reporting, include:

- Affected area
- Reproduction steps
- Impact assessment
- Suggested remediation (if available)

We will acknowledge receipt as soon as possible and coordinate remediation.

## Supported Versions

This repository is currently pre-1.0. Security fixes are applied to `main`.

## Secure Deployment Notes

- Never use `.env.example` values in production.
- Set strong values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
- Configure `DATABASE_URL` and `CORS_ORIGIN` explicitly for each environment.
- Keep production image promotion pinned to immutable digests instead of mutable tags.
- Keep `NODE_ENV=production` in production so schema auto-sync is disabled.
- If `TRUST_PROXY=true`, expose the API only behind a trusted reverse proxy.
- In container deployments, prefer internal exposure (`expose`) for API services and avoid publishing API ports directly (`ports`) unless protected by network controls.
- Configure `PROXY_TRUSTED_IPS` explicitly when `TRUST_PROXY=true`; startup now fails fast without it.
- Include only real reverse-proxy IPs in `PROXY_TRUSTED_IPS`; do not trust whole subnets unless that is the actual proxy boundary.
- Keep a persisted previous release state so production can auto-rollback after failed verification.
- Set a strict login throttle (`LOGIN_THROTTLE_LIMIT` / `LOGIN_THROTTLE_TTL_MS`) in production.
- Risk note: enabling trust proxy without trusted upstream restrictions allows spoofed `X-Forwarded-*` headers (client IP/proto/host forgery), which can break rate-limit and security assumptions.
