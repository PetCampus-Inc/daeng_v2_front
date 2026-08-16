'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { overlay } from 'overlay-kit';

import { useGuardianApplicationsQuery } from '@entities/guardian-application';
import { useUserStore } from '@entities/user';
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
  const userId = useUserStore((state) => state.user?.userId);
  const mockQuery = searchParams.get('mock');
  const isFromInviteComplete = searchParams.get('from') === content.entryFromInviteComplete;

  const forceError = isApplyStatusErrorMock(mockQuery);
  const forceEmpty = isApplyStatusEmptyMock(mockQuery);
  const forceListMock = isApplyStatusListMock(mockQuery);
  const shouldFailCancel = isApplyCancelFailMock(mockQuery);

  const {
    data: remoteItems,
    isError,
    isPending,
    isFetching,
    refetch,
  } = useGuardianApplicationsQuery({
    userId,
    enabled: !forceError && !forceEmpty && !forceListMock,
  });

  const [localItems, setLocalItems] = useState<GuardianConnectionApplyItem[] | null>(null);

  const sourceItems = useMemo(() => {
    if (forceEmpty) return [];
    if (forceListMock) return localItems ?? MOCK_CONNECTION_APPLY_ITEMS;
    return localItems ?? remoteItems ?? [];
  }, [forceEmpty, forceListMock, localItems, remoteItems]);

  const visibleItems = useMemo(() => sortByAppliedAtDesc(sourceItems), [sourceItems]);

  const isLoadError = forceError || (!forceEmpty && !forceListMock && isError);

  const handleBack = () => {
    if (isFromInviteComplete) {
      void reset(route.mypage.root);
      return;
    }
    back();
  };

  const handleRetry = () => {
    void refetch();
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

      setLocalItems((prev) => {
        const base = prev ?? remoteItems ?? (forceListMock ? MOCK_CONNECTION_APPLY_ITEMS : []);
        const target = base.find((item) => item.id === id);
        if (!target || !target.cancellable) return prev ?? base;

        return base.map((item) =>
          item.id === id
            ? {
                ...item,
                status: GUARDIAN_CONNECTION_APPLY_STATUS.CANCELLED,
                cancellable: false,
              }
            : item
        );
      });
    },
    [forceListMock, remoteItems, shouldFailCancel]
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

  if (!forceError && !forceEmpty && !forceListMock && isPending) return null;

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-0 shrink-0'>
        <Header>
          <Header.BackButton onClick={handleBack} />
          <Header.Title>{content.pageTitle}</Header.Title>
        </Header>
      </div>

      {isLoadError ? (
        <PageError
          layout='inline'
          className='bg-bg-50'
          isRetrying={isFetching}
          onRetry={handleRetry}
        />
      ) : visibleItems.length === 0 ? (
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
