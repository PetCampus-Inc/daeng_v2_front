import { route } from '@shared/constants/route';
import type { Query } from '@shared/lib/bridge/queryUtils';
import { formatDateKey } from '@shared/lib/calendar-date';

interface DiaryWriteTargetInput {
  date: Date;
  schoolId?: string | null;
}

function buildDiaryWriteTarget({ date, schoolId }: DiaryWriteTargetInput) {
  const query: Query = {
    date: formatDateKey(date),
  };
  if (schoolId) query.schoolId = schoolId;

  return {
    pathname: route.kindergarten.diary.write.root,
    query,
  };
}

export { buildDiaryWriteTarget };
export type { DiaryWriteTargetInput };
