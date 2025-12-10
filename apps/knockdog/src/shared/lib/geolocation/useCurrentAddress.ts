'use client';

import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReverseGeocode } from '@features/address-picker';
import type { ReverseGeocodeResponse } from '@features/address-picker/model/address';

interface Coordinates {
  lat: number;
  lng: number;
}

interface AddressItem {
  text: string | undefined;
  address: {
    road: string | undefined;
    parcel: string | undefined;
    zipcode: string | undefined;
  };
}

interface UseCurrentAddressResult {
  coords: Coordinates | undefined;
  address: ReverseGeocodeResponse | undefined;
  items: AddressItem[];
  primaryText: string | undefined;
  primaryRoad: string | undefined;
  primaryParcel: string | undefined;
  zipcode: string | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => void;
}

function extractAddressItems(data: ReverseGeocodeResponse | undefined): AddressItem[] {
  if (!data?.documents || data.documents.length === 0) return [];

  const firstDoc = data.documents[0];
  if (!firstDoc) return [];

  return [
    {
      text: firstDoc.road_address?.address_name || firstDoc.address?.roadAddress || firstDoc.address?.address,
      address: {
        road: firstDoc.road_address?.address_name || firstDoc.address?.roadAddress,
        parcel: firstDoc.address?.address,
        zipcode: undefined,
      },
    },
  ];
}

export function useCurrentAddress(coords: Coordinates | undefined, enabled = true): UseCurrentAddressResult {
  const isEnabled = enabled && !!coords && coords.lat !== 0 && coords.lng !== 0;

  const reverseQuery = useQuery({
    queryKey: ['reverse-geocode', coords?.lat, coords?.lng],
    queryFn: () => getReverseGeocode(coords!.lat, coords!.lng),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const refetch = useCallback(() => {
    if (coords && coords.lat !== 0 && coords.lng !== 0) {
      reverseQuery.refetch();
    }
  }, [coords, reverseQuery]);

  return useMemo(() => {
    const items = extractAddressItems(reverseQuery.data);

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
