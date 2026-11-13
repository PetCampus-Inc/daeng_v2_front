'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { postDiaryOnboardingShown, useGuardianDiaryDateQuery } from '@entities/guardian-diary';

import { formatDateKey } from '@shared/lib/calendar-date';

import {
  DIARY_ONBOARDING_OPEN_DELAY_MS,
  hasSeenDiaryOnboarding,
  markDiaryOnboardingSeen,
} from '../lib/diaryOnboardingSeen';

function useDiaryOnboardingSheet(petId?: string | null) {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waitRef = useRef(false);
  const shownCallbackRef = useRef<(() => void) | undefined>(undefined);
  const today = formatDateKey(new Date());
  const { data, isFetched } = useGuardianDiaryDateQuery({ petId, date: today });
  const isOnboardingShown = hasSeenDiaryOnboarding() || data?.onboardingShown === true;
  const isReady = !petId || isFetched;

  useEffect(() => {
    if (data?.onboardingShown) markDiaryOnboardingSeen();
  }, [data?.onboardingShown]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const scheduleOpen = useCallback(() => {
    if (timerRef.current) return;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (hasSeenDiaryOnboarding()) return;
      try {
        markDiaryOnboardingSeen();
      } finally {
        setIsOpen(true);
        void postDiaryOnboardingShown().catch((error: unknown) => {
          console.error(error);
        });
      }
    }, DIARY_ONBOARDING_OPEN_DELAY_MS);
  }, []);

  const openIfUnseen = useCallback((onAlreadyShown?: () => void) => {
    if (isOnboardingShown || timerRef.current) {
      if (isOnboardingShown) onAlreadyShown?.();
      return;
    }
    if (!isReady) {
      waitRef.current = true;
      shownCallbackRef.current = onAlreadyShown;
      return;
    }
    scheduleOpen();
  }, [isOnboardingShown, isReady, scheduleOpen]);

  useEffect(() => {
    if (!waitRef.current || !isReady) return;
    waitRef.current = false;
    const onAlreadyShown = shownCallbackRef.current;
    shownCallbackRef.current = undefined;
    if (hasSeenDiaryOnboarding() || data?.onboardingShown) {
      onAlreadyShown?.();
      return;
    }
    scheduleOpen();
  }, [data?.onboardingShown, isReady, scheduleOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, isOnboardingShown, openIfUnseen, close };
}

export { useDiaryOnboardingSheet };
