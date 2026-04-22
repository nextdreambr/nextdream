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
  see: string;
  action: string;
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
    badge: 'Ambiente de demonstração',
    title: 'Escolha uma jornada para testar o NextDream',
    description:
      'Entre pelo perfil que faz mais sentido para você e percorra os fluxos principais com dados de demonstração.',
    trustTitle: 'Este é um ambiente de demonstração',
    trustItems: [
      'Você pode explorar os fluxos com calma e testar sem risco.',
      'Você pode recomeçar quando quiser.',
      'Nada do que acontece aqui afeta atendimentos reais.',
    ],
  },
  banner: {
    badge: 'Ambiente de demonstração',
    title: 'Você está navegando em uma jornada de apresentação.',
    description: 'Pode testar, rever o tour e recomeçar a demo quando quiser.',
    restartCta: 'Recomeçar demo',
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
      summary: 'Publique um sonho, veja quem respondeu e acompanhe a conversa com segurança.',
      primaryCta: 'Entrar como paciente',
      tourCta: 'Ver tour guiado do paciente',
      tourStartCta: 'Entrar e começar o tour',
    },
    apoiador: {
      title: 'Apoiador',
      summary: 'Explore sonhos, envie propostas e retome conversas sem se perder.',
      primaryCta: 'Entrar como apoiador',
      tourCta: 'Ver tour guiado do apoiador',
      tourStartCta: 'Entrar e começar o tour',
    },
    instituicao: {
      title: 'Instituição',
      summary: 'Acompanhe pacientes, publique sonhos assistidos e organize os próximos passos do caso.',
      primaryCta: 'Entrar como instituição',
      tourCta: 'Ver tour guiado da instituição',
      tourStartCta: 'Entrar e começar o tour',
    },
  },
  tours: {
    paciente: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        route: '/paciente/dashboard',
        targetId: 'patient-dashboard-hero',
        title: 'Veja o painel com seus sonhos, propostas e conversas',
        see: 'Aqui aparecem os destaques da sua jornada, o que já recebeu resposta e o que ainda precisa de atenção.',
        action: 'Use esse painel para entender rapidamente o que avançou antes de abrir cada seção.',
        why: 'Você começa a demo vendo como o paciente acompanha tudo sem depender de menus complexos.',
      },
      {
        id: 'criar-sonho',
        label: 'Criar sonho',
        route: '/paciente/sonhos/criar',
        targetId: 'patient-create-dream-form',
        title: 'Crie um sonho com clareza para receber apoios compatíveis',
        see: 'Você encontra o formulário usado para explicar o desejo, o formato da ajuda e o contexto do pedido.',
        action: 'Experimente preencher como se estivesse publicando um sonho novo para entender o que gera boas propostas.',
        why: 'Quanto mais claro o sonho, mais fácil fica para alguém oferecer presença, companhia ou tempo de um jeito adequado.',
      },
      {
        id: 'propostas',
        label: 'Propostas',
        route: '/paciente/propostas',
        targetId: 'patient-proposals-panel',
        title: 'Veja quem respondeu e avance só com quem fizer sentido',
        see: 'Aqui ficam as propostas recebidas, com contexto suficiente para comparar apoiadores e decidir com calma.',
        action: 'Abra uma proposta, entenda a oferta e aceite apenas quando a ajuda combinar com o momento do paciente.',
        why: 'Esse passo mostra como a plataforma protege a escolha e evita conexões apressadas.',
      },
      {
        id: 'chat',
        label: 'Chat',
        route: '/paciente/chat',
        targetId: 'patient-chat-panel',
        title: 'Combine detalhes com segurança quando a ajuda for confirmada',
        see: 'O chat reúne a conversa que nasce depois da proposta aceita e mantém o vínculo com o sonho correspondente.',
        action: 'Use a conversa para alinhar horário, presença e próximos passos sem sair do contexto do sonho.',
        why: 'É aqui que a conexão vira ação prática, com lembretes visuais do que pode e do que não pode acontecer no sandbox.',
      },
    ],
    apoiador: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        route: '/apoiador/dashboard',
        targetId: 'supporter-dashboard-hero',
        title: 'Veja o painel com sonhos, propostas e conversas',
        see: 'O painel resume o que você já explorou, o que ainda aguarda resposta e onde existem conversas em andamento.',
        action: 'Comece por aqui para identificar oportunidades abertas e retomar contatos que já estão avançando.',
        why: 'Isso deixa clara a jornada do apoiador antes mesmo de abrir a listagem completa.',
      },
      {
        id: 'explorar',
        label: 'Explorar sonhos',
        route: '/apoiador/explorar',
        targetId: 'supporter-explore-panel',
        title: 'Explore os sonhos e escolha onde você quer chegar junto',
        see: 'Você vê a vitrine de sonhos com contexto suficiente para entender quem precisa de ajuda e de que forma.',
        action: 'Filtre, compare e abra os sonhos que mais combinam com o tipo de presença que você pode oferecer.',
        why: 'A demonstração fica menos abstrata quando você entende como a descoberta de histórias acontece na prática.',
      },
      {
        id: 'propostas',
        label: 'Propostas',
        route: '/apoiador/propostas',
        targetId: 'supporter-proposals-panel',
        title: 'Acompanhe as respostas e retome contatos sem se perder',
        see: 'Essa etapa mostra o andamento das propostas enviadas e destaca o que foi aceito, recusado ou ainda está aguardando.',
        action: 'Use essa lista para retomar oportunidades certas sem precisar lembrar manualmente de cada sonho visitado.',
        why: 'É o ponto em que o apoiador percebe como a plataforma organiza continuidade, não só descoberta.',
      },
      {
        id: 'chat',
        label: 'Chat',
        route: '/apoiador/chat',
        targetId: 'supporter-chat-panel',
        title: 'Combine os próximos passos quando a conexão for aceita',
        see: 'Aqui cada conversa já aparece conectada ao sonho, para você não perder o contexto do que foi combinado.',
        action: 'Abra uma conversa ativa e veja como o próximo passo continua amarrado ao sonho escolhido.',
        why: 'Esse fluxo demonstra como a conexão aceita vira combinação prática sem sair do ambiente moderado.',
      },
    ],
    instituicao: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        route: '/instituicao/dashboard',
        targetId: 'institution-dashboard-hero',
        title: 'Veja a operação institucional em um só painel',
        see: 'O painel resume pacientes acompanhados, sonhos ativos, propostas e conversas da operação.',
        action: 'Use esse panorama para entender quais casos pedem atenção primeiro.',
        why: 'Ele mostra como a instituição acompanha vários fluxos sem perder contexto de caso.',
      },
      {
        id: 'pacientes',
        label: 'Pacientes',
        route: '/instituicao/pacientes',
        targetId: 'institution-patients-panel',
        title: 'Organize os pacientes acompanhados e entre no detalhe de cada caso',
        see: 'Aqui ficam os beneficiários acompanhados, com acesso rápido ao contexto e aos sonhos vinculados.',
        action: 'Abra um caso para entender a situação antes de publicar ou responder algo em nome da instituição.',
        why: 'Isso evidencia que a instituição opera sonhos com responsabilidade e contexto, não como pedidos soltos.',
      },
      {
        id: 'publicar-sonho',
        label: 'Publicar sonho',
        route: '/instituicao/sonhos/criar',
        targetId: 'institution-create-dream-form',
        title: 'Publique um sonho com o mesmo cuidado do fluxo do paciente',
        see: 'A instituição usa a mesma estrutura do paciente, mas escolhe para qual beneficiário o sonho será operado.',
        action: 'Preencha o sonho ligando-o ao caso certo para ver como o contexto acompanha a publicação.',
        why: 'A demo deixa explícito que a única diferença aqui é o contexto assistido do paciente acompanhado.',
      },
      {
        id: 'propostas',
        label: 'Propostas e chat',
        route: '/instituicao/propostas',
        targetId: 'institution-proposals-panel',
        title: 'Acompanhe propostas, aceite conexões e siga para o chat do caso',
        see: 'Nesta etapa a instituição vê propostas e conversas mantendo o vínculo com o paciente acompanhado.',
        action: 'Abra uma proposta ou um chat para perceber como o caso continua organizado até o contato com apoiadores.',
        why: 'Esse trecho mostra a visão operacional completa do começo da publicação até a combinação prática.',
      },
    ],
  },
} satisfies SandboxExperienceConfig;

export function isSandboxPersona(value: string | null | undefined): value is SandboxPersona {
  return value === 'paciente' || value === 'apoiador' || value === 'instituicao';
}
