'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { DIARY_SEGMENT, type DiarySegment } from '@knockdog/ui';

interface GuardianDiarySegmentContextValue {
  segment: DiarySegment;
  dogName?: string;
  petId?: string | null;
  selectSegment: (segment: DiarySegment) => void;
}

const GuardianDiarySegmentContext = createContext<GuardianDiarySegmentContextValue>({
  segment: DIARY_SEGMENT.kindergarten,
  selectSegment: () => {},
});

interface GuardianDiarySegmentProviderProps {
  dogName?: string;
  petId?: string | null;
  children: ReactNode;
}

function GuardianDiarySegmentProvider({ dogName, petId = null, children }: GuardianDiarySegmentProviderProps) {
  const [segment, setSegment] = useState<DiarySegment>(DIARY_SEGMENT.kindergarten);
  const selectSegment = useCallback((next: DiarySegment) => {
    setSegment(next);
  }, []);

  return (
    <GuardianDiarySegmentContext.Provider value={{ segment, dogName, petId, selectSegment }}>
      {children}
    </GuardianDiarySegmentContext.Provider>
  );
}

function useGuardianDiarySegment() {
  return useContext(GuardianDiarySegmentContext);
}

export { GuardianDiarySegmentProvider, useGuardianDiarySegment };
