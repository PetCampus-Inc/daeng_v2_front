'use client';

import { useSearchParams } from 'next/navigation';

import { PageError } from '@shared/ui/page-error';
import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';
import { isApplyStatusErrorMock } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusMock';
import { GuardianConnectionApplyStatusEmpty } from '@views/guardian-connection-apply-status-page/ui/GuardianConnectionApplyStatusEmpty';
import { Header } from '@widgets/Header';

function GuardianConnectionApplyStatusPage() {
  const content = guardianConnectionApplyStatusContent;
  const searchParams = useSearchParams();
  const isLoadError = isApplyStatusErrorMock(searchParams.get('mock'));

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
      ) : (
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <GuardianConnectionApplyStatusEmpty />
        </div>
      )}
    </div>
  );
}

export { GuardianConnectionApplyStatusPage };
