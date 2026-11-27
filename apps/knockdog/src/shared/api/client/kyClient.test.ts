import { expect, it, vi } from 'vitest';

vi.mock('../interceptor', () => ({
  insertAuthHeaderInterceptor: () => undefined,
  updateAccessTokenInterceptor: () => undefined,
  tokenRefreshInterceptor: () => undefined,
  transformErrorInterceptor: (error: unknown) => error,
}));

it('초기화할 때 Object.hasOwn이 없어도 첫 API 요청을 보낼 수 있다', async () => {
  const originalHasOwn = Object.getOwnPropertyDescriptor(Object, 'hasOwn')!;
  const fetchResponse = vi.fn<typeof fetch>().mockImplementation(async () => Response.json({ ok: true }));

  vi.resetModules();
  try {
    Reflect.deleteProperty(Object, 'hasOwn');
    const { default: api } = await import('./kyClient');
    const response = await api.get('compatibility-check', { fetch: fetchResponse }).json();

    expect(response).toEqual({ ok: true });
    expect(fetchResponse).toHaveBeenCalledOnce();
  } finally {
    Object.defineProperty(Object, 'hasOwn', originalHasOwn);
    vi.resetModules();
  }
});
