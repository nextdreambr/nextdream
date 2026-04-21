import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  getBooleanEnv,
  getCorsOrigins,
  getTrustedProxyIps,
  isSandboxEnvironment,
} from './config/env';
import { initApiSentry } from './observability/sentry';
import { SentryExceptionFilter } from './observability/sentry-exception.filter';
import { SentryLogger } from './observability/sentry.logger';
import { raw } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const sandbox = isSandboxEnvironment();
  if (!sandbox) {
    initApiSentry();
  }
  const { AppModule } = await import('./app.module');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.disable('x-powered-by');
  if (getBooleanEnv('TRUST_PROXY', false)) {
    const trustedProxyIps = getTrustedProxyIps();
    if (trustedProxyIps.length === 0) {
      throw new Error(
        'Invalid proxy configuration: TRUST_PROXY=true requires PROXY_TRUSTED_IPS with trusted proxy IPs/CIDRs.',
      );
    }

    app.set('trust proxy', trustedProxyIps);
  }

  app.use(cookieParser());
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );
  if (!sandbox) {
    app.use('/sentry-tunnel', raw({ type: '*/*', limit: '200kb' }));
  }

  app.enableCors({
    origin: getCorsOrigins(),
    credentials: true,
  });
  if (!sandbox) {
    app.useLogger(new SentryLogger());
  }
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  if (!sandbox) {
    app.useGlobalFilters(new SentryExceptionFilter(app.get(HttpAdapterHost)));
  }

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
}

void bootstrap();
