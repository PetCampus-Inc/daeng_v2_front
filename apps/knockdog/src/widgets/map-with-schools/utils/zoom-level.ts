export const REGION_LEVELS = {
  1: { name: 'SIDO', min: 0, max: 10 }, // 광역시/도: ~10
  2: { name: 'SIGUNGU', min: 11, max: 13 }, // 시/군/구: 11~13
  3: { name: 'EUPMYEONDONG', min: 14, max: 20 }, // 읍/면/동: 14~
} as const;

export type RegionLevel = keyof typeof REGION_LEVELS;

export const getRegionLevel = (zoomLevel: number): RegionLevel => {
  if (zoomLevel <= REGION_LEVELS[1].max) return 1;
  if (zoomLevel <= REGION_LEVELS[2].max) return 2;
  return 3;
};

export const getRegionName = (region: RegionLevel) => {
  return REGION_LEVELS[region].name;
};
