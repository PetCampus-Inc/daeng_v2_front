'use client';

import { useSearchParams } from 'next/navigation';
import {
  ActionButton,
  Icon,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@knockdog/ui';
import { overlay } from 'overlay-kit';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from '@widgets/Header';
import { PetDetailInfo } from '@features/dog-profile';
import {
  GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY,
  useGuardianPetConnectionStatusesQuery,
} from '@entities/guardian-invite';
import { usePetByIdQuery, usePetRemoveMutation } from '@entities/pet';
import { useUserStore } from '@entities/user';
import { getCurrentTxId, useNavigationResult, useStackNavigation } from '@shared/lib/bridge';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';
import { toast } from '@shared/ui/toast';

export function MypagePetDetailPage() {
  const { push, back } = useStackNavigation();
  const navigationResult = useNavigationResult<void>();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const petId = searchParams.get('petId') as string;
  const userId = useUserStore((state) => state.user?.userId);
  const { mutate: removePetMutate } = usePetRemoveMutation();
  const { data: petResponse } = usePetByIdQuery(petId);
  const petConnectionStatusesQuery = useGuardianPetConnectionStatusesQuery({ userId });
  const petConnection = petConnectionStatusesQuery.data?.data?.pets?.find((pet) => pet.petId === Number(petId));
  const isPetConnected = petConnection?.connectionStatus != null;
  const canDeletePet = petConnectionStatusesQuery.isSuccess && !isPetConnected;

  const handlePetEdit = () => {
    push({ pathname: '/mypage/pet-edit', query: { petId } });
  };

  const handleBack = () => {
    if (getCurrentTxId()) {
      navigationResult.send();
    }
    back().catch(() => undefined);
  };

  const handleDeleteClick = () => {
    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>강아지 프로필을 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>삭제한 강아지 데이터는 복구할 수 없어요.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                removePetMutate(petId, {
                  onSuccess: async () => {
                    // 초대 신청의 강아지 선택 화면은 pet/list가 아닌 별도 연결 상태 query를 사용한다.
                    // stack 화면이 유지된 채 돌아와도 최신 목록을 보여주도록 먼저 갱신한다.
                    await queryClient.invalidateQueries({
                      queryKey: [GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY],
                      refetchType: 'all',
                    });
                    syncWebViewQuery.refetch(['petList']);
                    handleBack();
                  },
                  onError: (error) => {
                    console.error('펫 삭제 실패:', error);
                    toast({
                      title: '일시적 오류로 요청을 완료하지 못했어요',
                      nativeTitle: '일시적 오류로 요청을 완료하지 못했어요',
                    });
                  },
                });
              }}
            >
              삭제하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>강아지 프로필</Header.Title>

        {canDeletePet && (
          <Header.RightSection>
            <button className='label-semibold text-text-secondary px-2 py-1' onClick={handleDeleteClick}>
              삭제
            </button>
          </Header.RightSection>
        )}
      </Header>

      <PetDetailInfo pet={petResponse}>
        <div className='flex items-center justify-center pt-5'>
          <ActionButton size='medium' variant='tertiaryFill' className='w-[132px]' onClick={handlePetEdit}>
            <Icon icon='Edit' className='size-5' />
            정보 수정하기
          </ActionButton>
        </div>
      </PetDetailInfo>
    </div>
  );
}
