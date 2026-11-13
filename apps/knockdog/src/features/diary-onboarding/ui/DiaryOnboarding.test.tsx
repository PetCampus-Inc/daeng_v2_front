// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@knockdog/ui', async () => {
  const actual = await vi.importActual<typeof import('@knockdog/ui')>('@knockdog/ui');
  const fakeBottomSheet = await import('@views/owner-daily-page/lib/fakeBottomSheet');

  return { ...actual, BottomSheet: fakeBottomSheet };
});

import { GuardianKindergartenHomeSegment } from '@views/guardian-kindergarten-page/ui/GuardianKindergartenHomeSegment';

import { DIARY_ONBOARDING_OPEN_DELAY_MS, DIARY_ONBOARDING_SEEN_KEY } from '../lib/diaryOnboardingSeen';
import { DiaryOnboardingNoteBanner } from './DiaryOnboardingNoteBanner';
import { DiaryOnboardingProvider } from './DiaryOnboardingProvider';

function openAfterDelay() {
  act(() => {
    vi.advanceTimersByTime(DIARY_ONBOARDING_OPEN_DELAY_MS);
  });
}

describe('일기장 온보딩 바텀시트', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    window.localStorage.clear();
  });

  test('알림장 배너를 누르면 0.4초 뒤 시트가 열리고, 닫으면 다시 열리지 않는다', () => {
    render(<DiaryOnboardingNoteBanner dogName='가나디' />);

    fireEvent.click(screen.getByRole('button', { name: /가나디가 일기를 써본대요!/ }));
    expect(screen.queryByRole('button', { name: '첫 일기 남기기' })).toBeNull();

    openAfterDelay();

    expect(screen.getByRole('heading', { name: '가나디의 목소리로 일기를 남겨보세요' }).textContent).toContain(
      '가나디의 목소리로 일기를 남겨보세요'
    );
    expect(screen.getByText(/AI와 함께 가나디 시절의 일기를 만들 수 있어요/).textContent).toContain('가나디 시절');
    expect(screen.getByText('6월 15일 월요일')).toBeTruthy();
    expect(screen.getByText('6월 2일 화요일')).toBeTruthy();
    expect(screen.getByText('6월 5일 금요일')).toBeTruthy();
    expect(document.querySelector('img')?.getAttribute('src')).toBe('/images/diary-sample/leaf.png');
    expect(window.localStorage.getItem(DIARY_ONBOARDING_SEEN_KEY)).toBe('seen');

    fireEvent.click(screen.getByRole('button', { name: '다음에 할게요' }));
    expect(screen.queryByRole('button', { name: '첫 일기 남기기' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /가나디가 일기를 써본대요!/ }));
    openAfterDelay();
    expect(screen.queryByRole('button', { name: '첫 일기 남기기' })).toBeNull();
  });

  test('첫 일기 남기기는 시트를 닫고 작성으로 넘어간다', () => {
    const onWrite = vi.fn();
    render(<DiaryOnboardingNoteBanner dogName='봄' onWrite={onWrite} />);

    fireEvent.click(screen.getByRole('button', { name: /봄이 일기를 써본대요!/ }));
    openAfterDelay();
    fireEvent.click(screen.getByRole('button', { name: '첫 일기 남기기' }));

    expect(screen.queryByRole('button', { name: '첫 일기 남기기' })).toBeNull();
    expect(onWrite).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(DIARY_ONBOARDING_SEEN_KEY)).toBe('seen');
  });

  test('온보딩을 본 뒤에는 배너가 바로 작성으로 넘어간다', () => {
    window.localStorage.setItem(DIARY_ONBOARDING_SEEN_KEY, 'seen');
    const onWrite = vi.fn();
    render(<DiaryOnboardingNoteBanner dogName='가나디' onWrite={onWrite} />);

    fireEvent.click(screen.getByRole('button', { name: /가나디가 일기를 써본대요!/ }));

    expect(onWrite).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: '첫 일기 남기기' })).toBeNull();
  });

  test('바깥 영역을 누르면 시트가 닫힌다', () => {
    render(<DiaryOnboardingNoteBanner dogName='가나디' />);

    fireEvent.click(screen.getByRole('button', { name: /가나디가 일기를 써본대요!/ }));
    openAfterDelay();
    fireEvent.click(document.querySelector('[data-slot="bottom-sheet-overlay"]') as Element);

    expect(screen.queryByRole('button', { name: '첫 일기 남기기' })).toBeNull();
  });

  test('일기장 탭을 처음 누르면 유치원 탭을 유지한 채 시트가 열린다', () => {
    render(
      <DiaryOnboardingProvider dogName='가나디'>
        <GuardianKindergartenHomeSegment />
      </DiaryOnboardingProvider>
    );

    fireEvent.click(screen.getByRole('tab', { name: '일기장' }));

    expect(screen.getByRole('tab', { name: '유치원' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: '일기장' }).getAttribute('aria-selected')).toBe('false');

    openAfterDelay();
    expect(screen.getByRole('button', { name: '첫 일기 남기기' })).toBeTruthy();
  });

  test('일기장 탭 온보딩의 첫 일기 남기기는 작성으로 넘어간다', () => {
    const onStart = vi.fn();
    render(
      <DiaryOnboardingProvider dogName='가나디' onStart={onStart}>
        <GuardianKindergartenHomeSegment />
      </DiaryOnboardingProvider>
    );

    fireEvent.click(screen.getByRole('tab', { name: '일기장' }));
    openAfterDelay();
    fireEvent.click(screen.getByRole('button', { name: '첫 일기 남기기' }));

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: '첫 일기 남기기' })).toBeNull();
  });
});
