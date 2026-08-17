'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@knockdog/ui';
import { overlay } from 'overlay-kit';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from '@widgets/Header';
import { PetProfileForm, PetAddDialog } from '@features/dog-profile';
import { GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY } from '@entities/guardian-invite';
import { usePetListQuery } from '@entities/pet';
import { useUserStore } from '@entities/user';
import { useStackNavigation } from '@shared/lib/bridge';
import { route } from '@shared/constants/route';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';
import { toast } from '@shared/ui/toast';

export function MypagePetAddPage() {
  const { back, push, replace, reset } = useStackNavigation();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');
  const [isFormDirty, setIsFormDirty] = useState(false);
  const { data: petListResponse } = usePetListQuery();
  const user = useUserStore((state) => state.user);

  const isFirstPet = (petListResponse?.data?.length ?? 0) === 0;

  const navigateBack = () => {
    if (inviteToken) {
      void replace({ pathname: route.invite.guardian.pet.root.replace('[token]', encodeURIComponent(inviteToken)) });
      return;
    }

    back?.();
  };

  const handleBack = () => {
    // 폼에 변경사항이 없으면 바로 뒤로가기
    if (!isFormDirty) {
      navigateBack();
      return;
    }

    // 변경사항이 있으면 확인 다이얼로그 표시
    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>앗, 아직 저장하지 않았어요!</AlertDialogTitle>
            <AlertDialogDescription>
              지금 나가면 현재까지 쓴 내용이 사라져요.
              <br />
              저장 없이 나갈까요?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={navigateBack}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  const handleBeforeSubmit = (submitFn: () => void, formData: { name: string }) => {
    // 첫 번째 강아지가 아니면 바로 제출
    if (!isFirstPet) {
      submitFn();
      return;
    }

    // 첫 번째 강아지면 다이얼로그 먼저 표시
    overlay.open(({ isOpen, close }) => (
      <PetAddDialog
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            close();
          }
        }}
        onConfirm={() => {
          submitFn(); // 확인 누르면 실제 제출
        }}
        userNickName={user?.nickname}
        petNickName={formData.name}
      />
    ));
  };

  const handleSuccess = async () => {
    syncWebViewQuery.invalidate(['petList']);
    if (inviteToken) {
      // 초대 강아지 선택 화면은 pet/list와 별도의 연결 상태 query를 사용한다.
      // stack 전환 전에 갱신해 새 프로필이 즉시 목록에 보이게 한다.
      await queryClient.invalidateQueries({
        queryKey: [GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY],
        refetchType: 'all',
      });
      void replace({ pathname: route.invite.guardian.pet.root.replace('[token]', encodeURIComponent(inviteToken)) });
      return;
    }
    back?.();
  };

  const handleError = (error: unknown) => {
    console.error('펫 등록 실패:', error);
    toast({
      title: '일시적 오류로 요청을 완료하지 못했어요',
      nativeTitle: '일시적 오류로 요청을 완료하지 못했어요',
    });
  };

  const handleGoToPetList = () => {
    if (inviteToken) {
      void replace({ pathname: route.invite.guardian.pet.root.replace('[token]', encodeURIComponent(inviteToken)) });
      return;
    }

    void reset(route.mypage.root);
  };

  const handleViewPetProfile = (petId: string) => {
    void push({ pathname: route.mypage.pet.detail.root, query: { petId } });
  };

  return (
    <>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>강아지 프로필 추가하기</Header.Title>
      </Header>

      <PetProfileForm
        mode='add'
        onSuccess={handleSuccess}
        onError={handleError}
        onDirtyChange={setIsFormDirty}
        onBeforeSubmit={handleBeforeSubmit}
        onGoToPetList={handleGoToPetList}
        onViewPetProfile={handleViewPetProfile}
        submitButtonText='저장하기'
      />
    </>
  );
}
