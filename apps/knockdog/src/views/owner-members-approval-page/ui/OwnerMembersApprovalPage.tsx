'use client';

import Image from 'next/image';

import { ActionButton } from '@knockdog/ui';
import { approvalEmptyContent } from '@views/owner-members-approval-page/config/ownerMembersApprovalEmptyContent';
import { Header } from '@widgets/Header';
import { OwnerMemberCard } from '@features/owner-members';
import { useOwnerRole } from '@features/role-conversion';

import {
  isAlreadyCancelledError,
  useOwnerMemberApprovalMutation,
  useOwnerPendingMembersQuery,
} from '@entities/owner-member';
import { useUserStore } from '@entities/user';
import { trackConnectionStatus } from '@shared/lib/analytics';
import { toast } from '@shared/ui/toast';

function showCancelledRequestToast() {
  toast({ title: '취소된 연결 신청이에요' });
}

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
    <div className='relative flex min-h-full w-full items-center justify-center'>
      <div className='px-x4 flex w-full flex-col items-center gap-y-1 text-center'>
        <p className='h2-extrabold text-text-primary'>{approvalEmptyContent.title}</p>
        <p className='body1-regular text-text-secondary'>{approvalEmptyContent.description}</p>
      </div>
      <div className='absolute top-[calc(50%-208px)] h-[160px] w-[180px]'>
        <Image
          src={approvalEmptyContent.imageSrc}
          alt={approvalEmptyContent.imageAlt}
          fill
          className='object-contain'
          sizes='180px'
        />
      </div>
    </div>
  );
}

function ApprovalErrorState() {
  return (
    <div className='flex min-h-full w-full items-center justify-center'>
      <div className='flex h-x14 w-full flex-col items-center justify-center gap-y-1 text-center'>
        <p className='h2-extrabold text-text-primary'>승인 대기 목록을 불러오지 못했어요</p>
        <p className='body1-regular text-text-secondary'>잠시 후 다시 시도해 주세요.</p>
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

  const handleReject = (_requestId: string, dogName: string) => {
    rejectMutation.mutate(_requestId, {
      onSuccess: () => {
        trackConnectionStatus({ status: 'reject', actor: 'owner' });
        toast({
          type: 'success',
          nativeTitle: `${dogName}의 연결 신청을 거절했어요`,
          titleParts: [{ text: dogName, accent: true }, { text: '의 연결 신청을 거절했어요' }],
          title: (
            <>
              <span className='text-text-accent'>{dogName}</span>
              <span className='text-text-primary-inverse'>의 연결 신청을 거절했어요</span>
            </>
          ),
        });
      },
      onError: (error) => {
        if (isAlreadyCancelledError(error)) {
          showCancelledRequestToast();
          return;
        }
        toast({ title: '연결 신청 거절에 실패했어요' });
      },
    });
  };

  const handleApprove = (_requestId: string, dogName: string) => {
    approveMutation.mutate(_requestId, {
      onSuccess: () => {
        trackConnectionStatus({ status: 'approve', actor: 'owner' });
        toast({
          type: 'success',
          nativeTitle: `${dogName}의 유치원 연결이 완료됐어요`,
          titleParts: [{ text: dogName, accent: true }, { text: '의 유치원 연결이 완료됐어요' }],
          title: (
            <>
              <span className='text-text-accent'>{dogName}</span>
              <span className='text-text-primary-inverse'>의 유치원 연결이 완료됐어요</span>
            </>
          ),
        });
      },
      onError: (error) => {
        if (isAlreadyCancelledError(error)) {
          showCancelledRequestToast();
          return;
        }
        toast({ title: '연결 신청 승인에 실패했어요' });
      },
    });
  };

  return (
    <div className='bg-bg-0 flex h-full flex-col'>
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

      <div className='min-h-0 flex-1 overflow-y-auto pb-(--safe-area-inset-bottom,0px)'>
        {isInitialPending ? (
          <div className='min-h-full w-full' />
        ) : pendingMembersQuery.isError ? (
          <ApprovalErrorState />
        ) : approvalRequests.length === 0 ? (
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
