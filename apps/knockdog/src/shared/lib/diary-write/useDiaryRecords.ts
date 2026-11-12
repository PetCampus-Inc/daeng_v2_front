'use client';

import { useEffect, useState } from 'react';

import { DIARY_RECORD_EVENT, readDiaryRecords, type DiaryRecord } from './diaryRecord';

function useDiaryRecords() {
  const [records, setRecords] = useState<DiaryRecord[]>([]);

  useEffect(() => {
    const sync = () => setRecords(readDiaryRecords());
    sync();
    window.addEventListener(DIARY_RECORD_EVENT, sync);
    return () => window.removeEventListener(DIARY_RECORD_EVENT, sync);
  }, []);

  return records;
}

export { useDiaryRecords };
