import { StatusFilterChip } from '@knockdog/ui';

import { OwnerDailyTodayAttendanceCard } from '@views/owner-daily-page/ui/OwnerDailyTodayAttendanceCard';

import type { AttendanceCheckinoutToday, AttendanceCheckinoutTodayItem } from '@entities/owner-attendance-checkinout';

interface OwnerDailyAttendanceListTabProps {
  todayList: AttendanceCheckinoutToday;
  onMemberClick: (item: AttendanceCheckinoutTodayItem) => void;
}

/** `등원목록` 탭(오늘). 필터 칩(전체·재원중·발송전)과 등원한 원생 카드 목록을 보여 준다. */
const OwnerDailyAttendanceListTab = ({ todayList, onMemberClick }: OwnerDailyAttendanceListTabProps) => {
  const { counts, items } = todayList;
  const chips = [
    { label: '전체', count: counts.all },
    { label: '재원중', count: counts.currentlyIn },
    { label: '발송전', count: counts.unsentRecord },
  ];

  return (
    <div className='flex min-h-full w-full flex-col'>
      <div role='group' aria-label='필터' className='bg-bg-0 flex gap-2 px-4 py-3'>
        {chips.map((chip, index) => (
          <StatusFilterChip key={chip.label} selected={index === 0}>
            {`${chip.label} ${chip.count}`}
          </StatusFilterChip>
        ))}
      </div>
      <ul className='flex w-full flex-col gap-3 px-4 pt-3'>
        {items.map((item) => (
          <OwnerDailyTodayAttendanceCard key={item.petId} item={item} onMemberClick={onMemberClick} />
        ))}
      </ul>
    </div>
  );
};

export { OwnerDailyAttendanceListTab };
