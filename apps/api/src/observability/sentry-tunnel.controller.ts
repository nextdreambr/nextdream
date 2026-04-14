import {
  Controller,
  ForbiddenException,
  Inject,
  Post,
  Req,
  Res,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { getAllowedSentryTunnelOrigins, getSentryTunnelRateLimitConfig } from '../config/env';
import { SentryTunnelService } from './sentry-tunnel.service';

const SENTRY_ENVELOPE_CONTENT_TYPE = 'application/x-sentry-envelope';
const sentryTunnelThrottle = {
  default: {
    limit: () => getSentryTunnelRateLimitConfig().limit,
    ttl: () => getSentryTunnelRateLimitConfig().ttl,
  },
};

@Controller('sentry-tunnel')
export class SentryTunnelController {
  constructor(
    @Inject(SentryTunnelService)
    private readonly sentryTunnelService: SentryTunnelService,
  ) {}

  @Post()
  @Throttle(sentryTunnelThrottle)
  async proxyEnvelope(@Req() request: Request, @Res() response: Response) {
    const contentType = request.header('content-type') ?? undefined;
    this.assertAllowedOrigin(request.header('origin') ?? undefined);
    this.assertContentType(contentType);

    const rawBody = request.body;
    const envelope = Buffer.isBuffer(rawBody)
      ? rawBody
      : Buffer.from(typeof rawBody === 'string' ? rawBody : '');

    const upstreamResponse = await this.sentryTunnelService.forwardEnvelope(
      envelope,
      contentType,
    );

    const body = await upstreamResponse.text();
    response.status(upstreamResponse.status);

    if (body.length > 0) {
      return response.send(body);
    }

    return response.send();
  }

  private assertAllowedOrigin(originHeader: string | undefined) {
    const allowedOrigins = getAllowedSentryTunnelOrigins();

    if (!originHeader) {
      if (allowedOrigins.length > 0) {
        throw new ForbiddenException('Untrusted origin');
      }
      return;
    }

    let requestOrigin: string;
    try {
      requestOrigin = new URL(originHeader).origin;
    } catch {
      throw new ForbiddenException('Untrusted origin');
    }

    if (allowedOrigins.length > 0 && !allowedOrigins.includes(requestOrigin)) {
      throw new ForbiddenException('Untrusted origin');
    }
  }

  private assertContentType(contentType: string | undefined) {
    const normalizedContentType = contentType?.split(';', 1)[0]?.trim().toLowerCase();
    if (normalizedContentType !== SENTRY_ENVELOPE_CONTENT_TYPE) {
      throw new UnsupportedMediaTypeException('Unsupported Sentry tunnel content type');
    }
  }
}
