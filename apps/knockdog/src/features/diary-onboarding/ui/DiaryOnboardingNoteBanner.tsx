'use client';

import { DiaryNoteBanner } from '@knockdog/ui';

import { hasSeenDiaryOnboarding } from '../lib/diaryOnboardingSeen';
import { useDiaryOnboardingSheet } from '../model/useDiaryOnboardingSheet';
import { DiaryOnboardingSheetPortal } from './DiaryOnboardingSheetPortal';

interface DiaryOnboardingNoteBannerProps {
  dogName?: string;
  onWrite?: () => void;
}

function DiaryOnboardingNoteBanner({ dogName, onWrite }: DiaryOnboardingNoteBannerProps) {
  const { isOpen, openIfUnseen, close } = useDiaryOnboardingSheet();

  function handleClick() {
    if (hasSeenDiaryOnboarding()) {
      onWrite?.();
      return;
    }
    openIfUnseen();
  }

  function handleStart() {
    close();
    onWrite?.();
  }

  return (
    <>
      <DiaryNoteBanner dogName={dogName} onClick={handleClick} />
      <DiaryOnboardingSheetPortal dogName={dogName} isOpen={isOpen} onClose={close} onStart={handleStart} />
    </>
  );
}

export { DiaryOnboardingNoteBanner };
