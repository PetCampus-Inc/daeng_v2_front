import { useQuery } from '@tanstack/react-query';

import { toOwnerPetConnections } from '../model/ownerPetConnection';
import { toOwnerPet, toOwnerPetGuardian } from '../model/ownerPet';
import { getOwnerPet, getOwnerPetConnections, getOwnerPetGuardian } from './ownerPet';

const OWNER_PET_QUERY_KEY = 'ownerPet';
const OWNER_PET_GUARDIAN_QUERY_KEY = 'ownerPetGuardian';
const OWNER_PET_HISTORY_QUERY_KEY = 'ownerPetConnections';

const OWNER_PET_FRESH_MS = 5_000;

const ownerPetQueryKey = (petId?: string) => [OWNER_PET_QUERY_KEY, petId] as const;
const ownerPetGuardianQueryKey = (petId?: string) =>
  [OWNER_PET_GUARDIAN_QUERY_KEY, petId] as const;
const ownerPetConnectionsQueryKey = (petId?: string) =>
  [OWNER_PET_HISTORY_QUERY_KEY, petId] as const;

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
    // 구성원 목록에서 카드를 눌러 방금 받은 응답을 프로필이 다시 요청하지 않고 쓰도록 짧게 신선하게 둔다
    staleTime: OWNER_PET_FRESH_MS,
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

function useOwnerPetConnectionsQuery({ petId, enabled = true }: UseOwnerPetQueryOptions) {
  const resolvedPetId = petId?.trim() ?? '';

  return useQuery({
    queryKey: ownerPetConnectionsQueryKey(resolvedPetId),
    queryFn: () => getOwnerPetConnections(resolvedPetId),
    select: (response) => toOwnerPetConnections(response.data),
    enabled: enabled && /^\d+$/.test(resolvedPetId),
    staleTime: 0,
  });
}

export {
  OWNER_PET_HISTORY_QUERY_KEY,
  OWNER_PET_GUARDIAN_QUERY_KEY,
  OWNER_PET_QUERY_KEY,
  ownerPetConnectionsQueryKey,
  ownerPetGuardianQueryKey,
  ownerPetQueryKey,
  useOwnerPetConnectionsQuery,
  useOwnerPetGuardianQuery,
  useOwnerPetQuery,
};
