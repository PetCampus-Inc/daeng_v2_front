'use client';

import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';
import { GuardianConnectionApplyStatusEmpty } from '@views/guardian-connection-apply-status-page/ui/GuardianConnectionApplyStatusEmpty';
import { Header } from '@widgets/Header';

function GuardianConnectionApplyStatusPage() {
  const content = guardianConnectionApplyStatusContent;

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-0 shrink-0'>
        <Header>
          <Header.BackButton />
          <Header.Title>{content.pageTitle}</Header.Title>
        </Header>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        <GuardianConnectionApplyStatusEmpty />
      </div>
    </div>
  );
}

export { GuardianConnectionApplyStatusPage };
