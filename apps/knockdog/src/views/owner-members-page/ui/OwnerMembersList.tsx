import { OwnerMemberCard } from '@features/owner-members';
import { RingLoadingSpinner } from '@shared/ui/loading-spinner';

import type { OwnerMember } from '@entities/owner-member';
import { OwnerMemberMoreMenu } from '@views/owner-members-page/ui/OwnerMemberMoreMenu';

interface OwnerMembersListProps {
  members: OwnerMember[];
  isLoading: boolean;
  isError: boolean;
  onDisconnectMember: (memberId: string) => void;
}

function OwnerMembersList({ members, isLoading, isError, onDisconnectMember }: OwnerMembersListProps) {
  if (isLoading) {
    return (
      <div className='flex min-h-0 w-full flex-1 items-center justify-center pb-(--bottom-bar-height)'>
        <RingLoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex min-h-0 w-full flex-1 items-center justify-center pb-(--bottom-bar-height)'>
        <div className='px-x4 flex h-x14 w-full flex-col items-center justify-center gap-y-1 text-center'>
          <p className='h2-extrabold text-text-primary'>구성원 목록을 불러오지 못했어요</p>
          <p className='body1-regular text-text-secondary'>잠시 후 다시 시도해 주세요.</p>
        </div>
      </div>
    );
  }

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
