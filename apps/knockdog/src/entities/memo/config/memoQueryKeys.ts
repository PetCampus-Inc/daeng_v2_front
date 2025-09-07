import { getMemo } from '../api/getMemo';

// 쿼리 키 팩토리
export const memoQueryKeys = {
  all: ['memo'] as const,
  byTargetId: (targetId: string) => [...memoQueryKeys.all, targetId] as const,
} as const;

// 쿼리 옵션 팩토리
export const createMemoQueryOptions = (targetId: string) => ({
  queryKey: memoQueryKeys.byTargetId(targetId),
  queryFn: () => getMemo(targetId),
});
