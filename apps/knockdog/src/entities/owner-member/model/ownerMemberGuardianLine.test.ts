import { describe, expect, it } from 'vitest';

import { toOwnerMemberGuardianLine } from './ownerMemberGuardianLine';

describe('등록 원생 한 줄의 보호자 정보', () => {
  it('보호자 연락처가 있으면 `{보호자 이름} 보호자 · {연락처}`로 보여준다', () => {
    expect(toOwnerMemberGuardianLine('김지원', '010-0000-0000')).toBe('김지원 보호자 · 010-0000-0000');
  });

  it('보호자 연락처가 없으면 `{보호자 이름} 보호자 · 연락처 없음`으로 보여준다', () => {
    expect(toOwnerMemberGuardianLine('김지원', null)).toBe('김지원 보호자 · 연락처 없음');
  });
});
