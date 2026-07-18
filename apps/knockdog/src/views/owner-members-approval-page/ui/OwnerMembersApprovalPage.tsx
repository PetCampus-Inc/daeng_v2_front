'use client';

import Image from 'next/image';

import { ActionButton } from '@knockdog/ui';
import { approvalEmptyContent } from '@views/owner-members-approval-page/config/ownerMembersApprovalEmptyContent';
import { Header } from '@widgets/Header';
import { OwnerMemberCard } from '@features/owner-members';
import { useOwnerRole } from '@features/role-conversion';

import { useOwnerMemberApprovalMutation, useOwnerPendingMembersQuery } from '@entities/owner-member';
import { useUserStore } from '@entities/user';
import { toast } from '@shared/ui/toast';

interface ApprovalActionsProps {
  dogName: string;
  requestId: string;
  disabled: boolean;
  onApprove: (requestId: string, dogName: string) => void;
  onReject: (requestId: string, dogName: string) => void;
}

function ApprovalActions({ dogName, requestId, disabled, onApprove, onReject }: ApprovalActionsProps) {
  return (
    <div className='gap-x2 flex shrink-0 items-center'>
      <ActionButton
        type='button'
        variant='secondaryLine'
        size='medium'
        className='w-[57px]'
        disabled={disabled}
        onClick={() => onReject(requestId, dogName)}
      >
        거절
      </ActionButton>
      <ActionButton
        type='button'
        variant='secondaryFill'
        size='medium'
        className='w-[57px]'
        disabled={disabled}
        onClick={() => onApprove(requestId, dogName)}
      >
        승인
      </ActionButton>
    </div>
  );
}

function ApprovalEmptyState() {
  return (
    <div className='flex min-h-full w-full items-center justify-center'>
      <div className='px-x4 flex w-full flex-col items-center justify-center gap-y-2 text-center'>
        <div className='relative h-[160px] w-[180px] opacity-100'>
          <Image
            src={approvalEmptyContent.imageSrc}
            alt={approvalEmptyContent.imageAlt}
            fill
            className='object-contain'
            sizes='200px'
          />
        </div>
        <div className='flex flex-col items-center gap-y-1'>
          <p className='h2-extrabold text-text-primary'>{approvalEmptyContent.title}</p>
          <p className='body1-regular text-text-secondary'>{approvalEmptyContent.description}</p>
        </div>
      </div>
    </div>
  );
}

function OwnerMembersApprovalPage() {
  const userId = useUserStore((state) => state.user?.userId);
  const { isOwner, isResolved } = useOwnerRole();
  const { approveMutation, rejectMutation } = useOwnerMemberApprovalMutation({ userId });
  const pendingMembersQuery = useOwnerPendingMembersQuery({
    userId,
    enabled: isResolved && isOwner,
  });
  const approvalRequests = pendingMembersQuery.data?.members ?? [];
  const totalPendingCount = pendingMembersQuery.data?.totalMemberCount ?? 0;
  const isActionPending = approveMutation.isPending || rejectMutation.isPending;
  const isInitialPending =
    !isResolved || pendingMembersQuery.isLoading || !pendingMembersQuery.isFetchedAfterMount;

  const handleReject = async (_requestId: string, dogName: string) => {
    await rejectMutation.mutateAsync(_requestId);
    toast({ title: `${dogName}의 연결 신청을 거절했어요` });
  };

  const handleApprove = async (_requestId: string, dogName: string) => {
    await approveMutation.mutateAsync(_requestId);
    toast({ title: `${dogName}의 연결 신청을 승인했어요` });
  };

  return (
    <div className='bg-bg-0 flex h-dvh flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>승인 대기 목록</Header.Title>
      </Header>

      <div className='px-x4 py-x2 flex h-x13 w-full shrink-0 items-center justify-between'>
        <div className='py-x2 flex h-x9 w-full items-center justify-between'>
          <div className='body2-bold text-text-primary gap-x1 flex h-x5 items-center whitespace-nowrap'>
            <span>승인대기</span>
            <span className='text-text-accent'>{totalPendingCount}건</span>
          </div>
        </div>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        {isInitialPending ? (
          <div className='min-h-full w-full' />
        ) : pendingMembersQuery.isError || approvalRequests.length === 0 ? (
          <ApprovalEmptyState />
        ) : (
          approvalRequests.map((member) => (
            <OwnerMemberCard
              key={member.id}
              member={member}
              rightAddon={
                <ApprovalActions
                  dogName={member.dogName}
                  requestId={member.id}
                  disabled={isActionPending}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

export { OwnerMembersApprovalPage };
