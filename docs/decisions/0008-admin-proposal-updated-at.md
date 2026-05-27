# ADR 0008: Proposal Update Timestamp for Admin Operations

## Date

2026-05-18

## Status

Accepted

## Deciders

- Admin Technical Planner
- Admin UX/UI Reviewer

## Context

The admin proposal screen needs to show when a proposal was last changed, not only when it was
created. Proposal status can be changed by administrators during operational triage, and the list
must expose "ultima atualizacao" without using placeholder or derived fake data.

The existing `Proposal` model only stored `createdAt`, so the admin could not distinguish a newly
submitted proposal from an older proposal recently moved to analysis, rejected, accepted or expired.

## Options Considered

1. **Reuse `createdAt` as last update** - No schema change, but misleading operational data.
2. **Add `updatedAt` to `Proposal`** - Small model change that stores the real last modification
   time and supports future audit views.
3. **Read last update from audit logs only** - Avoids changing the proposal table, but fails for
   non-admin proposal changes and makes list queries harder to reason about.

## Decision

Add an `updatedAt` column to `Proposal` using TypeORM `UpdateDateColumn`. The admin API returns
this timestamp in proposal list and detail responses. Existing environments that do not use
automatic schema synchronization must run the repository schema sync or equivalent migration before
deploying this slice.

This decision is scoped to proposal operational metadata. It does not introduce financial flows,
payments, donations, wallet behavior or any monetary transaction.

## Consequences

### Positive

- Admin proposal lists can show real last-update data.
- Status changes update proposal metadata automatically.
- Future proposal audit and sorting work can use a stable timestamp.

### Negative

- Production databases need schema synchronization or migration for the new column.

### Neutral

- `createdAt` remains the submission timestamp.
- Audit logs remain the source of who changed a proposal and why.

## References

- Admin proposal redesign implementation.
