'use client';

import { useSyncExternalStore } from 'react';

const EMPTY_PLACE_IDS = new Set<string>();

let placeIds = EMPTY_PLACE_IDS;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getWrittenKindergartenPlaceIds() {
  return placeIds;
}

/** 리뷰 작성 API 연동 전. 등록이 끝나면 같은 유치원 작성 버튼을 숨긴다. */
function markWrittenKindergartenReview(placeId: string) {
  if (!placeId || placeIds.has(placeId)) return;

  const nextPlaceIds = new Set(placeIds);
  nextPlaceIds.add(placeId);
  placeIds = nextPlaceIds;
  listeners.forEach((listener) => listener());
}

function useWrittenKindergartenPlaceIds() {
  return useSyncExternalStore(subscribe, getWrittenKindergartenPlaceIds, () => EMPTY_PLACE_IDS);
}

export { markWrittenKindergartenReview, useWrittenKindergartenPlaceIds };
