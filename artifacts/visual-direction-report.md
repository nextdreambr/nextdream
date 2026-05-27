# NextDream - Direcao visual aplicada com validacao

Status da entrega: PARCIAL para o produto inteiro, com P0 cobertas.

Motivo do status: as rotas P0 reais foram alteradas, validadas tecnicamente e tiveram screenshots desktop/mobile. P1/P2 receberam base visual compartilhada e ajustes em layouts/componentes, mas chats, perfis, notificacoes e conteudos internos de admin ainda precisam de redesenho profundo em uma proxima execucao.

## 1. Rotas mapeadas

| Rota | Arquivo principal | Tipo | Sensibilidade | Impacto | Qualidade visual antes | Deve ser redesenhada? |
|---|---|---|---|---|---|---|
| `/` | `src/app/pages/Landing.tsx` | Publica | Media | Alto | Mediana | Sim |
| `/como-funciona` | `src/app/pages/HowItWorks.tsx` | Institucional | Media | Medio | Mediana | Base |
| `/seguranca` | `src/app/pages/Security.tsx` | Institucional | Alta | Medio | Mediana | Base |
| `/faq` | `src/app/pages/FAQ.tsx` | Institucional | Media | Medio | Mediana | Base |
| `/termos` | `src/app/pages/Terms.tsx` | Institucional | Media | Baixo | Boa | Nao |
| `/privacidade` | `src/app/pages/Privacy.tsx` | Institucional | Alta | Medio | Boa | Nao |
| `/diretrizes` | `src/app/pages/Guidelines.tsx` | Institucional | Alta | Medio | Boa | Nao |
| `/sandbox` | `src/app/pages/SandboxAccess.tsx` | Onboarding | Media | Alto | Boa | Base |
| `/login` | `src/app/pages/auth/Login.tsx` | Autenticada | Alta | Alto | Mediana | Sim |
| `/cadastro` | `src/app/pages/auth/Register.tsx` | Formulario | Alta | Alto | Mediana | Sim |
| `/selecionar-perfil` | `src/app/pages/auth/ProfileSelect.tsx` | Onboarding | Media | Medio | Mediana | Base |
| `/esqueci-senha` | `src/app/pages/auth/ForgotPassword.tsx` | Formulario | Media | Medio | Mediana | Base |
| `/redefinir-senha` | `src/app/pages/auth/ResetPassword.tsx` | Formulario | Media | Medio | Mediana | Base |
| `/verificar-email` | `src/app/pages/auth/VerifyEmail.tsx` | Onboarding | Media | Medio | Mediana | Base |
| `/aceitar-convite-admin` | `src/app/pages/auth/AcceptAdminInvite.tsx` | Admin | Alta | Medio | Mediana | Base |
| `/aceitar-convite-paciente` | `src/app/pages/auth/AcceptPatientInvite.tsx` | Onboarding | Alta | Alto | Mediana | Base |
| `/sonhos/:id` | `src/app/pages/PublicDreamDetail.tsx` | Detalhe | Alta | Alto | Fraca | Sim |
| `/contato` | `src/app/pages/Contact.tsx` | Publica | Media | Medio | Mediana | Base |
| `/parcerias` | `src/app/pages/Partnerships.tsx` | Institucional | Media | Alto | Mediana | Sim |
| `/concept-a/paciente/sonhos/criar` | `src/app/pages/concepts/CreateDreamConcepts.tsx` | Outro | Alta | Medio | Conceito | Nao |
| `/concept-b/paciente/sonhos/criar` | `src/app/pages/concepts/CreateDreamConcepts.tsx` | Outro | Alta | Medio | Conceito | Nao |
| `/concept-c/paciente/sonhos/criar` | `src/app/pages/concepts/CreateDreamConcepts.tsx` | Outro | Alta | Medio | Conceito | Nao |
| `/onboarding/paciente` | `src/app/pages/onboarding/PatientOnboarding.tsx` | Onboarding | Alta | Alto | Mediana | Base |
| `/onboarding/apoiador` | `src/app/pages/onboarding/SupporterOnboarding.tsx` | Onboarding | Media | Alto | Mediana | Base |
| `/paciente/sonhos/:id/concluido` | `src/app/pages/patient/DreamCompletion.tsx` | Detalhe | Alta | Medio | Mediana | Base |
| `/paciente` | `src/app/pages/patient/PatientDashboard.tsx` | Dashboard | Alta | Alto | Mediana | Base |
| `/paciente/dashboard` | `src/app/pages/patient/PatientDashboard.tsx` | Dashboard | Alta | Alto | Mediana | Base |
| `/paciente/sonhos` | `src/app/pages/patient/MyDreams.tsx` | Listagem | Alta | Alto | Fraca | Sim |
| `/paciente/sonhos/criar` | `src/app/pages/patient/CreateDream.tsx` | Formulario | Alta | Alto | Muito fraca | Sim |
| `/paciente/sonhos/editar/:id` | `src/app/pages/patient/CreateDream.tsx` | Formulario | Alta | Alto | Muito fraca | Sim |
| `/paciente/sonhos/:id` | `src/app/pages/patient/DreamDetail.tsx` | Detalhe | Alta | Alto | Fraca | Sim |
| `/paciente/propostas` | `src/app/pages/patient/PatientProposals.tsx` | Listagem | Alta | Alto | Mediana | Base |
| `/paciente/chat` | `src/app/pages/patient/PatientChat.tsx` | Autenticada | Alta | Alto | Mediana | Base |
| `/paciente/perfil` | `src/app/pages/patient/PatientProfile.tsx` | Formulario | Alta | Alto | Mediana | Base |
| `/paciente/notificacoes` | `src/app/pages/patient/PatientNotifications.tsx` | Autenticada | Media | Medio | Mediana | Base |
| `/apoiador` | `src/app/pages/supporter/SupporterDashboard.tsx` | Dashboard | Media | Alto | Mediana | Base |
| `/apoiador/dashboard` | `src/app/pages/supporter/SupporterDashboard.tsx` | Dashboard | Media | Alto | Mediana | Base |
| `/apoiador/explorar` | `src/app/pages/supporter/ExploreDreams.tsx` | Listagem | Alta | Alto | Fraca | Sim |
| `/apoiador/sonhos/:id` | `src/app/pages/supporter/SupporterDreamDetail.tsx` | Detalhe | Alta | Alto | Fraca | Sim |
| `/apoiador/propostas` | `src/app/pages/supporter/MyProposals.tsx` | Listagem | Media | Alto | Mediana | Base |
| `/apoiador/chat` | `src/app/pages/supporter/SupporterChat.tsx` | Autenticada | Alta | Alto | Mediana | Base |
| `/apoiador/perfil` | `src/app/pages/supporter/SupporterProfile.tsx` | Formulario | Media | Medio | Mediana | Base |
| `/apoiador/notificacoes` | `src/app/pages/supporter/SupporterNotifications.tsx` | Autenticada | Media | Medio | Mediana | Base |
| `/instituicao` | `src/app/pages/institution/InstitutionDashboard.tsx` | Dashboard | Alta | Alto | Mediana | Base |
| `/instituicao/dashboard` | `src/app/pages/institution/InstitutionDashboard.tsx` | Dashboard | Alta | Alto | Mediana | Base |
| `/instituicao/pacientes` | `src/app/pages/institution/InstitutionPatients.tsx` | Listagem | Alta | Alto | Mediana | Base |
| `/instituicao/pacientes/:managedPatientId` | `src/app/pages/institution/InstitutionPatientDetail.tsx` | Detalhe | Alta | Alto | Mediana | Base |
| `/instituicao/sonhos` | `src/app/pages/institution/InstitutionDreams.tsx` | Listagem | Alta | Alto | Mediana | Sim |
| `/instituicao/sonhos/criar` | `src/app/pages/institution/InstitutionCreateDream.tsx` | Formulario | Alta | Alto | Fraca | Sim |
| `/instituicao/sonhos/editar/:id` | `src/app/pages/institution/InstitutionCreateDream.tsx` | Formulario | Alta | Alto | Fraca | Sim |
| `/instituicao/propostas` | `src/app/pages/institution/InstitutionProposals.tsx` | Listagem | Alta | Alto | Mediana | Base |
| `/instituicao/chat` | `src/app/pages/institution/InstitutionChat.tsx` | Autenticada | Alta | Alto | Mediana | Base |
| `/instituicao/notificacoes` | `src/app/pages/institution/InstitutionNotifications.tsx` | Autenticada | Media | Medio | Mediana | Base |
| `/instituicao/perfil` | `src/app/pages/institution/InstitutionProfile.tsx` | Formulario | Alta | Medio | Mediana | Base |
| `/admin` | `src/app/pages/admin/AdminOverview.tsx` | Admin | Alta | Alto | Mediana | Base |
| `/admin/usuarios` | `src/app/pages/admin/AdminUsers.tsx` | Admin | Alta | Alto | Mediana | Base |
| `/admin/admins` | `src/app/pages/admin/AdminAdmins.tsx` | Admin | Alta | Alto | Mediana | Base |
| `/admin/sonhos` | `src/app/pages/admin/AdminDreams.tsx` | Admin | Alta | Alto | Mediana | Base |
| `/admin/propostas` | `src/app/pages/admin/AdminProposals.tsx` | Admin | Alta | Alto | Mediana | Base |
| `/admin/mensagens` | `src/app/pages/admin/AdminMessages.tsx` | Admin | Alta | Medio | Mediana | Base |
| `/admin/chats` | `src/app/pages/admin/AdminChats.tsx` | Admin | Alta | Medio | Mediana | Base |
| `/admin/denuncias` | `src/app/pages/admin/AdminReports.tsx` | Admin | Alta | Alto | Mediana | Base |
| `/admin/configuracoes` | `src/app/pages/admin/AdminSettings.tsx` | Admin | Alta | Medio | Mediana | Base |
| `/admin/auditoria` | `src/app/pages/admin/AdminAudit.tsx` | Admin | Alta | Medio | Mediana | Base |
| `*` | `src/app/pages/NotFound.tsx` | Outro | Baixa | Baixo | Mediana | Base |

## 2. Grupos de paginas

| Grupo | Rotas encontradas | Status |
|---|---|---|
| Publicas e institucionais | `/`, `/como-funciona`, `/seguranca`, `/faq`, `/contato`, `/parcerias`, legais | Encontrado; base publica aquecida |
| Paciente/familia | dashboard, criar sonho, meus sonhos, detalhe, propostas, chat, perfil, notificacoes | Encontrado; P0 alteradas, demais base |
| Apoiador | dashboard, explorar, detalhe, propostas, chat, perfil, notificacoes | Encontrado; P0 alteradas, demais base |
| Autenticacao | login, cadastro, recuperar/redefinir/verificar email, convites | Encontrado; login/cadastro alterados, demais base |
| Instituicoes | dashboard, pacientes, sonhos, criar sonho, propostas, chat, perfil | Encontrado; criar/lista/base alteradas |
| Admin/operacional | overview, usuarios, sonhos, propostas, mensagens, chats, denuncias, configuracoes, auditoria | Encontrado; layout/base aplicado, redesign profundo pendente |
| Conceitos | Concept A/B/C | Encontrado; mantidos como conceito, nao como entrega final |

## 3. Validacao dos conceitos com stakeholders

### PO/PM

| Criterio | Concept A | Concept B | Concept C |
|---|---|---|---|
| Clareza da proposta | Forte | Boa | Boa |
| Confianca | Forte | Media | Forte |
| Conversao responsavel | Boa | Boa | Forte |
| Reducao de ansiedade | Forte | Boa | Media |
| Proximo passo claro | Boa | Forte | Boa |
| Adequacao ao NextDream | Forte | Boa | Forte |
| Risco de parecer SaaS | Baixo | Medio | Baixo |
| Risco de parecer ONG generica | Baixo | Medio | Baixo |

- Melhor conceito: A.
- Pior conceito: B, por ser mais generico.
- Aproveitar: carta guiada de A, progressao clara de B, espaco protegido de C.
- Descartar: excesso decorativo de A, neutralidade generica de B, peso cromatico de C.
- Parecer final: escolher hibrido A+C com estrutura de fluxo de B.

### Medico especialista em cuidados paliativos

| Criterio | Concept A | Concept B | Concept C |
|---|---|---|---|
| Acolhimento visual | Forte | Bom | Forte |
| Seguranca emocional | Forte | Boa | Boa |
| Privacidade visivel | Forte | Media | Forte |
| Consentimento visivel | Boa | Media | Forte |
| Risco de exposicao indevida | Baixo | Medio | Baixo |
| Risco de falsa esperanca | Baixo | Baixo | Baixo |
| Risco de apelo emocional | Medio | Baixo | Baixo |
| Adequacao paciente/familia | Forte | Boa | Forte |

- Melhor conceito: A, ajustado com consentimento de C.
- Conceito com maior risco: A sem ajustes, se imagens/copy ficarem romantizadas.
- Ajustes obrigatorios: retirar dramatizacao, evitar "ultima vez", manter limites e privacidade no topo, reforcar que apoio nao e dinheiro.
- Parecer final: hibrido A+C aprovado para aplicacao responsavel.

### QA visual

| Criterio | Concept A | Concept B | Concept C |
|---|---|---|---|
| Diferenca visual real | Forte | Media | Forte |
| Qualidade estetica | Forte | Boa | Boa |
| Responsividade | Boa | Boa | Boa |
| Hierarquia | Forte | Forte | Boa |
| Legibilidade | Boa | Boa | Boa |
| CTAs | Boa | Forte | Boa |
| Consistencia | Media | Boa | Media |
| Acessibilidade basica | Boa | Boa | Boa |

- Melhor conceito: A, com simplificacao.
- Problemas encontrados: A tinha decoracao demais; B parecia template; C poderia ficar pesado em telas longas.
- Ajustes obrigatorios: reduzir efeitos, padronizar shells/cards, manter contraste, validar mobile.
- Parecer final: hibrido A+C com componentes compartilhados.

### Reviewer final dos conceitos

- Algum conceito e bom o suficiente puro? Nao.
- Conceito escolhido: hibrido entre A e C, usando a progressao de B.
- Precisa de ajustes antes de aplicar? Sim: copy segura, menos decoracao, privacidade e consentimento no topo.
- Criar Concept D? Nao como nova rota; a direcao vencedora vira um hibrido aplicado nas rotas reais.

## 4. Direcao visual escolhida

- Direcao escolhida: Carta guiada + mesa de cuidado.
- Motivo: reduz ansiedade em formularios sensiveis, preserva dignidade nas historias e evita leitura de marketplace/vaquinha.
- Aproveitado: acolhimento e privacidade de A, espaco protegido de C, clareza de passos de B.
- Descartado: urgencia dramatica, linguagem fria de SaaS, gradientes corporativos azuis e qualquer CTA financeiro.
- Paleta: papel quente, terracota cuidado, verde semente/suporte, lavanda institucional, texto escuro.
- Tipografia/hierarquia: titulos grandes apenas em herois; cards e formularios com titulos compactos; copy direta.
- Componentes principais: `ProductPageShell`, `ProductHero`, `SensitiveNotice`, `FormSection`, `GentleProgress`, `HumanCard`, `EmptyState`, `DreamCard`.
- Regras de uso: aviso de privacidade cedo, apoio nao financeiro explicito, consentimento antes de contato, nada de urgencia emocional.
- Riscos: o produto inteiro ainda precisa de passadas profundas em chat/perfil/admin para ficar plenamente consistente.
- Ajustes aplicados antes de escalar: placeholders seguros, labels claros, botao "Ambos" acessivel, cards com nota de apoio nao financeiro.

## 5. Paginas reais alteradas

- P0: `/`, `/parcerias`, `/login`, `/cadastro`, `/sonhos/:id`, `/paciente/sonhos`, `/paciente/sonhos/criar`, `/paciente/sonhos/editar/:id`, `/paciente/sonhos/:id`, `/apoiador/explorar`, `/apoiador/sonhos/:id`, `/instituicao/sonhos`, `/instituicao/sonhos/criar`, `/instituicao/sonhos/editar/:id`.
- P1/base: dashboards de paciente, apoiador e instituicao; propostas do apoiador; listagem institucional.
- P2/base: layouts de admin e shells compartilhados; estados vazios e cards de sonhos.

## 6. Componentes criados ou atualizados

- Criado: `src/app/components/shared/VisualSystem.tsx`.
- Atualizados: `PublicPagePrimitives`, `PublicLayout`, `PatientLayout`, `SupporterLayout`, `InstitutionLayout`, `AdminLayout`, `DreamCard`, `EmptyState`, `theme.css`.

## 7. Matriz de cobertura

| Rota | Arquivo | Status | Desktop | Mobile | Observacoes |
|---|---|---|---|---|---|
| `/` | `Landing.tsx` | Alterada e validada | `home-desktop.png` | `home-mobile.png` | Home alinhada por base publica/tema |
| `/parcerias` | `Partnerships.tsx` | Alterada e validada | `parcerias-desktop.png` | `parcerias-mobile.png` | Sem copy financeira |
| `/login` | `Login.tsx` | Alterada e validada | `login-desktop.png` | `login-mobile.png` | Capturada em web production local |
| `/cadastro` | `Register.tsx` | Alterada e validada | `cadastro-desktop.png` | `cadastro-mobile.png` | Capturada em web production local |
| `/sonhos/:id` | `PublicDreamDetail.tsx` | Alterada e validada | `public-dream-detail-desktop.png` | `public-dream-detail-mobile.png` | Historia publica com aviso de privacidade |
| `/paciente/sonhos` | `MyDreams.tsx` | Alterada e validada | `patient-dreams-desktop.png` | `patient-dreams-mobile.png` | Lista com linguagem de controle/privacidade |
| `/paciente/sonhos/criar` | `CreateDream.tsx` | Alterada e validada | `create-dream-desktop.png` | `create-dream-mobile.png` | Rota real substituiu conceito |
| `/paciente/sonhos/editar/:id` | `CreateDream.tsx` | Alterada por mesmo arquivo | `create-dream-desktop.png` | `create-dream-mobile.png` | Mesmo shell/formulario |
| `/paciente/sonhos/:id` | `DreamDetail.tsx` | Alterada e validada | `patient-dream-detail-desktop.png` | `patient-dream-detail-mobile.png` | Consentimento e proximos passos |
| `/apoiador/explorar` | `ExploreDreams.tsx` | Alterada e validada | `explore-dreams-desktop.png` | `explore-dreams-mobile.png` | Evita catalogo de sofrimento |
| `/apoiador/sonhos/:id` | `SupporterDreamDetail.tsx` | Alterada e validada | `supporter-dream-detail-desktop.png` | `supporter-dream-detail-mobile.png` | CTA de presenca responsavel |
| `/instituicao/sonhos` | `InstitutionDreams.tsx` | Alterada e validada | `institution-dreams-desktop.png` | `institution-dreams-mobile.png` | Base institucional aplicada |
| `/instituicao/sonhos/criar` | `InstitutionCreateDream.tsx` | Alterada e validada | `institution-create-dream-desktop.png` | `institution-create-dream-mobile.png` | Consentimento institucional no topo |
| `/instituicao/sonhos/editar/:id` | `InstitutionCreateDream.tsx` | Alterada por mesmo arquivo | `institution-create-dream-desktop.png` | `institution-create-dream-mobile.png` | Mesmo fluxo |
| Dashboards paciente/apoiador/instituicao | respectivos arquivos | Base visual aplicada | `patient-dashboard-desktop.png`, `supporter-dashboard-desktop.png`, `institution-dashboard-desktop.png` | Amostra P1 validada | Ajuste de tom e layout |
| Chat/perfil/notificacoes | respectivos arquivos | Base visual aplicada | Nao capturado | Nao capturado | Redesign profundo pendente |
| Admin | `AdminLayout.tsx` e paginas admin | Base visual aplicada | Nao capturado | Nao capturado | Sem persona admin no sandbox; coberto por testes |
| Conceitos A/B/C | `CreateDreamConcepts.tsx` | Sem alteracao necessaria | N/A | N/A | Mantidos como referencia, nao entrega final |

## 8. QA final

- A aplicacao tem agora direcao visual consistente? Parcialmente: P0 e shells principais sim; P1/P2 ainda precisam refinamento profundo.
- Paginas sensiveis ficaram mais acolhedoras? Sim, especialmente criar sonho, detalhe e autenticacao.
- As paginas ainda parecem SaaS/template? P0 nao; alguns admin/perfil/chat ainda podem parecer operacionais/genericos.
- Alguma P0 ficou pendente? Nao.
- Alguma rota quebrou? Nao observado em browser; `agent-browser errors` vazio nas sessoes publicas e autenticadas.
- Algum fluxo sensivel ficou pior? Nao observado; copy financeira foi evitada/reforcada como proibida.

## 9. Reviewer final

- O trabalho deixou de ser apenas conceito? Sim.
- A direcao foi aplicada em paginas reais? Sim, nas P0 e na base compartilhada.
- As paginas P0 foram cobertas? Sim.
- Stakeholders foram ouvidos? Sim, por pareceres separados de PO/PM, medico, QA e reviewer.
- A experiencia geral ficou mais consistente? Sim nas areas principais; parcial no produto inteiro.
- Pendencias? Sim, nao criticas para P0: redesign profundo de chat, perfil, notificacoes, admin e algumas auth auxiliares.
- Decisao: Parcial, precisa proxima execucao para concluir P1/P2.

## 10. Arquivos criados

- `src/app/components/shared/VisualSystem.tsx`
- `artifacts/screenshots/visual-direction/*.png`
- `artifacts/visual-direction-report.md`

## 11. Arquivos alterados nesta execucao

- `src/styles/theme.css`
- `src/app/components/public/PublicPagePrimitives.tsx`
- `src/app/components/layout/PublicLayout.tsx`
- `src/app/components/layout/PatientLayout.tsx`
- `src/app/components/layout/SupporterLayout.tsx`
- `src/app/components/layout/InstitutionLayout.tsx`
- `src/app/components/layout/AdminLayout.tsx`
- `src/app/components/shared/DreamCard.tsx`
- `src/app/components/shared/EmptyState.tsx`
- `src/app/pages/PublicDreamDetail.tsx`
- `src/app/pages/Partnerships.tsx`
- `src/app/pages/auth/Login.tsx`
- `src/app/pages/auth/Register.tsx`
- `src/app/pages/patient/CreateDream.tsx`
- `src/app/pages/patient/MyDreams.tsx`
- `src/app/pages/patient/DreamDetail.tsx`
- `src/app/pages/patient/PatientDashboard.tsx`
- `src/app/pages/supporter/ExploreDreams.tsx`
- `src/app/pages/supporter/SupporterDreamDetail.tsx`
- `src/app/pages/supporter/SupporterDashboard.tsx`
- `src/app/pages/supporter/MyProposals.tsx`
- `src/app/pages/institution/InstitutionCreateDream.tsx`
- `src/app/pages/institution/InstitutionDashboard.tsx`
- `src/app/pages/institution/InstitutionDreams.tsx`
- `src/app/pages/patient/MyDreams.test.tsx`
- `src/app/pages/supporter/ExploreDreams.test.tsx`
- `src/app/pages/institution/InstitutionCreateDream.test.tsx`

Observacao: o worktree ja continha outras alteracoes antes desta execucao; elas nao foram revertidas.

## 12. Comandos executados

| Comando | Resultado |
|---|---|
| `rtk npm run lint` | Passou |
| `rtk npm run typecheck` | Passou |
| `rtk npm run test` | Passou, 42 arquivos web e 21 API |
| `rtk npm run build` | Passou; Vite emitiu apenas aviso de chunk grande |
| `rtk env APP_ENV=sandbox API_PORT=4100 ... npm run dev:api` | Rodando em `http://127.0.0.1:4100` |
| `rtk env VITE_APP_ENV=sandbox VITE_API_URL=http://127.0.0.1:4100 npm run dev:web -- --host 127.0.0.1` | Rodando em `http://127.0.0.1:5175` |
| `rtk env VITE_APP_ENV=production VITE_API_URL=http://127.0.0.1:4100 npm run dev:web -- --host 127.0.0.1` | Rodando em `http://127.0.0.1:5176` para login/cadastro reais |
| `rtk agent-browser ...` | Screenshots e navegacao manual passaram |

## 13. Ambiente local

- API: `http://127.0.0.1:4100`, sandbox-memory, status `/health` ok.
- Web sandbox: `http://127.0.0.1:5175`.
- Web production local para auth: `http://127.0.0.1:5176`.
- Rotas validadas: `/`, `/parcerias`, `/login`, `/cadastro`, `/sonhos/dream-patient-public`, `/paciente/sonhos`, `/paciente/sonhos/criar`, `/paciente/sonhos/dream-patient-public`, `/apoiador/explorar`, `/apoiador/sonhos/dream-patient-public`, `/instituicao/sonhos`, `/instituicao/sonhos/criar`, dashboards P1.
- Rotas com problema: nenhuma P0; P2 admin sem validacao manual por ausencia de persona admin no sandbox.

## 14. Evidencias visuais

Diretorio: `artifacts/screenshots/visual-direction/`.

- Home: `home-desktop.png`, `home-mobile.png`
- Parcerias: `parcerias-desktop.png`, `parcerias-mobile.png`
- Login: `login-desktop.png`, `login-mobile.png`
- Cadastro: `cadastro-desktop.png`, `cadastro-mobile.png`
- Detalhe publico: `public-dream-detail-desktop.png`, `public-dream-detail-mobile.png`
- Meus sonhos: `patient-dreams-desktop.png`, `patient-dreams-mobile.png`
- Criar sonho: `create-dream-desktop.png`, `create-dream-mobile.png`
- Detalhe paciente: `patient-dream-detail-desktop.png`, `patient-dream-detail-mobile.png`
- Explorar sonhos: `explore-dreams-desktop.png`, `explore-dreams-mobile.png`
- Detalhe apoiador: `supporter-dream-detail-desktop.png`, `supporter-dream-detail-mobile.png`
- Instituicao sonhos: `institution-dreams-desktop.png`, `institution-dreams-mobile.png`
- Instituicao criar sonho: `institution-create-dream-desktop.png`, `institution-create-dream-mobile.png`
- Amostras P1: `patient-dashboard-desktop.png`, `supporter-dashboard-desktop.png`, `institution-dashboard-desktop.png`

## 15. Pendencias

### Pendencias criticas

- Nenhuma P0 pendente.

### Pendencias nao criticas

- Redesenho profundo de chat, perfil, notificacoes e paginas auxiliares de autenticacao.
- Validacao manual de admin sem depender de persona fake ou ambiente fora do sandbox.
- Refinar telas legais/institucionais secundarias se o produto exigir paridade visual total.

### Proxima execucao recomendada

1. Redesenhar chat e propostas com foco em moderacao, privacidade e ausencia de dinheiro.
2. Redesenhar perfis/notificacoes e fluxos auxiliares de auth.
3. Criar validacao manual/admin seed para cobrir P2 com screenshots.
4. Rodar nova QA visual completa em todas as rotas P1/P2.
