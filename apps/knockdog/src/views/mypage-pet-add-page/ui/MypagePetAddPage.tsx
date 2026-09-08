'use client';

import { useCallback, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from '@widgets/Header';
import { PetProfileForm } from '@features/dog-profile';
import { GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY } from '@entities/guardian-invite';
import { useStackNavigation, useNativeBackHandler } from '@shared/lib/bridge';
import { openUnsavedExitDialog } from '@shared/lib/openUnsavedExitDialog';
import { useUnsavedBrowserBackGuard } from '@shared/lib/useUnsavedBrowserBackGuard';
import { route } from '@shared/constants/route';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';
import { toast } from '@shared/ui/toast';

export function MypagePetAddPage() {
  const { back, pushForResult, replace, reset } = useStackNavigation();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');
  const [isFormDirty, setIsFormDirty] = useState(false);
  const handleBackRef = useRef(() => {});

  const { releaseAndLeave, suspendGuard, resumeGuard } = useUnsavedBrowserBackGuard(isFormDirty, () => {
    handleBackRef.current();
  });

  const navigateBack = useCallback(() => {
    if (inviteToken) {
      void replace({ pathname: route.invite.guardian.pet.root.replace('[token]', encodeURIComponent(inviteToken)) });
      return;
    }

    back?.();
  }, [back, inviteToken, replace]);

  const leavePage = useCallback(() => {
    releaseAndLeave(navigateBack);
  }, [navigateBack, releaseAndLeave]);

  const handleBack = useCallback(() => {
    if (!isFormDirty) {
      leavePage();
      return;
    }

    openUnsavedExitDialog({
      title: '저장하지 않고 나갈까요?',
      description: '변경한 내용이 저장되지 않아요.',
      cancelLabel: '닫기',
      confirmLabel: '나가기',
      onConfirm: leavePage,
    });
  }, [isFormDirty, leavePage]);

  handleBackRef.current = handleBack;
  useNativeBackHandler(handleBack);

  const handleSuccess = async (petId?: string) => {
    syncWebViewQuery.invalidate(['petList']);
    if (inviteToken) {
      // 초대 강아지 선택 화면은 pet/list와 별도의 연결 상태 query를 사용한다.
      // stack 전환 전에 갱신해 새 프로필이 즉시 목록에 보이게 한다.
      await queryClient.invalidateQueries({
        queryKey: [GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY],
        refetchType: 'all',
      });
      releaseAndLeave(() => {
        void replace({ pathname: route.invite.guardian.pet.root.replace('[token]', encodeURIComponent(inviteToken)) });
      });
      return;
    }

    if (petId) {
      releaseAndLeave(() => {
        void replace({ pathname: route.mypage.pet.detail.root, query: { petId } });
      });
      return;
    }

    leavePage();
  };

  const handleError = (error: unknown) => {
    console.error('펫 등록 실패:', error);
    toast({
      title: '일시적 오류로 요청을 완료하지 못했어요',
      nativeTitle: '일시적 오류로 요청을 완료하지 못했어요',
    });
  };

  const handleGoToPetList = () => {
    releaseAndLeave(() => {
      if (inviteToken) {
        void replace({ pathname: route.invite.guardian.pet.root.replace('[token]', encodeURIComponent(inviteToken)) });
        return;
      }

      void reset(route.mypage.root);
    });
  };

  const handleViewPetProfile = async (petId: string) => {
    suspendGuard();
    try {
      await pushForResult({ pathname: route.mypage.pet.detail.root, query: { petId } }, 600_000);
    } finally {
      resumeGuard();
    }
  };

  return (
    <div className='bg-bg-0 flex min-h-0 flex-1 flex-col'>
      <Header className='shrink-0'>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>강아지 프로필 추가하기</Header.Title>
      </Header>

      <PetProfileForm
        mode='add'
        entryPoint={inviteToken ? 'connection_request' : 'mypage'}
        onSuccess={handleSuccess}
        onError={handleError}
        onDirtyChange={setIsFormDirty}
        onGoToPetList={handleGoToPetList}
        onViewPetProfile={handleViewPetProfile}
        submitButtonText='저장하기'
      />
    </div>
  );
}
