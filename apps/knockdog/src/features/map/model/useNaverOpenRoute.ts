'use client';

import { useCallback } from 'react';
import { useBridge } from '@shared/lib/bridge';
import { METHODS } from '@knockdog/bridge-core';

type NaverRouteMode = 'car' | 'public' | 'walk' | 'bicycle';

interface OpenNaverRouteParams {
  mode: NaverRouteMode;
  to: { lat: number; lng: number; name?: string };
  from: { lat: number; lng: number; name?: string }; // 없으면 현재 위치
}

function assertParamsValid(params: OpenNaverRouteParams) {
  if (!params || !params.to) throw new Error('naver.openRoute: "to" 가 필요합니다.');
  const { lat, lng } = params.to;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('naver.openRoute: "to.lat" 와 "to.lng"는 숫자여야 합니다.');
  }
  if (params.from) {
    const { lat: slat, lng: slng } = params.from;
    if (typeof slat !== 'number' || typeof slng !== 'number') {
      throw new Error('naver.openRoute: "from.lat" 와 "from.lng"는 숫자여야 합니다.');
    }
  }
  if (!['car', 'public', 'walk', 'bicycle'].includes(params.mode)) {
    throw new Error('naver.openRoute: 유효하지 않은 모드입니다.');
  }
}

function useNaverOpenRoute() {
  const bridge = useBridge();

  const openNaverRoute = useCallback(
    async (params: OpenNaverRouteParams) => {
      assertParamsValid(params);
      await bridge.request(METHODS.naverOpenRoute, params);
    },
    [bridge]
  );

  return openNaverRoute;
}

export { useNaverOpenRoute };
