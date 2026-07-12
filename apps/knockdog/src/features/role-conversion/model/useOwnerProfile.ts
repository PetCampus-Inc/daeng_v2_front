'use client';

import { useMemo, useSyncExternalStore } from 'react';

import { getOwnerProfileSnapshot, subscribeOwnerProfile, type OwnerProfile } from '../model/ownerProfile';
import { useOwnerRole } from './useOwnerRole';

import { useSocialUserStore } from '@entities/social-user';
import { useUserStore } from '@entities/user';

function useOwnerProfile() {
  // @todo 프로필 수정 API 연동 후 로컬 편집값 없애기
  const storedProfile = useSyncExternalStore(
    subscribeOwnerProfile,
    getOwnerProfileSnapshot,
    () => null
  );

  const user = useUserStore((state) => state.user);
  const socialUser = useSocialUserStore((state) => state.socialUser);
  const { owner } = useOwnerRole();

  const profile = useMemo((): OwnerProfile => {
    return {
      name: storedProfile?.name || owner?.name || '',
      phoneNumber: storedProfile?.phoneNumber || owner?.phoneNumber || '',
      email: storedProfile?.email || socialUser?.email || '',
      profileImageUrl: storedProfile?.profileImageUrl ?? user?.profileImageUrl,
    };
  }, [owner?.name, owner?.phoneNumber, socialUser?.email, storedProfile, user?.profileImageUrl]);

  return { profile };
}

export { useOwnerProfile };
