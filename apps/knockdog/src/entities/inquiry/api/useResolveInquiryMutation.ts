'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postResolveInquiry } from './inquiry';
import { syncInquiryCache } from './syncInquiryCache';

interface UseResolveInquiryMutationOptions {
  /** 캐시 키에만 쓰임. 사용자 정보를 불러오기 전이면 undefined */
  userId: string | undefined;
}

/** 문의 해결(종료) */
function useResolveInquiryMutation({ userId }: UseResolveInquiryMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postResolveInquiry,
    onSuccess: (response) => syncInquiryCache(queryClient, userId, response.data),
  });
}

export { useResolveInquiryMutation };
