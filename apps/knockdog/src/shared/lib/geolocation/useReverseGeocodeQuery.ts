'use client';

import { useQuery } from '@tanstack/react-query';

// @TODO : 리팩토링 필요할듯 FSD 위치나 이런것들 고려해서
export interface ReverseGeocodeParams {
  lat: number;
  lng: number;
}

// API 응답 구조
interface RawAddressItem {
  zipcode?: string;
  type?: 'road' | 'parcel';
  text?: string;
  structure?: {
    level0?: string;
    level1?: string;
    level2?: string;
    level3?: string;
    level4L?: string;
    level4A?: string;
    level5?: string;
    detail?: string;
  };
  [x: string]: unknown;
}

// 내부적으로 사용하는 정규화된 구조
interface VWorldAddressItem {
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
  result: RawAddressItem[];
}

export function extractVWorldItems(data: ReverseGeocodeStandardResponse | undefined): VWorldAddressItem[] {
  if (!data?.result) return [];

  const roadItem = data.result.find((item) => item.type === 'road');
  const parcelItem = data.result.find((item) => item.type === 'parcel');

  // 도로명 주소가 있으면 그걸 우선으로 사용
  const primaryItem = roadItem || parcelItem;

  if (!primaryItem) return [];

  return [
    {
      text: primaryItem.text,
      address: {
        road: roadItem?.text,
        parcel: parcelItem?.text,
        zipcode: primaryItem.zipcode,
      },
    },
  ];
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
