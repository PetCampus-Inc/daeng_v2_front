// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OverlayProvider } from 'overlay-kit';
import { afterEach, expect, test, vi } from 'vitest';

import { OwnerKindergartenNewsComposer } from './OwnerKindergartenNewsWritePage';

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('@entities/owner-home', () => ({
  useOwnerHomeQuery: () => ({ data: { school: { schoolId: '1' } }, isPending: false }),
}));
vi.mock('@entities/user', () => ({ useUserStore: () => '1' }));
vi.mock('@entities/school-news', () => ({
  parseSchoolId: (value?: string) => (value ? Number(value) : null),
  useSchoolNewsInfiniteQuery: () => ({ data: { pages: [{ items: [{}] }] } }),
  useSchoolNewsItem: () => ({}),
  useSchoolNewsDraftQuery: () => ({
    data: {
      title: '저장한 제목',
      body: '저장한 본문',
      images: [],
      isAnnouncement: true,
      notifyGuardiansOnUpload: false,
    },
    isLoading: false,
  }),
}));
vi.mock('@shared/lib/bridge', () => ({
  useStackNavigation: () => ({ back: vi.fn(), replace: vi.fn() }),
  useNativeBackHandler: vi.fn(),
}));
vi.mock('@shared/lib/media', () => ({ useImagePicker: () => ({ pickImage: vi.fn() }) }));
vi.mock('@widgets/Header', () => {
  const Header = ({ children }: { children: React.ReactNode }) => <header>{children}</header>;
  return { Header: Object.assign(Header, { LeftSection: Header, RightSection: Header, BackButton: () => null }) };
});

afterEach(cleanup);

test.each([
  ['이어 쓰기', '저장한 제목', '저장한 본문'],
  ['새로 쓰기', '', ''],
])('%s 선택에 따라 작성 화면을 채운다', async (label, title, body) => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <OverlayProvider>
        <OwnerKindergartenNewsComposer mode='write' />
      </OverlayProvider>
    </QueryClientProvider>
  );

  const dialog = await screen.findByRole('alertdialog');
  await userEvent.click(within(dialog).getByRole('button', { name: label }));

  expect((screen.getByPlaceholderText('제목을 입력하세요.') as HTMLTextAreaElement).value).toBe(title);
  expect((screen.getByPlaceholderText('연결된 보호자들에게 전달할 소식을 작성해 주세요.') as HTMLTextAreaElement).value).toBe(body);
});
