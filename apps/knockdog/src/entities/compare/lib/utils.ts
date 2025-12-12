import type { KindergartenComparison, ProductType, TransportationType } from '../model/compare';
import type { SimpleComparisonItem } from '../model/compare-result';

/**
 * URLSearchParams에서 유치원 ID 목록을 추출합니다.
 * @param searchParams URLSearchParams 객체
 * @returns 유치원 ID 배열
 */
function resolveIds(searchParams: URLSearchParams): string[] {
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

function s3ToUrl(s3Key?: string) {
  if (!s3Key) return undefined;
  const CDN = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  return CDN ? `${CDN}${encodeURI(s3Key)}` : undefined;
}

function mapToSimpleItem(kg: KindergartenComparison): SimpleComparisonItem {
  return {
    name: kg.name,
    avatar: s3ToUrl(kg.thumbnailS3Key) ?? '',
  };
}

function getProduct(kg?: KindergartenComparison | null, prodType?: ProductType | null) {
  return kg?.pricing?.products?.find((product) => product?.productType === prodType) ?? null;
}

function getTransitTime(
  kg?: KindergartenComparison | null,
  refPoint: string = 'HOME',
  mode: TransportationType = 'WALKING'
) {
  return (
    kg?.distance
      ?.find((distance) => distance?.referencePoint === refPoint)
      ?.transitTimes?.find((transit) => transit?.type === mode)?.time ?? '-'
  );
}

function getDistanceString(kg?: KindergartenComparison | null, refPoint: string = 'HOME') {
  return kg?.distance?.find((distance) => distance?.referencePoint === refPoint)?.distance ?? '-';
}

export { resolveIds, s3ToUrl, mapToSimpleItem, getProduct, getTransitTime, getDistanceString };
