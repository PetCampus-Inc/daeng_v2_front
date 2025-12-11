import {
  CLOSED_DAYS,
  KindergartenComparison,
  ProductType,
  SimpleComparisonItem,
  TransportationType,
} from '../model/types';

export function resolveIds(searchParams: URLSearchParams): string[] {
  // ids=aaa&ids=bbb
  const repeated = searchParams.getAll('ids').filter(Boolean);
  if (repeated.length >= 2) return repeated;
  // ids=aaa,bbb
  const commaJoined = searchParams.get('ids');
  if (commaJoined) {
    return commaJoined
      .split(',')
      .map((text) => text.trim())
      .filter(Boolean);
  }
  return [];
}

export function s3ToUrl(s3Key?: string) {
  if (!s3Key) return undefined;
  const CDN = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  return CDN ? `${CDN}${encodeURI(s3Key)}` : undefined;
}

/* =========================
 * SUMMARY CALCULATION
 * ========================= */

// TODO: api 수정 후 parseTimeStrToMinutes 메서드 삭제
export function extractDistance(refPoint: string, transportType: TransportationType) {
  return (kg: KindergartenComparison): number => parseTimeStrToMinutes(getTransitTime(kg, refPoint, transportType));
}

// 시간 문자열을 분으로 변환 ("2시간 49분" -> 169)
export function parseTimeStrToMinutes(timeStr: string): number {
  if (!timeStr) return 0;

  let totalMinutes = 0;
  const hourMatch = timeStr.match(/(\d+)시간/);
  const minMatch = timeStr.match(/(\d+)분/);

  if (hourMatch) totalMinutes += parseInt(hourMatch[1] || '0') * 60;
  if (minMatch) totalMinutes += parseInt(minMatch[1] || '0');

  return totalMinutes;
}

// 분 단위를 시간 문자열로 변환 (169 -> "2시간 49분")
export function parseMinutesToTimeStr(minutes: number): string {
  if (!minutes) {
    return '-';
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}시간`);
  }
  if (mins > 0) {
    parts.push(`${mins}분`);
  }

  return parts.join(' ');
}

export function mapToSimpleItem(kg: KindergartenComparison): SimpleComparisonItem {
  return {
    name: kg.name,
    avatar: s3ToUrl(kg.thumbnailS3Key) ?? '',
  };
}

/* =========================
 * DETAILS CALCULATION
 * ========================= */

type ProdKey = ProductType;

export const getProduct = (kg?: KindergartenComparison | null, prodType?: ProdKey | null) =>
  kg?.pricing?.products?.find((product) => product?.productType === prodType) ?? null;

export const getProductMin = (kg?: KindergartenComparison | null, prodType?: ProdKey | null) =>
  getProduct(kg, prodType)?.min?.price ?? null;

export const getProductMax = (kg?: KindergartenComparison | null, prodType?: ProdKey | null) =>
  getProduct(kg, prodType)?.max?.price ?? null;

export const getTransitTime = (
  kg?: KindergartenComparison | null,
  refPoint: string = 'HOME',
  mode: TransportationType = 'WALKING'
) =>
  kg?.distance
    ?.find((distance) => distance?.referencePoint === refPoint)
    ?.transitTimes?.find((transit) => transit?.type === mode)?.time ?? '-';

export const getDistanceString = (kg?: KindergartenComparison | null, refPoint: string = 'HOME') =>
  kg?.distance?.find((distance) => distance?.referencePoint === refPoint)?.distance ?? '-';

export const getClosedDaysText = (kg?: KindergartenComparison | null) =>
  (kg?.operatingSchedule?.closedDays ?? []).map((dayKey) => CLOSED_DAYS[dayKey]).join(', ') || '-';
