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
  - `.github/workflows/deploy-prod.yml` (deploys after successful `CI` on `main` via self-hosted runner)

Required GitHub Environment `production` values:

- Secrets:
  - `PROD_DATABASE_URL`
  - `PROD_JWT_ACCESS_SECRET`
  - `PROD_JWT_REFRESH_SECRET`
- Variables:
  - `NODE_ENV`
  - `API_PORT`
  - `APP_URL`
  - `CORS_ORIGIN`
  - `VITE_API_URL`
  - `APP_DIR` (recommended: `/opt/nextdream`)

## Quality Gates

Before opening a PR, run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Repository Conventions

- Prefer small, verifiable changes (vertical slices)
- Never commit secrets

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security

See [SECURITY.md](./SECURITY.md).

## License

MIT — see [LICENSE](./LICENSE).
  
