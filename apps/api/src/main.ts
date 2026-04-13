import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getBooleanEnv, getCorsOrigins } from './config/env';
import { initApiSentry } from './observability/sentry';
import { SentryExceptionFilter } from './observability/sentry-exception.filter';
import { SentryLogger } from './observability/sentry.logger';
import { raw } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  initApiSentry();
  const { AppModule } = await import('./app.module');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.disable('x-powered-by');
  if (getBooleanEnv('TRUST_PROXY', false)) {
    app.set('trust proxy', 1);
  }

  app.use(cookieParser());
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );
  app.use('/sentry-tunnel', raw({ type: '*/*', limit: '200kb' }));

  app.enableCors({
    origin: getCorsOrigins(),
    credentials: true,
  });
  app.useLogger(new SentryLogger());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new SentryExceptionFilter(app.get(HttpAdapterHost)));

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
}

void bootstrap();
