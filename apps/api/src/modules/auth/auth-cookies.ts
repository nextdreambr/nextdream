import type { Response } from 'express';
import { getBooleanEnv } from '../../config/env';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_COOKIE = 'nd_access_token';
const REFRESH_COOKIE = 'nd_refresh_token';

export function setAuthCookies(response: Response, tokens: AuthTokens) {
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = process.env.AUTH_COOKIE_DOMAIN?.trim() || undefined;
  const secure = getBooleanEnv('AUTH_COOKIE_SECURE', isProduction);

  response.cookie(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    domain,
    maxAge: 60 * 60 * 1000,
  });

  response.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    domain,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function getAccessTokenFromCookies(cookies: Record<string, unknown> | undefined) {
  const raw = cookies?.[ACCESS_COOKIE];
  return typeof raw === 'string' && raw.length > 0 ? raw : null;
}
