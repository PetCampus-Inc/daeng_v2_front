'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { DIARY_SEGMENT, type DiarySegment } from '@knockdog/ui';

import { DIARY_RECORD_EVENT, peekDiaryHomeReturn } from '@shared/lib/diary-write/diaryRecord';

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
  children: ReactNode;
}

function GuardianDiarySegmentProvider({
  dogName,
  petId = null,
  schoolId = null,
  defaultSegment = DIARY_SEGMENT.kindergarten,
  children,
}: GuardianDiarySegmentProviderProps) {
  const [segment, setSegment] = useState<DiarySegment>(defaultSegment);
  const selectSegment = useCallback((next: DiarySegment) => {
    setSegment(next);
  }, []);

  useEffect(() => {
    setSegment(defaultSegment);
  }, [defaultSegment, petId]);

  useEffect(() => {
    function openReturnedDiary() {
      if (peekDiaryHomeReturn()) setSegment(DIARY_SEGMENT.diary);
    }
    openReturnedDiary();
    window.addEventListener(DIARY_RECORD_EVENT, openReturnedDiary);
    window.addEventListener('focus', openReturnedDiary);
    document.addEventListener('visibilitychange', openReturnedDiary);
    return () => {
      window.removeEventListener(DIARY_RECORD_EVENT, openReturnedDiary);
      window.removeEventListener('focus', openReturnedDiary);
      document.removeEventListener('visibilitychange', openReturnedDiary);
    };
  }, []);

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
