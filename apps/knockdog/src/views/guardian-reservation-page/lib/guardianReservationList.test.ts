import { describe, expect, it } from 'vitest';

import {
  LIST_STATUS,
  PAST_RANGE,
  collectReservations,
  createListSeeds,
  formatListWhen,
  formatMonthHeading,
  groupUpcoming,
  listPast,
  listUpcoming,
  pastListStatus,
  toVisitKey,
  visibleReservations,
  type ReservationSource,
} from './guardianReservationList';

const now = new Date(2026, 10, 9, 18, 0);
const nowKey = toVisitKey(now);

function source(partial: Partial<ReservationSource> & Pick<ReservationSource, 'id' | 'startsAt'>): ReservationSource {
  return {
    dogId: 'chapchu',
    status: LIST_STATUS.confirmed,
    isCancelled: false,
    note: '',
    ...partial,
  };
}

describe('예약 목록 문구', () => {
  it('날짜와 월 제목을 목록 문구로 바꾼다', () => {
    expect(formatListWhen('2026-11-03T09:00')).toBe('11월 3일 (화) 오전 9:00');
    expect(formatListWhen('2026-11-03T17:00')).toBe('11월 3일 (화) 오후 5:00');
    expect(formatMonthHeading('2026-11-03T09:00')).toBe('2026년 11월');
  });
});

describe('다가오는 예약', () => {
  it('취소한 예약은 빼고 같은 날은 확정된 예약을 남긴다', () => {
    const items = visibleReservations([
      source({ id: 'upcoming-chapchu', startsAt: '2026-11-11T00:00' }),
      source({ id: 'book-chapchu-2026-11-11-1020', startsAt: '2026-11-11T17:00' }),
      source({ id: 'cancelled', startsAt: '2026-11-12T10:00', isCancelled: true }),
    ]);

    expect(items.map((item) => item.id)).toEqual(['book-chapchu-2026-11-11-1020']);
  });

  it('가까운 날짜순으로 월별 묶는다', () => {
    const upcoming = listUpcoming(
      [
        source({ id: 'later', startsAt: '2026-12-14T09:00' }),
        source({ id: 'soon', startsAt: '2026-11-15T09:00' }),
        source({ id: 'next', startsAt: '2026-11-20T09:00' }),
      ],
      nowKey
    );
    const groups = groupUpcoming(upcoming);

    expect(groups.map((group) => group.heading)).toEqual(['2026년 11월', '2026년 12월']);
    expect(groups[0]?.items.map((item) => item.id)).toEqual(['soon', 'next']);
  });
});

describe('지난 예약', () => {
  const seeds = createListSeeds('chapchu', now);

  it('1개월은 최근 건만, 3개월은 그 이전 등원까지 포함한다', () => {
    const month = listPast(seeds, now, nowKey, 'one');
    const quarter = listPast(seeds, now, nowKey, 'three');

    expect(month.map((item) => item.id)).toEqual(['chapchu-past-near', 'chapchu-past-week', 'chapchu-past-absent']);
    expect(quarter.map((item) => item.id)).toContain('chapchu-past-older');
    expect(quarter.map((item) => item.id)).not.toContain('chapchu-past-old');
  });

  it('등원 처리가 없으면 결석이다', () => {
    const absent = seeds.find((item) => item.id === 'chapchu-past-absent');
    const attended = seeds.find((item) => item.id === 'chapchu-past-near');

    expect(absent ? pastListStatus(absent) : '').toBe(LIST_STATUS.absent);
    expect(attended ? pastListStatus(attended) : '').toBe(LIST_STATUS.attended);
    expect(PAST_RANGE.six).toBe(6);
  });

  it('취소한 예약은 목록에서 빠지고 요청도 지운다', () => {
    const visit = {
      id: 'book-1',
      dogId: 'chapchu',
      startsAt: toVisitKey(new Date(2026, 10, 12, 9, 0)),
      note: '픽업',
      isCancelled: false,
    };
    const open = collectReservations('chapchu', now, null, [visit], []);
    const cancelled = collectReservations('chapchu', now, null, [visit], ['book-1']);
    const repeated = collectReservations('chapchu', now, null, [{ ...visit, isCancelled: true }], ['book-1']);

    expect(open.find((item) => item.id === 'book-1')?.note).toBe('픽업');
    expect(cancelled.some((item) => item.id === 'book-1')).toBe(false);
    expect(repeated.some((item) => item.id === 'book-1')).toBe(false);
  });
});
