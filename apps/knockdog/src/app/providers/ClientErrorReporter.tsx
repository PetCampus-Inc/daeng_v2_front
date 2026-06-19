'use client';

import { useEffect } from 'react';

type ErrorReport = {
  kind: 'window_error' | 'unhandled_rejection' | 'console_error';
  message: string;
  stack?: string;
  source?: string;
  line?: number;
  column?: number;
  url: string;
  userAgent: string;
  timestamp: string;
};

const ERROR_ENDPOINT = '/api/monitoring/client-error';
const DEDUPE_WINDOW_MS = 60_000;
const recentReports = new Map<string, number>();

interface NormalizedError {
  message: string;
  stack?: string;
}

function normalizeError(value: unknown): NormalizedError {
  if (value instanceof Error) {
    return {
      message: value.message,
      stack: value.stack,
    };
  }

  if (Array.isArray(value)) {
    return {
      message: value
        .map((item) => {
          const normalized = normalizeError(item);
          return normalized.stack || normalized.message;
        })
        .join('\n'),
    };
  }

  if (typeof value === 'string') {
    return {
      message: value,
    };
  }

  try {
    return {
      message: JSON.stringify(value),
    };
  } catch {
    return {
      message: String(value),
    };
  }
}

function createReport(
  kind: ErrorReport['kind'],
  error: NormalizedError,
  extra?: Partial<ErrorReport>
): ErrorReport {
  return {
    kind,
    message: error.message || 'Unknown client error',
    stack: error.stack,
    source: extra?.source,
    line: extra?.line,
    column: extra?.column,
    url: window.location.href,
    userAgent: window.navigator.userAgent,
    timestamp: new Date().toISOString(),
  };
}

function shouldSend(report: ErrorReport) {
  const key = [report.kind, report.message, report.source, report.line, report.column].join(':');
  const now = Date.now();
  const lastSentAt = recentReports.get(key);

  if (lastSentAt && now - lastSentAt < DEDUPE_WINDOW_MS) {
    return false;
  }

  recentReports.set(key, now);
  return true;
}

function sendReport(report: ErrorReport) {
  if (!shouldSend(report)) return;

  const body = JSON.stringify(report);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon(ERROR_ENDPOINT, blob)) return;
  }

  fetch(ERROR_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Error reporting must never create another user-facing error.
  });
}

export function ClientErrorReporter() {
  useEffect(() => {
    const isEnabled =
      process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_CLIENT_ERROR_ALERTS === 'true';

    if (!isEnabled) return;

    const onError = (event: ErrorEvent) => {
      const normalized = normalizeError(event.error || event.message);
      sendReport(
        createReport('window_error', normalized, {
          source: event.filename,
          line: event.lineno,
          column: event.colno,
        })
      );
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      sendReport(createReport('unhandled_rejection', normalizeError(event.reason)));
    };

    const originalConsoleError = console.error;

    console.error = (...args: unknown[]) => {
      originalConsoleError(...args);
      const normalized = normalizeError(args.length === 1 ? args[0] : args);
      sendReport(createReport('console_error', normalized));
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}
