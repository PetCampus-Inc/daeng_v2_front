import { useSyncExternalStore } from 'react';

import { useUserStore } from '@entities/user';

import { OWNER_VERIFIED_STUB } from '../config/roleConversionVisibility';
import { loadOwnerKindergarten, subscribeOwnerKindergarten } from './ownerKindergarten';

/** 로그인 + 원장 인증 완료 여부 */
function useIsOwnerVerified() {
  const user = useUserStore((state) => state.user);
  const ownerKindergarten = useSyncExternalStore(
    subscribeOwnerKindergarten,
    loadOwnerKindergarten,
    () => null
  );

  if (!user) return false;

  // 원장 인증 API 미연동 — UI 확인용 stub (roleConversionVisibility.ts)
  if (OWNER_VERIFIED_STUB) return true;

  return Boolean(ownerKindergarten);
}

export { useIsOwnerVerified };
