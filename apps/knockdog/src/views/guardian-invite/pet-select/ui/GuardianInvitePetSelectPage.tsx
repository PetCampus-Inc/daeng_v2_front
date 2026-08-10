'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ActionButton, Avatar, AvatarFallback, Checkbox, Icon, ProgressBar } from '@knockdog/ui';

import { Header } from '@widgets/Header';
import { useStackNavigation } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';

/** 보호자 초대 2단계: 가입 신청할 강아지 선택 */
function GuardianInvitePetSelectPage() {
  const { token } = useParams<{ token: string }>();
  const { push } = useStackNavigation();
  const profileCount = 4;
  const canAddPet = profileCount < 5;
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>(['ppoppi-2']);

  const togglePet = (petId: string, checked: boolean) => {
    setSelectedPetIds((currentIds) =>
      checked ? [...currentIds, petId] : currentIds.filter((selectedPetId) => selectedPetId !== petId)
    );
  };
  const isPpoppi1Selected = selectedPetIds.includes('ppoppi-1');
  const isPpoppi2Selected = selectedPetIds.includes('ppoppi-2');

  const handleNext = () => {
    if (selectedPetIds.length === 0) return;

    void push({ pathname: `/invite/guardian/${encodeURIComponent(token)}/consent` });
  };

  return (
    <SafeArea edges={['bottom']} className='bg-bg-0 flex h-dvh flex-col' data-invite-token={token}>
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
          <div
            className={`radius-r3 relative flex h-[84px] items-center gap-x2 border p-x4 ${
              isPpoppi1Selected ? 'border-line-accent bg-fill-primary-50' : 'border-line-200 bg-bg-0'
            }`}
          >
            <button
              type='button'
              aria-label={`뽀삐 ${isPpoppi1Selected ? '선택 해제' : '선택'}`}
              aria-pressed={isPpoppi1Selected}
              onClick={() => togglePet('ppoppi-1', !isPpoppi1Selected)}
              className='radius-r3 absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-accent'
            />
            <div className='pointer-events-none relative z-10 flex min-w-0 flex-1 items-center gap-x2'>
              <Avatar className='size-x13 border-line-100 bg-fill-secondary-50 border-2'>
                <AvatarFallback className='bg-fill-secondary-50'>
                  <Icon icon='Paw' className='text-fill-secondary-400 size-6' />
                </AvatarFallback>
              </Avatar>
              <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <span className={`body1-bold flex items-center gap-x1 ${isPpoppi1Selected ? 'text-text-accent' : 'text-text-primary'}`}>
                  뽀삐
                  <Icon icon='Female' className='size-4' />
                </span>
                <span className={`label-medium ${isPpoppi1Selected ? 'text-text-accent' : 'text-text-primary'}`}>시베리안 허스키</span>
              </span>
            </div>
            <button data-profile-view type='button' className={`pointer-events-auto radius-r2 relative z-10 caption2-semibold h-[30px] shrink-0 cursor-pointer px-x3 ${isPpoppi1Selected ? 'bg-bg-0 text-text-primary' : 'bg-fill-secondary-100 text-text-secondary'}`}>
              프로필 보기
            </button>
            <Checkbox
              size='sm'
              className='pointer-events-auto relative z-10 cursor-pointer'
              checked={isPpoppi1Selected}
              onCheckedChange={(checked) => togglePet('ppoppi-1', Boolean(checked))}
            />
          </div>
          <div
            className={`radius-r3 relative flex h-[84px] items-center gap-x2 border p-x4 ${
              isPpoppi2Selected ? 'border-line-accent bg-fill-primary-50' : 'border-line-200 bg-bg-0'
            }`}
          >
            <button
              type='button'
              aria-label={`뽀삐 ${isPpoppi2Selected ? '선택 해제' : '선택'}`}
              aria-pressed={isPpoppi2Selected}
              onClick={() => togglePet('ppoppi-2', !isPpoppi2Selected)}
              className='radius-r3 absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-accent'
            />
            <div className='pointer-events-none relative z-10 flex min-w-0 flex-1 items-center gap-x2'>
              <Avatar className='size-x13 border-line-100 bg-fill-secondary-50 border-2'>
                <AvatarFallback className='bg-fill-secondary-50'>
                  <Icon icon='Paw' className='text-fill-secondary-400 size-6' />
                </AvatarFallback>
              </Avatar>
              <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <span className={`body1-bold flex items-center gap-x1 ${isPpoppi2Selected ? 'text-text-accent' : 'text-text-primary'}`}>
                  뽀삐
                  <Icon icon='Female' className='size-4' />
                </span>
                <span className={`label-medium ${isPpoppi2Selected ? 'text-text-accent' : 'text-text-primary'}`}>시베리안 허스키</span>
              </span>
            </div>
            <button data-profile-view type='button' className={`pointer-events-auto radius-r2 relative z-10 caption2-semibold h-[30px] shrink-0 cursor-pointer px-x3 ${isPpoppi2Selected ? 'bg-bg-0 text-text-primary' : 'bg-fill-secondary-100 text-text-secondary'}`}>
              프로필 보기
            </button>
            <Checkbox
              size='sm'
              className='pointer-events-auto relative z-10 cursor-pointer'
              checked={isPpoppi2Selected}
              onCheckedChange={(checked) => togglePet('ppoppi-2', Boolean(checked))}
            />
          </div>
          <div
            aria-disabled='true'
            className='border-line-200 radius-r3 flex h-[84px] items-center gap-x2 border bg-fill-secondary-100 p-x4'
          >
            <Avatar className='size-x13 border-line-100 bg-fill-secondary-50 border-2'>
              <AvatarFallback className='bg-fill-secondary-50'>
                <Icon icon='Paw' className='text-fill-secondary-400 size-6' />
              </AvatarFallback>
            </Avatar>
            <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
              <span className='flex items-center gap-x1'>
                <span className='body1-bold text-fill-secondary-400 flex items-center gap-x1'>
                  뽀삐
                  <Icon icon='Male' className='size-4' />
                </span>
                <span className='caption1-semibold inline-flex h-[26px] items-center justify-center rounded-full bg-fill-secondary-200 px-x2 text-fill-secondary-400'>
                  승인 대기
                </span>
              </span>
              <span className='label-medium text-fill-secondary-400'>시베리안 허스키</span>
            </div>
            <Checkbox size='sm' disabled />
          </div>
          <div
            aria-disabled='true'
            className='border-line-200 radius-r3 flex h-[84px] items-center gap-x2 border bg-fill-secondary-100 p-x4'
          >
            <Avatar className='size-x13 border-line-100 bg-fill-secondary-50 border-2'>
              <AvatarFallback className='bg-fill-secondary-50'>
                <Icon icon='Paw' className='text-fill-secondary-400 size-6' />
              </AvatarFallback>
            </Avatar>
            <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
              <span className='flex items-center gap-x1'>
                <span className='body1-bold text-fill-secondary-400 flex items-center gap-x1'>
                  뽀삐
                  <Icon icon='Female' className='size-4' />
                </span>
                <span className='caption1-semibold inline-flex h-[26px] items-center justify-center rounded-full bg-fill-secondary-200 px-x2 text-fill-secondary-400'>
                  연결 완료
                </span>
              </span>
              <span className='label-medium text-fill-secondary-400'>시베리안 허스키</span>
            </div>
            <Checkbox size='sm' disabled />
          </div>
          </div>
          {canAddPet ? (
            <button
              type='button'
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
