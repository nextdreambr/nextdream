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
        text: 'O NextDream conecta pessoas vivendo momentos delicados de saúde, familiares e apoiadores dispostos a oferecer presença, tempo, companhia e habilidades com cuidado.',
      },
    },
    {
      '@type': 'Question',
      name: 'Que tipo de apoio existe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O apoio esperado é presença, tempo, companhia ou habilidade, respeitando consentimento, privacidade e limites de cada pessoa.',
      },
    },
    {
      '@type': 'Question',
      name: 'Como funciona a segurança na plataforma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A conversa direta acontece depois do aceite. Dados de contato ficam protegidos e situações inseguras podem ser reportadas para análise da equipe.',
      },
    },
    {
      '@type': 'Question',
      name: 'Meu sonho será público?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Não automaticamente. A história deve respeitar consentimento, privacidade e o que a pessoa se sentir confortável em compartilhar.',
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
      'NextDream conecta pessoas em momentos delicados de saude, familiares e instituicoes a apoiadores para realizar sonhos com tempo, presenca e cuidado.',
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
      'Veja como instituicoes, comunidades e redes podem aproximar sonhos de caminhos seguros, com contexto, consentimento e cuidado.',
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
