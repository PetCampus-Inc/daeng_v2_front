import type { ReactNode } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@knockdog/ui';

interface OwnerMemberCardMember {
  dogName: string;
  guardianName: string;
  profileImageUrl?: string | null;
}

interface OwnerMemberCardProps {
  member: OwnerMemberCardMember;
  rightAddon?: ReactNode;
}

function OwnerMemberCard({ member, rightAddon }: OwnerMemberCardProps) {
  return (
    <div className='border-line-100 p-x4 gap-x2 flex h-[84px] w-full items-center border-b'>
      <Avatar className='border-fill-secondary-100 size-x11 shrink-0 border-2'>
        {member.profileImageUrl && (
          <AvatarImage src={member.profileImageUrl} alt={`${member.dogName} 프로필 이미지`} className='object-cover' />
        )}
        <AvatarFallback className='bg-fill-secondary-50' />
      </Avatar>

      <div className='flex h-x11 min-w-0 flex-1 flex-col'>
        <div className='body1-bold text-text-primary h-x6 truncate'>{member.dogName}</div>
        <div className='body2-regular text-text-primary gap-x1 flex h-x5 min-w-0 items-center'>
          <span className='truncate'>{member.guardianName}</span>
          <span className='shrink-0'>보호자</span>
        </div>
      </div>

      {rightAddon}
    </div>
  );
}

export { OwnerMemberCard };
export type { OwnerMemberCardMember };
