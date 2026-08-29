'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { route } from '@shared/constants/route';
import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';

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
  const status = resolveGuardianInviteResultStatus(searchParams.get('status'));
  const content = guardianInviteResultContent[status];
  // getParams는 전달 데이터를 소비하므로 초기 마운트 시 한 번만 읽는다.
  const [failedPets] = useState(() => getParams<GuardianInviteResultParams>()?.failedPets ?? []);

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

    void reset(route.root);
  };

  const handleSecondaryClick = () => {
    void navigateToTab('/');
  };

  return { content, failedPets, handlePrimaryClick, handleSecondaryClick, status };
}

export { useGuardianInviteResultPage, type GuardianInviteResultParams };
