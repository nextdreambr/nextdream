# NextDream Presentation Extraction Design

**Date:** 2026-03-25
**Status:** Approved

## Goal

Separar a rota pública `/apresentacao` do projeto `nextdream-final` para um projeto independente em `~/export/apresentacao-nextdream`, preparado para publicação em `https://renanmpimentel.github.io/apresentacao-nextdream/` via GitHub Pages.

## Scope

- Extrair apenas a apresentação.
- Não mover landing page, FAQ, segurança, contato, parcerias ou fluxos autenticados.
- Remover a rota `/apresentacao` do app principal após a extração.
- Criar um novo repositório GitHub `renanmpimentel/apresentacao-nextdream`.
- Publicar o novo projeto no GitHub Pages.

## Architecture

O app principal continua como aplicação React + Vite com roteamento completo. A apresentação vira um segundo projeto React + Vite estático, sem `react-router`, com uma única entrada e `base` configurado para `/apresentacao-nextdream/`.

A extração deve levar apenas os arquivos e dependências realmente usados pela apresentação: componente principal, assets, estilos necessários e bibliotecas diretamente consumidas pela página. O objetivo é eliminar acoplamento com layouts, contexto global e demais rotas do app principal.

## Project Boundaries

### App principal

- Remove a importação da página `Presentation`.
- Remove a rota pública `/apresentacao`.
- Mantém intactos os demais fluxos e páginas.

### Novo projeto

- Estrutura Vite mínima.
- Página raiz renderiza a apresentação.
- Build estático compatível com GitHub Pages.
- Workflow de deploy automático via GitHub Actions.

## Deployment Design

- Repositório alvo: `renanmpimentel/apresentacao-nextdream`
- URL alvo: `https://renanmpimentel.github.io/apresentacao-nextdream/`
- `vite.config.*` do novo projeto usa `base: '/apresentacao-nextdream/'`
- Deploy por GitHub Actions com artifact + Pages deploy action

## Risks And Mitigations

- **Acoplamento escondido com o app principal**
  Mitigação: copiar apenas o componente e dependências diretas, removendo imports do roteador/layout/contexto.

- **Assets quebrados no GitHub Pages**
  Mitigação: configurar `base` correto no Vite e validar build local.

- **Dependências excessivas herdadas do projeto principal**
  Mitigação: montar `package.json` enxuto para o novo projeto e instalar só o necessário.

- **Workspace raiz com muitas mudanças não relacionadas**
  Mitigação: limitar alterações ao diretório `nextdream-final` e ao novo diretório `~/export/apresentacao-nextdream`.

## Validation

### App principal

- `npm run build`

### Novo projeto

- `npm run build`

### Antes de concluir

- Rodar lint, typecheck e testes onde existirem scripts correspondentes.
- Confirmar publicação no GitHub Pages com URL final acessível.
