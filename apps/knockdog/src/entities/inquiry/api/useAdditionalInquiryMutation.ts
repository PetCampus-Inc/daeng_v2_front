'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postAdditionalInquiry } from './inquiry';
import { syncInquiryCache } from './syncInquiryCache';

interface UseAdditionalInquiryMutationOptions {
  /** 캐시 키에만 쓰임. 사용자 정보를 불러오기 전이면 undefined */
  userId: string | undefined;
}

/** 추가 문의 등록 */
function useAdditionalInquiryMutation({ userId }: UseAdditionalInquiryMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postAdditionalInquiry,
    onSuccess: (response) => syncInquiryCache(queryClient, userId, response.data),
  });
}

export { useAdditionalInquiryMutation };
