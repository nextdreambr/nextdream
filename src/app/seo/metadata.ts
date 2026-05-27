import { DEFAULT_LOCALE, type SupportedLocale } from '../i18n/locale';
import { getLocalizedPath, getRouteKeyFromPath, type PublicRouteKey } from '../i18n/routes';

export type SeoData = {
  title: string;
  description: string;
  robots?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  jsonLd?: Record<string, unknown> | null;
  locale?: SupportedLocale;
};

const SITE_NAME = 'NextDream';
const SITE_URL = 'https://nextdream.ong.br';
const DEFAULT_IMAGE = `${SITE_URL}/og-nextdream.png`;
const LOCALE_ALTERNATE_ORDER: SupportedLocale[] = ['pt-BR', 'en-US', 'es-ES'];

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

const LOCALIZED_SEO: Record<Exclude<PublicRouteKey, 'publicDream'>, Record<SupportedLocale, Omit<SeoData, 'canonicalPath' | 'locale'>>> = {
  home: {
    'pt-BR': {
      title: 'NextDream | Sonhos que encontram apoio humano de verdade',
      description:
        'NextDream conecta pessoas em momentos delicados de saúde, familiares e instituições a apoiadores para realizar sonhos com tempo, presença e cuidado.',
      ogType: 'website',
    },
    'en-US': {
      title: 'NextDream | Dreams that meet real human support',
      description:
        'NextDream connects people in delicate health moments, families, and institutions with supporters who offer time, presence, and care.',
      ogType: 'website',
    },
    'es-ES': {
      title: 'NextDream | Sueños que encuentran apoyo humano real',
      description:
        'NextDream conecta a personas en momentos delicados de salud, familias e instituciones con apoyadores que ofrecen tiempo, presencia y cuidado.',
      ogType: 'website',
    },
  },
  howItWorks: {
    'pt-BR': {
      title: 'Como Funciona | NextDream',
      description:
        'Entenda, passo a passo, como publicar sonhos, receber propostas e viver conexoes humanas com seguranca na NextDream.',
    },
    'en-US': {
      title: 'How It Works | NextDream',
      description:
        'Learn step by step how to publish dreams, receive proposals, and build safe human connections on NextDream.',
    },
    'es-ES': {
      title: 'Cómo Funciona | NextDream',
      description:
        'Entiende paso a paso cómo publicar sueños, recibir propuestas y vivir conexiones humanas con seguridad en NextDream.',
    },
  },
  security: {
    'pt-BR': {
      title: 'Seguranca | NextDream',
      description:
        'Conheca as medidas de seguranca, moderacao e privacidade da NextDream para proteger pacientes, familiares e apoiadores.',
    },
    'en-US': {
      title: 'Safety | NextDream',
      description:
        'Learn about NextDream safety, moderation, and privacy measures for protecting patients, families, and supporters.',
    },
    'es-ES': {
      title: 'Seguridad | NextDream',
      description:
        'Conoce las medidas de seguridad, moderación y privacidad de NextDream para proteger pacientes, familias y apoyadores.',
    },
  },
  faq: {
    'pt-BR': {
      title: 'FAQ | NextDream',
      description:
        'Tire suas duvidas sobre cadastro, propostas, chat, seguranca e funcionamento da plataforma NextDream.',
      jsonLd: FAQ_JSON_LD,
    },
    'en-US': {
      title: 'FAQ | NextDream',
      description: 'Find answers about sign-up, proposals, chat, safety, and how the NextDream platform works.',
    },
    'es-ES': {
      title: 'FAQ | NextDream',
      description: 'Resuelve dudas sobre registro, propuestas, chat, seguridad y funcionamiento de la plataforma NextDream.',
    },
  },
  contact: {
    'pt-BR': {
      title: 'Contato | NextDream',
      description:
        'Fale com a equipe NextDream para tirar duvidas, pedir suporte e enviar sugestoes sobre a plataforma.',
    },
    'en-US': {
      title: 'Contact | NextDream',
      description: 'Contact the NextDream team for questions, support, and suggestions about the platform.',
    },
    'es-ES': {
      title: 'Contacto | NextDream',
      description: 'Habla con el equipo NextDream para dudas, soporte y sugerencias sobre la plataforma.',
    },
  },
  partnerships: {
    'pt-BR': {
      title: 'Parcerias | NextDream',
      description:
        'Veja como instituições, comunidades e redes podem aproximar sonhos de caminhos seguros, com contexto, consentimento e cuidado.',
    },
    'en-US': {
      title: 'Partnerships | NextDream',
      description:
        'See how institutions, communities, and networks can connect dreams to safe paths with context, consent, and care.',
    },
    'es-ES': {
      title: 'Alianzas | NextDream',
      description:
        'Mira cómo instituciones, comunidades y redes pueden acercar sueños a caminos seguros con contexto, consentimiento y cuidado.',
    },
  },
  terms: {
    'pt-BR': {
      title: 'Termos de Uso | NextDream',
      description:
        'Leia os termos de uso da NextDream e entenda as regras de participacao, conduta e responsabilidades na plataforma.',
      robots: 'noindex, nofollow',
    },
    'en-US': {
      title: 'Terms of Use | NextDream',
      description: 'Read the NextDream terms of use and understand participation, conduct, and platform responsibilities.',
      robots: 'noindex, nofollow',
    },
    'es-ES': {
      title: 'Términos de Uso | NextDream',
      description: 'Lee los términos de uso de NextDream y entiende las reglas de participación, conducta y responsabilidades.',
      robots: 'noindex, nofollow',
    },
  },
  privacy: {
    'pt-BR': {
      title: 'Privacidade | NextDream',
      description:
        'Saiba como a NextDream coleta, protege e trata seus dados pessoais com transparência e respeito a LGPD.',
      robots: 'noindex, nofollow',
    },
    'en-US': {
      title: 'Privacy | NextDream',
      description: 'Learn how NextDream collects, protects, and processes personal data with transparency and respect.',
      robots: 'noindex, nofollow',
    },
    'es-ES': {
      title: 'Privacidad | NextDream',
      description: 'Conoce cómo NextDream recopila, protege y trata datos personales con transparencia y respeto.',
      robots: 'noindex, nofollow',
    },
  },
  guidelines: {
    'pt-BR': {
      title: 'Diretrizes da Comunidade | NextDream',
      description:
        'Conheca as diretrizes de convivencia da NextDream para manter uma comunidade acolhedora, segura e respeitosa.',
    },
    'en-US': {
      title: 'Community Guidelines | NextDream',
      description: 'Read NextDream community guidelines for keeping the platform welcoming, safe, and respectful.',
    },
    'es-ES': {
      title: 'Directrices de la Comunidad | NextDream',
      description: 'Conoce las directrices de convivencia de NextDream para una comunidad acogedora, segura y respetuosa.',
    },
  },
  sandbox: {
    'pt-BR': {
      title: 'Sandbox | NextDream',
      description: 'Acesse a demonstracao comercial da NextDream sem dados reais.',
      robots: 'noindex, nofollow',
    },
    'en-US': {
      title: 'Sandbox | NextDream',
      description: 'Open the NextDream commercial demo without real data.',
      robots: 'noindex, nofollow',
    },
    'es-ES': {
      title: 'Sandbox | NextDream',
      description: 'Accede a la demo comercial de NextDream sin datos reales.',
      robots: 'noindex, nofollow',
    },
  },
  login: {
    'pt-BR': {
      title: 'Entrar | NextDream',
      description: 'Acesse sua conta NextDream para acompanhar sonhos, propostas e conversas com seguranca.',
      robots: 'noindex, nofollow',
    },
    'en-US': {
      title: 'Sign In | NextDream',
      description: 'Access your NextDream account to follow dreams, proposals, and conversations safely.',
      robots: 'noindex, nofollow',
    },
    'es-ES': {
      title: 'Entrar | NextDream',
      description: 'Accede a tu cuenta NextDream para acompañar sueños, propuestas y conversaciones con seguridad.',
      robots: 'noindex, nofollow',
    },
  },
  register: {
    'pt-BR': {
      title: 'Criar Conta | NextDream',
      description: 'Crie sua conta na NextDream para publicar sonhos ou apoiar alguem com tempo e presenca.',
      robots: 'noindex, nofollow',
    },
    'en-US': {
      title: 'Create Account | NextDream',
      description: 'Create your NextDream account to publish dreams or support someone with time and presence.',
      robots: 'noindex, nofollow',
    },
    'es-ES': {
      title: 'Crear Cuenta | NextDream',
      description: 'Crea tu cuenta en NextDream para publicar sueños o apoyar a alguien con tiempo y presencia.',
      robots: 'noindex, nofollow',
    },
  },
  profileSelect: {
    'pt-BR': {
      title: 'Selecionar Perfil | NextDream',
      description: 'Escolha como voce deseja participar da NextDream.',
      robots: 'noindex, nofollow',
    },
    'en-US': {
      title: 'Choose Profile | NextDream',
      description: 'Choose how you want to participate in NextDream.',
      robots: 'noindex, nofollow',
    },
    'es-ES': {
      title: 'Seleccionar Perfil | NextDream',
      description: 'Elige cómo quieres participar en NextDream.',
      robots: 'noindex, nofollow',
    },
  },
  forgotPassword: {
    'pt-BR': {
      title: 'Recuperar Senha | NextDream',
      description: 'Recupere o acesso da sua conta NextDream com seguranca.',
      robots: 'noindex, nofollow',
    },
    'en-US': {
      title: 'Recover Password | NextDream',
      description: 'Recover access to your NextDream account safely.',
      robots: 'noindex, nofollow',
    },
    'es-ES': {
      title: 'Recuperar Contraseña | NextDream',
      description: 'Recupera el acceso a tu cuenta NextDream con seguridad.',
      robots: 'noindex, nofollow',
    },
  },
  resetPassword: {
    'pt-BR': {
      title: 'Redefinir Senha | NextDream',
      description: 'Crie uma nova senha para acessar sua conta NextDream com seguranca.',
      robots: 'noindex, nofollow',
    },
    'en-US': {
      title: 'Reset Password | NextDream',
      description: 'Create a new password to access your NextDream account safely.',
      robots: 'noindex, nofollow',
    },
    'es-ES': {
      title: 'Restablecer Contraseña | NextDream',
      description: 'Crea una nueva contraseña para acceder a tu cuenta NextDream con seguridad.',
      robots: 'noindex, nofollow',
    },
  },
  verifyEmail: {
    'pt-BR': {
      title: 'Verificar E-mail | NextDream',
      description: 'Confirme seu e-mail para ativar sua conta NextDream com seguranca.',
      robots: 'noindex, nofollow',
    },
    'en-US': {
      title: 'Verify Email | NextDream',
      description: 'Confirm your email to activate your NextDream account safely.',
      robots: 'noindex, nofollow',
    },
    'es-ES': {
      title: 'Verificar Email | NextDream',
      description: 'Confirma tu email para activar tu cuenta NextDream con seguridad.',
      robots: 'noindex, nofollow',
    },
  },
  acceptAdminInvite: {
    'pt-BR': {
      title: 'Aceitar Convite Admin | NextDream',
      description: 'Aceite um convite administrativo da NextDream.',
      robots: 'noindex, nofollow',
    },
    'en-US': {
      title: 'Accept Admin Invite | NextDream',
      description: 'Accept a NextDream admin invitation.',
      robots: 'noindex, nofollow',
    },
    'es-ES': {
      title: 'Aceptar Invitación Admin | NextDream',
      description: 'Acepta una invitación administrativa de NextDream.',
      robots: 'noindex, nofollow',
    },
  },
  acceptPatientInvite: {
    'pt-BR': {
      title: 'Aceitar Convite Paciente | NextDream',
      description: 'Aceite um convite para acessar seu caso na NextDream.',
      robots: 'noindex, nofollow',
    },
    'en-US': {
      title: 'Accept Patient Invite | NextDream',
      description: 'Accept an invitation to access your case on NextDream.',
      robots: 'noindex, nofollow',
    },
    'es-ES': {
      title: 'Aceptar Invitación de Paciente | NextDream',
      description: 'Acepta una invitación para acceder a tu caso en NextDream.',
      robots: 'noindex, nofollow',
    },
  },
};

const STATIC_SEO: Record<string, SeoData> = {
  '/': {
    title: 'NextDream | Sonhos que encontram apoio humano de verdade',
    description:
      'NextDream conecta pessoas em momentos delicados de saúde, familiares e instituições a apoiadores para realizar sonhos com tempo, presença e cuidado.',
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
      'Veja como instituições, comunidades e redes podem aproximar sonhos de caminhos seguros, com contexto, consentimento e cuidado.',
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

function withCanonicalAndLocale(
  seo: Omit<SeoData, 'canonicalPath' | 'locale'>,
  canonicalPath: string,
  locale: SupportedLocale,
): SeoData {
  return {
    ...seo,
    canonicalPath,
    locale,
  };
}

function absoluteUrl(pathname: string): string {
  const normalized = pathname === '/' ? '' : pathname;
  return `${SITE_URL}${normalized}`;
}

export function getBaseJsonLd(locale: SupportedLocale = DEFAULT_LOCALE): Record<string, unknown> {
  return {
    ...BASE_JSON_LD,
    '@graph': BASE_JSON_LD['@graph'].map((item) => (
      item['@type'] === 'WebSite' ? { ...item, inLanguage: locale } : item
    )),
  };
}

export function getSeoData(pathname: string): SeoData {
  const routeKey = getRouteKeyFromPath(pathname);
  const resolvedLocale = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const { locale, hasLocalePrefix } = awaitlessResolveLocale(resolvedLocale);

  if (
    routeKey &&
    routeKey !== 'admin' &&
    routeKey !== 'authenticated' &&
    routeKey !== 'publicDream' &&
    hasLocalePrefix
  ) {
    return withCanonicalAndLocale(LOCALIZED_SEO[routeKey][locale], getLocalizedPath(pathname, locale), locale);
  }

  if (STATIC_SEO[pathname]) {
    return {
      ...STATIC_SEO[pathname],
      locale: DEFAULT_LOCALE,
    };
  }

  if (routeKey === 'publicDream' || pathname.startsWith('/sonhos/')) {
    const canonicalPath = hasLocalePrefix ? getLocalizedPath(pathname, locale) : pathname;
    return {
      title: locale === 'en-US' ? 'Published Dream | NextDream' : locale === 'es-ES' ? 'Sueño Publicado | NextDream' : 'Sonho Publicado | NextDream',
      description: locale === 'en-US'
        ? 'View this dream and discover how to offer human support on NextDream.'
        : locale === 'es-ES'
          ? 'Mira los detalles de este sueño y descubre cómo ofrecer apoyo humano en NextDream.'
          : 'Veja os detalhes deste sonho e descubra como oferecer apoio humano na NextDream.',
      canonicalPath,
      ogType: 'article',
      robots: 'index, follow',
      locale,
    };
  }

  if (
    pathname.startsWith('/paciente') ||
    pathname.startsWith('/apoiador') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/onboarding')
  ) {
    return {
      title: locale === 'en-US' ? `${SITE_NAME} | Platform Area` : locale === 'es-ES' ? `${SITE_NAME} | Área de la Plataforma` : `${SITE_NAME} | Area da Plataforma`,
      description: locale === 'en-US' ? 'Internal NextDream platform area.' : locale === 'es-ES' ? 'Área interna de la plataforma NextDream.' : 'Area interna da plataforma NextDream.',
      canonicalPath: pathname,
      robots: 'noindex, nofollow',
      ogType: 'website',
      locale,
    };
  }

  return {
    ...DEFAULT_SEO,
    canonicalPath: pathname || '/',
    locale,
  };
}

function awaitlessResolveLocale(pathname: string): { locale: SupportedLocale; hasLocalePrefix: boolean } {
  const firstSegment = pathname.split('/')[1] ?? '';
  if (firstSegment === 'en-us') return { locale: 'en-US', hasLocalePrefix: true };
  if (firstSegment === 'es-es') return { locale: 'es-ES', hasLocalePrefix: true };
  if (firstSegment === 'pt-br') return { locale: 'pt-BR', hasLocalePrefix: true };
  return { locale: DEFAULT_LOCALE, hasLocalePrefix: false };
}

export function getSeoAlternates(pathname: string): Record<SupportedLocale | 'x-default', string> {
  const routeKey = getRouteKeyFromPath(pathname);
  if (!routeKey || routeKey === 'admin' || routeKey === 'authenticated') {
    const canonical = absoluteUrl(pathname);
    return {
      'pt-BR': canonical,
      'en-US': canonical,
      'es-ES': canonical,
      'x-default': canonical,
    };
  }

  const alternates = Object.fromEntries(
    LOCALE_ALTERNATE_ORDER.map((locale) => [locale, absoluteUrl(getLocalizedPath(pathname, locale))]),
  ) as Record<SupportedLocale, string>;

  return {
    ...alternates,
    'x-default': alternates['pt-BR'],
  };
}

export function getSeoConstants() {
  return {
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    defaultImage: DEFAULT_IMAGE,
  };
}
