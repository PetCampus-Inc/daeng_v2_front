'use client';

import { Header } from '@widgets/Header';
import { useStackNavigation } from '@shared/lib/bridge';
import { PetDetailInfo } from '@features/dog-profile';
import { useSearchParams } from 'next/navigation';
import { usePetByIdQuery } from '@entities/pet';
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

export function MypagePetDetailPage() {
  const { push } = useStackNavigation();
  const searchParams = useSearchParams();
  const petId = searchParams.get('petId') as string;

  const { data: petResponse } = usePetByIdQuery(petId);

  const handlePetEdit = () => {
    push({ pathname: '/mypage/pet-edit', query: { petId } });
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
                // TODO: 실제 삭제 API 호출 로직 추가
                console.log('펫 삭제 확인');
                close();
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
    <div className='flex h-screen flex-col'>
      <Header withSpacing={false}>
        <Header.LeftSection>
          <Header.BackButton />
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
    </div>
  );
}
