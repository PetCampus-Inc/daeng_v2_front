import type { ReadonlyURLSearchParams } from 'next/navigation';

type QueryValue = string | number | boolean | string[] | number[] | null | undefined;
export type Query = Record<string, QueryValue>;

/**
 * URLSearchParams를 Query 객체로 변환
 * @param searchParams - Next.js의 useSearchParams()에서 반환된 값
 * @returns Query 타입 객체
 */
export function searchParamsToQuery(searchParams: ReadonlyURLSearchParams | null | undefined): Query {
  if (!searchParams) return {};

  const query: Query = {};
  searchParams.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

/**
 * pathname과 query 객체를 조합하여 href 문자열을 생성
 * @param pathname - 경로 문자열
 * @param query - 쿼리 파라미터 객체
 * @returns 쿼리 문자열이 포함된 href
 */
export function buildHref(pathname: string, query?: Query): string {
  const params = new URLSearchParams();

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value)) {
        // 배열인 경우 각 값을 append하여 ids=aaa&ids=bbb 형식으로 만듦
        for (const item of value) {
          params.append(key, String(item));
        }
      } else {
        params.set(key, String(value));
      }
    }
  }

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

/** 네이티브 WebView: 현재 origin 기준 (Tab/Stack origin 불일치 방지) */
export function buildNativeFullPath(pathname: string): string {
  if (pathname.startsWith('http://') || pathname.startsWith('https://')) {
    return pathname;
  }

  const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_WEB_URL ?? '');

  return `${baseUrl}/${normalizedPath}`;
}
