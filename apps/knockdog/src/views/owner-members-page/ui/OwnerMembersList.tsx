'use client';

import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { ownerMembersContent } from '@views/owner-members-page/config/ownerMembersContent';
import {
  ownerMembersEmptyContent,
  type OwnerMembersEmptyStateType,
} from '@views/owner-members-page/config/ownerMembersEmptyContent';

import { OwnerMemberCard } from '@features/owner-members';

import { ownerMembersQueryKey, type OwnerMember } from '@entities/owner-member';
import { getOwnerPet, isPetNotAuthorizedError, ownerPetQueryKey } from '@entities/owner-pet';
import { useUserStore } from '@entities/user';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

interface OwnerMembersListProps {
  members: OwnerMember[];
  emptyStateType: OwnerMembersEmptyStateType | null;
  isLoading: boolean;
  isError: boolean;
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

function OwnerMembersList({ members, emptyStateType, isLoading, isError }: OwnerMembersListProps) {
  const { push } = useStackNavigation();
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);

  if (isLoading) {
    return (
      <DelayedLoadingSpinner
        isLoading={isLoading}
        layout='content'
        className='min-h-0 w-full flex-1 pb-[calc(var(--bottom-bar-height)+88px)]'
      />
    );
  }

  if (isError) {
    return (
      <div className='flex min-h-0 w-full flex-1 items-center justify-center pb-[calc(var(--bottom-bar-height)+88px)]'>
        <div className='flex h-x14 w-full flex-col items-center justify-center gap-y-1 text-center'>
          <p className='h2-extrabold text-text-primary'>구성원 목록을 불러오지 못했어요</p>
          <p className='body1-regular text-text-secondary'>잠시 후 다시 시도해 주세요.</p>
        </div>
      </div>
    );
  }

  if (emptyStateType) return <OwnerMembersEmptyState emptyStateType={emptyStateType} />;

  return (
    <div className='min-h-0 w-full flex-1 overflow-y-auto pb-[calc(var(--bottom-bar-height)+88px)]'>
      {members.map((member) => (
        <OwnerMemberCard
          key={member.id}
          member={member}
          onClick={async () => {
            if (!member.petId) {
              toast({
                nativeTitle: '원생 프로필을 열 수 없어요',
                title: '원생 프로필을 열 수 없어요',
              });
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
              await push({
                pathname: route.owner.members.detail.root.replace('[id]', member.petId),
              });
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.warn('[OwnerMembersList] failed to open member profile', {
                  memberId: member.id,
                  petId: member.petId,
                  error,
                });
              }
              toast({
                nativeTitle: '원생 프로필을 열 수 없어요',
                title: '원생 프로필을 열 수 없어요',
              });
            }
          }}
        />
      ))}
    </div>
  );
}

export { OwnerMembersList };
