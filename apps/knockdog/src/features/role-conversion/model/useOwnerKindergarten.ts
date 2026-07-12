'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getKindergartenMain } from '@entities/kindergarten';
import { useBasePoint } from '@entities/user';

import { loadOwnerKindergarten, subscribeOwnerKindergarten } from './ownerKindergarten';

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';

interface UseOwnerKindergartenOptions {
  enabled?: boolean;
}

function useOwnerKindergarten({ enabled = true }: UseOwnerKindergartenOptions = {}) {
  const ownerKindergarten = useSyncExternalStore(
    subscribeOwnerKindergarten,
    loadOwnerKindergarten,
    () => null
  );

  const { coord } = useBasePoint();
  const lng = coord?.lng ?? 0;
  const lat = coord?.lat ?? 0;
  const isCoordReady = Boolean(coord && coord.lng != null && coord.lat != null);
  const placeId = ownerKindergarten?.placeId ?? '';
  const shouldFetchMainImage =
    enabled && ownerKindergarten?.source === 'search' && Boolean(placeId);

  const { data: bannerPath } = useQuery({
    queryKey: ['owner-kindergarten-banner', placeId, { lat, lng }],
    queryFn: async () => {
      try {
        const main = await getKindergartenMain({ id: placeId, lng, lat });
        return main.banner?.[0] ?? null;
      } catch {
        return null;
      }
    },
    enabled: shouldFetchMainImage && isCoordReady,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });

  const imageUrl = useMemo(() => {
    if (!shouldFetchMainImage || !bannerPath) return null;

    return `${IMAGE_BASE_URL}${bannerPath}`;
  }, [bannerPath, shouldFetchMainImage]);

  const usesDefaultImage = ownerKindergarten?.source === 'manual' || !imageUrl;
  const canOpenKindergartenDetail = ownerKindergarten?.source === 'search' && Boolean(bannerPath);

  return {
    ownerKindergarten,
    imageUrl,
    usesDefaultImage,
    canOpenKindergartenDetail,
    kindergartenId: canOpenKindergartenDetail ? placeId : undefined,
    name: ownerKindergarten?.name ?? '',
    address: ownerKindergarten?.address ?? '',
    ownerName: ownerKindergarten?.ownerName ?? '',
    ownerPhoneNumber: ownerKindergarten?.phoneNumber ?? '',
  };
}

export { useOwnerKindergarten };
