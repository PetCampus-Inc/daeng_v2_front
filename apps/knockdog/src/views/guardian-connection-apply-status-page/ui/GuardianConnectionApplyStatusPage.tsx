'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { overlay } from 'overlay-kit';

import {
  useCancelGuardianApplicationMutation,
  useGuardianApplicationsQuery,
} from '@entities/guardian-application';
import { useUserStore } from '@entities/user';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';
import type { GuardianConnectionApplyItem } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatus';
import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';
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
  const isFromInviteComplete = searchParams.get('from') === content.entryFromInviteComplete;

  const { data, isError, isPending, isFetching, refetch } = useGuardianApplicationsQuery({
    userId,
  });
  const cancelMutation = useCancelGuardianApplicationMutation({ userId });

  const visibleItems = useMemo(() => sortByAppliedAtDesc(data ?? []), [data]);

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

  const handleCancelClick = useCallback(
    (item: GuardianConnectionApplyItem) => {
      overlay.open(({ isOpen, close }) => (
        <GuardianConnectionApplyCancelSheet
          isOpen={isOpen}
          close={close}
          item={item}
          onConfirm={async () => {
            try {
              // TODO: 원장 알림 전송 연동
              // title: 보호자가 등록 신청을 취소했어요
              // body: `${petName}가 승인 대기 목록에서 제외됐어요.`
              await cancelMutation.mutateAsync(item.id);
            } catch {
              toast(content.cancelFailToast);
              throw new Error('CANCEL_FAIL');
            }
          }}
        />
      ));
    },
    [cancelMutation, content.cancelFailToast]
  );

  if (isPending) return null;

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-0 shrink-0'>
        <Header>
          <Header.BackButton onClick={handleBack} />
          <Header.Title>{content.pageTitle}</Header.Title>
        </Header>
      </div>

      {isError ? (
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
