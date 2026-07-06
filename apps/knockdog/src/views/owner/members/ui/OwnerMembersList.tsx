import { Icon } from '@knockdog/ui';
import { OwnerMemberCard } from '@features/owner-members';

import type { OwnerMember } from '@views/owner/members/config/ownerMembersContent';

interface OwnerMembersListProps {
  members: OwnerMember[];
}

function OwnerMembersList({ members }: OwnerMembersListProps) {
  return (
    <div className='min-h-0 w-full flex-1 overflow-y-auto pb-(--bottom-bar-height)'>
      {members.map((member) => (
        <OwnerMemberCard
          key={member.id}
          member={member}
          rightAddon={
            <button
              type='button'
              aria-label={`${member.dogName} 더보기`}
              className='flex size-10 shrink-0 items-center justify-center'
            >
              <Icon icon='More' className='size-6 rotate-90 text-fill-secondary-700' />
            </button>
          }
        />
      ))}
    </div>
  );
}

export { OwnerMembersList };
