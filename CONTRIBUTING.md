# Contributing

## Commit Convention

Use Conventional Commits for every commit:

```text
<type>(<scope>): <subject>
```

Rules:

- Write the subject in the imperative.
- Keep the subject short and specific.
- Use lowercase types and scopes.
- Use `!` only for breaking changes.

Supported types:

- `feat`: new functionality
- `fix`: bug fix
- `refactor`: internal code change without behavior change
- `test`: tests only
- `docs`: documentation only
- `chore`: tooling, config, dependencies, scripts
- `perf`: performance improvement
- `build`: build or packaging changes
- `ci`: CI/CD workflow changes

Examples:

```text
feat(auth): add persistent session bootstrap
fix(dreams): prevent duplicate proposal submission
refactor(api): extract notification event publisher
test(chat): cover unread counter updates
docs(architecture): document websocket message flow
chore(repo): add commit message template
```

## Verification

Before considering a task complete, run:

```bash
npm run lint
npm run typecheck
npm run test
```

And for the API workspace:

```bash
npm run lint --workspace apps/api
npm run typecheck --workspace apps/api
npm run test --workspace apps/api
```
