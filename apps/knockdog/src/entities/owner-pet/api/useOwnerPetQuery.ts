import { useQuery } from '@tanstack/react-query';

import { toOwnerPet, toOwnerPetGuardian } from '../model/ownerPet';
import { getOwnerPet, getOwnerPetGuardian } from './ownerPet';

const OWNER_PET_QUERY_KEY = 'ownerPet';
const OWNER_PET_GUARDIAN_QUERY_KEY = 'ownerPetGuardian';

const ownerPetQueryKey = (petId?: string) => [OWNER_PET_QUERY_KEY, petId] as const;
const ownerPetGuardianQueryKey = (petId?: string) =>
  [OWNER_PET_GUARDIAN_QUERY_KEY, petId] as const;

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

function useOwnerPetGuardianQuery({ petId, enabled = true }: UseOwnerPetQueryOptions) {
  const resolvedPetId = petId?.trim() ?? '';

  return useQuery({
    queryKey: ownerPetGuardianQueryKey(resolvedPetId),
    queryFn: () => getOwnerPetGuardian(resolvedPetId),
    select: (response) => toOwnerPetGuardian(response.data),
    enabled: enabled && /^\d+$/.test(resolvedPetId),
    staleTime: 0,
  });
}

export {
  OWNER_PET_GUARDIAN_QUERY_KEY,
  OWNER_PET_QUERY_KEY,
  ownerPetGuardianQueryKey,
  ownerPetQueryKey,
  useOwnerPetGuardianQuery,
  useOwnerPetQuery,
};
