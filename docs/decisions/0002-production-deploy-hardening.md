# ADR 0002: Production Deploy Hardening on OCI

## Status
Accepted

## Context
The initial GHCR-based deployment model improved traceability, but production still relied on mutable tag deployment, aggressive cleanup during deploy, and a destructive `docker compose down` before confirming the new release was healthy.

That left avoidable operational risk in three areas:
- release integrity, because production trusted tags instead of resolved digests;
- rollback speed, because only `.release-tag` was persisted;
- secret exposure, because deploy credentials were injected directly into remote shell commands.

## Decision
Keep the existing platform stack (`GitHub Actions`, `GHCR`, `OCI`, `docker compose`) and harden it.

- Resolve immutable image digests before deploy and run production with `image@sha256` references.
- Persist release metadata in `APP_DIR/.release-state.json` with tag and deployed image references.
- Replace inline remote deploy logic with a tracked shell script copied to the host during deployment.
- Stop using destructive `docker compose down` in the main deploy path.
- Fail fast when free disk is below a configured threshold after light cleanup.
- Auto-rollback to the previously persisted release state when deploy or public verification fails.

## Consequences
Positive:
- Better protection against tag mutation or accidental republish.
- Faster and more deterministic rollback.
- Lower exposure of sensitive runtime credentials in remote process arguments.
- Less downtime risk during routine deploys.

Tradeoffs:
- Workflow logic becomes more complex.
- Rollback still recreates the same stack; this is not blue/green.
- Database compatibility between adjacent releases remains an operational requirement.
