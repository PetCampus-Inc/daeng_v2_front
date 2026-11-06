'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import type { LegalDocumentType } from '../model/platformContent';
import { toLegalDocumentVersions, toPlatformNoticePage } from '../model/platformContent';
import {
  getLegalDocumentDetail,
  getLegalDocumentVersions,
  getPlatformNoticeDetail,
  getPlatformNotices,
  PLATFORM_NOTICES_PAGE_SIZE,
} from './platformContent';

const PLATFORM_NOTICES_QUERY_KEY = 'platformNotices';
const platformNoticesQueryKey = (size: number) => [PLATFORM_NOTICES_QUERY_KEY, size] as const;

function usePlatformNoticesInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: platformNoticesQueryKey(PLATFORM_NOTICES_PAGE_SIZE),
    queryFn: async ({ pageParam }) => {
      const response = await getPlatformNotices({ cursor: pageParam, size: PLATFORM_NOTICES_PAGE_SIZE });
      return toPlatformNoticePage(response.data);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.nextCursor ?? undefined : undefined,
  });
}

function usePlatformNoticeDetailQuery(id?: string) {
  const parsedId = id && /^\d+$/.test(id) ? Number(id) : null;
  return useQuery({
    queryKey: [PLATFORM_NOTICES_QUERY_KEY, 'detail', parsedId],
    queryFn: async () => {
      if (parsedId == null || !Number.isSafeInteger(parsedId)) return null;
      const response = await getPlatformNoticeDetail(parsedId);
      return response.data ?? null;
    },
    enabled: parsedId != null && Number.isSafeInteger(parsedId),
  });
}

function useLegalDocumentVersionsQuery(type: LegalDocumentType) {
  return useQuery({
    queryKey: ['legalDocumentVersions', type],
    queryFn: async () => {
      const response = await getLegalDocumentVersions(type);
      return toLegalDocumentVersions(response.data);
    },
  });
}

function useLegalDocumentDetailQuery(type: LegalDocumentType, versionId?: number, enabled = true) {
  return useQuery({
    queryKey: ['legalDocument', type, versionId ?? 'current'],
    queryFn: async () => {
      const response = await getLegalDocumentDetail(type, versionId);
      return response.data ?? null;
    },
    enabled,
  });
}

export {
  PLATFORM_NOTICES_QUERY_KEY,
  platformNoticesQueryKey,
  useLegalDocumentDetailQuery,
  useLegalDocumentVersionsQuery,
  usePlatformNoticeDetailQuery,
  usePlatformNoticesInfiniteQuery,
};
