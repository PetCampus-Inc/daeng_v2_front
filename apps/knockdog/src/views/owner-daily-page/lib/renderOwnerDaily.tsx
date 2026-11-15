import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import { OverlayProvider } from 'overlay-kit';
import { vi } from 'vitest';

vi.mock('@entities/owner-member/api/ownerMember', async (importOriginal) => {
  const original = await importOriginal<typeof import('@entities/owner-member/api/ownerMember')>();
  const { fakeOwnerMembersApi } = await import('./ownerDailyFakeServer');
  return { ...original, ...fakeOwnerMembersApi };
});

/**
 * 컴포넌트 테스트용: 재시도 없는 QueryClient와 OverlayProvider로 감싸서 그린다.
 * 그리기 전에 주소를 `url`(기본 `/owner/daily`)로 되돌려, 앞선 테스트의 날짜·탭·필터가 남지 않게 한다.
 */
const renderOwnerDaily = (ui: ReactElement, { url = '/owner/daily' }: { url?: string } = {}): RenderResult => {
  window.history.replaceState(null, '', url);
  // jsdom에는 요소의 scrollTo와 ResizeObserver가 없어서 비워 둔다.
  Element.prototype.scrollTo = vi.fn();
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 0, retryOnMount: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <OverlayProvider>{ui}</OverlayProvider>
    </QueryClientProvider>
  );
};

export { renderOwnerDaily };
