'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postInquiry } from './inquiry';
import { syncInquiryCache } from './syncInquiryCache';

interface UseCreateInquiryMutationOptions {
  /** 캐시 키에만 쓰임. 사용자 정보를 불러오기 전이면 undefined */
  userId: string | undefined;
}

/** 문의 등록 */
function useCreateInquiryMutation({ userId }: UseCreateInquiryMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postInquiry,
    onSuccess: (response) => syncInquiryCache(queryClient, userId, response.data),
  });
}

export { useCreateInquiryMutation };
