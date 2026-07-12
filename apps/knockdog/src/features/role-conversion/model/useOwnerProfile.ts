'use client';

import { useMemo, useSyncExternalStore } from 'react';

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
  const { ownerName, ownerPhoneNumber } = useOwnerKindergarten({ enabled });

  const profile = useMemo((): OwnerProfile => {
    const baseProfile = storedProfile ?? {
      name: ownerName,
      phoneNumber: ownerPhoneNumber,
      email: socialUser?.email ?? '',
    };

    return {
      name: baseProfile.name || ownerName,
      phoneNumber: baseProfile.phoneNumber || ownerPhoneNumber,
      email: baseProfile.email || socialUser?.email || '',
      profileImageUrl: baseProfile.profileImageUrl ?? user?.profileImageUrl,
    };
  }, [ownerName, ownerPhoneNumber, socialUser?.email, storedProfile, user?.profileImageUrl]);

  return { profile };
}

export { useOwnerProfile };
