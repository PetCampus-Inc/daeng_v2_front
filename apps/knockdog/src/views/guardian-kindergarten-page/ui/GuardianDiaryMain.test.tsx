// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const openMonthPicker = vi.fn();
const dateQuery = vi.hoisted(() => vi.fn(() => ({ data: undefined as { remainingGenerations?: number; blockedReason?: string | null; diary?: null } | undefined })));

vi.mock('overlay-kit', () => ({
  overlay: { open: (...args: unknown[]) => openMonthPicker(...args) },
}));

vi.mock('@entities/guardian-diary', () => ({
  useGuardianDiaryDateQuery: () => dateQuery(),
  useGuardianDiaryMonthQuery: () => ({ data: undefined }),
}));

import { GuardianDiaryMain } from './GuardianDiaryMain';

const today = new Date(2026, 5, 17);

const writtenEntry = {
  dateKey: '2026-06-16',
  title: '공원에서 신나게 낙엽 밟기',
  body: '오늘은 공원에서 낙엽을 잔뜩 밟았어!',
  photoCount: 3,
  imageSrc: '/images/diary-sample/leaf.png',
};

describe('일기장 메인', () => {
  beforeEach(() => {
    dateQuery.mockReturnValue({ data: undefined });
    window.sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    openMonthPicker.mockReset();
    window.sessionStorage.clear();
  });

  test('오늘은 작성 배너가 보이고 이후 날짜와 다음 달은 고를 수 없다', () => {
    render(<GuardianDiaryMain dogName='가나디' today={today} />);

    expect(screen.getByRole('button', { name: /오늘 가나디의 일기를 써볼까요/ })).toBeTruthy();
    expect(screen.getByText('수요일')).toBeTruthy();
    expect((screen.getByRole('button', { name: '6월 18일' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: '다음 달' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: '6월 18일' }));
    expect(screen.getByRole('button', { name: /오늘 가나디의 일기를 써볼까요/ })).toBeTruthy();
  });

  test('지난 빈 날은 그날의 작성 배너를 보여 준다', () => {
    render(<GuardianDiaryMain dogName='가나디' today={today} />);

    fireEvent.click(screen.getByRole('button', { name: '6월 15일' }));

    expect(screen.getByRole('button', { name: /이 날 가나디의 일기를 써볼까요/ })).toBeTruthy();
    expect(screen.getByText('월요일')).toBeTruthy();
  });

  test('작성 배너를 누르면 선택한 날짜를 넘긴다', () => {
    const onWrite = vi.fn();
    render(<GuardianDiaryMain dogName='가나디' today={today} onWrite={onWrite} />);

    fireEvent.click(screen.getByRole('button', { name: '6월 15일' }));
    fireEvent.click(screen.getByRole('button', { name: /이 날 가나디의 일기를 써볼까요/ }));

    expect(onWrite).toHaveBeenCalledTimes(1);
    expect(onWrite).toHaveBeenCalledWith(new Date(2026, 5, 15));
  });

  test('일기를 쓴 날은 사진과 본문 미리보기를 보여 준다', () => {
    render(<GuardianDiaryMain dogName='가나디' today={today} entries={[writtenEntry]} />);

    const calendarDay = screen.getByRole('button', { name: '6월 16일' });
    expect(calendarDay.querySelector('img')?.getAttribute('src')).toBe('/images/diary-sample/leaf.png');

    fireEvent.click(calendarDay);

    expect(screen.getByRole('heading', { name: '공원에서 신나게 낙엽 밟기' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '전체 보기' }));
    expect(screen.getByText(/낙엽을 잔뜩 밟았어/)).toBeTruthy();
    const preview = screen.getByRole('heading', { name: '공원에서 신나게 낙엽 밟기' }).closest('article');
    expect(preview?.querySelector('.text-text-primary-inverse')?.textContent).toBe('3');
  });

  test('전체 보기는 선택한 날짜를 넘긴다', () => {
    const onView = vi.fn();
    render(<GuardianDiaryMain dogName='가나디' today={today} entries={[writtenEntry]} onView={onView} />);

    fireEvent.click(screen.getByRole('button', { name: '6월 16일' }));
    fireEvent.click(screen.getByRole('button', { name: '전체 보기' }));

    expect(onView).toHaveBeenCalledTimes(1);
    expect(onView).toHaveBeenCalledWith(new Date(2026, 5, 16));
  });

  test('생성 횟수를 모두 쓰면 작성 배너 대신 안내를 보여 준다', () => {
    render(<GuardianDiaryMain dogName='가나디' today={today} remainingCredits={0} />);

    expect(screen.getByText('일기 3번을 모두 썼어요. 내일 다시 만나요!')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /일기를 써볼까요/ })).toBeNull();
  });

  test('날짜 상태가 생성 한도면 빈 날에 안내 배너를 보여 준다', () => {
    dateQuery.mockReturnValue({ data: { remainingGenerations: 0, blockedReason: 'LIMIT_REACHED', diary: null } });

    render(<GuardianDiaryMain dogName='가나디' today={today} />);

    expect(screen.getByText('일기 3번을 모두 썼어요. 내일 다시 만나요!')).toBeTruthy();
  });

  test('년월을 누르면 날짜 선택 시트를 연다', () => {
    render(<GuardianDiaryMain dogName='가나디' today={today} />);

    fireEvent.click(screen.getByRole('button', { name: '2026년 6월' }));

    expect(openMonthPicker).toHaveBeenCalledTimes(1);
  });
});
