'use client';

import { useMemo, useCallback } from 'react';
import {
  useReverseGeocodeQuery,
  type ReverseGeocodeStandardResponse,
  extractVWorldItems,
} from './useReverseGeocodeQuery';

interface Coordinates {
  lat: number;
  lng: number;
}

interface UseCurrentAddressResult {
  coords: Coordinates | undefined;
  address: ReverseGeocodeStandardResponse | undefined;
  items: ReturnType<typeof extractVWorldItems>;
  primaryText: string | undefined;
  primaryRoad: string | undefined;
  primaryParcel: string | undefined;
  zipcode: string | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCurrentAddress(coords: Coordinates | undefined, enabled = true): UseCurrentAddressResult {
  const reverseQuery = useReverseGeocodeQuery(coords, enabled);

  const refetch = useCallback(() => {
    if (coords && coords.lat !== 0 && coords.lng !== 0) {
      reverseQuery.refetch();
    }
  }, [coords, reverseQuery.refetch]);

  return useMemo(() => {
    const items = extractVWorldItems(reverseQuery.data);

    return {
      coords,
      address: reverseQuery.data,
      items,
      primaryText: items[0]?.text,
      primaryRoad: items[0]?.address?.road,
      primaryParcel: items[0]?.address?.parcel,
      zipcode: items[0]?.address?.zipcode,
      isLoading: reverseQuery.isLoading,
      isFetching: reverseQuery.isFetching,
      error: (reverseQuery.error as Error | null | undefined)?.message ?? null,
      refetch,
    };
  }, [coords, reverseQuery.data, reverseQuery.isLoading, reverseQuery.isFetching, reverseQuery.error, refetch]);
}
