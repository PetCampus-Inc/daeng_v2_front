'use client';

import { useOwnerRole } from './useOwnerRole';

import {
  useOwnerMypageSummaryQuery,
  useUserStore,
  type SocialLoginProvider,
} from '@entities/user';

interface OwnerMypageSummaryState {
  ownerName: string;
  profileImageUrl: string | null;
  loginProvider: SocialLoginProvider | null;
  loginEmail: string;
  kindergartenName: string;
  kindergartenAddress: string;
  /** 보호자 전환 버튼 노출 여부. 로드 전에는 원장 컨텍스트 기본값(true) */
  canSwitchToGuardian: boolean;
  /** 운영 권한 해제 버튼 노출 여부. 로드 전에는 원장 컨텍스트 기본값(true) */
  canReleaseOperationPermission: boolean;
}

/**
 * BE `GET /owner/mypage/summary` 기반 원장 마이페이지 헤더/요약 정보.
 * owner-role로 원장 확정(isOwner=true)된 뒤에만 호출한다(비원장은 403).
 */
function useOwnerMypageSummary(): OwnerMypageSummaryState {
  const user = useUserStore((state) => state.user);
  const { isOwner } = useOwnerRole();

  const { data } = useOwnerMypageSummaryQuery({
    userId: user?.userId,
    enabled: isOwner,
  });

  return {
    ownerName: data?.ownerName ?? '',
    profileImageUrl: data?.ownerProfileImageUrl ?? null,
    loginProvider: data?.loginProvider ?? null,
    loginEmail: data?.loginEmail ?? '',
    kindergartenName: data?.kindergartenName ?? '',
    kindergartenAddress: data?.kindergartenAddress ?? '',
    // 원장 마이페이지 진입 시점엔 활성 원장이라 기본 노출. summary 로드되면 BE 값으로 갱신.
    canSwitchToGuardian: data?.canSwitchToGuardian ?? true,
    canReleaseOperationPermission: data?.canReleaseOperationPermission ?? true,
  };
}

export { useOwnerMypageSummary, type OwnerMypageSummaryState };
