import { describe, expect, test, vi } from 'vitest';

import { getDogMetaParts } from '@shared/ui/dog-meta-line/lib/getDogMetaParts';

// @entities/pet 전체를 불러오면 빌드되지 않은 UI 패키지(vaul)까지 읽으므로, 나이 계산 함수만 실제 구현으로 대신한다
vi.mock('@entities/pet', () => import('@entities/pet/lib/calculateAge'));

const thisYear = new Date().getFullYear();

describe('등원처리 탭 카드 표시', () => {
  test('견종·몸무게·나이 중 값이 없는 항목은 빼고 ` · `로 이어서 보여 준다 (예: 견종과 나이만 있으면 `사모예드 · 3살`)', () => {
    const parts = getDogMetaParts({ breed: '사모예드', weightKg: null, birthYear: thisYear - 3 });

    expect(parts.join(' · ')).toBe('사모예드 · 3살');
    expect(getDogMetaParts({ breed: '사모예드', weightKg: 8, birthYear: thisYear - 3 }).join(' · ')).toBe(
      '사모예드 · 8kg · 3살'
    );
  });

  test('견종·몸무게·나이가 모두 없으면 이 줄을 보여 주지 않는다', () => {
    expect(getDogMetaParts({ breed: '', weightKg: null, birthYear: null })).toEqual([]);
    expect(getDogMetaParts({ breed: '  ', weightKg: undefined, birthYear: undefined })).toEqual([]);
  });
});
