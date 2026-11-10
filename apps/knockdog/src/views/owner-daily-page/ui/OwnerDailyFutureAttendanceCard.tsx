import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';

import { formatReservedTimeLabel } from '@views/owner-daily-page/lib/ownerDailyTime';
import { OwnerDailyRequestMemo } from '@views/owner-daily-page/ui/OwnerDailyAttendanceCard';

import type { AttendanceCheckinoutCandidate } from '@entities/owner-attendance-checkinout';

import { DogMetaLine } from '@shared/ui/dog-meta-line';

interface OwnerDailyFutureAttendanceCardProps {
  item: AttendanceCheckinoutCandidate;
  /** 보고 있는 날짜 키(`YYYY-MM-DD`). 예약 시간을 그 날짜의 시각으로 바꾸는 데 쓴다. */
  dateKey: string;
}

/** `등원목록` 탭(미래 날짜)의 원생 카드. 처리 버튼 없이 `첫등원` 칩·요청사항·등원 예정 시간만 보여 준다. */
const OwnerDailyFutureAttendanceCard = ({ item, dateKey }: OwnerDailyFutureAttendanceCardProps) => {
  const genderIcon = item.gender === 'MALE' ? 'Male' : item.gender === 'FEMALE' ? 'Female' : null;
  const memo = item.requestMemo?.trim() ?? '';
  const timeLabel = formatReservedTimeLabel(dateKey, item.reservedTime);

  return (
    <li className='bg-bg-0 radius-r5 p-x5 gap-x4 flex flex-col'>
      <div className='gap-x3 flex items-center'>
        <Avatar className='size-x10'>
          {item.profileImageUrl ? <AvatarImage src={item.profileImageUrl} alt='' className='object-cover' /> : null}
          <AvatarFallback role='img' aria-label={`${item.name} 기본 프로필 이미지`} className='bg-bg-50'>
            <Icon icon='Paw' className='text-fill-secondary-300 size-x5' />
          </AvatarFallback>
        </Avatar>
        <div className='gap-x1 flex min-w-0 flex-1 flex-col'>
          <div className='gap-x1 flex min-w-0 items-center'>
            <span className='h3-semibold text-text-primary min-w-0 truncate'>{item.name}</span>
            {genderIcon ? <Icon icon={genderIcon} className='text-text-caption size-x4 shrink-0' /> : null}
            {item.firstAttendance ? (
              <span className='caption1-semibold bg-fill-primary-50 text-text-accent radius-r3 px-x2 inline-flex h-[26px] shrink-0 items-center'>
                첫등원
              </span>
            ) : null}
          </div>
          <DogMetaLine
            breed={item.breed}
            weightKg={item.weightKg}
            birthYear={item.birthYear}
            className='caption1-regular text-fill-secondary-500 leading-[18px]'
          />
        </div>
      </div>
      <div className='gap-x3 flex flex-col'>
        {memo ? <OwnerDailyRequestMemo memo={memo} /> : null}
        {timeLabel ? (
          <p className='body2-regular text-text-secondary gap-x2 px-x3 flex items-center'>
            <Icon icon='RsvClock' className='text-text-caption size-x4 shrink-0' />
            {`등원 예정 ${timeLabel}`}
          </p>
        ) : null}
      </div>
    </li>
  );
};

export { OwnerDailyFutureAttendanceCard };
