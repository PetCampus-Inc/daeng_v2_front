'use client';

import { useQuery } from '@tanstack/react-query';

import { getInquiryDetail } from './inquiry';

const INQUIRY_DETAIL_QUERY_KEY = 'inquiryDetail';

const inquiryDetailQueryKey = (userId?: string, inquiryId?: number | null) =>
  [INQUIRY_DETAIL_QUERY_KEY, userId, inquiryId] as const;

interface UseInquiryDetailQueryOptions {
  userId?: string;
  inquiryId?: number | null;
  enabled?: boolean;
}

/** 문의 상세. userId나 inquiryId가 없으면 요청하지 않음 */
function useInquiryDetailQuery({ userId, inquiryId, enabled = true }: UseInquiryDetailQueryOptions) {
  return useQuery({
    queryKey: inquiryDetailQueryKey(userId, inquiryId),
    queryFn: async () => {
      if (inquiryId == null) throw new Error('문의 상세에 필요한 id가 없습니다.');
      const response = await getInquiryDetail(inquiryId);
      return response.data;
    },
    enabled: enabled && Boolean(userId) && inquiryId != null,
  });
}

export { inquiryDetailQueryKey, useInquiryDetailQuery };
