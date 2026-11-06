'use client';

import { useOwnerRole } from './useOwnerRole';

/** 로그인 + 원장 권한 확인(BE) 완료 여부 */
function useIsOwnerVerified() {
  return useOwnerRole().isOwner;
}

export { useIsOwnerVerified };
