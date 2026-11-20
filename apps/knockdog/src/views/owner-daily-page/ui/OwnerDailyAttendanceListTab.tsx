import { StatusFilterChip } from '@knockdog/ui';

import {
  OwnerDailyFilterEmptyState,
  OwnerDailyNoAttendanceState,
} from '@views/owner-daily-page/ui/OwnerDailyEmptyStates';
import { OwnerDailyTodayAttendanceCard } from '@views/owner-daily-page/ui/OwnerDailyTodayAttendanceCard';

import type {
  AttendanceCheckinoutToday,
  AttendanceCheckinoutTodayItem,
  TodayAttendanceFilter,
} from '@entities/owner-attendance-checkinout';

interface OwnerDailyAttendanceListTabProps {
  todayList: AttendanceCheckinoutToday;
  /** 선택한 필터 칩. `undefined`는 `전체`다. */
  filter: TodayAttendanceFilter | undefined;
  onFilterChange: (filter: TodayAttendanceFilter | undefined) => void;
  /** 요청이 진행 중인 원생(petId). 이 원생의 하단 버튼은 잠긴다. */
  pendingPetIds: ReadonlySet<string>;
  onMemberClick: (item: AttendanceCheckinoutTodayItem) => void;
  onWriteRecord: (item: AttendanceCheckinoutTodayItem) => void;
  onViewRecord: (item: AttendanceCheckinoutTodayItem) => void;
  onCheckOut: (item: AttendanceCheckinoutTodayItem) => void;
  onCancelCheckOut: (item: AttendanceCheckinoutTodayItem) => void;
}

/** `등원목록` 탭(오늘). 필터 칩(전체·재원중·발송전)과 등원한 원생 카드 목록을 보여 준다. */
const OwnerDailyAttendanceListTab = ({
  todayList,
  filter,
  onFilterChange,
  pendingPetIds,
  onMemberClick,
  onWriteRecord,
  onViewRecord,
  onCheckOut,
  onCancelCheckOut,
}: OwnerDailyAttendanceListTabProps) => {
  const { counts, items } = todayList;
  const chips: { label: string; count: number; value: TodayAttendanceFilter | undefined }[] = [
    { label: '전체', count: counts.all, value: undefined },
    { label: '재원중', count: counts.currentlyIn, value: 'CURRENTLY_IN' },
    { label: '발송전', count: counts.unsentRecord, value: 'UNSENT_RECORD' },
  ];

  // 등원한 원생이 아예 없으면 칩 없이 안내만 보여 준다.
  if (counts.all === 0) {
    return (
      <div className='flex min-h-full w-full flex-col'>
        <OwnerDailyNoAttendanceState />
      </div>
    );
  }

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
        <ul className='mb-[88px] flex w-full flex-col gap-3 px-4 pt-3'>
          {items.map((item) => (
            <OwnerDailyTodayAttendanceCard
              key={item.petId}
              item={item}
              isPending={pendingPetIds.has(item.petId)}
              onMemberClick={onMemberClick}
              onWriteRecord={onWriteRecord}
              onViewRecord={onViewRecord}
              onCheckOut={onCheckOut}
              onCancelCheckOut={onCancelCheckOut}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export { OwnerDailyAttendanceListTab };
