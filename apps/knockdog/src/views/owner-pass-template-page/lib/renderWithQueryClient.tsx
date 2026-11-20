import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';

/** 컴포넌트 테스트용: 재시도 없는 QueryClient로 감싸서 그린다. */
function renderWithQueryClient(ui: ReactElement): RenderResult {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 0, retryOnMount: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

export { renderWithQueryClient };
