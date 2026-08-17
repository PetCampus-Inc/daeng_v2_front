'use client';

import { useRef } from 'react';
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
import { PetProfileForm } from '@features/dog-profile';
import { GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY } from '@entities/guardian-invite';
import { usePetByIdQuery, type Pet } from '@entities/pet';
import { useStackNavigation } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';

export function MypagePetEditPage() {
  const { back } = useStackNavigation();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const petId = searchParams.get('petId') as string;
  const isDirtyRef = useRef(false);

  const { data: petResponse } = usePetByIdQuery(petId);

  const handleBack = () => {
    // 변경사항이 없으면 바로 뒤로가기
    if (!isDirtyRef.current) {
      back?.();
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
            <AlertDialogAction onClick={() => back?.()}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  const handleSuccess = async () => {
    // 초대 강아지 선택 화면은 pet/list와 별도의 연결 상태 query를 사용한다.
    // 뒤로 돌아가는 시점에 최신 프로필을 표시하도록 갱신한다.
    await queryClient.invalidateQueries({
      queryKey: [GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY],
      refetchType: 'all',
    });
    back?.();
  };

  const handleError = (error: unknown) => {
    console.error('펫 수정 실패:', error);
    // TODO: 에러 토스트 메시지 표시
  };

  return (
    <>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>강아지 프로필 수정하기</Header.Title>
      </Header>

      <PetProfileForm
        mode='edit'
        petId={petId}
        defaultValues={petResponse}
        onSuccess={handleSuccess}
        onError={handleError}
        onDirtyChange={(isDirty) => {
          isDirtyRef.current = isDirty;
        }}
        submitButtonText='수정하기'
      />
    </>
  );
}
