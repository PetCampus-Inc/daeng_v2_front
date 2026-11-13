'use client';

import { DiaryNoteBanner } from '@knockdog/ui';

import { useDiaryOnboardingSheet } from '../model/useDiaryOnboardingSheet';
import { DiaryOnboardingSheetPortal } from './DiaryOnboardingSheetPortal';

interface DiaryOnboardingNoteBannerProps {
  dogName?: string;
  petId?: string | null;
  onWrite?: () => void;
}

function DiaryOnboardingNoteBanner({ dogName, petId, onWrite }: DiaryOnboardingNoteBannerProps) {
  const { isOpen, openIfUnseen, close } = useDiaryOnboardingSheet(petId);

  function handleClick() {
    openIfUnseen(() => onWrite?.());
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
