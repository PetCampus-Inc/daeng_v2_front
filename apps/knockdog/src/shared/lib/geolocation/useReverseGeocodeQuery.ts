'use client';

import { useQuery } from '@tanstack/react-query';

export interface ReverseGeocodeParams {
  lat: number;
  lng: number;
}

export interface VWorldAddressItem {
  id?: string;
  address?: {
    road?: string;
    parcel?: string;
    zipcode?: string;
  };
  text?: string;
  [x: string]: unknown;
}

export interface ReverseGeocodeStandardResponse {
  result: VWorldAddressItem[];
}

export function extractVWorldItems(data: ReverseGeocodeStandardResponse | undefined): VWorldAddressItem[] {
  return data?.result ?? [];
}

async function getReverseGeocode({ lat, lng }: ReverseGeocodeParams): Promise<ReverseGeocodeStandardResponse> {
  const url = new URL('/api/geocoder/reverse', window.location.origin);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lng', String(lng));
  url.searchParams.set('format', 'json');
  url.searchParams.set('type', 'both');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Reverse geocoding failed: ${res.status}`);
  return (await res.json()) as ReverseGeocodeStandardResponse;
}

export function useReverseGeocodeQuery(coord: { lat: number; lng: number } | undefined, enabled = true) {
  const isEnabled = enabled && !!coord && coord.lat !== 0 && coord.lng !== 0;
  return useQuery<ReverseGeocodeStandardResponse>({
    queryKey: ['reverse-geocode', coord?.lat, coord?.lng],
    queryFn: () => getReverseGeocode({ lat: coord!.lat, lng: coord!.lng }),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
