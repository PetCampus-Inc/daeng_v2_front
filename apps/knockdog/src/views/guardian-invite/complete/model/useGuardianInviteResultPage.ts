'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

import { guardianInviteResultContent } from '../config/guardianInviteResultContent';
import { guardianInviteFailedPetsPreview } from '../config/guardianInviteFailedPetsPreview';
import { GUARDIAN_INVITE_RESULT_STATUS, resolveGuardianInviteResultStatus } from '../config/guardianInviteResultStatus';

interface GuardianInviteResultParams {
  /** 등록 API가 반환한 재신청 대상. URL에 개인정보를 남기지 않기 위해 stack params로 전달한다. */
  failedPets?: Array<{ id: string; name: string }>;
}

function useGuardianInviteResultPage() {
  const searchParams = useSearchParams();
  const { getParams, reset } = useStackNavigation();
  const status = resolveGuardianInviteResultStatus(searchParams.get('status'));
  const content = guardianInviteResultContent[status];
  // getParams는 전달 데이터를 소비하므로 초기 마운트 시 한 번만 읽는다.
  const [failedPets] = useState(() => getParams<GuardianInviteResultParams>()?.failedPets ?? guardianInviteFailedPetsPreview);

  const handlePrimaryClick = () => {
    if (status === GUARDIAN_INVITE_RESULT_STATUS.SUCCESS) {
      // 신청 내역 화면의 경로가 확정되면 이곳에서 이동을 연결한다.
      return;
    }

    if (status === GUARDIAN_INVITE_RESULT_STATUS.APPLICATION_FAILED) {
      // 신청 API 연결 시 failedPets의 id만 재전송한다. 현재 초대 플로우에는 신청 API가 아직 없다.
      // API 없이 화면 단계만 되돌리면 이미 입력한 보호자 정보와 선택값이 유실되므로 이동하지 않는다.
      return;
    }

    void reset(route.root);
  };

  const handleSecondaryClick = () => {
    void reset(route.root);
  };

  return { content, failedPets, handlePrimaryClick, handleSecondaryClick, status };
}

export { useGuardianInviteResultPage, type GuardianInviteResultParams };
