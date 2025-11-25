import { useQueryState, parseAsString, parseAsArrayOf, createParser } from 'nuqs';

export type SortType = 'DISTANCE' | 'REVIEW';

const SORT_PARSER = createParser<SortType>({
  parse: (value: string) => {
    if (!value) return 'DISTANCE';
    return value as SortType;
  },
  serialize: (value) => value,
});

/** Kindergarten Search List URL 상태를 관리하는 훅
 *
 * @description
 * - query: 검색어
 * - filters: 필터
 * - sort: 정렬 방식
 */
export function useSearchUrlState() {
  const [query, setQuery] = useQueryState('query', parseAsString.withDefault(''));
  const [filters, setFilters] = useQueryState('filters', parseAsArrayOf(parseAsString).withDefault([]));
  const [sort, setSort] = useQueryState('sort', SORT_PARSER.withDefault('DISTANCE'));

  return { query, filters, sort, setQuery, setFilters, setSort };
}
