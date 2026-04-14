import { InternalServerErrorException } from '@nestjs/common';

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (value && value.trim().length > 0) {
    return value;
  }

  if (process.env.NODE_ENV === 'test') {
    return `test-${name.toLowerCase()}`;
  }

  throw new InternalServerErrorException(
    `Missing required environment variable: ${name}`,
  );
}

export function getCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) {
    return ['http://localhost:5173'];
  }

  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function toOrigin(raw: string | undefined): string | null {
  if (!raw || raw.trim().length === 0) {
    return null;
  }

  try {
    return new URL(raw.trim()).origin;
  } catch {
    return null;
  }
}

function getPositiveNumberEnv(raw: string | undefined, fallback: number): number {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function getRateLimitConfig() {
  if (process.env.NODE_ENV === 'test') {
    return {
      ttl: 60_000,
      limit: 10_000,
    };
  }

  return {
    ttl: getPositiveNumberEnv(process.env.THROTTLE_TTL_MS, 60_000),
    limit: getPositiveNumberEnv(process.env.THROTTLE_LIMIT, 120),
  };
}

export function getLoginRateLimitConfig() {
  return {
    ttl: getPositiveNumberEnv(process.env.LOGIN_THROTTLE_TTL_MS, 60_000),
    limit: getPositiveNumberEnv(process.env.LOGIN_THROTTLE_LIMIT, 5),
  };
}

export function getSentryTunnelRateLimitConfig() {
  return {
    ttl: getPositiveNumberEnv(process.env.SENTRY_TUNNEL_THROTTLE_TTL_MS, 60_000),
    limit: getPositiveNumberEnv(process.env.SENTRY_TUNNEL_THROTTLE_LIMIT, 20),
  };
}

export function getAllowedSentryTunnelOrigins(): string[] {
  const origins = new Set<string>();
  const hasAppUrl = Boolean(process.env.APP_URL?.trim());
  const hasCorsOrigin = Boolean(process.env.CORS_ORIGIN?.trim());

  if (!hasAppUrl && !hasCorsOrigin) {
    return [];
  }

  if (hasAppUrl) {
    const appOrigin = toOrigin(process.env.APP_URL);
    if (appOrigin) {
      origins.add(appOrigin);
    }
  }

  if (hasCorsOrigin) {
    for (const origin of getCorsOrigins()) {
      const normalizedOrigin = toOrigin(origin);
      if (normalizedOrigin) {
        origins.add(normalizedOrigin);
      }
    }
  }

  if (origins.size === 0) {
    const providedEnvVars = [
      hasAppUrl ? `APP_URL=${process.env.APP_URL}` : null,
      hasCorsOrigin ? `CORS_ORIGIN=${process.env.CORS_ORIGIN}` : null,
    ]
      .filter((value): value is string => value !== null)
      .join(', ');

    throw new Error(
      `Invalid Sentry tunnel origin configuration: no valid origins were derived from ${providedEnvVars}.`,
    );
  }

  return Array.from(origins);
}

export function getBooleanEnv(name: string, defaultValue = false): boolean {
  const raw = process.env[name];
  if (!raw || raw.trim().length === 0) {
    return defaultValue;
  }

  const normalized = raw.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

export function getTrustedProxyIps(): string[] {
  const raw = process.env.PROXY_TRUSTED_IPS;
  if (!raw) {
    return [];
  }

  return raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}
