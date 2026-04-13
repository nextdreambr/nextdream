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

export function getRateLimitConfig() {
  if (process.env.NODE_ENV === 'test') {
    return {
      ttl: 60_000,
      limit: 10_000,
    };
  }

  const ttl = Number(process.env.THROTTLE_TTL_MS ?? '60000');
  const limit = Number(process.env.THROTTLE_LIMIT ?? '120');

  return {
    ttl: Number.isFinite(ttl) && ttl > 0 ? ttl : 60_000,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 120,
  };
}

export function getBooleanEnv(name: string, defaultValue = false): boolean {
  const raw = process.env[name];
  if (!raw || raw.trim().length === 0) {
    return defaultValue;
  }

  const normalized = raw.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}
