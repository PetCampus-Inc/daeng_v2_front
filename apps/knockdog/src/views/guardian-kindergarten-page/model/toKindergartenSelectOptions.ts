import type { KindergartenSelectOption } from '@shared/ui/kindergarten-select-sheet';

import type { GuardianLinkedKindergarten } from './guardianKindergartenConnection';

/** `GET guardian/school/home` 현재 연결 유치원 → 선택 시트 옵션 (과거 이력 API 전 1건) */
function toKindergartenSelectOptions(
  linkedKindergarten: GuardianLinkedKindergarten | null
): KindergartenSelectOption[] {
  if (!linkedKindergarten) return [];

  return [
    {
      id: linkedKindergarten.id,
      name: linkedKindergarten.name,
      imageUrl: linkedKindergarten.imageUrl,
      attendedUntil: null,
    },
  ];
}

export { toKindergartenSelectOptions };
