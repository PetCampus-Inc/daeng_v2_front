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
      name: linkedKindergarten.name,
      imageUrl: linkedKindergarten.imageUrl,
      attendedUntil,
    },
  ];
}

/** 연결 이력 — 학교별 최신 1건. 해제일이 있으면 과거 재원 */
function toKindergartenSelectOptionsFromConnections(
  connections: GuardianSchoolConnection[]
): KindergartenSelectOption[] {
  const seenSchoolIds = new Set<string>();
  const options: KindergartenSelectOption[] = [];

  for (const connection of connections) {
    if (seenSchoolIds.has(connection.schoolId)) continue;
    seenSchoolIds.add(connection.schoolId);
    options.push({
      id: connection.schoolId,
      name: connection.name,
      imageUrl: connection.imageUrl,
      attendedUntil: connection.disconnectedAt ? formatDateKey(connection.disconnectedAt) : null,
    });
  }

  return options;
}

function toMembershipIdBySchoolId(
  connections: GuardianSchoolConnection[],
  schoolId: string | null,
  attendedUntil: string | null
) {
  if (!schoolId) return null;

  const candidates = connections.filter((connection) => connection.schoolId === schoolId);
  if (candidates.length === 0) return null;

  if (attendedUntil) {
    const matchedDisconnected = candidates.find(
      (connection) =>
        connection.disconnectedAt != null && formatDateKey(connection.disconnectedAt) === attendedUntil
    );
    if (matchedDisconnected) return matchedDisconnected.id;
  }

  const connected = candidates.find((connection) => connection.disconnectedAt == null);
  return connected?.id ?? candidates[0]?.id ?? null;
}

export {
  toKindergartenSelectOptions,
  toKindergartenSelectOptionsFromConnections,
  toMembershipIdBySchoolId,
  toMonthEndDateKey,
};
