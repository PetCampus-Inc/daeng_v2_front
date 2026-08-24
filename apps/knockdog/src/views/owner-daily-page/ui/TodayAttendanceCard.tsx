import { type KeyboardEvent } from 'react';
import { ActionButton, Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';

import type { AttendanceMember } from '@views/owner-daily-page/config/ownerDailyContent';

import { DogMetaLine } from '@shared/ui/dog-meta-line';

interface TodayAttendanceCardProps {
  member: AttendanceMember;
  onCheckOutButtonClick: (member: AttendanceMember) => void;
  onMemberClick: (memberId: string) => void;
  onNoticebookButtonClick: (member: AttendanceMember) => void;
}

function TodayAttendanceCard({
  member,
  onCheckOutButtonClick,
  onMemberClick,
  onNoticebookButtonClick,
}: TodayAttendanceCardProps) {
  const status = getTodayAttendanceStatus(member);
  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    onMemberClick(member.id);
  };

  return (
    <div
      role='button'
      tabIndex={0}
      className='bg-bg-0 radius-r3 focus-visible:ring-line-accent flex h-[192px] w-full min-w-0 cursor-pointer flex-col items-stretch gap-4 overflow-hidden p-4 text-left focus-visible:ring-2 focus-visible:outline-none'
      onClick={() => onMemberClick(member.id)}
      onKeyDown={handleCardKeyDown}
    >
      <div className='flex h-24 w-full min-w-0 flex-col gap-4'>
        <div className='flex h-11 w-full min-w-0 items-start justify-between gap-4'>
          <div className='flex h-11 min-w-0 flex-1 items-center gap-2 overflow-hidden'>
            <Avatar className='size-x11 shrink-0'>
              {member.profileImageUrl && (
                <AvatarImage src={member.profileImageUrl} alt={`${member.name} 프로필 이미지`} className='object-cover' />
              )}
              <AvatarFallback className='bg-fill-secondary-50' />
            </Avatar>
            <div className='flex h-11 min-w-0 flex-1 flex-col items-start overflow-hidden'>
              <div className='flex h-6 min-w-0 w-full items-center gap-1'>
                <span className='body1-extrabold text-text-primary min-w-0 truncate'>{member.name}</span>
                {member.gender ? (
                  <Icon
                    icon={member.gender === 'MALE' ? 'Male' : 'Female'}
                    className='text-text-accent size-4 shrink-0'
                  />
                ) : null}
              </div>
              <DogMetaLine
                breed={member.breed}
                weightKg={member.weightKg}
                age={member.age}
                className='body2-regular text-text-secondary'
              />
            </div>
          </div>
          {status ? <TodayAttendanceStatusBadge status={status} /> : null}
        </div>
        <div className='bg-bg-50 radius-r2 flex h-9 w-full items-center gap-4 px-4 py-2'>
          {member.checkedInTime ? <AttendanceTime label='등원' time={member.checkedInTime} /> : null}
          {member.checkedOut && member.checkedOutTime ? (
            <AttendanceTime label='하원' time={member.checkedOutTime} />
          ) : null}
        </div>
      </div>
      <div className='flex h-12 w-full items-start gap-2'>
        <ActionButton
          type='button'
          variant={member.checkedOut ? 'secondaryLine' : 'primaryLine'}
          size='medium'
          className='flex-1'
          onClick={(event) => {
            event.stopPropagation();
            onCheckOutButtonClick(member);
          }}
        >
          {member.checkedOut ? '하원 취소' : '하원'}
        </ActionButton>
        <ActionButton
          type='button'
          variant={member.noticebookSent ? 'tertiaryFill' : 'primaryFill'}
          size='medium'
          className='flex-1'
          onClick={(event) => {
            event.stopPropagation();
            onNoticebookButtonClick(member);
          }}
        >
          {member.noticebookSent ? '작성한 알림장 보기' : '알림장 작성하기'}
        </ActionButton>
      </div>
    </div>
  );
}

type TodayAttendanceStatus = 'sent' | 'checked-out' | 'completed';

function getTodayAttendanceStatus(member: AttendanceMember): TodayAttendanceStatus | null {
  if (member.checkedOut && member.noticebookSent) return 'completed';
  if (member.checkedOut) return 'checked-out';
  if (member.noticebookSent) return 'sent';

  return null;
}

interface TodayAttendanceStatusBadgeProps {
  status: TodayAttendanceStatus;
}

function TodayAttendanceStatusBadge({ status }: TodayAttendanceStatusBadgeProps) {
  const statusContent = {
    sent: {
      label: '발송 완료',
      className: 'bg-info-light text-info-bold',
    },
    'checked-out': {
      label: '하원 완료',
      className: 'bg-success-light text-success-bold',
    },
    completed: {
      label: '일과 완료',
      className: 'border border-line-200 bg-bg-0 text-text-secondary',
    },
  }[status];

  return (
    <div className={`flex h-[26px] shrink-0 items-center justify-center rounded-full px-2 py-1 ${statusContent.className}`}>
      <span className='caption1-semibold flex h-[18px] items-center whitespace-nowrap text-center'>
        {statusContent.label}
      </span>
    </div>
  );
}

interface AttendanceTimeProps {
  label: '등원' | '하원';
  time: string;
}

function AttendanceTime({ label, time }: AttendanceTimeProps) {
  return (
    <div className='flex h-5 flex-1 items-center gap-2'>
      <div className='flex h-[18px] w-[39px] items-center gap-0.5'>
        <Icon icon='Time' className='size-4 text-fill-secondary-400' />
        <span className='caption1-semibold text-text-tertiary flex h-[18px] items-center'>{label}</span>
      </div>
      <span className='body2-semibold text-text-secondary flex h-5 items-center'>{time}</span>
    </div>
  );
}

export { TodayAttendanceCard };
