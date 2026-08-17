import type { KindergartenSelectOption } from '@shared/ui/kindergarten-select-sheet';
import { formatDateKey } from '@shared/lib/calendar-date';

import type { GuardianLinkedKindergarten } from './guardianKindergartenConnection';

/** 해당 월의 마지막 날 `YYYY-MM-DD` — 연결 해제 종료일 폴백 */
function toMonthEndDateKey(month: Date) {
  return formatDateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0));
}

/** `GET guardian/school/home` 현재 연결 유치원 → 선택 시트 옵션 (과거 이력 API 전 1건) */
function toKindergartenSelectOptions(
  linkedKindergarten: GuardianLinkedKindergarten | null,
  attendedUntil: string | null = null
): KindergartenSelectOption[] {
  if (!linkedKindergarten) return [];

  return [
    {
      id: linkedKindergarten.id,
      name: linkedKindergarten.name,
      imageUrl: linkedKindergarten.imageUrl,
      attendedUntil,
    },
  ];
}

export { toKindergartenSelectOptions, toMonthEndDateKey };
