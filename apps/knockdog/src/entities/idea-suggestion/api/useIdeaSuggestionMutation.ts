'use client';

import { useMutation } from '@tanstack/react-query';

import { postIdeaSuggestion } from './ideaSuggestion';

/** 아이디어 제안 등록. 제안 내역 조회가 없어 무효화할 캐시는 없음 */
function useIdeaSuggestionMutation() {
  return useMutation({
    mutationFn: postIdeaSuggestion,
  });
}

export { useIdeaSuggestionMutation };
