'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import {
  getGuardianSchoolConnections,
  guardianSchoolConnectionsQueryKey,
  toGuardianSchoolConnections,
  type GuardianSchoolConnection,
} from '@entities/guardian-home';
import { isKindergartenId } from '@entities/kindergarten';
import { usePetListQuery } from '@entities/pet';
import { useUserStore } from '@entities/user';
import { formatDateKey } from '@shared/lib/calendar-date';
import type { KindergartenSelectOption } from '@shared/ui/kindergarten-select-sheet';

function sortByConnectedAt(connections: GuardianSchoolConnection[]) {
  return [...connections].sort((left, right) => {
    const leftTime = left.connectedAt?.getTime() ?? Number.POSITIVE_INFINITY;
    const rightTime = right.connectedAt?.getTime() ?? Number.POSITIVE_INFINITY;
    return leftTime - rightTime;
  });
}

/** 강아지 등록 순 → 연결 순. 같은 유치원은 한 번만, 리뷰 작성 가능한 placeId만. */
function collectWritableKindergartens(
  petIds: string[],
  connectionsByPetId: Map<string, GuardianSchoolConnection[]>
) {
  const seenPlaceIds = new Set<string>();
  const kindergartens: KindergartenSelectOption[] = [];

  for (const petId of petIds) {
    const connections = sortByConnectedAt(connectionsByPetId.get(petId) ?? []);

    for (const connection of connections) {
      const isConnected = connection.status === 'approved' || connection.status === 'disconnected';
      const placeId = connection.placeId;
      if (!isConnected || !isKindergartenId(placeId) || seenPlaceIds.has(placeId)) continue;

      seenPlaceIds.add(placeId);
      kindergartens.push({
        id: placeId,
        schoolId: connection.schoolId,
        name: connection.name,
        imageUrl: connection.imageUrl,
        attendedUntil: connection.disconnectedAt ? formatDateKey(connection.disconnectedAt) : null,
      });
    }
  }

  return kindergartens;
}

function useWritableKindergartens() {
  const userId = useUserStore((state) => state.user?.userId);
  const petsQuery = usePetListQuery({ userId });
  const pets = petsQuery.data?.data ?? [];

  const connectionQueries = useQueries({
    queries: pets.map((pet) => ({
      queryKey: guardianSchoolConnectionsQueryKey(userId, pet.id),
      queryFn: () => getGuardianSchoolConnections({ petId: pet.id }),
      select: (response: Awaited<ReturnType<typeof getGuardianSchoolConnections>>) =>
        toGuardianSchoolConnections(response.data),
      enabled: Boolean(userId),
    })),
  });

  const kindergartens = useMemo(() => {
    const connectionsByPetId = new Map(
      pets.map((pet, index) => [pet.id, connectionQueries[index]?.data ?? []])
    );
    return collectWritableKindergartens(
      pets.map((pet) => pet.id),
      connectionsByPetId
    );
  }, [connectionQueries, pets]);

  const isLoading = petsQuery.isLoading || connectionQueries.some((query) => query.isLoading);

  return { kindergartens, isLoading };
}

export { useWritableKindergartens };
