# Presentation Extraction Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extrair a apresentação `/apresentacao` para um projeto Vite independente em `~/export/apresentacao-nextdream`, remover essa rota do app principal e publicar o novo repositório no GitHub Pages.

**Architecture:** O app principal perde a rota de apresentação e segue como produto principal. O conteúdo da apresentação é copiado para um projeto React + Vite minimalista, sem roteador, com `base` configurado para GitHub Pages e workflow de deploy próprio. A validação final cobre os dois projetos antes da publicação.

**Tech Stack:** React, Vite, TypeScript, GitHub Actions, GitHub Pages

---

## Chunk 1: Planejamento E Mapeamento

### Task 1: Mapear arquivos e dependências da apresentação

**Files:**
- Modify: `src/app/pages/presentation/Presentation.tsx`
- Modify: `package.json`
- Create: `docs/superpowers/specs/2026-03-25-presentation-extraction-design.md`
- Create: `docs/superpowers/plans/2026-03-25-presentation-extraction.md`

- [ ] **Step 1: Identificar imports, assets e bibliotecas usadas pela apresentação**

Run: `sed -n '1,260p' src/app/pages/presentation/Presentation.tsx`
Expected: lista clara de imports e possíveis dependências a transportar.

- [ ] **Step 2: Verificar scripts de validação existentes no app principal**

Run: `sed -n '1,220p' package.json`
Expected: confirmar se há `build`, `lint`, `typecheck` e `test`.

- [ ] **Step 3: Registrar spec e plano**

Expected: arquivos de documentação criados em `docs/superpowers/specs/` e `docs/superpowers/plans/`.

## Chunk 2: Novo Projeto De Apresentação

### Task 2: Criar o projeto Vite isolado em `~/export/apresentacao-nextdream`

**Files:**
- Create: `/home/renanmpimentel/export/apresentacao-nextdream/package.json`
- Create: `/home/renanmpimentel/export/apresentacao-nextdream/tsconfig.json`
- Create: `/home/renanmpimentel/export/apresentacao-nextdream/vite.config.ts`
- Create: `/home/renanmpimentel/export/apresentacao-nextdream/index.html`
- Create: `/home/renanmpimentel/export/apresentacao-nextdream/src/main.tsx`
- Create: `/home/renanmpimentel/export/apresentacao-nextdream/src/App.tsx`
- Create: `/home/renanmpimentel/export/apresentacao-nextdream/src/presentation/Presentation.tsx`
- Create: `/home/renanmpimentel/export/apresentacao-nextdream/src/assets/*`
- Create: `/home/renanmpimentel/export/apresentacao-nextdream/src/styles/*`

- [ ] **Step 1: Escrever um teste ou verificação mínima de build inexistente**

Expected: definir o build do novo projeto como primeira verificação automatizada do artefato extraído.

- [ ] **Step 2: Criar o esqueleto do projeto com `base` do GitHub Pages**

Expected: projeto React + Vite com `base: '/apresentacao-nextdream/'`.

- [ ] **Step 3: Copiar a apresentação e adaptar imports/assets**

Expected: a apresentação renderiza sem depender de rotas, layouts ou aliases do projeto principal.

- [ ] **Step 4: Rodar build do novo projeto**

Run: `npm run build`
Expected: build concluído sem erro e saída em `dist/`.

### Task 3: Preparar deploy do GitHub Pages

**Files:**
- Create: `/home/renanmpimentel/export/apresentacao-nextdream/.github/workflows/deploy.yml`
- Create: `/home/renanmpimentel/export/apresentacao-nextdream/.gitignore`
- Create: `/home/renanmpimentel/export/apresentacao-nextdream/README.md`

- [ ] **Step 1: Criar workflow de build e publish**

Expected: workflow acionado em push para branch principal, publicando no Pages.

- [ ] **Step 2: Documentar execução local e deploy**

Expected: README com instruções mínimas.

## Chunk 3: Limpeza Do App Principal

### Task 4: Remover a rota `/apresentacao` do app principal

**Files:**
- Modify: `src/app/routes.ts`
- Delete: `src/app/pages/presentation/Presentation.tsx`

- [ ] **Step 1: Escrever verificação da remoção**

Expected: confirmar que nenhuma rota restante aponta para `/apresentacao`.

- [ ] **Step 2: Remover import e entrada da rota**

Expected: `routes.ts` sem `Presentation` e sem `path: 'apresentacao'`.

- [ ] **Step 3: Remover a página antiga**

Expected: arquivo deletado para evitar duplicação.

- [ ] **Step 4: Rodar build do app principal**

Run: `npm run build`
Expected: app principal compila sem a rota extraída.

## Chunk 4: Publicação E Verificação Final

### Task 5: Validar, criar repositório remoto e publicar

**Files:**
- Modify: `/home/renanmpimentel/export/apresentacao-nextdream/.github/workflows/deploy.yml`
- Modify: `/home/renanmpimentel/export/apresentacao-nextdream/package.json`

- [ ] **Step 1: Rodar lint, typecheck e testes disponíveis no app principal**

Run: comandos existentes em `package.json`
Expected: tudo verde ou ausência explícita de scripts.

- [ ] **Step 2: Rodar lint, typecheck e testes disponíveis no novo projeto**

Run: comandos existentes em `/home/renanmpimentel/export/apresentacao-nextdream/package.json`
Expected: tudo verde ou ausência explícita de scripts.

- [ ] **Step 3: Inicializar git no novo projeto e criar repositório GitHub**

Run: `git init`, `gh repo create renanmpimentel/apresentacao-nextdream --public --source=. --remote=origin --push`
Expected: repositório remoto criado.

- [ ] **Step 4: Habilitar GitHub Pages e validar URL publicada**

Expected: workflow executado e site acessível em `https://renanmpimentel.github.io/apresentacao-nextdream/`.
