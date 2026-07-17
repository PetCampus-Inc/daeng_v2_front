'use client';

import { useMemo } from 'react';

import type { OwnerProfile } from '../model/ownerProfile';
import { useOwnerRole } from './useOwnerRole';

import { useOwnerProfileQuery, useUserStore } from '@entities/user';

/**
 * BE `GET /owner/mypage/profile` 기반 원장 프로필.
 * owner-role로 원장 확정(isOwner=true)된 뒤에만 호출한다(비원장 403).
 */
function useOwnerProfile() {
  const user = useUserStore((state) => state.user);
  const { isOwner } = useOwnerRole();

  const { data, isPending } = useOwnerProfileQuery({
    userId: user?.userId,
    enabled: isOwner,
  });

  const profile = useMemo((): OwnerProfile => {
    return {
      name: (data?.representativeName ?? '').trim(),
      phoneNumber: (data?.representativePhoneNumber ?? '').trim(),
      email: data?.loginEmail || '',
      profileImageUrl: data?.profileImageUrl ?? undefined,
    };
  }, [data]);

  return {
    profile,
    /** 원장이 아니면 즉시 true. 원장이면 프로필 첫 조회가 끝날 때까지 false */
    isReady: !isOwner || !isPending,
  };
}

export { useOwnerProfile };
