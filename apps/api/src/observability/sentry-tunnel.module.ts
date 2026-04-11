import { Module } from '@nestjs/common';
import { SentryTunnelController } from './sentry-tunnel.controller';
import { SentryTunnelService } from './sentry-tunnel.service';

@Module({
  controllers: [SentryTunnelController],
  providers: [SentryTunnelService],
})
export class SentryTunnelModule {}
