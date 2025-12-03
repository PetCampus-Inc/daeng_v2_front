'use client';

import { useState } from 'react';
import { Header } from '@widgets/Header';
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
import { PetProfileForm, PetAddDialog } from '@features/dog-profile';
import { overlay } from 'overlay-kit';
import { useStackNavigation } from '@shared/lib/bridge';

export function MypagePetAddPage() {
  const { back } = useStackNavigation();
  const [isFormDirty, setIsFormDirty] = useState(false);

  // TODO: 실제 펫 목록 API로 체크
  const isFirstPet = false; // 임시로 true

  const handleBack = () => {
    // 폼에 변경사항이 없으면 바로 뒤로가기
    if (!isFormDirty) {
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

  const handleBeforeSubmit = (submitFn: () => void) => {
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
      />
    ));
  };

  const handleSuccess = () => {
    back?.();
  };

  const handleError = (error: unknown) => {
    console.error('펫 등록 실패:', error);
    // TODO: 에러 토스트 메시지 표시
  };

  return (
    <div className='flex h-screen flex-col'>
      <Header withSpacing={false}>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>강아지 프로필 추가하기</Header.Title>
      </Header>

      <div className='flex-1 overflow-y-auto'>
        <PetProfileForm
          mode='add'
          onSuccess={handleSuccess}
          onError={handleError}
          onDirtyChange={setIsFormDirty}
          onBeforeSubmit={handleBeforeSubmit}
          submitButtonText='저장하기'
        />
      </div>
    </div>
  );
}
