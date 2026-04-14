# ADR 0001: Production Deploy via GHCR Images on OCI

## Status
Accepted

> Extended by ADR 0002 for digest pinning, rollback state persistence, and deploy hardening.

## Context
The previous production deploy strategy used remote source sync and image builds directly on the OCI host.
This made releases slower, reduced traceability, and made rollback harder to execute safely.

## Decision
Adopt immutable container image releases built in GitHub Actions and stored in GHCR.

- CI verifies code quality (`lint`, `typecheck`, `test`, `build`).
- Production deploy workflow resolves a release tag (`commit SHA` by default).
- In `deploy` mode, CI builds and pushes `api` and `web` images to GHCR.
- Deploy on OCI pulls tagged images and runs `docker compose up -d`.
- A `.release-tag` marker is persisted on the host for operational visibility.
- `rollback` mode redeploys a previously built image tag without rebuilding.

## Operational Constraints
- Production database is external and provided by `DATABASE_URL`.
- OCI host must authenticate to GHCR using production secrets.
- SSH host identity is pinned through `known_hosts` (no `accept-new`).

## Consequences
Positive:
- Deterministic releases by immutable tag.
- Faster and safer rollback.
- Better auditability of what version is running.

Tradeoffs:
- Requires GHCR credentials and package permissions.
- Requires keeping `docker-compose.prod.yml` synchronized on the OCI host.

## Implementation Notes
- Workflow: `.github/workflows/deploy-prod.yml`
- Runtime manifest: `docker-compose.prod.yml`
- Health gate: `/api/health` now checks database connectivity.
