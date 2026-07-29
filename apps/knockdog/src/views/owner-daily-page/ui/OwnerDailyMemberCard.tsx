import { ActionButton, Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';

import type { AttendanceMember } from '@views/owner-daily-page/config/ownerDailyContent';

import { TextHighlights } from '@shared/ui/text-highlights';

interface OwnerDailyMemberCardProps {
  member: AttendanceMember;
  normalizedSearchKeyword: string;
  onMemberClick: (memberId: string) => void;
  onAttendanceButtonClick: (member: AttendanceMember) => void;
}

function OwnerDailyMemberCard({
  member,
  normalizedSearchKeyword,
  onMemberClick,
  onAttendanceButtonClick,
}: OwnerDailyMemberCardProps) {
  return (
    <div
      role='button'
      tabIndex={0}
      className='bg-bg-0 radius-r3 flex h-20 w-full cursor-pointer items-center justify-between gap-3 p-4'
      onClick={() => {
        onMemberClick(member.id);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onMemberClick(member.id);
        }
      }}
    >
      <div className='flex h-11 min-w-0 flex-1 gap-2 text-left'>
        <Avatar
          className={`size-x11 shrink-0 border-2 ${
            member.checkedIn ? 'border-fill-primary-500' : 'border-fill-secondary-100'
          }`}
        >
          {member.profileImageUrl && (
            <AvatarImage src={member.profileImageUrl} alt={`${member.name} 프로필 이미지`} className='object-cover' />
          )}
          <AvatarFallback className='bg-fill-secondary-50' />
        </Avatar>
        <div className='flex h-11 min-w-0 flex-1 flex-col justify-center'>
          <div className='flex h-6 min-w-0 items-center gap-1'>
            <span className='body1-extrabold text-text-primary truncate'>
              {TextHighlights(member.name, normalizedSearchKeyword)}
            </span>
            <Icon icon={member.gender === 'MALE' ? 'Male' : 'Female'} className='text-text-accent size-4 shrink-0' />
          </div>
          <span className='body2-regular text-text-secondary truncate'>
            {member.breed} · {member.weightKg}kg{member.age ? ` · ${member.age}살` : ''}
          </span>
        </div>
      </div>
      <div
        className='flex h-12 shrink-0 items-center gap-2'
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {member.checkedIn ? (
          <button
            type='button'
            className='label-semibold text-text-tertiary radius-r1 flex items-center justify-center px-2 py-1'
            onClick={() => {
              onAttendanceButtonClick(member);
            }}
          >
            등원 취소
          </button>
        ) : (
          <ActionButton
            type='button'
            variant='primaryFill'
            size='medium'
            className='h-12 w-[57px] px-0'
            onClick={() => {
              onAttendanceButtonClick(member);
            }}
          >
            등원
          </ActionButton>
        )}
      </div>
    </div>
  );
}

export { OwnerDailyMemberCard };
