import { useCallback, useState } from 'react';
import { ActionButton, Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { cva, type VariantProps } from 'class-variance-authority';

import { getCheckInChip, isLateForCheckIn, type CheckInChip } from '@views/owner-daily-page/lib/ownerDailyAttendance';
import { formatKstClock24 } from '@views/owner-daily-page/lib/ownerDailyTime';

import type { AttendanceCheckinoutCandidate } from '@entities/owner-attendance-checkinout';

import { DogMetaLine } from '@shared/ui/dog-meta-line';

interface OwnerDailyAttendanceCardProps {
  item: AttendanceCheckinoutCandidate;
  dateKey: string;
  now: Date;
  /** 이 원생의 처리 요청이 진행 중이면 버튼을 잠근다. */
  isPending: boolean;
  onCheckIn: (item: AttendanceCheckinoutCandidate) => void;
  onAbsent: (item: AttendanceCheckinoutCandidate) => void;
  /** 등원 취소·결석 취소는 이어지는 작업이 연결한다. 연결하기 전에는 눌러도 아무 일도 일어나지 않는다. */
  onCancelCheckIn?: (item: AttendanceCheckinoutCandidate) => void;
  onCancelAbsent?: (item: AttendanceCheckinoutCandidate) => void;
}

const STATUS_CHIP_PROPS: Record<CheckInChip, { status: StatusChipVariant; label: string }> = {
  late: { status: 'late', label: '지각' },
  checkedIn: { status: 'checkedIn', label: '등원완료' },
  absent: { status: 'absent', label: '결석' },
};

const statusChipVariants = cva(
  'caption1-semibold radius-r2 px-x2 inline-flex h-[25px] shrink-0 items-center justify-center',
  {
    variants: {
      status: {
        late: 'bg-fill-primary-50 text-text-accent',
        checkedIn: 'bg-success-light text-success',
        absent: 'bg-fill-secondary-100 text-fill-secondary-500',
      },
    },
  }
);

type StatusChipVariant = NonNullable<VariantProps<typeof statusChipVariants>['status']>;

/** 카드에 보여 줄 시간 문구. 등원 완료·하원 완료는 실제 등원 시각, 등원 전·결석은 예정 시간이다. */
const getTimeLabel = (item: AttendanceCheckinoutCandidate): string => {
  if (item.status === 'CHECKED_IN' || item.status === 'CHECKED_OUT') {
    const checkedInTime = item.checkInAt ? formatKstClock24(item.checkInAt) : '';
    return checkedInTime ? `${checkedInTime} 등원 완료` : '';
  }

  return item.reservedTime ? `${item.reservedTime} 등원 예정` : '';
};

/** 요청사항. 두 줄을 넘어 잘리면 화살표로 펼치고 접는다. */
const OwnerDailyRequestMemo = ({ memo }: { memo: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // 접힌 상태에서 글이 잘리는지 재서 화살표를 보일지 정한다. 펼친 동안에는 재지 않는다.
  const measureOverflow = useCallback(
    (element: HTMLParagraphElement | null) => {
      if (!element || isExpanded) return;
      setIsOverflowing(element.scrollHeight > element.clientHeight);
    },
    // 요청사항 글이 바뀌면 다시 잰다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isExpanded, memo]
  );

  return (
    <div role='group' aria-label='요청사항' className='bg-bg-50 radius-r4 py-x3 gap-x1 px-x5 flex items-start'>
      <p
        ref={measureOverflow}
        className={cn(
          'body2-regular text-fill-secondary-500 min-w-0 flex-1 leading-[21px]',
          !isExpanded && 'line-clamp-1'
        )}
      >
        {memo}
      </p>
      {isOverflowing || isExpanded ? (
        <button
          type='button'
          aria-label='요청사항 더보기'
          aria-expanded={isExpanded}
          className='h-x6 flex shrink-0 cursor-pointer items-center justify-center'
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          <Icon icon={isExpanded ? 'ChevronTop' : 'ChevronBottom'} className='text-fill-secondary-500 size-x5' />
        </button>
      ) : null}
    </div>
  );
};

/** `등원처리` 탭의 원생 카드. 출결 상태에 따라 칩·시간·하단 버튼이 바뀐다. */
const OwnerDailyAttendanceCard = ({
  item,
  dateKey,
  now,
  isPending,
  onCheckIn,
  onAbsent,
  onCancelCheckIn,
  onCancelAbsent,
}: OwnerDailyAttendanceCardProps) => {
  const isLate = isLateForCheckIn({ status: item.status, dateKey, reservedTime: item.reservedTime, now });
  const chip = getCheckInChip({ status: item.status, isLate });
  const chipProps = chip ? STATUS_CHIP_PROPS[chip] : null;
  const genderIcon = item.gender === 'MALE' ? 'Male' : item.gender === 'FEMALE' ? 'Female' : null;
  const timeLabel = getTimeLabel(item);
  const memo = item.requestMemo?.trim() ?? '';

  return (
    <li className='bg-bg-0 radius-r5 p-x5 gap-x3 flex flex-col'>
      <div className='gap-x5 flex flex-col'>
        <div className='gap-x3 flex items-center'>
          <Avatar className='size-x10'>
            {item.profileImageUrl ? <AvatarImage src={item.profileImageUrl} alt='' className='object-cover' /> : null}
            <AvatarFallback role='img' aria-label={`${item.name} 기본 프로필 이미지`} className='bg-bg-50'>
              <Icon icon='Paw' className='text-fill-secondary-400 size-x6' />
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
        {memo ? <OwnerDailyRequestMemo memo={memo} /> : null}
        {timeLabel || chipProps ? (
          <div className='pl-x2 flex h-[25px] items-center justify-between'>
            <p className={cn('label-semibold', isLate ? 'text-text-accent' : 'text-fill-secondary-500')}>{timeLabel}</p>
            {chipProps ? (
              <span className={statusChipVariants({ status: chipProps.status })}>{chipProps.label}</span>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className='border-line-100 gap-x2 flex border-t pt-3'>
        {item.status === 'NOT_CHECKED_IN' ? (
          <>
            <ActionButton
              type='button'
              variant='tertiaryFill'
              size='large'
              className='flex-1 font-bold'
              disabled={isPending}
              onClick={() => onAbsent(item)}
            >
              결석처리
            </ActionButton>
            <ActionButton
              type='button'
              variant='primaryFill'
              size='large'
              className='flex-1 font-bold'
              disabled={isPending}
              onClick={() => onCheckIn(item)}
            >
              등원처리
            </ActionButton>
          </>
        ) : item.status === 'ABSENT' ? (
          <ActionButton
            type='button'
            variant='secondaryLine'
            size='large'
            className='font-bold'
            onClick={() => onCancelAbsent?.(item)}
          >
            결석 취소
          </ActionButton>
        ) : (
          <ActionButton
            type='button'
            variant='secondaryLine'
            size='large'
            className='font-bold'
            onClick={() => onCancelCheckIn?.(item)}
          >
            등원 취소
          </ActionButton>
        )}
      </div>
    </li>
  );
};

export { OwnerDailyAttendanceCard, OwnerDailyRequestMemo };
