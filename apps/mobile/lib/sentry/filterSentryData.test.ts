import { describe, expect, it } from 'vitest';
import { filterSentryData } from './filterSentryData';

describe('앱 Sentry 민감 정보 필터', () => {
  it('깊은 중첩 데이터와 Breadcrumbs를 정제하고 원본을 유지한다', () => {
    const event = {
      extra: { a: { b: { c: { d: { token: 'secret' } } } } },
      breadcrumbs: [{ data: { headers: { Authorization: 'Bearer secret' }, statusCode: 500 } }],
      message: 'failed for owner@example.com with Bearer abc.def',
    };
    const filtered = filterSentryData(event);
    expect(filtered.extra.a.b.c.d.token).toBe('[Filtered]');
    expect(filtered.breadcrumbs[0].data.headers.Authorization).toBe('[Filtered]');
    expect(filtered.breadcrumbs[0].data.statusCode).toBe(500);
    expect(filtered.message).toBe('failed for [Filtered] with Bearer [Filtered]');
    expect(event.extra.a.b.c.d.token).toBe('secret');
  });

  it('메시지와 URL의 인코딩된 민감 쿼리를 제거하고 일반 쿼리를 유지한다', () => {
    const result = filterSentryData({
      message: 'failed: https://example.test/path?%74oken=secret&tab=pending#email=owner%40example.com',
    });
    expect(result.message).toBe(
      'failed: https://example.test/path?%74oken=[Filtered]&tab=pending#email=[Filtered]'
    );
  });

  it('순환 참조가 있어도 필터를 완료한다', () => {
    const data: { self?: unknown; password: string } = { password: 'secret' };
    data.self = data;
    expect(filterSentryData(data)).toEqual({ password: '[Filtered]', self: '[Circular]' });
  });
});
