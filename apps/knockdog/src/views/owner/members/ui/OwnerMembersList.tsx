'use client';

import { OwnerMemberCard } from '@features/owner-members';
import { useStackNavigation } from '@shared/lib/bridge';

import type { OwnerMember } from '@views/owner/members/config/ownerMembersContent';
import { OwnerMemberMoreMenu } from '@views/owner/members/ui/OwnerMemberMoreMenu';

interface OwnerMembersListProps {
  members: OwnerMember[];
  onDisconnectMember: (memberId: string) => void;
}

function OwnerMembersList({ members, onDisconnectMember }: OwnerMembersListProps) {
  const { push } = useStackNavigation();

  if (members.length === 0) {
    return (
      <div className='flex min-h-0 w-full flex-1 items-center justify-center pb-(--bottom-bar-height)'>
        <div className='px-x4 flex h-x14 w-full flex-col items-center justify-center gap-y-1 text-center'>
          <p className='h2-extrabold text-text-primary'>연결된 원생이 없어요</p>
          <p className='body1-regular text-text-secondary'>보호자를 초대하고 유치원을 운영해 보세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-0 w-full flex-1 overflow-y-auto pb-(--bottom-bar-height)'>
      {members.map((member) => (
        <OwnerMemberCard
          key={member.id}
          member={member}
          onClick={() => push({ pathname: `/owner/members/${member.id}` })}
          rightAddon={
            <OwnerMemberMoreMenu
              memberId={member.id}
              dogName={member.dogName}
              onDisconnect={onDisconnectMember}
            />
          }
        />
      ))}
    </div>
  );
}

export { OwnerMembersList };
