'use client';

import { useEffect } from 'react';

type ErrorReport = {
  kind: 'console_error';
  message: string;
  stack?: string;
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

function createReport(error: NormalizedError): ErrorReport {
  return {
    kind: 'console_error',
    message: error.message || 'Unknown client error',
    stack: error.stack,
    url: window.location.href,
    userAgent: window.navigator.userAgent,
    timestamp: new Date().toISOString(),
  };
}

function shouldSend(report: ErrorReport) {
  const key = [report.kind, report.message].join(':');
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

function hasError(value: unknown): boolean {
  if (value instanceof Error) return true;
  return Array.isArray(value) && value.some((item) => item instanceof Error);
}

export function ClientErrorReporter() {
  useEffect(() => {
    const isEnabled =
      process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_CLIENT_ERROR_ALERTS === 'true';

    if (!isEnabled) return;

    const originalConsoleError = console.error;

    console.error = (...args: unknown[]) => {
      originalConsoleError(...args);
      if (hasError(args.length === 1 ? args[0] : args)) return;

      const normalized = normalizeError(args.length === 1 ? args[0] : args);
      sendReport(createReport(normalized));
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return null;
}
