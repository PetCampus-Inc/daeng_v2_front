import type { AttendanceCheckinoutTodayItem } from '@entities/owner-attendance-checkinout';

interface OwnerDailyAttendanceListTabProps {
  items: AttendanceCheckinoutTodayItem[];
}

/** `등원목록` 탭. 지금은 뼈대라 등원 처리된 원생 이름만 보여 준다. (필터 칩·카드·하원 처리는 이어지는 작업에서 채운다) */
const OwnerDailyAttendanceListTab = ({ items }: OwnerDailyAttendanceListTabProps) => {
  return (
    <ul className='flex w-full flex-col gap-3 px-4 pt-5'>
      {items.map((item) => (
        <li key={item.petId} className='bg-bg-0 radius-r3 flex items-center gap-2 p-4'>
          <span className='body1-extrabold text-text-primary'>{item.name}</span>
        </li>
      ))}
    </ul>
  );
};

export { OwnerDailyAttendanceListTab };
