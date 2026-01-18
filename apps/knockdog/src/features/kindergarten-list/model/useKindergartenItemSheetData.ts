import { useKindergartenMainQuery } from '@features/kindergarten-main';
import type { KindergartenListItem, KindergartenMain } from '@entities/kindergarten';

interface UseKindergartenItemSheetDataParams {
  item: KindergartenListItem;
  coords: { lat: number; lng: number };
}

function toFallbackMain(item: KindergartenListItem, fallbackCoords: { lat: number; lng: number }): KindergartenMain {
  const coord = item.coord ?? fallbackCoords;
  return {
    id: item.id,
    title: item.title,
    ctg: item.ctg as KindergartenMain['ctg'],
    operationTimes: item.operationTimes,
    operationStatus: item.operationStatus,
    operationDescription: '',
    price: item.price,
    dist: item.dist,
    coords: {
      lat: coord.lat,
      lng: coord.lng,
    },
    roadAddress: item.roadAddress,
    reviewCount: item.reviewCount,
    serviceTags: item.serviceTags,
    pickupType: item.pickupType,
    banner: item.banner ?? [],
    bookmarked: false,
    memo: undefined,
    phoneNumber: item.phoneNumber,
  };
}

export function useKindergartenItemSheetData({ item, coords }: UseKindergartenItemSheetDataParams) {
  const { data: mainData } = useKindergartenMainQuery({ id: item.id, lng: coords.lng, lat: coords.lat });
  const fallbackMainData = toFallbackMain(item, coords);

  return {
    displayData: mainData ?? fallbackMainData,
  };
}
