'use client';

import { useQuery } from '@tanstack/react-query';

import { parseSchoolId, toSchoolNewsPage } from '../model/schoolNews';
import { getSchoolNewsPreview } from './schoolNews';

const SCHOOL_NEWS_PREVIEW_QUERY_KEY = 'schoolNewsPreview';

const schoolNewsPreviewQueryKey = (schoolId?: number | null) =>
  [SCHOOL_NEWS_PREVIEW_QUERY_KEY, schoolId] as const;

function useSchoolNewsPreviewQuery({
  schoolId,
  enabled = true,
}: {
  schoolId?: string | number | null;
  enabled?: boolean;
}) {
  const parsedSchoolId = parseSchoolId(schoolId);

  return useQuery({
    queryKey: schoolNewsPreviewQueryKey(parsedSchoolId),
    queryFn: () => {
      if (parsedSchoolId == null) throw new Error('소식 미리보기에 필요한 id가 없습니다.');
      return getSchoolNewsPreview(parsedSchoolId);
    },
    select: (response) => toSchoolNewsPage(response.data),
    enabled: enabled && parsedSchoolId != null,
  });
}

export { SCHOOL_NEWS_PREVIEW_QUERY_KEY, schoolNewsPreviewQueryKey, useSchoolNewsPreviewQuery };
