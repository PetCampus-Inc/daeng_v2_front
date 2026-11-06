'use client';

import { useQuery } from '@tanstack/react-query';

import { parseSchoolId, toSchoolNewsItem } from '../model/schoolNews';
import { getSchoolNewsDetail } from './schoolNews';

const SCHOOL_NEWS_DETAIL_QUERY_KEY = 'schoolNewsDetail';

const schoolNewsDetailQueryKey = (schoolId?: number | null, newsId?: number | null) =>
  [SCHOOL_NEWS_DETAIL_QUERY_KEY, schoolId, newsId] as const;

function useSchoolNewsDetailQuery({
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
    queryKey: schoolNewsDetailQueryKey(parsedSchoolId, parsedNewsId),
    queryFn: () => {
      if (parsedSchoolId == null || parsedNewsId == null) throw new Error('소식 상세에 필요한 id가 없습니다.');
      return getSchoolNewsDetail({ schoolId: parsedSchoolId, newsId: parsedNewsId });
    },
    select: (response) => (response.data ? toSchoolNewsItem(response.data) : null),
    enabled: enabled && parsedSchoolId != null && parsedNewsId != null,
  });
}

export { SCHOOL_NEWS_DETAIL_QUERY_KEY, schoolNewsDetailQueryKey, useSchoolNewsDetailQuery };
