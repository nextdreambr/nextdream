import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { buildSentryEnvelopeUrlFromDsn } from '../src/observability/sentry-tunnel.service';

describe('buildSentryEnvelopeUrlFromDsn', () => {
  it('builds Sentry envelope endpoint from DSN', () => {
    const dsn =
      'https://abc123@o4511027900776448.ingest.us.sentry.io/4511198688051200';

    const endpoint = buildSentryEnvelopeUrlFromDsn(dsn);

    expect(endpoint).toBe(
      'https://o4511027900776448.ingest.us.sentry.io/api/4511198688051200/envelope/',
    );
  });

  it('throws on invalid DSN', () => {
    expect(() => buildSentryEnvelopeUrlFromDsn('invalid-dsn')).toThrow(
      BadRequestException,
    );
  });

  it('throws when DSN has no project id', () => {
    expect(() =>
      buildSentryEnvelopeUrlFromDsn(
        'https://abc123@o4511027900776448.ingest.us.sentry.io/',
      ),
    ).toThrow(BadRequestException);
  });
});
