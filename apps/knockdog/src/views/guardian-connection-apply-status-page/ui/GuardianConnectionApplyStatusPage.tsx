'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { overlay } from 'overlay-kit';

import {
  useCancelGuardianApplicationMutation,
  useGuardianApplicationsQuery,
} from '@entities/guardian-application';
import { useUserStore } from '@entities/user';
import { route } from '@shared/constants/route';
import { trackConnectionStatus } from '@shared/lib/analytics';
import { openConfirmDialog, useStackNavigation } from '@shared/lib/bridge';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { PageError } from '@shared/ui/page-error';
import { useRequireAuth } from '@shared/ui/private-access/model/useRequireAuth';
import { toast } from '@shared/ui/toast';
import { tokenUtils } from '@shared/utils';
import type { GuardianConnectionApplyItem } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatus';
import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';
import { GuardianConnectionApplyCancelSheet } from '@views/guardian-connection-apply-status-page/ui/GuardianConnectionApplyCancelSheet';
import { GuardianConnectionApplyStatusEmpty } from '@views/guardian-connection-apply-status-page/ui/GuardianConnectionApplyStatusEmpty';
import { GuardianConnectionApplyStatusList } from '@views/guardian-connection-apply-status-page/ui/GuardianConnectionApplyStatusList';
import { Header } from '@widgets/Header';

function sortByAppliedAtDesc(items: GuardianConnectionApplyItem[]) {
  return [...items].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
}

function hasUserStoreHydrated() {
  return useUserStore.persist?.hasHydrated?.() ?? true;
}

function GuardianConnectionApplyStatusPage() {
  const content = guardianConnectionApplyStatusContent;
  const searchParams = useSearchParams();
  const { back, reset } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const [isUserStoreHydrated, setIsUserStoreHydrated] = useState(hasUserStoreHydrated);
  const hasAuth = useRequireAuth();
  const isFromInviteComplete = searchParams.get('from') === content.entryFromInviteComplete;
  const isAuthSyncing = isUserStoreHydrated && !userId && tokenUtils.hasAccessToken();

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
    if (!isAuthSyncing) return;
    void useUserStore.persist?.rehydrate?.();
  }, [isAuthSyncing]);

  const { data, isError, isLoading, isFetching, refetch } = useGuardianApplicationsQuery({
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
    async (item: GuardianConnectionApplyItem) => {
      const runCancel = async () => {
        try {
          // TODO: 원장 알림 전송 연동
          // title: 보호자가 등록 신청을 취소했어요
          // body: `${petName}가 승인 대기 목록에서 제외됐어요.`
          await cancelMutation.mutateAsync(item.id);
          trackConnectionStatus({ status: 'cancel', actor: 'guardian' });
        } catch {
          toast(content.cancelFailToast);
        }
      };

      const result = await openConfirmDialog({
        title: content.cancelSheet.title,
        cancelLabel: content.cancelSheet.closeLabel,
        confirmLabel: content.cancelSheet.confirmLabel,
        showAvatar: true,
        avatarUrl: item.pet.imageUrl,
      });

      if (result.status === 'pending') return;

      if (result.status === 'resolved') {
        if (result.action === 'confirm') void runCancel();
        return;
      }

      // status === 'unavailable' — 웹에서는 네이티브 다이얼로그가 없어 기존 웹 바텀시트로 폴백
      overlay.open(({ isOpen, close }) => (
        <GuardianConnectionApplyCancelSheet
          isOpen={isOpen}
          close={close}
          item={item}
          onConfirm={runCancel}
        />
      ));
    },
    [cancelMutation, content.cancelFailToast, content.cancelSheet]
  );

  const isAuthResolving = !isUserStoreHydrated || !hasAuth || isAuthSyncing || !userId;
  const isPageLoading = isAuthResolving || isLoading;

  return (
    <div className='bg-bg-50 flex h-full min-h-0 flex-1 flex-col'>
      <div className='bg-bg-0 shrink-0'>
        <Header>
          <Header.BackButton onClick={handleBack} />
          <Header.Title>{content.pageTitle}</Header.Title>
        </Header>
      </div>

      {isPageLoading ? (
        <DelayedLoadingSpinner isLoading={isPageLoading} layout='content' />
      ) : isError ? (
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
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <GuardianConnectionApplyStatusList items={visibleItems} onCancelClick={handleCancelClick} />
        </div>
      )}
    </div>
  );
}

export { GuardianConnectionApplyStatusPage };
