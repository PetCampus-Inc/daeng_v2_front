// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OverlayProvider } from 'overlay-kit';
import { afterEach, expect, test, vi } from 'vitest';

import { OwnerKindergartenNewsComposer } from './OwnerKindergartenNewsWritePage';

const { pickImage } = vi.hoisted(() => ({ pickImage: vi.fn() }));

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
  openConfirmDialog: async () => ({ status: 'unavailable' }),
}));
vi.mock('./OwnerKindergartenNewsWriteSettingsSheet', () => ({
  OwnerKindergartenNewsWriteSettingsSheet: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div role='dialog' /> : null,
}));
vi.mock('@shared/lib/media', () => ({ useImagePicker: () => ({ pickImage }) }));
vi.mock('@widgets/Header', () => {
  const Header = ({ children }: { children: React.ReactNode }) => <header>{children}</header>;
  return { Header: Object.assign(Header, { LeftSection: Header, RightSection: Header, BackButton: () => null }) };
});

afterEach(cleanup);

const renderComposer = () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <OverlayProvider>
        <OwnerKindergartenNewsComposer mode='write' />
      </OverlayProvider>
    </QueryClientProvider>
  );
};

test.each([
  ['이어 쓰기', '저장한 제목', '저장한 본문'],
  ['새로 쓰기', '', ''],
])('%s 선택에 따라 작성 화면을 채운다', async (label, title, body) => {
  renderComposer();
  const dialog = await screen.findByRole('alertdialog');
  await userEvent.click(within(dialog).getByRole('button', { name: label }));

  expect((screen.getByPlaceholderText('제목을 입력하세요.') as HTMLTextAreaElement).value).toBe(title);
  expect((screen.getByPlaceholderText('연결된 보호자들에게 전달할 소식을 작성해 주세요.') as HTMLTextAreaElement).value).toBe(body);
});

test('본문 입력 중 설정 버튼을 누르면 입력 포커스를 해제하고 설정 시트를 연다', async () => {
  renderComposer();
  const draftDialog = await screen.findByRole('alertdialog');
  await userEvent.click(within(draftDialog).getByRole('button', { name: '새로 쓰기' }));

  const body = screen.getByPlaceholderText('연결된 보호자들에게 전달할 소식을 작성해 주세요.');
  body.focus();
  expect(document.activeElement).toBe(body);

  fireEvent.click(screen.getByRole('button', { name: '공지 및 알림 설정' }));

  expect(document.activeElement).not.toBe(body);
  expect(await screen.findByRole('dialog')).toBeTruthy();
});

test('앱에서 첨부한 사진을 WebView에서 표시할 수 있는 썸네일로 보여준다', async () => {
  const uri = 'file:///cache/news.jpg';
  const previewUrl = 'data:image/jpeg;base64,dGh1bWJuYWls';
  pickImage.mockResolvedValueOnce({
    cancelled: false,
    assets: [{ key: '', preSignedUrl: uri, uri, previewUrl, fileSize: 1024 }],
  });
  renderComposer();
  const draftDialog = await screen.findByRole('alertdialog');
  await userEvent.click(within(draftDialog).getByRole('button', { name: '새로 쓰기' }));
  await userEvent.click(screen.getByRole('button', { name: '사진' }));

  expect(pickImage).toHaveBeenCalledWith(expect.objectContaining({ skipUpload: true, includePreview: true }));
  expect((await screen.findByRole('img', { name: '사진' })).getAttribute('src')).toBe(previewUrl);
});
