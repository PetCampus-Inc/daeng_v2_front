import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import { OverlayProvider } from 'overlay-kit';
import { vi } from 'vitest';

/** 컴포넌트 테스트용: 재시도 없는 QueryClient와 OverlayProvider로 감싸서 그린다. */
const renderOwnerDaily = (ui: ReactElement): RenderResult => {
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
