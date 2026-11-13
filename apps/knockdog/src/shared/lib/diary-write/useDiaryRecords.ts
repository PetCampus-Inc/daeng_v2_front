'use client';

import { useEffect, useState } from 'react';

import { DIARY_RECORD_EVENT, readDiaryRecords, type DiaryRecord } from './diaryRecord';

function useDiaryRecords() {
  const [records, setRecords] = useState<DiaryRecord[]>([]);

  useEffect(() => {
    const sync = () => setRecords(readDiaryRecords());
    sync();
    window.addEventListener(DIARY_RECORD_EVENT, sync);
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.removeEventListener(DIARY_RECORD_EVENT, sync);
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return records;
}

export { useDiaryRecords };
