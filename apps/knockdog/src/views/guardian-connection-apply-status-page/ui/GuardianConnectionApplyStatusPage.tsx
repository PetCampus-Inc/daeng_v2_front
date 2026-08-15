'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { overlay } from 'overlay-kit';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';
import {
  GUARDIAN_CONNECTION_APPLY_STATUS,
  type GuardianConnectionApplyItem,
} from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatus';
import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';
import {
  isApplyCancelFailMock,
  isApplyStatusEmptyMock,
  isApplyStatusErrorMock,
  isApplyStatusListMock,
  MOCK_CONNECTION_APPLY_ITEMS,
} from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusMock';
import { GuardianConnectionApplyCancelSheet } from '@views/guardian-connection-apply-status-page/ui/GuardianConnectionApplyCancelSheet';
import { GuardianConnectionApplyStatusEmpty } from '@views/guardian-connection-apply-status-page/ui/GuardianConnectionApplyStatusEmpty';
import { GuardianConnectionApplyStatusList } from '@views/guardian-connection-apply-status-page/ui/GuardianConnectionApplyStatusList';
import { Header } from '@widgets/Header';

function sortByAppliedAtDesc(items: GuardianConnectionApplyItem[]) {
  return [...items].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
}

function GuardianConnectionApplyStatusPage() {
  const content = guardianConnectionApplyStatusContent;
  const searchParams = useSearchParams();
  const { back, reset } = useStackNavigation();
  const mockQuery = searchParams.get('mock');
  const isFromInviteComplete = searchParams.get('from') === content.entryFromInviteComplete;

  const isLoadError = isApplyStatusErrorMock(mockQuery);
  const isEmpty = isApplyStatusEmptyMock(mockQuery);
  const isList = isApplyStatusListMock(mockQuery);
  const shouldFailCancel = isApplyCancelFailMock(mockQuery);

  const [items, setItems] = useState(() => sortByAppliedAtDesc(MOCK_CONNECTION_APPLY_ITEMS));

  const visibleItems = useMemo(() => (isList ? items : []), [isList, items]);

  const handleBack = () => {
    if (isFromInviteComplete) {
      void reset(route.mypage.root);
      return;
    }
    back();
  };

  const cancelApplication = useCallback(
    async (id: string) => {
      // TODO: 신청 취소 API + 원장 알림 전송
      // title: 보호자가 등록 신청을 취소했어요
      // body: `${petName}가 승인 대기 목록에서 제외됐어요.`
      // 알림 탭 → 구성원 탭 이동
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (shouldFailCancel) {
        throw new Error('CANCEL_FAIL');
      }

      setItems((prev) => {
        const target = prev.find((item) => item.id === id);
        if (!target || target.status !== GUARDIAN_CONNECTION_APPLY_STATUS.PENDING) return prev;

        return prev.map((item) =>
          item.id === id ? { ...item, status: GUARDIAN_CONNECTION_APPLY_STATUS.CANCELLED } : item
        );
      });
    },
    [shouldFailCancel]
  );

  const handleCancelClick = useCallback(
    (item: GuardianConnectionApplyItem) => {
      overlay.open(({ isOpen, close }) => (
        <GuardianConnectionApplyCancelSheet
          isOpen={isOpen}
          close={close}
          item={item}
          onConfirm={async () => {
            try {
              await cancelApplication(item.id);
            } catch {
              toast(content.cancelFailToast);
              throw new Error('CANCEL_FAIL');
            }
          }}
        />
      ));
    },
    [cancelApplication, content.cancelFailToast]
  );

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-0 shrink-0'>
        <Header>
          <Header.BackButton onClick={handleBack} />
          <Header.Title>{content.pageTitle}</Header.Title>
        </Header>
      </div>

      {isLoadError ? (
        <PageError layout='inline' className='bg-bg-50' />
      ) : isEmpty || visibleItems.length === 0 ? (
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <GuardianConnectionApplyStatusEmpty />
        </div>
      ) : (
        <div className='min-h-0 flex-1 overflow-y-auto pb-(--safe-area-inset-bottom,0px)'>
          <GuardianConnectionApplyStatusList items={visibleItems} onCancelClick={handleCancelClick} />
        </div>
      )}
    </div>
  );
}

export { GuardianConnectionApplyStatusPage };
