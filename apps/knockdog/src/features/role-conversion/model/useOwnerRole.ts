'use client';

import { useEffect, useState } from 'react';

import { useOwnerRoleQuery, useUserStore, type OwnerRole } from '@entities/user';

interface OwnerKindergartenInfo {
  source: 'manual' | 'search';
  name: string;
  address: string;
}

interface OwnerProfileInfo {
  name: string;
  phoneNumber: string;
}

interface OwnerRoleState {
  /** 로그인 + BE 원장 권한 확인 완료 여부 */
  isOwner: boolean;
  schoolId: number | null;
  /** BE 내부 유치원 PK (basic/main 조회 키 아님) */
  kindergartenId: number | null;
  /** SELECTED 유치원 basic/main API 조회용 place id */
  placeId: number | null;
  /** 원장 소속 유치원 정보 (isOwner=false면 null) */
  kindergarten: OwnerKindergartenInfo | null;
  /** 원장(대표자) 정보 (isOwner=false면 null) */
  owner: OwnerProfileInfo | null;
  /** 원장 여부 판별이 끝났는지 (비로그인이거나 조회 완료) — 가드 조기 리다이렉트 방지용 */
  isResolved: boolean;
  /** invalidate 직후 stale false → true 사이 가드/탭 다운그레이드 방지 */
  isFetching: boolean;
}

function toKindergarten(data: OwnerRole): OwnerKindergartenInfo {
  return {
    source: data.kindergartenType === 'SELECTED' ? 'search' : 'manual',
    name: (data.kindergartenName ?? '').trim(),
    address: (data.kindergartenAddress ?? '').trim(),
  };
}

function toOwner(data: OwnerRole): OwnerProfileInfo {
  return {
    name: (data.representativeName ?? '').trim(),
    phoneNumber: (data.representativePhoneNumber ?? '').trim(),
  };
}

function hasUserStoreHydrated() {
  return useUserStore.persist?.hasHydrated?.() ?? true;
}

/**
 * BE `GET /owner/role` 기준으로 원장 권한 상태 + 유치원/대표자 상세를 조회.
 * 로그인 세션에 종속되며, 유저별로 캐시가 분리되어 계정 전환 시 이전 원장 상태가 남지 않음.
 */
function useOwnerRole(): OwnerRoleState {
  const user = useUserStore((state) => state.user);
  const [isUserStoreHydrated, setIsUserStoreHydrated] = useState(hasUserStoreHydrated);
  const isLoggedIn = !!user;

  useEffect(() => {
    const unsubscribe = useUserStore.persist?.onFinishHydration?.(() => {
      setIsUserStoreHydrated(true);
    });

    if (hasUserStoreHydrated()) {
      setIsUserStoreHydrated(true);
    }

    return unsubscribe;
  }, []);

  const { data, isSuccess, isFetching } = useOwnerRoleQuery({
    userId: user?.userId,
    enabled: isUserStoreHydrated && isLoggedIn,
  });

  const isOwner = isLoggedIn && (data?.isOwner ?? false);

  return {
    isOwner,
    schoolId: data?.schoolId ?? null,
    kindergartenId: data?.kindergartenId ?? null,
    placeId: data?.placeId ?? null,
    kindergarten: isOwner && data ? toKindergarten(data) : null,
    owner: isOwner && data ? toOwner(data) : null,
    // 조회 성공 시에만 resolved 처리 — 실패(에러) 상태에서는 가드가 조기 리다이렉트하지 않도록 false 유지
    isResolved: isUserStoreHydrated && (!isLoggedIn || isSuccess),
    isFetching: isLoggedIn && isFetching,
  };
}

export {
  useOwnerRole,
  type OwnerRoleState,
  type OwnerKindergartenInfo,
  type OwnerProfileInfo,
};
