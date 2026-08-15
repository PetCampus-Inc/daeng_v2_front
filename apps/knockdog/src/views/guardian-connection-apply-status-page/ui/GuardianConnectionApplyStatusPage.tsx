'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { PageError } from '@shared/ui/page-error';
import {
  GUARDIAN_CONNECTION_APPLY_STATUS,
  type GuardianConnectionApplyItem,
} from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatus';
import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';
import {
  isApplyStatusEmptyMock,
  isApplyStatusErrorMock,
  isApplyStatusListMock,
  MOCK_CONNECTION_APPLY_ITEMS,
} from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusMock';
import { GuardianConnectionApplyStatusEmpty } from '@views/guardian-connection-apply-status-page/ui/GuardianConnectionApplyStatusEmpty';
import { GuardianConnectionApplyStatusList } from '@views/guardian-connection-apply-status-page/ui/GuardianConnectionApplyStatusList';
import { Header } from '@widgets/Header';

function sortByAppliedAtDesc(items: GuardianConnectionApplyItem[]) {
  return [...items].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
}

function GuardianConnectionApplyStatusPage() {
  const content = guardianConnectionApplyStatusContent;
  const searchParams = useSearchParams();
  const mockQuery = searchParams.get('mock');

  const isLoadError = isApplyStatusErrorMock(mockQuery);
  const isEmpty = isApplyStatusEmptyMock(mockQuery);
  const isList = isApplyStatusListMock(mockQuery);

  const [items, setItems] = useState(() => sortByAppliedAtDesc(MOCK_CONNECTION_APPLY_ITEMS));

  const visibleItems = useMemo(() => (isList ? items : []), [isList, items]);

  const handleCancel = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (!target || target.status !== GUARDIAN_CONNECTION_APPLY_STATUS.PENDING) return prev;

      // TODO: 신청 취소 API + 원장 알림 전송
      // title: 보호자가 등록 신청을 취소했어요
      // body: `${petName}가 승인 대기 목록에서 제외됐어요.`
      // 알림 탭 → 구성원 탭 이동

      return prev.map((item) =>
        item.id === id ? { ...item, status: GUARDIAN_CONNECTION_APPLY_STATUS.CANCELLED } : item
      );
    });
  };

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-0 shrink-0'>
        <Header>
          <Header.BackButton />
          <Header.Title>{content.pageTitle}</Header.Title>
        </Header>
      </div>

      {isLoadError ? (
        <PageError layout='inline' className='bg-bg-50' />
      ) : isEmpty || visibleItems.length === 0 ? (
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <GuardianConnectionApplyStatusEmpty />
        </div>
      ) : (
        <div className='min-h-0 flex-1 overflow-y-auto pb-(--safe-area-inset-bottom,0px)'>
          <GuardianConnectionApplyStatusList items={visibleItems} onCancel={handleCancel} />
        </div>
      )}
    </div>
  );
}

export { GuardianConnectionApplyStatusPage };
