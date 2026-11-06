'use client';

import Image from 'next/image';

import { ActionButton, IconButton } from '@knockdog/ui';

import { BottomSheet } from '@shared/ui/bottom-sheet';

interface KindergartenBookmarkOnboardingSheetProps {
  isOpen: boolean;
  close: () => void;
}

/** 유치원 보관 기능을 처음 사용했을 때만 노출하는 비교 기능 안내. */
function KindergartenBookmarkOnboardingSheet({ isOpen, close }: KindergartenBookmarkOnboardingSheetProps) {
  return (
    <BottomSheet.Root open={isOpen} onOpenChange={(open) => !open && close()} dismissible={false}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal overflow-hidden p-0'>
        <BottomSheet.Title className='sr-only'>저장한 유치원 비교 안내</BottomSheet.Title>
        <IconButton
          icon='Close'
          aria-label='닫기'
          className='absolute top-4 right-4 z-10 size-6'
          iconClassName='size-6 text-text-primary-inverse'
          onClick={close}
        />

        <Image
          src='/images/img_kindergarten_bookmark_onboarding.webp'
          alt='저장한 유치원 비교 결과 예시'
          width={1560}
          height={1200}
          sizes='(max-width: 480px) 100vw, 480px'
          draggable={false}
          className='pointer-events-none h-[300px] w-full select-none object-cover'
          priority
        />

        <div className='flex h-24 shrink-0 flex-col items-center justify-center gap-1 bg-white text-center'>
          <h2 className='h2-extrabold text-text-primary'>유치원이 보관되었어요</h2>
          <p className='body1-medium text-text-secondary'>보관함에서 유치원을 비교할 수 있어요.</p>
        </div>

        <BottomSheet.Footer className='flex h-16 shrink-0 bg-white px-4 py-2'>
          <ActionButton variant='secondaryLine' size='medium' className='w-full' onClick={close}>
            유치원 더 알아보기
          </ActionButton>
        </BottomSheet.Footer>

        <div
          aria-hidden
          className='h-[max(34px,var(--safe-area-inset-bottom,0px),env(safe-area-inset-bottom,0px))] shrink-0 bg-white'
        />
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { KindergartenBookmarkOnboardingSheet };
