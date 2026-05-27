import { type SupportedLocale } from './locale';

export const dictionaries = {
  'pt-BR': {
    language: {
      label: 'Idioma',
      current: 'Português',
      portuguese: 'Português',
      english: 'English',
      spanish: 'Español',
    },
    dreamLanguageAssist: {
      language: 'Idioma',
      original: 'Original',
      viewing: 'Visualizando',
      originalStoryNote: 'A história original fica preservada por autenticidade.',
      originallyWrittenIn: 'Escrito originalmente em {language}',
      translateTo: 'Traduzir para {language}',
      viewOriginal: 'Ver original',
      translating: 'Traduzindo...',
      unavailable: 'A tradução não está disponível agora. O original continua visível.',
      portuguese: 'português',
      english: 'inglês',
      spanish: 'espanhol',
    },
    public: {
      nav: {
        howItWorks: 'Como funciona',
        partnerships: 'Parcerias',
        security: 'Segurança',
        faq: 'FAQ',
        contact: 'Fale conosco',
        enter: 'Entrar',
        createAccount: 'Criar conta',
        openSandbox: 'Conhecer a plataforma',
        openMenu: 'Abrir menu',
        closeMenu: 'Fechar menu',
      },
      footer: {
        headline: 'Presença, tempo e cuidado também realizam sonhos.',
        description:
          'NextDream conecta pessoas em momentos delicados de saúde a apoiadores dispostos a oferecer presença, tempo, companhia e habilidades com cuidado.',
        paths: 'Caminhos',
        contact: 'Contato',
        terms: 'Termos de Uso',
        privacy: 'Privacidade',
        guidelines: 'Diretrizes',
        copyright: 'NextDream. Construído para conexões humanas com cuidado.',
        promise: 'Presença, privacidade e consentimento primeiro.',
      },
    },
    roles: {
      patient: 'Paciente',
      supporter: 'Apoiador',
      institution: 'Instituição',
    },
    appShell: {
      careArea: 'Área de cuidado',
      supporterArea: 'Área do Apoiador',
      institutionArea: 'Área da Instituição',
      dashboard: 'Dashboard',
      home: 'Início',
      dreams: 'Sonhos',
      myDreams: 'Meus Sonhos',
      exploreDreams: 'Explorar Sonhos',
      proposals: 'Propostas',
      myProposals: 'Minhas Propostas',
      conversations: 'Conversas',
      chat: 'Chat',
      notifications: 'Notificações',
      notices: 'Avisos',
      myProfile: 'Meu Perfil',
      profile: 'Perfil',
      patients: 'Pacientes',
      shareDream: 'Compartilhar um sonho',
      publishDream: 'Publicar um sonho',
      logout: 'Sair',
      openNotifications: 'Abrir notificações',
      openMenu: 'Abrir menu',
      closeMenu: 'Fechar menu',
    },
    sandbox: {
      financialModeration:
        'Mensagens com PIX, dinheiro ou doações são bloqueadas no sandbox. Reformule oferecendo tempo, presença ou companhia.',
    },
    labels: {
      dreamStatus: {
        draft: 'Rascunho',
        published: 'Publicado',
        inConversation: 'Em conversa',
        fulfilling: 'Realizando',
        completed: 'Concluído',
        paused: 'Pausado',
        canceled: 'Cancelado',
      },
      proposalStatus: {
        sent: 'Enviada',
        inReview: 'Em análise',
        accepted: 'Aceita',
        rejected: 'Recusada',
        expired: 'Expirada',
      },
      urgency: {
        low: 'Janela flexível',
        medium: 'Janela moderada',
        high: 'Janela mais próxima',
      },
      reportStatus: {
        new: 'Nova',
        inReview: 'Em análise',
        actionTaken: 'Ação tomada',
        resolved: 'Resolvida',
      },
    },
  },
  'en-US': {
    language: {
      label: 'Language',
      current: 'English',
      portuguese: 'Português',
      english: 'English',
      spanish: 'Español',
    },
    dreamLanguageAssist: {
      language: 'Language',
      original: 'Original',
      viewing: 'Viewing',
      originalStoryNote: 'The original story stays preserved for authenticity.',
      originallyWrittenIn: 'Originally written in {language}',
      translateTo: 'Translate to {language}',
      viewOriginal: 'View original',
      translating: 'Translating...',
      unavailable: 'Translation is unavailable right now. The original stays visible.',
      portuguese: 'Portuguese',
      english: 'English',
      spanish: 'Spanish',
    },
    public: {
      nav: {
        howItWorks: 'How it works',
        partnerships: 'Partnerships',
        security: 'Safety',
        faq: 'FAQ',
        contact: 'Contact',
        enter: 'Sign in',
        createAccount: 'Create account',
        openSandbox: 'Explore the platform',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
      },
      footer: {
        headline: 'Presence, time, and care can also fulfill dreams.',
        description:
          'NextDream connects people in delicate health moments with supporters willing to offer presence, time, companionship, and skills with care.',
        paths: 'Paths',
        contact: 'Contact',
        terms: 'Terms of Use',
        privacy: 'Privacy',
        guidelines: 'Guidelines',
        copyright: 'NextDream. Built for human connections with care.',
        promise: 'Presence, privacy, and consent first.',
      },
    },
    roles: {
      patient: 'Patient',
      supporter: 'Supporter',
      institution: 'Institution',
    },
    appShell: {
      careArea: 'Care area',
      supporterArea: 'Supporter area',
      institutionArea: 'Institution area',
      dashboard: 'Dashboard',
      home: 'Home',
      dreams: 'Dreams',
      myDreams: 'My Dreams',
      exploreDreams: 'Explore Dreams',
      proposals: 'Proposals',
      myProposals: 'My Proposals',
      conversations: 'Conversations',
      chat: 'Chat',
      notifications: 'Notifications',
      notices: 'Alerts',
      myProfile: 'My Profile',
      profile: 'Profile',
      patients: 'Patients',
      shareDream: 'Share a dream',
      publishDream: 'Publish a dream',
      logout: 'Sign out',
      openNotifications: 'Open notifications',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
    },
    sandbox: {
      financialModeration:
        'Messages about PIX, money, or donations are blocked in the sandbox. Rephrase by offering time, presence, or companionship.',
    },
    labels: {
      dreamStatus: {
        draft: 'Draft',
        published: 'Published',
        inConversation: 'In conversation',
        fulfilling: 'In progress',
        completed: 'Completed',
        paused: 'Paused',
        canceled: 'Canceled',
      },
      proposalStatus: {
        sent: 'Sent',
        inReview: 'In review',
        accepted: 'Accepted',
        rejected: 'Rejected',
        expired: 'Expired',
      },
      urgency: {
        low: 'Flexible window',
        medium: 'Moderate window',
        high: 'Sooner window',
      },
      reportStatus: {
        new: 'New',
        inReview: 'In review',
        actionTaken: 'Action taken',
        resolved: 'Resolved',
      },
    },
  },
  'es-ES': {
    language: {
      label: 'Idioma',
      current: 'Español',
      portuguese: 'Português',
      english: 'English',
      spanish: 'Español',
    },
    dreamLanguageAssist: {
      language: 'Idioma',
      original: 'Original',
      viewing: 'Visualizando',
      originalStoryNote: 'La historia original se preserva por autenticidad.',
      originallyWrittenIn: 'Escrito originalmente en {language}',
      translateTo: 'Traducir a {language}',
      viewOriginal: 'Ver original',
      translating: 'Traduciendo...',
      unavailable: 'La traducción no está disponible ahora. El original sigue visible.',
      portuguese: 'portugués',
      english: 'inglés',
      spanish: 'español',
    },
    public: {
      nav: {
        howItWorks: 'Cómo funciona',
        partnerships: 'Alianzas',
        security: 'Seguridad',
        faq: 'FAQ',
        contact: 'Contacto',
        enter: 'Entrar',
        createAccount: 'Crear cuenta',
        openSandbox: 'Conocer la plataforma',
        openMenu: 'Abrir menú',
        closeMenu: 'Cerrar menú',
      },
      footer: {
        headline: 'La presencia, el tiempo y el cuidado también cumplen sueños.',
        description:
          'NextDream conecta a personas en momentos delicados de salud con apoyadores dispuestos a ofrecer presencia, tiempo, compañía y habilidades con cuidado.',
        paths: 'Caminos',
        contact: 'Contacto',
        terms: 'Términos de Uso',
        privacy: 'Privacidad',
        guidelines: 'Directrices',
        copyright: 'NextDream. Construido para conexiones humanas con cuidado.',
        promise: 'Presencia, privacidad y consentimiento primero.',
      },
    },
    roles: {
      patient: 'Paciente',
      supporter: 'Apoyador',
      institution: 'Institución',
    },
    appShell: {
      careArea: 'Área de cuidado',
      supporterArea: 'Área del Apoyador',
      institutionArea: 'Área de la Institución',
      dashboard: 'Panel',
      home: 'Inicio',
      dreams: 'Sueños',
      myDreams: 'Mis Sueños',
      exploreDreams: 'Explorar Sueños',
      proposals: 'Propuestas',
      myProposals: 'Mis Propuestas',
      conversations: 'Conversaciones',
      chat: 'Chat',
      notifications: 'Notificaciones',
      notices: 'Avisos',
      myProfile: 'Mi Perfil',
      profile: 'Perfil',
      patients: 'Pacientes',
      shareDream: 'Compartir un sueño',
      publishDream: 'Publicar un sueño',
      logout: 'Salir',
      openNotifications: 'Abrir notificaciones',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
    },
    sandbox: {
      financialModeration:
        'En el sandbox, los mensajes con PIX, dinero o donaciones son bloqueados. Reformula ofreciendo tiempo, presencia o compania.',
    },
    labels: {
      dreamStatus: {
        draft: 'Borrador',
        published: 'Publicado',
        inConversation: 'En conversación',
        fulfilling: 'En realización',
        completed: 'Concluido',
        paused: 'Pausado',
        canceled: 'Cancelado',
      },
      proposalStatus: {
        sent: 'Enviada',
        inReview: 'En análisis',
        accepted: 'Aceptada',
        rejected: 'Rechazada',
        expired: 'Expirada',
      },
      urgency: {
        low: 'Ventana flexible',
        medium: 'Ventana moderada',
        high: 'Ventana más cercana',
      },
      reportStatus: {
        new: 'Nueva',
        inReview: 'En análisis',
        actionTaken: 'Acción tomada',
        resolved: 'Resuelta',
      },
    },
  },
} as const;

type Dictionary = (typeof dictionaries)['pt-BR'];
export type TranslationKey = LeafKeys<Dictionary>;

type LeafKeys<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends string
    ? `${Prefix}${Extract<K, string>}`
    : T[K] extends Record<string, unknown>
      ? LeafKeys<T[K], `${Prefix}${Extract<K, string>}.`>
      : never;
}[keyof T];

type TranslationValues = Record<string, string | number>;

export function translate(locale: SupportedLocale, key: TranslationKey, values: TranslationValues = {}): string {
  const dictionary = dictionaries[locale] as Record<string, unknown>;
  const fallback = dictionaries['pt-BR'] as Record<string, unknown>;
  const value = resolveNestedValue(dictionary, key) ?? resolveNestedValue(fallback, key);
  const template = typeof value === 'string' ? value : key;
  return Object.entries(values).reduce(
    (result, [name, replacement]) => result.replaceAll(`{${name}}`, String(replacement)),
    template,
  );
}

function resolveNestedValue(source: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[segment];
  }, source);
}
