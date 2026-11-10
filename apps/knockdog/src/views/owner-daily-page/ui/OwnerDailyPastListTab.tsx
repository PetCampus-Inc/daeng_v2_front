import { StatusFilterChip } from '@knockdog/ui';

import { OwnerDailyFilterEmptyState } from '@views/owner-daily-page/ui/OwnerDailyEmptyStates';
import { OwnerDailyPastAttendanceCard } from '@views/owner-daily-page/ui/OwnerDailyPastAttendanceCard';

import type {
  AttendanceCheckinoutToday,
  AttendanceCheckinoutTodayItem,
  TodayAttendanceFilter,
} from '@entities/owner-attendance-checkinout';

interface OwnerDailyPastListTabProps {
  todayList: AttendanceCheckinoutToday;
  /** 선택한 필터 칩. `undefined`는 `전체`다. */
  filter: TodayAttendanceFilter | undefined;
  onFilterChange: (filter: TodayAttendanceFilter | undefined) => void;
  onMemberClick: (item: AttendanceCheckinoutTodayItem) => void;
}

/** `등원목록` 탭(지난 날짜). 필터 칩(전체·재원중·발송전·결석)과 조회 전용 원생 카드 목록을 보여 준다. */
const OwnerDailyPastListTab = ({
  todayList,
  filter,
  onFilterChange,
  onMemberClick,
}: OwnerDailyPastListTabProps) => {
  const { counts, items } = todayList;
  const chips: { label: string; count: number; value: TodayAttendanceFilter | undefined }[] = [
    { label: '전체', count: counts.all, value: undefined },
    { label: '재원중', count: counts.currentlyIn, value: 'CURRENTLY_IN' },
    { label: '발송전', count: counts.unsentRecord, value: 'UNSENT_RECORD' },
    { label: '결석', count: counts.absent, value: 'ABSENT' },
  ];

  return (
    <div className='flex min-h-full w-full flex-col'>
      <div role='group' aria-label='필터' className='bg-bg-0 flex gap-2 px-4 py-3'>
        {chips.map((chip) => (
          <StatusFilterChip
            key={chip.label}
            selected={chip.value === filter}
            onClick={() => onFilterChange(chip.value)}
          >
            {`${chip.label} ${chip.count}`}
          </StatusFilterChip>
        ))}
      </div>
      {items.length === 0 ? (
        <OwnerDailyFilterEmptyState />
      ) : (
        <ul className='flex w-full flex-col gap-3 px-4 pt-3'>
          {items.map((item) => (
            <OwnerDailyPastAttendanceCard key={item.petId} item={item} onMemberClick={onMemberClick} />
          ))}
        </ul>
      )}
    </div>
  );
};

export { OwnerDailyPastListTab };
