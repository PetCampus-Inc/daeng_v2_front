import { route } from '@shared/constants/route';
import type { Query } from '@shared/lib/bridge/queryUtils';
import { formatDateKey } from '@shared/lib/calendar-date';

interface DiaryWriteTargetInput {
  date: Date;
  schoolId?: string | null;
}

function buildDiaryQuery(date: Date, schoolId?: string | null): Query {
  const query: Query = { date: formatDateKey(date) };
  if (schoolId) query.schoolId = schoolId;
  return query;
}

function buildDiaryWriteTarget({ date, schoolId }: DiaryWriteTargetInput) {
  return {
    pathname: route.kindergarten.diary.write.root,
    query: buildDiaryQuery(date, schoolId),
  };
}

function buildDiaryGenerateTarget({ date, schoolId }: DiaryWriteTargetInput) {
  return {
    pathname: route.kindergarten.diary.generate.root,
    query: buildDiaryQuery(date, schoolId),
  };
}

export { buildDiaryGenerateTarget, buildDiaryWriteTarget };
export type { DiaryWriteTargetInput };
