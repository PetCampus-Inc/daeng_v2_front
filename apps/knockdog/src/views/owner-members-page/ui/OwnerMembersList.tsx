'use client';

import Image from 'next/image';
import {
  ownerMembersEmptyContent,
  type OwnerMembersEmptyStateType,
} from '@views/owner-members-page/config/ownerMembersEmptyContent';

import { StudentTicketListItem } from '@knockdog/ui';

import type { OwnerMember } from '@entities/owner-member';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';

interface OwnerMembersListProps {
  members: OwnerMember[];
  emptyStateType: OwnerMembersEmptyStateType | null;
  isLoading: boolean;
  isError: boolean;
  isRetrying: boolean;
  onRetry: () => void;
}

function OwnerMembersEmptyState({ emptyStateType }: { emptyStateType: OwnerMembersEmptyStateType }) {
  const content = ownerMembersEmptyContent[emptyStateType];

  return (
    <div className='flex min-h-0 w-full flex-1 items-center justify-center pb-[calc(var(--bottom-bar-height)+88px)]'>
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

function OwnerMembersList({ members, emptyStateType, isLoading, isError, isRetrying, onRetry }: OwnerMembersListProps) {
  const { push } = useStackNavigation();

  /** 원생 상세 프로필 화면으로 이동한다. 열 수 없으면 토스트로 알린다 */
  const handleOpenMember = async (member: OwnerMember) => {
    if (!member.petId) {
      toast({ nativeTitle: '원생 프로필을 열 수 없어요', title: '원생 프로필을 열 수 없어요' });
      return;
    }

    try {
      await push({ pathname: route.owner.members.detail.root.replace('[id]', member.petId) });
    } catch {
      toast({ nativeTitle: '원생 프로필을 열 수 없어요', title: '원생 프로필을 열 수 없어요' });
    }
  };

  if (isLoading) {
    return (
      <DelayedLoadingSpinner
        isLoading={isLoading}
        layout='content'
        className='min-h-0 w-full flex-1 pb-[calc(var(--bottom-bar-height)+88px)]'
      />
    );
  }

  if (isError) return <PageError layout='inline' onRetry={onRetry} isRetrying={isRetrying} />;

  if (emptyStateType) return <OwnerMembersEmptyState emptyStateType={emptyStateType} />;

  return (
    <div className='min-h-0 w-full flex-1 overflow-y-auto pb-[calc(var(--bottom-bar-height)+88px)]'>
      {members.map((member) => (
        <StudentTicketListItem
          key={member.id}
          role='button'
          tabIndex={0}
          className='cursor-pointer'
          name={member.dogName}
          guardian={member.guardianLine}
          sex={member.gender}
          avatarSrc={member.profileImageUrl}
          avatarAlt={`${member.dogName} 프로필 이미지`}
          status={member.statusBadge}
          ticketSummary={member.ticketSummary}
          onClick={() => void handleOpenMember(member)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              void handleOpenMember(member);
            }
          }}
        />
      ))}
    </div>
  );
}

export { OwnerMembersList };
