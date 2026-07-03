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

  // @todo BE 원장 인증 상태 반영
  if (OWNER_VERIFIED_STUB) return true;

  return Boolean(ownerKindergarten);
}

export { useIsOwnerVerified };
