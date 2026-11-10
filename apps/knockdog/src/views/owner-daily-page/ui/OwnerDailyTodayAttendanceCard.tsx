import { type KeyboardEvent } from 'react';
import { ActionButton, Avatar, AvatarFallback, AvatarImage, Icon, type ActionButtonProps } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import {
  getTodayListCardView,
  type CardButtonVariant,
  type TodayListButtonKind,
  type TodayListTag,
} from '@views/owner-daily-page/lib/ownerDailyAttendance';

import type { AttendanceCheckinoutTodayItem } from '@entities/owner-attendance-checkinout';

import { formatKstTimeLabel } from '@shared/lib/calendar-date';
import { DogMetaLine } from '@shared/ui/dog-meta-line';

interface OwnerDailyTodayAttendanceCardProps {
  item: AttendanceCheckinoutTodayItem;
  /** 이 원생의 처리 요청이 진행 중이면 하단 버튼을 잠근다. */
  isPending: boolean;
  onMemberClick: (item: AttendanceCheckinoutTodayItem) => void;
  onWriteRecord: (item: AttendanceCheckinoutTodayItem) => void;
  onViewRecord: (item: AttendanceCheckinoutTodayItem) => void;
  onCheckOut: (item: AttendanceCheckinoutTodayItem) => void;
  onCancelCheckOut: (item: AttendanceCheckinoutTodayItem) => void;
}

const TAG_VIEW: Record<TodayListTag, { label: string; className: string }> = {
  checkedIn: { label: '등원완료', className: 'bg-success-light text-success' },
  recordSent: { label: '발송완료', className: 'bg-info-light text-info' },
  checkedOut: { label: '하원완료', className: 'bg-info-light text-info' },
  dayCompleted: { label: '일과 완료', className: 'bg-fill-secondary-100 text-fill-secondary-500' },
  disconnected: { label: '연결해제', className: 'bg-fill-secondary-100 text-fill-secondary-500' },
};

const BUTTON_LABEL: Record<TodayListButtonKind, string> = {
  writeRecord: '알림장 작성하기',
  viewRecord: '알림장 보기',
  checkOut: '하원처리',
  cancelCheckOut: '하원 취소',
};

const BUTTON_VARIANT: Record<CardButtonVariant, NonNullable<ActionButtonProps['variant']>> = {
  orangeFilled: 'primaryFill',
  grayFilled: 'tertiaryFill',
  grayOutline: 'secondaryLine',
};

/** 시각 문구(`등원 오전 9:00`)를 만든다. 시각이 없거나 잘못되면 빈 문자열이다. */
const toTimeText = (label: '등원' | '하원', isoTime: string | null): string => {
  if (!isoTime) return '';
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return '';

  return `${label} ${formatKstTimeLabel(date)}`;
};

/** `등원목록` 탭(오늘)의 원생 카드. 상태 태그 하나와 상태에 맞는 하단 버튼 두 개를 보여 준다. */
const OwnerDailyTodayAttendanceCard = ({
  item,
  isPending,
  onMemberClick,
  onWriteRecord,
  onViewRecord,
  onCheckOut,
  onCancelCheckOut,
}: OwnerDailyTodayAttendanceCardProps) => {
  const { tag, buttons } = getTodayListCardView({
    status: item.status,
    recordSent: item.attendanceRecordSent,
    disconnected: item.disconnected,
  });
  const tagView = TAG_VIEW[tag];
  const genderIcon = item.gender === 'MALE' ? 'Male' : item.gender === 'FEMALE' ? 'Female' : null;
  const checkInText = toTimeText('등원', item.checkInAt);
  const checkOutText = item.status === 'CHECKED_OUT' ? toTimeText('하원', item.checkOutAt) : '';

  const handleButtonClick = (kind: TodayListButtonKind) => {
    const handlers: Record<TodayListButtonKind, (item: AttendanceCheckinoutTodayItem) => void> = {
      writeRecord: onWriteRecord,
      viewRecord: onViewRecord,
      checkOut: onCheckOut,
      cancelCheckOut: onCancelCheckOut,
    };
    handlers[kind](item);
  };

  return (
    <li className='bg-bg-0 radius-r5 p-x5 gap-x3 flex flex-col'>
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
        className={cn('gap-x3 flex flex-col', !item.disconnected && 'cursor-pointer')}
      >
        <div className='gap-x3 flex items-center'>
          <Avatar className='size-x10'>
            {item.profileImageUrl ? <AvatarImage src={item.profileImageUrl} alt='' className='object-cover' /> : null}
            <AvatarFallback role='img' aria-label={`${item.name} 기본 프로필 이미지`} className='bg-bg-50'>
              <Icon icon='Paw' className='text-fill-secondary-300 size-x5' />
            </AvatarFallback>
          </Avatar>
          <div className='gap-x1 flex min-w-0 flex-1 flex-col'>
            <div className='gap-x2 flex min-w-0 items-start justify-between'>
              <div className='gap-x1 flex min-w-0 items-center'>
                <span className='h3-semibold text-text-primary min-w-0 truncate'>{item.name}</span>
                {genderIcon ? <Icon icon={genderIcon} className='text-text-caption size-x4 shrink-0' /> : null}
              </div>
              <span
                className={cn(
                  'caption1-semibold radius-r2 px-x2 inline-flex h-[25px] shrink-0 items-center justify-center',
                  tagView.className
                )}
              >
                {tagView.label}
              </span>
            </div>
            <DogMetaLine
              breed={item.breed}
              weightKg={item.weightKg}
              birthYear={item.birthYear}
              className='caption1-regular text-fill-secondary-500 leading-[18px]'
            />
          </div>
        </div>
        {checkInText || checkOutText ? (
          <div className='bg-bg-50 radius-r3 py-x3 gap-x2 pl-x4 flex items-center'>
            <Icon icon='RsvClock' className='text-text-caption size-x4 shrink-0' />
            {checkInText ? <p className='body2-semibold text-text-secondary'>{checkInText}</p> : null}
            {checkOutText ? <p className='body2-semibold text-text-secondary'>{checkOutText}</p> : null}
          </div>
        ) : null}
      </div>
      {buttons.length > 0 ? (
        <div className='border-line-100 gap-x2 flex border-t pt-3'>
          {buttons.map((button) => (
            <ActionButton
              key={button.kind}
              type='button'
              variant={BUTTON_VARIANT[button.variant]}
              size='large'
              className='flex-1 font-bold'
              disabled={isPending}
              onClick={() => handleButtonClick(button.kind)}
            >
              {BUTTON_LABEL[button.kind]}
            </ActionButton>
          ))}
        </div>
      ) : null}
    </li>
  );
};

export { OwnerDailyTodayAttendanceCard, TAG_VIEW, toTimeText };
