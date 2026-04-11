import { ConsoleLogger } from '@nestjs/common';
import { captureApiLog } from './sentry';

export class SentryLogger extends ConsoleLogger {
  constructor(context = 'NextDreamApi') {
    super(context);
  }

  override warn(message: unknown, ...optionalParams: unknown[]) {
    super.warn(message, ...optionalParams);
    captureApiLog('warning', this.toLogMessage(message), {
      optionalParams,
    });
  }

  override error(message: unknown, ...optionalParams: unknown[]) {
    super.error(message, ...optionalParams);
    captureApiLog('error', this.toLogMessage(message), {
      optionalParams,
    });
  }

  private toLogMessage(message: unknown) {
    if (message instanceof Error) {
      return message.message;
    }

    return typeof message === 'string' ? message : JSON.stringify(message);
  }
}
