# ADR 0003: Oracle VM + Cloudflare Free + Supabase for production

Date: 2026-04-08

## Status
Accepted

## Context

- We need a production deployment path for a public open-source project.
- The project runs a React web app and a NestJS API.
- Database is hosted on Supabase Free.
- Traffic must be fronted by Cloudflare Free with HTTPS and proxy protections.

## Decision

- Deploy web and API on Oracle VM using Docker Compose (`docker-compose.prod.yml`).
- Keep database external on Supabase (pooler connection string for IPv4 compatibility).
- Publish a single public origin (`web`) and route API via `/api` reverse proxy in Nginx.
- Configure production env via GitHub Environment `production` with secrets and vars.
- Trigger production deploy only after successful CI on `main`.

## Consequences

- Production setup is reproducible and does not require committing secrets.
- Cloudflare integration can be done with DNS + proxy + SSL without changing app APIs.
- Build times are higher due to workspace install in Docker build stages, but reliability is improved.
