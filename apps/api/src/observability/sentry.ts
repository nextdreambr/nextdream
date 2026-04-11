import * as Sentry from '@sentry/node';

let initialized = false;

function getTracesSampleRate(raw: string | undefined): number {
  const parsed = Number(raw ?? '0.15');
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return 0.15;
  }

  return parsed;
}

export function initApiSentry() {
  if (initialized) {
    return;
  }

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    integrations: [
      Sentry.consoleLoggingIntegration({
        levels: ['warn', 'error'],
      }),
    ],
    enableLogs: true,
    tracesSampleRate: getTracesSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE),
    sendDefaultPii: false,
  });

  initialized = true;
}

export function captureApiException(
  error: unknown,
  context?: Record<string, unknown>,
) {
  if (!initialized) {
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

export function captureApiLog(
  level: 'warning' | 'error',
  message: string,
  context?: Record<string, unknown>,
) {
  if (!initialized) {
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}
