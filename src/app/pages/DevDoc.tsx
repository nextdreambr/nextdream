import { useState, useCallback } from 'react';
import { Copy, Check, Eye, Code, ChevronDown, ChevronUp, FileText, Terminal } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   THE DOCUMENT
   This is the full AI context / system prompt for NextDream.
   Keep this updated as the project evolves.
───────────────────────────────────────────────────────────────── */
const MARKDOWN = `# NextDream — Documento de Contexto para IA
> Versão 1.4.0 · Atualizado em 01 mar 2026  
> Use este documento como contexto inicial em sessões com Claude, Codex ou qualquer LLM para continuar o desenvolvimento do projeto.

---

## 1. O que é o NextDream

NextDream é uma **plataforma web responsiva** (protótipo navegável) que conecta pacientes (ou familiares/cuidadores) que compartilham sonhos e desejos com **apoiadores voluntários** que oferecem tempo, presença e companhia — **sem nenhuma transação financeira**.

- Visual: leve, humano, acolhedor, com linguagem empática, esperança e confiança
- Cor primária da marca: \`#D91B8C\` (rosa/magenta)
- Atualmente: **protótipo front-end puro** com dados mockados — sem backend real ainda
- Próxima etapa planejada: integração com Supabase (auth, banco, storage, realtime)

---

## 2. Tech Stack — CRÍTICO

\`\`\`
Framework:     React 19 + TypeScript
Roteamento:    react-router v7 (Data Mode)  ← NUNCA use react-router-dom
Estilização:   Tailwind CSS v4             ← NUNCA crie tailwind.config.js
Ícones:        lucide-react
Gráficos:      recharts
Animação:      motion/react  (import { motion } from 'motion/react')
State global:  React Context (AppContext)
Build:         Vite
UI base:       shadcn/ui (componentes em /src/app/components/ui/)
\`\`\`

### Regras críticas de importação

\`\`\`tsx
// ✅ CORRETO
import { useNavigate, Link, useLocation } from 'react-router';
import { createBrowserRouter, RouterProvider }  from 'react-router';

// ❌ ERRADO — não existe neste projeto
import { ... } from 'react-router-dom';
\`\`\`

### Tailwind v4 — não usar config externo

\`\`\`tsx
// ✅ OK — classes inline
<div className="bg-pink-600 text-white rounded-2xl px-5 py-3">

// ✅ OK — tokens do tema via CSS vars (definidos em /src/styles/theme.css)
<div className="bg-[var(--primary)] text-[var(--primary-foreground)]">

// ❌ NÃO criar tailwind.config.js nem tailwind.config.ts
\`\`\`

### Fontes

\`\`\`css
/* Importações de fonte SOMENTE em /src/styles/fonts.css */
@import url('https://fonts.googleapis.com/...');
\`\`\`

---

## 3. Estrutura de Arquivos

\`\`\`
/src
├── app/
│   ├── App.tsx                         ← entrypoint, só RouterProvider
│   ├── routes.ts                       ← todas as rotas (createBrowserRouter)
│   ├── context/
│   │   └── AppContext.tsx              ← estado global, RBAC, usuário, notificações
│   ├── components/
│   │   ├── layout/
│   │   │   ├── RootLayout.tsx          ← wrapper raiz (AppProvider + DemoBar)
│   │   │   ├── PublicLayout.tsx        ← header + footer público
│   │   │   ├── PatientLayout.tsx       ← sidebar/nav do paciente
│   │   │   ├── SupporterLayout.tsx     ← sidebar/nav do apoiador
│   │   │   ├── AdminLayout.tsx         ← sidebar escura do admin
│   │   │   └── DemoBar.tsx             ← barra fixa de troca de role (demo)
│   │   ├── shared/
│   │   │   ├── DreamCard.tsx           ← card reutilizável de sonho
│   │   │   ├── EmptyState.tsx          ← estado vazio genérico
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── StatusBadge.tsx         ← badge de status de sonho/proposta
│   │   ├── figma/
│   │   │   └── ImageWithFallback.tsx   ← substituto do <img> (NÃO modificar)
│   │   └── ui/                         ← shadcn/ui (NÃO modificar)
│   ├── data/
│   │   ├── mockData.ts                 ← dados fictícios (usuários, sonhos, propostas, chats)
│   │   └── publicDreams.ts             ← sonhos exibidos na landing e área pública
│   └── pages/
│       ├── Landing.tsx
│       ├── HowItWorks.tsx
│       ├── Security.tsx
│       ├── FAQ.tsx
│       ├── Terms.tsx
│       ├── Privacy.tsx
│       ├── Guidelines.tsx
│       ├── PRD.tsx                     ← PRD visual navegável
│       ├── DevDoc.tsx                  ← este documento (para IA)
│       ├── PublicDreamDetail.tsx
│       ├── NotFound.tsx
│       ├── auth/
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── ProfileSelect.tsx
│       │   └── ForgotPassword.tsx
│       ├── onboarding/
│       │   ├── PatientOnboarding.tsx   ← wizard 4 etapas
│       │   └── SupporterOnboarding.tsx ← wizard 4 etapas
│       ├── patient/
│       │   ├── PatientDashboard.tsx
│       │   ├── CreateDream.tsx
│       │   ├── MyDreams.tsx
│       │   ├── DreamDetail.tsx
│       │   ├── PatientProposals.tsx
│       │   ├── PatientChat.tsx
│       │   ├── PatientProfile.tsx
│       │   ├── PatientNotifications.tsx
│       │   └── DreamCompletion.tsx     ← tela de celebração standalone
│       ├── supporter/
│       │   ├── SupporterDashboard.tsx
│       │   ├── ExploreDreams.tsx
│       │   ├── SupporterDreamDetail.tsx
│       │   ├── MyProposals.tsx
│       │   ├── SupporterChat.tsx
│       │   ├── SupporterProfile.tsx
│       │   └── SupporterNotifications.tsx
│       └── admin/
│           ├── AdminOverview.tsx
│           ├── AdminUsers.tsx
│           ├── AdminDreams.tsx
│           ├── AdminProposals.tsx
│           ├── AdminChats.tsx
│           ├── AdminReports.tsx        ← central de denúncias
│           ├── AdminSettings.tsx
│           ├── AdminAudit.tsx
│           └── AdminEmailTemplates.tsx
├── styles/
│   ├── theme.css                       ← tokens CSS (primary, background, radius…)
│   ├── fonts.css                       ← ÚNICO lugar para @import de fontes
│   └── globals.css
└── imports/                            ← assets importados via Figma (NÃO modificar)
\`\`\`

---

## 4. Roteamento (routes.ts)

O arquivo \`/src/app/routes.ts\` usa **React Router v7 Data Mode**:

\`\`\`tsx
import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
  {
    Component: RootLayout,          // provê AppContext + DemoBar para TODAS as rotas
    children: [
      {
        path: '/',
        Component: PublicLayout,    // header + footer público
        children: [
          { index: true, Component: Landing },
          { path: 'como-funciona', Component: HowItWorks },
          { path: 'seguranca',     Component: Security },
          { path: 'faq',           Component: FAQ },
          { path: 'termos',        Component: Terms },
          { path: 'privacidade',   Component: Privacy },
          { path: 'diretrizes',    Component: Guidelines },
          { path: 'prd',           Component: PRD },
          { path: 'dev',           Component: DevDoc },
          { path: 'login',         Component: Login },
          { path: 'cadastro',      Component: Register },
          { path: 'selecionar-perfil', Component: ProfileSelect },
          { path: 'esqueci-senha', Component: ForgotPassword },
          { path: 'sonhos/:id',    Component: PublicDreamDetail },
          { path: '*',             Component: NotFound },
        ],
      },
      // Standalone (sem layout de portal)
      { path: '/onboarding/paciente',          Component: PatientOnboarding },
      { path: '/onboarding/apoiador',          Component: SupporterOnboarding },
      { path: '/paciente/sonhos/:id/concluido', Component: DreamCompletion },
      // Portais logados
      { path: '/paciente', Component: PatientLayout,   children: [...] },
      { path: '/apoiador', Component: SupporterLayout, children: [...] },
      { path: '/admin',    Component: AdminLayout,      children: [...] },
    ],
  },
]);
\`\`\`

### Padrão para adicionar nova página

\`\`\`tsx
// 1. Criar /src/app/pages/MinhaArea/NovaPagina.tsx  (export default)
// 2. Importar em routes.ts
import NovaPagina from './pages/MinhaArea/NovaPagina';
// 3. Adicionar no array children do layout correto
{ path: 'nova-pagina', Component: NovaPagina },
\`\`\`

---

## 5. AppContext — Estado Global e RBAC

\`\`\`tsx
// /src/app/context/AppContext.tsx

export type AppRole = 'public' | 'paciente' | 'apoiador' | 'admin';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  avatar?: string;
  city?: string;
  verified: boolean;
}

// Uso em qualquer componente:
import { useApp } from '../../context/AppContext';

function MeuComponente() {
  const { currentRole, currentUser, notifications, unreadCount,
          switchRole, login, logout, markNotificationRead } = useApp();
}
\`\`\`

### Usuários mockados disponíveis

| Role      | Nome            | Email                    | ID  |
|-----------|-----------------|--------------------------|-----|
| paciente  | Ana Souza       | ana@email.com            | p1  |
| apoiador  | Fernanda Lima   | fernanda@email.com       | s1  |
| admin     | Admin NextDream  | admin@nextdream.com.br   | a1  |

### DemoBar (troca de role em tempo real)

\`\`\`
Barra fixa no bottom da tela com 4 botões: Público / Paciente / Apoiador / Admin
Chama switchRole(role) + navigate(path) ao clicar
NÃO remover — é o mecanismo de demonstração do protótipo
\`\`\`

---

## 6. Design System

### Tokens CSS (theme.css)

\`\`\`css
--background:          #FFF5F9    /* fundo rosado suave */
--foreground:          #1A1225    /* texto escuro */
--primary:             #D91B8C    /* magenta da marca */
--primary-foreground:  #ffffff
--secondary:           #FCE4F2    /* rosa claro */
--secondary-foreground:#9D1060
--muted:               #FCE4F2
--muted-foreground:    #9D6080
--border:              rgba(217,27,140,0.12)
--radius:              0.75rem    /* base para rounded-* */
--card:                #ffffff
\`\`\`

### Paleta de uso

| Contexto              | Cor Tailwind       | Hex      |
|-----------------------|--------------------|----------|
| Ação principal / CTA  | pink-600 / [#D91B8C]| #D91B8C |
| Paciente (portal)     | rose-500/600       | —        |
| Apoiador (portal)     | teal-600           | —        |
| Admin (portal)        | orange-500/600     | —        |
| Admin sidebar         | gray-900           | #111827  |
| Sucesso               | green-500/600      | —        |
| Erro / destrutivo     | red-500/600        | —        |
| Aviso                 | amber-500          | —        |

### Tipografia — IMPORTANTE

\`\`\`tsx
// NÃO usar classes Tailwind para font-size, font-weight ou line-height
// a menos que o usuário peça explicitamente.
// Usar sempre style={{ fontWeight: 700 }} e style={{ fontSize: '1rem' }}

// ✅ Correto
<h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Título</h2>
<p className="text-gray-600 text-sm leading-relaxed">Texto</p>

// ❌ Evitar (pode conflitar com theme.css)
<h2 className="text-2xl font-bold">Título</h2>
\`\`\`

### Border radius padrão

\`\`\`
Botões, inputs, badges:  rounded-xl   (0.75rem)
Cards, modais, panels:   rounded-2xl  (1rem)
Grandes containers:      rounded-3xl  (1.5rem)
\`\`\`

### Padrão de sombra

\`\`\`
Cards normais:           shadow-sm
Cards em hover/destaque: shadow-md
Modais/overlays:         shadow-xl
\`\`\`

---

## 7. Padrões de UX — Admin (consistência obrigatória)

Todas as telas admin seguem este padrão:

### Tabela com hover

\`\`\`tsx
<tr className="hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
  <td className="px-4 py-3 text-sm text-gray-700">...</td>
</tr>
\`\`\`

### Modal centralizado com backdrop

\`\`\`tsx
// Overlay
<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
     onClick={() => setModal(null)}>           {/* ← backdrop clicável fecha modal */}
  <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
       onClick={e => e.stopPropagation()}>     {/* ← impede fechar ao clicar dentro */}
    {/* Cabeçalho */}
    <div className="flex items-center justify-between p-5 border-b border-gray-100">
      <h3 style={{ fontWeight: 700 }}>Título do Modal</h3>
      <button onClick={() => setModal(null)}><X className="w-5 h-5" /></button>
    </div>
    {/* Corpo */}
    <div className="p-5">...</div>
    {/* Rodapé fixo de ações */}
    <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
      <button onClick={() => setModal(null)}
        className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
        Cancelar
      </button>
      <button onClick={handleConfirm}
        className="px-4 py-2 text-sm text-white bg-pink-600 rounded-xl hover:bg-pink-700">
        Confirmar
      </button>
    </div>
  </div>
</div>
\`\`\`

### Sub-modal de confirmação (ação destrutiva)

\`\`\`tsx
// Abre sobre o modal principal para confirmar ações irreversíveis (banir, deletar…)
{confirmOpen && (
  <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p style={{ fontWeight: 700 }} className="text-gray-800">Confirmar ação</p>
          <p className="text-gray-500 text-sm mt-1">Esta ação não pode ser desfeita.</p>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={() => setConfirmOpen(false)}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl">Cancelar</button>
        <button onClick={handleDestructive}
          className="px-4 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700">
          Confirmar
        </button>
      </div>
    </div>
  </div>
)}
\`\`\`

### Toast de feedback

\`\`\`tsx
import { toast } from 'sonner';  // ← importar SEMPRE deste path

toast.success('Ação realizada com sucesso!');
toast.error('Erro ao processar a ação.');
toast('Notificação informativa.');
\`\`\`

### Navegação bidirecional Denúncias ↔ Origem

\`\`\`tsx
// Badge 🚩 em qualquer lista (chat, usuário, sonho, proposta):
<button onClick={() => navigate('/admin/denuncias', { state: { openId: report.id } })}
  className="text-red-500 hover:text-red-600">
  🚩
</button>

// Em AdminReports.tsx, ao montar:
const location = useLocation();
useEffect(() => {
  if (location.state?.openId) {
    setSelectedReport(reports.find(r => r.id === location.state.openId) ?? null);
  }
}, []);
\`\`\`

---

## 8. Padrões de Componente

### Componente de página (padrão)

\`\`\`tsx
// /src/app/pages/MinhaArea/NovaPagina.tsx
export default function NovaPagina() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero / cabeçalho */}
      <div className="bg-gradient-to-br from-pink-600 to-rose-500 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-white" style={{ fontWeight: 800, fontSize: '1.875rem' }}>
            Título da Página
          </h1>
        </div>
      </div>
      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* ... */}
      </div>
    </div>
  );
}
\`\`\`

### Componente reutilizável (padrão)

\`\`\`tsx
// /src/app/components/shared/MeuComponente.tsx
interface Props {
  title: string;
  onAction?: () => void;
}

export function MeuComponente({ title, onAction }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <p className="text-gray-800 text-sm" style={{ fontWeight: 700 }}>{title}</p>
    </div>
  );
}
// Importar com: import { MeuComponente } from './components/shared/MeuComponente';
\`\`\`

### Imagens

\`\`\`tsx
// Imagens novas (Unsplash ou externas):
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
<ImageWithFallback src={url} alt="desc" className="w-full h-48 object-cover rounded-2xl" />

// Assets importados do Figma:
import img from 'figma:asset/HASH.png';          // raster (PNG, JPG)
import svgPaths from '../imports/svg-HASH';       // SVG vetorial
\`\`\`

---

## 9. Regras de Negócio Críticas

| ID    | Prioridade | Regra |
|-------|-----------|-------|
| BR-01 | Crítico   | **Zero transações financeiras** — dinheiro, PIX, doação = suspensão permanente imediata |
| BR-02 | Crítico   | **Moderação obrigatória** — todo sonho e proposta passa por moderação antes de ser exibido |
| BR-03 | Alto      | Dados pessoais identificáveis do paciente não são expostos antes do aceite da proposta |
| BR-04 | Alto      | Apenas **1 sonho ativo** (em busca) por paciente simultaneamente |
| BR-05 | Alto      | Cada sonho aceita **no máximo 1 proposta** — as demais são arquivadas automaticamente |
| BR-06 | Médio     | Apoiadores precisam verificar identidade (CPF + e-mail) para acesso completo |
| BR-07 | Médio     | Denúncias são **sigilosas** — o denunciado não sabe quem denunciou |
| BR-08 | Médio     | Dados anonimizados em 30 dias após exclusão da conta (LGPD) |

---

## 10. Dados Mockados

\`\`\`ts
// /src/app/data/mockData.ts  — contém:
// - mockUsers[]          → usuários pacientes e apoiadores
// - mockDreams[]         → sonhos com status variados
// - mockProposals[]      → propostas vinculadas a sonhos
// - mockChats[]          → conversas com mensagens
// - mockReports[]        → denúncias para o admin
// - mockAdminStats       → métricas do dashboard admin

// /src/app/data/publicDreams.ts — contém:
// - publicDreams[]       → sonhos exibidos na landing e /sonhos/:id
\`\`\`

---

## 11. Inventário de Rotas

### Públicas (PublicLayout — com header/footer)

| Rota                  | Componente          | Descrição |
|-----------------------|---------------------|-----------|
| \`/\`                   | Landing             | Home pública com sonhos em destaque |
| \`/como-funciona\`      | HowItWorks          | Fluxo para pacientes e apoiadores |
| \`/seguranca\`          | Security            | Práticas de segurança |
| \`/faq\`                | FAQ                 | Perguntas frequentes com busca |
| \`/termos\`             | Terms               | Termos de uso completo |
| \`/privacidade\`        | Privacy             | Política de privacidade (LGPD) |
| \`/diretrizes\`         | Guidelines          | Diretrizes da comunidade |
| \`/prd\`                | PRD                 | PRD visual navegável |
| \`/dev\`                | DevDoc              | Documento de contexto para IA |
| \`/login\`              | Login               | Autenticação |
| \`/cadastro\`           | Register            | Cadastro com seleção de perfil |
| \`/selecionar-perfil\`  | ProfileSelect       | Escolha entre Paciente / Apoiador |
| \`/esqueci-senha\`      | ForgotPassword      | Reset de senha |
| \`/sonhos/:id\`         | PublicDreamDetail   | Detalhe público de um sonho |

### Standalone (sem layout de portal)

| Rota                              | Componente          |
|-----------------------------------|---------------------|
| \`/onboarding/paciente\`            | PatientOnboarding   |
| \`/onboarding/apoiador\`            | SupporterOnboarding |
| \`/paciente/sonhos/:id/concluido\`  | DreamCompletion     |

### Paciente (/paciente — PatientLayout)

| Rota                    | Componente           |
|-------------------------|----------------------|
| \`/paciente\`             | PatientDashboard     |
| \`/paciente/dashboard\`   | PatientDashboard     |
| \`/paciente/sonhos\`      | MyDreams             |
| \`/paciente/sonhos/criar\`| CreateDream          |
| \`/paciente/sonhos/:id\`  | DreamDetail          |
| \`/paciente/propostas\`   | PatientProposals     |
| \`/paciente/chat\`        | PatientChat          |
| \`/paciente/perfil\`      | PatientProfile       |
| \`/paciente/notificacoes\`| PatientNotifications |

### Apoiador (/apoiador — SupporterLayout)

| Rota                      | Componente              |
|---------------------------|-------------------------|
| \`/apoiador\`               | SupporterDashboard      |
| \`/apoiador/dashboard\`     | SupporterDashboard      |
| \`/apoiador/explorar\`      | ExploreDreams           |
| \`/apoiador/sonhos/:id\`    | SupporterDreamDetail    |
| \`/apoiador/propostas\`     | MyProposals             |
| \`/apoiador/chat\`          | SupporterChat           |
| \`/apoiador/perfil\`        | SupporterProfile        |
| \`/apoiador/notificacoes\`  | SupporterNotifications  |

### Admin (/admin — AdminLayout, sidebar dark)

| Rota                    | Componente           |
|-------------------------|----------------------|
| \`/admin\`                | AdminOverview        |
| \`/admin/usuarios\`       | AdminUsers           |
| \`/admin/sonhos\`         | AdminDreams          |
| \`/admin/propostas\`      | AdminProposals       |
| \`/admin/chats\`          | AdminChats           |
| \`/admin/denuncias\`      | AdminReports         |
| \`/admin/configuracoes\`  | AdminSettings        |
| \`/admin/auditoria\`      | AdminAudit           |
| \`/admin/emails\`         | AdminEmailTemplates  |

---

## 12. Convenções de Código

- Arquivos de página: \`PascalCase.tsx\` com \`export default function\`
- Componentes reutilizáveis: \`PascalCase.tsx\` com \`export function\`
- Apenas arquivos \`.tsx\` (não criar \`.js\` ou \`.jsx\`)
- Sempre fornecer \`key\` único em listas: \`key={item.id}\`
- Instalar pacotes ANTES de importar (verificar package.json antes)
- Nunca modificar arquivos em \`/src/app/components/figma/\` e \`/pnpm-lock.yaml\`
- Nunca modificar \`/src/styles/theme.css\` a não ser que o usuário peça
- Preferir \`fast_apply_tool\` para edições, \`write_tool\` para novos arquivos
- Para edições localizadas (< 30% do arquivo), usar edit com 3-5 linhas de contexto
- Imports de shadcn/ui: \`import { Button } from '../components/ui/button'\`

---

## 13. Status de Implementação

### ✅ Completamente implementado

- Todas as páginas públicas (landing, como funciona, segurança, FAQ, legal, sonho público)
- Fluxo completo de autenticação (login, cadastro, seleção de perfil, recuperação)
- Onboarding wizard (paciente + apoiador, 4 etapas cada)
- Portal completo do Paciente (dashboard, sonhos, propostas, chat, perfil, notificações, celebração)
- Portal completo do Apoiador (dashboard, explorar, propostas, chat, perfil, notificações)
- Portal completo do Admin (9 telas com padrão UX consistente)
- RBAC com AppContext e DemoBar funcional
- Central de denúncias com navegação bidirecional (badges 🚩 + location.state.openId)
- Design system completo (tokens, componentes, responsividade)

### 📋 Planejado (Fase 2+)

- Integração Supabase (auth real, banco, storage, realtime)
- Chat em tempo real (Supabase Realtime / WebSocket)
- Notificações por e-mail (Resend)
- KYC de apoiadores
- Sistema de avaliações
- PWA com notificações push
- Moderação automática com IA
- App nativo (React Native)

### ❌ Fora do escopo

- Transações financeiras de qualquer tipo
- Portal de empresas parceiras (pausado)
- Integrações hospitalares via API

---

## 14. Contexto de Desenvolvimento

### Como usar este documento

1. Cole o conteúdo completo deste documento como contexto/system-prompt
2. Descreva o que quer implementar ou modificar
3. O projeto existe como protótipo navegável — todos os dados são fictícios
4. Ao pedir novas features, especifique qual área (público/paciente/apoiador/admin)

### Erros comuns a evitar

- Usar \`react-router-dom\` em vez de \`react-router\`
- Criar \`tailwind.config.js\`
- Usar classes Tailwind para font-size/weight sem necessidade
- Adicionar font imports fora de \`/src/styles/fonts.css\`
- Modificar arquivos protegidos (\`/src/app/components/figma/ImageWithFallback.tsx\`, \`/pnpm-lock.yaml\`)
- Usar \`import { motion } from 'framer-motion'\` — usar \`'motion/react'\`
- Criar \`.js\` ou \`.jsx\` — somente \`.tsx\`
- Usar \`react-resizable\` — usar \`re-resizable\`

### Datas

- Hoje: 01 de março de 2026

---

*Este documento deve ser atualizado a cada sprint. Versão atual: 1.4.0*
`;

/* ─────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────── */

const SECTIONS = [
  '1. O que é o NextDream',
  '2. Tech Stack — CRÍTICO',
  '3. Estrutura de Arquivos',
  '4. Roteamento',
  '5. AppContext — RBAC',
  '6. Design System',
  '7. Padrões UX Admin',
  '8. Padrões de Componente',
  '9. Regras de Negócio',
  '10. Dados Mockados',
  '11. Inventário de Rotas',
  '12. Convenções de Código',
  '13. Status de Implementação',
  '14. Contexto de Desenvolvimento',
];

function CopyButton({ text, label = 'Copiar', size = 'md' }: { text: string; label?: string; size?: 'sm' | 'md' | 'lg' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [text]);

  const sizes = {
    sm:  'px-3 py-1.5 text-xs gap-1.5',
    md:  'px-4 py-2 text-sm gap-2',
    lg:  'px-6 py-3 text-sm gap-2',
  };

  return (
    <button onClick={handleCopy}
      className={`inline-flex items-center rounded-xl font-semibold transition-all ${sizes[size]}
        ${copied
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-pink-600 hover:bg-pink-700 text-white border border-transparent'}`}>
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Copiado!' : label}
    </button>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={i} className="relative group my-4">
          {lang && (
            <div className="flex items-center justify-between bg-gray-800 rounded-t-xl px-4 py-1.5">
              <span className="text-gray-400 text-xs font-mono">{lang}</span>
              <CopyButton text={codeLines.join('\n')} label="Copiar" size="sm" />
            </div>
          )}
          <pre className={`bg-gray-900 text-gray-100 text-xs overflow-x-auto p-4 leading-relaxed font-mono ${lang ? 'rounded-b-xl' : 'rounded-xl'}`}>
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // H1
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      elements.push(<h1 key={i} className="text-gray-900 mt-6 mb-2 pb-3 border-b-2 border-pink-200" style={{ fontWeight: 800, fontSize: '1.5rem' }}>{line.slice(2)}</h1>);
      i++; continue;
    }
    // H2
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-gray-800 mt-8 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2" style={{ fontWeight: 700, fontSize: '1.125rem' }}><span className="w-1 h-5 bg-pink-500 rounded-full inline-block" />{line.slice(3)}</h2>);
      i++; continue;
    }
    // H3
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-gray-700 mt-5 mb-2" style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{line.slice(4)}</h3>);
      i++; continue;
    }
    // H4
    if (line.startsWith('#### ')) {
      elements.push(<h4 key={i} className="text-gray-600 mt-4 mb-1" style={{ fontWeight: 600, fontSize: '0.875rem' }}>{line.slice(5)}</h4>);
      i++; continue;
    }
    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-pink-300 pl-4 py-1 my-3 bg-pink-50 rounded-r-xl">
          <p className="text-gray-600 text-sm italic">{line.slice(2)}</p>
        </blockquote>
      );
      i++; continue;
    }
    // Table
    if (line.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter(l => !l.match(/^\|[\s\-|]+\|$/));
      elements.push(
        <div key={i} className="overflow-x-auto my-4 rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {rows[0]?.split('|').filter(Boolean).map((cell, ci) => (
                  <th key={ci} className="px-3 py-2 text-left text-gray-700 text-xs border-b border-gray-200" style={{ fontWeight: 700 }}>{cell.trim()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri} className="border-b border-gray-100 hover:bg-gray-50">
                  {row.split('|').filter(Boolean).map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-gray-600 text-xs font-mono">{cell.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    // HR
    if (line.startsWith('---')) {
      elements.push(<hr key={i} className="my-6 border-gray-200" />);
      i++; continue;
    }
    // List item
    if (line.match(/^[-*] /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="space-y-1 my-3 ml-4">
          {listItems.map((item, li) => (
            <li key={li} className="text-gray-600 text-sm flex items-start gap-2">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: item
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/`(.+?)`/g, '<code class="bg-gray-100 text-pink-700 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
              }} />
            </li>
          ))}
        </ul>
      );
      continue;
    }
    // Empty line
    if (line.trim() === '') { i++; continue; }
    // Paragraph
    elements.push(
      <p key={i} className="text-gray-600 text-sm leading-relaxed my-1.5"
        dangerouslySetInnerHTML={{ __html: line
          .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-800">$1</strong>')
          .replace(/`(.+?)`/g, '<code class="bg-gray-100 text-pink-700 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
          .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-pink-600 underline hover:text-pink-700">$1</a>')
        }}
      />
    );
    i++;
  }
  return <div className="prose-custom">{elements}</div>;
}

export default function DevDoc() {
  const [view, setView] = useState<'rendered' | 'raw'>('rendered');
  const [tocOpen, setTocOpen] = useState(false);
  const wordCount = MARKDOWN.split(/\s+/).length;
  const charCount = MARKDOWN.length;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* ── Top bar ── */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Terminal className="w-4 h-4 text-pink-400 shrink-0" />
            <p className="text-gray-200 text-sm truncate" style={{ fontWeight: 600 }}>
              NextDream — PRD para IA
            </p>
            <span className="text-gray-600 text-xs hidden sm:block">v1.4.0</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle view */}
            <div className="flex bg-gray-800 rounded-lg p-0.5 border border-gray-700">
              <button onClick={() => setView('rendered')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-all ${view === 'rendered' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                style={{ fontWeight: 500 }}>
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button onClick={() => setView('raw')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-all ${view === 'raw' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                style={{ fontWeight: 500 }}>
                <Code className="w-3.5 h-3.5" /> Raw
              </button>
            </div>

            <CopyButton text={MARKDOWN} label="Copiar tudo" size="md" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex gap-8">

        {/* ── Sidebar (índice) ── */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-20">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>Seções</p>
            <nav className="space-y-0.5">
              {SECTIONS.map((s, i) => (
                <button key={i}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
                  style={{ fontWeight: 400 }}>
                  {s}
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-5 border-t border-gray-800 space-y-3">
              <div className="bg-gray-800/60 rounded-xl p-3 border border-gray-700">
                <p className="text-gray-500 text-xs mb-2" style={{ fontWeight: 600 }}>Estatísticas</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Palavras</span>
                    <span className="text-gray-300">{wordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Caracteres</span>
                    <span className="text-gray-300">{charCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Seções</span>
                    <span className="text-gray-300">{SECTIONS.length}</span>
                  </div>
                </div>
              </div>

              <CopyButton text={MARKDOWN} label="Copiar tudo" size="sm" />
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0">

          {/* Info banner */}
          <div className="bg-pink-900/30 border border-pink-800/50 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <FileText className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-pink-200 text-sm" style={{ fontWeight: 600 }}>Como usar</p>
              <p className="text-pink-300/80 text-xs mt-1 leading-relaxed">
                Copie o documento completo e cole como contexto inicial em uma conversa com Claude, Codex ou outro LLM.
                O assistente terá conhecimento completo do stack, estrutura, padrões e estado atual do projeto.
              </p>
            </div>
            <CopyButton text={MARKDOWN} label="Copiar" size="sm" />
          </div>

          {/* Mobile TOC */}
          <div className="lg:hidden mb-6">
            <button onClick={() => setTocOpen(!tocOpen)}
              className="w-full flex items-center justify-between bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 text-sm"
              style={{ fontWeight: 500 }}>
              <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-pink-400" /> Índice de seções</span>
              {tocOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {tocOpen && (
              <div className="mt-1 bg-gray-800 border border-gray-700 rounded-xl p-3">
                {SECTIONS.map((s, i) => (
                  <p key={i} className="text-gray-400 text-xs py-1">{s}</p>
                ))}
              </div>
            )}
          </div>

          {/* Document */}
          {view === 'rendered' ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
              <MarkdownRenderer content={MARKDOWN} />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-3 right-3 z-10">
                <CopyButton text={MARKDOWN} label="Copiar" size="sm" />
              </div>
              <textarea
                readOnly
                value={MARKDOWN}
                className="w-full min-h-[80vh] bg-gray-900 border border-gray-800 rounded-2xl p-6 text-gray-300 text-xs font-mono leading-relaxed resize-none focus:outline-none focus:border-pink-500/50"
                onClick={e => (e.target as HTMLTextAreaElement).select()}
              />
            </div>
          )}

          {/* Bottom copy */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
            <div>
              <p className="text-gray-200 text-sm" style={{ fontWeight: 600 }}>Pronto para usar com IA</p>
              <p className="text-gray-500 text-xs mt-0.5">
                {wordCount.toLocaleString()} palavras · {charCount.toLocaleString()} caracteres · {SECTIONS.length} seções
              </p>
            </div>
            <CopyButton text={MARKDOWN} label="Copiar documento completo" size="lg" />
          </div>
        </main>
      </div>
    </div>
  );
}
