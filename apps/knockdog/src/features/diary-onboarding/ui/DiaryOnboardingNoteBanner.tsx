'use client';

import { DiaryNoteBanner } from '@knockdog/ui';

import { useDiaryOnboardingSheet } from '../model/useDiaryOnboardingSheet';
import { DiaryOnboardingSheetPortal } from './DiaryOnboardingSheetPortal';

interface DiaryOnboardingNoteBannerProps {
  dogName?: string;
}

function DiaryOnboardingNoteBanner({ dogName }: DiaryOnboardingNoteBannerProps) {
  const { isOpen, openIfUnseen, close } = useDiaryOnboardingSheet();

  return (
    <>
      <DiaryNoteBanner dogName={dogName} onClick={openIfUnseen} />
      <DiaryOnboardingSheetPortal dogName={dogName} isOpen={isOpen} onClose={close} />
    </>
  );
}

export { DiaryOnboardingNoteBanner };
