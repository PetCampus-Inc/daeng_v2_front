'use client';

import { useQuery } from '@tanstack/react-query';

import { parseSchoolId, toSchoolNewsDraft } from '../model/schoolNews';
import { getSchoolNewsDraft } from './schoolNews';

const SCHOOL_NEWS_DRAFT_QUERY_KEY = 'schoolNewsDraft';

const schoolNewsDraftQueryKey = (schoolId?: number | null) =>
  [SCHOOL_NEWS_DRAFT_QUERY_KEY, schoolId] as const;

function useSchoolNewsDraftQuery({
  schoolId,
  enabled = true,
}: {
  schoolId?: string | number | null;
  enabled?: boolean;
}) {
  const parsedSchoolId = parseSchoolId(schoolId);

  return useQuery({
    queryKey: schoolNewsDraftQueryKey(parsedSchoolId),
    queryFn: () => {
      if (parsedSchoolId == null) throw new Error('schoolId required');
      return getSchoolNewsDraft(parsedSchoolId);
    },
    select: (response) => toSchoolNewsDraft(response.data),
    enabled: enabled && parsedSchoolId != null,
  });
}

export { SCHOOL_NEWS_DRAFT_QUERY_KEY, schoolNewsDraftQueryKey, useSchoolNewsDraftQuery };
