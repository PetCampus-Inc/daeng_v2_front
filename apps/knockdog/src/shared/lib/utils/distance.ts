const DEFAULT_KM_MAXIMUM_FRACTION_DIGITS = 1;
type DistanceUnit = 'meter' | 'kilometer';

const UNIT_MULTIPLIER: Record<DistanceUnit, number> = {
  meter: 1,
  kilometer: 1000,
};

interface FormatDistanceOptions {
  /** 입력 거리 단위 */
  unit?: DistanceUnit;
  /** km 최대 소수점 자릿수 */
  kmMaximumFractionDigits?: number;
  /** km 최소 소수점 자릿수 */
  kmMinimumFractionDigits?: number;
  /** 로케일 */
  locale?: string;
}

/**
 * 주어진 거리를 미터 단위로 판단해 1,000m 이상이면 km로,
 * 그 외는 m로 변환해 문자열을 반환한다.
 *
 * @param distance - 거리 값
 * @param options - 출력 포맷 옵션
 */
export function formatDistance(distance: number | string, options: FormatDistanceOptions = {}): string {
  const {
    kmMaximumFractionDigits = DEFAULT_KM_MAXIMUM_FRACTION_DIGITS,
    kmMinimumFractionDigits = 0,
    locale = 'ko-KR',
    unit = 'kilometer',
  } = options;

  const numericDistance = typeof distance === 'string' ? Number(distance) : distance;

  if (!Number.isFinite(numericDistance)) {
    throw new Error('formatDistance: distance must be a finite number');
  }

  const distanceInMeters = numericDistance * UNIT_MULTIPLIER[unit];

  if (distanceInMeters >= 1000) {
    const valueInKilometers = distanceInMeters / 1000;
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: kmMinimumFractionDigits,
      maximumFractionDigits: kmMaximumFractionDigits,
    });

    return `${formatter.format(valueInKilometers)}km`;
  }

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `${formatter.format(Math.round(distanceInMeters))}m`;
}
