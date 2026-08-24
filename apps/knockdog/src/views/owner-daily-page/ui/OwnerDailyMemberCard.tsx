import { ActionButton, Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';

import type { AttendanceMember } from '@views/owner-daily-page/config/ownerDailyContent';

import { DogMetaLine } from '@shared/ui/dog-meta-line';
import { TextHighlights } from '@shared/ui/text-highlights';

interface OwnerDailyMemberCardProps {
  member: AttendanceMember;
  searchKeyword: string;
  onMemberClick: (memberId: string) => void;
  onAttendanceButtonClick: (member: AttendanceMember) => void;
}

function OwnerDailyMemberCard({
  member,
  searchKeyword,
  onMemberClick,
  onAttendanceButtonClick,
}: OwnerDailyMemberCardProps) {
  return (
    <div className='bg-bg-0 radius-r3 flex h-20 w-full min-w-0 items-center justify-between overflow-hidden'>
      <button
        type='button'
        className='flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 p-4 pr-0 text-left'
        onClick={() => {
          onMemberClick(member.id);
        }}
      >
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
        <div className='flex h-11 min-w-0 flex-1 flex-col justify-center overflow-hidden'>
          <div className='flex h-6 min-w-0 w-full items-center gap-1'>
            <span className='body1-extrabold text-text-primary min-w-0 truncate'>
              {TextHighlights(member.name, searchKeyword)}
            </span>
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
            searchKeyword={searchKeyword}
            className='body2-regular text-text-secondary'
          />
        </div>
      </button>
      <div className='flex h-full shrink-0 items-center gap-2 px-4'>
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
