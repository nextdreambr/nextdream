import * as Sentry from '@sentry/react';

let initialized = false;

function getTracesSampleRate(raw: string | undefined): number {
  const parsed = Number(raw ?? '0.15');
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return 0.15;
  }

  return parsed;
}

function captureConsoleAsSentryLogs() {
  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);
  let reporting = false;

  console.warn = (...args: unknown[]) => {
    originalWarn(...args);
    if (!initialized || reporting) {
      return;
    }
    reporting = true;
    try {
      Sentry.captureMessage(String(args[0] ?? 'console.warn'), {
        level: 'warning',
        extra: { args: args.slice(1) },
      });
    } finally {
      reporting = false;
    }
  };

  console.error = (...args: unknown[]) => {
    originalError(...args);
    if (!initialized || reporting) {
      return;
    }
    reporting = true;
    try {
      const firstArg = args[0];
      if (firstArg instanceof Error) {
        Sentry.captureException(firstArg, {
          extra: { args: args.slice(1) },
        });
      } else {
        Sentry.captureMessage(String(firstArg ?? 'console.error'), {
          level: 'error',
          extra: { args: args.slice(1) },
        });
      }
    } finally {
      reporting = false;
    }
  };
}

export function initFrontendSentry() {
  if (initialized) {
    return;
  }

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    tunnel: import.meta.env.PROD ? '/api/sentry-tunnel' : undefined,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.consoleLoggingIntegration({
        levels: ['warn', 'error'],
      }),
    ],
    enableLogs: true,
    tracesSampleRate: getTracesSampleRate(
      import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE,
    ),
    sendDefaultPii: false,
  });

  initialized = true;

  if (import.meta.env.MODE !== 'test') {
    captureConsoleAsSentryLogs();
  }
}

export function captureFrontendException(
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
