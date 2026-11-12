'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { DIARY_SEGMENT, type DiarySegment } from '@knockdog/ui';

import { peekDiaryHomeReturn } from '@shared/lib/diary-write/diaryRecord';

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

interface GuardianDiarySegmentProviderProps {
  dogName?: string;
  petId?: string | null;
  schoolId?: string | null;
  children: ReactNode;
}

function GuardianDiarySegmentProvider({
  dogName,
  petId = null,
  schoolId = null,
  children,
}: GuardianDiarySegmentProviderProps) {
  const [segment, setSegment] = useState<DiarySegment>(DIARY_SEGMENT.kindergarten);
  const selectSegment = useCallback((next: DiarySegment) => {
    setSegment(next);
  }, []);

  useEffect(() => {
    if (peekDiaryHomeReturn()) setSegment(DIARY_SEGMENT.diary);
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

export { GuardianDiarySegmentProvider, useGuardianDiarySegment };
