import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';

const MAX_ENVELOPE_BYTES = 200 * 1024;
const SENTRY_ENVELOPE_CONTENT_TYPE = 'application/x-sentry-envelope';

export function buildSentryEnvelopeUrlFromDsn(dsn: string): string {
  let parsed: URL;

  try {
    parsed = new URL(dsn);
  } catch {
    throw new BadRequestException('Invalid Sentry DSN for web tunnel.');
  }

  const projectId = parsed.pathname.split('/').filter(Boolean).pop();
  if (!projectId) {
    throw new BadRequestException('Missing Sentry project id in DSN.');
  }

  return `${parsed.origin}/api/${projectId}/envelope/`;
}

@Injectable()
export class SentryTunnelService {
  async forwardEnvelope(
    envelope: Buffer,
    contentType: string | undefined,
  ): Promise<Response> {
    this.assertEnvelopeSize(envelope);

    const webDsn = process.env.SENTRY_DSN_WEB;
    if (!webDsn) {
      throw new ServiceUnavailableException(
        'SENTRY_DSN_WEB is not configured for tunnel forwarding.',
      );
    }

    const endpoint = buildSentryEnvelopeUrlFromDsn(webDsn);

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 8000);

    try {
      return await fetch(endpoint, {
        method: 'POST',
        body: envelope.toString('utf8'),
        headers: {
          'content-type': contentType ?? SENTRY_ENVELOPE_CONTENT_TYPE,
        },
        signal: abortController.signal,
      });
    } catch {
      throw new BadGatewayException('Failed to forward envelope to Sentry.');
    } finally {
      clearTimeout(timeout);
    }
  }

  private assertEnvelopeSize(envelope: Buffer) {
    if (envelope.length === 0) {
      throw new BadRequestException('Sentry envelope payload is empty.');
    }

    if (envelope.length > MAX_ENVELOPE_BYTES) {
      throw new PayloadTooLargeException('Sentry envelope exceeds max payload size.');
    }
  }
}
