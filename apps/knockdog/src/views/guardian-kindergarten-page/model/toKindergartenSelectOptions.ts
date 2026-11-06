import type { GuardianSchoolConnection } from '@entities/guardian-home';
import { formatDateKey } from '@shared/lib/calendar-date';
import type { KindergartenSelectOption } from '@shared/ui/kindergarten-select-sheet';

import type { GuardianLinkedKindergarten } from './guardianKindergartenConnection';

/** 해당 월의 마지막 날 `YYYY-MM-DD` — 연결 해제 종료일 폴백 */
function toMonthEndDateKey(month: Date) {
  return formatDateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0));
}

/** `GET guardian/school/home` 현재 연결 유치원 → 선택 시트 옵션 (이력 없을 때 폴백) */
function toKindergartenSelectOptions(
  linkedKindergarten: GuardianLinkedKindergarten | null,
  attendedUntil: string | null = null
): KindergartenSelectOption[] {
  if (!linkedKindergarten) return [];

  return [
    {
      id: linkedKindergarten.id,
      schoolId: linkedKindergarten.id,
      membershipId: null,
      name: linkedKindergarten.name,
      imageUrl: linkedKindergarten.imageUrl,
      attendedFrom: null,
      attendedUntil,
    },
  ];
}

/**
 * `GET guardian/school/connections/schools` — 학교 단위(재연결 중복 없음).
 * option id = schoolId.
 */
function toKindergartenSelectOptionsFromConnections(
  connections: GuardianSchoolConnection[]
): KindergartenSelectOption[] {
  return connections.map((connection) => ({
    id: connection.schoolId,
    schoolId: connection.schoolId,
    membershipId: connection.id,
    name: connection.name,
    imageUrl: connection.imageUrl,
    attendedFrom: connection.connectedAt ? formatDateKey(connection.connectedAt) : null,
    attendedUntil: connection.disconnectedAt ? formatDateKey(connection.disconnectedAt) : null,
  }));
}

export {
  toKindergartenSelectOptions,
  toKindergartenSelectOptionsFromConnections,
  toMonthEndDateKey,
};
