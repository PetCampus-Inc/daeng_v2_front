'use client';

import { useQuery } from '@tanstack/react-query';

import { parseSchoolId, toSchoolNewsDraft } from '../model/schoolNews';
import { getSchoolNewsDraft } from './schoolNews';

const SCHOOL_NEWS_DRAFT_QUERY_KEY = 'schoolNewsDraft';
const SCHOOL_NEWS_EDIT_DRAFT_QUERY_KEY = 'schoolNewsEditDraft';

const schoolNewsDraftQueryKey = (schoolId?: number | null) =>
  [SCHOOL_NEWS_DRAFT_QUERY_KEY, schoolId] as const;

const schoolNewsEditDraftQueryKey = (schoolId?: number | null, newsId?: number | null) =>
  [SCHOOL_NEWS_EDIT_DRAFT_QUERY_KEY, schoolId, newsId] as const;

function useSchoolNewsDraftQuery({
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
  const isEditDraft = newsId != null;

  return useQuery({
    queryKey: isEditDraft
      ? schoolNewsEditDraftQueryKey(parsedSchoolId, parsedNewsId)
      : schoolNewsDraftQueryKey(parsedSchoolId),
    queryFn: () => {
      if (parsedSchoolId == null) throw new Error('schoolId required');
      if (isEditDraft) {
        if (parsedNewsId == null) throw new Error('newsId required');
        return getSchoolNewsDraft(parsedSchoolId, parsedNewsId);
      }
      return getSchoolNewsDraft(parsedSchoolId);
    },
    select: (response) => toSchoolNewsDraft(response.data),
    enabled: enabled && parsedSchoolId != null && (!isEditDraft || parsedNewsId != null),
  });
}

export {
  SCHOOL_NEWS_DRAFT_QUERY_KEY,
  SCHOOL_NEWS_EDIT_DRAFT_QUERY_KEY,
  schoolNewsDraftQueryKey,
  schoolNewsEditDraftQueryKey,
  useSchoolNewsDraftQuery,
};
