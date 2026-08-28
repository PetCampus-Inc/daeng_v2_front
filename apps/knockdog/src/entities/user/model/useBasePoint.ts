'use client';

import { useEffect, useMemo } from 'react';

import { useUserStore } from '@entities/user';
import { useGeolocationQuery } from '@shared/lib';
import { useBasePointType } from '@shared/store';

export function useBasePoint() {
  const { selectedBaseType, setBaseType } = useBasePointType();
  const user = useUserStore((state) => state.user);

  const { data: currentLocation } = useGeolocationQuery({ enabled: selectedBaseType === 'CURRENT' });

  const homeAddress = useMemo(() => user?.addresses?.find((address) => address.type === 'HOME'), [user?.addresses]);
  const workAddress = useMemo(() => user?.addresses?.find((address) => address.type === 'WORK'), [user?.addresses]);

  // 이전에 집/직장을 기준점으로 선택해둔 채로 해당 주소가 삭제되면, 선택 상태가
  // 남아있는 채로 좌표만 없어져 토글이 "선택됨"으로 보이면서 조용히 깨진다.
  // 주소가 없어지면 기준점을 현재 위치로 되돌린다.
  useEffect(() => {
    if (!user) return;
    if (selectedBaseType === 'HOME' && !homeAddress) setBaseType('CURRENT');
    if (selectedBaseType === 'WORK' && !workAddress) setBaseType('CURRENT');
  }, [user, selectedBaseType, homeAddress, workAddress, setBaseType]);

  const coord = useMemo(() => {
    switch (selectedBaseType) {
      case 'CURRENT':
        return currentLocation;
      case 'HOME':
        return homeAddress ? { lat: homeAddress.lat, lng: homeAddress.lng } : undefined;
      case 'WORK':
        return workAddress ? { lat: workAddress.lat, lng: workAddress.lng } : undefined;
      default:
        return undefined;
    }
  }, [selectedBaseType, currentLocation, homeAddress, workAddress]);

  return {
    type: selectedBaseType,
    coord,
  };
}
