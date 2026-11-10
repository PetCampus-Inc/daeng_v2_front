import { Avatar, AvatarFallback, AvatarImage, Icon, RsvStatusBadge } from '@knockdog/ui';

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
    <li className='bg-bg-0 radius-r3 flex flex-col gap-3 p-4'>
      <div className='flex items-start gap-3'>
        <Avatar className='size-14'>
          {item.profileImageUrl ? <AvatarImage src={item.profileImageUrl} alt='' className='object-cover' /> : null}
          <AvatarFallback role='img' aria-label={`${item.name} 기본 프로필 이미지`} className='bg-bg-50'>
            <Icon icon='Paw' className='text-fill-secondary-400 size-6' />
          </AvatarFallback>
        </Avatar>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <div className='flex min-w-0 items-center gap-1'>
            <span className='body1-extrabold text-text-primary min-w-0 truncate'>{item.name}</span>
            {genderIcon ? <Icon icon={genderIcon} className='text-text-accent size-5 shrink-0' /> : null}
            {item.firstAttendance ? <RsvStatusBadge status='confirmed'>첫등원</RsvStatusBadge> : null}
          </div>
          <DogMetaLine
            breed={item.breed}
            weightKg={item.weightKg}
            birthYear={item.birthYear}
            className='body2-regular text-text-secondary'
          />
        </div>
      </div>
      {memo ? <OwnerDailyRequestMemo memo={memo} /> : null}
      {timeLabel ? <p className='body2-semibold text-text-primary'>{`등원 예정 ${timeLabel}`}</p> : null}
    </li>
  );
};

export { OwnerDailyFutureAttendanceCard };
