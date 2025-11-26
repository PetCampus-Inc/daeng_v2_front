import { useQueryState, parseAsString, createParser } from 'nuqs';
import { FILTER_OPTIONS, FilterOption } from '@entities/kindergarten';

type SortType = 'DISTANCE' | 'REVIEW';

const isSortType = (value: string): value is SortType => {
  return value === 'DISTANCE' || value === 'REVIEW';
};

const isFilterOption = (value: string): value is FilterOption => {
  return Object.keys(FILTER_OPTIONS).includes(value);
};

const SORT_PARSER = createParser<SortType>({
  parse: (value: string) => {
    if (!value || !isSortType(value)) return 'DISTANCE';
    return value;
  },
  serialize: (value) => value,
});

const FILTERS_PARSER = createParser<FilterOption[]>({
  parse: (value: string) => {
    if (!value) return [];
    return value.split(',').filter(isFilterOption);
  },
  serialize: (value) => value.join(','),
});

/** Kindergarten Search List URL 상태를 관리하는 훅
 *
 * @description
 * - query: 검색어
 * - filters: 필터
 * - rank: 정렬 방식
 */
export function useSearchUrlState() {
  const [query, setQuery] = useQueryState('query', parseAsString.withDefault(''));
  const [filters, setFilters] = useQueryState('filters', FILTERS_PARSER.withDefault([]));
  const [rank, setRank] = useQueryState('rank', SORT_PARSER.withDefault('DISTANCE'));

  return { query, filters, rank, setQuery, setFilters, setRank };
}
