# ADR 0004: Use OCI self-hosted runner for production deploy

Date: 2026-04-09

## Status
Accepted

## Context

- Deploy from GitHub-hosted runners to OCI over inbound SSH has been unstable (`handshake timeout/reset`).
- The production deploy performs Docker builds on a low-resource VM, which increases connection duration and failure risk.
- We need a reliable and deterministic deployment path.

## Decision

- Replace SSH-based remote deployment with a self-hosted GitHub Actions runner running on the OCI VM.
- `Deploy Production` workflow will run directly on labels `[self-hosted, linux, oci-prod]`.
- Workflow writes `.env.production` from GitHub Environment `production` values and runs `docker compose -f docker-compose.prod.yml up -d --build` locally on the VM.

## Consequences

- Deploy no longer depends on inbound SSH reachability from GitHub-hosted IPs.
- OCI host must keep runner service healthy and online.
- Existing OCI SSH secrets become optional for deployment (can be kept temporarily for admin access only).
