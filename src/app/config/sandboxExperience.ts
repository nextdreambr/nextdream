import type { SandboxPersona } from '../lib/api';

type SandboxBannerRole = SandboxPersona | 'admin' | 'public';

export interface SandboxPersonaContent {
  title: string;
  summary: string;
  primaryCta: string;
  tourCta: string;
  tourStartCta: string;
}

export interface SandboxTourStep {
  id: string;
  label: string;
  route: string;
  targetId: string;
  title: string;
  why: string;
}

interface SandboxExperienceConfig {
  page: {
    badge: string;
    title: string;
    description: string;
    trustTitle: string;
    trustItems: string[];
  };
  banner: {
    badge: string;
    title: string;
    description: string;
    restartCta: string;
    tourCta: string;
    roleLabels: Record<SandboxBannerRole, string>;
  };
  personas: Record<SandboxPersona, SandboxPersonaContent>;
  tours: Record<SandboxPersona, SandboxTourStep[]>;
}

export const sandboxExperienceConfig = {
  page: {
    badge: 'Experiencia de apresentacao',
    title: 'Escolha como voce quer conhecer a plataforma',
    description:
      'Entre pelo perfil que faz mais sentido para voce e experimente os principais caminhos da plataforma com liberdade.',
    trustTitle: 'Um espaco seguro para explorar',
    trustItems: [
      'Esta e uma experiencia de apresentacao.',
      'Voce pode navegar livremente e testar o fluxo.',
      'Nada daqui afeta atendimentos reais.',
    ],
  },
  banner: {
    badge: 'Experiencia de apresentacao',
    title: 'Voce pode navegar livremente e testar o fluxo.',
    description: 'Tudo aqui acontece apenas para voce conhecer a jornada.',
    restartCta: 'Recomecar experiencia',
    tourCta: 'Ver tour guiado',
    roleLabels: {
      paciente: 'Paciente',
      apoiador: 'Apoiador',
      instituicao: 'Instituição',
      admin: 'Admin',
      public: 'Visitante',
    },
  },
  personas: {
    paciente: {
      title: 'Paciente',
      summary: 'Publique um sonho, acompanhe propostas e converse com seguranca.',
      primaryCta: 'Entrar e conhecer a jornada do paciente',
      tourCta: 'Ver tour guiado do paciente',
      tourStartCta: 'Entrar como paciente e iniciar tour',
    },
    apoiador: {
      title: 'Apoiador',
      summary: 'Encontre um sonho, envie ajuda e acompanhe as conexoes criadas.',
      primaryCta: 'Entrar e conhecer a jornada do apoiador',
      tourCta: 'Ver tour guiado do apoiador',
      tourStartCta: 'Entrar como apoiador e iniciar tour',
    },
    instituicao: {
      title: 'Instituicao',
      summary: 'Acompanhe pacientes, publique sonhos e organize propostas com contexto.',
      primaryCta: 'Entrar e conhecer a jornada da instituicao',
      tourCta: 'Ver tour guiado da instituicao',
      tourStartCta: 'Entrar como instituicao e iniciar tour',
    },
  },
  tours: {
    paciente: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        route: '/paciente/dashboard',
        targetId: 'patient-dashboard-hero',
        title: 'Comece pelo seu painel',
        why: 'Veja tudo o que esta em andamento em um so lugar antes de seguir.',
      },
      {
        id: 'criar-sonho',
        label: 'Criar sonho',
        route: '/paciente/sonhos/criar',
        targetId: 'patient-create-dream-form',
        title: 'Publique o sonho que voce quer compartilhar',
        why: 'Esse e o ponto de partida para receber propostas de ajuda.',
      },
      {
        id: 'propostas',
        label: 'Propostas',
        route: '/paciente/propostas',
        targetId: 'patient-proposals-panel',
        title: 'Acompanhe quem quer ajudar e responda com calma',
        why: 'Aqui voce decide quais conexoes fazem sentido para o seu momento.',
      },
      {
        id: 'chat',
        label: 'Chat',
        route: '/paciente/chat',
        targetId: 'patient-chat-panel',
        title: 'Use o chat para combinar os proximos passos com seguranca',
        why: 'Quando a proposta avanca, a conversa continua por aqui.',
      },
    ],
    apoiador: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        route: '/apoiador/dashboard',
        targetId: 'supporter-dashboard-hero',
        title: 'Veja o painel com sonhos, propostas e conexoes',
        why: 'Ele mostra o que merece sua atencao primeiro.',
      },
      {
        id: 'explorar',
        label: 'Explorar sonhos',
        route: '/apoiador/explorar',
        targetId: 'supporter-explore-panel',
        title: 'Encontre um sonho para apoiar',
        why: 'Aqui voce descobre historias e escolhe onde quer se conectar.',
      },
      {
        id: 'propostas',
        label: 'Propostas',
        route: '/apoiador/propostas',
        targetId: 'supporter-proposals-panel',
        title: 'Acompanhe as propostas que voce enviou',
        why: 'Assim fica facil saber o que avancou e onde retomar o contato.',
      },
      {
        id: 'chat',
        label: 'Chat',
        route: '/apoiador/chat',
        targetId: 'supporter-chat-panel',
        title: 'Continue a conversa quando a conexao acontecer',
        why: 'Quando uma proposta e aceita, o combinado segue por aqui.',
      },
    ],
    instituicao: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        route: '/instituicao/dashboard',
        targetId: 'institution-dashboard-hero',
        title: 'Veja a operacao institucional em um so painel',
        why: 'Esse resumo ajuda a priorizar pacientes, sonhos e propostas.',
      },
      {
        id: 'pacientes',
        label: 'Pacientes',
        route: '/instituicao/pacientes',
        targetId: 'institution-patients-panel',
        title: 'Organize os pacientes que a instituicao acompanha',
        why: 'Aqui voce centraliza os casos antes de publicar novos sonhos.',
      },
      {
        id: 'publicar-sonho',
        label: 'Publicar sonho',
        route: '/instituicao/sonhos/criar',
        targetId: 'institution-create-dream-form',
        title: 'Publique um sonho com o contexto certo',
        why: 'Cada sonho sai com clareza sobre quem esta sendo acompanhado.',
      },
      {
        id: 'propostas',
        label: 'Propostas e chat',
        route: '/instituicao/propostas',
        targetId: 'institution-proposals-panel',
        title: 'Acompanhe propostas e siga para o chat quando a conexao avancar',
        why: 'Assim a instituicao mantem o caso organizado do inicio ao contato.',
      },
    ],
  },
} satisfies SandboxExperienceConfig;

export function isSandboxPersona(value: string | null | undefined): value is SandboxPersona {
  return value === 'paciente' || value === 'apoiador' || value === 'instituicao';
}
