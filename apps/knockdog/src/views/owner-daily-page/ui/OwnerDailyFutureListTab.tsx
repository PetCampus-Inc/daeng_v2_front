import { OwnerDailyFutureAttendanceCard } from '@views/owner-daily-page/ui/OwnerDailyFutureAttendanceCard';

import type { AttendanceCheckinoutCandidate } from '@entities/owner-attendance-checkinout';

interface OwnerDailyFutureListTabProps {
  items: AttendanceCheckinoutCandidate[];
  dateKey: string;
}

/** `등원목록` 탭(미래 날짜). 그날 예약한 원생을 서버가 준 순서 그대로 조회 전용 카드로 보여 준다. */
const OwnerDailyFutureListTab = ({ items, dateKey }: OwnerDailyFutureListTabProps) => {
  return (
    <ul className='flex w-full flex-col gap-3 px-4 pt-3'>
      {items.map((item) => (
        <OwnerDailyFutureAttendanceCard key={item.petId} item={item} dateKey={dateKey} />
      ))}
    </ul>
  );
};

export { OwnerDailyFutureListTab };
