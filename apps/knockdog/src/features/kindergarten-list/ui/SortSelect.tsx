import { useListOptionsUrlState } from '../model/useListOptionsUrlState';
import type { SortType } from '@entities/kindergarten';
import { Dropdown } from '@shared/ui/dropdown';

interface SortOption {
  value: SortType;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'DISTANCE', label: '거리순' },
  { value: 'REVIEW', label: '리뷰 많은 순' },
];

export function SortSelect() {
  const { rank: sortType, setRank: setSortType } = useListOptionsUrlState();

  return <Dropdown options={SORT_OPTIONS} value={sortType} onChange={setSortType} />;
}
