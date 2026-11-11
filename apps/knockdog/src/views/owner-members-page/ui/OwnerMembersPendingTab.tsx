'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@knockdog/ui/lib';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  ApprovalActionButton,
  ListHeader,
  StudentTicketListItem,
  type SortOption,
} from '@knockdog/ui';
import { approvalEmptyContent } from '@views/owner-members-page/config/ownerMembersApprovalEmptyContent';
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
import { useStackNavigation } from '@shared/lib/bridge';
import { trackConnectionStatus } from '@shared/lib/analytics';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';

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

function ApprovalEmptyState({ isSearchResult }: { isSearchResult: boolean }) {
  const content = isSearchResult ? ownerMembersEmptyContent.emptySearchResult : approvalEmptyContent;

  return (
    <div className='relative flex min-h-full w-full items-center justify-center'>
      <div className='px-x4 flex w-full flex-col items-center gap-y-1 text-center'>
        <p className='h2-extrabold text-text-primary'>{content.title}</p>
        <p className='body1-regular text-text-secondary'>{content.description}</p>
      </div>
      <div
        className={cn(
          'absolute',
          isSearchResult ? 'top-[calc(50%-208px)] h-[160px] w-[180px]' : 'top-[calc(50%-236px)] h-[200px] w-[237px]'
        )}
      >
        <Image
          src={content.imageSrc}
          alt={content.imageAlt}
          fill
          className='object-contain'
          sizes={isSearchResult ? '180px' : '237px'}
        />
      </div>
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
        setApprovedMember(member);
      },
      onError: (error) => showActionError(error, '연결 신청 승인에 실패했어요'),
    });
  };

  const handleConfirmReject = () => {
    if (!rejectTarget) return;
    const target = rejectTarget;

    setRejectTarget(null);
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

  const handleOpenTicketCharge = () => {
    if (!approvedMember?.petId) return;

    void push({
      pathname: route.owner.members.detail.ticketCharge.root.replace('[id]', approvedMember.petId),
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
          <ApprovalEmptyState isSearchResult={keyword.length > 0} />
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
                  onReject={setRejectTarget}
                />
              }
            />
          ))
        )}
      </div>

      <AlertDialog open={approvedMember !== null} onOpenChange={(open) => !open && setApprovedMember(null)}>
        <AlertDialogContent data-testid='owner-members-approved-dialog'>
          <AlertDialogHeader>
            <AlertDialogTitle>원생 승인을 완료했어요</AlertDialogTitle>
            <AlertDialogDescription>
              {`${approvedMember?.dogName ?? ''}의 유치원 연결이 완료됐어요.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='flex-col'>
            <AlertDialogCancel className='w-full'>닫기</AlertDialogCancel>
            <AlertDialogAction
              className='w-full'
              data-testid='owner-members-approved-charge'
              onClick={handleOpenTicketCharge}
            >
              이용권 충전하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectTarget !== null} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>원생 승인을 거절할까요?</AlertDialogTitle>
            <AlertDialogDescription>거절한 원생은 되돌릴 수 없어요.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReject}>거절하기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { OwnerMembersPendingTab };
