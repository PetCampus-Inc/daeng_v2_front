/**
 * 보호자 월별 앨범 API DTO
 * `GET /api/v0/albums/{schoolId}/months/{yearMonth}`
 */

import { parseApiDateTime, type GuardianHomeDateTime } from '@entities/guardian-home';

import {
  sortGuardianAlbumDaysDesc,
  toGuardianAlbumDay,
  type GuardianAlbumDay,
  type GuardianAlbumDayDto,
} from './guardianAlbumDay';

interface GuardianAlbumYearMonthDto {
  year?: number | null;
  month?: string | null;
  monthValue?: number | null;
  leapYear?: boolean | null;
}

/** 사이클별 재원 구간 (QA3-142 periods) */
interface GuardianAlbumPeriodDto {
  connectedDate?: GuardianHomeDateTime | null;
  disconnectedDate?: GuardianHomeDateTime | null;
  /** @deprecated API 계약은 connectedDate */
  connectedAt?: GuardianHomeDateTime | null;
  /** @deprecated API 계약은 disconnectedDate */
  disconnectedAt?: GuardianHomeDateTime | null;
}

interface GuardianAlbumMembershipPeriod {
  connectedAt: Date;
  disconnectedAt: Date | null;
}

interface GuardianAlbumMonthDto {
  yearMonth?: GuardianAlbumYearMonthDto | GuardianHomeDateTime | null;
  firstAvailableMonth?: GuardianAlbumYearMonthDto | GuardianHomeDateTime | null;
  lastAvailableMonth?: GuardianAlbumYearMonthDto | GuardianHomeDateTime | null;
  /** 사이클별 연결일~해제일 — 재연결 이력 배너용 */
  periods?: GuardianAlbumPeriodDto[] | null;
  days?: GuardianAlbumDayDto[] | null;
}

interface GuardianAlbumMonth {
  yearMonth: Date | null;
  firstAvailableMonth: Date | null;
  lastAvailableMonth: Date | null;
  /**
   * 연결(조회 가능) 시작 월 — `firstAvailableMonth`의 1일 키.
   * 실제 등원/연결일은 membership `connectedAt`을 우선 사용해야 함
   */
  connectionStartedAt: string | null;
  periods: GuardianAlbumMembershipPeriod[];
  days: GuardianAlbumDay[];
}

function toYearMonthDate(
  dto: GuardianAlbumYearMonthDto | GuardianHomeDateTime | null | undefined
): Date | null {
  if (!dto) return null;

  // API: firstAvailableMonth / yearMonth 가 `[y, m]` 배열인 경우
  if (Array.isArray(dto)) {
    if (dto.length < 2) return null;
    const [year, month] = dto;
    if (
      typeof year !== 'number' ||
      typeof month !== 'number' ||
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      month < 1 ||
      month > 12
    ) {
      return null;
    }
    return new Date(year, month - 1, 1);
  }

  if (typeof dto === 'string') {
    const parsed = parseApiDateTime(dto);
    return parsed ? new Date(parsed.getFullYear(), parsed.getMonth(), 1) : null;
  }

  const year = dto.year;
  const monthValue = dto.monthValue;
  if (
    typeof year === 'number' &&
    Number.isFinite(year) &&
    typeof monthValue === 'number' &&
    Number.isFinite(monthValue) &&
    monthValue >= 1 &&
    monthValue <= 12
  ) {
    return new Date(year, monthValue - 1, 1);
  }

  return null;
}

function toDateKeyFromYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

function toGuardianAlbumPeriod(
  dto: GuardianAlbumPeriodDto | null | undefined
): GuardianAlbumMembershipPeriod | null {
  const connectedAt = parseApiDateTime(dto?.connectedDate ?? dto?.connectedAt ?? null);
  if (!connectedAt) return null;
  return {
    connectedAt,
    disconnectedAt: parseApiDateTime(dto?.disconnectedDate ?? dto?.disconnectedAt ?? null),
  };
}

function toGuardianAlbumMonth(dto: GuardianAlbumMonthDto | null | undefined): GuardianAlbumMonth {
  const firstAvailableMonth = toYearMonthDate(dto?.firstAvailableMonth);
  const lastAvailableMonth = toYearMonthDate(dto?.lastAvailableMonth);
  const yearMonth = toYearMonthDate(dto?.yearMonth);

  const days = sortGuardianAlbumDaysDesc(
    (dto?.days ?? [])
      .map(toGuardianAlbumDay)
      .filter((day): day is GuardianAlbumDay => day != null)
  );

  const periods = (dto?.periods ?? [])
    .map(toGuardianAlbumPeriod)
    .filter((period): period is GuardianAlbumMembershipPeriod => period != null)
    // 최신 사이클이 앞에 오도록 connectedAt 내림차순
    .sort((left, right) => right.connectedAt.getTime() - left.connectedAt.getTime());

  return {
    yearMonth,
    firstAvailableMonth,
    lastAvailableMonth,
    connectionStartedAt: firstAvailableMonth ? toDateKeyFromYearMonth(firstAvailableMonth) : null,
    periods,
    days,
  };
}

/** `YYYY-MM` path param */
function formatGuardianAlbumYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export { formatGuardianAlbumYearMonth, toGuardianAlbumMonth };
export type {
  GuardianAlbumDay as GuardianAlbumMonthDay,
  GuardianAlbumDayDto as GuardianAlbumMonthDayDto,
  GuardianAlbumMembershipPeriod,
  GuardianAlbumMonth,
  GuardianAlbumMonthDto,
  GuardianAlbumPeriodDto,
  GuardianAlbumYearMonthDto,
};
