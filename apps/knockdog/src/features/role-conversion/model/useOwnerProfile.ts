'use client';

import { useMemo, useSyncExternalStore } from 'react';

import { OWNER_VERIFIED_STUB } from '../config/roleConversionVisibility';
import { OWNER_MYPAGE_PROFILE_STUB } from '../model/ownerMypageStub';
import { getOwnerProfileSnapshot, subscribeOwnerProfile, type OwnerProfile } from '../model/ownerProfile';
import { useOwnerKindergarten } from './useOwnerKindergarten';

import { useSocialUserStore } from '@entities/social-user';
import { useUserStore } from '@entities/user';

interface UseOwnerProfileOptions {
  enabled?: boolean;
}

function useOwnerProfile({ enabled = true }: UseOwnerProfileOptions = {}) {
  const storedProfile = useSyncExternalStore(
    subscribeOwnerProfile,
    getOwnerProfileSnapshot,
    () => null
  );

  const user = useUserStore((state) => state.user);
  const socialUser = useSocialUserStore((state) => state.socialUser);
  const { ownerName } = useOwnerKindergarten({ enabled });

  const profile = useMemo((): OwnerProfile => {
    const fallbackProfile =
      OWNER_VERIFIED_STUB && !storedProfile
        ? OWNER_MYPAGE_PROFILE_STUB
        : {
            name: ownerName,
            phoneNumber: '',
            email: socialUser?.email ?? '',
          };

    const baseProfile = storedProfile ?? fallbackProfile;

    return {
      name: baseProfile.name || ownerName,
      phoneNumber: baseProfile.phoneNumber,
      email: baseProfile.email || socialUser?.email || '',
      profileImageUrl: baseProfile.profileImageUrl ?? user?.profileImageUrl,
    };
  }, [ownerName, socialUser?.email, storedProfile, user?.profileImageUrl]);

  return { profile };
}

export { useOwnerProfile };
