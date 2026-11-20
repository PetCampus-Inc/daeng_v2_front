'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { DIARY_SEGMENT, type DiarySegment } from '@knockdog/ui';

import { DIARY_RECORD_EVENT, peekDiaryHomeReturn, saveDiaryHomeReturn } from '@shared/lib/diary-write/diaryRecord';

const DIARY_SEGMENT_KEY = 'guardian-diary-segment';

interface GuardianDiarySegmentContextValue {
  segment: DiarySegment;
  dogName?: string;
  petId?: string | null;
  schoolId?: string | null;
  selectSegment: (segment: DiarySegment) => void;
}

const GuardianDiarySegmentContext = createContext<GuardianDiarySegmentContextValue>({
  segment: DIARY_SEGMENT.kindergarten,
  selectSegment: () => {},
});

function resolveDefaultDiarySegment(isUnlinkedDog: boolean): DiarySegment {
  return isUnlinkedDog ? DIARY_SEGMENT.diary : DIARY_SEGMENT.kindergarten;
}

interface GuardianDiarySegmentProviderProps {
  dogName?: string;
  petId?: string | null;
  schoolId?: string | null;
  defaultSegment?: DiarySegment;
  diaryReturnDate?: string | null;
  children: ReactNode;
}

function GuardianDiarySegmentProvider({
  dogName,
  petId = null,
  schoolId = null,
  defaultSegment = DIARY_SEGMENT.kindergarten,
  diaryReturnDate,
  children,
}: GuardianDiarySegmentProviderProps) {
  const [segment, setSegment] = useState<DiarySegment>(defaultSegment);
  const storageKey = `${DIARY_SEGMENT_KEY}:${petId ?? ''}`;
  const selectSegment = useCallback((next: DiarySegment) => {
    setSegment(next);
    window.sessionStorage.setItem(storageKey, next);
  }, [storageKey]);

  useEffect(() => {
    const savedSegment = window.sessionStorage.getItem(storageKey);
    setSegment(
      savedSegment === DIARY_SEGMENT.diary || savedSegment === DIARY_SEGMENT.kindergarten
        ? savedSegment
        : defaultSegment
    );
  }, [defaultSegment, storageKey]);

  useEffect(() => {
    const applyReturnDate = () => {
      const url = new URL(window.location.href);
      const dateKey = url.searchParams.get('diaryReturnDate');
      if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;

      url.searchParams.delete('diaryReturnDate');
      window.history.replaceState(window.history.state, '', url);
      selectSegment(DIARY_SEGMENT.diary);
      saveDiaryHomeReturn(dateKey);
    };

    applyReturnDate();
    window.addEventListener('popstate', applyReturnDate);
    return () => window.removeEventListener('popstate', applyReturnDate);
  }, [diaryReturnDate, selectSegment]);

  useEffect(() => {
    function openReturnedDiary() {
      if (peekDiaryHomeReturn()) selectSegment(DIARY_SEGMENT.diary);
    }
    const restoreNativeDiary = () => {
      const dateKey = peekDiaryHomeReturn();
      if (!dateKey) return;

      selectSegment(DIARY_SEGMENT.diary);
      saveDiaryHomeReturn(dateKey);
    };

    openReturnedDiary();
    window.addEventListener(DIARY_RECORD_EVENT, openReturnedDiary);
    window.addEventListener('knockdog:native-tab-focus', restoreNativeDiary);
    window.addEventListener('focus', openReturnedDiary);
    document.addEventListener('visibilitychange', openReturnedDiary);
    return () => {
      window.removeEventListener(DIARY_RECORD_EVENT, openReturnedDiary);
      window.removeEventListener('knockdog:native-tab-focus', restoreNativeDiary);
      window.removeEventListener('focus', openReturnedDiary);
      document.removeEventListener('visibilitychange', openReturnedDiary);
    };
  }, [selectSegment]);

  return (
    <GuardianDiarySegmentContext.Provider value={{ segment, dogName, petId, schoolId, selectSegment }}>
      {children}
    </GuardianDiarySegmentContext.Provider>
  );
}

function useGuardianDiarySegment() {
  return useContext(GuardianDiarySegmentContext);
}

export { GuardianDiarySegmentProvider, resolveDefaultDiarySegment, useGuardianDiarySegment };
