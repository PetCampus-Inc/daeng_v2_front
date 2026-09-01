'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { METHODS } from '@knockdog/bridge-core';

import { route } from '@shared/constants/route';
import { useBridge, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

import { useMypageRoleViewStore } from '@features/role-conversion';

import { guardianInviteResultContent } from '../config/guardianInviteResultContent';
import { GUARDIAN_INVITE_RESULT_STATUS, resolveGuardianInviteResultStatus } from '../config/guardianInviteResultStatus';

interface GuardianInviteResultParams {
  /** 등록 API가 반환한 재신청 대상. URL에 개인정보를 남기지 않기 위해 stack params로 전달한다. */
  failedPets?: Array<{ id: number; name: string }>;
}

function useGuardianInviteResultPage() {
  const searchParams = useSearchParams();
  const { token } = useParams<{ token: string }>();
  const { getParams, reset } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const bridge = useBridge();
  const status = resolveGuardianInviteResultStatus(searchParams.get('status'));
  const content = guardianInviteResultContent[status];
  // getParams는 전달 데이터를 소비하므로 초기 마운트 시 한 번만 읽는다.
  const [failedPets] = useState(() => getParams<GuardianInviteResultParams>()?.failedPets ?? []);

  // 이 완료 화면은 Stack WebView라 공통 탭 동기화(SyncNativeMainTabModeEffect)가 실행되지
  // 않는다. 초대 링크 진입 전 네이티브 모드가 원장으로 남아있었다면(예: 원장 탭을 보다가
  // 초대 링크를 연 경우) "홈으로 이동하기"가 보호자 탭이 아닌 원장 탭으로 튕기므로, 탭
  // 전환 전에 모드를 보호자로 명시 고정한다. 원장 상태로 들어왔어도 항상 보호자 홈으로
  // 이동해야 하는 화면이라 무조건 'guardian'으로 맞춘다.
  //
  // prefersGuardianView도 같이 true로 맞춰야 한다. 원장 권한 계정은 내 주변 탭(메인
  // 탭이라 SyncNativeMainTabModeEffect가 다시 실행됨)에 도착하는 순간 그 effect가
  // isOwner && !prefersGuardianView로 모드를 재계산하는데, 이 값을 안 바꾸면 여전히
  // false라 방금 강제한 guardian을 곧바로 owner로 되돌려버린다.
  const forceGuardianMainTabMode = () => {
    useMypageRoleViewStore.getState().setPrefersGuardianView(true);

    if (!isNativeWebView()) return Promise.resolve();
    return bridge.request(METHODS.navSetMainTabMode, {
      mode: 'guardian',
      requestId: Date.now(),
      force: true,
    });
  };

  const goHome = () => {
    void forceGuardianMainTabMode()
      .catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[GuardianInvite] failed to switch native tab mode', error);
        }
      })
      .finally(() => {
        void navigateToTab('/');
      });
  };

  const handlePrimaryClick = () => {
    if (status === GUARDIAN_INVITE_RESULT_STATUS.SUCCESS) {
      // 신청 현황에서 from=invite-complete 이면 뒤로가기 → 마이페이지
      void reset(route.guardian.connectionApply.status.root, { from: 'invite-complete' });
      return;
    }

    if (status === GUARDIAN_INVITE_RESULT_STATUS.APPLICATION_FAILED) {
      // 선택 화면에서 최신 연결 상태를 다시 조회한 뒤 재신청한다.
      void reset(route.invite.guardian.pet.root.replace('[token]', encodeURIComponent(token)));
      return;
    }

    // INVALID_INVITE: primaryButtonLabel이 "홈으로 이동하기"
    goHome();
  };

  const handleSecondaryClick = () => {
    goHome();
  };

  return { content, failedPets, handlePrimaryClick, handleSecondaryClick, status };
}

export { useGuardianInviteResultPage, type GuardianInviteResultParams };
