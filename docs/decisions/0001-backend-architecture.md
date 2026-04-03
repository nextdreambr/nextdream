# ADR 0001: Backend local com NestJS e serviços Docker

## Status
Accepted

## Contexto

O frontend atual do NextDream foi exportado do Figma Make e hoje funciona com dados em memória e fluxos simulados. O projeto precisa validar localmente antes de qualquer publicação, incluindo banco, cache, envio de e-mail e storage.

## Decisão

- Manter o frontend atual na raiz do repositório.
- Adicionar um backend NestJS em `apps/api`.
- Padronizar desenvolvimento local com `docker-compose` para Postgres, Redis, MinIO e Mailpit.
- Usar JWT + refresh token próprios para autenticação e RBAC.
- Remover mocks por domínio, priorizando `auth`, `dreams`, `proposals`, `chat` e `admin`.

## Consequências

- O projeto passa a ter validação local completa sem serviços externos.
- O frontend deixa de depender de `mockData.ts` e `AppContext` como fonte de verdade.
- O custo inicial de setup aumenta, mas reduz risco de integração e aproxima o ambiente local do comportamento real do produto.
