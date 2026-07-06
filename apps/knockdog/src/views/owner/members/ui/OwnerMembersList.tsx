import { OwnerMemberCard } from '@features/owner-members';

import type { OwnerMember } from '@views/owner/members/config/ownerMembersContent';
import { OwnerMemberMoreMenu } from '@views/owner/members/ui/OwnerMemberMoreMenu';

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
          rightAddon={<OwnerMemberMoreMenu dogName={member.dogName} />}
        />
      ))}
    </div>
  );
}

export { OwnerMembersList };
