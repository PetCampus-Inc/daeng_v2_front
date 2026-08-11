import type { Pet } from '@entities/pet';

import type { GuardianKindergartenConnectionStatus } from '../model/guardianKindergartenConnection';

function compareKoreanName(a: string, b: string) {
  return a.localeCompare(b, 'ko');
}

/** 대표 → 연결됨(가나다) → 미연결(가나다). pending/disconnected/none/미조회는 미연결 그룹 */
function sortGuardianDogs(
  dogs: Pet[],
  getStatus: (pet: Pet) => GuardianKindergartenConnectionStatus | null | undefined
): Pet[] {
  const representative = dogs.filter((dog) => dog.isRepresentative);
  const rest = dogs.filter((dog) => !dog.isRepresentative);

  const linked = rest
    .filter((dog) => getStatus(dog) === 'approved')
    .sort((a, b) => compareKoreanName(a.name, b.name));

  const unlinked = rest
    .filter((dog) => getStatus(dog) !== 'approved')
    .sort((a, b) => compareKoreanName(a.name, b.name));

  return [...representative, ...linked, ...unlinked];
}

export { sortGuardianDogs };
