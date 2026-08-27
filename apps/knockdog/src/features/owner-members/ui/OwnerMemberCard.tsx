import type { ReactNode } from 'react';

import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';

interface OwnerMemberCardMember {
  dogName: string;
  guardianName: string;
  profileImageUrl?: string | null;
}

interface OwnerMemberCardProps {
  member: OwnerMemberCardMember;
  rightAddon?: ReactNode;
  onClick?: () => void;
}

function OwnerMemberCard({ member, rightAddon, onClick }: OwnerMemberCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`border-line-100 p-x4 gap-x2 flex h-[84px] w-full items-center border-b ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <Avatar className='border-fill-secondary-100 size-x11 shrink-0 border-2'>
        {member.profileImageUrl && (
          <AvatarImage src={member.profileImageUrl} alt={`${member.dogName} 프로필 이미지`} className='object-cover' />
        )}
        <AvatarFallback className='bg-bg-50'>
          <Icon icon='Paw' className='text-fill-secondary-300 size-5' aria-hidden='true' />
        </AvatarFallback>
      </Avatar>

      <div className='flex h-x11 min-w-0 flex-1 flex-col'>
        <div className='body1-bold text-text-primary h-x6 truncate'>{member.dogName}</div>
        <div className='body2-regular text-text-primary gap-x1 flex h-x5 min-w-0 items-center'>
          <span className='truncate'>{member.guardianName}</span>
          <span className='shrink-0'>보호자</span>
        </div>
      </div>

      {rightAddon ? (
        <div
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {rightAddon}
        </div>
      ) : null}
    </div>
  );
}

export { OwnerMemberCard };
export type { OwnerMemberCardMember };
