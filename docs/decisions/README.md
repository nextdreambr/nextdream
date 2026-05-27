# NextDream Architecture Decision Records

Este diretorio guarda as Architecture Decision Records (ADRs) do NextDream. O objetivo e manter
um historico curto e rastreavel de decisoes tecnicas relevantes: o problema, as alternativas,
a decisao tomada e as consequencias esperadas.

ADRs documentam o "por que" por tras da arquitetura. Elas nao substituem README, specs,
issues ou PRs.

## Quando criar ADR

Crie uma ADR quando a decisao:

- alterar arquitetura, modelo de dados, deploy, observabilidade, seguranca ou dependencia externa;
- mudar contratos entre web, API, sandbox, infraestrutura ou integracoes;
- estabelecer um padrao que outros componentes devem seguir;
- tiver trade-offs relevantes ou efeitos que continuam depois da task atual;
- divergir, suplantar ou complementar uma ADR existente.

Decisoes triviais, refactors locais e implementacoes que se esgotam em uma task pequena nao
precisam de ADR.

## Como abrir uma ADR

1. Leia as ADRs existentes neste diretorio.
2. Copie [template.md](./template.md) para `docs/decisions/NNNN-short-title-in-kebab-case.md`.
3. Use o proximo numero sequencial disponivel com quatro digitos.
4. Comece com status `Proposed`.
5. Descreva contexto, opcoes consideradas, decisao e consequencias.
6. Se a ADR substituir outra, marque a antiga como `Superseded by NNNN-title.md`.
7. Atualize o indice abaixo no mesmo PR.
8. Apos aprovacao, mude o status para `Accepted`.

## Estados suportados

| Status | Significado |
|---|---|
| `Proposed` | A decisao foi proposta e esta em discussao. |
| `Accepted` | A decisao foi aprovada e esta em vigor. |
| `Rejected` | A decisao foi discutida e rejeitada. |
| `Deprecated` | A decisao ja esteve em vigor, mas nao deve orientar novas mudancas. |
| `Superseded by NNNN-title.md` | A decisao foi substituida por uma ADR mais nova. |

## Indice

| ADR | Titulo | Status | Quando consultar |
|---|---|---|---|
| [0001](./0001-production-deploy-via-ghcr.md) | Production Deploy via GHCR Images on OCI | Accepted | Deploy de producao, GHCR, OCI, rollback por tag. |
| [0002](./0002-production-deploy-hardening.md) | Production Deploy Hardening on OCI | Accepted | Digest pinning, rollback state, deploy sem `down` destrutivo. |
| [0003](./0003-production-runtime-and-supply-chain-hardening.md) | Production Runtime and Supply Chain Hardening | Accepted | Hardening de runtime, healthchecks, scanning, SBOM e assinatura. |
| [0004](./0004-institution-intermediary-accounts.md) | Institution Intermediary Accounts | Accepted | Papel `instituicao`, pacientes gerenciados e operacao intermediada. |
| [0005](./0005-managed-patient-access-linking.md) | Managed Patient Access Linking | Accepted | Convite e vinculacao de paciente real a caso gerenciado por instituicao. |
| [0006](./0006-sandbox-environment-without-database.md) | Sandbox Environment Without Database | Accepted | Sandbox comercial sem banco, servicos em memoria e paridade de rotas. |
| [0007](./0007-sandbox-subdomain-activation.md) | Sandbox Activation by Subdomain | Accepted | Ativacao web do sandbox por hostname e isolamento de cookies. |
| [0008](./0008-admin-proposal-updated-at.md) | Proposal Update Timestamp for Admin Operations | Accepted | Timestamp real de atualizacao para operacao admin de propostas. |
| [0009](./0009-dream-original-language-and-translations.md) | Dream Original Language and Translations | Proposed | Idioma original, cache auxiliar de traducoes e uso do OpenAI Responses API. |

## Referencias

- [adr.github.io](https://adr.github.io/)
- [MADR - Markdown Any Decision Records](https://adr.github.io/madr/)
