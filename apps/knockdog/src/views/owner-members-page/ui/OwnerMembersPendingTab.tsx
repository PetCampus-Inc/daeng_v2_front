'use client';

import { useState } from 'react';

import {
  ApprovalActionButton,
  ListHeader,
  StudentTicketListItem,
  type SortOption,
} from '@knockdog/ui';
import { ownerMembersEmptyContent } from '@views/owner-members-page/config/ownerMembersEmptyContent';
import { hasListLoadFailed } from '@views/owner-members-page/lib/hasListLoadFailed';
import { useOwnerRole } from '@features/role-conversion';

import {
  isAlreadyCancelledError,
  useOwnerMemberApprovalMutation,
  useOwnerPendingMembersQuery,
  type OwnerMember,
  type OwnerPendingSort,
} from '@entities/owner-member';
import { useUserStore } from '@entities/user';
import { route } from '@shared/constants/route';
import { openConfirmDialog, useStackNavigation } from '@shared/lib/bridge';
import { trackConnectionStatus } from '@shared/lib/analytics';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';

import { OwnerMembersEmptyState } from './OwnerMembersEmptyState';

/** 승인 완료 확인창 문구. 앱 확인창과 웹 확인창이 같이 쓴다. */
const toApprovedDialog = (dogName: string) => ({
  title: '원생 승인을 완료했어요',
  description: `${dogName}의 유치원 연결이 완료됐어요.`,
  cancelLabel: '닫기',
  confirmLabel: '이용권 충전하기',
  buttonLayout: 'vertical' as const,
});

/** 승인 거절 확인창 문구. 앱 확인창과 웹 확인창이 같이 쓴다. */
const REJECT_DIALOG = {
  title: '원생 승인을 거절할까요?',
  description: '거절한 원생은 되돌릴 수 없어요.',
  cancelLabel: '닫기',
  confirmLabel: '거절하기',
};

const SORT_BY_OPTION: Record<SortOption, OwnerPendingSort> = {
  newest: 'LATEST',
  name: 'NAME',
  oldest: 'OLDEST',
};

interface ApprovalActionsProps {
  member: OwnerMember;
  disabled: boolean;
  onApprove: (member: OwnerMember) => void;
  onReject: (member: OwnerMember) => void;
}

function ApprovalActions({ member, disabled, onApprove, onReject }: ApprovalActionsProps) {
  return (
    <div data-testid='owner-members-pending-actions' className='gap-x1_5 flex shrink-0 items-center'>
      <ApprovalActionButton action='reject' className='w-[63px]' disabled={disabled} onClick={() => onReject(member)} />
      <ApprovalActionButton
        action='approve'
        className='w-[63px]'
        data-testid='owner-members-approve-button'
        disabled={disabled}
        onClick={() => onApprove(member)}
      />
    </div>
  );
}

/** 구성원 화면의 `신청` 탭 — 보호자 연결 신청 목록과 승인·거절 */
interface OwnerMembersPendingTabProps {
  /** 검색창에 입력한 검색어 */
  keyword: string;
}

function OwnerMembersPendingTab({ keyword }: OwnerMembersPendingTabProps) {
  const { push } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const { isOwner, isResolved } = useOwnerRole();
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [approvedMember, setApprovedMember] = useState<OwnerMember | null>(null);
  const [rejectTarget, setRejectTarget] = useState<OwnerMember | null>(null);
  const { approveMutation, rejectMutation } = useOwnerMemberApprovalMutation({ userId });
  const pendingMembersQuery = useOwnerPendingMembersQuery({
    userId,
    sort: SORT_BY_OPTION[sortOption],
    keyword,
    enabled: isResolved && isOwner,
  });
  const approvalRequests = pendingMembersQuery.data?.members ?? [];
  const totalPendingCount = pendingMembersQuery.data?.totalMemberCount ?? 0;
  const isActionPending = approveMutation.isPending || rejectMutation.isPending;
  const isLoadFailed = hasListLoadFailed(pendingMembersQuery);
  const isInitialPending =
    !isLoadFailed && (!isResolved || pendingMembersQuery.isLoading || !pendingMembersQuery.isFetchedAfterMount);

  /** 이미 취소·처리된 신청이면 안내하고, 아니면 실패 안내를 보여준다 */
  const showActionError = (error: unknown, failureTitle: string) => {
    toast({ title: isAlreadyCancelledError(error) ? '취소된 연결 신청이에요' : failureTitle });
  };

  const handleApprove = (member: OwnerMember) => {
    approveMutation.mutate(member.id, {
      onSuccess: () => {
        trackConnectionStatus({
          status: 'approve',
          initiated_by: 'owner',
          school_pet_membership_id: member.id,
        });
        void openApprovedDialog(member);
      },
      onError: (error) => showActionError(error, '연결 신청 승인에 실패했어요'),
    });
  };

  /** 승인 완료 확인창을 연다. 앱에서는 앱 확인창을 먼저 시도하고, 쓸 수 없으면 웹 확인창을 띄운다. */
  const openApprovedDialog = async (member: OwnerMember) => {
    const result = await openConfirmDialog(toApprovedDialog(member.dogName));
    if (result.status === 'pending') return;

    if (result.status === 'resolved') {
      if (result.action === 'confirm') handleOpenTicketCharge(member);
      return;
    }

    setApprovedMember(member);
  };

  /** 거절 확인창을 연다. 앱에서는 앱 확인창을 먼저 시도하고, 쓸 수 없으면 웹 확인창을 띄운다. */
  const handleRejectClick = async (member: OwnerMember) => {
    const result = await openConfirmDialog(REJECT_DIALOG);
    if (result.status === 'resolved') {
      if (result.action === 'confirm') rejectMember(member);
      return;
    }
    if (result.status === 'pending') return;

    setRejectTarget(member);
  };

  const handleConfirmReject = () => {
    if (!rejectTarget) return;
    const target = rejectTarget;

    setRejectTarget(null);
    rejectMember(target);
  };

  const rejectMember = (target: OwnerMember) => {
    rejectMutation.mutate(target.id, {
      onSuccess: () => {
        trackConnectionStatus({
          status: 'reject',
          initiated_by: 'owner',
          school_pet_membership_id: target.id,
        });
        toast({
          type: 'success',
          nativeTitle: '원생 거절이 완료되었어요',
          title: '원생 거절이 완료되었어요',
        });
      },
      onError: (error) => showActionError(error, '연결 신청 거절에 실패했어요'),
    });
  };

  const handleOpenTicketCharge = (member: OwnerMember) => {
    if (!member.petId) return;

    void push({
      pathname: route.owner.members.detail.ticketCharge.root.replace('[id]', member.petId),
    });
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {totalPendingCount > 0 && !isLoadFailed && (
        <ListHeader
          label='강아지수'
          count={totalPendingCount}
          sortProps={{ value: sortOption, onValueChange: setSortOption }}
        />
      )}

      <div className='min-h-0 flex-1 overflow-y-auto pb-(--safe-area-inset-bottom,0px)'>
        {isInitialPending ? (
          <DelayedLoadingSpinner isLoading={isInitialPending} layout='content' />
        ) : isLoadFailed ? (
          <PageError
            layout='inline'
            onRetry={() => void pendingMembersQuery.refetch()}
            isRetrying={pendingMembersQuery.isFetching}
          />
        ) : approvalRequests.length === 0 ? (
          <OwnerMembersEmptyState
            content={ownerMembersEmptyContent[keyword.length > 0 ? 'emptySearchResult' : 'emptyPending']}
          />
        ) : (
          approvalRequests.map((member) => (
            <StudentTicketListItem
              key={member.id}
              name={member.dogName}
              guardian={`${member.guardianName} 보호자`}
              sex={member.gender}
              avatarSrc={member.profileImageUrl}
              avatarAlt={`${member.dogName} 프로필 이미지`}
              status={null}
              action={
                <ApprovalActions
                  member={member}
                  disabled={isActionPending}
                  onApprove={handleApprove}
                  onReject={handleRejectClick}
                />
              }
            />
          ))
        )}
      </div>

      <ConfirmDialog
        {...toApprovedDialog(approvedMember?.dogName ?? '')}
        isOpen={approvedMember !== null}
        onClose={() => setApprovedMember(null)}
        onConfirm={() => {
          const member = approvedMember;
          setApprovedMember(null);
          if (member) handleOpenTicketCharge(member);
        }}
      />

      <ConfirmDialog
        {...REJECT_DIALOG}
        isOpen={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
}

export { OwnerMembersPendingTab };
