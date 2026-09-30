'use client';

import { useQuery } from '@tanstack/react-query';

import { parseSchoolId, toSchoolNewsReaders } from '../model/schoolNews';
import { getSchoolNewsReaders } from './schoolNews';

const SCHOOL_NEWS_READERS_QUERY_KEY = 'schoolNewsReaders';

const schoolNewsReadersQueryKey = (schoolId?: number | null, newsId?: number | null) =>
  [SCHOOL_NEWS_READERS_QUERY_KEY, schoolId, newsId] as const;

function useSchoolNewsReadersQuery({
  schoolId,
  newsId,
  enabled = true,
}: {
  schoolId?: string | number | null;
  newsId?: string | number | null;
  enabled?: boolean;
}) {
  const parsedSchoolId = parseSchoolId(schoolId);
  const parsedNewsId = parseSchoolId(newsId);

  return useQuery({
    queryKey: schoolNewsReadersQueryKey(parsedSchoolId, parsedNewsId),
    queryFn: () => {
      if (parsedSchoolId == null || parsedNewsId == null) throw new Error('읽은 보호자 조회에 필요한 id가 없습니다.');
      return getSchoolNewsReaders({ schoolId: parsedSchoolId, newsId: parsedNewsId });
    },
    select: (response) => toSchoolNewsReaders(response.data),
    enabled: enabled && parsedSchoolId != null && parsedNewsId != null,
  });
}

export { SCHOOL_NEWS_READERS_QUERY_KEY, schoolNewsReadersQueryKey, useSchoolNewsReadersQuery };
