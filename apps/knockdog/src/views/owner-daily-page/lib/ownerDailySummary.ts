import type { OwnerDailyDayKind } from '@views/owner-daily-page/lib/ownerDailyDate';
import type { AttendanceCheckinoutSummary } from '@entities/owner-attendance-checkinout';

interface OwnerDailySummaryStat {
  label: string;
  count: number;
}

interface OwnerDailySummaryView {
  bannerCount: number;
  bannerTotal: number | null;
  bannerDescription: string;
  /** 미래 날짜는 집계가 없다. */
  stats: OwnerDailySummaryStat[];
}

/**
 * 등원 현황 배너 문구와 집계를 날짜 종류에 맞게 만든다.
 * - 오늘·미래: 등원 예정 원생 수 / 전체 등록 원생 수.
 * - 지난 날짜: 등원 완료 원생 수 / 하루 정원. 하루 정원이 없으면 분모를 뺀다.
 * - 집계: 오늘은 등원 완료·결석 확정·하원 완료, 지난 날짜는 등원 완료·결석 확정·하원 미처리, 미래는 없음.
 */
const toOwnerDailySummaryView = (
  summary: AttendanceCheckinoutSummary,
  dayKind: OwnerDailyDayKind,
  totalMemberCount: number | undefined
): OwnerDailySummaryView => {
  const isPast = dayKind === 'past';
  const count = isPast ? summary.checkedInCount : summary.reservedCount;
  const denominator = isPast ? summary.dailyCapacity : totalMemberCount;
  const banner = {
    bannerCount: count,
    bannerTotal: denominator ?? null,
    bannerDescription: `마리의 강아지가 ${isPast ? '등원했어요!' : '등원 예정이에요!'}`,
  };

  if (dayKind === 'future') return { ...banner, stats: [] };

  return {
    ...banner,
    stats: [
      { label: '등원 완료', count: summary.checkedInCount },
      { label: '결석 확정', count: summary.absentCount },
      isPast
        ? { label: '하원 미처리', count: summary.notCheckedOutCount }
        : { label: '하원 완료', count: summary.checkedOutCount },
    ],
  };
};

export { toOwnerDailySummaryView };
export type { OwnerDailySummaryStat, OwnerDailySummaryView };
