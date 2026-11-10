import { getCheckInChip, isLateForCheckIn } from '@views/owner-daily-page/lib/ownerDailyAttendance';
import type { AttendanceCheckinoutCandidate } from '@entities/owner-attendance-checkinout';

interface OwnerDailyAttendanceCheckTabProps {
  items: AttendanceCheckinoutCandidate[];
  dateKey: string;
  now: Date;
}

/** `등원처리` 탭. 지금은 뼈대라 예약 원생을 이름·예정 시간·지각 칩으로만 보여 준다. (카드·검색·처리 버튼은 이어지는 작업에서 채운다) */
const OwnerDailyAttendanceCheckTab = ({ items, dateKey, now }: OwnerDailyAttendanceCheckTabProps) => {
  return (
    <ul className='flex w-full flex-col gap-3 px-4 pt-5'>
      {items.map((item) => {
        const isLate = isLateForCheckIn({ status: item.status, dateKey, reservedTime: item.reservedTime, now });
        const chip = getCheckInChip({ status: item.status, isLate });

        return (
          <li key={item.petId} className='bg-bg-0 radius-r3 flex items-center gap-2 p-4'>
            <span className='body1-extrabold text-text-primary'>{item.name}</span>
            <span className='body2-regular text-text-secondary'>{item.reservedTime}</span>
            {chip === 'late' ? <span className='caption1-semibold text-text-accent'>지각</span> : null}
          </li>
        );
      })}
    </ul>
  );
};

export { OwnerDailyAttendanceCheckTab };
