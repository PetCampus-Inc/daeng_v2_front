import { useKindergartenMainQuery } from '@features/kindergarten-main';
import type { KindergartenListItem, KindergartenMain } from '@entities/kindergarten';

interface UseKindergartenItemSheetDataParams {
  item: KindergartenListItem;
  position: { lat: number; lng: number };
}

function toFallbackMain(item: KindergartenListItem, fallbackCoords: { lat: number; lng: number }): KindergartenMain {
  const coords = item.coords ?? fallbackCoords;
  return {
    id: item.id,
    title: item.title,
    ctg: item.ctg as KindergartenMain['ctg'],
    operationTimes: item.operationTimes,
    operationStatus: item.operationStatus,
    operationDescription: item.operationDescription,
    price: item.price,
    dist: item.dist,
    coords: {
      lat: coords.lat,
      lng: coords.lng,
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

export function useKindergartenItemSheetData({ item, position }: UseKindergartenItemSheetDataParams) {
  const { data: mainData } = useKindergartenMainQuery({ id: item.id, lng: position.lng, lat: position.lat });
  const fallbackMainData = toFallbackMain(item, position);

  return {
    displayData: mainData ?? fallbackMainData,
  };
}
