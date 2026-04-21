import { afterEach, describe, expect, it } from 'vitest';
import { getAllowedSentryTunnelOrigins, getAppEnvironment } from '../src/config/env';

const originalAppUrl = process.env.APP_URL;
const originalCorsOrigin = process.env.CORS_ORIGIN;
const originalAppEnv = process.env.APP_ENV;

function restoreEnv() {
  if (originalAppUrl === undefined) {
    delete process.env.APP_URL;
  } else {
    process.env.APP_URL = originalAppUrl;
  }

  if (originalCorsOrigin === undefined) {
    delete process.env.CORS_ORIGIN;
  } else {
    process.env.CORS_ORIGIN = originalCorsOrigin;
  }

  if (originalAppEnv === undefined) {
    delete process.env.APP_ENV;
  } else {
    process.env.APP_ENV = originalAppEnv;
  }
}

afterEach(() => {
  restoreEnv();
});

describe('getAllowedSentryTunnelOrigins', () => {
  it('throws when APP_ENV contains an unsupported value', () => {
    process.env.APP_ENV = 'staging';

    expect(() => getAppEnvironment()).toThrow('Invalid APP_ENV value');
  });

  it('returns an empty list when no origin env vars are configured', () => {
    delete process.env.APP_URL;
    delete process.env.CORS_ORIGIN;

    expect(getAllowedSentryTunnelOrigins()).toEqual([]);
  });

  it('throws when origin env vars are provided but none are valid URLs', () => {
    process.env.APP_URL = '*';
    process.env.CORS_ORIGIN = '*';

    expect(() => getAllowedSentryTunnelOrigins()).toThrow(
      'Invalid Sentry tunnel origin configuration',
    );
  });

  it('returns normalized origins when valid origin env vars are configured', () => {
    process.env.APP_URL = 'https://app.nextdream.com/path';
    process.env.CORS_ORIGIN =
      'https://portal.nextdream.com, https://app.nextdream.com/another-path';

    expect(getAllowedSentryTunnelOrigins()).toEqual([
      'https://app.nextdream.com',
      'https://portal.nextdream.com',
    ]);
  });
});
