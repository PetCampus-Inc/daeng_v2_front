'use client';

import { useMemo } from 'react';

import { useUserStore } from '@entities/user';
import { useGeolocationQuery } from '@shared/lib';
import { useBasePointType } from '@shared/store';

export function useBasePoint() {
  const { selectedBaseType } = useBasePointType();
  const user = useUserStore((state) => state.user);

  const { data: currentLocation } = useGeolocationQuery(selectedBaseType === 'CURRENT');

  const homeAddress = useMemo(() => user?.addresses?.find((address) => address.type === 'HOME'), [user?.addresses]);
  const workAddress = useMemo(() => user?.addresses?.find((address) => address.type === 'WORK'), [user?.addresses]);

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
