'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from '@widgets/Header';
import { PetProfileForm, type PetFormData } from '@features/dog-profile';
import { GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY } from '@entities/guardian-invite';
import { usePetByIdQuery, type Pet } from '@entities/pet';
import { useStackNavigation, useNativeBackHandler } from '@shared/lib/bridge';
import { openUnsavedExitDialog } from '@shared/lib/openUnsavedExitDialog';
import { route } from '@shared/constants/route';
import { toast } from '@shared/ui/toast';

/** 중복 프로필 상세를 확인한 뒤 수정 화면으로 돌아올 때만 사용하는 일회성 작성값. */
const petEditViewDrafts = new Map<string, PetFormData>();

export function MypagePetEditPage() {
  const { back, pushForResult, reset } = useStackNavigation();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const petId = searchParams.get('petId') as string;
  const isDirtyRef = useRef(false);
  const isMountedRef = useRef(true);
  const [restoreValues, setRestoreValues] = useState<PetFormData | null>(
    () => petEditViewDrafts.get(petId) ?? null
  );

  const { data: petResponse } = usePetByIdQuery(petId);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setRestoreValues(petEditViewDrafts.get(petId) ?? null);
  }, [petId]);

  const handleBack = useCallback(() => {
    if (!isDirtyRef.current) {
      back?.();
      return;
    }

    openUnsavedExitDialog({
      title: '저장하지 않고 나갈까요?',
      description: '변경한 내용이 저장되지 않아요.',
      cancelLabel: '닫기',
      confirmLabel: '나가기',
      onConfirm: () => {
        back?.();
      },
    });
  }, [back]);

  useNativeBackHandler(handleBack);

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

  const handleViewPetProfile = async (duplicatePetId: string, formValues: PetFormData) => {
    petEditViewDrafts.set(petId, formValues);

    try {
      await pushForResult({ pathname: route.mypage.pet.detail.root, query: { petId: duplicatePetId } }, 600_000);
    } finally {
      // 수정 화면이 그대로 남아 있는 환경에서는 돌아온 시점에 draft를 전달한다.
      // 화면이 재생성된 환경에서는 다음 마운트의 초기 state가 동일한 draft를 읽는다.
      if (isMountedRef.current) {
        setRestoreValues(petEditViewDrafts.get(petId) ?? formValues);
      }
    }
  };

  const handleRestoreValuesApplied = () => {
    petEditViewDrafts.delete(petId);
    setRestoreValues(null);
  };

  return (
    <div className='bg-bg-0 flex min-h-0 flex-1 flex-col'>
      <Header className='shrink-0'>
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
        restoreValues={restoreValues}
        onRestoreValuesApplied={handleRestoreValuesApplied}
        submitButtonText='수정하기'
      />
    </div>
  );
}
