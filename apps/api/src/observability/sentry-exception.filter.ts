import {
  ArgumentsHost,
  Catch,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { BaseExceptionFilter } from '@nestjs/core';
import { captureApiException } from './sentry';

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  constructor(adapterHost: HttpAdapterHost) {
    super(adapterHost.httpAdapter);
  }

  override catch(exception: unknown, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest();
    captureApiException(exception, {
      method: request?.method,
      url: request?.url,
    });

    super.catch(exception, host);
  }
}
