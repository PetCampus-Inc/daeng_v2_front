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
  const { isOwner, isResolved } = useOwnerRole();

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
    // isOwner는 "원장 아님"과 "원장 여부 확인 중"을 구분하지 못해(로딩 중엔 항상 false),
    // isResolved 없이 !isOwner만 보면 원장 여부 확인이 끝나기 전에 폼이 빈 이름으로
    // 먼저 렌더링될 수 있다. 그 틈에 사용자가 입력하면 나중에 도착한 실제 값으로
    // reset()이 덮어써서 "입력했는데 반영이 안 되는" 것처럼 보이는 문제가 있었다.
    /** 원장 여부 확인이 끝났고, 원장이 아니면 즉시 true. 원장이면 프로필 첫 조회가 끝날 때까지 false */
    isReady: isResolved && (!isOwner || !isPending),
  };
}

export { useOwnerProfile };
