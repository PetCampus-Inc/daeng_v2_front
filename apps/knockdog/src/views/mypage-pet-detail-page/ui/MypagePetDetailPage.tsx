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
import { GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY } from '@entities/guardian-invite';
import { usePetByIdQuery, usePetRemoveMutation } from '@entities/pet';
import { useNavigationResult, useStackNavigation } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

export function MypagePetDetailPage() {
  const { push, back } = useStackNavigation();
  const navigationResult = useNavigationResult<void>();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const petId = searchParams.get('petId') as string;
  const { mutate: removePetMutate } = usePetRemoveMutation();
  const { data: petResponse } = usePetByIdQuery(petId);

  const handlePetEdit = () => {
    push({ pathname: '/mypage/pet-edit', query: { petId } });
  };

  const handleBack = () => {
    try {
      navigationResult.send();
    } catch {
      // pushForResult로 열리지 않은 일반 상세 화면에서는 결과를 보낼 대상이 없다.
    }
    void back();
  };

  const handleDeleteClick = () => {
    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말로 삭제하시겠어요?</AlertDialogTitle>
            <AlertDialogDescription>삭제한 강아지 데이터는 복구할 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>아니오</AlertDialogCancel>
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
                });
              }}
            >
              예
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  return (
    <SafeArea edges={['bottom']} className='flex h-screen flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>강아지 프로필</Header.Title>

        <Header.RightSection>
          <button className='label-semibold text-text-secondary px-2 py-1' onClick={handleDeleteClick}>
            삭제
          </button>
        </Header.RightSection>
      </Header>

      <PetDetailInfo pet={petResponse} />

      <div className='mb-10 flex items-center justify-center px-4 py-4'>
        <ActionButton size='small' variant='tertiaryFill' className='w-[128px]' onClick={handlePetEdit}>
          <Icon icon='Edit' className='size-5' />
          정보 수정하기
        </ActionButton>
      </div>
    </SafeArea>
  );
}
