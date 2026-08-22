'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ActionButton, Avatar, AvatarFallback, AvatarImage, Checkbox, Icon, ProgressBar } from '@knockdog/ui';

import { Header } from '@widgets/Header';
import {
  guardianPetConnectionStatusesQueryKey,
  type GuardianPetConnection,
  useGuardianPetConnectionStatusesQuery,
} from '@entities/guardian-invite';
import { useUserStore } from '@entities/user';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

const STATUS_LABEL = {
  PENDING: '승인 대기',
  ACTIVE: '연결 완료',
};

interface PetSelectCardProps {
  pet: GuardianPetConnection;
  selected: boolean;
  onCheckedChange: (checked: boolean) => void;
  onProfileView: () => void;
}

function PetSelectCard({ pet, selected, onCheckedChange, onProfileView }: PetSelectCardProps) {
  const isSelectable = pet.connectionStatus == null;
  const statusLabel = pet.connectionStatus ? STATUS_LABEL[pet.connectionStatus] : undefined;
  const checkboxId = `guardian-invite-pet-${pet.petId}`;
  const genderIcon = pet.gender === 'MALE' ? 'Male' : pet.gender === 'FEMALE' ? 'Female' : null;
  const cardClassName = isSelectable && selected ? 'border-line-accent bg-fill-primary-50' : 'border-line-200 bg-bg-0';

  return (
    <div
      aria-disabled={!isSelectable || undefined}
      className={`radius-r3 relative flex h-[84px] items-center gap-x2 border p-x4 ${
        isSelectable ? cardClassName : 'border-line-200 bg-fill-secondary-100'
      }`}
    >
      {isSelectable ? (
        <button
          type='button'
          aria-label={`${pet.name} ${selected ? '선택 해제' : '선택'}`}
          aria-pressed={selected}
          onClick={() => onCheckedChange(!selected)}
          className='radius-r3 absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-accent'
        />
      ) : null}
      <div className='pointer-events-none relative z-10 flex min-w-0 flex-1 items-center gap-x2'>
        <Avatar className='size-x13 border-line-100 bg-fill-secondary-50 border-2'>
          {pet.profileImage ? <AvatarImage src={pet.profileImage} alt={`${pet.name} 프로필 이미지`} className='object-cover' /> : null}
          <AvatarFallback className='bg-fill-secondary-50'>
            <Icon icon='Paw' className={`size-6 ${isSelectable ? 'text-primitive-neutral-300' : 'text-fill-secondary-400'}`} />
          </AvatarFallback>
        </Avatar>
        <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
          <span className='flex items-center gap-x1'>
            <span
              className={`body1-bold flex items-center gap-x1 ${
                isSelectable ? (selected ? 'text-text-accent' : 'text-text-primary') : 'text-fill-secondary-400'
              }`}
            >
              {pet.name}
              {genderIcon ? <Icon icon={genderIcon} className='size-4' /> : null}
            </span>
            {statusLabel ? (
              <span className='caption1-semibold inline-flex h-[26px] items-center justify-center rounded-full bg-fill-secondary-200 px-x2 text-fill-secondary-400'>
                {statusLabel}
              </span>
            ) : null}
          </span>
          <span
            className={`label-medium ${
              isSelectable ? (selected ? 'text-text-accent' : 'text-text-primary') : 'text-fill-secondary-400'
            }`}
          >
            {pet.breed}
          </span>
        </span>
      </div>
      {isSelectable ? (
        <button
          data-profile-view
          type='button'
          onClick={onProfileView}
          className={`pointer-events-auto radius-r2 relative z-10 caption2-semibold h-[30px] shrink-0 cursor-pointer px-x3 ${
            selected ? 'bg-bg-0 text-text-primary' : 'bg-fill-secondary-100 text-text-secondary'
          }`}
        >
          프로필 보기
        </button>
      ) : null}
      <Checkbox
        id={checkboxId}
        size='sm'
        aria-label={`${pet.name} 선택`}
        className={`pointer-events-auto relative z-10 ${isSelectable ? 'cursor-pointer' : 'cursor-default'}`}
        disabled={!isSelectable}
        checked={isSelectable ? selected : undefined}
        onCheckedChange={isSelectable ? (checked) => onCheckedChange(Boolean(checked)) : undefined}
      />
    </div>
  );
}

/** 보호자 초대 2단계: 가입 신청할 강아지 선택 */
function GuardianInvitePetSelectPage() {
  const { token } = useParams<{ token: string }>();
  const { push, replace } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const queryClient = useQueryClient();
  const petConnectionStatusesQuery = useGuardianPetConnectionStatusesQuery({ userId });
  const pets = petConnectionStatusesQuery.data?.data?.pets;
  const displayedPets = pets ?? [];
  const profileCount = petConnectionStatusesQuery.data?.data?.totalProfileCount ?? 0;
  const canAddPet = profileCount < 5;
  const [selectedPetIds, setSelectedPetIds] = useState<number[]>([]);

  // 강아지 추가/수정 화면은 별도 Stack WebView라 그쪽의 invalidate가 이 화면 캐시에 전달되지 않음 → 복귀 시 재조회
  useEffect(() => {
    const handleRefresh = () => {
      if (document.visibilityState === 'hidden') return;
      queryClient.refetchQueries({ queryKey: guardianPetConnectionStatusesQueryKey(userId) });
    };

    window.addEventListener('pageshow', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);

    return () => {
      window.removeEventListener('pageshow', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, [queryClient, userId]);

  const selectablePetIds = new Set(
    displayedPets.filter((pet) => pet.connectionStatus == null).map((pet) => pet.petId)
  );
  const selectableSelectedPetIds = selectedPetIds.filter((petId) => selectablePetIds.has(petId));

  const togglePet = (petId: number, checked: boolean) => {
    setSelectedPetIds((currentIds) =>
      checked ? [...currentIds, petId] : currentIds.filter((selectedPetId) => selectedPetId !== petId)
    );
  };

  const handleNext = () => {
    if (selectableSelectedPetIds.length === 0) return;

    const selectedPets = displayedPets.filter((pet) => selectableSelectedPetIds.includes(pet.petId));
    void push({
      pathname: route.invite.guardian.consent.root.replace('[token]', encodeURIComponent(token)),
      query: { petIds: selectedPets.map((pet) => pet.petId).join(',') },
      params: {
        selectedPets: selectedPets.map(({ petId, name }) => ({ petId, name })),
      },
    });
  };

  const handleAddPet = () => {
    void push({ pathname: route.mypage.pet.add.root, query: { inviteToken: token } });
  };

  const handleBack = () => {
    void replace({ pathname: route.invite.guardian.root.replace('[token]', encodeURIComponent(token)) });
  };

  const handleProfileView = (petId: number) => {
    void push({ pathname: route.mypage.pet.detail.root, query: { petId: String(petId) } });
  };

  return (
    <div className='bg-bg-0 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>강아지 선택</Header.Title>
      </Header>

      <div className='shrink-0 px-x4 py-x2'>
        <ProgressBar totalSteps={3} value={2} className='h-1.5' />
      </div>

      <main className='min-h-0 flex-1 overflow-y-auto'>
        <section className='flex flex-col justify-center gap-1 px-x4 py-x5'>
          <h1 className='h2-extrabold text-text-primary'>
            유치원에 등록할 강아지를
            <br />
            선택해 주세요
          </h1>
          <p className='body1-medium text-text-primary'>
            이미 연결됐거나 승인 대기 중인 강아지를 제외하고,
            <br />
            여러 마리를 함께 신청할 수 있어요.
          </p>
        </section>

        <section className='flex flex-col gap-y-4 px-x4 py-x4'>
          <div className='flex flex-col gap-y-3'>
            <div className='flex h-5 items-center gap-x1'>
              <span className='body2-bold text-text-primary'>현재 프로필 개수</span>
              <span className='body2-bold text-text-accent'>{profileCount}/5</span>
            </div>
            {displayedPets.map((pet) => (
              <PetSelectCard
                key={pet.petId}
                pet={pet}
                selected={selectableSelectedPetIds.includes(pet.petId)}
                onCheckedChange={(checked) => togglePet(pet.petId, checked)}
                onProfileView={() => handleProfileView(pet.petId)}
              />
            ))}
          </div>
          {canAddPet ? (
            <button
              type='button'
              onClick={handleAddPet}
              className='body2-bold radius-r2 border-line-400 text-text-secondary flex h-x12 cursor-pointer items-center justify-center gap-x2 border px-x4 py-x3_5'
            >
              <Icon icon='Plus' className='size-5' />
              강아지 추가
            </button>
          ) : null}
        </section>
      </main>

      <div className='bg-bg-0 px-x4 py-x5'>
        <ActionButton
          type='button'
          size='large'
          disabled={selectableSelectedPetIds.length === 0 || petConnectionStatusesQuery.isLoading || petConnectionStatusesQuery.isError}
          onClick={handleNext}
        >
          다음
        </ActionButton>
      </div>
    </div>
  );
}

export { GuardianInvitePetSelectPage };
