// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { GuardianDiarySegmentProvider } from '@views/guardian-kindergarten-page/model/guardianDiarySegment';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';

import { GuardianKindergartenAttendingState } from './GuardianKindergartenAttendingState';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/image', () => ({ default: () => null }));

vi.mock('@shared/lib/bridge', () => ({
  useStackNavigation: () => ({ push }),
}));

vi.mock('@views/guardian-album-page/model/useGuardianAlbumLastViewed', () => ({
  useLiveAlbumLastViewedAt: () => 0,
}));

vi.mock('@views/guardian-kindergarten-news-page/model/useGuardianKindergartenNews', () => ({
  useGuardianNewsPreview: () => ({ items: [], isPending: false }),
}));

vi.mock('@views/guardian-kindergarten-page/model/useGuardianCalendarDay', () => ({
  useGuardianCalendarDay: () => ({
    checkInAt: null,
    checkOutAt: null,
    dailyNotice: null,
    isPending: false,
  }),
}));

vi.mock('./GuardianKindergartenDateCalendar', () => ({
  GuardianKindergartenDateCalendar: () => <div>캘린더</div>,
}));

vi.mock('./GuardianKindergartenDayTimeline', () => ({
  GuardianKindergartenDayTimeline: () => <div>타임라인</div>,
}));

vi.mock('./GuardianAlbumPhotoStack', () => ({
  GuardianAlbumPhotoStack: () => <div>앨범</div>,
}));

vi.mock('@views/guardian-kindergarten-news-page', () => ({
  GuardianKindergartenNewsSection: () => <div>새소식</div>,
}));

vi.mock('./GuardianLinkedKindergartenCard', () => ({
  GuardianLinkedKindergartenCard: () => <div>유치원 카드</div>,
}));

const kindergarten = {
  id: 'school-1',
  placeId: 'place-1',
  name: '모모네 유치원',
  address: '서울특별시 강남구 논현로 123길 37',
  imageUrl: '',
};

function renderAttendingState() {
  return render(
    <GuardianDiarySegmentProvider dogName='가나디' schoolId='school-1'>
      <GuardianKindergartenAttendingState
        kindergarten={kindergarten}
        hasDailyNotice
        albumPhotos={['https://example.com/dog.jpg']}
      />
    </GuardianDiarySegmentProvider>
  );
}

describe('GuardianKindergartenAttendingState', () => {
  afterEach(() => {
    cleanup();
    push.mockReset();
  });

  test('연결된 등원 화면은 유치원 탭이 선택된 상태로 열린다', () => {
    renderAttendingState();

    expect(screen.getByRole('tab', { name: '유치원' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: '일기장' }).getAttribute('aria-selected')).toBe('false');
  });

  test('일기장 탭을 누르면 유치원 본문 대신 오늘의 일기 배너가 열린다', async () => {
    const user = userEvent.setup();
    renderAttendingState();

    await user.click(screen.getByRole('tab', { name: '일기장' }));

    expect(screen.getByRole('tab', { name: '일기장' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('button', { name: /오늘 가나디의 일기를 써볼까요/ })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /오늘 가나디의 일기를 써볼까요/ }));

    expect(push).toHaveBeenCalledWith({
      pathname: '/kindergarten/diary/write',
      query: {
        date: formatDateKey(startOfDay(new Date())),
        from: 'diary',
        schoolId: 'school-1',
      },
    });
  });

  test('등원 경과 배지를 그리지 않는다', () => {
    renderAttendingState();

    expect(screen.queryByText(/등원한 지/)).toBeNull();
  });
});
