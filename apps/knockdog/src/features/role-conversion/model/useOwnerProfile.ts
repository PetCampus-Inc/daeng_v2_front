'use client';

import { useMemo, useSyncExternalStore } from 'react';

import { getOwnerProfileSnapshot, subscribeOwnerProfile, type OwnerProfile } from '../model/ownerProfile';
import { useOwnerRole } from './useOwnerRole';

import { useOwnerProfileQuery, useUserStore } from '@entities/user';

/**
 * BE `GET /owner/mypage/profile` 기반 원장 프로필.
 * owner-role로 원장 확정(isOwner=true)된 뒤에만 호출한다(비원장 403).
 */
function useOwnerProfile() {
  const storedProfile = useSyncExternalStore(
    subscribeOwnerProfile,
    getOwnerProfileSnapshot,
    () => null
  );

  const user = useUserStore((state) => state.user);
  const { isOwner } = useOwnerRole();

  const { data } = useOwnerProfileQuery({
    userId: user?.userId,
    enabled: isOwner,
  });

  const profile = useMemo((): OwnerProfile => {
    return {
      name: storedProfile?.name || (data?.representativeName ?? '').trim(),
      phoneNumber: storedProfile?.phoneNumber || (data?.representativePhoneNumber ?? '').trim(),
      email: storedProfile?.email || data?.loginEmail || '',
      profileImageUrl: storedProfile?.profileImageUrl ?? data?.profileImageUrl ?? undefined,
    };
  }, [data, storedProfile]);

  return { profile };
}

export { useOwnerProfile };
