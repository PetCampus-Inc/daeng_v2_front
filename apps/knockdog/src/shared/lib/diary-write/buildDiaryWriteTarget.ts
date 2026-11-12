import { route } from '@shared/constants/route';
import type { Query } from '@shared/lib/bridge/queryUtils';
import { formatDateKey } from '@shared/lib/calendar-date';

const DIARY_WRITE_FROM = {
  diary: 'diary',
  notice: 'notice',
  onboarding: 'onboarding',
} as const;

type DiaryWriteFrom = (typeof DIARY_WRITE_FROM)[keyof typeof DIARY_WRITE_FROM];

interface DiaryWriteTargetInput {
  date: Date;
  from: DiaryWriteFrom;
  schoolId?: string | null;
  petId?: string | null;
  hasNotice?: boolean;
}

function parseDiaryWriteFrom(value: string | null): DiaryWriteFrom {
  if (value === DIARY_WRITE_FROM.notice || value === DIARY_WRITE_FROM.onboarding) return value;
  return DIARY_WRITE_FROM.diary;
}

function buildDiaryWriteTarget({ date, from, schoolId, petId, hasNotice }: DiaryWriteTargetInput) {
  const query: Query = {
    date: formatDateKey(date),
    from,
  };
  if (schoolId) query.schoolId = schoolId;
  if (petId) query.petId = petId;
  if (hasNotice) query.hasNotice = '1';

  return {
    pathname: route.kindergarten.diary.write.root,
    query,
  };
}

export { DIARY_WRITE_FROM, buildDiaryWriteTarget, parseDiaryWriteFrom };
export type { DiaryWriteFrom, DiaryWriteTargetInput };
