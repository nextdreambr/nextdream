# NextDream

NextDream is a local-first monorepo with:

- Web app (`React + Vite`) in the repository root
- API (`NestJS + TypeORM`) in `apps/api`
- Local infrastructure via Docker Compose (`Postgres`, `Redis`, `MinIO`, `Mailpit`)

## Status

The core flows are implemented and validated locally:

- Authentication (`register/login`)
- Dreams and proposals
- Conversation/chat with polling
- Admin operational module (overview, moderation, audit trail)

## Requirements

- Node.js 22+
- npm 10+
- Docker + Docker Compose

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Initialize local environment file:

```bash
npm run setup
```

3. Start local infrastructure:

```bash
docker compose up -d
```

4. Start API and web app (separate terminals):

```bash
npm run dev:api
npm run dev:web
```

5. Open:

- Web: `http://localhost:5173`
- API health: `http://localhost:4000/health`
- Local mail inbox (Mailpit): `http://localhost:8025`

New registrations now trigger a welcome email through SMTP (`SMTP_*` vars in `.env.local`).

## Local Seed (for flow validation)

Populate deterministic local demo data (users, dreams, proposals, conversation, admin report/contact):

```bash
npm run seed:local
```

Default seeded credentials (`password: Seed123!`):

- `paciente1@nextdream.local`
- `paciente2@nextdream.local`
- `apoiador1@nextdream.local`
- `apoiador2@nextdream.local`
- `admin@nextdream.local`

## Environment

`npm run setup` creates `.env.local` from `.env.example` if it does not exist.
Review and adjust `.env.local` for your machine if needed.
For production deployment, use `.env.production.example` as a template and keep real values in secrets/environment managers.

## Production Deployment

- Build/runtime assets:
  - `Dockerfile.web`
  - `Dockerfile.api`
  - `docker-compose.prod.yml`
- CI/CD:
  - `.github/workflows/deploy-prod.yml` (deploys after successful `CI` on `main`, and supports manual rollback by tag)

### Release flow

- `CI` validates `lint`, `typecheck`, `test`, and `build`.
- `Deploy Production` resolves a release tag (`commit SHA` by default).
- In `deploy` mode, images are built and pushed to GHCR:
  - `ghcr.io/<owner>/<repo>-api:<tag>`
  - `ghcr.io/<owner>/<repo>-web:<tag>`
- OCI host pulls images by tag and runs `docker compose -f docker-compose.prod.yml up -d`.
- Deployed tag is recorded in `$APP_DIR/.release-tag`.

### Rollback flow

- Trigger `Deploy Production` manually with:
  - `release_mode=rollback`
  - `image_tag=<previous_tag>`
- Workflow redeploys the selected immutable tag without rebuilding.

Required GitHub Environment `production` values:

- Secrets:
  - `PROD_DATABASE_URL`
  - `PROD_JWT_ACCESS_SECRET`
  - `PROD_JWT_REFRESH_SECRET`
  - `OCI_SSH_KEY`
  - `OCI_KNOWN_HOSTS`
  - `GHCR_USERNAME`
  - `GHCR_TOKEN`
- Variables:
  - `OCI_HOST`
  - `OCI_USER`
  - `OCI_PORT` (default: `22`)
  - `NODE_ENV`
  - `API_PORT`
  - `APP_URL`
  - `CORS_ORIGIN`
  - `VITE_API_URL`
  - `SENTRY_DSN_WEB`
  - `SENTRY_DSN_API`
  - `SENTRY_TRACES_SAMPLE_RATE`
  - `APP_DIR` (recommended: `/opt/nextdream`)
  - `WEB_BIND_ADDRESS` (optional, default: `127.0.0.1`; use `0.0.0.0` if no reverse proxy is terminating traffic on the host)

## Quality Gates

Before opening a PR, run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

For PR security parity, also run:

```bash
npm audit --omit=dev --audit-level=high --json > audit-report.json
node scripts/ci/check-audit-baseline.mjs .github/security/audit-baseline.json audit-report.json
docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest dir /repo --redact --exit-code 1
```

## Automated PR Review Agent

- Workflow: `.github/workflows/pr-review.yml`
- Job name: `pr-review`
- Blocking gates:
  - `lint`
  - `typecheck`
  - `test`
  - `gitleaks` secret scan
  - `npm audit` baseline regression gate (prod deps, high/critical only)

Set `pr-review` as a required status check in branch protection for `main`.

## Branch Governance & Review Policy

- `main` is protected and can only be updated through Pull Request
- Required checks on `main`: `verify` and `pr-review`
- Required PR review on `main`: minimum `1` approval
- CODEOWNERS approval is required for PRs targeting `main`
- Branch protection is enforced for admins (`enforce_admins: true`)
- Only maintainer `@renanmpimentel` should perform merges to `main`

## AI-Assisted PR Review (Free)

- Tool configured: `CodeRabbit` (free tier for public repositories)
- Repo config file: `.coderabbit.yaml`
- Install/enable the CodeRabbit GitHub App on this repository to receive automatic review comments on every PR

## Repository Conventions

- Prefer small, verifiable changes (vertical slices)
- Never commit secrets

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security

See [SECURITY.md](./SECURITY.md).

## License

MIT — see [LICENSE](./LICENSE).
  
