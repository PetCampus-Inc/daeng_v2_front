import Image from 'next/image';
import {
  ownerMembersEmptyContent,
  type OwnerMembersEmptyStateType,
} from '@views/owner-members-page/config/ownerMembersEmptyContent';
import { OwnerMemberMoreMenu } from '@views/owner-members-page/ui/OwnerMemberMoreMenu';

import { OwnerMemberCard } from '@features/owner-members';

import type { OwnerMember } from '@entities/owner-member';

interface OwnerMembersListProps {
  members: OwnerMember[];
  emptyStateType: OwnerMembersEmptyStateType | null;
  isLoading: boolean;
  isError: boolean;
  onDisconnectMember: (memberId: string) => Promise<void>;
}

function OwnerMembersEmptyState({ emptyStateType }: { emptyStateType: OwnerMembersEmptyStateType }) {
  const content = ownerMembersEmptyContent[emptyStateType];

  return (
    <div className='flex min-h-0 w-full flex-1 items-center justify-center pb-(--bottom-bar-height)'>
      <div className='px-x4 flex w-full flex-col items-center justify-center gap-y-2 text-center'>
        <div className='relative h-[160px] w-[200px] opacity-100'>
          <Image src={content.imageSrc} alt={content.imageAlt} fill className='object-contain' sizes='200px' />
        </div>
        <div className='flex flex-col items-center gap-y-1'>
          <p className='h2-extrabold text-text-primary'>{content.title}</p>
          <p className='body1-regular text-text-secondary'>{content.description}</p>
        </div>
      </div>
    </div>
  );
}

function OwnerMembersList({
  members,
  emptyStateType,
  isLoading,
  isError,
  onDisconnectMember,
}: OwnerMembersListProps) {
  if (isLoading) {
    return <div className='min-h-0 w-full flex-1 pb-(--bottom-bar-height)' />;
  }

  if (isError) {
    return (
      <div className='flex min-h-0 w-full flex-1 items-center justify-center pb-(--bottom-bar-height)'>
        <div className='flex h-x14 w-full flex-col items-center justify-center gap-y-1 text-center'>
          <p className='h2-extrabold text-text-primary'>구성원 목록을 불러오지 못했어요</p>
          <p className='body1-regular text-text-secondary'>잠시 후 다시 시도해 주세요.</p>
        </div>
      </div>
    );
  }

  if (emptyStateType) {
    return <OwnerMembersEmptyState emptyStateType={emptyStateType} />;
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
