'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ActionButton, Avatar, AvatarFallback, Checkbox, Icon, ProgressBar } from '@knockdog/ui';

import { Header } from '@widgets/Header';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';

type PetConnectionStatus = 'selectable' | 'pending' | 'connected';

interface InvitePet {
  id: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  status: PetConnectionStatus;
}

const INVITE_PETS: readonly InvitePet[] = [
  { id: 'ppoppi-1', name: '뽀삐', breed: '시베리안 허스키', gender: 'female', status: 'selectable' },
  { id: 'ppoppi-2', name: '뽀삐', breed: '시베리안 허스키', gender: 'female', status: 'selectable' },
  { id: 'ppoppi-3', name: '뽀삐', breed: '시베리안 허스키', gender: 'male', status: 'pending' },
  { id: 'ppoppi-4', name: '뽀삐', breed: '시베리안 허스키', gender: 'female', status: 'connected' },
];

const STATUS_LABEL: Partial<Record<PetConnectionStatus, string>> = {
  pending: '승인 대기',
  connected: '연결 완료',
};

interface PetSelectCardProps {
  pet: InvitePet;
  selected: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function PetSelectCard({ pet, selected, onCheckedChange }: PetSelectCardProps) {
  const isSelectable = pet.status === 'selectable';
  const statusLabel = STATUS_LABEL[pet.status];
  const checkboxId = `guardian-invite-pet-${pet.id}`;
  const GenderIcon = pet.gender === 'male' ? 'Male' : 'Female';
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
              <Icon icon={GenderIcon} className='size-4' />
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
        className='pointer-events-auto relative z-10 cursor-pointer'
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
  const { push } = useStackNavigation();
  const profileCount = INVITE_PETS.length;
  const canAddPet = profileCount < 5;
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>(['ppoppi-2']);

  const togglePet = (petId: string, checked: boolean) => {
    setSelectedPetIds((currentIds) =>
      checked ? [...currentIds, petId] : currentIds.filter((selectedPetId) => selectedPetId !== petId)
    );
  };

  const handleNext = () => {
    if (selectedPetIds.length === 0) return;

    void push({ pathname: route.invite.guardian.consent.root.replace('[token]', encodeURIComponent(token)) });
  };

  const handleAddPet = () => {
    void push({ pathname: route.mypage.pet.add.root, query: { inviteToken: token } });
  };

  return (
    <SafeArea edges={['bottom']} className='bg-bg-0 flex h-dvh flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
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
            {INVITE_PETS.map((pet) => (
              <PetSelectCard
                key={pet.id}
                pet={pet}
                selected={selectedPetIds.includes(pet.id)}
                onCheckedChange={(checked) => togglePet(pet.id, checked)}
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
        <ActionButton type='button' size='large' disabled={selectedPetIds.length === 0} onClick={handleNext}>
          다음
        </ActionButton>
      </div>
    </SafeArea>
  );
}

export { GuardianInvitePetSelectPage };
