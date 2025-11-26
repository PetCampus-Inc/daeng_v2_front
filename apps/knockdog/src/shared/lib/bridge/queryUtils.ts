import type { ReadonlyURLSearchParams } from 'next/navigation';

type QueryValue = string | number | boolean | null | undefined;
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
