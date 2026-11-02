import { isExpectedSessionError } from './apiErrorReport';

const SENSITIVE_KEY = /authorization|cookie|token|email|phone|tel|address|nickname|profile/i;
const BEARER_PATTERN = /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

interface SentryHint {
  originalException?: unknown;
}

function scrubSensitiveString(value: string) {
  return value.replace(BEARER_PATTERN, 'Bearer [Filtered]').replace(EMAIL_PATTERN, '[Filtered]');
}

function scrubUrl(value: string) {
  try {
    const url = new URL(value);
    for (const key of [...url.searchParams.keys()]) {
      if (SENSITIVE_KEY.test(key)) url.searchParams.set(key, '[Filtered]');
    }
    return url.toString();
  } catch {
    return scrubSensitiveString(value);
  }
}

function scrubUnknown(value: unknown, depth: number): unknown {
  if (depth > 4) return value;
  if (typeof value === 'string') return scrubSensitiveString(value);
  if (Array.isArray(value)) return value.map((item) => scrubUnknown(item, depth + 1));
  if (!value || typeof value !== 'object') return value;

  const record = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(record)) {
    if (SENSITIVE_KEY.test(key)) {
      next[key] = '[Filtered]';
      continue;
    }
    next[key] = key === 'url' && typeof item === 'string' ? scrubUrl(item) : scrubUnknown(item, depth + 1);
  }
  return next;
}

function filterSentryEvent<T>(event: T, hint: SentryHint): T | null {
  if (isExpectedSessionError(hint.originalException)) return null;
  if (!event || typeof event !== 'object') return event;
  return scrubUnknown(event, 0) as T;
}

function filterSentryBreadcrumb<T>(breadcrumb: T): T {
  if (!breadcrumb || typeof breadcrumb !== 'object') return breadcrumb;
  return scrubUnknown(breadcrumb, 0) as T;
}

export { filterSentryBreadcrumb, filterSentryEvent };
