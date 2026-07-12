'use client';

import { useOwnerRoleQuery, useUserStore } from '@entities/user';

interface OwnerRoleState {
  /** 로그인 + BE 원장 권한 확인 완료 여부 */
  isOwner: boolean;
  schoolId: number | null;
  /** 원장 여부 판별이 끝났는지 (비로그인이거나 조회 완료) — 가드 조기 리다이렉트 방지용 */
  isResolved: boolean;
}

/**
 * BE `GET /user/owner-role` 기준으로 원장 권한 상태를 조회.
 * 로그인 세션에 종속되며, 유저별로 캐시가 분리되어 계정 전환 시 이전 원장 상태가 남지 않음.
 */
function useOwnerRole(): OwnerRoleState {
  const user = useUserStore((state) => state.user);
  const isLoggedIn = !!user;

  const { data, isFetched } = useOwnerRoleQuery({
    userId: user?.userId,
    enabled: isLoggedIn,
  });

  return {
    isOwner: isLoggedIn && (data?.isOwner ?? false),
    schoolId: data?.schoolId ?? null,
    isResolved: !isLoggedIn || isFetched,
  };
}

export { useOwnerRole, type OwnerRoleState };
