import { useEffect, useMemo, useState } from 'react';
import { Chip } from '@knockdog/ui';

import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
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
  initialSelectedFilter?: TodayAttendanceFilter;
  isLoading?: boolean;
  isError?: boolean;
  onCheckOutButtonClick: (member: AttendanceMember) => void;
  onMemberClick: (memberId: string) => void;
  onNoticebookButtonClick: (member: AttendanceMember) => void;
}

function TodayAttendanceTab({
  items,
  initialSelectedFilter = 'all',
  isLoading = false,
  isError = false,
  onCheckOutButtonClick,
  onMemberClick,
  onNoticebookButtonClick,
}: TodayAttendanceTabProps) {
  const [selectedFilter, setSelectedFilter] = useState<TodayAttendanceFilter>(initialSelectedFilter);
  const filteredItems = useMemo(
    () => items.filter((member) => matchesTodayAttendanceFilter(member, selectedFilter)),
    [items, selectedFilter]
  );

  useEffect(() => {
    setSelectedFilter(initialSelectedFilter);
  }, [initialSelectedFilter]);

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
      {isLoading ? (
        <DelayedLoadingSpinner isLoading={isLoading} layout='content' />
      ) : isError ? (
        <div className='flex min-h-0 flex-1 items-center justify-center px-4 text-center'>
          <div className='flex flex-col items-center gap-1'>
            <p className='h2-extrabold text-text-primary'>오늘 등원 목록을 불러오지 못했어요</p>
            <p className='body1-regular text-text-secondary'>잠시 후 다시 시도해 주세요.</p>
          </div>
        </div>
      ) : items.length === 0 ? (
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
export type { TodayAttendanceFilter };
