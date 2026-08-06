import { useQuery } from '@tanstack/react-query';

import { useUserStore } from '@entities/user';

import { getPetList } from './pet';

const PET_LIST_QUERY_KEY = 'petList';

/** 유저별로 캐시를 분리해 계정 전환 시 이전 강아지 목록이 남지 않도록 함 */
const petListQueryKey = (userId?: string) => [PET_LIST_QUERY_KEY, userId] as const;

interface UsePetListQueryOptions {
  userId?: string;
  enabled?: boolean;
}

const usePetListQuery = (options?: UsePetListQueryOptions) => {
  const storeUserId = useUserStore((state) => state.user?.userId);
  const userId = options?.userId ?? storeUserId;

  return useQuery({
    queryKey: petListQueryKey(userId),
    queryFn: getPetList,
    enabled: (options?.enabled ?? true) && Boolean(userId),
    select: (data) => ({
      ...data,
      data: data.data?.sort((a, b) => (b.isRepresentative ? 1 : 0) - (a.isRepresentative ? 1 : 0)),
    }),
  });
};

interface UsePetByIdQueryOptions {
  userId?: string;
  enabled?: boolean;
}

const usePetByIdQuery = (petId: string, options?: UsePetByIdQueryOptions) => {
  const storeUserId = useUserStore((state) => state.user?.userId);
  const userId = options?.userId ?? storeUserId;

  return useQuery({
    queryKey: petListQueryKey(userId),
    queryFn: getPetList,
    enabled: (options?.enabled ?? true) && Boolean(userId) && Boolean(petId),
    select: (petList) => petList.data?.find((p) => String(p.id) === petId),
  });
};

interface UsePetRepresentativeQueryOptions {
  userId?: string;
  enabled?: boolean;
}

// 대표 강아지 조회
const usePetRepresentativeQuery = (options?: UsePetRepresentativeQueryOptions) => {
  const storeUserId = useUserStore((state) => state.user?.userId);
  const userId = options?.userId ?? storeUserId;

  return useQuery({
    queryKey: petListQueryKey(userId),
    queryFn: getPetList,
    enabled: (options?.enabled ?? true) && Boolean(userId),
    select: (petList) => petList.data?.find((p) => p.isRepresentative),
  });
};

export {
  PET_LIST_QUERY_KEY,
  petListQueryKey,
  usePetListQuery,
  usePetByIdQuery,
  usePetRepresentativeQuery,
};
