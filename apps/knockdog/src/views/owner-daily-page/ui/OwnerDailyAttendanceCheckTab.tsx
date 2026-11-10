import { useMemo } from 'react';
import { Icon, Switch, TextField, TextFieldInput } from '@knockdog/ui';

import { filterAttendanceList } from '@views/owner-daily-page/lib/ownerDailyAttendance';
import { OwnerDailyAttendanceCard } from '@views/owner-daily-page/ui/OwnerDailyAttendanceCard';
import { OwnerDailySearchEmptyState } from '@views/owner-daily-page/ui/OwnerDailyEmptyStates';

import type { AttendanceCheckinoutCandidate } from '@entities/owner-attendance-checkinout';

interface OwnerDailyAttendanceCheckTabProps {
  items: AttendanceCheckinoutCandidate[];
  dateKey: string;
  now: Date;
  keyword: string;
  lateOnly: boolean;
  onKeywordChange: (keyword: string) => void;
  onLateOnlyChange: (lateOnly: boolean) => void;
  /** 처리 요청이 진행 중인 원생(petId). 이 원생의 처리 버튼은 잠긴다. */
  pendingPetIds: ReadonlySet<string>;
  onCheckIn: (item: AttendanceCheckinoutCandidate) => void;
  onAbsent: (item: AttendanceCheckinoutCandidate) => void;
  onCancelCheckIn?: (item: AttendanceCheckinoutCandidate) => void;
  onCancelAbsent?: (item: AttendanceCheckinoutCandidate) => void;
}

/** `등원처리` 탭. 검색창·`강아지수`·`지각` 토글과 원생 카드 목록을 보여 주고, 조건에 맞는 원생이 없으면 안내를 보여 준다. */
const OwnerDailyAttendanceCheckTab = ({
  items,
  dateKey,
  now,
  keyword,
  lateOnly,
  onKeywordChange,
  onLateOnlyChange,
  pendingPetIds,
  onCheckIn,
  onAbsent,
  onCancelCheckIn,
  onCancelAbsent,
}: OwnerDailyAttendanceCheckTabProps) => {
  const filteredItems = useMemo(
    () => filterAttendanceList(items, { keyword, lateOnly, dateKey, now }),
    [items, keyword, lateOnly, dateKey, now]
  );

  return (
    <div className='flex min-h-full w-full flex-col'>
      <div className='bg-bg-0 px-4 pt-4 pb-3'>
        <TextField
          prefix={<Icon icon='Search' className='size-x6 text-fill-secondary-700' />}
          className='bg-fill-secondary-50 h-x12 relative min-w-0 border-0'
        >
          <TextFieldInput
            type='search'
            placeholder='이름 혹은 견종을 입력해 주세요'
            aria-label='원생 검색'
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
          />
          {keyword ? (
            <button
              type='button'
              aria-label='검색어 지우기'
              className='absolute top-1/2 right-4 flex -translate-y-1/2 cursor-pointer items-center justify-center'
              onClick={() => onKeywordChange('')}
            >
              <Icon icon='DeleteInput' className='size-x5 text-primitive-neutral-700' />
            </button>
          ) : null}
        </TextField>
      </div>
      <div className='flex items-center justify-between px-4 pt-4'>
        <p className='body2-semibold text-text-secondary'>강아지수 {filteredItems.length}</p>
        <label className='flex items-center gap-2'>
          <span className='body2-semibold text-text-secondary'>지각</span>
          <Switch aria-label='지각' pressed={lateOnly} onPressedChange={onLateOnlyChange} />
        </label>
      </div>
      {filteredItems.length === 0 ? (
        <OwnerDailySearchEmptyState />
      ) : (
        <ul className='flex w-full flex-col gap-3 px-4 pt-3'>
          {filteredItems.map((item) => {
            return (
              <OwnerDailyAttendanceCard
                key={item.petId}
                item={item}
                dateKey={dateKey}
                now={now}
                isPending={pendingPetIds.has(item.petId)}
                onCheckIn={onCheckIn}
                onAbsent={onAbsent}
                onCancelCheckIn={onCancelCheckIn}
                onCancelAbsent={onCancelAbsent}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
};

export { OwnerDailyAttendanceCheckTab };
