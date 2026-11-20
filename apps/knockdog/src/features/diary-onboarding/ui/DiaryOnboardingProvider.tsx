'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { useDiaryOnboardingSheet } from '../model/useDiaryOnboardingSheet';
import { DiaryOnboardingSheetPortal } from './DiaryOnboardingSheetPortal';

const DiaryOnboardingRequestContext = createContext<() => void>(() => {});

interface DiaryOnboardingProviderProps {
  dogName?: string;
  petId?: string | null;
  onStart?: () => void;
  children: ReactNode;
}

function DiaryOnboardingProvider({ dogName, petId, onStart, children }: DiaryOnboardingProviderProps) {
  const { isOpen, openIfUnseen, close } = useDiaryOnboardingSheet(petId);

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
