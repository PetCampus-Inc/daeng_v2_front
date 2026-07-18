'use client';

import { useState } from 'react';

import { ActionButton } from '@knockdog/ui';
import { mockApprovalRequests } from '@views/owner-members-approval-page/config/ownerMembersApprovalContent';
import { Header } from '@widgets/Header';

import { OwnerMemberCard } from '@features/owner-members';
import { toast } from '@shared/ui/toast';

interface ApprovalActionsProps {
  dogName: string;
  requestId: string;
  onApprove: (requestId: string, dogName: string) => void;
  onReject: (requestId: string, dogName: string) => void;
}

function ApprovalActions({ dogName, requestId, onApprove, onReject }: ApprovalActionsProps) {
  return (
    <div className='gap-x2 flex shrink-0 items-center'>
      <ActionButton
        type='button'
        variant='secondaryLine'
        size='medium'
        className='w-[57px]'
        onClick={() => onReject(requestId, dogName)}
      >
        거절
      </ActionButton>
      <ActionButton
        type='button'
        variant='secondaryFill'
        size='medium'
        className='w-[57px]'
        onClick={() => onApprove(requestId, dogName)}
      >
        승인
      </ActionButton>
    </div>
  );
}

function OwnerMembersApprovalPage() {
  const [approvalRequests, setApprovalRequests] = useState(mockApprovalRequests);

  const removeApprovalRequest = (requestId: string) => {
    setApprovalRequests((requests) => requests.filter((request) => request.id !== requestId));
  };

  const handleReject = (requestId: string, dogName: string) => {
    // TODO: API 연동 시 거절 mutation 성공 후 승인 대기 목록 refetch
    removeApprovalRequest(requestId);
    toast({ title: `${dogName}의 연결 신청을 거절했어요` });
  };

  const handleApprove = (requestId: string, dogName: string) => {
    // TODO: API 연동 시 승인 mutation 성공 후 승인 대기 목록 refetch 및 전체 원생 목록 invalidate
    removeApprovalRequest(requestId);
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
            <span className='text-text-accent'>{approvalRequests.length}건</span>
          </div>
        </div>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        {approvalRequests.map((member) => (
          <OwnerMemberCard
            key={member.id}
            member={member}
            rightAddon={
              <ApprovalActions
                dogName={member.dogName}
                requestId={member.id}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            }
          />
        ))}
      </div>
    </div>
  );
}

export { OwnerMembersApprovalPage };
