# ADR 0009: Dream Original Language and Translations

## Date

2026-05-27

## Status

Proposed

## Deciders

- Product owner
- Technical maintainer
- Front-end / UI / UX reviewer
- Medical and ethical reviewer

## Context

NextDream now supports a multilingual interface, but dream stories must remain authentic to the
person or family who shared them. Translating `title` and `description` directly into the canonical
fields would blur authorship, make review harder, and risk turning automatic text into the official
story.

The product needs optional reader assistance for supported app locales (`pt-BR`, `en-US`, `es-ES`)
without changing the original dream content, adding facts, or creating a bulk translation workflow.
The sandbox must keep route parity while staying database-free.

## Options Considered

1. **Replace title and description with localized values** - Simple for display, but loses the
   original story as the source of truth and creates medical/ethical review risk.
2. **Store an auxiliary translation cache per dream** - Keeps the original fields intact, allows
   reversible display, and avoids repeated provider calls for the same locale.
3. **Translate only in the browser without caching** - Avoids schema change, but repeats provider
   work and makes admin review of generated text impossible.

## Decision

Add `originalLanguage` to `Dream`, defaulting legacy records to `pt-BR`, and add a nullable JSON
`translations` cache keyed by supported locale. The canonical `title` and `description` remain the
only official story fields.

Expose `POST /dreams/:dreamId/translations` for optional on-demand translation. The endpoint rejects
unsupported locales and same-language requests, returns cached translations when present, and calls
OpenAI Responses API only when a supported target locale is missing from the cache. Generated entries
use `source: "machine"`; `source: "human"` and manual review/editing are reserved for future admin
work.

The OpenAI prompt may translate only `title` and `description`, must preserve the human tone, and
must not add facts, medical interpretation, persuasion, softening, or dramatization. If the provider
is not configured or fails, the API returns a controlled error and the frontend keeps the original
story visible.

In sandbox mode, dreams carry the same language fields in memory and use the same translation service
when configured. Without `OPENAI_API_KEY`, sandbox returns the same controlled unavailable response.

Manual admin editing, human review workflow, automatic translation during listing, and bulk
backfills are intentionally out of scope for this MVP.

## Consequences

### Positive

- Original patient and family language remains the source of truth.
- Readers can request assistance in their selected app language without losing context.
- Cached translations reduce repeated provider calls.
- Admin can see existing machine translations and review metadata.
- Sandbox keeps API shape parity with production.

### Negative

- Dream schema gains two fields that production databases must sync before deploy.
- Machine translations can still require future review before being treated as fully trusted copy.
- Public on-demand translation introduces provider cost and should remain rate-limited.

### Neutral

- Existing dreams default to `pt-BR`.
- Translation cache invalidates when original title, description, or original language changes.
- Future human review can fill `reviewedAt` and change `source` without changing the canonical story.

## References

- OpenAI Responses API: https://platform.openai.com/docs/api-reference/responses
- OpenAI text generation guide: https://platform.openai.com/docs/guides/text
