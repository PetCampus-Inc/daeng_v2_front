const NO_GUARDIAN_PHONE_LABEL = '연락처 없음';

/** 등록 원생 한 줄의 보호자 문구를 만든다. (예: `김지원 보호자 · 010-0000-0000`) */
function toOwnerMemberGuardianLine(guardianName: string, guardianPhoneNumber: string | null): string {
  return `${guardianName} 보호자 · ${guardianPhoneNumber ?? NO_GUARDIAN_PHONE_LABEL}`;
}

export { toOwnerMemberGuardianLine };
