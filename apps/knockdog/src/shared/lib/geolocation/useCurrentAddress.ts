'use client';

import { useMemo } from 'react';
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
}

export function useCurrentAddress(coords: Coordinates | undefined, enabled = true): UseCurrentAddressResult {
  const reverseQuery = useReverseGeocodeQuery(coords, enabled);

  return useMemo(
    () => ({
      coords,
      address: reverseQuery.data,
      items: extractVWorldItems(reverseQuery.data),
      primaryText: extractVWorldItems(reverseQuery.data)[0]?.text,
      primaryRoad: extractVWorldItems(reverseQuery.data)[0]?.address?.road,
      primaryParcel: extractVWorldItems(reverseQuery.data)[0]?.address?.parcel,
      zipcode: extractVWorldItems(reverseQuery.data)[0]?.address?.zipcode,
      isLoading: reverseQuery.isLoading,
      isFetching: reverseQuery.isFetching,
      error: (reverseQuery.error as Error | null | undefined)?.message ?? null,
    }),
    [coords, reverseQuery.data, reverseQuery.isLoading, reverseQuery.isFetching, reverseQuery.error]
  );
}
