import { DEFAULT_LOCALE, getLocalePrefix, resolveLocaleFromPath, supportedLocales, type SupportedLocale } from './locale';

export type PublicRouteKey =
  | 'home'
  | 'howItWorks'
  | 'security'
  | 'faq'
  | 'terms'
  | 'privacy'
  | 'guidelines'
  | 'sandbox'
  | 'login'
  | 'register'
  | 'profileSelect'
  | 'forgotPassword'
  | 'resetPassword'
  | 'verifyEmail'
  | 'acceptAdminInvite'
  | 'acceptPatientInvite'
  | 'publicDream'
  | 'contact'
  | 'partnerships';

type PathParts = {
  pathname: string;
  suffix: string;
};

export const publicRouteSlugs: Record<PublicRouteKey, Record<SupportedLocale, string>> = {
  home: {
    'pt-BR': '',
    'en-US': '',
    'es-ES': '',
  },
  howItWorks: {
    'pt-BR': 'como-funciona',
    'en-US': 'how-it-works',
    'es-ES': 'como-funciona',
  },
  security: {
    'pt-BR': 'seguranca',
    'en-US': 'safety',
    'es-ES': 'seguridad',
  },
  faq: {
    'pt-BR': 'faq',
    'en-US': 'faq',
    'es-ES': 'faq',
  },
  terms: {
    'pt-BR': 'termos',
    'en-US': 'terms',
    'es-ES': 'terminos',
  },
  privacy: {
    'pt-BR': 'privacidade',
    'en-US': 'privacy',
    'es-ES': 'privacidad',
  },
  guidelines: {
    'pt-BR': 'diretrizes',
    'en-US': 'guidelines',
    'es-ES': 'directrices',
  },
  sandbox: {
    'pt-BR': 'sandbox',
    'en-US': 'sandbox',
    'es-ES': 'sandbox',
  },
  login: {
    'pt-BR': 'login',
    'en-US': 'login',
    'es-ES': 'iniciar-sesion',
  },
  register: {
    'pt-BR': 'cadastro',
    'en-US': 'sign-up',
    'es-ES': 'registro',
  },
  profileSelect: {
    'pt-BR': 'selecionar-perfil',
    'en-US': 'choose-profile',
    'es-ES': 'seleccionar-perfil',
  },
  forgotPassword: {
    'pt-BR': 'esqueci-senha',
    'en-US': 'forgot-password',
    'es-ES': 'olvide-contrasena',
  },
  resetPassword: {
    'pt-BR': 'redefinir-senha',
    'en-US': 'reset-password',
    'es-ES': 'restablecer-contrasena',
  },
  verifyEmail: {
    'pt-BR': 'verificar-email',
    'en-US': 'verify-email',
    'es-ES': 'verificar-email',
  },
  acceptAdminInvite: {
    'pt-BR': 'aceitar-convite-admin',
    'en-US': 'accept-admin-invite',
    'es-ES': 'aceptar-invitacion-admin',
  },
  acceptPatientInvite: {
    'pt-BR': 'aceitar-convite-paciente',
    'en-US': 'accept-patient-invite',
    'es-ES': 'aceptar-invitacion-paciente',
  },
  publicDream: {
    'pt-BR': 'sonhos',
    'en-US': 'dreams',
    'es-ES': 'suenos',
  },
  contact: {
    'pt-BR': 'contato',
    'en-US': 'contact',
    'es-ES': 'contacto',
  },
  partnerships: {
    'pt-BR': 'parcerias',
    'en-US': 'partnerships',
    'es-ES': 'alianzas',
  },
};

const nonLocalizedPrefixes = ['/admin'] as const;
const authenticatedPrefixes = ['/paciente', '/apoiador', '/instituicao', '/onboarding'] as const;

function splitPath(value: string): PathParts {
  const hashIndex = value.indexOf('#');
  const hash = hashIndex >= 0 ? value.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
  const queryIndex = withoutHash.indexOf('?');
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : '';
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;

  return {
    pathname: normalizePath(pathname),
    suffix: `${query}${hash}`,
  };
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return normalized.length > 1 && normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
}

function isNonLocalizedPath(pathname: string): boolean {
  return nonLocalizedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isAuthenticatedPath(pathname: string): boolean {
  return authenticatedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function joinLocalizedPublicPath(locale: SupportedLocale, slug: string): string {
  const prefix = getLocalePrefix(locale);
  return slug ? `${prefix}/${slug}` : prefix;
}

function matchStaticPublicRoute(pathWithoutLocale: string, sourceLocale: SupportedLocale): PublicRouteKey | null {
  const normalizedSlug = pathWithoutLocale === '/' ? '' : pathWithoutLocale.slice(1);

  return (
    Object.entries(publicRouteSlugs).find(([key, slugs]) => {
      if (key === 'publicDream') return false;
      return slugs[sourceLocale] === normalizedSlug || supportedLocales.some((locale) => slugs[locale] === normalizedSlug);
    })?.[0] as PublicRouteKey | undefined
  ) ?? null;
}

function matchPublicDream(pathWithoutLocale: string, sourceLocale: SupportedLocale): string | null {
  const segments = pathWithoutLocale.split('/').filter(Boolean);
  if (segments.length !== 2) return null;
  const dreamSlug = publicRouteSlugs.publicDream[sourceLocale];
  const matchesAnyDreamSlug = supportedLocales.some((locale) => publicRouteSlugs.publicDream[locale] === segments[0]);
  if (segments[0] !== dreamSlug && !matchesAnyDreamSlug) return null;
  return segments[1] ?? null;
}

export function stripLocalePrefix(pathname: string): string {
  return resolveLocaleFromPath(splitPath(pathname).pathname).pathWithoutLocale;
}

export function getRouteKeyFromPath(pathname: string): PublicRouteKey | 'authenticated' | 'admin' | null {
  const { pathname: sourcePathname } = splitPath(pathname);
  const resolved = resolveLocaleFromPath(sourcePathname);

  if (isNonLocalizedPath(resolved.pathWithoutLocale)) return 'admin';
  if (isAuthenticatedPath(resolved.pathWithoutLocale)) return 'authenticated';
  if (matchPublicDream(resolved.pathWithoutLocale, resolved.locale)) return 'publicDream';
  return matchStaticPublicRoute(resolved.pathWithoutLocale, resolved.locale);
}

export function getLocalizedPath(path: string, targetLocale: SupportedLocale): string {
  const { pathname, suffix } = splitPath(path);
  const resolved = resolveLocaleFromPath(pathname);
  const sourcePath = resolved.pathWithoutLocale;

  if (isNonLocalizedPath(sourcePath)) return `${sourcePath}${suffix}`;

  const dreamId = matchPublicDream(sourcePath, resolved.locale);
  if (dreamId) {
    return `${joinLocalizedPublicPath(targetLocale, publicRouteSlugs.publicDream[targetLocale])}/${dreamId}${suffix}`;
  }

  const staticKey = matchStaticPublicRoute(sourcePath, resolved.locale);
  if (staticKey) {
    return `${joinLocalizedPublicPath(targetLocale, publicRouteSlugs[staticKey][targetLocale])}${suffix}`;
  }

  if (isAuthenticatedPath(sourcePath)) {
    return `${getLocalePrefix(targetLocale)}${sourcePath}${suffix}`;
  }

  if (sourcePath === '/') {
    return `${getLocalePrefix(targetLocale)}${suffix}`;
  }

  return `${getLocalePrefix(targetLocale)}${sourcePath}${suffix}`;
}

export function getDefaultLocalizedPath(path: string): string {
  return getLocalizedPath(path, DEFAULT_LOCALE);
}

export function publicSlug(routeKey: PublicRouteKey, locale: SupportedLocale): string {
  return publicRouteSlugs[routeKey][locale];
}
