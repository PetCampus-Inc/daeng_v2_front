import { Dropdown } from '@shared/ui/dropdown';

import {
  SORT_OPTIONS,
  type OwnerMemberSortType,
} from '@views/owner/members/config/ownerMembersContent';

interface OwnerMembersSummaryBarProps {
  totalMemberCount: number;
  sortType: OwnerMemberSortType;
  onSortTypeChange: (sortType: OwnerMemberSortType) => void;
}

function OwnerMembersSummaryBar({ totalMemberCount, sortType, onSortTypeChange }: OwnerMembersSummaryBarProps) {
  return (
    <div className='px-x4 py-x2 flex h-x13 w-full shrink-0 items-center justify-between'>
      <div className='body2-bold text-text-primary gap-x1 flex h-x5 w-[73px] items-center text-center'>
        <span>전체 원생</span>
        <span className='text-text-accent'>{totalMemberCount}</span>
      </div>

      <Dropdown
        options={SORT_OPTIONS}
        value={sortType}
        onChange={onSortTypeChange}
        triggerClassName='h-x9 w-[116px] justify-end rounded-full pr-x3'
        labelClassName='whitespace-nowrap'
        iconClassName='size-x4 text-fill-secondary-500'
      />
    </div>
  );
}

export { OwnerMembersSummaryBar };
