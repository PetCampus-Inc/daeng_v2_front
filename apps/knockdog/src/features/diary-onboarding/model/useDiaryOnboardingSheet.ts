'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DIARY_ONBOARDING_OPEN_DELAY_MS,
  hasSeenDiaryOnboarding,
  markDiaryOnboardingSeen,
} from '../lib/diaryOnboardingSeen';

function useDiaryOnboardingSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const openIfUnseen = useCallback(() => {
    if (hasSeenDiaryOnboarding() || timerRef.current) return;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (hasSeenDiaryOnboarding()) return;
      markDiaryOnboardingSeen();
      setIsOpen(true);
    }, DIARY_ONBOARDING_OPEN_DELAY_MS);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, openIfUnseen, close };
}

export { useDiaryOnboardingSheet };
