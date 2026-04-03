import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import {
  Heart, Star, Shield, Users, BarChart2,
  CheckCircle, AlertTriangle, Zap, Target, TrendingUp,
  FileText, Lock, Globe, ChevronRight, ChevronDown,
  Flag, Settings, Eye, Code2,
  Layers, ArrowRight, Info, XCircle,
} from 'lucide-react';
import logoImg from '../../assets/df29d28e06eae9a96d131fc75e2fd7064bd951d1.png';

/* ─── Types ──────────────────────────────────────────────────────── */
type FeatureStatus = 'implemented' | 'in-progress' | 'planned' | 'discarded';

interface Feature {
  name: string;
  desc?: string;
  status: FeatureStatus;
}

interface Section {
  id: string;
  label: string;
  icon: React.ElementType;
}

/* ─── Config ─────────────────────────────────────────────────────── */
const VERSION   = '1.4.0';
const UPDATED   = '01 mar 2026';
const STATUS    = 'Em desenvolvimento ativo';
const STACK_TAG = 'React · TypeScript · Tailwind CSS v4 · React Router v7';

const tocSections: Section[] = [
  { id: 'visao',        label: 'Visão & Missão',         icon: Star },
  { id: 'problema',     label: 'Problema & Oportunidade', icon: Target },
  { id: 'personas',     label: 'Personas',                icon: Users },
  { id: 'escopo',       label: 'Escopo da Solução',       icon: Layers },
  { id: 'features',     label: 'Funcionalidades',         icon: CheckCircle },
  { id: 'regras',       label: 'Regras de Negócio',       icon: Shield },
  { id: 'design',       label: 'Design System',           icon: Eye },
  { id: 'arquitetura',  label: 'Arquitetura Técnica',     icon: Code2 },
  { id: 'metricas',     label: 'Métricas & OKRs',         icon: BarChart2 },
  { id: 'roadmap',      label: 'Roadmap',                 icon: TrendingUp },
  { id: 'riscos',       label: 'Riscos & Restrições',     icon: AlertTriangle },
];

/* ─── Status helpers ─────────────────────────────────────────────── */
const statusCfg: Record<FeatureStatus, { label: string; color: string; dot: string }> = {
  'implemented':  { label: 'Implementado',      color: 'bg-green-50 text-green-700 border border-green-200',   dot: 'bg-green-500' },
  'in-progress':  { label: 'Em desenvolvimento', color: 'bg-blue-50 text-blue-700 border border-blue-200',     dot: 'bg-blue-500 animate-pulse' },
  'planned':      { label: 'Planejado',           color: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-400' },
  'discarded':    { label: 'Descartado',          color: 'bg-gray-50 text-gray-400 border border-gray-200',    dot: 'bg-gray-300' },
};

function StatusBadge({ status }: { status: FeatureStatus }) {
  const c = statusCfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full shrink-0 ${c.color}`} style={{ fontWeight: 500 }}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function FeatureRow({ f }: { f: Feature }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>{f.name}</p>
        {f.desc && <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{f.desc}</p>}
      </div>
      <StatusBadge status={f.status} />
    </div>
  );
}

/* ─── Data ───────────────────────────────────────────────────────── */
const featureAreas: { title: string; icon: React.ElementType; color: string; accent: string; features: Feature[] }[] = [
  {
    title: 'Área Pública',
    icon: Globe,
    color: 'bg-pink-50 border-pink-200',
    accent: 'text-pink-600',
    features: [
      { name: 'Landing page',                      desc: 'Hero, sonhos em destaque, como funciona, depoimentos, CTA final', status: 'implemented' },
      { name: 'Como funciona',                     desc: 'Fluxo detalhado para pacientes e apoiadores com etapas visuais',   status: 'implemented' },
      { name: 'Segurança',                         desc: 'Página dedicada às práticas de segurança da plataforma',           status: 'implemented' },
      { name: 'FAQ',                               desc: 'Perguntas frequentes com busca e categorias',                      status: 'implemented' },
      { name: 'Termos de Uso',                     desc: 'Documento legal completo com índice navegável',                   status: 'implemented' },
      { name: 'Política de Privacidade',           desc: 'LGPD compliant com direitos dos titulares',                       status: 'implemented' },
      { name: 'Diretrizes da Comunidade',          desc: 'Regras de conduta, moderação e como denunciar',                   status: 'implemented' },
      { name: 'Detalhe público de sonho',          desc: 'Página pública de sonho individual com CTA de apoio',             status: 'implemented' },
      { name: 'Portal de empresas parceiras',      desc: 'Área para captação de parcerias corporativas',                    status: 'discarded'   },
    ],
  },
  {
    title: 'Autenticação & Onboarding',
    icon: Lock,
    color: 'bg-violet-50 border-violet-200',
    accent: 'text-violet-600',
    features: [
      { name: 'Login',                             desc: 'Autenticação com e-mail/senha, recuperação de conta',              status: 'implemented' },
      { name: 'Cadastro unificado',                desc: 'Seleção de perfil (Paciente/Apoiador) no fluxo de cadastro',       status: 'implemented' },
      { name: 'Seleção de perfil',                 desc: 'Tela intermediária de escolha entre Paciente e Apoiador',          status: 'implemented' },
      { name: 'Recuperação de senha',              desc: 'Fluxo de reset de senha por e-mail',                               status: 'implemented' },
      { name: 'Onboarding Paciente',               desc: 'Wizard de 4 etapas: dados pessoais, condição, sonhos, preferências', status: 'implemented' },
      { name: 'Onboarding Apoiador',               desc: 'Wizard de 4 etapas: dados pessoais, habilidades, disponibilidade, verificação', status: 'implemented' },
      { name: 'Verificação de identidade (KYC)',   desc: 'Validação de CPF e documento para apoiadores',                    status: 'planned'     },
      { name: 'Login social (Google/Apple)',        desc: 'Autenticação via OAuth',                                          status: 'planned'     },
    ],
  },
  {
    title: 'Área do Paciente',
    icon: Heart,
    color: 'bg-rose-50 border-rose-200',
    accent: 'text-rose-600',
    features: [
      { name: 'Dashboard',                         desc: 'Visão geral de sonhos, propostas pendentes e conexões ativas',     status: 'implemented' },
      { name: 'Criar sonho',                       desc: 'Formulário completo com categoria, descrição, localização e mídia', status: 'implemented' },
      { name: 'Meus sonhos',                       desc: 'Lista de sonhos com filtros por status',                           status: 'implemented' },
      { name: 'Detalhe do sonho',                  desc: 'Gerenciamento de proposta, chat e status do sonho',               status: 'implemented' },
      { name: 'Propostas recebidas',               desc: 'Lista de propostas com aceite/recusa e histórico',                status: 'implemented' },
      { name: 'Chat (paciente)',                   desc: 'Chat com apoiador aceito, moderado e seguro',                     status: 'implemented' },
      { name: 'Perfil do paciente',                desc: 'Edição de dados pessoais, condição de saúde e privacidade',      status: 'implemented' },
      { name: 'Notificações',                      desc: 'Central de notificações com mark-as-read',                        status: 'implemented' },
      { name: 'Conclusão de sonho',                desc: 'Tela de celebração ao marcar sonho como concluído',               status: 'implemented' },
      { name: 'Avaliação do apoiador',             desc: 'Formulário de avaliação pós-conexão',                             status: 'planned'     },
      { name: 'Gerenciar familiar/cuidador',       desc: 'Adicionar pessoas de confiança para gerenciar o perfil',          status: 'planned'     },
    ],
  },
  {
    title: 'Área do Apoiador',
    icon: Star,
    color: 'bg-teal-50 border-teal-200',
    accent: 'text-teal-600',
    features: [
      { name: 'Dashboard',                         desc: 'Visão geral de propostas enviadas, conexões ativas e impacto',    status: 'implemented' },
      { name: 'Explorar sonhos',                   desc: 'Feed de sonhos com filtros por categoria, cidade e disponibilidade', status: 'implemented' },
      { name: 'Detalhe do sonho (apoiador)',        desc: 'Visualização completa com envio de proposta',                    status: 'implemented' },
      { name: 'Minhas propostas',                  desc: 'Lista de propostas com status e histórico',                       status: 'implemented' },
      { name: 'Chat (apoiador)',                   desc: 'Chat com paciente após proposta aceita',                          status: 'implemented' },
      { name: 'Perfil do apoiador',                desc: 'Edição de habilidades, disponibilidade e verificação',            status: 'implemented' },
      { name: 'Notificações',                      desc: 'Central de notificações com mark-as-read',                        status: 'implemented' },
      { name: 'Avaliação recebida',                desc: 'Visualização de avaliações recebidas de pacientes',               status: 'planned'     },
      { name: 'Histórico de conexões',             desc: 'Registro completo de sonhos realizados com métricas de impacto',  status: 'planned'     },
      { name: 'Badge de apoiador verificado',      desc: 'Selo de confiança após KYC e histórico positivo',                 status: 'planned'     },
    ],
  },
  {
    title: 'Área do Administrador',
    icon: Settings,
    color: 'bg-orange-50 border-orange-200',
    accent: 'text-orange-600',
    features: [
      { name: 'Visão geral / Dashboard',           desc: 'KPIs, gráficos de crescimento e alertas operacionais',            status: 'implemented' },
      { name: 'Gestão de usuários',                desc: 'Lista, busca, filtro, edição de papel, banimento com modal',      status: 'implemented' },
      { name: 'Gestão de sonhos',                  desc: 'Moderação, aprovação, rejeição e histórico de conteúdo',          status: 'implemented' },
      { name: 'Gestão de propostas',               desc: 'Visibilidade sobre todas as propostas da plataforma',             status: 'implemented' },
      { name: 'Monitoramento de chats',            desc: 'Acesso moderador a conversas reportadas',                         status: 'implemented' },
      { name: 'Central de denúncias',              desc: 'Fila de denúncias com badges 🚩, modal de análise e sub-modal de confirmação', status: 'implemented' },
      { name: 'Templates de e-mail',               desc: 'Editor de templates transacionais com preview',                   status: 'implemented' },
      { name: 'Configurações da plataforma',       desc: 'Parâmetros globais, manutenção e integrações',                    status: 'implemented' },
      { name: 'Auditoria',                         desc: 'Log de ações administrativas com filtros e exportação',           status: 'implemented' },
      { name: 'Relatórios e exportação',           desc: 'Relatórios em PDF/CSV de uso, conexões e segurança',              status: 'planned'     },
      { name: 'Gestão de parcerias corporativas',  desc: 'Módulo para gerir empresas parceiras (pausado)',                  status: 'discarded'   },
    ],
  },
  {
    title: 'Plataforma & Infraestrutura',
    icon: Code2,
    color: 'bg-gray-50 border-gray-200',
    accent: 'text-gray-600',
    features: [
      { name: 'RBAC (controle de acesso)',         desc: 'Roles: public, paciente, apoiador, admin — com proteção de rotas', status: 'implemented' },
      { name: 'Design system (tokens, tema)',      desc: 'Cores, tipografia, espaçamentos e componentes base',              status: 'implemented' },
      { name: 'Responsividade mobile-first',       desc: 'Layout adaptável para todos os breakpoints',                     status: 'implemented' },
      { name: 'Navegação bidirecional denúncias',  desc: 'Badges 🚩 e navegação via location.state.openId',               status: 'implemented' },
      { name: 'Supabase (backend)',                desc: 'Auth, banco de dados, storage e realtime',                       status: 'planned'     },
      { name: 'Notificações push (PWA)',           desc: 'Notificações nativas no mobile via service worker',              status: 'planned'     },
      { name: 'Chat em tempo real (Supabase Realtime)', desc: 'Migrar chat mockado para websocket real',                  status: 'planned'     },
      { name: 'Moderação automática com IA',       desc: 'Filtro de conteúdo impróprio em sonhos e chats',                status: 'planned'     },
      { name: 'App nativo (React Native)',         desc: 'Versão mobile standalone',                                       status: 'planned'     },
    ],
  },
];

const businessRules = [
  {
    id: 'BR-01', priority: 'Crítico',
    title: 'Zero transações financeiras',
    desc: 'Nenhum tipo de troca monetária é permitida entre usuários. Qualquer menção, solicitação ou oferta de dinheiro, PIX, doação ou bem de valor resulta em suspensão permanente imediata.',
    color: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-700',
  },
  {
    id: 'BR-02', priority: 'Crítico',
    title: 'Moderação de conteúdo obrigatória',
    desc: 'Todo sonho publicado passa por moderação (automática + humana) antes de ser exibido publicamente. Propostas passam por análise antes de chegarem ao paciente.',
    color: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-700',
  },
  {
    id: 'BR-03', priority: 'Alto',
    title: 'Privacidade do paciente antes do aceite',
    desc: 'Dados pessoais identificáveis do paciente (sobrenome completo, telefone, endereço) não são expostos a apoiadores antes de uma proposta ser aceita.',
    color: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-700',
  },
  {
    id: 'BR-04', priority: 'Alto',
    title: 'Um sonho ativo por paciente por vez',
    desc: 'Pacientes podem ter múltiplos sonhos cadastrados, mas apenas um pode estar "Em busca de apoiador" simultaneamente, para garantir qualidade da experiência.',
    color: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-700',
  },
  {
    id: 'BR-05', priority: 'Alto',
    title: 'Uma proposta aceita por sonho',
    desc: 'Cada sonho aceita no máximo uma proposta. Após aceite, demais propostas são automaticamente arquivadas com notificação educada aos proponentes.',
    color: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-700',
  },
  {
    id: 'BR-06', priority: 'Médio',
    title: 'Verificação de identidade para apoiadores',
    desc: 'Apoiadores precisam verificar identidade (CPF + e-mail) para ter acesso completo. Contas não verificadas têm funcionalidades limitadas.',
    color: 'border-amber-200 bg-amber-50', badge: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'BR-07', priority: 'Médio',
    title: 'Denúncia sigilosa',
    desc: 'O usuário denunciado não tem acesso à identidade de quem realizou a denúncia. Administradores veem o denunciante apenas para fins de moderação.',
    color: 'border-amber-200 bg-amber-50', badge: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'BR-08', priority: 'Médio',
    title: 'Retenção de dados pós-encerramento',
    desc: 'Dados são anonimizados em até 30 dias após solicitação de exclusão. Logs de segurança e denúncias são retidos por 5 anos conforme obrigação legal.',
    color: 'border-amber-200 bg-amber-50', badge: 'bg-amber-100 text-amber-700',
  },
];

const personas = [
  {
    emoji: '👩‍🦳',
    name: 'Ana Souza',
    role: 'Paciente',
    age: '67 anos',
    city: 'Santos, SP',
    condition: 'Em tratamento oncológico',
    color: 'border-pink-200 bg-pink-50',
    accent: 'text-pink-700',
    badge: 'bg-pink-100 text-pink-700',
    goals: ['Manter qualidade de vida durante o tratamento', 'Realizar experiências simples mas significativas', 'Sentir-se conectada ao mundo além do hospital'],
    pains: ['Mobilidade reduzida que limita saídas sozinha', 'Vergonha de pedir ajuda a familiares ocupados', 'Medo de se tornar "um fardo" para quem ama'],
    quote: '"Não peço muito — só quero sentir a areia nos pés uma vez ainda."',
  },
  {
    emoji: '👩‍💻',
    name: 'Fernanda Lima',
    role: 'Apoiadora',
    age: '32 anos',
    city: 'São Paulo, SP',
    condition: 'Designer UX, fins de semana livres',
    color: 'border-teal-200 bg-teal-50',
    accent: 'text-teal-700',
    badge: 'bg-teal-100 text-teal-700',
    goals: ['Usar seu tempo livre de forma significativa', 'Ter experiências humanas fora da bolha digital', 'Construir repertório de empatia e propósito'],
    pains: ['Não sabe por onde começar a ajudar', 'Tem medo de se comprometer com algo complexo', 'Insegurança sobre se está "fazendo o suficiente"'],
    quote: '"Tenho sábados livres — só preciso saber onde posso fazer diferença."',
  },
  {
    emoji: '👨‍👦',
    name: 'Carlos Mendes',
    role: 'Familiar/Cuidador',
    age: '48 anos',
    city: 'Rio de Janeiro, RJ',
    condition: 'Filho e cuidador de paciente oncológico',
    color: 'border-blue-200 bg-blue-50',
    accent: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    goals: ['Realizar sonhos da mãe que ele não consegue sozinho', 'Encontrar pessoas de confiança para ajudar', 'Reduzir a culpa de não estar presente o tempo todo'],
    pains: ['Sobrecarga de trabalho e responsabilidades', 'Dificuldade em encontrar voluntários confiáveis', 'Não quer expor a mãe a desconhecidos sem triagem'],
    quote: '"Ela quer aprender violão. Eu trabalho 10 horas por dia. Preciso de ajuda."',
  },
  {
    emoji: '🛡️',
    name: 'Admin NextDream',
    role: 'Administrador',
    age: 'Equipe interna',
    city: 'Remoto',
    condition: 'Equipe de moderação e operações',
    color: 'border-orange-200 bg-orange-50',
    accent: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
    goals: ['Garantir segurança de todos os usuários', 'Moderar conteúdo com agilidade e consistência', 'Gerar relatórios para tomada de decisão'],
    pains: ['Volume crescente de denúncias e conteúdo a moderar', 'Necessidade de agir rapidamente em casos críticos', 'Manter equilíbrio entre segurança e boa experiência'],
    quote: '"Nossa missão é que nenhuma conexão gere um dano — e que toda boa conexão seja possível."',
  },
];

const metrics = [
  {
    category: 'Aquisição',
    color: 'bg-blue-50 border-blue-100',
    accent: 'text-blue-600',
    okrs: [
      { name: 'Novos cadastros/mês',          target: '200 usuários',      current: '~80 (mock)',     trend: 'up' },
      { name: 'Taxa de conversão landing',    target: '≥ 8%',              current: 'N/A',            trend: 'neutral' },
      { name: 'Sonhos publicados/mês',         target: '50 sonhos',        current: '~20 (mock)',     trend: 'up' },
    ],
  },
  {
    category: 'Engajamento',
    color: 'bg-teal-50 border-teal-100',
    accent: 'text-teal-600',
    okrs: [
      { name: 'Taxa de sonhos com proposta',  target: '≥ 70% em 7 dias',  current: 'N/A',            trend: 'neutral' },
      { name: 'Taxa de aceite de propostas',  target: '≥ 50%',            current: 'N/A',            trend: 'neutral' },
      { name: 'Mensagens trocadas/conexão',   target: '≥ 15 msgs',        current: 'N/A',            trend: 'neutral' },
    ],
  },
  {
    category: 'Impacto',
    color: 'bg-pink-50 border-pink-100',
    accent: 'text-pink-600',
    okrs: [
      { name: 'Conexões realizadas/mês',      target: '30 conexões',      current: '~10 (mock)',     trend: 'up' },
      { name: 'Sonhos marcados concluídos',   target: '≥ 80% das conexões', current: 'N/A',          trend: 'neutral' },
      { name: 'NPS médio da plataforma',      target: '≥ 70',             current: 'N/A',            trend: 'neutral' },
    ],
  },
  {
    category: 'Segurança',
    color: 'bg-red-50 border-red-100',
    accent: 'text-red-600',
    okrs: [
      { name: 'Tempo médio de moderação',     target: '< 24h',            current: 'N/A',            trend: 'neutral' },
      { name: 'Taxa de denúncias resolvidas', target: '≥ 95% em 48h',     current: 'N/A',            trend: 'neutral' },
      { name: 'Incidentes de segurança',      target: '0 graves/mês',     current: 'N/A',            trend: 'neutral' },
    ],
  },
];

const roadmapItems = [
  {
    phase: 'Fase 1 — MVP Navegável',
    period: 'out 2025 – mar 2026',
    status: 'in-progress' as FeatureStatus,
    items: [
      'Protótipo navegável completo (todas as telas)',
      'Design system e componentes base',
      'Área pública (landing, FAQ, legal)',
      'Fluxos de autenticação e onboarding',
      'Portal Paciente completo',
      'Portal Apoiador completo',
      'Portal Admin completo com moderação',
    ],
  },
  {
    phase: 'Fase 2 — Backend Real',
    period: 'abr – jun 2026',
    status: 'planned' as FeatureStatus,
    items: [
      'Integração com Supabase (auth, banco, storage)',
      'Chat em tempo real com Supabase Realtime',
      'Notificações por e-mail (Resend ou SendGrid)',
      'Moderação automática com IA (GPT ou Perspective API)',
      'KYC básico de apoiadores',
      'PWA com notificações push',
    ],
  },
  {
    phase: 'Fase 3 — Crescimento',
    period: 'jul – dez 2026',
    status: 'planned' as FeatureStatus,
    items: [
      'Sistema de avaliações e reputação',
      'Badge de apoiador verificado',
      'Histórico de impacto do apoiador',
      'Login social (Google / Apple)',
      'Relatórios e exportação para admin',
      'Gerenciamento de familiar/cuidador',
    ],
  },
  {
    phase: 'Fase 4 — Escala',
    period: '2027+',
    status: 'planned' as FeatureStatus,
    items: [
      'App nativo (React Native)',
      'Portal de parcerias corporativas (reformulado)',
      'Moderação com IA avançada',
      'Expansão geográfica (LATAM)',
      'API pública para integrações hospitalares',
    ],
  },
];

const risks = [
  { level: 'Alto',  color: 'bg-red-50 border-red-200 text-red-700',     badge: 'bg-red-100',    title: 'Segurança de usuários vulneráveis', desc: 'Pacientes em situação de vulnerabilidade podem ser alvo de má-fé. Mitigação: moderação rigorosa, KYC, denúncia fácil e educação da comunidade.' },
  { level: 'Alto',  color: 'bg-red-50 border-red-200 text-red-700',     badge: 'bg-red-100',    title: 'LGPD e dados sensíveis de saúde', desc: 'Dados de condição de saúde são sensíveis por lei. Mitigação: minimização de dados, criptografia, DPO nomeado e contratos com subprocessadores.' },
  { level: 'Médio', color: 'bg-orange-50 border-orange-200 text-orange-700', badge: 'bg-orange-100', title: 'Escalada de moderação', desc: 'Volume de denúncias pode crescer além da capacidade da equipe. Mitigação: IA de moderação na Fase 2, SLAs definidos e equipe escalável.' },
  { level: 'Médio', color: 'bg-orange-50 border-orange-200 text-orange-700', badge: 'bg-orange-100', title: 'Abandono pós-cadastro', desc: 'Usuários podem se cadastrar mas não completar o onboarding. Mitigação: onboarding progressivo, e-mails de ativação e gamificação leve.' },
  { level: 'Baixo', color: 'bg-amber-50 border-amber-200 text-amber-700', badge: 'bg-amber-100', title: 'Desequilíbrio oferta/demanda', desc: 'Mais sonhos do que apoiadores ou vice-versa. Mitigação: campanhas de ativação segmentadas por perfil.' },
  { level: 'Baixo', color: 'bg-amber-50 border-amber-200 text-amber-700', badge: 'bg-amber-100', title: 'Dependência de fornecedor (Supabase)', desc: 'Lock-in de infraestrutura. Mitigação: camada de abstração de serviços e backup regular.' },
];

/* ─── Main Component ─────────────────────────────────────────────── */
export default function PRD() {
  const [activeSection, setActiveSection] = useState('visao');
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    tocSections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 border-b border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <img src={logoImg} alt="NextDream" className="h-9 w-auto brightness-0 invert opacity-90" />
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full">v{VERSION}</span>
              <span className="text-xs bg-blue-900/60 text-blue-300 border border-blue-700 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                {STATUS}
              </span>
              <span className="text-xs bg-gray-700 text-gray-400 px-3 py-1 rounded-full">Atualizado: {UPDATED}</span>
            </div>
          </div>
          <h1 className="text-white mb-2" style={{ fontWeight: 800, fontSize: '1.875rem' }}>
            Product Requirements Document
          </h1>
          <p className="text-gray-400 text-sm mb-4">{STACK_TAG}</p>
          <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
            Documento vivo que centraliza a visão, requisitos, regras de negócio, design system,
            arquitetura e roadmap da plataforma NextDream. Atualizado a cada sprint.
          </p>

          {/* Resumo rápido */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { label: 'Páginas implementadas', value: '40+',  icon: FileText, color: 'text-pink-400' },
              { label: 'Componentes',           value: '60+',  icon: Layers,   color: 'text-teal-400' },
              { label: 'Áreas da plataforma',   value: '4',    icon: Globe,    color: 'text-blue-400' },
              { label: 'Regras de negócio',      value: '8',    icon: Shield,   color: 'text-amber-400' },
            ].map((s, i) => (
              <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3">
                <s.icon className={`w-4 h-4 mb-1.5 ${s.color}`} />
                <p className="text-white text-xl" style={{ fontWeight: 700 }}>{s.value}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Layout ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex gap-8">

        {/* Sidebar (sticky) */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-6">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>Índice</p>
            <nav className="space-y-0.5">
              {tocSections.map(s => {
                const isActive = activeSection === s.id;
                return (
                  <button key={s.id} onClick={() => scrollTo(s.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                      isActive ? 'bg-pink-50 text-pink-700 font-semibold' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                    <s.icon className="w-3.5 h-3.5 shrink-0" />
                    {s.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-5 border-t border-gray-200 space-y-2">
              <Link to="/" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-pink-600 transition-colors">
                <Globe className="w-3.5 h-3.5" /> Ver plataforma
              </Link>
              <Link to="/seguranca" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-pink-600 transition-colors">
                <Shield className="w-3.5 h-3.5" /> Segurança
              </Link>
              <Link to="/termos" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-pink-600 transition-colors">
                <FileText className="w-3.5 h-3.5" /> Termos de Uso
              </Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 space-y-16">

          {/* ── Visão & Missão ──────────────────────────────── */}
          <section id="visao" className="scroll-mt-6">
            <SectionHeader icon={Star} title="Visão & Missão" color="text-pink-600" />
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-2xl p-5">
                <p className="text-pink-700 text-xs mb-2" style={{ fontWeight: 700 }}>VISÃO</p>
                <p className="text-gray-800 leading-relaxed" style={{ fontWeight: 600, fontSize: '1rem' }}>
                  Ser a principal plataforma do Brasil que conecta pessoas em situação de vulnerabilidade com voluntários dispostos a oferecer tempo, presença e cuidado — sem nenhuma transação financeira.
                </p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-5">
                <p className="text-teal-700 text-xs mb-2" style={{ fontWeight: 700 }}>MISSÃO</p>
                <p className="text-gray-800 leading-relaxed" style={{ fontWeight: 600, fontSize: '1rem' }}>
                  Dar a pacientes e seus familiares a chance de realizar sonhos e desejos através de conexões humanas genuínas, construídas sobre confiança, empatia e segurança.
                </p>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-gray-700 text-sm mb-4" style={{ fontWeight: 700 }}>Valores fundamentais</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Heart, color: 'text-pink-600 bg-pink-50', v: 'Humanidade', d: 'Pessoas no centro de cada decisão. Sem exceção.' },
                  { icon: Shield, color: 'text-blue-600 bg-blue-50', v: 'Segurança', d: 'Nenhuma conexão vale o risco de uma vida.' },
                  { icon: Eye, color: 'text-teal-600 bg-teal-50', v: 'Transparência', d: 'Regras claras, moderação visível, sem letra miúda.' },
                  { icon: Zap, color: 'text-amber-600 bg-amber-50', v: 'Simplicidade', d: 'Menos burocracia. Mais conexão.' },
                ].map((v, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${v.color}`}>
                      <v.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-gray-800 text-sm" style={{ fontWeight: 700 }}>{v.v}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{v.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Problema & Oportunidade ─────────────────────── */}
          <section id="problema" className="scroll-mt-6">
            <SectionHeader icon={Target} title="Problema & Oportunidade" color="text-orange-600" />
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-gray-700 text-sm mb-3" style={{ fontWeight: 700 }}>O problema</p>
                <div className="space-y-3">
                  {[
                    'Pacientes em tratamento prolongado (oncológico, dialítico, paliativos) frequentemente possuem sonhos e desejos simples que não podem realizar por limitações físicas, financeiras ou de acompanhamento.',
                    'Familiares e cuidadores estão sobrecarregados e não conseguem estar presentes em todos os momentos — gerando sentimento de culpa e impotência.',
                    'Existe uma enorme quantidade de pessoas dispostas a ajudar, mas sem canais seguros, estruturados e confiáveis para isso. A boa vontade existe — falta o meio.',
                    'Plataformas de voluntariado existentes são genéricas, burocráticas ou focadas em ONG/corporativo. Não há nenhuma plataforma focada em desejos pessoais e conexão humana direta.',
                  ].map((p, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm leading-relaxed">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-gray-700 text-sm mb-3" style={{ fontWeight: 700 }}>A oportunidade</p>
                <div className="space-y-3">
                  {[
                    'O Brasil tem mais de 3 milhões de pessoas com câncer em tratamento ativo — apenas um dos grupos que o NextDream pode atender.',
                    'Pesquisas de impacto social mostram que 45% dos brasileiros gostariam de fazer trabalho voluntário, mas apenas 7% efetivamente fazem. A barreira é de acesso e confiança, não de intenção.',
                    'O modelo sem dinheiro elimina os principais riscos legais e éticos de plataformas de ajuda, tornando a proposta mais segura e escalável.',
                  ].map((p, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm leading-relaxed">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Personas ────────────────────────────────────── */}
          <section id="personas" className="scroll-mt-6">
            <SectionHeader icon={Users} title="Personas" color="text-violet-600" />
            <div className="grid sm:grid-cols-2 gap-4">
              {personas.map((p, i) => (
                <div key={i} className={`border rounded-2xl p-5 ${p.color}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{p.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-800 text-sm" style={{ fontWeight: 700 }}>{p.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.badge}`} style={{ fontWeight: 500 }}>{p.role}</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">{p.age} · {p.city}</p>
                      <p className="text-gray-500 text-xs">{p.condition}</p>
                    </div>
                  </div>
                  <p className={`text-xs italic mb-3 ${p.accent}`}>{p.quote}</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-600 text-xs mb-1" style={{ fontWeight: 600 }}>Objetivos</p>
                      {p.goals.map((g, j) => (
                        <p key={j} className="text-gray-600 text-xs flex items-start gap-1.5 mt-1">
                          <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />{g}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs mb-1 mt-2" style={{ fontWeight: 600 }}>Dores</p>
                      {p.pains.map((g, j) => (
                        <p key={j} className="text-gray-600 text-xs flex items-start gap-1.5 mt-1">
                          <XCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />{g}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Escopo ──────────────────────────────────────── */}
          <section id="escopo" className="scroll-mt-6">
            <SectionHeader icon={Layers} title="Escopo da Solução" color="text-teal-600" />
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-4">
              <p className="text-gray-700 text-sm mb-4" style={{ fontWeight: 700 }}>Áreas da plataforma</p>
              <div className="space-y-3">
                {[
                  { icon: Globe, color: 'bg-pink-100 text-pink-600', label: 'Área Pública', path: '/', desc: 'Landing, como funciona, FAQ, segurança, autenticação, onboarding, legal' },
                  { icon: Heart, color: 'bg-rose-100 text-rose-600', label: 'Portal Paciente', path: '/paciente', desc: 'Dashboard, sonhos, propostas, chat, perfil, notificações' },
                  { icon: Star, color: 'bg-teal-100 text-teal-600', label: 'Portal Apoiador', path: '/apoiador', desc: 'Dashboard, explorar, propostas, chat, perfil, notificações' },
                  { icon: Settings, color: 'bg-orange-100 text-orange-600', label: 'Portal Admin', path: '/admin', desc: 'Overview, usuários, sonhos, propostas, chats, denúncias, e-mails, config, auditoria' },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.color}`}>
                      <a.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-800 text-sm" style={{ fontWeight: 700 }}>{a.label}</p>
                        <code className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{a.path}</code>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fora do escopo */}
            <div className="bg-gray-100 border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Flag className="w-4 h-4 text-gray-500" />
                <p className="text-gray-600 text-sm" style={{ fontWeight: 700 }}>Fora do escopo (v1)</p>
              </div>
              <div className="space-y-1.5">
                {[
                  'Transações financeiras de qualquer tipo',
                  'Portal de empresas parceiras (pausado — revisão futura)',
                  'App nativo mobile (Fase 4)',
                  'Integrações hospitalares via API (Fase 4)',
                  'Moderação de vídeos ou chamadas de áudio/vídeo',
                ].map((item, i) => (
                  <p key={i} className="text-gray-500 text-sm flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />{item}
                  </p>
                ))}
              </div>
            </div>
          </section>

          {/* ── Funcionalidades ─────────────────────────────── */}
          <section id="features" className="scroll-mt-6">
            <SectionHeader icon={CheckCircle} title="Funcionalidades" color="text-green-600" />

            {/* Legenda */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(Object.entries(statusCfg) as [FeatureStatus, typeof statusCfg[FeatureStatus]][]).map(([k, v]) => (
                <span key={k} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${v.color}`} style={{ fontWeight: 500 }}>
                  <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
                  {v.label}
                </span>
              ))}
            </div>

            <div className="space-y-4">
              {featureAreas.map((area, i) => (
                <div key={i} className={`border rounded-2xl overflow-hidden ${area.color}`}>
                  <div className="flex items-center gap-3 px-5 py-4">
                    <area.icon className={`w-5 h-5 ${area.accent}`} />
                    <p className={`text-sm ${area.accent}`} style={{ fontWeight: 700 }}>{area.title}</p>
                    <span className="ml-auto text-xs text-gray-400">{area.features.length} features</span>
                  </div>
                  <div className="bg-white border-t border-gray-100 px-5">
                    {area.features.map((f, j) => <FeatureRow key={j} f={f} />)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Regras de Negócio ───────────────────────────── */}
          <section id="regras" className="scroll-mt-6">
            <SectionHeader icon={Shield} title="Regras de Negócio" color="text-red-600" />
            <div className="space-y-3">
              {businessRules.map((r, i) => (
                <div key={i} className={`border rounded-2xl p-5 ${r.color}`}>
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <code className="text-xs font-mono bg-white/70 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">{r.id}</code>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${r.badge}`} style={{ fontWeight: 600 }}>{r.priority}</span>
                      </div>
                      <p className="text-gray-800 text-sm mb-1" style={{ fontWeight: 700 }}>{r.title}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Design System ───────────────────────────────── */}
          <section id="design" className="scroll-mt-6">
            <SectionHeader icon={Eye} title="Design System" color="text-pink-600" />
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Cores */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-gray-700 text-sm mb-4" style={{ fontWeight: 700 }}>Paleta de cores</p>
                <div className="space-y-2.5">
                  {[
                    { name: 'Primary',   hex: '#D91B8C', tw: 'bg-[#D91B8C]',   desc: 'Ações principais, CTAs, marca' },
                    { name: 'Pink 600',  hex: '#db2777', tw: 'bg-pink-600',     desc: 'Botões secundários, links' },
                    { name: 'Rose 500',  hex: '#f43f5e', tw: 'bg-rose-500',     desc: 'Gradientes, alertas leves' },
                    { name: 'Teal 600',  hex: '#0d9488', tw: 'bg-teal-600',     desc: 'Apoiador, sucesso, confirmação' },
                    { name: 'Orange 500',hex: '#f97316', tw: 'bg-orange-500',   desc: 'Admin, alertas moderados' },
                    { name: 'Gray 900',  hex: '#111827', tw: 'bg-gray-900',     desc: 'Admin sidebar, textos fortes' },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg shrink-0 ${c.tw}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-xs" style={{ fontWeight: 600 }}>{c.name}</p>
                        <p className="text-gray-400 text-xs">{c.hex} · {c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tipografia + outros */}
              <div className="space-y-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-gray-700 text-sm mb-3" style={{ fontWeight: 700 }}>Tipografia</p>
                  <div className="space-y-2">
                    {[
                      { role: 'Display',  size: '2–3rem',      weight: '800', note: 'Headlines hero' },
                      { role: 'Heading',  size: '1.5–1.875rem', weight: '700–800', note: 'Títulos de seção' },
                      { role: 'Body',     size: '0.875–1rem',  weight: '400–600', note: 'Textos gerais' },
                      { role: 'Caption',  size: '0.75rem',     weight: '400–600', note: 'Labels, badges' },
                    ].map((t, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <span className="w-16 text-gray-400 shrink-0">{t.role}</span>
                        <span className="text-gray-600">{t.size}</span>
                        <span className="text-gray-400">w{t.weight}</span>
                        <span className="text-gray-400 ml-auto">{t.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-gray-700 text-sm mb-3" style={{ fontWeight: 700 }}>Componentes base</p>
                  <div className="flex flex-wrap gap-2">
                    {['Botão primário', 'Botão ghost', 'Input', 'Select', 'Modal', 'Toast', 'Badge', 'Card', 'Avatar', 'Sidebar', 'DemoBar', 'StatusBadge'].map(c => (
                      <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-gray-700 text-sm mb-2" style={{ fontWeight: 700 }}>Princípios de UX</p>
                  <div className="space-y-1.5">
                    {['Mobile-first, responsivo', 'Bordas arredondadas (rounded-2xl/3xl)', 'Sombras leves (shadow-sm/md)', 'Feedback imediato (toast, disabled state)', 'Confirmação para ações destrutivas (sub-modal)', 'Backdrop clicável para fechar modais'].map((p, i) => (
                      <p key={i} className="text-gray-500 text-xs flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3 text-pink-400 shrink-0" />{p}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Arquitetura ─────────────────────────────────── */}
          <section id="arquitetura" className="scroll-mt-6">
            <SectionHeader icon={Code2} title="Arquitetura Técnica" color="text-gray-700" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-gray-700 text-sm mb-3" style={{ fontWeight: 700 }}>Stack atual (frontend)</p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Framework',    value: 'React 19 + TypeScript', color: 'text-blue-600' },
                    { label: 'Roteamento',   value: 'React Router v7 (Data Mode)', color: 'text-purple-600' },
                    { label: 'Estilização',  value: 'Tailwind CSS v4', color: 'text-teal-600' },
                    { label: 'Ícones',       value: 'lucide-react', color: 'text-gray-600' },
                    { label: 'Gráficos',     value: 'Recharts', color: 'text-orange-600' },
                    { label: 'State',        value: 'React Context (AppContext)', color: 'text-pink-600' },
                    { label: 'Build',        value: 'Vite', color: 'text-amber-600' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-gray-500 text-xs">{s.label}</span>
                      <span className={`text-xs font-medium ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-gray-700 text-sm mb-3" style={{ fontWeight: 700 }}>Stack planejada (backend)</p>
                  <div className="space-y-2">
                    {[
                      { label: 'BaaS / Auth',  value: 'Supabase', status: 'planned' as FeatureStatus },
                      { label: 'Storage',      value: 'Supabase Storage', status: 'planned' as FeatureStatus },
                      { label: 'Realtime',     value: 'Supabase Realtime (WebSocket)', status: 'planned' as FeatureStatus },
                      { label: 'E-mail',       value: 'Resend ou SendGrid', status: 'planned' as FeatureStatus },
                      { label: 'IA Moderação', value: 'OpenAI / Perspective API', status: 'planned' as FeatureStatus },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <span className="text-gray-500 text-xs">{s.label}: <span className="text-gray-700 font-medium">{s.value}</span></span>
                        <StatusBadge status={s.status} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-gray-700 text-sm mb-2" style={{ fontWeight: 700 }}>Padrões adotados</p>
                  <div className="space-y-1.5">
                    {['RBAC com AppContext + roles', 'Rotas protegidas por papel', 'Componentes em /src/app/components', 'Dados mock em /src/app/data', 'Layout components separados por portal', 'Atomic commits por feature'].map((p, i) => (
                      <p key={i} className="text-gray-500 text-xs flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />{p}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Métricas & OKRs ─────────────────────────────── */}
          <section id="metricas" className="scroll-mt-6">
            <SectionHeader icon={BarChart2} title="Métricas & OKRs" color="text-blue-600" />
            <div className="grid sm:grid-cols-2 gap-4">
              {metrics.map((cat, i) => (
                <div key={i} className={`border rounded-2xl p-5 ${cat.color}`}>
                  <p className={`text-sm mb-3 ${cat.accent}`} style={{ fontWeight: 700 }}>{cat.category}</p>
                  <div className="space-y-3">
                    {cat.okrs.map((o, j) => (
                      <div key={j} className="bg-white/70 rounded-xl p-3">
                        <p className="text-gray-800 text-xs mb-1" style={{ fontWeight: 600 }}>{o.name}</p>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-gray-500 text-xs">Meta: <span className="text-gray-700 font-medium">{o.target}</span></p>
                            <p className="text-gray-400 text-xs">Atual: {o.current}</p>
                          </div>
                          <TrendingUp className={`w-4 h-4 ${o.trend === 'up' ? 'text-green-500' : 'text-gray-300'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Roadmap ─────────────────────────────────────── */}
          <section id="roadmap" className="scroll-mt-6">
            <SectionHeader icon={TrendingUp} title="Roadmap" color="text-teal-600" />
            <div className="space-y-3">
              {roadmapItems.map((phase, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <button onClick={() => setExpandedPhase(expandedPhase === i ? null : i)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
                    <StatusBadge status={phase.status} />
                    <div className="flex-1">
                      <p className="text-gray-800 text-sm" style={{ fontWeight: 700 }}>{phase.phase}</p>
                      <p className="text-gray-500 text-xs">{phase.period}</p>
                    </div>
                    {expandedPhase === i ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
                  </button>
                  {expandedPhase === i && (
                    <div className="px-5 pb-5 border-t border-gray-100">
                      <ul className="mt-3 space-y-2">
                        {phase.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                            <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── Riscos ──────────────────────────────────────── */}
          <section id="riscos" className="scroll-mt-6">
            <SectionHeader icon={AlertTriangle} title="Riscos & Restrições" color="text-amber-600" />
            <div className="space-y-3">
              {risks.map((r, i) => (
                <div key={i} className={`border rounded-2xl p-4 ${r.color}`}>
                  <div className="flex items-start gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${r.badge}`} style={{ fontWeight: 600 }}>{r.level}</span>
                    <div>
                      <p className="text-sm mb-1" style={{ fontWeight: 700 }}>{r.title}</p>
                      <p className="text-sm leading-relaxed opacity-80">{r.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer info */}
          <div className="bg-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Info className="w-5 h-5 text-gray-500 shrink-0" />
            <p className="text-gray-500 text-sm leading-relaxed">
              Este documento é um protótipo vivo. Todas as funcionalidades marcadas como{' '}
              <strong className="text-gray-700">Implementado</strong> estão visíveis e navegáveis na plataforma.
              Dados de usuários e conexões são <strong className="text-gray-700">fictícios</strong> para fins de demonstração.
            </p>
          </div>

        </main>
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, color }: { icon: React.ElementType; title: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <h2 className="text-gray-800" style={{ fontWeight: 700, fontSize: '1.125rem' }}>{title}</h2>
    </div>
  );
}
