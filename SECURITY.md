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
- Keep `NODE_ENV=production` in production so schema auto-sync is disabled.
