import { type KeyboardEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { getPastDayTag, type PastDayTag } from '@views/owner-daily-page/lib/ownerDailyAttendance';
import { TAG_VIEW, toTimeText } from '@views/owner-daily-page/ui/OwnerDailyTodayAttendanceCard';

import type { AttendanceCheckinoutTodayItem } from '@entities/owner-attendance-checkinout';

import { DogMetaLine } from '@shared/ui/dog-meta-line';

interface OwnerDailyPastAttendanceCardProps {
  item: AttendanceCheckinoutTodayItem;
  onMemberClick: (item: AttendanceCheckinoutTodayItem) => void;
}

const PAST_TAG_VIEW: Record<PastDayTag, { label: string; className: string }> = {
  ...TAG_VIEW,
  absent: { label: '결석', className: 'bg-fill-secondary-100 text-text-secondary' },
};

/**
 * `등원목록` 탭(지난 날짜)의 원생 카드. 하단 버튼 없이 시각과 그날의 최종 상태 태그 하나만 보여 준다.
 * 결석 카드는 등원·하원 시각 대신 `등원 예정 HH:MM`을 보여 준다.
 */
const OwnerDailyPastAttendanceCard = ({ item, onMemberClick }: OwnerDailyPastAttendanceCardProps) => {
  const tag = getPastDayTag({
    status: item.status,
    recordSent: item.attendanceRecordSent,
    disconnected: item.disconnected,
  });
  const tagView = tag ? PAST_TAG_VIEW[tag] : null;
  const genderIcon = item.gender === 'MALE' ? 'Male' : item.gender === 'FEMALE' ? 'Female' : null;
  const isAbsent = item.status === 'ABSENT';
  const timeTexts = isAbsent
    ? [item.reservedTime ? `등원 예정 ${item.reservedTime}` : '']
    : [toTimeText('등원', item.checkInAt), item.status === 'CHECKED_OUT' ? toTimeText('하원', item.checkOutAt) : ''];
  const visibleTimeTexts = timeTexts.filter(Boolean);

  return (
    <li className='bg-bg-0 radius-r3 flex flex-col gap-3 p-4'>
      <div
        {...(item.disconnected
          ? {}
          : {
              role: 'button',
              tabIndex: 0,
              onClick: () => onMemberClick(item),
              onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                onMemberClick(item);
              },
            })}
        className={cn('flex flex-col gap-3', !item.disconnected && 'cursor-pointer')}
      >
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
            </div>
            <DogMetaLine
              breed={item.breed}
              weightKg={item.weightKg}
              birthYear={item.birthYear}
              className='body2-regular text-text-secondary'
            />
          </div>
          {tagView ? (
            <span
              className={cn(
                'caption1-semibold radius-full px-x2 py-x1 inline-flex shrink-0 items-center justify-center',
                tagView.className
              )}
            >
              {tagView.label}
            </span>
          ) : null}
        </div>
        {visibleTimeTexts.length > 0 ? (
          <div className='flex items-center gap-4'>
            {visibleTimeTexts.map((text) => (
              <p key={text} className='body2-semibold text-text-primary'>
                {text}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </li>
  );
};

export { OwnerDailyPastAttendanceCard };
