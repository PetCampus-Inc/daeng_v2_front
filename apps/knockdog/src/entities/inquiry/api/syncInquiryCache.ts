import type { QueryClient } from '@tanstack/react-query';

import type { InquiryDetailResponseDto } from '../model/inquiry';
import { inquiriesQueryKeys } from './useInquiriesInfiniteQuery';
import { inquiryDetailQueryKey } from './useInquiryDetailQuery';

/** 응답으로 받은 상세를 캐시에 넣고, 상태·최근 활동일시가 바뀐 목록은 다시 불러옴. userId가 없으면 맞는 캐시 키가 없어 건너뜀 */
async function syncInquiryCache(
  queryClient: QueryClient,
  userId: string | undefined,
  detail: InquiryDetailResponseDto
) {
  if (!userId) return;
  if (detail.id != null) queryClient.setQueryData(inquiryDetailQueryKey(userId, detail.id), detail);
  await queryClient.invalidateQueries({ queryKey: inquiriesQueryKeys.byUser(userId) });
}

export { syncInquiryCache };
