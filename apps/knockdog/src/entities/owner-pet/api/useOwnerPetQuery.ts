import { useQuery } from '@tanstack/react-query';

import { toOwnerPet } from '../model/ownerPet';
import { getOwnerPet } from './ownerPet';

const OWNER_PET_QUERY_KEY = 'ownerPet';

const ownerPetQueryKey = (petId?: string) => [OWNER_PET_QUERY_KEY, petId] as const;

interface UseOwnerPetQueryOptions {
  petId?: string;
  enabled?: boolean;
}

function useOwnerPetQuery({ petId, enabled = true }: UseOwnerPetQueryOptions) {
  const resolvedPetId = petId?.trim() ?? '';

  return useQuery({
    queryKey: ownerPetQueryKey(resolvedPetId),
    queryFn: () => getOwnerPet(resolvedPetId),
    select: (response) => toOwnerPet(response.data),
    enabled: enabled && /^\d+$/.test(resolvedPetId),
    staleTime: 0,
  });
}

export { OWNER_PET_QUERY_KEY, ownerPetQueryKey, useOwnerPetQuery };
