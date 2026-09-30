'use client';

import { overlay } from 'overlay-kit';
import { Icon } from '@knockdog/ui';

import { OwnerVerificationOnboardingSheet } from '@features/role-conversion';
import { ownerHomeContent } from '@views/owner-home-page/config/ownerHomeContent';

/** 원장 홈 운영 가이드 — 기존 온보딩 시트 재사용 (가이드 모드) */
function OwnerHomeOperationGuideBanner() {
  const { operationGuide } = ownerHomeContent;

  const handleOpen = () => {
    overlay.open(({ isOpen, close }) => (
      <OwnerVerificationOnboardingSheet isOpen={isOpen} close={close} purpose='guide' />
    ));
  };

  return (
    <button
      type='button'
      className='bg-fill-primary-50 flex w-full items-center justify-between gap-2 rounded-xl p-4 text-left'
      onClick={handleOpen}
    >
      <span className='flex min-w-0 flex-1 flex-col gap-1'>
        <span className='body1-bold text-text-accent flex items-center gap-1'>
          <Icon icon='KindergartenFill' className='size-5 shrink-0' />
          {operationGuide.title}
        </span>
        <span className='body2-regular text-text-primary'>{operationGuide.description}</span>
      </span>
      <Icon icon='ChevronRight' className='text-text-accent size-6 shrink-0' />
    </button>
  );
}

export { OwnerHomeOperationGuideBanner };
