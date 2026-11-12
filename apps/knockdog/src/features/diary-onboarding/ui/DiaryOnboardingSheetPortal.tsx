'use client';

import { BottomSheet, DIARY_ONBOARDING_SAMPLE_CARDS, DiaryOnboardingSheet } from '@knockdog/ui';

import { DIARY_ONBOARDING_SAMPLE_IMAGE } from '../config/diaryOnboardingSamples';

const sampleCards = DIARY_ONBOARDING_SAMPLE_CARDS.map((card) => ({
  ...card,
  imageSrc: DIARY_ONBOARDING_SAMPLE_IMAGE[card.id],
}));

interface DiaryOnboardingSheetPortalProps {
  dogName?: string;
  isOpen: boolean;
  onClose: () => void;
}

function DiaryOnboardingSheetPortal({ dogName, isOpen, onClose }: DiaryOnboardingSheetPortalProps) {
  return (
    <BottomSheet.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <BottomSheet.Overlay />
      <BottomSheet.Body className='bg-transparent shadow-none'>
        <BottomSheet.Title className='sr-only'>일기장 온보딩</BottomSheet.Title>
        <DiaryOnboardingSheet dogName={dogName} cards={sampleCards} onStart={onClose} onSkip={onClose} />
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { DiaryOnboardingSheetPortal };
