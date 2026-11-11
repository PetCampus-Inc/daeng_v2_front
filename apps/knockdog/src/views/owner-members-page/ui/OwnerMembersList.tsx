'use client';

import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { ownerMembersContent } from '@views/owner-members-page/config/ownerMembersContent';
import {
  ownerMembersEmptyContent,
  type OwnerMembersEmptyStateType,
} from '@views/owner-members-page/config/ownerMembersEmptyContent';

import { StudentTicketListItem } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { ownerMembersQueryKey, type OwnerMember } from '@entities/owner-member';
import { getOwnerPet, isPetNotAuthorizedError, ownerPetQueryKey } from '@entities/owner-pet';
import { useUserStore } from '@entities/user';
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
        <div
          className={cn(
            'relative h-[160px] w-[200px] opacity-100',
            (emptyStateType === 'emptyExpiring' || emptyStateType === 'emptyExpired') && 'h-[200px]'
          )}
        >
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
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);

  /** 원생 상세 프로필 화면으로 이동한다. 열 수 없으면 토스트로 알린다 */
  const handleOpenMember = async (member: OwnerMember) => {
    if (!member.petId) {
      toast({ nativeTitle: '원생 프로필을 열 수 없어요', title: '원생 프로필을 열 수 없어요' });
      return;
    }

    // 보호자나 다른 기기에서 먼저 해제해 목록이 오래됐을 수 있어 먼저 해제 여부를 확인한다.
    // 받은 응답은 프로필 화면의 원생 조회와 같은 캐시에 저장해 프로필이 다시 요청하지 않게 한다
    try {
      const petId = member.petId;
      await queryClient.fetchQuery({
        queryKey: ownerPetQueryKey(petId),
        queryFn: () => getOwnerPet(petId),
        staleTime: 0,
      });
    } catch (error) {
      if (isPetNotAuthorizedError(error)) {
        toast({ title: ownerMembersContent.alreadyDisconnectedToast });
        queryClient.invalidateQueries({ queryKey: ownerMembersQueryKey(userId) }).catch(() => undefined);
        return;
      }
      // 그 밖의 조회 실패는 프로필 화면이 자체 오류 처리로 보여준다
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
