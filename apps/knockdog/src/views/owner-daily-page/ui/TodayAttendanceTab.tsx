import { useMemo, useState } from 'react';
import { Chip } from '@knockdog/ui';

import type { AttendanceMember } from '@views/owner-daily-page/config/ownerDailyContent';
import {
  OwnerDailyFilterEmptyState,
  OwnerDailyNoAttendanceState,
} from '@views/owner-daily-page/ui/OwnerDailyEmptyStates';
import { TodayAttendanceCard } from '@views/owner-daily-page/ui/TodayAttendanceCard';

type TodayAttendanceFilter = 'all' | 'checked-in' | 'noticebook-pending';

const FILTER_OPTIONS: { value: TodayAttendanceFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'checked-in', label: '재원 중' },
  { value: 'noticebook-pending', label: '발송 전' },
];

interface TodayAttendanceTabProps {
  items: AttendanceMember[];
  onCheckOutButtonClick: (member: AttendanceMember) => void;
  onMemberClick: (memberId: string) => void;
  onNoticebookButtonClick: (member: AttendanceMember) => void;
}

function TodayAttendanceTab({
  items,
  onCheckOutButtonClick,
  onMemberClick,
  onNoticebookButtonClick,
}: TodayAttendanceTabProps) {
  const [selectedFilter, setSelectedFilter] = useState<TodayAttendanceFilter>('all');
  const filteredItems = useMemo(
    () => items.filter((member) => matchesTodayAttendanceFilter(member, selectedFilter)),
    [items, selectedFilter]
  );

  return (
    <div className='flex min-h-full w-full flex-col gap-4 pt-5'>
      <div className='flex h-[38px] w-full items-center gap-2 px-4'>
        {FILTER_OPTIONS.map((option) => (
          <Chip.Toggle
            key={option.value}
            variant='outline'
            checked={selectedFilter === option.value}
            onChange={() => setSelectedFilter(option.value)}
          >
            <Chip.Label>{option.label}</Chip.Label>
          </Chip.Toggle>
        ))}
      </div>
      {items.length === 0 ? (
        <OwnerDailyNoAttendanceState />
      ) : filteredItems.length === 0 ? (
        <OwnerDailyFilterEmptyState />
      ) : (
        <div className='flex w-full flex-col gap-4 px-4 pb-5'>
          {filteredItems.map((member) => (
            <TodayAttendanceCard
              key={member.id}
              member={member}
              onCheckOutButtonClick={onCheckOutButtonClick}
              onMemberClick={onMemberClick}
              onNoticebookButtonClick={onNoticebookButtonClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function matchesTodayAttendanceFilter(member: AttendanceMember, filter: TodayAttendanceFilter) {
  if (filter === 'checked-in') return !member.checkedOut;
  if (filter === 'noticebook-pending') return !member.noticebookSent;

  return true;
}

export { TodayAttendanceTab };
