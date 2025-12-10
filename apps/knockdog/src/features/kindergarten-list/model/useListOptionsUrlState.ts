import { useQueryState, createParser } from 'nuqs';

type SortType = 'DISTANCE' | 'REVIEW';

const isSortType = (value: string): value is SortType => {
  return value === 'DISTANCE' || value === 'REVIEW';
};

const SORT_PARSER = createParser<SortType>({
  parse: (value: string) => {
    if (!value || !isSortType(value)) return 'DISTANCE';
    return value;
  },
  serialize: (value) => value,
});
/** Kindergarten Search List URL 상태를 관리하는 훅
 *
 * @description
 * - rank: 정렬 방식
 */
export function useListOptionsUrlState() {
  const [rank, setRank] = useQueryState('rank', SORT_PARSER.withDefault('DISTANCE'));

  return { rank, setRank };
}
