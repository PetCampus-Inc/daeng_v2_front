import { useQuery } from '@tanstack/react-query';
import { CurrentLocationDisplay } from './CurrentLocationDisplay';
import { DEFAULT_MAP_ZOOM_LEVEL } from '../config/map';
import { getRegionLevel } from '../lib/markers';
import { useMapUrlState } from '../model/useMapUrlState';
import { geoQueries } from '../api/geoQueries';

export function CurrentLocationDisplayFAB() {
  const { center, zoomLevel } = useMapUrlState();

  const { data: address } = useQuery(
    geoQueries.reverseGeocode({
      lat: center?.lat ?? 0,
      lng: center?.lng ?? 0,
      zoomLevel,
    })
  );

  const resolvedZoomLevel = zoomLevel ?? DEFAULT_MAP_ZOOM_LEVEL;
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
