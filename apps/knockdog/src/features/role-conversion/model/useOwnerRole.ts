'use client';

import { useEffect, useState } from 'react';

import { useOwnerRoleQuery, useUserStore, type OwnerRole } from '@entities/user';
import { tokenUtils } from '@shared/utils';

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
  /** 원장 권한·소속 유치원 필수 정보 조회 실패 여부 */
  isError: boolean;
  /** 원장 권한·소속 유치원 필수 정보 재조회 */
  refetch: () => Promise<unknown>;
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
  // token만 있고 user 미동기화 — 다른 WebView 로그인 직후 탭 store 반영 전. 비원장 오판 방지
  const isAuthSyncing = !user && tokenUtils.hasAccessToken();

  useEffect(() => {
    const unsubscribe = useUserStore.persist?.onFinishHydration?.(() => {
      setIsUserStoreHydrated(true);
    });

    if (hasUserStoreHydrated()) {
      setIsUserStoreHydrated(true);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    // 네이티브의 탭은 각각 별도 WebView다. 로그인·역할 전환이 다른 WebView에서
    // 일어나면 storage 이벤트가 현재 탭에 전달되지 않을 수 있어, 이전 로그인 상태
    // (또는 null)를 유지한 채 원장 권한을 비원장으로 판단할 수 있다.
    // 탭이 다시 활성화될 때 persist 저장소를 읽어 최신 사용자 상태로 맞춘다.
    const syncUserFromStorage = () => {
      void useUserStore.persist?.rehydrate?.();
    };

    window.addEventListener('knockdog:native-tab-focus', syncUserFromStorage);

    return () => {
      window.removeEventListener('knockdog:native-tab-focus', syncUserFromStorage);
    };
  }, []);

  const { data, isSuccess, isError, isFetching, refetch } = useOwnerRoleQuery({
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
    // 최초 조회 실패는 가드가 조기 리다이렉트하지 않도록 false 유지.
    // 이미 확인한 권한 정보가 캐시에 있으면 일시적 재조회 실패에도 화면을 계속 사용할 수 있음.
    isResolved: isUserStoreHydrated && !isAuthSyncing && (!isLoggedIn || isSuccess || data != null),
    isFetching: isAuthSyncing || (isLoggedIn && isFetching),
    // 마지막 성공 데이터가 없을 때만 원장 홈 식별 불가로 처리
    isError: isLoggedIn && isError && data == null,
    refetch,
  };
}

export {
  useOwnerRole,
  type OwnerRoleState,
  type OwnerKindergartenInfo,
  type OwnerProfileInfo,
};
