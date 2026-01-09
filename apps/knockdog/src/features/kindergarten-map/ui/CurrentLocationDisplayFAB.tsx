import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CurrentLocationDisplay } from './CurrentLocationDisplay';
import { DEFAULT_MAP_ZOOM_LEVEL } from '../config/map';
import { getRegionLevel } from '../lib/markers';
import { geoQueries } from '../api/geoQueries';
import { useSearchMachine } from '../model/useSearchMachine';

export function CurrentLocationDisplayFAB() {
  const { liveState } = useSearchMachine();

  const hasValidCenter = !!liveState.center && liveState.center.lat !== 0 && liveState.center.lng !== 0;

  const { data: address } = useQuery({
    ...geoQueries.reverseGeocode({
      lat: liveState.center?.lat ?? 0,
      lng: liveState.center?.lng ?? 0,
      zoomLevel: liveState.zoom,
    }),
    enabled: hasValidCenter,
    placeholderData: hasValidCenter ? keepPreviousData : undefined,
  });

  const resolvedZoomLevel = liveState.zoom ?? DEFAULT_MAP_ZOOM_LEVEL;
  const regionLevel = getRegionLevel(resolvedZoomLevel);

  const getDisplayAddress = () => {
    if (!address) return null;

    if (regionLevel === 1) {
      return address.region_2depth_name;
    }

    if (regionLevel === 2) {
      return address.region_2depth_name;
    }

    if (regionLevel === 3) {
      return `${address.region_2depth_name} ${address.region_3depth_name}`;
    }

    return address.address_name;
  };

  return <CurrentLocationDisplay address={getDisplayAddress()} />;
}
