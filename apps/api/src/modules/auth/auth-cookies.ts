import type { Response } from 'express';
import { getBooleanEnv } from '../../config/env';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_COOKIE = 'nd_access_token';
const REFRESH_COOKIE = 'nd_refresh_token';

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = process.env.AUTH_COOKIE_DOMAIN?.trim() || undefined;
  const secure = getBooleanEnv('AUTH_COOKIE_SECURE', isProduction);

  return {
    httpOnly: true as const,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    domain,
  };
}

export function setAuthCookies(response: Response, tokens: AuthTokens) {
  const options = getCookieOptions();

  response.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...options,
    maxAge: 60 * 60 * 1000,
  });

  response.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...options,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(response: Response) {
  const options = getCookieOptions();
  response.clearCookie(ACCESS_COOKIE, options);
  response.clearCookie(REFRESH_COOKIE, options);
}

export function getAccessTokenFromCookies(cookies: Record<string, unknown> | undefined) {
  const raw = cookies?.[ACCESS_COOKIE];
  return typeof raw === 'string' && raw.length > 0 ? raw : null;
}
