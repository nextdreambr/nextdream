import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { SentryTunnelService } from './sentry-tunnel.service';

@Controller('sentry-tunnel')
export class SentryTunnelController {
  constructor(private readonly sentryTunnelService: SentryTunnelService) {}

  @Post()
  async proxyEnvelope(@Req() request: Request, @Res() response: Response) {
    const rawBody = request.body;
    const envelope = Buffer.isBuffer(rawBody)
      ? rawBody
      : Buffer.from(typeof rawBody === 'string' ? rawBody : '');

    const upstreamResponse = await this.sentryTunnelService.forwardEnvelope(
      envelope,
      request.header('content-type') ?? undefined,
    );

    const body = await upstreamResponse.text();
    response.status(upstreamResponse.status);

    if (body.length > 0) {
      return response.send(body);
    }

    return response.send();
  }
}
