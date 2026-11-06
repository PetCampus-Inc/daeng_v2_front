import { useQuery } from '@tanstack/react-query';

import { getOwnerSchoolProfile } from './ownerSchoolProfile';

const OWNER_SCHOOL_PROFILE_QUERY_KEY = 'ownerSchoolProfile';

const ownerSchoolProfileQueryKey = (userId?: string) =>
  [OWNER_SCHOOL_PROFILE_QUERY_KEY, userId] as const;

interface UseOwnerSchoolProfileQueryOptions {
  userId?: string;
  enabled?: boolean;
}

function useOwnerSchoolProfileQuery({
  userId,
  enabled = true,
}: UseOwnerSchoolProfileQueryOptions = {}) {
  return useQuery({
    queryKey: ownerSchoolProfileQueryKey(userId),
    queryFn: getOwnerSchoolProfile,
    select: (response) => response.data,
    enabled,
    staleTime: 0,
  });
}

export {
  OWNER_SCHOOL_PROFILE_QUERY_KEY,
  ownerSchoolProfileQueryKey,
  useOwnerSchoolProfileQuery,
};
