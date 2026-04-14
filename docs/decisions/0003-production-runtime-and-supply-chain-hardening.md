# ADR 0003: Production Runtime and Supply Chain Hardening

## Status
Accepted

## Context
Production deploys already used immutable image digests and rollback metadata, but the runtime and pipeline still had notable hardening gaps:
- production containers ran with broad default privileges;
- service health lived mostly in shell-level smoke checks instead of container health state;
- the Sentry tunnel was public without dedicated abuse controls;
- release promotion did not yet include image scanning, SBOM generation, or signature verification;
- implementation work risked drifting when started from stale branches instead of updated `main`.

## Decision
Keep the current single-stack `docker compose` deployment model, but harden runtime and release controls.

- Run the API container as a non-root user and move the web container to an unprivileged nginx image.
- Add container healthchecks and use them as part of deploy readiness.
- Add defensive runtime defaults in production compose, including read-only filesystems where supported, explicit tmpfs mounts, `cap_drop`, and `no-new-privileges`.
- Add dedicated abuse controls to the public Sentry tunnel.
- Add build cache, image vulnerability scanning, SBOM generation, keyless signing, and signature verification to the production workflow.
- Start new delivery work from `origin/main` to avoid continuing on already-merged or stale branches.

## Consequences
Positive:
- lower runtime blast radius if a container is compromised;
- better deploy readiness signals and less waiting on blind polling;
- stronger supply-chain guarantees before promotion to production;
- fewer lost fixes caused by continuing on stale branches.

Tradeoffs:
- the deploy workflow is more complex and will do more verification work per release;
- stricter runtime settings may require occasional compatibility adjustments;
- this remains a hardened single-stack deploy, not blue/green.
