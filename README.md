# NextDream 💙 — Conectando sonhos

O **NextDream** é uma plataforma de impacto social que conecta **pessoas com doenças graves (inclusive em estágios terminais)** a **apoiadores** dispostos a ajudar com **tempo, presença e carinho**.

> "Não se trata de quanto você tem, mas de quanto você está disposto a compartilhar do seu tempo, presença e carinho."

## 🎯 Propósito

Criar uma **rede de apoio humana** para quem está vivendo momentos difíceis, onde pequenos gestos (uma conversa, uma experiência, uma companhia) podem transformar vidas de maneiras que o dinheiro não consegue.

## 💡 Como funciona

1. **Pacientes cadastram sonhos**
Pessoas com doenças graves ou seus familiares compartilham sonhos e desejos (experiências, encontros, aprendizados).

2. **Apoiadores enviam propostas**
Pessoas dispostas a ajudar navegam pelos sonhos e enviam propostas de como podem contribuir.

3. **Conexão e realização**
Quando uma proposta é aceita, o contato é liberado para que as partes combinem os detalhes e realizem o sonho juntas.

## 🚫 O que o NextDream NÃO é

O NextDream **não é** uma plataforma de arrecadação de dinheiro.
**Não permitimos pedidos de PIX, doações financeiras, vaquinhas ou qualquer transação monetária.**
Nosso foco é 100% em **conexão humana** através de presença, tempo e carinho.

## 📌 Status do projeto

- [x] MVP com fluxos centrais funcionando localmente (autenticação, sonhos, propostas, conversa e módulo admin)
- [x] Estrutura de contribuição ([CONTRIBUTING.md](./CONTRIBUTING.md))
- [x] Código de Conduta ([CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md))
- [ ] Roadmap público

## 🧩 Stack e arquitetura (resumo)

- **Web**: React + Vite (na raiz do repositório)
- **API**: NestJS + TypeORM (`apps/api`)
- **Infra local**: Docker Compose com Postgres, Redis, MinIO e Mailpit
- **Monorepo npm workspaces**: scripts unificados na raiz

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js 22+
- npm 10+
- Docker + Docker Compose

### Setup rápido

```bash
npm install
npm run setup
docker compose up -d
```

### Subir aplicação

Em terminais separados:

```bash
npm run dev:api
npm run dev:web
```

Acesse:

- Web: `http://localhost:5173`
- API (health): `http://localhost:4000/health`
- Mailpit: `http://localhost:8025`

### Seed local (dados de demonstração)

```bash
npm run seed:local
```

Credenciais padrão do seed (`password: Seed123!`):

- `paciente1@nextdream.local`
- `paciente2@nextdream.local`
- `apoiador1@nextdream.local`
- `apoiador2@nextdream.local`
- `admin@nextdream.local`

### Sandbox comercial sem banco

O repositório agora suporta um modo de execução separado para demo comercial:

- API: `APP_ENV=sandbox`
- Web em produção: `VITE_SANDBOX_HOSTNAME=sandbox.nextdream.ong.br`
- Web local/teste: `VITE_APP_ENV=sandbox` apenas em `localhost`, `127.0.0.1` e testes automatizados
- estado em memória por sessão
- sem Postgres, sem e-mail real, sem storage real
- entrada pública em `https://sandbox.nextdream.ong.br/sandbox` com acessos demo para paciente, apoiador e instituição
- sessão isolada no sandbox removendo `AUTH_COOKIE_DOMAIN` do deploy desse subdomínio

O deploy ideal publica produção e sandbox a partir do mesmo commit. Em produção, o contexto sandbox liga pelo hostname `sandbox.nextdream.ong.br`; no desenvolvimento local e nos testes, o fallback continua sendo `VITE_APP_ENV=sandbox`.

## ✅ Qualidade antes de concluir uma task

```bash
npm run lint
npm run typecheck
npm run test
```

## 🤝 Seja parte disso

- **💙 Seja um Apoiador**
Ofereça seu tempo, habilidades ou companhia para realizar sonhos.

- **🏥 Seja um Parceiro (hospitais, ONGs e empresas)**
Junte-se a nós para ampliar essa rede de cuidado e impacto.

- **👩‍💻 Contribua com o open source**
Ajude a construir a plataforma para que ela possa ser replicada por comunidades em diferentes lugares.

## 🌍 Open source e escalabilidade

O NextDream está sendo desenvolvido como **open source** para permitir que **comunidades, hospitais e ONGs** possam **replicar, adaptar e escalar** a iniciativa com transparência e colaboração.

## 🔐 Segurança, cuidado e respeito

O NextDream é construído com base em **empatia, solidariedade e respeito mútuo**.

- Segurança: veja [SECURITY.md](./SECURITY.md)
- Suporte geral: veja [SUPPORT.md](./SUPPORT.md)
- Mudanças de arquitetura devem ser registradas em `docs/decisions/` (ADR)

## 📬 Contato

- Para bugs e melhorias: abra uma Issue neste repositório
- Para reporte responsável de segurança: `security@nextdream.ong.br`

## 🧾 Licença

Distribuído sob licença **MIT**. Veja [LICENSE](./LICENSE).

"Juntos, podemos transformar sonhos em realidade e trazer luz para quem mais precisa."
