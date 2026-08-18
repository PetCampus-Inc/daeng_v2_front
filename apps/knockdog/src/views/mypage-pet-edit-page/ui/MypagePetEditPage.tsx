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
import { route } from '@shared/constants/route';
import { toast } from '@shared/ui/toast';

export function MypagePetEditPage() {
  const { back, pushForResult, reset } = useStackNavigation();
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
    toast({
      title: '일시적 오류로 요청을 완료하지 못했어요',
      nativeTitle: '일시적 오류로 요청을 완료하지 못했어요',
    });
  };

  const handleGoToPetList = () => {
    void reset(route.mypage.root);
  };

  const handleViewPetProfile = (duplicatePetId: string) =>
    pushForResult({ pathname: route.mypage.pet.detail.root, query: { petId: duplicatePetId } }, 600_000);

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
        onGoToPetList={handleGoToPetList}
        onViewPetProfile={handleViewPetProfile}
        submitButtonText='수정하기'
      />
    </>
  );
}
