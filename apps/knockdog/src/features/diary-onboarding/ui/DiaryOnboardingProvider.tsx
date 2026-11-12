'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { useDiaryOnboardingSheet } from '../model/useDiaryOnboardingSheet';
import { DiaryOnboardingSheetPortal } from './DiaryOnboardingSheetPortal';

const DiaryOnboardingRequestContext = createContext<() => void>(() => {});

interface DiaryOnboardingProviderProps {
  dogName?: string;
  children: ReactNode;
}

function DiaryOnboardingProvider({ dogName, children }: DiaryOnboardingProviderProps) {
  const { isOpen, openIfUnseen, close } = useDiaryOnboardingSheet();

  return (
    <DiaryOnboardingRequestContext.Provider value={openIfUnseen}>
      {children}
      <DiaryOnboardingSheetPortal dogName={dogName} isOpen={isOpen} onClose={close} />
    </DiaryOnboardingRequestContext.Provider>
  );
}

function useRequestDiaryOnboarding() {
  return useContext(DiaryOnboardingRequestContext);
}

export { DiaryOnboardingProvider, useRequestDiaryOnboarding };
