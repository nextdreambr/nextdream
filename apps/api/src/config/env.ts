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
