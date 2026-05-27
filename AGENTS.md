# AGENTS.md - Guardrails para agentes neste repositorio

Este arquivo orienta agentes de IA trabalhando no NextDream. Ele nao substitui a documentacao
do repo; ele aponta para as fontes de verdade e define limites operacionais para mudancas.

## Contexto do produto

NextDream e uma plataforma open source de impacto social que conecta pessoas com doencas graves,
familiares e instituicoes a apoiadores dispostos a ajudar com tempo, presenca e carinho.

NextDream nao e uma plataforma financeira. Nao implemente fluxos de PIX, vaquinhas, doacoes,
carteira, saldo, repasse, pagamento, cobranca ou qualquer transacao monetaria. Se uma mudanca
pedir esse tipo de comportamento, trate como conflito com o produto descrito no [README.md](./README.md)
e exija uma decisao explicita de produto/arquitetura antes de alterar codigo.

## Sistema de agentes e governanca da home

Qualquer agente de IA trabalhando na home publica do NextDream deve seguir tambem a estrutura
operacional em [.agents/](./.agents/). Essa pasta documenta os papeis, fluxo de trabalho,
criterios de aceite e Definition of Done para mudancas na home.

Papeis obrigatorios para trabalhos na home:

1. PO/PM - proposta de valor, clareza, jornada, priorizacao e aceite final.
2. Medico especialista em cuidados paliativos - seguranca emocional, linguagem etica,
   dignidade, privacidade e consentimento.
3. Gerente de Projetos - tarefas rastreaveis, status, bloqueios e controle de conclusao.
4. Front-end / UI / UX - execucao visual e tecnica usando explicitamente a skill
   `frontend-design`.
5. QA - validacao funcional, visual, responsiva, acessivel, de copy e medico/etica antes
   do review do PO/PM.

Regras para home:

- Siga o workflow em [.agents/workflow.md](./.agents/workflow.md).
- Siga a Definition of Done em [.agents/definition-of-done.md](./.agents/definition-of-done.md).
- Siga os guias de imagem e copy em [.agents/image-guidelines.md](./.agents/image-guidelines.md)
  e [.agents/copy-guidelines.md](./.agents/copy-guidelines.md).
- Use [.agents/home-redesign-playbook.md](./.agents/home-redesign-playbook.md) para planejar
  futuras melhorias da home.
- Mudancas de UI/UX/front-end/design devem usar explicitamente a skill `frontend-design`.
- Mudancas na home devem passar por QA e review/aceite do PO/PM antes de serem consideradas
  prontas.
- Riscos medicos, eticos, emocionais, de consentimento, privacidade ou exposicao de
  vulnerabilidade bloqueiam a conclusao ate revisao e correcao.
- Implementado nao significa pronto. Pronto exige codigo/documentacao alterado quando aplicavel,
  criterios atendidos, QA aprovado, PO/PM aprovado e nenhuma pendencia medica/etica bloqueante.
- Nada relacionado a PIX, vaquinha, crowdfunding, doacao financeira, carteira, saldo, repasse,
  pagamento ou cobranca pode ser introduzido.

## Fontes de verdade

Leia nessa ordem antes de mudar qualquer area:

1. [README.md](./README.md) - proposito, stack, execucao local, sandbox e qualidade.
2. [CONTRIBUTING.md](./CONTRIBUTING.md) - commits, PRs, verificacao e politica de branch.
3. [docs/decisions/](./docs/decisions/) - ADRs aceitas e processo para novas decisoes.
4. Os arquivos do slice que sera alterado, incluindo testes existentes.
5. [SECURITY.md](./SECURITY.md), quando a mudanca envolver auth, dados sensiveis, deploy ou dependencia externa.

## Comandos obrigatorios

O ambiente usa `rtk` como proxy de shell. Sempre prefixe comandos com `rtk`.

Antes de concluir qualquer task, rode na raiz:

```bash
rtk npm run lint
rtk npm run typecheck
rtk npm run test
```

Para mudancas focadas na API, os comandos de workspace podem ajudar durante o desenvolvimento,
mas nao substituem os gates da raiz:

```bash
rtk npm run lint --workspace apps/api
rtk npm run typecheck --workspace apps/api
rtk npm run test --workspace apps/api
```

Comandos comuns:

```bash
rtk npm install
rtk npm run setup
rtk docker compose up -d
rtk npm run dev:web
rtk npm run dev:api
rtk npm run seed:local
```

## Convenções de commit e PR

Siga [CONTRIBUTING.md](./CONTRIBUTING.md):

- Use Conventional Commits: `<type>(<scope>): <subject>`.
- Tipos suportados: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `build`, `ci`.
- Mantenha PRs pequenos, focados em um problema.
- Inclua testes para mudancas de comportamento.
- Atualize docs quando contratos, comportamento ou operacao mudarem.
- Nao inclua segredos.
- `main` e protegida; entregue via PR com checks `verify` e `pr-review`.

Nao use `--no-verify` nem pule hooks/checks sem pedido explicito do mantenedor.

## Guardrails de seguranca e privacidade

- Nunca commite `.env`, credenciais, tokens, dumps de banco, chaves privadas ou artefatos com dados reais.
- Novas variaveis de ambiente devem aparecer em [.env.example](./.env.example) com valores seguros de exemplo.
- Use scanners e checks existentes quando a mudanca tocar dependencias, CI/CD ou secrets.
- Trate dados de pacientes, familiares, apoiadores, instituicoes, chats, emails, telefones, enderecos e informacoes de saude como PII/sensiveis.
- Nao registre PII em logs, erros, analytics, Sentry ou testes. Mascare ou agregue quando precisar de diagnostico.
- Mensagens publicas de erro nao devem vazar stack traces, queries, nomes de tabela ou detalhes internos.
- Nao use dados reais em seeds, fixtures ou screenshots.
- Respeite sandbox: `APP_ENV=sandbox` e a experiencia web de sandbox nao podem tocar Postgres, email real, storage real ou dados oficiais.

## Guardrails de arquitetura

- Prefira mudancas pequenas, verificaveis e alinhadas ao slice existente.
- Nao crie abstracao nova sem complexidade real ou padrao local que justifique.
- Preserve fronteiras de web/API/sandbox; evite acoplar UI diretamente a detalhes de persistencia.
- Mudancas de arquitetura, dependencia externa, deploy, modelo de dados, contrato publico ou direcao tecnica exigem ADR em [docs/decisions/](./docs/decisions/).
- Antes de divergir de uma ADR aceita, leia a ADR inteira e proponha nova ADR ou atualizacao documentada.

## Mapa de tarefas

| Tarefa | Primeiro leia | Depois confira |
|---|---|---|
| Rodar ou configurar o projeto | [README.md](./README.md), [.env.example](./.env.example) | [docker-compose.yml](./docker-compose.yml), [package.json](./package.json), [apps/api/package.json](./apps/api/package.json) |
| Fluxos web e rotas | [src/app/routes.ts](./src/app/routes.ts) | [src/app/App.tsx](./src/app/App.tsx), [src/app/components/layout/](./src/app/components/layout/), paginas em [src/app/pages/](./src/app/pages/) |
| UI compartilhada | [src/app/components/shared/](./src/app/components/shared/) | [src/app/components/ui/](./src/app/components/ui/), [src/styles/](./src/styles/) |
| Cliente API web | [src/app/lib/api.ts](./src/app/lib/api.ts) | [src/app/context/AppContext.tsx](./src/app/context/AppContext.tsx), [src/app/config/](./src/app/config/) |
| API NestJS | [apps/api/src/app.module.ts](./apps/api/src/app.module.ts), [apps/api/src/main.ts](./apps/api/src/main.ts) | [apps/api/src/config/env.ts](./apps/api/src/config/env.ts), [apps/api/src/entities/](./apps/api/src/entities/) |
| Auth, sessoes e cookies | [apps/api/src/modules/auth/](./apps/api/src/modules/auth/) | [src/app/pages/auth/](./src/app/pages/auth/), [src/app/lib/api.ts](./src/app/lib/api.ts) |
| Sonhos e propostas | [apps/api/src/modules/dreams/](./apps/api/src/modules/dreams/), [apps/api/src/modules/proposals/](./apps/api/src/modules/proposals/) | [src/app/pages/patient/](./src/app/pages/patient/), [src/app/pages/supporter/](./src/app/pages/supporter/), [src/app/components/shared/DreamCard.tsx](./src/app/components/shared/DreamCard.tsx) |
| Conversas e moderacao financeira | [apps/api/src/modules/conversations/](./apps/api/src/modules/conversations/) | [src/app/components/shared/ConversationChat.tsx](./src/app/components/shared/ConversationChat.tsx), [apps/api/src/sandbox/sandbox-financial-moderation.ts](./apps/api/src/sandbox/sandbox-financial-moderation.ts) |
| Instituicoes e pacientes gerenciados | [docs/decisions/0004-institution-intermediary-accounts.md](./docs/decisions/0004-institution-intermediary-accounts.md), [docs/decisions/0005-managed-patient-access-linking.md](./docs/decisions/0005-managed-patient-access-linking.md) | [apps/api/src/modules/institution/](./apps/api/src/modules/institution/), [src/app/pages/institution/](./src/app/pages/institution/), [apps/api/src/entities/managed-patient.entity.ts](./apps/api/src/entities/managed-patient.entity.ts) |
| Admin | [apps/api/src/modules/admin/](./apps/api/src/modules/admin/) | [src/app/pages/admin/](./src/app/pages/admin/), [src/app/components/layout/AdminLayout.tsx](./src/app/components/layout/AdminLayout.tsx) |
| Sandbox comercial | [docs/decisions/0006-sandbox-environment-without-database.md](./docs/decisions/0006-sandbox-environment-without-database.md), [docs/decisions/0007-sandbox-subdomain-activation.md](./docs/decisions/0007-sandbox-subdomain-activation.md) | [apps/api/src/sandbox/](./apps/api/src/sandbox/), [src/app/config/sandboxExperience.ts](./src/app/config/sandboxExperience.ts), [src/app/pages/SandboxAccess.tsx](./src/app/pages/SandboxAccess.tsx), [docker-compose.sandbox.yml](./docker-compose.sandbox.yml) |
| Email e notificacoes | [apps/api/src/modules/mail/](./apps/api/src/modules/mail/), [apps/api/src/modules/notifications/](./apps/api/src/modules/notifications/) | [apps/api/src/scripts/mail-smoke.ts](./apps/api/src/scripts/mail-smoke.ts), [.env.example](./.env.example) |
| Deploy e supply chain | [docs/decisions/0001-production-deploy-via-ghcr.md](./docs/decisions/0001-production-deploy-via-ghcr.md), [docs/decisions/0002-production-deploy-hardening.md](./docs/decisions/0002-production-deploy-hardening.md), [docs/decisions/0003-production-runtime-and-supply-chain-hardening.md](./docs/decisions/0003-production-runtime-and-supply-chain-hardening.md) | [docker-compose.prod.yml](./docker-compose.prod.yml), [Dockerfile.api](./Dockerfile.api), [Dockerfile.web](./Dockerfile.web), [scripts/deploy-prod-remote.sh](./scripts/deploy-prod-remote.sh), [scripts/deploy-sandbox-remote.sh](./scripts/deploy-sandbox-remote.sh) |
| ADRs | [docs/decisions/README.md](./docs/decisions/README.md) | [docs/decisions/template.md](./docs/decisions/template.md), ADRs existentes em [docs/decisions/](./docs/decisions/) |

## Testes

- Web: Vitest + Testing Library na raiz.
- API: Vitest no workspace `apps/api`, com `sql.js` em testes.
- Mudancas documentais nao exigem testes novos, mas ainda exigem os gates obrigatorios.
- Para smoke operacional de email, use `rtk env MAIL_SMOKE_TO=voce@exemplo.com npm run mail:smoke --workspace apps/api` somente quando a tarefa envolver envio real de email.
