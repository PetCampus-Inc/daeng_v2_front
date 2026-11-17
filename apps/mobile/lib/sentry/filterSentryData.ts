const SENSITIVE_KEY = /authorization|cookie|token|password|secret|email|phone|tel|address|nickname|profile|ip_address/i;
const BEARER_PATTERN = /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const QUERY_PATTERN = /([?&#])([^=\s&#]+)=([^\s&#]*)/g;

function scrubString(value: string): string {
  return value
    .replace(QUERY_PATTERN, (match, separator: string, key: string) => {
      try {
        return SENSITIVE_KEY.test(decodeURIComponent(key)) ? `${separator}${key}=[Filtered]` : match;
      } catch {
        return `${separator}${key}=[Filtered]`;
      }
    })
    .replace(BEARER_PATTERN, 'Bearer [Filtered]')
    .replace(EMAIL_PATTERN, '[Filtered]');
}

// 새 객체를 만들어 SDK의 원본 이벤트와 Breadcrumbs를 변경하지 않는다.
function scrubValue(value: unknown, ancestors: Set<object>): unknown {
  if (typeof value === 'string') return scrubString(value);
  if (!value || typeof value !== 'object') return value;
  if (ancestors.has(value)) return '[Circular]';

  ancestors.add(value);
  const result = Array.isArray(value)
    ? value.map((item) => scrubValue(item, ancestors))
    : Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          SENSITIVE_KEY.test(key) ? '[Filtered]' : scrubValue(item, ancestors),
        ])
      );
  ancestors.delete(value);
  return result;
}

function filterSentryData<T>(data: T): T {
  return scrubValue(data, new Set()) as T;
}

export { filterSentryData };
