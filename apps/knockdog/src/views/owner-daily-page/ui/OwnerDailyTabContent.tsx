import type { ChangeEvent } from 'react';
import { Icon, TextField, TextFieldInput } from '@knockdog/ui';

import type { AttendanceMember } from '@views/owner-daily-page/config/ownerDailyContent';
import {
  OwnerDailyNoMembersState,
  // OwnerDailyNoUncheckedState,
  OwnerDailySearchEmptyState,
} from '@views/owner-daily-page/ui/OwnerDailyEmptyStates';
import { OwnerDailyMemberCard } from '@views/owner-daily-page/ui/OwnerDailyMemberCard';

import { FilterChip } from '@features/kindergarten-list';

interface OwnerDailyTabContentProps {
  items: AttendanceMember[];
  hasConnectedMembers: boolean;
  normalizedSearchKeyword: string;
  searchKeyword: string;
  showBeforeFilter?: boolean;
  onBeforeFilterClick?: () => void;
  onSearchKeywordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearSearchKeyword: () => void;
  onInviteGuardianClick: () => void;
  onMemberClick: (memberId: string) => void;
  onAttendanceButtonClick: (member: AttendanceMember) => void;
}

function OwnerDailyTabContent({
  items,
  hasConnectedMembers,
  normalizedSearchKeyword,
  searchKeyword,
  showBeforeFilter,
  onBeforeFilterClick,
  onSearchKeywordChange,
  onClearSearchKeyword,
  onInviteGuardianClick,
  onMemberClick,
  onAttendanceButtonClick,
}: OwnerDailyTabContentProps) {
  return (
    <div className='flex min-h-full w-full flex-col gap-5 pt-5'>
      <div className='px-4'>
        <TextField
          prefix={<Icon icon='Search' className='size-x6 text-fill-secondary-700' />}
          className='border-line-600 bg-fill-secondary-0 h-x12 shadow-[0px_1px_6px_0px_rgba(16,24,40,0.12)]'
        >
          <TextFieldInput
            type='search'
            value={searchKeyword}
            onChange={onSearchKeywordChange}
            placeholder='강아지명, 보호자명을 검색해 보세요'
            aria-label='검색어 입력'
          />
          {searchKeyword && (
            <button
              type='button'
              onMouseDown={(event) => {
                event.preventDefault();
                onClearSearchKeyword();
              }}
              aria-label='검색어 초기화'
              className='absolute top-1/2 right-4 flex -translate-y-1/2 cursor-pointer items-center justify-center'
            >
              <Icon icon='DeleteInput' className='size-x5 text-primitive-neutral-700' />
            </button>
          )}
        </TextField>
      </div>
      {(!normalizedSearchKeyword || !hasConnectedMembers) && (
        <div className='flex h-9 w-full items-center justify-between px-4'>
          <p className='body1-bold text-text-primary'>{hasConnectedMembers ? `${items.length}마리` : '원생 없음'}</p>
          {onBeforeFilterClick ? (
            <FilterChip type='button' variant='status' activated={showBeforeFilter} onClick={onBeforeFilterClick}>
              등원 전
            </FilterChip>
          ) : null}
        </div>
      )}
      {!hasConnectedMembers ? (
        <OwnerDailyNoMembersState onInviteGuardianClick={onInviteGuardianClick} />
      ) : normalizedSearchKeyword && items.length === 0 ? (
        <OwnerDailySearchEmptyState />
      // ) : showBeforeFilter && items.length === 0 ? (
      //   <OwnerDailyNoUncheckedState />
      ) : (
        <div className='flex w-full flex-col gap-4 px-4 pb-5'>
          {items.map((member) => (
            <OwnerDailyMemberCard
              key={member.id}
              member={member}
              normalizedSearchKeyword={normalizedSearchKeyword}
              onMemberClick={onMemberClick}
              onAttendanceButtonClick={onAttendanceButtonClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { OwnerDailyTabContent };
