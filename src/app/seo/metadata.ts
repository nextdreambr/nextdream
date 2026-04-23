export type SeoData = {
  title: string;
  description: string;
  robots?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  jsonLd?: Record<string, unknown> | null;
};

const SITE_NAME = 'NextDream';
const SITE_URL = 'https://nextdream.ong.br';
const DEFAULT_IMAGE = `${SITE_URL}/og-nextdream.png`;

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'O que é o NextDream?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O NextDream conecta pacientes e idosos a apoiadores voluntários para realizar sonhos com segurança, sem transações financeiras.',
      },
    },
    {
      '@type': 'Question',
      name: 'O NextDream é gratuito?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim. A plataforma é 100% gratuita para pacientes, familiares e apoiadores voluntários.',
      },
    },
    {
      '@type': 'Question',
      name: 'Como funciona a segurança na plataforma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A comunicação acontece no chat interno, com moderação e monitoramento para proteger os usuários.',
      },
    },
    {
      '@type': 'Question',
      name: 'Existe troca de dinheiro entre usuários?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nao. O NextDream nao permite PIX, doacoes ou qualquer transacao financeira entre usuarios.',
      },
    },
  ],
} as const;

const BASE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/og-nextdream.png`,
      email: 'contato@nextdream.ong.br',
    },
    {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'pt-BR',
    },
  ],
} as const;

const STATIC_SEO: Record<string, SeoData> = {
  '/': {
    title: 'NextDream | Sonhos que encontram apoio humano de verdade',
    description:
      'Conectamos pacientes e idosos a apoiadores voluntarios para transformar sonhos em momentos reais, com cuidado, seguranca e presenca.',
    canonicalPath: '/',
    ogType: 'website',
  },
  '/como-funciona': {
    title: 'Como Funciona | NextDream',
    description:
      'Entenda, passo a passo, como publicar sonhos, receber propostas e viver conexoes humanas com seguranca na NextDream.',
    canonicalPath: '/como-funciona',
  },
  '/seguranca': {
    title: 'Seguranca | NextDream',
    description:
      'Conheca as medidas de seguranca, moderacao e privacidade da NextDream para proteger pacientes, familiares e apoiadores.',
    canonicalPath: '/seguranca',
  },
  '/faq': {
    title: 'FAQ | NextDream',
    description:
      'Tire suas duvidas sobre cadastro, propostas, chat, seguranca e funcionamento da plataforma NextDream.',
    canonicalPath: '/faq',
    jsonLd: FAQ_JSON_LD,
  },
  '/contato': {
    title: 'Contato | NextDream',
    description:
      'Fale com a equipe NextDream para tirar duvidas, pedir suporte e enviar sugestoes sobre a plataforma.',
    canonicalPath: '/contato',
  },
  '/parcerias': {
    title: 'Parcerias | NextDream',
    description:
      'Descubra como sua empresa, hospital ou instituicao pode apoiar a realizacao de sonhos com a NextDream.',
    canonicalPath: '/parcerias',
  },
  '/termos': {
    title: 'Termos de Uso | NextDream',
    description:
      'Leia os termos de uso da NextDream e entenda as regras de participacao, conduta e responsabilidades na plataforma.',
    canonicalPath: '/termos',
  },
  '/privacidade': {
    title: 'Privacidade | NextDream',
    description:
      'Saiba como a NextDream coleta, protege e trata seus dados pessoais com transparência e respeito a LGPD.',
    canonicalPath: '/privacidade',
  },
  '/diretrizes': {
    title: 'Diretrizes da Comunidade | NextDream',
    description:
      'Conheca as diretrizes de convivencia da NextDream para manter uma comunidade acolhedora, segura e respeitosa.',
    canonicalPath: '/diretrizes',
  },
  '/login': {
    title: 'Entrar | NextDream',
    description: 'Acesse sua conta NextDream para acompanhar sonhos, propostas e conversas com seguranca.',
    canonicalPath: '/login',
    robots: 'noindex, nofollow',
  },
  '/cadastro': {
    title: 'Criar Conta | NextDream',
    description: 'Crie sua conta na NextDream para publicar sonhos ou apoiar alguem com tempo e presenca.',
    canonicalPath: '/cadastro',
    robots: 'noindex, nofollow',
  },
  '/esqueci-senha': {
    title: 'Recuperar Senha | NextDream',
    description: 'Recupere o acesso da sua conta NextDream com seguranca.',
    canonicalPath: '/esqueci-senha',
    robots: 'noindex, nofollow',
  },
  '/redefinir-senha': {
    title: 'Redefinir Senha | NextDream',
    description: 'Crie uma nova senha para acessar sua conta NextDream com seguranca.',
    canonicalPath: '/redefinir-senha',
    robots: 'noindex, nofollow',
  },
  '/verificar-email': {
    title: 'Verificar E-mail | NextDream',
    description: 'Confirme seu e-mail para ativar sua conta NextDream com seguranca.',
    canonicalPath: '/verificar-email',
    robots: 'noindex, nofollow',
  },
  '/selecionar-perfil': {
    title: 'Selecionar Perfil | NextDream',
    description: 'Escolha como voce deseja participar da NextDream.',
    canonicalPath: '/selecionar-perfil',
    robots: 'noindex, nofollow',
  },
  '/onboarding/paciente': {
    title: 'Onboarding Paciente | NextDream',
    description: 'Conclua seu onboarding para publicar sonhos na NextDream.',
    canonicalPath: '/onboarding/paciente',
    robots: 'noindex, nofollow',
  },
  '/onboarding/apoiador': {
    title: 'Onboarding Apoiador | NextDream',
    description: 'Conclua seu onboarding para apoiar sonhos na NextDream.',
    canonicalPath: '/onboarding/apoiador',
    robots: 'noindex, nofollow',
  },
};

const DEFAULT_SEO: SeoData = {
  title: 'NextDream | Conexoes humanas que realizam sonhos',
  description:
    'A NextDream aproxima quem precisa de apoio e quem quer ajudar, com seguranca, empatia e impacto social real.',
  canonicalPath: '/',
  ogType: 'website',
  robots: 'noindex, nofollow',
};

export function getBaseJsonLd(): Record<string, unknown> {
  return BASE_JSON_LD;
}

export function getSeoData(pathname: string): SeoData {
  if (STATIC_SEO[pathname]) {
    return STATIC_SEO[pathname];
  }

  if (pathname.startsWith('/sonhos/')) {
    return {
      title: 'Sonho Publicado | NextDream',
      description:
        'Veja os detalhes deste sonho e descubra como oferecer apoio humano na NextDream.',
      canonicalPath: pathname,
      ogType: 'article',
      robots: 'index, follow',
    };
  }

  if (
    pathname.startsWith('/paciente') ||
    pathname.startsWith('/apoiador') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/onboarding')
  ) {
    return {
      title: `${SITE_NAME} | Area da Plataforma`,
      description: 'Area interna da plataforma NextDream.',
      canonicalPath: pathname,
      robots: 'noindex, nofollow',
      ogType: 'website',
    };
  }

  return {
    ...DEFAULT_SEO,
    canonicalPath: pathname || '/',
  };
}

export function getSeoConstants() {
  return {
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    defaultImage: DEFAULT_IMAGE,
  };
}
