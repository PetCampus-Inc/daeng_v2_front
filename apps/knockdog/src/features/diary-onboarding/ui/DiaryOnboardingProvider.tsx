'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { useDiaryOnboardingSheet } from '../model/useDiaryOnboardingSheet';
import { DiaryOnboardingSheetPortal } from './DiaryOnboardingSheetPortal';

const DiaryOnboardingRequestContext = createContext<() => void>(() => {});

interface DiaryOnboardingProviderProps {
  dogName?: string;
  onStart?: () => void;
  children: ReactNode;
}

function DiaryOnboardingProvider({ dogName, onStart, children }: DiaryOnboardingProviderProps) {
  const { isOpen, openIfUnseen, close } = useDiaryOnboardingSheet();

  function handleStart() {
    close();
    onStart?.();
  }

  return (
    <DiaryOnboardingRequestContext.Provider value={openIfUnseen}>
      {children}
      <DiaryOnboardingSheetPortal dogName={dogName} isOpen={isOpen} onClose={close} onStart={handleStart} />
    </DiaryOnboardingRequestContext.Provider>
  );
}

function useRequestDiaryOnboarding() {
  return useContext(DiaryOnboardingRequestContext);
}

export { DiaryOnboardingProvider, useRequestDiaryOnboarding };
