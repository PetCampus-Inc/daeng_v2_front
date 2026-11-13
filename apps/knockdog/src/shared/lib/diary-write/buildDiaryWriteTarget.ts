import { route } from '@shared/constants/route';
import type { Query } from '@shared/lib/bridge/queryUtils';
import { formatDateKey } from '@shared/lib/calendar-date';

interface DiaryWriteTargetInput {
  date: Date;
  schoolId?: string | null;
  petId?: string | null;
}

function buildDiaryQuery({ date, schoolId, petId }: DiaryWriteTargetInput): Query {
  const query: Query = { date: formatDateKey(date) };
  if (schoolId) query.schoolId = schoolId;
  if (petId) query.petId = petId;
  return query;
}

function buildDiaryWriteTarget(input: DiaryWriteTargetInput) {
  return {
    pathname: route.kindergarten.diary.write.root,
    query: buildDiaryQuery(input),
  };
}

function buildDiaryGenerateTarget(input: DiaryWriteTargetInput) {
  return {
    pathname: route.kindergarten.diary.generate.root,
    query: buildDiaryQuery(input),
  };
}

function buildDiaryDetailTarget(input: DiaryWriteTargetInput & { diaryId?: string | null }) {
  const query = buildDiaryQuery(input);
  if (input.diaryId) query.diaryId = input.diaryId;
  return {
    pathname: route.kindergarten.diary.detail.root,
    query,
  };
}

export { buildDiaryDetailTarget, buildDiaryGenerateTarget, buildDiaryWriteTarget };
export type { DiaryWriteTargetInput };
