import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { getCorsOrigins } from './config/env';
import { initApiSentry } from './observability/sentry';
import { SentryExceptionFilter } from './observability/sentry-exception.filter';
import { SentryLogger } from './observability/sentry.logger';

async function bootstrap() {
  initApiSentry();
  const app = await NestFactory.create(AppModule);

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
