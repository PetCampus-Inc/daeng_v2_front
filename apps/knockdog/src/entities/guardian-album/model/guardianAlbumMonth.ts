/**
 * 보호자 월별 앨범 API DTO
 * `GET /api/v0/albums/{schoolId}/months/{yearMonth}`
 */

import {
  sortGuardianAlbumDaysDesc,
  toDateKey,
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

interface GuardianAlbumMonthDto {
  yearMonth?: GuardianAlbumYearMonthDto | null;
  firstAvailableMonth?: GuardianAlbumYearMonthDto | null;
  lastAvailableMonth?: GuardianAlbumYearMonthDto | null;
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
  days: GuardianAlbumDay[];
}

function toYearMonthDate(dto: GuardianAlbumYearMonthDto | null | undefined): Date | null {
  if (!dto) return null;

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

function toGuardianAlbumMonth(dto: GuardianAlbumMonthDto | null | undefined): GuardianAlbumMonth {
  const firstAvailableMonth = toYearMonthDate(dto?.firstAvailableMonth);
  const lastAvailableMonth = toYearMonthDate(dto?.lastAvailableMonth);
  const yearMonth = toYearMonthDate(dto?.yearMonth);

  const days = sortGuardianAlbumDaysDesc(
    (dto?.days ?? [])
      .map(toGuardianAlbumDay)
      .filter((day): day is GuardianAlbumDay => day != null)
  );

  return {
    yearMonth,
    firstAvailableMonth,
    lastAvailableMonth,
    connectionStartedAt: firstAvailableMonth ? toDateKeyFromYearMonth(firstAvailableMonth) : null,
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
  GuardianAlbumMonth,
  GuardianAlbumMonthDto,
  GuardianAlbumYearMonthDto,
};
