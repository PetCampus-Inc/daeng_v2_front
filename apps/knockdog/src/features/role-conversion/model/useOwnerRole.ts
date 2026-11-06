'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  getOwnerMypageSummary,
  getOwnerRole,
  ownerMypageSummaryQueryKey,
  ownerRoleQueryKey,
  useOwnerRoleQuery,
  useUserStore,
  type OwnerRole,
} from '@entities/user';
import { isNativeWebView } from '@shared/lib/device';
import { tokenUtils } from '@shared/utils';

declare global {
  interface Window {
    __knockdogNativeTabFocused?: boolean;
  }
}

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
  const queryClient = useQueryClient();
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
    if (!isNativeWebView()) return;

    // 네이티브 탭은 WebView·QueryClient가 분리된다. 로그인/역할 변경이 다른 WebView에서
    // 일어나면 storage 이벤트가 오지 않고, RQ window focus refetch도 탭 전환과 무관하다.
    // 활성 탭 focus·앱 복귀 시에만 저장소 + owner/role을 강제 재조회한다.
    const syncOwnerRoleOnNativeActivate = () => {
      void (async () => {
        try {
          await useUserStore.persist?.rehydrate?.();

          const userId = useUserStore.getState().user?.userId;
          if (!userId || !tokenUtils.hasAccessToken()) return;

          // observer가 아직 enabled=false여도 캐시에 최신값을 넣기 위해 fetchQuery 사용.
          // invalidate만 하면 disabled 쿼리는 네트워크를 안 타서 isOwner=false가 유지된다.
          const roleResponse = await queryClient.fetchQuery({
            queryKey: ownerRoleQueryKey(userId),
            queryFn: getOwnerRole,
          });

          // summary는 원장 전용(비원장 403). role과 all 하면 비원장에서 전체가 실패한다.
          if (roleResponse?.data?.isOwner) {
            await queryClient
              .fetchQuery({
                queryKey: ownerMypageSummaryQueryKey(userId),
                queryFn: getOwnerMypageSummary,
              })
              .catch(() => undefined);
          }
        } catch {
          // 일시 실패 시 기존 캐시 유지. 다음 focus/appresume에서 재시도.
        }
      })();
    };

    window.addEventListener('knockdog:native-tab-focus', syncOwnerRoleOnNativeActivate);
    window.addEventListener('appresume', syncOwnerRoleOnNativeActivate);

    // focus 주입이 이 effect 등록보다 먼저면 리스너가 놓친다. 이미 활성 탭이면 즉시 sync.
    if (window.__knockdogNativeTabFocused === true) {
      syncOwnerRoleOnNativeActivate();
    }

    return () => {
      window.removeEventListener('knockdog:native-tab-focus', syncOwnerRoleOnNativeActivate);
      window.removeEventListener('appresume', syncOwnerRoleOnNativeActivate);
    };
  }, [queryClient]);

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
